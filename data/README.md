# Datos del Proyecto (`data/`)

Este directorio documenta el origen, la estructura, las particiones y las características de los conjuntos de datos empleados para el entrenamiento y evaluación de los modelos de detección y clasificación de madurez de frutillas (FIUNA 2026).

---

## 1. Definición de Clases y Convención

Ambos datasets y los modelos entrenados comparten un orden estricto de clases de madurez con 3 estados (`nc: 3`):

| Identificador (ID) | Clase | Descripción en el Cultivo |
| :---: | :--- | :--- |
| **`0`** | `maduro` | Fruto con pigmentación roja completa o predominante (>75%), óptimo para cosecha. |
| **`1`** | `no-maduro` | Fruto en estado verde o blanco inicial, con predominancia de clorofila. |
| **`2`** | `semi-maduro` | Fruto en transición de maduración, con sectores blancos/rosados y verde residual. |

El formato de las etiquetas corresponde a **YOLO**:
$$\text{formato: } \langle \text{clase} \rangle \quad \langle x_{\text{center}} \rangle \quad \langle y_{\text{center}} \rangle \quad \langle \text{width} \rangle \quad \langle \text{height} \rangle$$
donde las coordenadas están normalizadas en el intervalo $[0.0, 1.0]$.

---

## 2. Conjuntos de Datos

### Variante 1: Dataset Propio (`frutilla_v3`, Versión 8)
- **Fuente**: Roboflow Universe (`larissas-workspace-3bnvn/frutilla_v3`).
- **Licencia**: Creative Commons Attribution 4.0 International (CC BY 4.0).
- **Origen de las imágenes**: Fotografías y fotogramas de video capturados directamente en parcelas de cultivo de frutillas en Paraguay, tomadas desde la perspectiva visual del robot móvil agrícola.
- **Preprocesamiento aplicado en origen**: Redimensión a $640 \times 640$ píxeles (con ajuste y bordes blancos). Aumentaciones de rotación a 90°.
- **Total de imágenes**: 1,758.

#### Distribución por particiones:
| Partición | Imágenes | Anotaciones Maduro (0) | Anotaciones No-maduro (1) | Anotaciones Semi-maduro (2) | Total Instancias |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Train** | 1,500 | 1,187 | 4,731 | 1,088 | 7,006 |
| **Valid** | 215 | 158 | 615 | 149 | 922 |
| **Test** | 43 | 37 | 124 | 26 | 187 |
| **Total** | **1,758** | **1,382** | **5,470** | **1,263** | **8,115** |

---

### Variante 2: Dataset Extendido con Fuentes Externas (`frutilla_v4`, Versión 1)
- **Fuente**: Roboflow Universe (`larissas-workspace-3bnvn/frutilla_v4-r9rhk`).
- **Licencia**: Creative Commons Attribution 4.0 International (CC BY 4.0).
- **Composición**: Incorpora la totalidad del dataset propio (`frutilla_v3`) más imágenes externas de repositorios abiertos de frutillas en campo, homologadas y filtradas para coincidir exactamente con las 3 clases del proyecto.
- **Total de imágenes**: 7,927.

#### Distribución por particiones:
| Partición | Imágenes | Anotaciones Maduro (0) | Anotaciones No-maduro (1) | Anotaciones Semi-maduro (2) | Total Instancias |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Train** | 6,769 | 4,722 | 26,626 | 6,100 | 37,448 |
| **Valid** | 1,042 | 679 | 4,048 | 978 | 5,705 |
| **Test** | 116 | 86 | 440 | 99 | 625 |
| **Total** | **7,927** | **5,487** | **31,114** | **7,177** | **43,778** |

---

## 3. Verificación de Integridad y Detección de Incidencias

Mediante scripts automáticos de verificación sobre las imágenes y etiquetas de ambas variantes, se comprobó:
1. **Correspondencia 1:1**: Cada imagen cuenta con su archivo de etiquetas `.txt` correspondiente (0 etiquetas faltantes).
2. **Validez de coordenadas**: Todas las cajas delimitadoras cumplen estrictamente con $x, y \in [0, 1]$ y $w, h \in (0, 1]$ (0 cajas fuera de rango).
3. **Consistencia de clases**: No existen identificadores de clase fuera de $\{0, 1, 2\}$.
4. **Análisis de Fuga de Datos (Data Leakage)**: Al inspeccionar los nombres de archivo en `frutilla_v3` (ej. `01_Cargado_mp4-0029_jpg.rf...`), se constata que varios fotogramas provenientes del mismo clip de video se distribuyeron aleatoriamente entre entrenamiento y validación durante la exportación de Roboflow. Esta fuga potencial infla levemente el recall en validación debido a la correlación temporal entre fotogramas vecinos. Se documenta formalmente esta condición y se deja preparada la recomendación de particionado por secuencia o video completo para futuros ciclos experimentales.

---

## 4. Características de Entrada Auxiliares (`HSV`)

Para satisfacer el requerimiento académico de extracción de al menos tres características a partir de los datos crudos, se implementó en `notebooks/01_preprocesamiento.ipynb` la extracción sobre los recortes de frutos anotados:

1. **`red_ratio` (Proporción de píxeles rojos)**:
   - Píxeles en espacio HSV con $H \in [0, 20] \cup [330, 360]$, $S \ge 0.25$, $V \ge 0.20$.
   - Representa la maduración efectiva y la presencia de antocianinas.
2. **`green_ratio` (Proporción de píxeles verdes)**:
   - Píxeles en espacio HSV con $H \in [70, 165]$, $S \ge 0.20$, $V \ge 0.20$.
   - Representa la clorofila activa y el estado no maduro o base del fruto.
3. **`mean_saturation` (Saturación media normalizada)**:
   - Media de la componente de saturación $S \in [0, 1]$ en el recorte.
   - Refleja la vivacidad y concentración del pigmento.

Los datos generados se preservan en:
- `data/features_train.csv`: 1,877 instancias de entrenamiento.
- `data/features_val.csv`: 922 instancias de validación.

---

## 5. Descarga y Reconstrucción de Datasets Completos

Dado que las imágenes completas de entrenamiento y validación superan el límite de tamaño de archivo recomendado para repositorios Git (87 MB y 551 MB respectivamente), el repositorio almacena:
- Los archivos de configuración `data.yaml` y licencias en `data/modelo1/` y `data/modelo2/`.
- La partición de prueba (`test`) completa del Modelo 1 en `data/modelo1/test/` (43 imágenes, ~2.3 MB) para permitir inferencia inmediata sin descargas pesadas.
- Los CSVs de características HSV generadas.

Para descargar los datasets completos desde Roboflow Universe:

```python
import os
from roboflow import Roboflow

# Definir la API Key mediante variable de entorno para proteger credenciales
api_key = os.getenv("ROBOFLOW_API_KEY", "TU_ROBOFLOW_API_KEY")
rf = Roboflow(api_key=api_key)

# Descargar Dataset 1 (frutilla_v3 v8)
project1 = rf.workspace("larissas-workspace-3bnvn").project("frutilla_v3")
dataset1 = project1.version(8).download("yolov11")

# Descargar Dataset 2 (frutilla_v4 v1)
project2 = rf.workspace("larissas-workspace-3bnvn").project("frutilla_v4-r9rhk")
dataset2 = project2.version(1).download("yolov11")
```
