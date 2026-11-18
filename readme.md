# Desarrollo y evaluación de un sistema de visión artificial para la detección de frutillas y la clasificación de sus estados de madurez

**Asignatura**: Inteligencia Artificial 2026  
**Carrera**: Ingeniería Mecatrónica, 10.º semestre  
**Institución**: Facultad de Ingeniería, Universidad Nacional de Asunción (FIUNA)  

### Integrantes
- **Jose Fernando Jaran Acosta** — `josejara@fiuna.edu.py`
- **Larissa Maria Belen Ruiz Almiron** — `laruizal@fiuna.edu.py`

---

## 1. Descripción y Objetivo del Proyecto

El proyecto tiene como objetivo el diseño, entrenamiento, optimización y evaluación de un sistema de visión artificial capaz de **detectar frutillas en imágenes tomadas desde la perspectiva visual de un robot móvil agrícola** y clasificar con precisión su estado de madurez para tareas de monitoreo de cultivo y cosecha automatizada.

El sistema discrimina tres estados de madurez estandarizados:
1. **`maduro`** (Clase `0`): Fruto con coloración roja predominante (>75%), óptimo para recolección.
2. **`no-maduro`** (Clase `1`): Fruto en fase inicial verde o blanca, con alta concentración de clorofila.
3. **`semi-maduro`** (Clase `2`): Fruto en etapa de transición o viraje de color (tonos rosados/blancos con verde residual).

---

## 2. Variantes de Modelos Evaluadas

El repositorio documenta y compara dos variantes de detectores neuronales más un clasificador auxiliar de referencia:

| Componente | Arquitectura / Algoritmo | Conjunto de Datos | Entradas | Propósito Principal |
| :--- | :--- | :--- | :--- | :--- |
| **Modelo 1** | **YOLO11s** (`yolo11s.pt`) | `frutilla_v3` (v8) — 1,758 imágenes | Imágenes RGB $640 \times 640$ | Detector base entrenado exclusivamente con imágenes propias capturadas en parcelas locales. |
| **Modelo 2** | **YOLO11n** (`yolo11n.pt`) | `frutilla_v4` (v1) — 7,927 imágenes | Imágenes RGB $640 \times 640$ | Detector liviano entrenado con datos propios enriquecidos con fuentes externas abiertas. |
| **Clasificador Auxiliar** | **Regresión Logística Multiclase** | Recortes anotados de `frutilla_v3` | 3 características HSV | Modelo base de referencia para clasificación tabular sobre recortes morfo-cromáticos. |

---

## 3. Características de Entrada Generadas a partir de Datos Crudos

Para cumplir con el requerimiento académico de ingeniería de características, se implementó en `notebooks/01_preprocesamiento.ipynb` un extractor que procesa los píxeles crudos de cada fruto recortado en el espacio de color HSV:

1. **`red_ratio` (Proporción de píxeles rojos)**:
   - Cuantifica los píxeles con $H \in [0^\circ, 20^\circ] \cup [330^\circ, 360^\circ]$, $S \ge 0.25$, $V \ge 0.20$.
   - **Utilidad**: Identifica de forma directa la presencia de antocianinas y madurez comercial.
2. **`green_ratio` (Proporción de píxeles verdes)**:
   - Cuantifica los píxeles con $H \in [70^\circ, 165^\circ]$, $S \ge 0.20$, $V \ge 0.20$.
   - **Utilidad**: Mide la presencia de clorofila activa característica de frutos inmaduros.
3. **`mean_saturation` (Saturación media normalizada)**:
   - Media del canal $S \in [0.0, 1.0]$ en el área del recorte.
   - **Utilidad**: Refleja la intensidad cromática y pureza del pigmento del fruto frente al fondo.

---

## 4. Estructura del Repositorio

```text
Proyecto_IA2026/
├── data/
│   ├── README.md               # Documentación exhaustiva, conteos de particiones y licencias
│   ├── modelo1/                # Configuración data.yaml, licencias y partición de prueba (test)
│   ├── modelo2/                # Configuración data.yaml y licencias de frutilla_v4
│   ├── features_train.csv      # 1,877 recortes anotados con características HSV (Train)
│   └── features_val.csv        # 922 recortes anotados con características HSV (Valid)
├── models/
│   ├── README.md               # Especificaciones de los pesos, parámetros y carga
│   ├── best_YOLO11s.pt         # Pesos óptimos del Modelo 1 (19.2 MB)
│   └── best_YOLO11n.pt         # Pesos óptimos del Modelo 2 (5.5 MB)
├── notebooks/
│   ├── README.md               # Guía y orden de ejecución de cuadernos
│   ├── 01_preprocesamiento.ipynb  # Auditoría de datos, recortes y extracción de características HSV
│   ├── 02_entrenamiento.ipynb     # Regresión logística base y entrenamiento reproducible de YOLO
│   ├── 03_optimizacion.ipynb      # Grid Search sobre clasificador y búsqueda de hiperparámetros
│   ├── 04_visualizacion.ipynb     # Predicciones, curvas de convergencia reales y matrices de confusión
│   └── originales/             # Cuadernos completos originales de Google Colab (sanitizados)
│       ├── modelo_1_datos_propios.ipynb
│       └── modelo_2_datos_externos.ipynb
├── results/
│   ├── README.md               # Descripción de métricas y análisis de desempeño
│   ├── metricas.csv            # Tabla integral de métricas (Detección YOLO vs Clasificación HSV)
│   ├── optimizacion.csv        # Resultados del Grid Search por combinación de hiperparámetros
│   ├── training_log_yolo11s.csv# Registro época por época de YOLO11s (38 épocas)
│   ├── training_log_yolo11n.csv# Registro época por época de YOLO11n (61 épocas)
│   └── plots/                  # Gráficos reales de convergencia y matrices de confusión
│       ├── modelo1/            # results.png, confusion_matrix.png, BoxPR_curve.png, etc.
│       └── modelo2/            # results.png, confusion_matrix.png, BoxPR_curve.png, etc.
├── requirements.txt            # Dependencias del proyecto
├── .gitignore                  # Filtro de archivos pesados, cachés y temporales
└── README.md                   # Documento principal del repositorio
```

---

## 5. Orden de Ejecución de los Cuadernos

Para reproducir el flujo de trabajo completo:

1. **`notebooks/01_preprocesamiento.ipynb`**:
   - Audita imágenes y etiquetas (0 cajas inválidas, 0 etiquetas faltantes).
   - Extrae las características cromáticas HSV sobre recortes y genera los CSVs tabulares.
2. **`notebooks/02_entrenamiento.ipynb`**:
   - Ajusta el modelo base de Regresión Logística y documenta el entrenamiento reproducible de los dos detectores YOLO.
   - Evalúa los pesos `best_YOLO11s.pt` y `best_YOLO11n.pt`.
3. **`notebooks/03_optimizacion.ipynb`**:
   - Ejecuta Grid Search sobre la Regresión Logística ($C \in [0.01, 0.1, 1, 10]$, `class_weight` $\in [\text{None}, \text{"balanced"}]$).
   - Demuestra la mejora en F1 Macro (de **0.5735** a **0.6767**) al balancear clases.
4. **`notebooks/04_visualizacion.ipynb`**:
   - Carga los modelos, genera inferencia con cajas delimitadoras y niveles de confianza.
   - Traza curvas de entrenamiento históricas, matrices de confusión e histogramas de error de conteo.

---

## 6. Resumen de Resultados Principales

### Comparativa de Detectores de Visión Artificial (Ultralytics YOLO)
| Métrica (Validación) | Modelo 1 (YOLO11s — Solo Propios) | Modelo 2 (YOLO11n — Propios + Externos) |
| :--- | :---: | :---: |
| **Dataset de Entrenamiento** | `frutilla_v3` v8 (1,500 train, 215 val) | `frutilla_v4` v1 (6,769 train, 1,042 val) |
| **Parámetros / Complejidad** | 9,413,961 / 21.4 GFLOPs | **2,597,537 / 6.4 GFLOPs** |
| **Épocas hasta Early Stopping** | 38 épocas (Mejor en época 18) | 61 épocas (Mejor en época 41) |
| **Precision Global (All)** | 0.8030 | **0.8730** |
| **Recall Global (All)** | 0.7980 | **0.8700** |
| **mAP50 Global** | 0.8550 | **0.9140** |
| **mAP50-95 Global** | 0.5520 | **0.7820** |
| **mAP50 Maduro (0)** | 0.8800 | **0.9060** |
| **mAP50 No-maduro (1)** | 0.8690 | **0.9270** |
| **mAP50 Semi-maduro (2)** | 0.8170 | **0.9100** |
| **Tiempo de Inferencia (GPU)** | ~5.1 ms | **~3.5 ms** (Tiempo real) |

### Comparativa de Clasificador Auxiliar (Características HSV)
| Configuración | Regularización ($C$) | Ponderación (`class_weight`) | Exactitud (Accuracy) | F1 Maduro | F1 No-maduro | F1 Semi-maduro | F1 Macro |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Modelo Base** | 1.0 | `None` (Uniforme) | 0.8167 | 0.8129 | 0.9076 | 0.0000 | **0.5735** |
| **Modelo Optimizado** | 1.0 | `balanced` | **0.8557** | 0.7700 | **0.9601** | **0.3000** | **0.6767** |

---

## 7. Instrucciones de Instalación y Requisitos

Para clonar y ejecutar el entorno localmente:

```bash
# Clonar repositorio
git clone https://github.com/josejara98/Proyecto_IA2026.git
cd Proyecto_IA2026

# Crear y activar entorno virtual
python -m venv .venv
source .venv/bin/activate  # En Windows: .venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

> **Privacidad y Credenciales**: Las claves de API de Roboflow y cualquier credencial privada han sido removidas de todos los archivos y cuadernos del repositorio. Para descargas automatizadas, defina su clave en la variable de entorno `ROBOFLOW_API_KEY`.
