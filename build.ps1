<#
  WP-911 — Build der Workbench-Skin-Stylesheets.

  Kompiliert die Elastic-Entrypoints MIT --include-path auf diesen Skin-Ordner,
  sodass die offiziellen Elastic-Hooks (_variables / _styles) unsere Overrides
  ziehen. Es wird KEINE Elastic-Datei veraendert.

  Voraussetzung: Node/npm. lessc wird bei Bedarf lokal via npx bezogen.

  Aufruf (aus skins/workbench/):  powershell -ExecutionPolicy Bypass -File build.ps1
#>
$ErrorActionPreference = "Stop"
$skin    = $PSScriptRoot
$elastic = Join-Path (Split-Path $skin -Parent) "elastic\styles"
$incPath = Join-Path $skin "styles"

function Invoke-Lessc($src, $out, $extra) {
    $args = @("--yes", "less@4", "lessc", "--include-path=$incPath")
    if ($extra) { $args += $extra }
    $args += @($src, $out)
    Write-Host "lessc $src -> $out"
    & npx @args
    if ($LASTEXITCODE -ne 0) { throw "lessc failed for $src" }
}

# Haupt-Stylesheet (+ minify)
Invoke-Lessc (Join-Path $elastic "styles.less") (Join-Path $incPath "styles.css")     $null
Invoke-Lessc (Join-Path $elastic "styles.less") (Join-Path $incPath "styles.min.css") "--clean-css"
# Print + Embed (nur Palette-Remapping via _variables-Hook)
Invoke-Lessc (Join-Path $elastic "print.less") (Join-Path $incPath "print.css")  $null
Invoke-Lessc (Join-Path $elastic "embed.less") (Join-Path $incPath "embed.css")  $null

Write-Host "Fertig. Ausgabe in $incPath"
