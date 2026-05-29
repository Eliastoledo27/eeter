---
name: eter-android
description: "FÉter Stock Android app operating guide. Use for Kotlin, APK builds, installed app name, music persistence, Supabase sync, image uploads, and Android Studio build issues."
---

# FÉter Stock Android

## Location

- Android app root: `MyApplication/`.
- Main activity: `MyApplication/app/src/main/java/com/example/myapplication/MainActivity.kt`.
- Network DTO/service: `MyApplication/app/src/main/java/com/example/myapplication/network/ProductApiService.kt`.
- Installed app name: `MyApplication/app/src/main/res/values/strings.xml` -> `FÉter Stock`.

## Runtime Connection

Use Supabase directly for core data:

- Products: direct REST from `productos`.
- Admin operations: RPC `feter_admin_sync`.
- Images: direct Supabase Storage upload to bucket `products`.

Do not route core Android operations through website URLs like `www.eter.store/api/admin/products`; those can return HTML, redirects, `405`, or deployment-specific behavior.

## Token Rules

- Visible app name can use accents: `FÉter Stock`.
- HTTP admin token must be ASCII: `Feter`.
- If old settings contain `Féter`, normalize to `Feter`.
- If old URL contains `https://eter-store.vercel.app/`, normalize away from it.

## Build Commands

Run from `MyApplication/`:

```powershell
.\gradlew.bat :app:assembleDebug --offline --no-daemon
.\gradlew.bat :app:assembleRelease --offline --no-daemon
```

Outputs:

- Debug APK: `MyApplication/app/build/outputs/apk/debug/app-debug.apk`.
- Release unsigned APK: `MyApplication/app/build/outputs/apk/release/app-release-unsigned.apk`.

## Build Environment Fixes

Known issue: `Unknown host dl.google.com`.

Fixes used:

- Android Studio Gradle offline mode in `.idea/gradle.xml`.
- Disable release lint blocking if offline lint dependency is not cached:
  `lint { checkReleaseBuilds = false; abortOnError = false }`.
- Low-memory Gradle settings in `gradle.properties`:
  - `org.gradle.workers.max=1`
  - `kotlin.compiler.execution.strategy=in-process`
  - tuned JVM/Kotlin memory.

If release build fails with Windows pagefile errors, close Android Studio/emulators or increase pagefile, then retry.

## UI/Feature Expectations

- Music should persist across tabs.
- Tabs order: Inventario, Dashboard/Análisis, Pedidos, Promos, Anuncios, Catálogo, Música.
- Inventory should show real Supabase product count.
- Product create/update must refresh product list after RPC success.
- Image create must upload to Storage first, then create the product with public `image` and `images`.
