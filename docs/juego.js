'use strict';

const classes = ['Maduro', 'No maduro', 'Semimaduro'];
const elements = Object.fromEntries(
  ['scene', 'fruit', 'target', 'round', 'choices', 'feedback', 'score', 'next', 'game-question', 'game-summary',
    'game-summary-title', 'game-player-total', 'game-model-total', 'game-restart']
    .map(id => [id, document.getElementById(id)])
);
const confidenceFormat = new Intl.NumberFormat('es-PY', {
  style: 'percent',
  maximumFractionDigits: 1
});
let order;
let current;
let playerScore;
let modelScore;
let answered;

function reset() {
  order = [...rondas];
  for (let index = order.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [order[index], order[other]] = [order[other], order[index]];
  }
  elements['game-summary'].hidden = true;
  elements['game-question'].hidden = false;
  elements.choices.hidden = false;
  elements.score.hidden = false;
  current = 0;
  playerScore = 0;
  modelScore = 0;
}

function showRound() {
  const round = order[current];
  const [left, top, right, bottom] = round.box;
  Object.assign(elements.target.style, {
    left: left * 100 + '%',
    top: top * 100 + '%',
    width: (right - left) * 100 + '%',
    height: (bottom - top) * 100 + '%'
  });
  elements.fruit.src = 'assets/' + round.image;
  elements.round.textContent = 'Ronda ' + (current + 1) + ' de ' + order.length;
  elements.feedback.textContent = '';
  elements.next.hidden = true;
  answered = false;
  elements.choices.replaceChildren(...classes.map((label, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => answer(round, index, button));
    return button;
  }));
  updateScore(current);
}

function updateScore(count) {
  elements.score.textContent = 'Aciertos del participante ' + playerScore + '/' + count
    + ' · Aciertos del modelo ' + modelScore + '/' + count;
}

function answer(round, choice, selected) {
  if (answered) return;
  answered = true;
  selected.setAttribute('aria-pressed', 'true');
  for (const button of elements.choices.children) button.disabled = true;
  playerScore += Number(choice === round.reference);
  modelScore += Number(round.prediction === round.reference);
  const prediction = round.prediction === null
    ? 'Sin detección correspondiente'
    : classes[round.prediction] + ' · ' + confidenceFormat.format(round.confidence) + ' de confianza';
  const details = document.createElement('p');
  details.append(
    'Respuesta seleccionada: ' + classes[choice], document.createElement('br'),
    'Anotación: ' + classes[round.reference], document.createElement('br'),
    'Modelo: ' + prediction
  );
  elements.feedback.replaceChildren(details);
  updateScore(current + 1);
  if (current === order.length - 1) {
    elements.round.textContent = 'Comparación finalizada';
    elements['game-question'].hidden = elements.choices.hidden = elements.score.hidden = true;
    elements['game-player-total'].textContent = playerScore + '/' + order.length;
    elements['game-model-total'].textContent = modelScore + '/' + order.length;
    elements['game-summary'].hidden = false;
    elements['game-summary-title'].focus();
    return;
  }
  elements.next.hidden = false;
  elements.next.focus();
}

elements.next.addEventListener('click', () => {
  current++;
  showRound();
  elements.choices.firstElementChild.focus();
});

elements['game-restart'].addEventListener('click', () => {
  reset();
  showRound();
  elements.choices.firstElementChild.focus();
});

reset();
showRound();
