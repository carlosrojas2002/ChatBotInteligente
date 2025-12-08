# Código de la función Lambda para el bot de Lex V2

import json
import boto3

# Inicializar los clientes de AWS
comprehend_client = boto3.client('comprehend')
translate_client = boto3.client('translate')

# --- Funciones auxiliares ---

def detect_language(text):
    """
    Detecta el idioma dominante en un texto.
    """
    try:
        response = comprehend_client.detect_dominant_language(Text=text)
        language_code = response['Languages'][0]['LanguageCode']
        return language_code
    except Exception as e:
        print(f"Error detectando el idioma: {e}")
        return 'es' # Idioma por defecto

def translate_text(text, source_language, target_language):
    """
    Traduce un texto de un idioma a otro.
    """
    try:
        response = translate_client.translate_text(
            Text=text,
            SourceLanguageCode=source_language,
            TargetLanguageCode=target_language
        )
        return response['TranslatedText']
    except Exception as e:
        print(f"Error traduciendo el texto: {e}")
        return text

def close(session_attributes, fulfillment_state, message):
    """
    Prepara la respuesta final para Lex.
    """
    response = {
        'sessionState': {
            'sessionAttributes': session_attributes,
            'dialogAction': {
                'type': 'Close',
            },
            'intent': {
                'name': session_attributes.get('currentIntent', ''),
                'state': fulfillment_state,
            },
        },
        'messages': [
            {
                'contentType': 'PlainText',
                'content': message,
            }
        ]
    }
    return response

# --- Función principal ---

def lambda_handler(event, context):
    """
    Función principal que se ejecuta cuando se invoca la Lambda.
    """
    print(f"Evento recibido: {json.dumps(event)}")

    # Obtener la entrada del usuario y el idioma
    user_input = event['inputTranscript']
    source_language = event['interpretations'][0]['intent']['confirmationState']

    # 1. Detección de idioma
    detected_language = detect_language(user_input)
    print(f"Idioma detectado: {detected_language}")

    # 2. Traducción si es necesario
    if detected_language != 'es':
        user_input = translate_text(user_input, detected_language, 'es')
        print(f"Texto traducido al español: {user_input}")

    # --- Lógica de negocio (ejemplo simple) ---

    # Aquí iría la lógica para procesar la intención del usuario.
    # Por ahora, simplemente devolvemos un mensaje de saludo.

    response_message = "¡Hola! Gracias por contactarnos."

    # 3. Traducción de la respuesta al idioma original
    if detected_language != 'es':
        response_message = translate_text(response_message, 'es', detected_language)

    # 4. Enviar la respuesta a Lex
    session_attributes = event.get('sessionState', {}).get('sessionAttributes', {})

    return close(
        session_attributes,
        'Fulfilled',
        response_message
    )
