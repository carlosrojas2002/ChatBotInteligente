import json
import boto3

# Inicializar los clientes de AWS
translate = boto3.client('translate')
comprehend = boto3.client('comprehend')

def lambda_handler(event, context):
    """
    Función principal de Lambda que se activa con un evento de Amazon Lex V2.

    Esta función orquesta las interacciones del chatbot:
    1. Recibe la entrada del usuario desde Lex.
    2. Detecta el idioma del usuario.
    3. Si el idioma no es español, traduce el texto a español.
    4. Realiza un análisis de sentimientos sobre el texto en español con Comprehend.
    5. Prepara una respuesta basada en el sentimiento detectado.
    6. Traduce la respuesta al idioma original del usuario.
    7. Devuelve la respuesta formateada a Amazon Lex.
    """

    # --- 1. Extraer datos del evento de Lex ---
    # Imprimir el evento para depuración
    print("Evento recibido de Lex:", json.dumps(event))

    # Obtener el texto de entrada del usuario y el idioma (locale)
    input_text = event.get('inputTranscript', '')
    locale_id = event['localeId']

    # Obtener el nombre del intent actual
    current_intent = event['sessionState']['intent']['name']

    print(f"Intent: {current_intent}, Idioma: {locale_id}, Texto: '{input_text}'")

    # --- 2. Manejo de multi-idioma con Amazon Translate ---
    source_language = locale_id.split('_')[0] # 'es_US' -> 'es'
    text_to_process = input_text

    # Si el idioma no es español, traducir el texto a español para el procesamiento
    if source_language != 'es':
        print(f"Traduciendo texto de '{source_language}' a 'es'")
        translation_response = translate.translate_text(
            Text=input_text,
            SourceLanguageCode=source_language,
            TargetLanguageCode='es'
        )
        text_to_process = translation_response['TranslatedText']
        print(f"Texto traducido: '{text_to_process}'")


    # --- 3. Análisis de Sentimientos con Amazon Comprehend ---
    print("Analizando sentimiento del texto...")
    sentiment_response = comprehend.detect_sentiment(
        Text=text_to_process,
        LanguageCode='es' # Analizar siempre en español
    )
    sentiment = sentiment_response['Sentiment']
    print(f"Sentimiento detectado: {sentiment}")


    # --- 4. Lógica de negocio y preparación de la respuesta ---
    # Aquí puedes añadir una lógica más compleja basada en el intent y el sentimiento.
    # Por ejemplo, si el intent es "HacerPedido" y el sentimiento es "NEGATIVO",
    # se podría escalar a un agente humano.

    response_message = ""
    if sentiment == "POSITIVE":
        response_message = "¡Qué bueno que te sientas así! ¿En qué más puedo ayudarte?"
    elif sentiment == "NEGATIVE":
        response_message = "Lamento que te sientas así. Haremos nuestro mejor esfuerzo para ayudarte. ¿Qué necesitas?"
    else: # NEUTRAL o MIXED
        response_message = "Entendido. ¿Cómo puedo asistirte?"


    # --- 5. Traducir la respuesta al idioma original del usuario ---
    final_message = response_message
    if source_language != 'es':
        print(f"Traduciendo respuesta de 'es' a '{source_language}'")
        translation_response = translate.translate_text(
            Text=response_message,
            SourceLanguageCode='es',
            TargetLanguageCode=source_language
        )
        final_message = translation_response['TranslatedText']
        print(f"Respuesta traducida: '{final_message}'")


    # --- 6. Formatear la respuesta para Amazon Lex ---
    # La estructura de la respuesta debe coincidir con lo que Lex espera.
    # Usamos 'Close' para indicar que Lex debe dar esta respuesta y cerrar la interacción.
    response = {
        "sessionState": {
            "dialogAction": {
                "type": "Close"
            },
            "intent": {
                "name": current_intent,
                "state": "Fulfilled" # Marcamos el intent como completado
            }
        },
        "messages": [
            {
                "contentType": "PlainText",
                "content": final_message
            }
        ]
    }

    print("Respuesta final para Lex:", json.dumps(response))

    return response
