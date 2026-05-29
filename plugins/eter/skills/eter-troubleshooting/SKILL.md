---
name: eter-troubleshooting
description: "Known Éter error fixes. Use when the user reports Android, Supabase, build, catalog, APK, image upload, JSON, 404, 405, or Gradle issues."
---

# Éter Troubleshooting

## Android/Supabase 404

Symptom:

- Toast: `Error: 404 - No autorizado`.

Likely cause:

- App points to old admin host `https://eter-store.vercel.app/`.

Fix:

- Avoid web admin endpoints for mobile data.
- Use Supabase REST/RPC directly.

## Authorization Header 0xE9

Symptom:

- `Unexpected char 0xE9 at ... Authorization`.

Cause:

- Token contains accented `Féter`.

Fix:

- HTTP token must be ASCII `Feter`.
- Visible names may still use accents.

## JsonReader.setLenient

Symptom:

- Gson says use `JsonReader.setLenient(true)`.

Cause:

- App expected JSON but got HTML, often `/lander` redirect from web domain.

Fix:

- Do not parse website endpoint responses as API JSON.
- Use Supabase REST/RPC.

## Image Upload 405

Symptom:

- Image upload says 405 or fails through web route.

Cause:

- Android posts image to `api/admin/products`.

Fix:

- Upload direct to Supabase Storage:
  `storage/v1/object/products/<objectPath>`.
- Save public URL into `productos.image` and `productos.images`.

## Product Says Success But Not In Database

Symptom:

- App says product added successfully, but Supabase has no row.

Cause:

- Android checked HTTP success but ignored RPC body `success=false`.
- Previous RPC attempted JSON array into `productos.images text[]`.

Fix:

- Android requires `res.isSuccessful && res.body()?.success == true`.
- RPC converts image arrays into PostgreSQL `text[]`.
- Test with temporary `CODEX_TEST_DELETE_%` product, select it, then delete it.

## Gradle Unknown Host dl.google.com

Cause:

- Offline/no DNS/proxy issue.

Fix:

- Enable Gradle offline in Android Studio and `.idea/gradle.xml`.
- Use cached dependencies.

## Gradle Memory/Pagefile Failure

Symptoms:

- Daemon disappeared.
- `The paging file is too small`.
- Kotlin daemon crashed.

Fixes:

- Close Android Studio/emulators when building release.
- `org.gradle.workers.max=1`.
- `kotlin.compiler.execution.strategy=in-process`.
- Increase Windows pagefile if release still fails.

## APK Name Still "My Application"

Fix:

- Change `MyApplication/app/src/main/res/values/strings.xml`.
- `app_name` should be `FÉter Stock`.
