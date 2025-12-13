# Script para limpiar procesos y locks de todos los proyectos mesalib

Write-Host "=== Buscando proyectos mesalib ===" -ForegroundColor Cyan

$mesalibProjects = @(
    "C:\Users\victo\MESALIB\mesalib",
    "C:\Users\victo\OneDrive\Documentos\mesalib-next",
    "C:\Users\victo\OneDrive\Escritorio\mesalib",
    "C:\Users\victo\OneDrive\Escritorio\Adobe\mesalib",
    "C:\Users\victo\OneDrive\Escritorio\Adobe\mesalib\mesalib-project"
)

foreach ($project in $mesalibProjects) {
    if (Test-Path $project) {
        $lockPath = Join-Path $project ".next\dev\lock"
        if (Test-Path $lockPath) {
            Write-Host "[LOCK ENCONTRADO] $project" -ForegroundColor Yellow
            Remove-Item $lockPath -Force -ErrorAction SilentlyContinue
            Write-Host "  -> Lock eliminado" -ForegroundColor Green
        } else {
            Write-Host "[OK] $project - Sin lock" -ForegroundColor Green
        }
    } else {
        Write-Host "[NO EXISTE] $project" -ForegroundColor Gray
    }
}

Write-Host "`n=== Deteniendo procesos Node.js ===" -ForegroundColor Cyan
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "Se detuvieron $($nodeProcesses.Count) procesos Node.js" -ForegroundColor Green
} else {
    Write-Host "No hay procesos Node.js corriendo" -ForegroundColor Green
}

Write-Host "`n=== Limpieza completada ===" -ForegroundColor Cyan

