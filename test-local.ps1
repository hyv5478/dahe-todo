$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$dataFile = Join-Path $root "data/tasks.json"
$original = if (Test-Path $dataFile) { Get-Content -Encoding utf8 $dataFile -Raw } else { "[]" }
$env:TODO_NO_BROWSER = "1"
$server = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $root -PassThru -WindowStyle Hidden
try {
  $ready = $false
  for ($i = 0; $i -lt 20; $i++) {
    try {
      Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:4317/" | Out-Null
      $ready = $true
      break
    } catch {
      Start-Sleep -Milliseconds 250
    }
  }
  if (-not $ready) { throw "Server did not start." }

  $body = @'
[
  {
    "id": "test-task",
    "title": "test task",
    "note": "local file persistence test",
    "tag": "test",
    "priority": "high",
    "createdAt": "2026-04-22T10:00:00.000Z",
    "completedAt": "2026-04-22T11:00:00.000Z",
    "comments": [
      {
        "id": "test-comment-1",
        "text": "3pm comment",
        "createdAt": "2026-04-22T15:00:00.000Z",
        "updatedAt": null
      },
      {
        "id": "test-comment-2",
        "text": "5pm comment",
        "createdAt": "2026-04-22T17:00:00.000Z",
        "updatedAt": "2026-04-22T17:10:00.000Z"
      }
    ]
  }
]
'@
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
  Invoke-WebRequest -UseBasicParsing -Method Post -ContentType "application/json" -Body $bytes "http://127.0.0.1:4317/api/tasks" | Out-Null
  $api = Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:4317/api/tasks"
  $saved = Get-Content -Encoding utf8 $dataFile -Raw
  if ($api.Content -notmatch "test task") { throw "API did not return saved task." }
  if ($saved -notmatch "5pm comment") { throw "File did not contain saved comment." }

  "OK: server starts, page responds, API writes, data/tasks.json contains saved comments."
} finally {
  Set-Content -Encoding utf8 -Path $dataFile -Value $original
  if ($server -and -not $server.HasExited) {
    Stop-Process -Id $server.Id -Force
  }
}
