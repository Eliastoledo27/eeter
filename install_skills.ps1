$skills = @(
    @("code_complexity_analyzer", "Análisis proactivo de complejidad ciclomática para mantener el código limpio."),
    @("dead_code_purger", "Detecta y elimina funciones, variables e importaciones no utilizadas."),
    @("pattern_recognition_ai", "Reconoce patrones de diseño y sugiere refactorizaciones proactivas."),
    @("typescript_strict_enforcer", "Optimiza y fortalece el sistema de tipos para evitar errores en runtime."),
    @("performance_profiler_server", "Monitorea y optimiza la latencia de Nextjs Server Actions."),
    @("clean_architecture_validator", "Asegura que la lógica de negocio esté separada de la infraestructura."),
    @("react_render_optimizer", "Identifica y corrige renders innecesarios usando memo y useMemo."),
    @("zod_schema_generator", "Genera esquemas de validación Zod automáticamente desde tipos TS."),
    @("prisma_query_optimizer", "Optimiza consultas de Prisma para evitar el problema N+1."),
    @("tanstack_query_prefetching", "Implementa estrategias de pre-fetch de datos para UX instantánea."),
    @("trpc_integration_pattern", "Estandarización de comunicación type-safe entre front y back."),
    @("module_dependency_mapper", "Visualiza y limpia dependencias circulares entre módulos."),
    @("api_versioning_strategy", "Gestiona la evolución de APIs sin romper compatibilidad."),
    @("error_boundary_expert", "Implementa límites de error robustos para prevenir crashes globales."),
    @("custom_hook_architect", "Extrae lógica compleja en hooks reutilizables y testeables."),
    @("global_state_sync", "Sincroniza el estado de Zustand con almacenamiento persistente."),
    @("nextjs_caching_master", "Optimiza el Data Cache y Full Route Cache de Next.js."),
    @("server_component_isolation", "Maximiza el uso de Server Components para reducir el bundle size."),
    @("form_logic_simplifier", "Simplifica la gestión de formularios complejos con React Hook Form."),
    @("utility_pure_functions", "Asegura que las utilidades sean libres de efectos secundarios."),
    @("async_workflow_orchestrator", "Gestiona peticiones asíncronas paralelas y secuenciales."),
    @("hydration_error_fixer", "Detecta y corrige discrepancias entre servidor y cliente."),
    @("dynamic_import_optimizer", "Optimiza el code-splitting para tiempos de carga mínimos."),
    @("memoization_audit", "Auditoría de estrategias de caché en memoria."),
    @("class_variance_authority_master", "Gestión avanzada de variantes de componentes con CVA."),
    @("tailwind_config_merger", "Optimiza la configuración de temas dinámicos en Tailwind."),
    @("barrel_file_optimization", "Evita que los barrel files ralenticen el hot module replacement."),
    @("env_variable_validator", "Asegura que todas las variables de entorno estén presentes y tipadas."),
    @("type_guard_factory", "Crea Type Guards personalizados para datos externos inciertos."),
    @("logic_decoupling_strategy", "Separa la lógica de presentación de la lógica de datos."),
    @("dependency_vulnerability_scanner", "Escaneo automático de vulnerabilidades en paquetes de terceros."),
    @("jwt_security_protocol", "Fortalecimiento de la firma y validación de tokens JSON."),
    @("rls_policy_validator", "Auditoría de políticas de seguridad a nivel de fila en Supabase."),
    @("sql_injection_preventer", "Sanitiza entradas para prevenir inyecciones SQL en consultas manuales."),
    @("xss_protection_layer", "Previene ataques de Cross-Site Scripting mediante sanitización."),
    @("csrf_token_manager", "Implementa protección contra Cross-Site Request Forgery."),
    @("auth_mfa_flow", "Gestión de flujos de autenticación de múltiples factores."),
    @("api_rate_limiting", "Configura límites de tasa para proteger la infraestructura."),
    @("secure_header_config", "Configura CSP y otros headers de seguridad HTTP."),
    @("cors_policy_expert", "Gestión estricta de políticas de Cross-Origin Resource Sharing."),
    @("sensitive_data_masking", "Oculta datos sensibles en logs y respuestas de API."),
    @("brute_force_protection", "Implementa bloqueos y retardos ante intentos fallidos."),
    @("credential_leak_detector", "Escanea el código en busca de secretos accidentalmente pusheados."),
    @("oauth2_provider_hardener", "Asegura integraciones de Google/GitHub/Meta Auth."),
    @("pwned_password_checker", "Valida contraseñas contra bases de datos de brechas."),
    @("session_hijacking_guard", "Previene el secuestro de sesiones mediante huellas de cliente."),
    @("file_upload_sanitizer", "Valida tipos y escanea archivos subidos por usuarios."),
    @("cookie_security_master", "Configura HttpOnly, Secure y SameSite correctamente."),
    @("encryption_at_rest", "Estrategias de cifrado para datos sensibles en la DB."),
    @("penetration_test_simulator", "Simula ataques comunes para encontrar debilidades."),
    @("microinteraction_engine", "Diseña pequeñas animaciones que mejoran la sensación de uso."),
    @("color_theory_harmony", "Genera paletas coherentes basadas en la identidad visual de Éter."),
    @("responsive_stress_test", "Valida la UI en pantallas ultra-pequeñas y ultra-grandes."),
    @("typography_hierarchy_master", "Establece escalas tipográficas legibles y premium."),
    @("accessibility_wcag_22", "Asegura que la plataforma sea inclusiva para todos."),
    @("glassmorphism_v2", "Implementa efectos de transparencia avanzados con filtros blur."),
    @("motion_design_physics", "Asegura que las animaciones sigan leyes físicas naturales."),
    @("skeleton_loading_expert", "Crea estados de carga que reducen la ansiedad del usuario."),
    @("dark_mode_optimized", "Asegura el contraste perfecto en entornos oscuros."),
    @("framer_motion_gestures", "Implementa gestos táctiles y de mouse avanzados."),
    @("svg_animation_master", "Animación dinámica de iconos y gráficos vectoriales."),
    @("layout_golden_ratio", "Aplica proporciones áureas al diseño de grillas."),
    @("ux_friction_reducer", "Identifica y elimina pasos innecesarios en flujos de usuario."),
    @("visual_feedback_system", "Asegura que cada acción del usuario tenga una respuesta visual."),
    @("scroll_performance_tuning", "Optimiza animaciones que dependen del scroll."),
    @("viewport_unit_optimizer", "Corrige problemas de viewport en navegadores móviles."),
    @("custom_cursor_experience", "Implementa cursores interactivos premium."),
    @("parallax_depth_layers", "Crea profundidad visual mediante efectos de paralaje."),
    @("haptic_feedback_simulator", "Simula sensaciones táctiles mediante efectos visuales."),
    @("grid_auto_layout_master", "Domina grillas complejas que se adaptan al contenido."),
    @("self_correcting_workflow", "Corrige errores comunes de linting y build automáticamente."),
    @("smart_documentation_gen", "Genera READMEs y documentación técnica desde el código."),
    @("test_coverage_optimizer", "Identifica áreas críticas sin tests y genera suites."),
    @("ci_cd_pipeline_audit", "Optimiza tiempos de construcción en GitHub Actions/Vercel."),
    @("docker_image_slim", "Reduce el tamaño de las imágenes Docker para despliegues rápidos."),
    @("environment_config_manager", "Gestiona .envs dinámicamente entre entornos."),
    @("infrastructure_as_code_logic", "Patrones para gestionar recursos de la nube mediante código."),
    @("log_aggregation_strategy", "Centraliza logs para debugging rápido en producción."),
    @("automated_pr_reviewer", "Analiza Pull Requests en busca de bugs de lógica."),
    @("monorepo_turbo_scaling", "Optimiza el despliegue de múltiples apps en TurboRepo."),
    @("database_migration_guard", "Valida migraciones de Prisma para evitar pérdida de datos."),
    @("error_reporting_sentry", "Configura alertas críticas y traceo de errores."),
    @("cache_invalidation_expert", "Estrategias para limpiar cache de CDN y servidor."),
    @("deployment_rollback_logic", "Automatiza el retorno a versiones estables ante fallos."),
    @("bot_detection_protection", "Filtra tráfico automatizado malicioso."),
    @("catalog_flow_debugger", "Depura la sincronización del catálogo con Facebook/Meta."),
    @("webhook_idempotency_master", "Evita el procesamiento doble de mensajes de WhatsApp."),
    @("whatsapp_template_manager", "Gestiona y valida plantillas oficiales de Meta API."),
    @("stripe_webhooks_guardian", "Asegura que los pagos se registren sin fallos."),
    @("meta_ads_pixel_master", "Integración avanzada para optimización de conversiones."),
    @("inventory_sync_engine", "Sincroniza stock en tiempo real entre múltiples canales."),
    @("crm_data_orchestrator", "Conecta leads de WhatsApp con la base de datos central."),
    @("email_deliverability_pro", "Optimiza el envío de correos con Resend / SendGrid."),
    @("subscription_lifecycle_logic", "Gestiona estados de suscripción, pagos y cancelaciones."),
    @("api_payload_minimizer", "Reduce el tamaño de las respuestas para ahorrar bando de ancha."),
    @("chatbot_persona_eng", "Refina la personalidad y tono de respuesta de la IA."),
    @("analytics_conversion_funnel", "Tracea el embudo de ventas desde el catálogo."),
    @("google_merchant_sync", "Sincroniza productos con Google Shopping automáticamente."),
    @("internationalization_i18n", "Estrategias de traducción y localización dinámica."),
    @("affiliate_tracking_system", "Implementa tracking de referidos y comisiones.")
)

$base_path = "c:\Users\Admin\Desktop\ETER_REPO_RECOVERY\.agents\skills"

foreach ($skill in $skills) {
    $name = $skill[0]
    $desc = $skill[1]
    $skill_dir = Join-Path $base_path $name
    if (-not (Test-Path $skill_dir)) {
        New-Item -ItemType Directory -Path $skill_dir | Out-Null
    }
    
    $file_path = Join-Path $skill_dir "SKILL.md"
    $title = ($name -replace '_', ' ').ToUpper()
    
    $content = @"
---
name: $name
description: "$desc"
---

# Skill: $title

$desc

## Directrices de Aplicación
1. **Autonomía:** Esta habilidad permite al agente identificar áreas de mejora sin intervención.
2. **Calidad:** Cada intervención debe seguir los estándares premium de Éter.
3. **Consistencia:** Mantener la coherencia con el stack tecnológico (Next.js, Prisma, Tailwind).

## Protocolo de Ejecución
- Analizar el contexto actual.
- Aplicar la lógica de $name de forma proactiva.
- Validar resultados y reportar mejoras.
"@

    Set-Content -Path $file_path -Value $content -Encoding UTF8
}

Write-Host "Instaladas $($skills.Count) nuevas habilidades en $base_path"
