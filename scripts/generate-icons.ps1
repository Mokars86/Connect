Add-Type -AssemblyName System.Drawing

$srcPath = 'C:\Users\Dell\.gemini\antigravity\brain\96663eb6-c8e1-4d92-9279-a4ed7b75c14d\.user_uploaded\media_1790244752265.jpg'
if (-not (Test-Path $srcPath)) {
    Write-Error "Source image not found at $srcPath"
    exit 1
}

$srcImg = [System.Drawing.Image]::FromFile($srcPath)

function Resize-Image($img, $outPath, $width, $height, $padRatio = 1.0) {
    $destBmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($destBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    $drawW = [int]($width * $padRatio)
    $drawH = [int]($height * $padRatio)
    $drawX = [int](($width - $drawW) / 2)
    $drawY = [int](($height - $drawH) / 2)

    $g.DrawImage($img, $drawX, $drawY, $drawW, $drawH)
    $g.Dispose()

    $dir = [System.IO.Path]::GetDirectoryName($outPath)
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    $destBmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $destBmp.Dispose()
    Write-Output "Created: $outPath ($width x $height)"
}

# Android Mipmaps
Resize-Image $srcImg 'android/app/src/main/res/mipmap-mdpi/ic_launcher.png' 48 48
Resize-Image $srcImg 'android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png' 48 48
Resize-Image $srcImg 'android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png' 108 108 0.72

Resize-Image $srcImg 'android/app/src/main/res/mipmap-hdpi/ic_launcher.png' 72 72
Resize-Image $srcImg 'android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png' 72 72
Resize-Image $srcImg 'android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png' 162 162 0.72

Resize-Image $srcImg 'android/app/src/main/res/mipmap-xhdpi/ic_launcher.png' 96 96
Resize-Image $srcImg 'android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png' 96 96
Resize-Image $srcImg 'android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png' 216 216 0.72

Resize-Image $srcImg 'android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png' 144 144
Resize-Image $srcImg 'android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png' 144 144
Resize-Image $srcImg 'android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png' 324 324 0.72

Resize-Image $srcImg 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png' 192 192
Resize-Image $srcImg 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png' 192 192
Resize-Image $srcImg 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png' 432 432 0.72

# Web / PWA Assets
Resize-Image $srcImg 'public/icon-192.png' 192 192
Resize-Image $srcImg 'public/icon-512.png' 512 512
Resize-Image $srcImg 'public/maskable-icon.png' 512 512 0.8
Resize-Image $srcImg 'public/apple-touch-icon.png' 180 180
Resize-Image $srcImg 'public/logo.png' 512 512
Resize-Image $srcImg 'public/mokars_logo.png' 512 512

Resize-Image $srcImg 'dist/icon-192.png' 192 192
Resize-Image $srcImg 'dist/icon-512.png' 512 512
Resize-Image $srcImg 'dist/maskable-icon.png' 512 512 0.8
Resize-Image $srcImg 'dist/apple-touch-icon.png' 180 180
Resize-Image $srcImg 'dist/logo.png' 512 512
Resize-Image $srcImg 'dist/mokars_logo.png' 512 512

$srcImg.Dispose()
Write-Output "All icons generated successfully!"
