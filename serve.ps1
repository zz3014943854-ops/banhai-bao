$ErrorActionPreference = "Stop"
$port = 4178
$root = Join-Path $PSScriptRoot "dist"
$url = "http://127.0.0.1:$port"

$mimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".js" = "text/javascript; charset=utf-8"
  ".css" = "text/css; charset=utf-8"
  ".png" = "image/png"
  ".jpg" = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".svg" = "image/svg+xml"
  ".ico" = "image/x-icon"
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
try {
  $listener.Start()
} catch {
  Start-Process $url
  exit 0
}

Start-Process $url
Write-Host ""
Write-Host "Liaochuan Short Drama is running at $url" -ForegroundColor Green
Write-Host "Keep this window open while using the app." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop." -ForegroundColor DarkGray
Write-Host ""

while ($true) {
  $client = $listener.AcceptTcpClient()
  try {
    $stream = $client.GetStream()
    $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
    $requestLine = $reader.ReadLine()

    while ($reader.ReadLine()) {
    }

    $requestPath = "/"
    if ($requestLine -match "^[A-Z]+ ([^ ]+) HTTP/") {
      $requestPath = [System.Uri]::UnescapeDataString(($Matches[1] -split "\?")[0])
    }

    if ($requestPath -eq "/") {
      $requestPath = "/index.html"
    }

    $relativePath = $requestPath.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar)
    $filePath = [System.IO.Path]::GetFullPath((Join-Path $root $relativePath))

    if (-not $filePath.StartsWith([System.IO.Path]::GetFullPath($root)) -or -not (Test-Path -LiteralPath $filePath -PathType Leaf)) {
      $filePath = Join-Path $root "index.html"
    }

    $content = [System.IO.File]::ReadAllBytes($filePath)
    $extension = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
    $contentType = if ($mimeTypes.ContainsKey($extension)) { $mimeTypes[$extension] } else { "application/octet-stream" }
    $header = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($content.Length)`r`nCache-Control: no-cache`r`nConnection: close`r`n`r`n"
    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
    $stream.Write($headerBytes, 0, $headerBytes.Length)
    $stream.Write($content, 0, $content.Length)
  } catch {
  } finally {
    $client.Close()
  }
}
