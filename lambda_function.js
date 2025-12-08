/**
 * CÓDIGO COMPLETO PARA AWS LAMBDA (Node.js) - ORQUESTADOR DE INTENTS
 *
 * Este código se conecta a un bot de Amazon Lex V2 y maneja la lógica para
 * todos los intents de la cafetería:
 * - Bienvenida
 * - RealizarPedido
 * - CancelarPedido
 * - ConsultarEstadoPedido
 * - Despedida
 */

// --- Funciones Auxiliares para Construir Respuestas ---

function close(sessionAttributes, fulfillmentState, message) {
    return {
        sessionState: {
            sessionAttributes,
            dialogAction: {
                type: 'Close',
            },
        },
        messages: [message],
    };
}

function delegate(sessionAttributes, slots) {
    return {
        sessionState: {
            sessionAttributes,
            dialogAction: {
                type: 'Delegate',
            },
            intent: {
                name: 'RealizarPedido', // Hardcoded a RealizarPedido ya que es el único que delega
                slots,
            },
        },
    };
}

// --- Lógica para cada Intent ---

async function bienvenida(intentRequest) {
    const message = { contentType: 'PlainText', content: '¡Hola! Bienvenido a nuestra cafetería. Puedes hacer un pedido, cancelarlo o consultar su estado.' };
    return close({}, 'Fulfilled', message);
}

async function realizarPedido(intentRequest) {
    const slots = intentRequest.sessionState.intent.slots;
    const tipoBebida = slots.TipoBebida ? slots.TipoBebida.value.interpretedValue : null;
    const tamaño = slots.Tamaño ? slots.Tamaño.value.interpretedValue : null;
    // CORRECCIÓN: Usar resolvedValues para manejo multilingüe de AMAZON.YesNo
    const conLeche = slots.Leche ? slots.Leche.value.resolvedValues[0] : null;

    // Si Lex nos llama para validación (DialogCodeHook)
    if (intentRequest.invocationSource === 'DialogCodeHook') {
        // Lógica de validación
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
        // Si todo está bien, delegamos para que Lex continúe pidiendo los slots que falten
        return delegate({}, slots);
    }

    // --- Lógica de Fulfillment (cuando ya tenemos todos los datos) ---
    let confirmacion = `¡Pedido confirmado! Has ordenado un ${tipoBebida} tamaño ${tamaño}`;
    // CORRECCIÓN: Comprobar el valor booleano 'true' en lugar de 'yes'
    if (conLeche === 'true') {
        confirmacion += ' con leche.';
    } else {
        confirmacion += ' sin leche.';
    }

    const orderId = Math.floor(Math.random() * 10000); // Generar un ID de pedido de ejemplo
    const sessionAttributes = {
        lastOrderId: orderId.toString()
    };

    confirmacion += ` Tu número de pedido es ${orderId}.`;

    const finalMessage = { contentType: 'PlainText', content: confirmacion };
    return close(sessionAttributes, 'Fulfilled', finalMessage);
}

async function cancelarPedido(intentRequest) {
    // En un caso real, aquí iría la lógica para buscar y cancelar el pedido en la base de datos.
    const message = { contentType: 'PlainText', content: 'Tu pedido ha sido cancelado. ¿Hay algo más en lo que pueda ayudarte?' };
    return close({}, 'Fulfilled', message);
}

async function consultarEstadoPedido(intentRequest) {
    const sessionAttributes = intentRequest.sessionState.sessionAttributes || {};
    const lastOrderId = sessionAttributes.lastOrderId;

    let messageContent;
    if (lastOrderId) {
        // En un caso real, se consultaría el estado del pedido `lastOrderId`.
        messageContent = `El estado de tu último pedido (${lastOrderId}) es: En preparación. ¡Estará listo en un par de minutos!`;
    } else {
        messageContent = 'No tengo un número de pedido reciente para consultar. ¿Quieres hacer un nuevo pedido?';
    }

    const message = { contentType: 'PlainText', content: messageContent };
    return close(sessionAttributes, 'Fulfilled', message);
}

async function despedida(intentRequest) {
    const message = { contentType: 'PlainText', content: '¡Gracias por tu visita! Que tengas un buen día.' };
    return close({}, 'Fulfilled', message);
}


// --- Función principal de enrutamiento (Dispatch) ---

async function dispatch(intentRequest) {
    console.log(`Petición recibida para el intent: ${intentRequest.sessionState.intent.name}`);
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
            throw new Error(`El intent ${intentName} no es válido.`);
    }
}

// --- Handler principal de la Lambda ---

exports.handler = async (event) => {
    console.log("Evento de Lex recibido:", JSON.stringify(event, null, 2));
    try {
        const response = await dispatch(event);
        return response;
    } catch (e) {
        console.error(e);
        return close(event.sessionState.intent.name, {}, 'Failed', {
            contentType: 'PlainText',
            content: 'Lo siento, ha ocurrido un error al procesar tu solicitud.',
        });
    }
};
