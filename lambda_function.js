/**
 * CÓDIGO COMPLETO PARA AWS LAMBDA (Node.js) - ORQUESTADOR INTELIGENTE CON IA
 *
 * Este código actúa como el cerebro central del chatbot, integrando:
 * - Amazon Lex: Para la conversación.
 * - Amazon Comprehend: Para detectar el idioma del usuario.
 * - Amazon Translate: Para traducir las respuestas del bot en tiempo real.
 *
 * Flujo de trabajo:
 * 1. Recibe la solicitud de Lex.
 * 2. Usa Comprehend para detectar el idioma del input del usuario.
 * 3. Ejecuta la lógica del intent correspondiente (siempre en español).
 * 4. Si el idioma del usuario no es español, usa Translate para traducir la respuesta.
 * 5. Devuelve la respuesta (traducida si es necesario) a Lex.
 */

// Importar los clientes de los servicios de AWS SDK v3
import { ComprehendClient, DetectDominantLanguageCommand } from "@aws-sdk/client-comprehend";
import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate";

// Instanciar los clientes
const comprehendClient = new ComprehendClient({ region: process.env.AWS_REGION });
const translateClient = new TranslateClient({ region: process.env.AWS_REGION });

// --- Funciones Auxiliares para Construir Respuestas ---

function close(sessionAttributes, fulfillmentState, message) {
    return {
        sessionState: {
            sessionAttributes,
            dialogAction: { type: 'Close' },
        },
        messages: [message],
    };
}

function delegate(sessionAttributes, slots) {
    return {
        sessionState: {
            sessionAttributes,
            dialogAction: { type: 'Delegate' },
            intent: {
                name: 'RealizarPedido',
                slots,
            },
        },
    };
}

// --- Lógica para cada Intent (las respuestas se escriben en Español) ---

async function realizarPedido(intentRequest) {
    const slots = intentRequest.sessionState.intent.slots;
    const tipoBebida = slots.TipoBebida ? slots.TipoBebida.value.interpretedValue : null;
    const tamaño = slots.Tamaño ? slots.Tamaño.value.interpretedValue : null;
    const conLeche = slots.Leche ? slots.Leche.value.resolvedValues[0] : null;

    if (intentRequest.invocationSource === 'DialogCodeHook') {
        if (tipoBebida === 'Espresso' && tamaño === 'Grande') {
            const validationError = { contentType: 'PlainText', content: 'Lo siento, no ofrecemos Espressos en tamaño grande. Por favor, elige pequeño o mediano.' };
            return {
                sessionState: {
                    dialogAction: { type: 'ElicitSlot', slotToElicit: 'Tamaño' },
                    intent: intentRequest.sessionState.intent,
                },
                messages: [validationError],
            };
        }
        return delegate(intentRequest.sessionState.sessionAttributes || {}, slots);
    }

    let confirmacion = `¡Pedido confirmado! Has ordenado un ${tipoBebida} tamaño ${tamaño}`;
    if (conLeche === 'Yes') {
        confirmacion += ' con leche.';
    } else {
        confirmacion += ' sin leche.';
    }

    const orderId = Math.floor(Math.random() * 10000);
    const sessionAttributes = { lastOrderId: orderId.toString() };
    confirmacion += ` Tu número de pedido es ${orderId}.`;

    const finalMessage = { contentType: 'PlainText', content: confirmacion };
    return close(sessionAttributes, 'Fulfilled', finalMessage);
}

async function consultarEstadoPedido(intentRequest) {
    const sessionAttributes = intentRequest.sessionState.sessionAttributes || {};
    const lastOrderId = sessionAttributes.lastOrderId;

    let messageContent = lastOrderId
        ? `El estado de tu último pedido (${lastOrderId}) es: En preparación. ¡Estará listo en un par de minutos!`
        : 'No tengo un número de pedido reciente para consultar. ¿Quieres hacer un nuevo pedido?';

    const message = { contentType: 'PlainText', content: messageContent };
    return close(sessionAttributes, 'Fulfilled', message);
}

async function bienvenida(intentRequest) {
    const message = { contentType: 'PlainText', content: '¡Hola! Bienvenido a nuestra cafetería. Puedes pedir un café, cancelar un pedido o consultar el estado de tu orden.' };
    return close({}, 'Fulfilled', message);
}

async function cancelarPedido(intentRequest) {
    const message = { contentType: 'PlainText', content: 'Tu pedido ha sido cancelado. ¿Necesitas algo más?' };
    return close({}, 'Fulfilled', message);
}

async function despedida(intentRequest) {
    const message = { contentType: 'PlainText', content: '¡Gracias por tu visita, que tengas un excelente día!' };
    return close({}, 'Fulfilled', message);
}

// --- Función principal de enrutamiento (Dispatch) ---

async function dispatch(intentRequest) {
    const intentName = intentRequest.sessionState.intent.name;

    switch(intentName) {
        case 'Bienvenida':
            return bienvenida(intentRequest);
        case 'RealizarPedido':
            return realizarPedido(intentRequest);
        case 'CancelarPedido':
            return cancelarPedido(intentRequest);
        case 'ConsultarEstadoPedido':
            return consultarEstadoPedido(intentRequest);
        case 'Despedida':
            return despedida(intentRequest);
        default:
            throw new Error(`El intent con el nombre ${intentName} no tiene un manejador.`);
    }
}

// --- Handler principal de la Lambda ---

export const handler = async (event) => {
    console.log("Evento de Lex recibido:", JSON.stringify(event, null, 2));

    try {
        // 1. Detectar el idioma del usuario con Comprehend
        const inputText = event.inputTranscript || ' ';
        const comprehendCommand = new DetectDominantLanguageCommand({ Text: inputText });
        const comprehendResponse = await comprehendClient.send(comprehendCommand);
        const detectedLanguageCode = comprehendResponse.Languages[0]?.LanguageCode || 'es';
        console.log(`Idioma detectado: ${detectedLanguageCode}`);

        // 2. Ejecutar la lógica principal del bot (siempre en español)
        let response = await dispatch(event);

        // 3. Traducir la respuesta si el idioma detectado no es español
        if (detectedLanguageCode !== 'es' && response.messages && response.messages.length > 0) {
            const messageToTranslate = response.messages[0].content;

            console.log(`Traduciendo de 'es' a '${detectedLanguageCode}': "${messageToTranslate}"`);

            const translateCommand = new TranslateTextCommand({
                Text: messageToTranslate,
                SourceLanguageCode: 'es',
                TargetLanguageCode: detectedLanguageCode,
            });
            const translateResponse = await translateClient.send(translateCommand);

            // Reemplazar el contenido del mensaje con el texto traducido
            response.messages[0].content = translateResponse.TranslatedText;
        }

        console.log("Respuesta final enviada a Lex:", JSON.stringify(response, null, 2));
        return response;

    } catch (e) {
        console.error(e);
        return close({}, 'Failed', {
            contentType: 'PlainText',
            content: 'Lo siento, ha ocurrido un error al procesar tu solicitud.',
        });
    }
};
