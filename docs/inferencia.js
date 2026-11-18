const size = 640;
const confidenceThreshold = 0.25;
const overlapThreshold = 0.70;
const labels = ['Maduro', 'No maduro', 'Semimaduro'];
const colors = ['#b52d43', '#19744d', '#8b5107'];
const runtimeBase = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/';
const partCount = 13;

const fileInput = document.querySelector('#analysis-file');
const form = document.querySelector('#analysis-form');
const button = document.querySelector('#analysis-submit');
const status = document.querySelector('#analysis-status');
const canvas = document.querySelector('#analysis-canvas');
const results = document.querySelector('#analysis-results');
const counts = document.querySelector('#analysis-counts');
const rows = document.querySelector('#analysis-rows');
const percent = new Intl.NumberFormat('es-PY', {style: 'percent', maximumFractionDigits: 1});
let engine;

async function loadModel() {
  const ort = await import(runtimeBase + 'ort.wasm.min.mjs');
  ort.env.wasm.wasmPaths = runtimeBase;
  ort.env.wasm.numThreads = 1;
  const parts = await Promise.all(Array.from({length: partCount}, async (_, index) => {
    const response = await fetch(`assets/modelo2-${index}.gzpart`);
    if (!response.ok) throw new Error('No se pudo descargar el modelo.');
    return response.arrayBuffer();
  }));
  const compressed = new Blob(parts);
  const buffer = await new Response(
    compressed.stream().pipeThrough(new DecompressionStream('gzip'))
  ).arrayBuffer();
  const session = await ort.InferenceSession.create(buffer, {executionProviders: ['wasm']});
  return {ort, session};
}

function preprocess(image, ort) {
  const input = document.createElement('canvas');
  input.width = input.height = size;
  const context = input.getContext('2d', {willReadFrequently: true});
  const scale = Math.min(size / image.width, size / image.height);
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);
  const left = Math.round((size - width) / 2 - 0.1);
  const top = Math.round((size - height) / 2 - 0.1);
  context.fillStyle = '#727272';
  context.fillRect(0, 0, size, size);
  context.drawImage(image, left, top, width, height);
  const rgba = context.getImageData(0, 0, size, size).data;
  const plane = size * size;
  const data = new Float32Array(plane * 3);
  for (let pixel = 0; pixel < plane; pixel++) {
    data[pixel] = rgba[pixel * 4] / 255;
    data[plane + pixel] = rgba[pixel * 4 + 1] / 255;
    data[2 * plane + pixel] = rgba[pixel * 4 + 2] / 255;
  }
  return {tensor: new ort.Tensor('float32', data, [1, 3, size, size]), scale, left, top};
}

function iou(a, b) {
  const intersection = Math.max(0, Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1))
    * Math.max(0, Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1));
  return intersection / ((a.x2-a.x1)*(a.y2-a.y1) + (b.x2-b.x1)*(b.y2-b.y1) - intersection);
}

function detectionsFrom(output, transform, image) {
  const [batch, channels, anchors] = output.dims;
  if (batch !== 1 || channels !== 4 + labels.length) throw new Error('Formato de detección inesperado.');
  const data = output.data;
  const candidates = [];
  for (let index = 0; index < anchors; index++) {
    let category = 0;
    let confidence = data[4 * anchors + index];
    for (let label = 1; label < labels.length; label++) {
      const score = data[(4 + label) * anchors + index];
      if (score > confidence) { category = label; confidence = score; }
    }
    if (confidence <= confidenceThreshold) continue;
    const x = data[index], y = data[anchors + index];
    const halfWidth = data[2 * anchors + index] / 2;
    const halfHeight = data[3 * anchors + index] / 2;
    candidates.push({category, confidence, x1:x-halfWidth, y1:y-halfHeight, x2:x+halfWidth, y2:y+halfHeight});
  }
  candidates.sort((a,b) => b.confidence - a.confidence);
  const selected = [];
  for (const candidate of candidates) {
    if (selected.some(box => box.category === candidate.category && iou(candidate, box) > overlapThreshold)) continue;
    selected.push(candidate);
    if (selected.length === 300) break;
  }
  const clip = (value, limit) => Math.max(0, Math.min(limit, value));
  return selected.map(box => ({
    category: box.category, confidence: box.confidence,
    x1: clip((box.x1 - transform.left) / transform.scale, image.width),
    x2: clip((box.x2 - transform.left) / transform.scale, image.width),
    y1: clip((box.y1 - transform.top) / transform.scale, image.height),
    y2: clip((box.y2 - transform.top) / transform.scale, image.height)
  })).filter(box => box.x2 > box.x1 && box.y2 > box.y1);
}

function showResults(image, detections) {
  const scale = Math.min(1, 1200 / Math.max(image.width,image.height));
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  context.lineWidth = Math.max(2, canvas.width / 420);
  const fontSize = Math.max(13, Math.round(canvas.width / 70));
  context.font = `bold ${fontSize}px system-ui`;
  context.textBaseline = 'top';
  const totals = [0, 0, 0];
  const newRows = detections.map((box, index) => {
    totals[box.category]++;
    const x = box.x1 * scale;
    const y = box.y1 * scale;
    const title = String(index + 1);
    const color = colors[box.category];
    context.strokeStyle = color;
    context.strokeRect(x, y, (box.x2-box.x1)*scale, (box.y2-box.y1)*scale);
    const labelY = Math.max(0, y - fontSize - 6);
    const labelWidth = context.measureText(title).width + 10;
    const labelX = Math.max(0, Math.min(x, canvas.width-labelWidth));
    context.fillStyle = color;
    context.fillRect(labelX, labelY, labelWidth, fontSize + 6);
    context.fillStyle = '#fff';
    context.fillText(title, labelX + 5, labelY + 3);
    const row = document.createElement('tr');
    for (const value of [title, labels[box.category], percent.format(box.confidence)]) {
      row.insertCell().textContent = value;
    }
    return row;
  });
  rows.replaceChildren(...newRows);
  counts.replaceChildren(...labels.map((label, index) => {
    const pair = document.createElement('div');
    const name = document.createElement('dt');
    const value = document.createElement('dd');
    name.textContent = label;
    value.textContent = totals[index];
    pair.append(name, value);
    return pair;
  }));
  canvas.hidden = false;
  results.hidden = detections.length === 0;
  status.textContent = detections.length
    ? `Detecciones en la imagen: ${detections.length}.`
    : 'El modelo no encontró frutillas con el umbral de confianza seleccionado.';
}

fileInput.addEventListener('change', () => {
  canvas.hidden = results.hidden = true;
  status.textContent = '';
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  const file = fileInput.files[0];
  if (!file || button.disabled) return;
  button.disabled = fileInput.disabled = true;
  canvas.hidden = results.hidden = true;
  let image;
  try {
    status.textContent = 'Preparando la imagen…';
    try {
      image = await createImageBitmap(file);
    } catch {
      status.textContent = 'No se pudo abrir la imagen. Seleccione un archivo JPG, PNG o WebP válido.';
      return;
    }
    if (!engine) {
      status.textContent = 'Cargando el modelo…';
      engine = await loadModel();
    }
    status.textContent = 'Ejecutando la detección…';
    const transform = preprocess(image, engine.ort);
    const output = await engine.session.run({[engine.session.inputNames[0]]: transform.tensor});
    showResults(image, detectionsFrom(output[engine.session.outputNames[0]], transform, image));
  } catch (error) {
    console.error(error);
    status.textContent = 'No se pudo ejecutar el modelo. Verifique la conexión y vuelva a intentarlo.';
  } finally {
    image?.close();
    button.disabled = fileInput.disabled = false;
  }
});
