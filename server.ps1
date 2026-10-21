# Harris Ijen Admin Company Portal - Lightweight Local HTTP Server
# Starts on http://localhost:8080 and automatically opens default web browser

$Port = 8080
$Url = "http://localhost:$Port/"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " HARRIS IJEN ADMIN COMPANY PORTAL - PT HARRIS IJEN JAYA" -ForegroundColor Yellow
Write-Host " Local Web Server starting on: $Url" -ForegroundColor Green
Write-Host " Press Ctrl+C in this terminal window to stop server." -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan

$Listener = New-Object System.Net.HttpListener
$Listener.Prefixes.Add($Url)
$Listener.Start()

Start-Process $Url

$RootPath = $PSScriptRoot

while ($Listener.IsListening) {
    try {
        $Context = $Listener.GetContext()
        $Request = $Context.Request
        $Response = $Context.Response

        $LocalPath = $Request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($LocalPath)) {
            $LocalPath = "index.html"
        }

        $FilePath = Join-Path $RootPath $LocalPath

        if (Test-Path $FilePath -PathType Leaf) {
            $Bytes = [System.IO.File]::ReadAllBytes($FilePath)
            $Extension = [System.IO.Path]::GetExtension($FilePath).ToLower()
            
            $MimeTypes = @{
                ".html" = "text/html; charset=utf-8"
                ".htm"  = "text/html; charset=utf-8"
                ".css"  = "text/css; charset=utf-8"
                ".js"   = "application/javascript; charset=utf-8"
                ".json" = "application/json; charset=utf-8"
                ".png"  = "image/png"
                ".jpg"  = "image/jpeg"
                ".jpeg" = "image/jpeg"
                ".svg"  = "image/svg+xml"
                ".pdf"  = "application/pdf"
            }

            $ContentType = $MimeTypes[$Extension]
            if (-not $ContentType) { $ContentType = "application/octet-stream" }

            $Response.ContentType = $ContentType
            $Response.ContentLength64 = $Bytes.Length
            $Response.AddHeader("Access-Control-Allow-Origin", "*")
            $Response.OutputStream.Write($Bytes, 0, $Bytes.Length)
        } else {
            $Response.StatusCode = 404
            $ErrorMsg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $LocalPath")
            $Response.OutputStream.Write($ErrorMsg, 0, $ErrorMsg.Length)
        }

        $Response.Close()
    } catch {
        # Continue listening
    }
}
