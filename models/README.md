# Modelos y Pesos Entrenados (`models/`)

Este directorio contiene los pesos de los modelos de visión artificial entrenados para la detección y clasificación del estado de madurez de frutillas en el marco del Trabajo Final de Grado (FIUNA 2026).

---

## 1. Variantes de Modelos

| Modelo | Arquitectura | Dataset de Entrenamiento | Tamaño Archivo | Épocas Reales | mAP50 (Val) | mAP50-95 (Val) | Archivo en Repositorio |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Modelo 1** | YOLO11s (`yolo11s.pt`) | `frutilla_v3` (v8) — Solo datos propios | ~19.2 MB | 38 (Early Stop) | **0.855** | **0.552** | `best_YOLO11s.pt` |
| **Modelo 2** | YOLO11n (`yolo11n.pt`) | `frutilla_v4` (v1) — Propios + externos | ~5.5 MB | 61 (Early Stop) | **0.914** | **0.782** | `best_YOLO11n.pt` |

---

## 2. Descripción de Pesos

### `best_YOLO11s.pt` (Modelo 1)
- **Base**: Ultralytics YOLO11 Small (`yolo11s.pt`).
- **Parámetros**: 9,413,961 (21.4 GFLOPs).
- **Entrenamiento**: 100 épocas programadas, detención temprana en época 38 (mejor resultado en época 18).
- **Optimizador**: AdamW (`lr0=0.001`, `weight_decay=0.0005`, `batch=16`, `imgsz=640`).
- **Hardware**: GPU NVIDIA Tesla T4 (Google Colab).

### `best_YOLO11n.pt` (Modelo 2)
- **Base**: Ultralytics YOLO11 Nano (`yolo11n.pt`).
- **Parámetros**: 2,597,537 (6.4 GFLOPs).
- **Entrenamiento**: 100 épocas programadas, detención temprana en época 61 (mejor resultado en época 41).
- **Optimizador**: AdamW (`lr0=0.001`, `weight_decay=0.0005`, `batch=16`, `imgsz=640`).
- **Hardware**: GPU NVIDIA Tesla T4 (Google Colab).

---

## 3. Instrucciones de Carga e Inferencia

En cualquier entorno Python con `ultralytics` instalado:

```python
from ultralytics import YOLO

# Cargar Modelo 1 (YOLO11s)
modelo1 = YOLO("models/best_YOLO11s.pt")
print("Clases Modelo 1:", modelo1.names)

# Cargar Modelo 2 (YOLO11n)
modelo2 = YOLO("models/best_YOLO11n.pt")
print("Clases Modelo 2:", modelo2.names)

# Inferencia sobre imagen de prueba
results = modelo1.predict(source="data/modelo1/test/images/ejemplo.jpg", conf=0.25, imgsz=640)
results[0].show()
```

> **Nota sobre tamaños en Git**: Ambos pesos (`best_YOLO11s.pt` ~19.2 MB y `best_YOLO11n.pt` ~5.5 MB) se conservan directamente en el repositorio por encontrarse dentro del límite estándar de GitHub (<100 MB). Se incluyen también sus archivos `.zip` como respaldo.
