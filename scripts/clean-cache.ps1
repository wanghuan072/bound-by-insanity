$ErrorActionPreference = 'Stop'
$workspacePath = [IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot))
if (-not ([IO.Path]::GetFullPath((Get-Location).Path)).Equals($workspacePath, [StringComparison]::OrdinalIgnoreCase)) { throw 'Run cache cleanup from this project root.' }
if (-not (Test-Path -LiteralPath (Join-Path $workspacePath 'data/games/main-game.json'))) { throw 'Project identity not found.' }
$cleanupRoot = $workspacePath + [IO.Path]::DirectorySeparatorChar
$targets = @('.next-preview', '.next-production/cache', '.next-types')
$records = @()
foreach ($relative in $targets) {
  $absolute = [IO.Path]::GetFullPath((Join-Path $workspacePath $relative))
  if (-not $absolute.StartsWith($cleanupRoot, [StringComparison]::OrdinalIgnoreCase)) { throw 'Cache path escapes workspace.' }
  if (-not (Test-Path -LiteralPath $absolute)) { continue }
  $locks = if ($relative -eq '.next-production/cache') { @('.next-production/lock') } else { @("$relative/lock", "$relative/dev/lock") }
  foreach ($lock in $locks) { if (Test-Path -LiteralPath (Join-Path $workspacePath $lock)) { throw "Active or unresolved cache lock: $lock. Refusing cleanup." } }
  for ($ancestor = $absolute; $ancestor -ne $workspacePath; $ancestor = [IO.Path]::GetDirectoryName($ancestor)) {
    if ((Get-Item -LiteralPath $ancestor -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw "Linked cache path: $ancestor" }
  }
  $entries = @(Get-ChildItem -LiteralPath $absolute -Recurse -Force)
  if (@($entries | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }).Count -gt 0) { throw "Linked cache contents: $relative" }
  $size = ($entries | Where-Object { -not $_.PSIsContainer } | Measure-Object -Property Length -Sum).Sum
  # These three exact, resolved generated targets are checked above; active .next is never selected.
  Remove-Item -LiteralPath $absolute -Recurse -Force
  $records += [ordered]@{ path=$relative; absolutePath=$absolute; bytes=[long]$size; result='removed-generated-cache' }
}
$records | ConvertTo-Json -Depth 4
