
$ErrorActionPreference = "Stop"

Write-Host "Obteniendo credenciales de AWS CLI (vía archivo)..." -ForegroundColor Cyan

try {
    # Ruta del archivo de credenciales
    $credsPath = Join-Path $env:USERPROFILE ".aws\credentials"
    
    if (-not (Test-Path $credsPath)) {
        throw "No se encontró el archivo de credenciales en $credsPath. Ejecuta 'aws configure'."
    }

    # Leer archivo linea por linea
    $lines = Get-Content $credsPath
    $currentProfile = ""
    $accessKey = ""
    $secretKey = ""
    $token = ""
    
    foreach ($line in $lines) {
        $line = $line.Trim()
        if ($line -eq "" -or $line.StartsWith("#")) { continue }
        
        if ($line.StartsWith("[") -and $line.EndsWith("]")) {
            $currentProfile = $line.Substring(1, $line.Length - 2)
        } elseif ($currentProfile -eq "default") {
            if ($line -match "^aws_access_key_id\s*=\s*(.*)") {
                $accessKey = $matches[1]
            } elseif ($line -match "^aws_secret_access_key\s*=\s*(.*)") {
                $secretKey = $matches[1]
            } elseif ($line -match "^aws_session_token\s*=\s*(.*)") {
                $token = $matches[1]
            }
        }
    }
    
    # Si no hay perfil default, intentar tomar el primero que encontramos (fallback)
    if (-not $accessKey) {
        Write-Host "No se encontró perfil [default], buscando cualquier credencial..." -ForegroundColor Yellow
        foreach ($line in $lines) {
            $line = $line.Trim()
            if ($line -match "^aws_access_key_id\s*=\s*(.*)") { $accessKey = $matches[1] }
            if ($line -match "^aws_secret_access_key\s*=\s*(.*)") { $secretKey = $matches[1] }
        }
    }

    if (-not $accessKey -or -not $secretKey) {
        throw "No se pudieron encontrar credenciales válidas en $credsPath"
    }

    $env:AWS_ACCESS_KEY_ID = $accessKey
    $env:AWS_SECRET_ACCESS_KEY = $secretKey
    if ($token) {
        $env:AWS_SESSION_TOKEN = $token
    }
    
    Write-Host "Credenciales cargadas exitosamente (AccessKey termina en ...$($accessKey.Substring($accessKey.Length - 4)))." -ForegroundColor Green
    
    Write-Host "Iniciando despliegue de CDK..." -ForegroundColor Cyan
    
    # Ejecutar CDK
    cmd /c "npx cdk deploy --all --require-approval never"
    
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
}
