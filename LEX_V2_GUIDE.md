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

### 1. Crear el Bot con IA Generativa

Este método utiliza IA para generar automáticamente los intents y slots a partir de una descripción en lenguaje natural.

1.  **Abrir la consola de Amazon Lex:**
    *   Ve a la [consola de AWS](https://console.aws.amazon.com/) y busca "Lex".
    *   Asegúrate de estar en la región de AWS que deseas utilizar.
    *   Haz clic en **"Create bot"**.

2.  **Método de creación:**
    *   Selecciona la pestaña **"Generative AI"**.
    *   **Describa el bot que desea crear:** Aquí es donde escribes el "prompt" para la IA. Sé claro y específico.

    > **Ejemplo de Prompt para tu caso de uso:**
    > ```
    > Crea un bot en español para un consultorio que permita a los pacientes agendar, cancelar y consultar el estado de sus citas.
    > Para agendar una cita, necesitas recopilar el tipo de servicio (consulta general, limpieza dental, examen de la vista), la fecha y la hora.
    > El bot también debe poder saludar al usuario y despedirse amablemente.
    > ```

    *   **Configuración de bots:**
        *   **Nombre del bot:** `MiChatbot` (o el nombre que prefieras).
        *   **IAM permissions:** Selecciona **"Create a role with basic Amazon Lex permissions"**.
        *   **Children's Online Privacy Protection Act (COPPA):** Selecciona **"No"**.
        *   **Idle session timeout:** Deja el valor predeterminado de 5 minutos.
    *   Haz clic en **"Next"**.

3.  **Añadir idiomas:**
    *   **Language:** El idioma principal será el del prompt (Español). Puedes añadir más idiomas aquí.
    *   Haz clic en **"Add another language"** y añade **"English (US)"** y **"Portuguese (BR)"**.
    *   Haz clic en **"Done"**.

Lex procesará tu solicitud y generará una estructura de bot. Esto puede tardar unos minutos.

### 2. Revisar y Refinar los Intents Generados

Una vez que Lex termine, verás una lista de intents que la IA ha creado para ti, basados en tu descripción. Por ejemplo, podrías ver:

*   `Bienvenida`
*   `ReservarCita`
*   `CancelarCita`
*   `ConsultarEstadoCita`
*   `Despedida`

**Tu siguiente tarea es revisar este trabajo inicial:**

1.  **Explora cada intent:** Haz clic en cada intent generado.
2.  **Verifica los slots:** Revisa si los slots (ej. `TipoServicio`, `FechaCita`, `HoraCita`) se crearon correctamente dentro del intent `ReservarCita` y si tienen el tipo de slot adecuado.
3.  **Ajusta las frases de ejemplo (utterances):** La IA habrá generado algunas, pero puedes añadir más para mejorar la precisión del bot.
4.  **Configura las respuestas:** Revisa y edita los mensajes de confirmación y las preguntas (prompts) para los slots.

Una vez que hayas revisado y ajustado la estructura base generada por la IA, puedes continuar con los siguientes pasos de esta guía (Crear Slots personalizados si es necesario, Validaciones, Contexto, etc.) para añadir la lógica avanzada a tu bot.

### 3. Revisar y Personalizar Slots

Dado que usamos la IA generativa con un prompt detallado, es muy probable que Lex ya haya creado los slots `FechaCita`, `HoraCita` y `TipoServicio` dentro del intent `ReservarCita`. Tu tarea ahora es revisar que estén correctos y personalizarlos.

1.  **Navega al Intent `ReservarCita`:** En el menú de la izquierda, selecciona el intent `ReservarCita`.
2.  **Encuentra la sección "Slots":** Desplázate hacia abajo hasta que veas la lista de slots que la IA generó.

#### 3.1. Revisar los Slots Existentes

Para cada slot (ej. `FechaCita`, `HoraCita`):
*   **Verifica el "Slot type":** Asegúrate de que Lex haya asignado el tipo correcto. Debería ser `AMAZON.Date` para la fecha y `AMAZON.Time` para la hora.
*   **Personaliza los "Prompts":** Haz clic en el nombre del slot para editarlo. Busca la sección de "Prompts" y ajusta la pregunta si quieres que suene más natural para tu negocio. Por ejemplo, en lugar de `¿A qué hora?`, podrías poner `Perfecto, ¿a qué hora te viene bien?`.

#### 3.2. Personalizar el Slot Type `TipoServicio`

El slot `TipoServicio` es especial porque es un tipo de slot personalizado (`Custom`).

1.  **Encuentra el Slot Type:** En el menú de la izquierda, en la sección **"Slot types"**, deberías ver uno nuevo que la IA ha creado (podría llamarse `TiposDeServicio` o algo similar).
2.  **Edita los valores:** Haz clic en él. Verás los valores que la IA extrajo de tu prompt (`Consulta general`, `Limpieza dental`, etc.).
3.  **Añade o quita valores:** Puedes añadir más servicios que ofrezcas o eliminar los que no correspondan.
4.  **Guarda los cambios:** Haz clic en **"Save slot type"**.

Este proceso de **revisión y ajuste** es clave cuando se trabaja con IA generativa. La IA hace el trabajo pesado inicial, y tú te encargas de refinar los detalles.

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
