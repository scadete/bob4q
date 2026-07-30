# Check all prerequisites for the bob4q workshop (local mode).
# Exits with code 0 if all pass, 1 if any are missing.
# Called automatically from setup.ps1.

$allOk = $true

function Check-Tool {
    param (
        [string]$Name,
        [string]$Cmd,
        [string]$VersionFlag,
        [string]$InstallUrl
    )
    if (Get-Command $Cmd -ErrorAction SilentlyContinue) {
        $ver = & $Cmd $VersionFlag 2>&1 | Select-Object -First 1
        Write-Host ("  [OK]  {0,-20} {1}" -f $Name, $ver)
    } else {
        Write-Host ("  [!!]  {0,-20} NOT FOUND  -> Install: {1}" -f $Name, $InstallUrl)
        $script:allOk = $false
    }
}

Write-Host ""
Write-Host "==============================="
Write-Host "  bob4q -- Prerequisites Check"
Write-Host "==============================="
Write-Host ""

Check-Tool "Node.js (>=20)"  "node"    "--version"  "https://nodejs.org"
Check-Tool "pnpm (>=9)"      "pnpm"    "--version"  "https://pnpm.io/installation"
Check-Tool "Python (>=3.11)" "python"  "--version"  "https://python.org/downloads"
Check-Tool "uv"              "uv"      "--version"  "https://docs.astral.sh/uv/getting-started/installation/"
Check-Tool "Ollama"          "ollama"  "--version"  "https://ollama.com/download"

# Podman or Docker
if (Get-Command podman -ErrorAction SilentlyContinue) {
    $ver = podman --version 2>&1 | Select-Object -First 1
    Write-Host ("  [OK]  {0,-20} {1}" -f "Podman", $ver)
} elseif (Get-Command docker -ErrorAction SilentlyContinue) {
    $ver = docker --version 2>&1 | Select-Object -First 1
    Write-Host ("  [OK]  {0,-20} {1}" -f "Docker", $ver)
} else {
    Write-Host ("  [!!]  {0,-20} NOT FOUND  -> Install: {1}" -f "Podman / Docker", "https://podman-desktop.io")
    $allOk = $false
}

Write-Host ""
if ($allOk) {
    Write-Host "All prerequisites satisfied."
    exit 0
} else {
    Write-Host "One or more prerequisites are missing. Install them and re-run this script."
    exit 1
}
