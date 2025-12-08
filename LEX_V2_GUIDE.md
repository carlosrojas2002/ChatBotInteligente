# Guía Detallada para Construir un Bot de Amazon Lex V2 (Método Tradicional - Cafetería)

Esta guía te llevará paso a paso a través de la creación de un bot de Amazon Lex V2 para una **cafetería** utilizando el método tradicional.

**Características a implementar:**
*   5 intents creados manualmente para una cafetería
*   Slots para tomar pedidos (bebida, tamaño, etc.)
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
    *   **Bot name:** `MiCafeteriaBot`
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

Ahora crearemos cada una de las 5 intenciones enfocadas en una cafetería.

1.  En el menú de la izquierda, ve a **"Intents"** y haz clic en **"Add intent"** -> **"Add empty intent"**.

#### Intent 1: `Bienvenida`
*   **Intent name:** `Bienvenida`
*   **Sample utterances (frases de ejemplo):**
    *   `Hola`
    *   `Buenos días`
*   **Initial Response (Respuesta inicial):** `¡Hola! Bienvenido a nuestra cafetería. ¿Qué te gustaría ordenar?`
*   Guarda el intent.

#### Intent 2: `RealizarPedido`
*   **Intent name:** `RealizarPedido`
*   **Sample utterances:**
    *   `Quiero un café`
    *   `Me gustaría ordenar`
    *   `Para llevar un latte`
*   Guarda el intent (añadiremos los slots en el siguiente paso).

#### Intent 3: `CancelarPedido`
*   **Intent name:** `CancelarPedido`
*   **Sample utterances:**
    *   `Quiero cancelar mi orden`
    *   `Necesito anular mi pedido`
    *   `Cancelar el café que pedí`
*   Guarda el intent.

#### Intent 4: `ConsultarEstadoPedido`
*   **Intent name:** `ConsultarEstadoPedido`
*   **Sample utterances:**
    *   `Quiero saber el estado de mi pedido`
    *   `¿Cómo va mi orden?`
    *   `¿Ya está listo mi latte?`
*   Guarda el intent.

#### Intent 5: `Despedida`
*   **Intent name:** `Despedida`
*   **Sample utterances:**
    *   `Adiós`
    *   `Gracias`
*   **Closing Response (Respuesta de cierre):** `¡Gracias por tu visita! Disfruta tu café.`
*   Guarda el intent.

### 3. Crear Slots y Slot Types para Pedidos

Ahora añadiremos los campos de información (slots) que el bot necesita para tomar un pedido en el intent `RealizarPedido`.

1.  Abre el intent `RealizarPedido`.
2.  Ve a la sección **"Slots"** y haz clic en **"Add slot"**.

#### Slot 1: `TipoBebida` (con un Slot Type personalizado)
*   **Name:** `TipoBebida`
*   **Slot type:** Crea un nuevo Slot Type `Custom`:
    *   **Slot type name:** `TiposDeBebida`
    *   **Slot type values:** `Latte`, `Cappuccino`, `Americano`, `Espresso`
    *   **"Save slot type"**.
*   **Prompts (Preguntas):** `¿Qué bebida te gustaría ordenar?`
*   Guarda el slot.

#### Slot 2: `Tamaño` (con un Slot Type personalizado)
*   **Name:** `Tamaño`
*   **Slot type:** Crea un nuevo Slot Type `Custom`:
    *   **Slot type name:** `TamañosBebida`
    *   **Slot type values:** `Pequeño`, `Mediano`, `Grande`
    *   **"Save slot type"**.
*   **Prompts:** `¿En qué tamaño?`
*   Guarda el slot.

#### Slot 3: `Leche` (con un Slot Type predefinido)
*   **Name:** `Leche`
*   **Slot type:** Usa el tipo predefinido `AMAZON.YesNo`. Esto permite al usuario responder "sí" o "no".
*   **Prompts:** `¿Lo quieres con leche?`
*   Guarda el slot.

---
*El resto de los pasos (Validaciones, Fallback, Contexto de Sesión, Integración con Lambda, etc.) siguen la misma lógica que antes. Ahora tienes una base sólida y contextualizada para el bot de tu cafetería.*
