# Arranca LiveKit en modo desarrollo (puerto 7880).
# Orden: binario local en tools/livekit → PATH → Docker → descarga automática.

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$LocalExe = Join-Path $Root "tools\livekit\livekit-server.exe"
$DownloadUrl = "https://github.com/livekit/livekit/releases/download/v1.13.11/livekit_1.13.11_windows_amd64.zip"

function Test-Port([int]$Port) {
  try {
    $c = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    return $null -ne $c
  } catch {
    return $false
  }
}

function Start-LocalExe([string]$Exe) {
  Write-Host "Levantando $Exe --dev ..."
  Start-Process -FilePath $Exe -ArgumentList "--dev","--bind","0.0.0.0" -WindowStyle Minimized
  Start-Sleep -Seconds 2
  if (Test-Port 7880) {
    Write-Host "OK: ws://localhost:7880 (API key/secret: devkey / secret)"
    exit 0
  }
  Write-Host "Aviso: proceso lanzado pero :7880 aun no responde. Espera unos segundos."
  exit 0
}

if (Test-Port 7880) {
  Write-Host "LiveKit ya escucha en :7880"
  exit 0
}

if (Test-Path $LocalExe) {
  Start-LocalExe $LocalExe
}

$lk = Get-Command livekit-server -ErrorAction SilentlyContinue
if ($lk) {
  Start-LocalExe $lk.Source
}

$docker = Get-Command docker -ErrorAction SilentlyContinue
if ($docker) {
  Write-Host "Levantando LiveKit con Docker..."
  docker run --rm -d --name ludo-livekit `
    -p 7880:7880 -p 7881:7881 -p 7882:7882/udp `
    livekit/livekit-server:latest `
    --dev --bind 0.0.0.0
  Write-Host "OK: ws://localhost:7880 (API key/secret: devkey / secret)"
  exit 0
}

Write-Host "Descargando livekit-server a tools\livekit ..."
$tools = Join-Path $Root "tools\livekit"
New-Item -ItemType Directory -Force -Path $tools | Out-Null
$zip = Join-Path $tools "livekit.zip"
Invoke-WebRequest -Uri $DownloadUrl -OutFile $zip -UseBasicParsing
Expand-Archive -Path $zip -DestinationPath $tools -Force
if (-not (Test-Path $LocalExe)) {
  Write-Host "No se encontro livekit-server.exe tras la descarga."
  exit 1
}
Start-LocalExe $LocalExe
