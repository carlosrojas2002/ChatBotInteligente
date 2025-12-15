# 🎓 DOCUMENTO MAESTRO DE SUSTENTACIÓN: ARQUITECTURA TÉCNICA
> **Nivel de Detalle:** Experto / Arquitecto de Soluciones
> **Objetivo:** Responder "Por qué" y "Cómo" a cualquier pregunta técnica sobre la configuración del proyecto.

Este documento está redactado en primera persona para que lo estudies y lo apropies. **Tú** tomaste estas decisiones.

---

## 🏛️ CAPÍTULO 1: FILOSOFÍA DE ARQUITECTURA

**"Decidí construir una arquitectura 100% Serverless basada en eventos."**

**¿Por qué?**
1.  **Costos:** No quería pagar por servidores inactivos (EC2). Con Lambda y DynamoDB "On-Demand", TostiCafé paga $0 si nadie chatea.
2.  **Escalabilidad:** Si 1000 personas piden café a la vez el día de la madre, AWS escala automáticamente las Lambdas. Yo no tengo que configurar balanceadores de carga.
3.  **Mantenimiento:** No tengo que parchear sistemas operativos ni gestionar seguridad de red a bajo nivel.

---

## 💾 CAPÍTULO 2: LA MEMORIA (DYNAMODB)
*Referencia: `infrastructure/lib/stacks/database-stack.ts`*

Para la persistencia de datos, elegí **Amazon DynamoDB** (NoSQL) sobre una base de datos relacional (SQL).

### ¿Cómo la configuré?
Creé 3 tablas específicas con patrones de acceso definidos.

#### 1. Tabla `ChatbotConversations` (Historial)
*   **Partition Key (PK):** `sessionId` (String).
    *   *Razón:* Necesito buscar chats por su ID único de sesión instantáneamente.
*   **Billing Mode:** `PAY_PER_REQUEST`.
    *   *Razón:* El tráfico es impredecible. No quería aprovisionar capacidad y pagar de más.
*   **TTL (Time To Live):** Configuré un atributo `TTL` para que los mensajes de hace meses se borren solos.
    *   *Argumento:* Esto ahorra costos de almacenamiento automáticamente sin scripts de limpieza.

#### 2. Índices Secundarios Globales (GSI)
*   **GSI `UserIdIndex`:** 
    *   *Configuración:* PK=`userId`, SK=`createdAt`.
    *   *Razón:* Me permite responder a la pregunta: *"Dame todos los chats de este usuario específico ordenados por fecha"*, sin escanear toda la tabla (lo cual sería lento y caro).

---

## 🧠 CAPÍTULO 3: EL CEREBRO (AWS LAMBDA)
*Referencia: `infrastructure/lib/stacks/lambda-stack.ts`*

Toda la lógica vive en funciones Python 3.11.

### Mis Configuraciones de Lambda
1.  **Orquestador (`ChatbotOrchestrator`):**
    *   **Memoria:** `256 MB`.
        *   *Razón:* Aunque el código es ligero, necesitamos un poco más de RAM para inicializar rápido los clientes de boto3 (AWS SDK) y reducir la latencia ("cold starts").
    *   **Timeout:** `30 segundos`.
        *   *Razón:* Las llamadas a IA Generativa (Bedrock) pueden tardar. 3 segundos (default) no eran suficientes.
    *   **Variables de Entorno:**
        *   `LOG_LEVEL`: Configurado dinámicamente para bajar la verbosidad en producción y ahorrar costos de CloudWatch.

### Layers (Capas) Compartidas
*   **Decisión:** Creé un `SharedLayer` con las dependencias de Python.
*   **Razón:** En lugar de empaquetar las mismas librerías en cada función Lambda (lo que hace los despliegues lentos), las puse en una capa común que todas las funciones reutilizan.

---

## 🗣️ CAPÍTULO 4: LA INTELIGENCIA ARTIFICIAL (NLP PIPELINE)
*Referencia: `backend/src/handlers/orchestrator/handler.py`*

Aquí está la "magia". Diseñé un pipeline de 5 pasos para procesar cada mensaje. Explicación técnica del flujo:

1.  **Detección de Idioma (Amazon Comprehend):**
    *   *Código:* `comprehend_client.detect_language(text)`
    *   *Lógica:* Antes de nada, necesito saber si me hablan en Español, Inglés o Portugués para adaptar todo el flujo.

2.  **Análisis de Sentimiento (Amazon Comprehend):**
    *   *Código:* `detect_sentiment(text)`
    *   *Uso:* Si detecto `NEGATIVE`, inyecto una instrucción al prompt del LLM: *"El usuario está molesto, sé empático"*. Esto mejora la atención al cliente.

3.  **Clasificación de Intención (Amazon Lex V2):**
    *   *Rol:* Es el "Enrutador". Determina QUÉ quiere el usuario (ej: `OrderIntent`, `PriceQuery`).
    *   *Configuración:* Si el idioma no es español, uso **Amazon Translate** para traducir el mensaje antes de enviarlo a Lex (ya que mi bot base está en español). Esto me ahorra crear 3 bots diferentes.

4.  **Generación de Respuesta (Amazon Bedrock + Claude 3 Haiku):**
    *   *Modelo:* Elegí **Claude 3 Haiku**.
    *   *Razón:* Es el modelo más rápido y barato de la familia Claude, perfecto para chats en tiempo real. No necesito la potencia (y lentitud) de Opus o Sonnet para tomar pedidos de café.
    *   **Ingeniería de Prompts:** Construyo un contexto dinámico que incluye:
        *   Últimos 5 mensajes el chat (sacados de DynamoDB).
        *   Sentimiento detectado.
        *   Datos del negocio (Menú, horarios).

---

## 🔌 CAPÍTULO 5: CONECTIVIDAD (API GATEWAY WEBSOCKET)
*Referencia: `infrastructure/lib/stacks/api-stack.ts`*

No usé REST API, usé **WebSocket API**.

*   **¿Por qué?** REST es unidireccional (El cliente pregunta, el servidor responde). WebSocket es bidireccional y persistente.
*   **Rutas configuradas:**
    *   `$connect` / `$disconnect`: Manejan el ciclo de vida de la conexión y registran eventos de analítica.
    *   `sendMessage`: La ruta default donde viaja el payload JSON con el mensaje del usuario.

---

## 🛠️ CAPÍTULO 6: INFRAESTRUCTURA COMO CÓDIGO (CDK)

Si te preguntan: *"¿Cómo despliegas esto?"*

**Respuesta:** "No toco la consola de AWS manualmente. Todo está definido en TypeScript usando AWS CDK."

**Comandos que uso:**
1.  `cdk synth`: Comprueba mi código y genera la plantilla CloudFormation (traduce TypeScript a JSON de AWS).
2.  `cdk deploy --all`: AWS lee esa plantilla y crea/actualiza los recursos en paralelo.
3.  `cdk diff`: Antes de desplegar, uso este comando para ver qué va a cambiar (seguridad).

---

## 🛡️ DEFENSA DE SEGURIDAD (IAM)

Apliqué el principio de **"Mínimo Privilegio"**:

*   A la función Lambda no le di `AdministratorAccess`.
*   Le di permisos granulares explícitos:
    *   `dynamodb:PutItem` solo en la tabla `Conversations`.
    *   `bedrock:InvokeModel` solo para el modelo Claude.
    *   Esto asegura que si hackean la Lambda, no pueden borrar mis bases de datos ni minar bitcoins.
