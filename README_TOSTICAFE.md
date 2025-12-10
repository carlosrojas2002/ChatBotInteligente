# TostiCafé Chatbot - Instrucciones de Despliegue

Este proyecto ha sido replicado y personalizado para **TostiCafé** a partir de una base existente.

## Estado Actual
1.  **Código Replicado**: Todo el código backend/frontend está en `d:\ChatBotInteligente`.
2.  **Bot de Lex**: Se creó un nuevo bot con ID: `X2LPJ7ULSY`.
3.  **Personalización**: El cerebro del bot se ha configurado para actuar como el asistente de TostiCafé.
4.  **Frontend**: Compilado y listo en `frontend/dist`.

## Pasos para Finalizar
Debido a restricciones de seguridad en tu entorno AWS (CloudFormation Hooks), el despliegue automático se detuvo. Para finalizar:

1.  **Desplegar Infraestructura**:
    Intenta desplegar nuevamente asegurando que tu usuario tiene permisos para crear Stacks sin validaciones de hooks restrictivas.
    ```powershell
    # Opción 1: Usando credenciales de perfil default
    powershell -ExecutionPolicy Bypass -Command "npx cdk deploy --all --profile default"
    ```
    
2.  **Configurar Frontend**:
    Una vez obtengas el `WebSocketEndpoint` del despliegue exitoso:
    - Edita `frontend/.env.production` (o el archivo de config correspondiente) con la nueva URL wss://...
    - Recompila el frontend:
      ```cmd
      cd frontend && npm run build
      ```

3.  **Subir Frontend**:
    Sube los archivos estáticos al bucket S3 creado (busca el nombre en los outputs del deploy, ej: `chatbot-inteligente-frontend-...`):
    ```powershell
    aws s3 sync frontend/dist s3://<NOMBRE_DEL_BUCKET>
    ```

## Recursos
- **Bot ID**: `X2LPJ7ULSY`
- **Region**: `us-east-1`
