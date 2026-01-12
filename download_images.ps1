$ErrorActionPreference = "Stop"

# Create Directory
$destDir = "public/images/deep-field"
if (-not (Test-Path -Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir | Out-Null
    Write-Host "Created directory: $destDir"
}

# Image Map (NASA Asset Library - Medium Quality)
$images = @{
    "orion.jpg"      = "https://images-assets.nasa.gov/image/PIA08653/PIA08653~medium.jpg"
    "m101.jpg"       = "https://images-assets.nasa.gov/image/PIA23641/PIA23641~medium.jpg"
    "carina.jpg"     = "https://images-assets.nasa.gov/image/PIA12196/PIA12196~medium.jpg"
    "milkyway.jpg"   = "https://images-assets.nasa.gov/image/PIA15416/PIA15416~medium.jpg" # Using Andromeda as placeholder for generic galaxy if needed, but labeling as milkyway for file
    "saturn.jpg"     = "https://images-assets.nasa.gov/image/PIA14922/PIA14922~medium.jpg"
    "mars.jpg"       = "https://images-assets.nasa.gov/image/PIA00407/PIA00407~medium.jpg"
    "pillars.jpg"    = "https://images-assets.nasa.gov/image/PIA19154/PIA19154~medium.jpg"
    "hubble.jpg"     = "https://images-assets.nasa.gov/image/PIA23645/PIA23645~medium.jpg"
    "jupiter.jpg"    = "https://images-assets.nasa.gov/image/PIA22946/PIA22946~medium.jpg"
    "andromeda.jpg"  = "https://images-assets.nasa.gov/image/PIA15416/PIA15416~medium.jpg"
}

# Download Loop
foreach ($key in $images.Keys) {
    $url = $images[$key]
    $output = Join-Path $destDir $key
    
    Write-Host "Downloading $key..."
    try {
        Invoke-WebRequest -Uri $url -OutFile $output -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        Write-Host "  -> Success" -ForegroundColor Green
    } catch {
        Write-Error "Failed to download $key from $url : $_"
    }
}
