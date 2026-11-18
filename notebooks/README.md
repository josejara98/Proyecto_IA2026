# Cuadernos Jupyter (`notebooks/`)

Este directorio contiene los cuadernos organizados secuencialmente para la ejecución, reproducción y análisis de los modelos de visión artificial y del clasificador auxiliar de madurez de frutillas.

---

## 1. Orden de Ejecución

Los cuadernos deben ejecutarse en el siguiente orden lógico:

1. **`01_preprocesamiento.ipynb`**:
   - Auditoría e integridad de los datasets (verificación de correspondencia 1:1, coordenadas de cajas, consistencia de clases).
   - Análisis de fuga de datos (data leakage) en secuencias de video.
   - Recorte de frutos (ROI) y extracción fundamentada de las tres características morfo-cromáticas HSV (`red_ratio`, `green_ratio`, `mean_saturation`).
   - Generación de los datasets tabulares: `data/features_train.csv` y `data/features_val.csv`.

2. **`02_entrenamiento.ipynb`**:
   - Entrenamiento del modelo base de clasificación auxiliar (Regresión Logística multiclase Softmax sobre recortes HSV).
   - Reporte de exactitud, precisión, recall y F1 por clase y macro en validación.
   - Formulación reproducible del código de entrenamiento para **Modelo 1** (YOLO11s) y **Modelo 2** (YOLO11n).
   - Carga y evaluación de los pesos entrenados (`models/best_YOLO11s.pt` y `models/best_YOLO11n.pt`).
   - Consolidación de métricas de detección y clasificación en `results/metricas.csv`.

3. **`03_optimizacion.ipynb`**:
   - Búsqueda en cuadrícula (**Grid Search**) sobre la Regresión Logística evaluando $C \in [0.01, 0.1, 1, 10]$ y `class_weight` $\in [\text{None}, \text{"balanced"}]$.
   - Selección del mejor modelo según **F1 Macro** sobre validación (demostrando el rescate de la clase minoritaria `semi-maduro`).
   - Comparativa contra el modelo base y persistencia en `results/optimizacion.csv`.
   - Implementación de la rutina de optimización de hiperparámetros para YOLO mediante Optuna / Ultralytics Tune.

4. **`04_visualizacion.ipynb`**:
   - Inferencia visual sobre imágenes de prueba con cajas delimitadoras, clases y niveles de confianza.
   - Curvas reales de convergencia de entrenamiento y validación por época a partir de los registros históricos (`training_log_yolo11s.csv` y `training_log_yolo11n.csv`).
   - Matrices de confusión absolutas y normalizadas con explicación de los criterios de evaluación (IoU $\ge 0.5$, falsos positivos y omisiones).
   - Histogramas de error de conteo por imagen ($e = \text{predicho} - \text{anotado}$).
   - Discusión comparativa integral: Modelo 1 vs. Modelo 2.

---

## 2. Cuadernos Originales de Google Colab (`originales/`)

Se preservan en `notebooks/originales/` las ejecuciones originales completas en Google Colab:
- **`modelo_1_datos_propios.ipynb`**: Sesión original de entrenamiento de YOLO11s con GPU Tesla T4.
- **`modelo_2_datos_externos.ipynb`**: Sesión original de entrenamiento de YOLO11n y seguimiento en video con ByteTrack.

> **Seguridad y Privacidad**: Todas las credenciales privadas y API Keys de Roboflow han sido retiradas de las celdas de código, salidas y metadatos antes de su publicación en el repositorio.
