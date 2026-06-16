$ErrorActionPreference = "Stop"

$dist = Join-Path $PSScriptRoot "dist"
$cssFile = Get-ChildItem (Join-Path $dist "assets") -Filter "index-*.css" | Select-Object -First 1
$jsFile = Get-ChildItem (Join-Path $dist "assets") -Filter "index-*.js" | Select-Object -First 1

if (-not $cssFile -or -not $jsFile) {
  throw "Built CSS or JavaScript was not found."
}

$css = [System.IO.File]::ReadAllText($cssFile.FullName, [System.Text.Encoding]::UTF8)
$js = [System.IO.File]::ReadAllText($jsFile.FullName, [System.Text.Encoding]::UTF8)

$css = $css.Replace("/covers/", "dist/covers/")
$js = $js.Replace("/covers/", "dist/covers/")

$html = @"
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#0b0b0d">
  <title>辽传短剧</title>
  <style>
$css
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module">
$js
  </script>
</body>
</html>
"@

$output = Join-Path $PSScriptRoot "Open-Liaochuan-App.html"
[System.IO.File]::WriteAllText($output, $html, [System.Text.UTF8Encoding]::new($false))
Write-Host "Created: $output"
