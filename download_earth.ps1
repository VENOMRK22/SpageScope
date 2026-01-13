$ErrorActionPreference = "Stop"

$destDir = "public/images/earth-scan"
if (-not (Test-Path -Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir | Out-Null
    Write-Host "Created directory: $destDir"
}

# Image Map (High Availability Wikimedia Asset)
$images = @{
    "earth_americas.png"      = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Blue_Marble_2002.png/1024px-Blue_Marble_2002.png"
    "earth_africa_europe.png" = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/1024px-The_Earth_seen_from_Apollo_17.jpg"
    "earth_asia.png"          = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Whole_world_-_land_and_oceans_12000.jpg/1024px-Whole_world_-_land_and_oceans_12000.jpg" 
    "earth_pacific.png"       = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Earth_Eastern_Hemisphere.jpg/1024px-Earth_Eastern_Hemisphere.jpg"
}

# Note: Some are JPGs on server but saving as PNG for consistency if needed, 
# or I'll just save them with their valid extensions and update code.
# Let's save them as their actual types and just handle it in code.

$imagesCorrect = @{
    "earth_americas.png"      = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Blue_Marble_2002.png/1024px-Blue_Marble_2002.png"
    "earth_africa.jpg"        = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/1024px-The_Earth_seen_from_Apollo_17.jpg"
    "earth_asia.jpg"          = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Earth_Eastern_Hemisphere.jpg/1024px-Earth_Eastern_Hemisphere.jpg"
    "earth_pacific.jpg"       = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Earth_Western_Hemisphere.jpg/1024px-Earth_Western_Hemisphere.jpg"
}

foreach ($key in $imagesCorrect.Keys) {
    $url = $imagesCorrect[$key]
    $output = Join-Path $destDir $key
    
    Write-Host "Downloading $key..."
    try {
        Invoke-WebRequest -Uri $url -OutFile $output -UserAgent "Mozilla/5.0"
        Write-Host "  -> Success" -ForegroundColor Green
    } catch {
        Write-Error "Failed to download $key from $url : $_"
    }
}
