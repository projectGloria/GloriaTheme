$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$projectRoot = Split-Path -Parent $PSScriptRoot
$package = Get-Content -LiteralPath (Join-Path $projectRoot 'package.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$outputPath = Join-Path $projectRoot 'gloria-theme-custom.vsix'
$temporaryPath = Join-Path $projectRoot ('gloria-package-' + [guid]::NewGuid().ToString('N') + '.tmp')
$utf8 = [System.Text.UTF8Encoding]::new($false)

function Escape-Xml([string] $value) {
    [System.Security.SecurityElement]::Escape($value)
}

function Add-TextEntry($archive, [string] $name, [string] $content) {
    $entry = $archive.CreateEntry($name)
    $writer = [System.IO.StreamWriter]::new($entry.Open(), $utf8)
    try { $writer.Write($content) } finally { $writer.Dispose() }
}

$identity = Escape-Xml $package.name
$publisher = Escape-Xml $package.publisher
$version = Escape-Xml $package.version
$displayName = Escape-Xml $package.displayName
$description = Escape-Xml $package.description
$engine = Escape-Xml $package.engines.vscode
$categories = Escape-Xml ($package.categories -join ',')
$icon = Escape-Xml $package.icon
$manifest = @"
<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011">
  <Metadata>
    <Identity Language="en-US" Id="$identity" Version="$version" Publisher="$publisher" />
    <DisplayName>$displayName</DisplayName>
    <Description xml:space="preserve">$description</Description>
    <Tags>theme,color-theme,html,css,cs2,cfg</Tags>
    <Categories>$categories</Categories>
    <GalleryFlags>Public</GalleryFlags>
    <Properties>
      <Property Id="Microsoft.VisualStudio.Code.Engine" Value="$engine" />
      <Property Id="Microsoft.VisualStudio.Code.ExtensionKind" Value="ui" />
      <Property Id="Microsoft.VisualStudio.Code.ExecutesCode" Value="true" />
    </Properties>
    <Icon>extension/$icon</Icon>
  </Metadata>
  <Installation><InstallationTarget Id="Microsoft.VisualStudio.Code" /></Installation>
  <Dependencies />
  <Assets>
    <Asset Type="Microsoft.VisualStudio.Code.Manifest" Path="extension/package.json" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Content.Details" Path="extension/readme.md" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Content.Changelog" Path="extension/changelog.md" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Icons.Default" Path="extension/$icon" Addressable="true" />
  </Assets>
</PackageManifest>
"@
$contentTypes = @'
<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="css" ContentType="text/css" />
  <Default Extension="jpg" ContentType="image/jpeg" />
  <Default Extension="jpeg" ContentType="image/jpeg" />
  <Default Extension="png" ContentType="image/png" />
  <Default Extension="js" ContentType="application/javascript" />
  <Default Extension="json" ContentType="application/json" />
  <Default Extension="md" ContentType="text/markdown" />
  <Default Extension="svg" ContentType="image/svg+xml" />
  <Default Extension="woff" ContentType="font/woff" />
  <Default Extension="vsixmanifest" ContentType="text/xml" />
</Types>
'@

try {
    $archive = [System.IO.Compression.ZipFile]::Open($temporaryPath, [System.IO.Compression.ZipArchiveMode]::Create)
    try {
        Add-TextEntry $archive 'extension.vsixmanifest' $manifest
        Add-TextEntry $archive '[Content_Types].xml' $contentTypes
        $files = @('package.json', 'README.md', 'CHANGELOG.md', $package.icon)
        foreach ($directory in @('assets', 'src', 'themes', 'syntaxes', 'language-configuration')) {
            $files += Get-ChildItem -LiteralPath (Join-Path $projectRoot $directory) -File -Recurse |
                ForEach-Object { $_.FullName.Substring($projectRoot.Length + 1) }
        }
        $rawBaseUrl = "https://raw.githubusercontent.com/projectGloria/GloriaTheme/main"
        foreach ($file in $files) {
            $entryName = 'extension/' + $file.Replace('\', '/')
            if ($file -eq 'README.md' -or $file -eq 'CHANGELOG.md') {
                $entryName = $entryName.ToLowerInvariant()
                $content = Get-Content -LiteralPath (Join-Path $projectRoot $file) -Raw -Encoding UTF8
                if ($file -eq 'README.md') {
                    # Rewrite relative image links to GitHub raw URLs so Marketplace renders them
                    $content = $content -replace 'src="(assets/[^"]+)"', "src=`"$rawBaseUrl/`$1`""
                    $content = $content -replace 'src="(nihilZone\.jpg)"', "src=`"$rawBaseUrl/`$1`""
                    $content = $content -replace '!\[([^\]]*)\]\((assets/[^)]+)\)', "![`$1]($rawBaseUrl/`$2)"
                    $content = $content -replace '!\[([^\]]*)\]\((nihilZone\.jpg)\)', "![`$1]($rawBaseUrl/`$2)"
                }
                Add-TextEntry $archive $entryName $content
            } else {
                [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
                    $archive, (Join-Path $projectRoot $file), $entryName,
                    [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
            }
        }
    } finally { $archive.Dispose() }
    Move-Item -LiteralPath $temporaryPath -Destination $outputPath -Force
    Write-Output "Packaged Gloria $($package.version): $outputPath"
} finally {
    if (Test-Path -LiteralPath $temporaryPath) { Remove-Item -LiteralPath $temporaryPath }
}
