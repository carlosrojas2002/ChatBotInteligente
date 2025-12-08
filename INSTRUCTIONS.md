# Instrucciones para Desplegar la Función Lambda del Chatbot

Sigue estos pasos para crear y configurar la función Lambda desde la consola de AWS.

## 1. Crear el Rol IAM

1.  **Ve a la consola de IAM:**
    *   En la barra de búsqueda de AWS, escribe "IAM" y selecciona el servicio.
2.  **Crea una nueva política:**
    *   En el menú de la izquierda, haz clic en **Políticas**.
    *   Haz clic en **Crear política**.
    *   Selecciona la pestaña **JSON**.
    *   Copia y pega el contenido del archivo `iam_policy.json` en el editor.
    *   Haz clic en **Siguiente: Etiquetas** y luego en **Siguiente: Revisar**.
    *   Dale un nombre a la política (por ejemplo, `ChatBotLambdaPolicy`) y una descripción.
    *   Haz clic en **Crear política**.
3.  **Crea un nuevo rol:**
    *   En el menú de la izquierda, haz clic en **Roles**.
    *   Haz clic en **Crear rol**.
    *   En **Tipo de entidad de confianza**, selecciona **Servicio de AWS**.
    *   En **Caso de uso**, selecciona **Lambda**.
    *   Haz clic en **Siguiente**.
    *   En la lista de políticas, busca y selecciona la política que acabas de crear (`ChatBotLambdaPolicy`).
    *   Haz clic en **Siguiente**.
    *   Dale un nombre al rol (por ejemplo, `ChatBotLambdaRole`) y una descripción.
    *   Haz clic en **Crear rol**.

## 2. Crear la Función Lambda

1.  **Ve a la consola de Lambda:**
    *   En la barra de búsqueda de AWS, escribe "Lambda" y selecciona el servicio.
2.  **Crea una nueva función:**
    *   Haz clic en **Crear función**.
    *   Selecciona **Crear desde cero**.
    *   **Nombre de la función:** Escribe un nombre (por ejemplo, `ChatBotOrchestrator`).
    *   **Tiempo de ejecución:** Selecciona **Python 3.9**.
    *   **Arquitectura:** Selecciona **x86_64**.
    *   **Permisos:**
        *   Expande **Cambiar rol de ejecución predeterminado**.
        *   Selecciona **Usar un rol de ejecución existente**.
        *   En la lista, selecciona el rol que creaste en el paso anterior (`ChatBotLambdaRole`).
    *   Haz clic en **Crear función**.
3.  **Sube el código de la función:**
    *   Una vez creada la función, en la pestaña **Código**, verás un editor de código en línea.
    *   Copia el contenido del archivo `lambda/main.py` y pégalo en el editor, reemplazando el código existente.
    *   Haz clic en **Deploy** para guardar los cambios.

## 3. Probar la Función desde Lex

1.  **Ve a la consola de Amazon Lex:**
    *   En la barra de búsqueda de AWS, escribe "Lex" y selecciona el servicio.
2.  **Selecciona tu bot:**
    *   Haz clic en el bot que has creado.
3.  **Configura la Lambda como un alias:**
    *   En el menú de la izquierda, ve a **Aliases**.
    *   Selecciona el alias que estás utilizando (por ejemplo, `TestBotAlias`).
    *   Haz clic en **Editar**.
    *   En la sección **Idiomas**, selecciona el idioma que quieres configurar (por ejemplo, `Spanish (US)`).
    *   En **Fuente de la función Lambda**, selecciona la función que creaste (`ChatBotOrchestrator`).
    *   Haz clic en **Guardar**.
4.  **Prueba el bot:**
    *   En la esquina superior derecha, haz clic en **Build** para reconstruir el bot.
    *   Una vez que la compilación se haya completado, haz clic en **Test**.
    *   En la ventana de chat, escribe un mensaje de saludo (por ejemplo, "Hola").
    *   El bot debería responder con el mensaje definido en la función Lambda.
