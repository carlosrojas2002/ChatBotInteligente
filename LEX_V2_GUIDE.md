# Guía Completa para Construir un Bot de Amazon Lex V2 (Método Tradicional - Cafetería)

Esta guía te llevará paso a paso a través de la creación de un bot de Amazon Lex V2 para una **cafetería**, cubriendo todos los aspectos desde la configuración inicial hasta el despliegue.

**Características a implementar:**
*   5 intents creados manualmente para una cafetería
*   Slots para tomar pedidos (bebida, tamaño, etc.)
*   **Fallback inteligente** para manejar incomprensión
*   **Contexto de Sesión** para recordar datos entre turnos
*   Respuestas dinámicas con un **orquestador Lambda**
*   **Soporte multilingüe** (español, inglés, portugués)
*   **Versiones y alias** para un despliegue seguro

---

## Bloque 1: Configuración Manual del Bot

*(Esta sección se mantiene igual que la anterior: Crear Bot, Crear los 5 Intents, Crear Slots)*

### 1. Crear el Bot (`MiCafeteriaBot`)
### 2. Crear los 5 Intents Manualmente (`Bienvenida`, `RealizarPedido`, `CancelarPedido`, `ConsultarEstadoPedido`, `Despedida`)
### 3. Crear Slots y Slot Types para Pedidos (`TipoBebida`, `Tamaño`, `Leche`)

---

## Bloque 2: Lógica de Negocio con AWS Lambda

*(Esta sección se mantiene igual: Crear Lambda, Configurar Permisos, Conectar Lambda a Lex)*

### 4. Crear la Función Lambda (`ProcesarPedidoCafeteria`)
### 5. Configurar los Permisos
### 6. Conectar Lambda a los Intents en Lex
    *   **Importante:** Conecta la función Lambda a **todos los intents** que requieran una respuesta dinámica (`Bienvenida`, `RealizarPedido`, `CancelarPedido`, `ConsultarEstadoPedido`, `Despedida`), no solo a `RealizarPedido`.

---

## Bloque 3: Funcionalidades Avanzadas y Despliegue

### 7. Configurar el Fallback Intent (Fallback Inteligente)

Esto se activa cuando Lex no entiende al usuario.

1.  En el menú de la izquierda de la consola de Lex, busca y haz clic en **"Fallback intent"**.
2.  En la sección **"Closing response"**, añade un mensaje amigable:
    *   `Lo siento, no te he entendido. Puedes pedir un café, cancelar un pedido o preguntar por el estado de tu orden.`
3.  **Opcional:** Puedes conectar una Lambda aquí para registrar las frases que el bot no entendió y así poder mejorarlo en el futuro.
4.  Haz clic en **"Save intent"**.

### 8. Usar el Contexto de Sesión (Session Context)

El contexto de sesión permite al bot "recordar" información entre diferentes intents. Vamos a usarlo para que `ConsultarEstadoPedido` recuerde el ID del último pedido.

1.  **Revisa el código de Lambda:**
    *   En `lambda_function.js`, dentro del intent `realizarPedido`, ya hemos añadido una línea que guarda el ID del pedido en los atributos de sesión:
        ```javascript
        const sessionAttributes = {
            lastOrderId: orderId.toString()
        };
        ```
    *   En el intent `consultarEstadoPedido`, el código ya busca este atributo:
        ```javascript
        const sessionAttributes = intentRequest.sessionState.sessionAttributes || {};
        const lastOrderId = sessionAttributes.lastOrderId;
        ```
2.  **No se requiere configuración adicional en Lex:** La gestión de los atributos de sesión se maneja completamente desde el código de Lambda, haciendo el flujo de conversación más inteligente y conectado.

### 9. Añadir Soporte Multilingüe

Para que tu bot funcione en inglés y portugués, debes traducir tus configuraciones.

1.  En la consola de Lex, en la parte superior del menú de la izquierda, verás un desplegable de idiomas. Cambia de `Spanish (ES)` a `English (US)`.
2.  **Traduce todo:**
    *   **Intents:** Para cada intent, ve y añade "Sample utterances" en inglés.
    *   **Slots:** En el intent `RealizarPedido`, edita cada slot y traduce los "Prompts" (las preguntas que hace el bot).
    *   **Slot Types:** Si tienes valores de slot (como `Latte`, `Grande`), puedes añadir sinónimos o dejarlos igual si son universales.
3.  Repite el proceso para `Portuguese (BR)`.
4.  **Recuerda construir el bot (`Build`)** después de añadir las traducciones para cada idioma.

### 10. Crear Versiones y Alias para Despliegue

Nunca debes exponer tu versión de desarrollo directamente a los usuarios.

1.  **Crear una Versión (una foto inmutable de tu bot):**
    *   Una vez que hayas probado tu bot y estés contento con los cambios, ve a **"Bot versions"** en el menú de la izquierda.
    *   Haz clic en **"Create version"**. Lex creará una versión numerada (ej. `1`).

2.  **Crear un Alias (un puntero a una versión):**
    *   Los alias te permiten cambiar la versión que usan tus usuarios sin tener que cambiar la configuración en tu aplicación cliente.
    *   Ve a **"Aliases"**. Verás el `TestBotAlias` que se usa para pruebas.
    *   Haz clic en **"Create alias"**.
    *   **Alias name:** `Produccion`
    *   **Associate with a version:** Selecciona la Versión `1` que acabas de crear.
    *   **"Create"**.

3.  **Flujo de trabajo:**
    *   **Desarrollo:** Sigue haciendo cambios en la versión "Draft" (borrador) y prueba con el `TestBotAlias`.
    *   **Despliegue:** Cuando estés listo para actualizar, crea una nueva **versión** (ej. `2`) y luego edita tu alias `Produccion` para que apunte a esa nueva versión.

---

### 11. Probar el Bot de Forma Integral

Ahora que todo está configurado, usa la ventana de **"Test"** y prueba los flujos completos:

*   **Pedido y consulta:**
    1.  `"Quiero un latte mediano"`
    2.  (El bot te pide el resto de datos y confirma con un ID de pedido).
    3.  `"Cómo va mi orden?"` (El bot debería usar el contexto de sesión para dar el estado de ese pedido).
*   **Fallback:**
    1.  `"Cuánto cuesta el café?"` (El bot no fue entrenado para esto).
    2.  Debería responder con el mensaje del Fallback Intent.

¡Felicidades! Has construido un bot de Amazon Lex V2 completo, robusto y listo para producción.
