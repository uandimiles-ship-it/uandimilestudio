param(
  [string]$Source = "$PSScriptRoot\..\public\brand\uandi-studio-logo-source.png"
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

# Optical center: logo art reads slightly left; nudge right by this fraction of canvas width.
$script:OffsetXRatio = 0.018

function New-InvertImageAttributes {
  $matrix = New-Object System.Drawing.Imaging.ColorMatrix
  $matrix.Matrix00 = -1
  $matrix.Matrix11 = -1
  $matrix.Matrix22 = -1
  $matrix.Matrix33 = 1
  $matrix.Matrix40 = 1
  $matrix.Matrix41 = 1
  $matrix.Matrix42 = 1
  $attrs = New-Object System.Drawing.Imaging.ImageAttributes
  $attrs.SetColorMatrix($matrix)
  return $attrs
}

function Draw-InvertedLogoContain {
  param(
    [System.Drawing.Graphics]$G,
    [System.Drawing.Image]$Src,
    [int]$CanvasW,
    [int]$CanvasH,
    [double]$Fill,
    [double]$OffsetXRatio
  )
  $maxSide = [Math]::Min($CanvasW, $CanvasH) * $Fill
  $scale = [Math]::Min($maxSide / $Src.Width, $maxSide / $Src.Height)
  $w = [int][Math]::Round($Src.Width * $scale)
  $h = [int][Math]::Round($Src.Height * $scale)
  $offsetX = [int][Math]::Round($CanvasW * $OffsetXRatio)
  $x = [int][Math]::Floor(($CanvasW - $w) / 2) + $offsetX
  $y = [int][Math]::Floor(($CanvasH - $h) / 2)

  $attrs = New-InvertImageAttributes
  $destRect = New-Object System.Drawing.Rectangle $x, $y, $w, $h
  $G.DrawImage(
    $Src,
    $destRect,
    0,
    0,
    $Src.Width,
    $Src.Height,
    [System.Drawing.GraphicsUnit]::Pixel,
    $attrs
  )
  $attrs.Dispose()
}

function Save-PngCanvas {
  param(
    [System.Drawing.Image]$Src,
    [string]$Dest,
    [int]$Width,
    [int]$Height,
    [double]$Fill,
    [double]$OffsetXRatio = $script:OffsetXRatio
  )
  $bmp = New-Object System.Drawing.Bitmap $Width, $Height
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $g.Clear([System.Drawing.Color]::White)
  Draw-InvertedLogoContain $g $Src $Width $Height $Fill $OffsetXRatio
  $g.Dispose()

  $dir = Split-Path $Dest -Parent
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  $bmp.Save($Dest, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

function Save-SquarePngContain {
  param(
    [System.Drawing.Image]$Src,
    [string]$Dest,
    [int]$Size,
    [double]$Fill = 1.0,
    [double]$OffsetXRatio = $script:OffsetXRatio
  )
  Save-PngCanvas $Src $Dest $Size $Size $Fill $OffsetXRatio
}

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$public = Join-Path $root 'public'
$androidRes = Join-Path $root 'android\app\src\main\res'

if (-not (Test-Path $Source)) { throw "Source not found: $Source" }
$srcImg = [System.Drawing.Image]::FromFile((Resolve-Path $Source).Path)

# In-app header + shared brand asset
Save-SquarePngContain $srcImg (Join-Path $public 'brand\uandi-studio-logo.png') 512 0.84

# Web / PWA
Save-SquarePngContain $srcImg (Join-Path $public 'favicon-32.png') 32 0.82
Save-SquarePngContain $srcImg (Join-Path $public 'apple-touch-icon.png') 180 0.76
Save-SquarePngContain $srcImg (Join-Path $public 'pwa-icon-192.png') 192 0.76
Save-SquarePngContain $srcImg (Join-Path $public 'pwa-icon-512.png') 512 0.76

$densities = @{
  'mipmap-mdpi'    = @{ launcher = 48;  foreground = 108 }
  'mipmap-hdpi'    = @{ launcher = 72;  foreground = 162 }
  'mipmap-xhdpi'   = @{ launcher = 96;  foreground = 216 }
  'mipmap-xxhdpi'  = @{ launcher = 144; foreground = 324 }
  'mipmap-xxxhdpi' = @{ launcher = 192; foreground = 432 }
}

foreach ($folder in $densities.Keys) {
  $sizes = $densities[$folder]
  $base = Join-Path $androidRes $folder
  Save-SquarePngContain $srcImg (Join-Path $base 'ic_launcher.png') $sizes.launcher 0.72
  Save-SquarePngContain $srcImg (Join-Path $base 'ic_launcher_round.png') $sizes.launcher 0.66
  Save-SquarePngContain $srcImg (Join-Path $base 'ic_launcher_foreground.png') $sizes.foreground 0.48
}

# Portfolio thumbnails (16:9) — same logo scale as header (0.84 of short side)
Save-PngCanvas $srcImg (Join-Path $public 'thumbnails\work-1-uandi-studio.png') 1600 900 0.84
Save-PngCanvas $srcImg (Join-Path $public 'thumbnails\work-2-uandi-studio.png') 1600 900 0.84
Save-PngCanvas $srcImg (Join-Path $public 'thumbnails\work-3-uandi-studio.png') 1600 900 0.84

$srcImg.Dispose()
Write-Host 'Brand icons + work thumbnails generated (black on white).'
