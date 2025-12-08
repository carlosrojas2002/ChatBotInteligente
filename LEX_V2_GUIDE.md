# Guía Detallada para Construir un Bot de Amazon Lex V2 (Método Tradicional)

Esta guía te llevará paso a paso a través de la creación de un bot de Amazon Lex V2 con el método tradicional, dándote control total sobre cada componente.

**Características a implementar:**
*   5 intents creados manualmente
*   Slots con validación personalizada
*   Session context
*   Fallback inteligente
*   Respuestas dinámicas con Lambda
*   Soporte multilingüe (español, inglés, portugués)
*   Versiones y alias para despliegue

---

## Bloque 1: Configuración Manual del Bot

### 1. Crear el Bot

1.  **Abrir la consola de Amazon Lex:**
    *   Ve a la [consola de AWS](https://console.aws.amazon.com/) y busca "Lex".
    *   Asegúrate de estar en una región que soporte los idiomas deseados (ej. `us-east-1` N. Virginia).
    *   Haz clic en **"Create bot"**.

2.  **Método de creación:**
    *   Selecciona **"Create a blank bot"**.
    *   **Bot name:** `MiChatbot`
    *   **IAM permissions:** Selecciona **"Create a role with basic Amazon Lex permissions"**.
    *   **Children's Online Privacy Protection Act (COPPA):** Selecciona **"No"**.
    *   **Idle session timeout:** Deja el valor predeterminado (5 minutos).
    *   Haz clic en **"Next"**.

3.  **Añadir idiomas y voz:**
    *   **Language:** Selecciona **"Spanish (ES)"** como idioma principal.
    *   **Voice:** Elige la voz que prefieras (ej. `Lucia`).
    *   Haz clic en **"Add another language"** y añade **"English (US)"** y **"Portuguese (BR)"**.
    *   Haz clic en **"Done"**.

### 2. Crear los 5 Intents Manualmente

Ahora crearemos cada una de las 5 intenciones desde cero.

1.  En el menú de la izquierda, ve a **"Intents"** y haz clic en **"Add intent"** -> **"Add empty intent"**.

#### Intent 1: `Bienvenida`
*   **Intent name:** `Bienvenida`
*   **Sample utterances (frases de ejemplo):**
    *   `Hola`
    *   `Buenos días`
    *   `Buenas tardes`
*   **Initial Response (Respuesta inicial):** Activa esta opción y en el campo de mensaje escribe: `¡Hola! ¿En qué puedo ayudarte hoy?`
*   Guarda el intent.

#### Intent 2: `ReservarCita`
*   **Intent name:** `ReservarCita`
*   **Sample utterances:**
    *   `Quiero reservar una cita`
    *   `Necesito una cita`
    *   `Agendar una cita para un servicio`
*   Guarda el intent (añadiremos los slots en el siguiente paso).

#### Intent 3: `CancelarCita`
*   **Intent name:** `CancelarCita`
*   **Sample utterances:**
    *   `Quiero cancelar mi cita`
    *   `Necesito anular una cita`
    *   `Cancelar la cita`
*   Guarda el intent.

#### Intent 4: `ConsultarEstadoCita`
*   **Intent name:** `ConsultarEstadoCita`
*   **Sample utterances:**
    *   `Quiero saber el estado de mi cita`
    *   `¿Cómo va mi cita?`
    *   `Consultar mi cita`
*   Guarda el intent.

#### Intent 5: `Despedida`
*   **Intent name:** `Despedida`
*   **Sample utterances:**
    *   `Adiós`
    *   `Gracias, eso es todo`
    *   `Hasta luego`
*   **Closing Response (Respuesta de cierre):** Activa esta opción y en el campo de mensaje escribe: `Gracias por contactarnos. ¡Hasta luego!`
*   Guarda el intent.

### 3. Crear Slots y Slot Types

Ahora añadiremos los campos de información (slots) que el bot necesita recopilar en el intent `ReservarCita`.

1.  Abre el intent `ReservarCita`.
2.  Ve a la sección **"Slots"** y haz clic en **"Add slot"**.

#### Slot 1: `TipoServicio` (con un Slot Type personalizado)
*   **Name:** `TipoServicio`
*   **Slot type:** Haz clic en `Custom` y luego en **"Create a new slot type"**:
    *   **Slot type name:** `TiposDeServicio`
    *   **Slot type values:**
        *   `Consulta general`
        *   `Limpieza dental`
        *   `Examen de la vista`
    *   Haz clic en **"Save slot type"**.
*   **Prompts (Preguntas):** `¿Qué tipo de servicio necesitas?`
*   Guarda el slot.

#### Slot 2: `FechaCita`
*   **Name:** `FechaCita`
*   **Slot type:** Busca y selecciona el tipo predefinido `AMAZON.Date`.
*   **Prompts:** `¿Para qué fecha deseas la cita?`
*   Guarda el slot.

#### Slot 3: `HoraCita`
*   **Name:** `HoraCita`
*   **Slot type:** Busca y selecciona el tipo predefinido `AMAZON.Time`.
*   **Prompts:** `¿A qué hora te gustaría la cita?`
*   Guarda el slot.

---
*El resto de los pasos (Validaciones, Fallback, Contexto de Sesión, Integración con Lambda, etc.) son idénticos a los de la guía anterior. Esta estructura manual te da la base para luego añadir la lógica avanzada.*
