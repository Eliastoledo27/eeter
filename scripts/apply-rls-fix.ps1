# Script para aplicar la migración de fix RLS recursion
# Ejecutar desde: eter-store/scripts/
# Uso: node apply-rls-fix.js

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "FIX: RLS Recursion en Profiles" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que existe el archivo de migración
$migrationFile = "../supabase/migrations/20260207_fix_profiles_rls.sql"

if (-Not (Test-Path $migrationFile)) {
    Write-Host "❌ ERROR: No se encuentra la migración en $migrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Migración encontrada: $migrationFile" -ForegroundColor Green
Write-Host ""
Write-Host "OPCIONES PARA APLICAR LA MIGRACIÓN:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Usando Supabase CLI (Recomendado):" -ForegroundColor White
Write-Host "   cd .." -ForegroundColor Gray
Write-Host "   npx supabase db push" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Manualmente en Supabase Dashboard:" -ForegroundColor White
Write-Host "   - Ve a: https://supabase.com/dashboard/project/YOUR_PROJECT/sql" -ForegroundColor Gray
Write-Host "   - Copia y pega el contenido de:" -ForegroundColor Gray
Write-Host "     $migrationFile" -ForegroundColor Gray
Write-Host "   - Ejecuta el script" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Mostrar SQL aquí para copiar:" -ForegroundColor White
$response = Read-Host "¿Quieres ver el SQL aquí? (s/n)"

if ($response -eq "s" -or $response -eq "S") {
    Write-Host ""
    Write-Host "==================== SQL ====================" -ForegroundColor Cyan
    Get-Content $migrationFile | Write-Host -ForegroundColor White
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host ""
Write-Host "📖 Para más información, lee: ../MIGRATION_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
