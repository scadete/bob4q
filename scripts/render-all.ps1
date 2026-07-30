# Render all Manim scenes at high quality and copy to frontend/public/videos/.
# Run from the repo root: .\scripts\render-all.ps1

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$ManicDir = Join-Path $RepoRoot "manim"
$VideosOut = Join-Path $RepoRoot "frontend\public\videos"

if (-not (Test-Path $VideosOut)) {
    New-Item -ItemType Directory -Path $VideosOut -Force | Out-Null
}

$Scenes = @(
    @{ File = "qubit.py";         Class = "QubitScene";         Out = "qubit.mp4" }
    @{ File = "superposition.py"; Class = "SuperpositionScene"; Out = "superposition.mp4" }
    @{ File = "entanglement.py";  Class = "EntanglementScene";  Out = "entanglement.mp4" }
)

Push-Location $ManicDir

foreach ($s in $Scenes) {
    Write-Host "==> Rendering $($s.Class) from $($s.File) ..."
    uv run manim render "scenes/$($s.File)" $s.Class -qh

    $stem = [System.IO.Path]::GetFileNameWithoutExtension($s.File)
    $rendered = Get-ChildItem -Path "media\videos\$stem" -Filter "$($s.Class).mp4" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1

    if ($null -eq $rendered) {
        Write-Warning "  Rendered file not found for $($s.Class)"
    } else {
        Copy-Item $rendered.FullName (Join-Path $VideosOut $s.Out) -Force
        Write-Host "  Copied to $VideosOut\$($s.Out)"
    }
}

Pop-Location

Write-Host ""
Write-Host "All scenes rendered. Videos in $VideosOut"
