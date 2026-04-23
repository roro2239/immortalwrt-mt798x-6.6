param(
	[int]$Port = 8088
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$uiRoot = Join-Path $repoRoot "package\mtk\applications\router-webui\files"
$mockFile = Join-Path $PSScriptRoot "router-webui-preview.mock.json"

$routes = @{
	"/"                      = @{ Path = Join-Path $uiRoot "custom-index.html"; ContentType = "text/html; charset=utf-8" }
	"/index.html"            = @{ Path = Join-Path $uiRoot "custom-index.html"; ContentType = "text/html; charset=utf-8" }
	"/preview/network"       = @{ Path = Join-Path $uiRoot "preview-network.html"; ContentType = "text/html; charset=utf-8" }
	"/preview/wifi"          = @{ Path = Join-Path $uiRoot "preview-wifi.html"; ContentType = "text/html; charset=utf-8" }
	"/preview/devices"       = @{ Path = Join-Path $uiRoot "preview-devices.html"; ContentType = "text/html; charset=utf-8" }
	"/preview/system"        = @{ Path = Join-Path $uiRoot "preview-system.html"; ContentType = "text/html; charset=utf-8" }
	"/assets/app.css"        = @{ Path = Join-Path $uiRoot "app.css"; ContentType = "text/css; charset=utf-8" }
	"/assets/app.js"         = @{ Path = Join-Path $uiRoot "app.js"; ContentType = "application/javascript; charset=utf-8" }
	"/cgi-bin/router/status" = @{ Path = $mockFile; ContentType = "application/json; charset=utf-8" }
}

foreach ($route in $routes.GetEnumerator()) {
	if (-not (Test-Path $route.Value.Path)) {
		throw "Preview asset missing: $($route.Value.Path)"
	}
}

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://127.0.0.1:${Port}/")
$listener.Prefixes.Add("http://localhost:${Port}/")
$listener.Start()

Write-Host "[INFO] router-webui preview started"
Write-Host "[INFO] URL: http://127.0.0.1:${Port}/"
Write-Host "[INFO] UI root: $uiRoot"
Write-Host "[INFO] Mock file: $mockFile"
Write-Host "[INFO] Refresh browser after editing source files"
Write-Host "[INFO] Press Ctrl+C to stop"

try {
	while ($listener.IsListening) {
		$context = $listener.GetContext()
		$request = $context.Request
		$response = $context.Response
		$path = $request.Url.AbsolutePath

		try {
			if ($routes.ContainsKey($path)) {
				$route = $routes[$path]
				$content = [System.IO.File]::ReadAllText($route.Path, [System.Text.Encoding]::UTF8)
				$bytes = [System.Text.Encoding]::UTF8.GetBytes($content)

				$response.StatusCode = 200
				$response.ContentType = $route.ContentType
				$response.ContentEncoding = [System.Text.Encoding]::UTF8
				$response.Headers["Cache-Control"] = "no-store"
				$response.OutputStream.Write($bytes, 0, $bytes.Length)
			}
			elseif ($path.StartsWith("/assets/icons/")) {
				$relative = $path.TrimStart("/").Replace("/", "\")
				$iconPath = Join-Path $uiRoot $relative

				if (-not (Test-Path $iconPath)) {
					throw "Icon not found: $path"
				}

				$content = [System.IO.File]::ReadAllText($iconPath, [System.Text.Encoding]::UTF8)
				$bytes = [System.Text.Encoding]::UTF8.GetBytes($content)

				$response.StatusCode = 200
				$response.ContentType = "image/svg+xml; charset=utf-8"
				$response.ContentEncoding = [System.Text.Encoding]::UTF8
				$response.Headers["Cache-Control"] = "no-store"
				$response.OutputStream.Write($bytes, 0, $bytes.Length)
			}
			else {
				$body = "Not Found: $path"
				$bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
				$response.StatusCode = 404
				$response.ContentType = "text/plain; charset=utf-8"
				$response.ContentEncoding = [System.Text.Encoding]::UTF8
				$response.OutputStream.Write($bytes, 0, $bytes.Length)
			}
		}
		catch {
			$body = "Server Error: $($_.Exception.Message)"
			$bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
			$response.StatusCode = 500
			$response.ContentType = "text/plain; charset=utf-8"
			$response.ContentEncoding = [System.Text.Encoding]::UTF8
			$response.OutputStream.Write($bytes, 0, $bytes.Length)
		}
		finally {
			$response.OutputStream.Close()
		}
	}
}
finally {
	if ($listener.IsListening) {
		$listener.Stop()
	}
	$listener.Close()
}
