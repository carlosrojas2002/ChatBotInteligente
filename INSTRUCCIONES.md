# Guía de Implementación: Lambda Orquestadora para Chatbot en Amazon Lex V2

Este documento te guiará paso a paso para crear, configurar y desplegar la función Lambda que actuará como el cerebro de tu chatbot, orquestando los servicios de AWS Lex, Translate y Comprehend.

---

## Parte 1: Crear la Función Lambda en la Consola de AWS

Primero, crearemos la función Lambda y subiremos el código que hemos preparado.

1.  **Accede a la Consola de AWS** y busca el servicio **Lambda**.
2.  Haz clic en el botón **"Crear función"**.
3.  **Configura la función** con los siguientes parámetros:
    *   **Opción:** "Autor desde cero".
    *   **Nombre de la función:** `LexV2Orchestrator` (o el nombre que prefieras).
    *   **Tiempo de ejecución:** Selecciona `Python 3.9` o una versión más reciente.
    *   **Arquitectura:** `x86_64`.
    *   **Permisos:** Expande la sección "Cambiar rol de ejecución predeterminado". Selecciona **"Crear un nuevo rol con permisos básicos de Lambda"**. Esto es temporal, en la siguiente sección le daremos los permisos que necesita.
4.  Haz clic en **"Crear función"**.
5.  Una vez creada la función, serás llevado al editor de código.
    *   Borra el código de ejemplo que aparece en el archivo `lambda_function.py`.
    *   **Copia todo el contenido** del archivo `lambda_function.py` que te he proporcionado y **pégalo** en el editor de la consola.
6.  Haz clic en el botón **"Deploy"** para guardar los cambios en el código.

---

## Parte 2: Configurar los Permisos de IAM

Nuestra función Lambda necesita permiso para comunicarse con otros servicios de AWS (Translate y Comprehend).

1.  Dentro de la página de tu función Lambda, ve a la pestaña **"Configuración"** y luego a **"Permisos"**.
2.  Haz clic en el **nombre del rol** (ej: `LexV2Orchestrator-role-xxxx`). Esto te abrirá una nueva pestaña en la consola de **IAM**.
3.  En la página del rol, en la sección **"Políticas de permisos"**, haz clic en el botón **"Agregar permisos"** y selecciona **"Asociar políticas"**.
4.  En la barra de búsqueda, busca y selecciona las siguientes dos políticas de AWS. Después de seleccionar cada una, haz clic en **"Asociar políticas"**:
    *   `TranslateReadOnly`: Permite a la función usar el servicio de Amazon Translate.
    *   `ComprehendReadOnly`: Permite a la función usar el servicio de Amazon Comprehend para análisis de sentimientos.
5.  Al final, deberías tener tres políticas asociadas a tu rol:
    *   `AWSLambdaBasicExecutionRole` (para los logs)
    *   `TranslateReadOnly`
    *   `ComprehendReadOnly`

¡Los permisos están listos! Ahora la Lambda puede orquestar los servicios.

---

## Parte 3: Integrar la Lambda con Amazon Lex

Ahora, conectaremos la función Lambda para que se active cuando un usuario interactúe con el bot.

1.  Regresa a la consola de **Amazon Lex V2**.
2.  Selecciona tu chatbot.
3.  En el menú de la izquierda, ve a **"Aliases"** bajo la sección "Deployments".
4.  Selecciona el alias que estás usando para las pruebas (normalmente `TestBotAlias`).
5.  En la nueva pantalla, selecciona el idioma que quieres configurar (por ejemplo, `Spanish (US)`).
6.  Aparecerá una ventana para configurar el alias. Busca la sección **"Función de Lambda"**.
    *   En el menú desplegable, selecciona la función que acabas de crear (`LexV2Orchestrator`).
    *   Aparecerá una advertencia sobre una política basada en recursos. La consola de Lex la generará por ti.
7.  Haz clic en **"Guardar"**. Esto automáticamente dará permiso a Lex para invocar tu función Lambda.

---

## Parte 4: Probar el Chatbot desde la Consola de Lex

Es hora de probar que todo funciona como se espera.

1.  En la consola de Amazon Lex, asegúrate de que tu bot esté construido (**Build**). Si no, haz clic en el botón **"Build"** y espera a que termine.
2.  Una vez construido, haz clic en **"Test"** en la esquina superior derecha.
3.  **Prueba en español:**
    *   Escribe un mensaje como: `estoy muy contento con el servicio`.
    *   **Respuesta esperada:** `¡Qué bueno que te sientas así! ¿En qué más puedo ayudarte?`
4.  **Prueba en inglés:**
    *   Escribe un mensaje como: `i am very sad with the coffee`.
    *   **Respuesta esperada (traducida al inglés):** `I'm sorry you feel that way. We will do our best to help you. What do you need?`
5.  **Prueba en portugués:**
    *   Escribe un mensaje como: `estou neutro sobre isso`.
    *   **Respuesta esperada (traducida al portugués):** `Entendido. Como posso ajudá-lo?`

### ¿Algo salió mal? Solución de Problemas

Si al probar el bot, este responde con `La intención FallbackIntent se ha cumplido` (como en la captura de pantalla que compartiste), casi siempre significa que **la función Lambda está fallando** y no puede devolver una respuesta válida a Lex.

Con la última actualización del código, si ocurre un error, la Lambda ahora te responderá: `Lo siento, ocurrió un error inesperado...`. Además, el error exacto quedará registrado en CloudWatch.

Sigue estos pasos para encontrar el error:

1.  **Ve a la Consola de AWS CloudWatch:**
    *   Puedes ir directamente desde tu función Lambda. Ve a la pestaña **"Monitor"** y haz clic en el botón **"Ver registros de CloudWatch"**.

2.  **Explora los Grupos de Registros (Log Groups):**
    *   Esto te llevará directamente al grupo de registros de tu función, que se llamará algo como `/aws/lambda/LexV2Orchestrator`.

3.  **Revisa los Flujos de Registro (Log Streams):**
    *   Haz clic en el flujo de registro más reciente (ordenados por fecha y hora).

4.  **Encuentra el Error:**
    *   Dentro del registro, busca una línea que comience con `--- ERROR INESPERADO ---`.
    *   Justo debajo de esa línea, verás el **error exacto** que está ocurriendo en el código (por ejemplo, un problema de permisos, un error de sintaxis, etc.). Este `traceback` es la clave para entender qué está fallando.

**Causa Común: Permisos Faltantes**
Un error muy común al principio es que al rol de la Lambda le falte algún permiso de IAM para hablar con Translate o Comprehend. Si ves un error como `AccessDeniedException`, asegúrate de que las políticas `TranslateReadOnly` y `ComprehendReadOnly` estén correctamente asociadas al rol de tu función, como se describe en la "Parte 2" de esta guía.
