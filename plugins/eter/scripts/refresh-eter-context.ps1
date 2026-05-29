param(
  [string]$RepoRoot = (Resolve-Path "$PSScriptRoot\..\..\..").Path
)

$ErrorActionPreference = "Stop"

$summary = [ordered]@{
  repoRoot = $RepoRoot
  generatedAt = (Get-Date).ToString("s")
  androidMainActivity = Test-Path (Join-Path $RepoRoot "MyApplication/app/src/main/java/com/example/myapplication/MainActivity.kt")
  androidService = Test-Path (Join-Path $RepoRoot "MyApplication/app/src/main/java/com/example/myapplication/network/ProductApiService.kt")
  webCatalog = Test-Path (Join-Path $RepoRoot "src/app/catalog/CatalogClient.tsx")
  supabaseMigrations = Test-Path (Join-Path $RepoRoot "supabase/migrations")
  remotionProject = Test-Path (Join-Path $RepoRoot "videos/premium-footwear-ad60/package.json")
  pluginRoot = Test-Path (Join-Path $RepoRoot "plugins/eter/.codex-plugin/plugin.json")
}

$summary | ConvertTo-Json -Depth 3
