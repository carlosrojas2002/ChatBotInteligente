# Guía Detallada para Construir un Bot de Amazon Lex V2

Esta guía te llevará paso a paso a través de la creación de un bot de Amazon Lex V2 con las siguientes características:

*   5 intents
*   Slots con validación personalizada
*   Session context
*   Fallback inteligente
*   Respuestas dinámicas
*   Integración con Lambda (orquestador)
*   Soporte en español, inglés y portugués
*   Creación de alias y versión

## Bloque 1: Configuración de Amazon Lex (NLU principal)

### 1. Crear el Bot

1.  **Abrir la consola de Amazon Lex:**
    *   Ve a la [consola de AWS](https://console.aws.amazon.com/) y busca "Lex".
    *   Asegúrate de estar en la región de AWS que deseas utilizar.
    *   Haz clic en **"Create bot"**.

2.  **Método de creación:**
    *   Selecciona **"Create a blank bot"**.
    *   **Bot name:** `MiChatbot` (o el nombre que prefieras).
    *   **IAM permissions:** Selecciona **"Create a role with basic Amazon Lex permissions"**. AWS creará automáticamente un rol de IAM con los permisos necesarios.
    *   **Children's Online Privacy Protection Act (COPPA):** Selecciona **"No"** si tu bot no está dirigido a niños menores de 13 años.
    *   **Idle session timeout:** Deja el valor predeterminado de 5 minutos.
    *   Haz clic en **"Next"**.

3.  **Añadir idiomas:**
    *   **Language:** Selecciona **"Spanish (ES)"** como idioma principal.
    *   **Voice:** Puedes dejar la voz predeterminada o seleccionar la que prefieras.
    *   Haz clic en **"Add another language"** y añade **"English (US)"** y **"Portuguese (BR)"**.
    *   Haz clic en **"Done"**.

### 2. Crear 5 Intents

Crearemos 5 intents de ejemplo. Puedes adaptarlos a las necesidades de tu proyecto.

1.  **`Bienvenida`**: Para saludar al usuario.
2.  **`ReservarCita`**: Para agendar una cita.
3.  **`CancelarCita`**: Para cancelar una cita.
4.  **`ConsultarEstadoCita`**: Para verificar el estado de una cita.
5.  **`Despedida`**: Para finalizar la conversación.

#### 2.1. Crear el Intent `Bienvenida`

1.  En el menú de la izquierda, ve a **"Intents"**.
2.  Haz clic en **"Add intent"** -> **"Add empty intent"**.
3.  **Intent name:** `Bienvenida`
4.  **Sample utterances:**
    *   `Hola`
    *   `Buenos días`
    *   `Buenas tardes`
    *   `Hey`
5.  **Initial response:**
    *   Activa la respuesta inicial.
    *   **Message:** `¡Hola! ¿En qué puedo ayudarte hoy?`
6.  Haz clic en **"Save intent"**.

#### 2.2. Crear el Intent `ReservarCita`

1.  **"Add intent"** -> **"Add empty intent"**.
2.  **Intent name:** `ReservarCita`
3.  **Sample utterances:**
    *   `Quiero reservar una cita`
    *   `Necesito una cita`
    *   `Agendar una cita`
4.  Haz clic en **"Save intent"**.

#### 2.3. Crear los Intents `CancelarCita`, `ConsultarEstadoCita` y `Despedida`

Repite el proceso anterior para los intents restantes, añadiendo algunas utterances de ejemplo para cada uno.

### 3. Crear Slots

Ahora, vamos a añadir slots al intent `ReservarCita` para recopilar la información necesaria.

1.  Ve al intent `ReservarCita`.
2.  En la sección **"Slots"**, haz clic en **"Add slot"**.

#### 3.1. Slot `FechaCita`

*   **Name:** `FechaCita`
*   **Slot type:** `AMAZON.Date`
*   **Prompts:** `¿Para qué fecha deseas la cita?`

#### 3.2. Slot `HoraCita`

*   **Name:** `HoraCita`
*   **Slot type:** `AMAZON.Time`
*   **Prompts:** `¿A qué hora?`

#### 3.3. Slot `TipoServicio`

*   **Name:** `TipoServicio`
*   **Slot type:** `Custom` -> **"Create a new slot type"**
    *   **Slot type name:** `TiposDeServicio`
    *   **Slot type values:**
        *   `Consulta general`
        *   `Limpieza dental`
        *   `Examen de la vista`
    *   Haz clic en **"Save slot type"**.
*   **Prompts:** `¿Qué tipo de servicio necesitas?`

### 4. Crear Validaciones Personalizadas

Usaremos una función de Lambda para la validación personalizada de los slots.

1.  En el intent `ReservarCita`, ve a la sección **"Fulfillment"**.
2.  Activa **"Use a Lambda function for fulfillment"**.
3.  En la sección **"Code hooks"**, selecciona **"Use a Lambda function for initialization and validation"**.
4.  Más adelante, en la sección de integración con Lambda, crearemos la función y la asociaremos aquí.

### 5. Crear Fallback Inteligente

El fallback intent se activa cuando el bot no entiende la entrada del usuario.

1.  En el menú de la izquierda, ve a **"Fallback intent"**.
2.  **Closing response:**
    *   **Message:** `Lo siento, no he entendido. ¿Puedes repetirlo de otra forma?`
3.  **Fulfillment:**
    *   Puedes añadir una función de Lambda para registrar las entradas no reconocidas y mejorar el bot con el tiempo.

### 6. Definir Session Context

Usaremos el contexto de sesión para pasar información entre intents. Por ejemplo, después de `ReservarCita`, podemos sugerir `ConsultarEstadoCita`.

1.  Ve al intent `ReservarCita`.
2.  En la sección **"Contexts"**, en **"Output contexts"**, haz clic en **"Add context"**.
    *   **Name:** `CitaReservada`
    *   **Time to live:** `5` (minutos)
3.  Ahora, ve al intent `ConsultarEstadoCita`.
4.  En **"Input contexts"**, haz clic en **"Add context"**.
    *   **Name:** `CitaReservada`

Esto hará que el intent `ConsultarEstadoCita` sea más propenso a ser activado si el contexto `CitaReservada` está activo.

### 7. Respuestas Dinámicas

Las respuestas dinámicas se pueden lograr a través de la función de Lambda. En la respuesta de Lambda, puedes personalizar el mensaje que se envía al usuario.

Ejemplo en la función de Lambda (Node.js):

`
function close(sessionAttributes, fulfillmentState, message) {
    return {
        sessionState: {
            dialogAction: {
                type: 'Close',
            },
            sessionAttributes,
        },
        messages: [message],
    };
}

// ... en el handler de tu Lambda
const serviceType = intentRequest.sessionState.intent.slots.TipoServicio.value.interpretedValue;
const appointmentDate = intentRequest.sessionState.intent.slots.FechaCita.value.interpretedValue;
const appointmentTime = intentRequest.sessionState.intent.slots.HoraCita.value.interpretedValue;

const confirmationMessage = \`Gracias. Tu cita para \${serviceType} ha sido confirmada para el \${appointmentDate} a las \${appointmentTime}.\`;

return close(sessionAttributes, 'Fulfilled', { contentType: 'PlainText', content: confirmationMessage });
`

### 8. Integración con Lambda (Orquestador)

1.  **Crear la función de Lambda:**
    *   Ve a la [consola de AWS Lambda](https://console.aws.amazon.com/lambda/).
    *   **"Create function"**.
    *   **"Author from scratch"**.
    *   **Function name:** `MiChatbotOrquestador`
    *   **Runtime:** `Node.js 18.x` (o el que prefieras).
    *   **Permissions:** Deja que Lambda cree un rol de ejecución básico.
    *   **"Create function"**.

2.  **Añadir permisos a Lambda:**
    *   En la función de Lambda, ve a **"Configuration"** -> **"Permissions"**.
    *   Haz clic en el rol de ejecución para abrir la consola de IAM.
    *   **"Add permissions"** -> **"Attach policies"**.
    *   Busca y añade la política `AmazonLexRunBotsOnly`.

3.  **Añadir el código de la Lambda:**
    *   Pega el código de tu orquestador en el editor de código de la Lambda.
    *   Asegúrate de manejar los diferentes intents que llegan desde Lex.

4.  **Asociar la Lambda a los Intents en Lex:**
    *   Vuelve a la consola de Lex.
    *   En cada intent que necesite lógica de negocio (`ReservarCita`, `CancelarCita`, etc.), ve a la sección **"Fulfillment"** y selecciona tu función de Lambda.

### 9. Soporte en Español, Inglés y Portugués

1.  En el menú de la izquierda, en **"Languages"**, puedes cambiar entre los idiomas que has añadido.
2.  Para cada idioma, debes proporcionar:
    *   **Sample utterances:** Frases de ejemplo en ese idioma.
    *   **Slot prompts:** Preguntas para solicitar los slots en ese idioma.
    *   **Responses:** Respuestas del bot en ese idioma.

### 10. Creación de Alias y Versión

1.  **Construir el bot:**
    *   Cada vez que hagas cambios, haz clic en **"Build"** para construir el bot.

2.  **Crear una versión:**
    *   Una vez que el bot esté construido y probado, ve a **"Bot versions"** en el menú de la izquierda.
    *   Haz clic en **"Create version"**. Esto creará una instantánea numerada de tu bot.

3.  **Crear un alias:**
    *   Un alias es un puntero a una versión específica de tu bot. Puedes tener alias para `desarrollo`, `pruebas`, `producción`, etc.
    *   Ve a **"Aliases"**.
    *   Haz clic en **"Create alias"**.
    *   **Alias name:** `Produccion`
    *   **Associate with a version:** Selecciona la versión que acabas de crear.
    *   **"Create"**.

Ahora puedes integrar tu aplicación con el alias `Produccion`, y cuando quieras actualizar el bot en producción, simplemente tienes que crear una nueva versión y apuntar el alias a esa nueva versión, sin necesidad de cambiar la configuración en tu aplicación cliente.
