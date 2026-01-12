$ErrorActionPreference = "Stop"

$src = "C:\Users\ranji\.gemini\antigravity\brain\af287fa9-c28c-4ab0-a3a9-438343e9ed09"
$dest = "public\images\deep-field"

# Create destination if missing
if (-not (Test-Path -Path $dest)) {
    New-Item -ItemType Directory -Path $dest | Out-Null
    Write-Host "Created directory: $dest"
}

# Mapping of search pattern -> target filename
$map = @{
    "orion_nebula*.png"         = "orion.png"
    "spiral_galaxy_m101*.png"   = "m101.png"
    "carina_nebula*.png"        = "carina.png"
    "milky_way_core*.png"       = "milkyway.png"
    "saturn_rings*.png"         = "saturn.png"
    "mars_surface*.png"         = "mars.png"
    "pillars_of_creation*.png"  = "pillars.png"
    "hubble_deep_field*.png"    = "hubble.png"
    "jupiter_storms*.png"       = "jupiter.png"
    "andromeda_galaxy*.png"     = "andromeda.png"
}

foreach ($pattern in $map.Keys) {
    $targetName = $map[$pattern]
    # Find the most recent file matching the pattern
    $files = Get-ChildItem -Path $src -Filter $pattern | Sort-Object LastWriteTime -Descending
    
    if ($files) {
        $file = $files[0]
        $destPath = Join-Path $dest $targetName
        Write-Host "Moving $($file.Name) to $targetName"
        Copy-Item -Path $file.FullName -Destination $destPath -Force
    } else {
        Write-Warning "No file found for pattern: $pattern"
    }
}
