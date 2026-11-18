# Resultados y Métricas (`results/`)

Este directorio consolida los registros, métricas y visualizaciones del rendimiento de los modelos desarrollados en el proyecto.

---

## 1. Archivos Disponibles

- **`metricas.csv`**: Comparativa completa y detallada de métricas para:
  - Detectores YOLO (YOLO11s y YOLO11n): Precision, Recall, F1, mAP50, mAP50-95 globales y por clase sobre la partición de validación.
  - Clasificador Auxiliar de Madurez (Regresión Logística sobre recortes HSV): Modelo base vs. modelo optimizado por clase y macro.
- **`optimizacion.csv`**: Tabla de resultados del Grid Search sobre la regresión logística ($C \in \{0.01, 0.1, 1, 10\}$, `class_weight` $\in \{\text{None}, \text{balanced}\}$), evaluando exactitud, precisión macro, recall macro y F1 macro.
- **`training_log_yolo11s.csv`**: Registro completo de las 38 épocas de entrenamiento de YOLO11s (pérdidas de caja, clase y DFL; métricas de validación por época).
- **`training_log_yolo11n.csv`**: Registro completo de las 61 épocas de entrenamiento de YOLO11n (pérdidas y métricas de validación por época).
- **`plots/`**: Curvas de convergencia y matrices de confusión reales exportadas desde las corridas de Ultralytics:
  - `plots/modelo1/`: Curvas PR, F1, P, R, `results.png`, matrices de confusión estándar y normalizada para YOLO11s (datos propios).
  - `plots/modelo2/`: Curvas PR, F1, P, R, `results.png`, matrices de confusión estándar y normalizada para YOLO11n (propios + externos).

---

## 2. Resumen Comparativo de Detectores

| Métrica | Modelo 1 (YOLO11s — Datos Propios) | Modelo 2 (YOLO11n — Propios + Externos) |
| :--- | :---: | :---: |
| **Dataset** | `frutilla_v3` v8 (1,758 imgs) | `frutilla_v4` v1 (7,927 imgs) |
| **Épocas completadas** | 38 (Patience=20, Mejor en Ep. 18) | 61 (Patience=20, Mejor en Ep. 41) |
| **Precision (Val All)** | 0.8030 | **0.8730** |
| **Recall (Val All)** | 0.7980 | **0.8700** |
| **mAP50 (Val All)** | 0.8550 | **0.9140** |
| **mAP50-95 (Val All)** | 0.5520 | **0.7820** |
| **mAP50 Maduro** | 0.8800 | **0.9060** |
| **mAP50 No-maduro** | 0.8690 | **0.9270** |
| **mAP50 Semi-maduro** | 0.8170 | **0.9100** |
| **GFLOPs / Parámetros** | 21.4 GFLOPs / 9.41 M | **6.4 GFLOPs / 2.60 M** |

> **Observación académica**: El Modelo 2 alcanza métricas superiores tanto en mAP50 (+5.9%) como en mAP50-95 (+23.0%) a pesar de contar con una arquitectura más liviana (Nano vs Small). Esto evidencia el impacto positivo de la diversidad visual provista por los datos externos. No obstante, dado que los conjuntos de validación de ambas corridas difieren (215 vs 1,042 imágenes), se recomienda evaluar ambos detectores sobre el conjunto de prueba independiente común para aislar el factor de la arquitectura.
