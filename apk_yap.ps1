Write-Host "=========================================" -ForegroundColor Yellow
Write-Host "   RADYO TV KURAN APK OLUSTURUCU BASLADI " -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow

$ErrorActionPreference = "Continue"

$jdkDir = "$PSScriptRoot\.jdk21"
if (-not (Test-Path "$jdkDir\jdk-21.0.4+7\bin\java.exe")) {
    Write-Host "[1/4] Java 21 (JDK) indiriliyor..." -ForegroundColor Cyan
    $jdkUrl = "https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.4%2B7/OpenJDK21U-jdk_x64_windows_hotspot_21.0.4_7.zip"
    $jdkZip = "$PSScriptRoot\jdk21.zip"
    Invoke-WebRequest -Uri $jdkUrl -OutFile $jdkZip
    
    Write-Host "      Java dosyalari cikariliyor..." -ForegroundColor Cyan
    Expand-Archive -Path $jdkZip -DestinationPath $jdkDir -Force
    Remove-Item $jdkZip
} else {
    Write-Host "[1/4] Java 21 hazir." -ForegroundColor Cyan
}

# Çevre Değişkenlerini Ayarla
$env:JAVA_HOME = "$jdkDir\jdk-21.0.4+7"
$env:ANDROID_HOME = 'C:\Users\Nihat\Android\Sdk'
$env:NODE_ENV = 'production'
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"

Write-Host "[2/4] Expo projesi Android icin kontrol ediliyor..." -ForegroundColor Cyan
$env:EAS_NO_VCS = 1

# local.properties dosyasını oluştur
$localProperties = "$PSScriptRoot\android\local.properties"
$sdkDirEscaped = $env:ANDROID_HOME -replace '\\', '\\'
"sdk.dir=$sdkDirEscaped" | Out-File -FilePath $localProperties -Encoding ASCII

# CMake önbellek kontrolü


Write-Host "[3/4] APK derlemesi yapiliyor..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\android"

cmd /c "gradlew.bat assembleRelease --no-daemon -x lint"

Write-Host "[4/4] Derleme tamamlandi. Exit code: $LASTEXITCODE" -ForegroundColor Yellow

$apk = Get-ChildItem -Path "$PSScriptRoot\android\app\build\outputs\apk" -Recurse -Filter '*.apk' -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if ($apk) {
    Copy-Item $apk.FullName -Destination "$PSScriptRoot\RadyoTvKuran.apk" -Force
    Write-Host "`n========================================================" -ForegroundColor Green
    Write-Host "  BASARILI! APK olusturuldu ve klasore kopyalandi:      " -ForegroundColor Green
    Write-Host "  $PSScriptRoot\RadyoTvKuran.apk" -ForegroundColor Green
    Write-Host "========================================================`n" -ForegroundColor Green
} else {
    Write-Host "`nHATA: APK dosyasi bulunamadi. Derleme sirasinda hata olusmus olabilir." -ForegroundColor Red
}

Set-Location $PSScriptRoot
