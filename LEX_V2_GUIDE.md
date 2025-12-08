# Guía Definitiva: Orquestador Inteligente con Lex, Lambda, Comprehend y Translate

Esta guía te enseñará a construir una solución de chatbot completa y robusta, donde una función de AWS Lambda actúa como un cerebro central (orquestador) que utiliza servicios de IA para ofrecer una experiencia de usuario verdaderamente multilingüe y dinámica.

**Arquitectura de la Solución:**
1.  **Amazon Lex:** Actúa como la interfaz de conversación (NLU).
2.  **AWS Lambda:** Es el orquestador central que ejecuta toda la lógica.
3.  **Amazon Comprehend:** Detecta el idioma del usuario en tiempo real.
4.  **Amazon Translate:** Traduce las respuestas del bot al idioma del usuario.

---

## Bloque 1: Configuración de Amazon Lex

*(Esta sección no cambia. Asegúrate de haber completado estos pasos, ya que son la base de nuestro bot).*

### 1. Crear el Bot (`MiCafeteriaBot`)
### 2. Crear los 5 Intents Manualmente
### 3. Crear Slots y Slot Types para Pedidos
### 4. Configurar el Fallback Intent
### 5. Añadir Soporte Multilingüe (Utterances y Prompts en ES, EN, PT)

---

## Bloque 2: Creación del Orquestador Inteligente en AWS Lambda

Aquí es donde construiremos el cerebro de nuestro bot. Reemplazaremos la lógica anterior con una nueva, mucho más potente.

### 6. Crear la Función Lambda

1.  **Abrir la consola de AWS Lambda:**
    *   Ve a la consola de AWS y busca "Lambda".
    *   Haz clic en **"Create function"**.
2.  **Configuración de la función:**
    *   **"Author from scratch"** (Crear desde cero).
    *   **Function name:** `OrquestadorInteligenteCafeteria`
    *   **Runtime:** `Node.js 18.x`
    *   **Architecture:** `x86_64`
    *   Haz clic en **"Create function"**.

### 7. Añadir el Código del Orquestador

1.  **Configurar como Módulo ES:**
    *   En la pestaña **"Code"** de tu Lambda, busca el archivo `package.json`.
    *   Añade la siguiente línea dentro de las llaves `{}`: `"type": "module",`
    *   Guarda el archivo. Esto es necesario para usar la sintaxis `import` del nuevo AWS SDK v3.
2.  **Pegar el código:**
    *   Vuelve al archivo `index.mjs` (puede que tengas que renombrarlo de `.js` a `.mjs`).
    *   Borra todo el contenido de ejemplo.
    *   Copia el código completo del archivo `lambda_function.js` que te proporcioné (el que incluye Comprehend y Translate) y pégalo aquí.
    *   Haz clic en **"Deploy"** para guardar.

### 8. Configurar los Permisos de IAM (¡Paso Crítico!)

Nuestra Lambda ahora necesita "hablar" con Lex, Comprehend y Translate. Debemos darle los permisos necesarios.

1.  **Ir a la configuración de IAM:**
    *   En tu función Lambda, ve a la pestaña **"Configuration"** -> **"Permissions"**.
    *   Haz clic en el nombre del **"Role name"** (rol de ejecución). Esto te abrirá la consola de IAM en una nueva pestaña.
2.  **Añadir Políticas de Permisos:**
    *   En la página del rol, haz clic en el botón **"Add permissions"** -> **"Attach policies"**.
    *   Busca y añade las siguientes tres políticas de AWS, una por una:
        1.  `AWSLambdaBasicExecutionRole` (normalmente ya está)
        2.  `AmazonLexRunBotsOnly`
        3.  `ComprehendReadOnly`
        4.  `TranslateReadOnly`
    *   Al final, deberías tener estas cuatro políticas adjuntas a tu rol.

### 9. Conectar y Configurar el Bot en Lex

1.  **Regresa a la consola de Amazon Lex**.
2.  **Conectar la Lambda:**
    *   Para **todos tus intents** (`Bienvenida`, `RealizarPedido`, etc.), ve a la sección **"Fulfillment"**, activa **"Use a Lambda function"** y selecciona tu nueva función `OrquestadorInteligenteCafeteria`.
    *   Asegúrate de que la opción para **"initialization and validation"** también esté activa en el intent `RealizarPedido`.
3.  **Aumentar el Timeout:**
    *   Las llamadas a servicios de IA pueden tardar un poco más. Para evitar errores, es bueno aumentar el timeout.
    *   En la consola de Lambda, ve a **"Configuration"** -> **"General configuration"** -> **"Edit"**.
    *   Ajusta el **"Timeout"** a `10` segundos.
4.  **¡Guardar, Construir y Probar!**
    *   Guarda todos los intents en Lex.
    *   Haz clic en **"Build"** para compilar todos los cambios.

---

## Bloque 3: Pruebas y Despliegue

### 10. Probar la Lógica Multilingüe

Usa la ventana de **"Test"** en la consola de Lex para verificar que todo funciona.

*   **Prueba en Inglés:**
    *   **Tú:** `I want to order a large cappuccino with milk`
    *   **Bot (respuesta traducida):** `Order confirmed! You have ordered a Cappuccino size Grande with milk. Your order number is [1234].`
*   **Prueba en Portugués:**
    *   **Tú:** `Gostaria de um americano pequeno sem leite`
    *   **Bot (respuesta traducida):** `Pedido confirmado! Você pediu um Americano tamanho Pequeno sem leite. O número do seu pedido é [5678].`
*   **Prueba de Contexto de Sesión (en cualquier idioma):**
    1.  Completa un pedido.
    2.  **Tú:** `What's the status of my order?`
    3.  **Bot (traducido):** `The status of your last order ([5678]) is: In preparation. It will be ready in a couple of minutes!`

### 11. Crear Versiones y Alias

*(Esta sección no cambia. Sigue el mismo proceso para crear una versión inmutable y un alias de `Produccion` para apuntar a ella, asegurando un ciclo de despliegue seguro).*

¡Felicidades! Has construido un orquestador de IA verdaderamente avanzado, capaz de entender y responder a los usuarios en su propio idioma, manteniendo al mismo tiempo una lógica de negocio centralizada y fácil de mantener.
