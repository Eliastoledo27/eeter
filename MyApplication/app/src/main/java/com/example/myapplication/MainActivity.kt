package com.example.myapplication

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.*
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.lifecycle.ViewModel
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.material.icons.automirrored.filled.List
import com.example.myapplication.network.*
import com.example.myapplication.ui.theme.MyApplicationTheme
import coil.compose.AsyncImage
import coil.request.ImageRequest
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.BorderStroke
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.OkHttpClient
import okhttp3.RequestBody.Companion.toRequestBody
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import android.media.MediaPlayer
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.animation.core.*
import androidx.compose.runtime.saveable.rememberSaveable

// --- LÃ“GICA DEL PARSER DE STOCK MASIVO ---
fun parseShorthandStock(shorthand: String): Map<String, Int> {
    val result = mutableMapOf<String, Int>()
    if (shorthand.isBlank()) return result
    val tokens = shorthand.split(",")
    for (rawToken in tokens) {
        val token = rawToken.trim()
        if (token.isEmpty()) continue
        var sizePart: String
        var qty = 1
        if (token.contains("x", ignoreCase = true)) {
            val parts = token.split(Regex("[xX]"), 2)
            sizePart = parts[0].trim()
            qty = parts.getOrNull(1)?.trim()?.toIntOrNull() ?: 1
        } else {
            sizePart = token
        }
        if (sizePart.contains("/")) {
            val subSizes = sizePart.split("/")
            for (subSizeRaw in subSizes) {
                val subSize = subSizeRaw.trim()
                val intSize = subSize.toIntOrNull()
                if (intSize != null && intSize in 33..46) {
                    val sizeStr = intSize.toString()
                    result[sizeStr] = (result[sizeStr] ?: 0) + qty
                }
            }
        } else {
            val intSize = sizePart.toIntOrNull()
            if (intSize != null && intSize in 33..46) {
                val sizeStr = intSize.toString()
                result[sizeStr] = (result[sizeStr] ?: 0) + qty
            }
        }
    }
    return result
}

data class StockPublicationMetrics(
    val totalProducts: Int,
    val activeProducts: Int,
    val publishedWithImages: Int,
    val imageSlots: Int,
    val catalogVisible: Int,
    val homeVisible: Int,
    val outOfStock: Int,
    val lowStock: Int,
    val totalPairs: Int
)

fun ProductDto.totalPairs(): Int = stockBySize?.values?.sum() ?: stock

fun ProductDto.imageCount(): Int {
    val galleryCount = images?.count { it.isNotBlank() } ?: 0
    val singleImageCount = if (!image.isNullOrBlank() && images.orEmpty().none { it == image }) 1 else 0
    return galleryCount + singleImageCount
}

fun ProductDto.isOperationalActive(): Boolean {
    val normalized = status.trim().lowercase()
    return normalized == "activo" || normalized == "active"
}

fun ProductDto.visibleIn(section: String): Boolean {
    val sections = productSections.orEmpty()
    return sections.isEmpty() && section == "catalog" || sections.contains(section)
}

fun buildStockPublicationMetrics(products: List<ProductDto>): StockPublicationMetrics {
    return StockPublicationMetrics(
        totalProducts = products.size,
        activeProducts = products.count { it.isOperationalActive() },
        publishedWithImages = products.count { it.isOperationalActive() && it.imageCount() > 0 },
        imageSlots = products.sumOf { it.imageCount() },
        catalogVisible = products.count { it.isOperationalActive() && it.visibleIn("catalog") },
        homeVisible = products.count { it.isOperationalActive() && it.visibleIn("home") },
        outOfStock = products.count { it.totalPairs() == 0 },
        lowStock = products.count { it.totalPairs() in 1..4 },
        totalPairs = products.sumOf { it.totalPairs() }
    )
}

// --- CONFIGURACIÃ“N DE COLORES Ã‰TER/FÃ‰TER PREMIUM ---
val FeterDarkBg = Color(0xFF030303)
val FeterCardBg = Color(0xFF0A0A0A)
val FeterSurfaceBg = Color(0xFF111114)
val FeterCyan = Color(0xFF00E5FF)
val FeterGreen = Color(0xFF00E676)
val FeterOrange = Color(0xFFFF9100)
val FeterRed = Color(0xFFFF1744)
val FeterGray = Color(0xFF1A1A1E)
val FeterTextGray = Color(0xFF6E6E73)
val FeterTextLight = Color(0xFFB0B0B8)

private const val ETER_SUPABASE_REST_URL = "https://tolzrvsykzmvndvomllt.supabase.co/rest/v1/"
private const val ETER_SUPABASE_PROJECT_URL = "https://tolzrvsykzmvndvomllt.supabase.co"
private const val ETER_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvbHpydnN5a3ptdm5kdm9tbGx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwODQ5MDAsImV4cCI6MjA4NTY2MDkwMH0.pYQlxzkeUO6xsIDwe77kKCtapcVn507pgmcXPjhQH-o"

fun resolveProductImageUrl(product: ProductDto, serverUrl: String): String? {
    val firstImage = product.images?.firstOrNull()?.takeIf { it.isNotBlank() }
        ?: product.image?.takeIf { it.isNotBlank() }
    return when {
        firstImage == null -> null
        firstImage.startsWith("http://") || firstImage.startsWith("https://") -> firstImage
        serverUrl.contains("supabase.co") -> {
            val cleanImage = firstImage.removePrefix("/")
            "$ETER_SUPABASE_PROJECT_URL/storage/v1/object/public/products/$cleanImage"
        }
        else -> {
            val cleanBase = if (serverUrl.endsWith("/")) serverUrl else "$serverUrl/"
            val cleanImage = firstImage.removePrefix("/")
            "$cleanBase$cleanImage"
        }
    }
}

// --- LISTA DE TRACKS Ã‰TER ---
data class EterTrack(val rawId: Int, val displayName: String)

val ETER_TRACKS = listOf(
    EterTrack(R.raw.clair_de_lune,    "Clair de Lune"),
    EterTrack(R.raw.barry_lindo,      "Barry Lindo"),
    EterTrack(R.raw.vos_y_la_mancha,  "Vos y la Mancha"),
    EterTrack(R.raw.sentimental_mood, "In a Sentimental Mood"),
    EterTrack(R.raw.por_ahora,        "Por Ahora"),
    EterTrack(R.raw.ruins,            "Ruins"),
    EterTrack(R.raw.tezeta,           "Tezeta")
)

// --- VIEWMODEL PRINCIPAL DE LA APP ---
class FeterStockViewModel : ViewModel() {
    private val _products = MutableStateFlow<List<ProductDto>>(emptyList())
    val products: StateFlow<List<ProductDto>> = _products

    private val _resellerLinks = MutableStateFlow<List<ResellerLinkDto>>(emptyList())
    val resellerLinks: StateFlow<List<ResellerLinkDto>> = _resellerLinks

    private val _pedidos = MutableStateFlow<List<PedidoDto>>(emptyList())
    val pedidos: StateFlow<List<PedidoDto>> = _pedidos

    private val _coupons = MutableStateFlow<List<CouponDto>>(emptyList())
    val coupons: StateFlow<List<CouponDto>> = _coupons

    private val _announcements = MutableStateFlow<List<AnnouncementDto>>(emptyList())
    val announcements: StateFlow<List<AnnouncementDto>> = _announcements

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    private val _serverUrl = MutableStateFlow(ETER_SUPABASE_REST_URL)
    val serverUrl: StateFlow<String> = _serverUrl

    private val _apiKey = MutableStateFlow(ETER_SUPABASE_ANON_KEY)
    val apiKey: StateFlow<String> = _apiKey

    private var apiService: ProductApiService? = null
    private var supabaseApiService: ProductApiService? = null

    init {
        rebuildService()
    }

    fun loadSettings(context: Context) {
        val prefs = context.getSharedPreferences("feter_prefs", Context.MODE_PRIVATE)
        val savedUrl = normalizeAdminUrl(prefs.getString("server_url", ETER_SUPABASE_REST_URL) ?: ETER_SUPABASE_REST_URL)
        val savedKey = normalizeAdminKey(prefs.getString("api_key", ETER_SUPABASE_ANON_KEY) ?: ETER_SUPABASE_ANON_KEY)
        _serverUrl.value = savedUrl
        _apiKey.value = savedKey
        rebuildService()
    }

    fun updateSettings(context: Context, url: String, key: String) {
        val cleanUrl = normalizeAdminUrl(url)
        val cleanKey = normalizeAdminKey(key)
        _serverUrl.value = cleanUrl
        _apiKey.value = cleanKey
        rebuildService()

        val prefs = context.getSharedPreferences("feter_prefs", Context.MODE_PRIVATE)
        prefs.edit().apply {
            putString("server_url", cleanUrl)
            putString("api_key", cleanKey)
            apply()
        }
    }

    private val ADMIN_BYPASS_TOKEN = "Feter"
    private val ADMIN_API_BASE_URL = "https://www.eter.store/"

    private fun normalizeAdminUrl(url: String): String {
        val cleanUrl = url.trim().let { if (it.endsWith("/")) it else "$it/" }
        return when (cleanUrl) {
            "https://eter-store.vercel.app/" -> ADMIN_API_BASE_URL
            else -> cleanUrl
        }
    }

    private fun normalizeAdminKey(key: String): String {
        val cleanKey = key.trim().replace("\"", "")
        val lowerKey = cleanKey.lowercase()
        return if (lowerKey == "feter" || lowerKey.contains("fÃ©") || lowerKey.contains("fÃ£")) {
            ADMIN_BYPASS_TOKEN
        } else {
            cleanKey
        }
    }

    private fun rebuildService() {
        try {
            val okHttpClient = OkHttpClient.Builder()
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(15, TimeUnit.SECONDS)
                .build()

            val retrofit = Retrofit.Builder()
                .baseUrl(_serverUrl.value)
                .client(okHttpClient)
                .addConverterFactory(GsonConverterFactory.create())
                .build()

            apiService = retrofit.create(ProductApiService::class.java)

            supabaseApiService = Retrofit.Builder()
                .baseUrl(ETER_SUPABASE_REST_URL)
                .client(okHttpClient)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
                .create(ProductApiService::class.java)

        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun adminBearerToken(): String {
        val token = if (_serverUrl.value.contains("supabase.co") || _apiKey.value.startsWith("eyJ")) {
            ADMIN_BYPASS_TOKEN
        } else {
            normalizeAdminKey(_apiKey.value).ifBlank { ADMIN_BYPASS_TOKEN }
        }
        return "Bearer $token"
    }

    private fun adminTokenValue(): String {
        return adminBearerToken().removePrefix("Bearer ").trim()
    }

    private fun supabaseApiKey(): String {
        return if (_apiKey.value.startsWith("eyJ")) _apiKey.value else ETER_SUPABASE_ANON_KEY
    }

    private fun supabaseBearerToken(): String {
        return "Bearer ${supabaseApiKey()}"
    }

    private suspend fun runSupabaseAdminSync(request: AdminSyncRequest): retrofit2.Response<AdminSyncResponse> {
        val service = supabaseApiService ?: apiService ?: error("Supabase no inicializado")
        return service.supabaseAdminSync(
            supabaseApiKey(),
            supabaseBearerToken(),
            adminTokenValue(),
            AdminRpcRequest(request)
        )
    }

    private fun webApiBaseUrl(): String {
        return if (_serverUrl.value.contains("supabase.co")) ADMIN_API_BASE_URL else _serverUrl.value
    }

    private suspend fun uploadImageToSupabaseStorage(
        fileName: String,
        contentType: String,
        bytes: ByteArray
    ): String {
        require(contentType in setOf("image/jpeg", "image/png", "image/webp")) {
            "Formato no permitido. UsÃ¡ JPG, PNG o WEBP."
        }
        require(bytes.size <= 8 * 1024 * 1024) {
            "La imagen supera 8 MB."
        }

        val service = supabaseApiService ?: apiService ?: error("Supabase no inicializado")
        val safeFileName = fileName.replace(Regex("[^a-zA-Z0-9._-]"), "_")
        val objectPath = "products/mobile_${System.currentTimeMillis()}_$safeFileName"
        val uploadUrl = "$ETER_SUPABASE_PROJECT_URL/storage/v1/object/products/$objectPath"
        val body = bytes.toRequestBody(contentType.toMediaTypeOrNull())
        val response = service.uploadSupabaseStorageObject(
            uploadUrl,
            supabaseApiKey(),
            supabaseBearerToken(),
            contentType,
            "false",
            body
        )

        if (!response.isSuccessful) {
            val errorBody = try {
                response.errorBody()?.string()?.take(180)
            } catch (e: Exception) {
                null
            }
            throw IllegalStateException("Subir imagen fallÃ³: HTTP ${response.code()}${if (errorBody.isNullOrBlank()) "" else " - $errorBody"}")
        }

        return "$ETER_SUPABASE_PROJECT_URL/storage/v1/object/public/products/$objectPath"
    }

    private fun isDirectSupabaseConnection(): Boolean {
        return _serverUrl.value.contains("supabase.co")
    }

    private fun responseErrorMessage(action: String, response: retrofit2.Response<*>): String {
        val body = try {
            response.errorBody()?.string()?.take(180)
        } catch (e: Exception) {
            null
        }
        return if (body.isNullOrBlank()) {
            "$action fallÃ³: HTTP ${response.code()}"
        } else {
            "$action fallÃ³: HTTP ${response.code()} - $body"
        }
    }

    fun fetchProducts(onResult: (Boolean, String) -> Unit = { _, _ -> }) {
        val service = apiService ?: return
        _isLoading.value = true

        viewModelScope.launch(Dispatchers.IO) {
            try {
                val response = (supabaseApiService ?: service).getSupabaseProducts(
                    supabaseApiKey(),
                    supabaseBearerToken()
                )

                withContext(Dispatchers.Main) {
                    _isLoading.value = false
                    if (response.isSuccessful && response.body() != null) {
                        _products.value = response.body()!!
                        onResult(true, "Base de datos sincronizada.")
                    } else {
                        onResult(false, "Error: ${response.code()} - No autorizado.")
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    _isLoading.value = false
                    onResult(false, "Fallo de conexiÃ³n: ${e.message}")
                }
            }
        }
    }

    fun fetchResellerLinks(onResult: (Boolean, String) -> Unit = { _, _ -> }) {
        viewModelScope.launch(Dispatchers.IO) {
            try {
                val response = runSupabaseAdminSync(AdminSyncRequest(action = "list_all"))

                withContext(Dispatchers.Main) {
                    if (response.isSuccessful && response.body() != null) {
                        _resellerLinks.value = response.body()!!.resellerLinks.orEmpty()
                            .filter { !it.resellerSlug.isNullOrBlank() }
                        onResult(true, "Links exclusivos sincronizados.")
                    } else {
                        onResult(false, responseErrorMessage("Cargar links exclusivos", response))
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    onResult(false, "Error cargando links exclusivos: ${e.message}")
                }
            }
        }
    }

    fun fetchAdminModules(onResult: (Boolean, String) -> Unit = { _, _ -> }) {
        viewModelScope.launch(Dispatchers.IO) {
            try {
                val response = runSupabaseAdminSync(AdminSyncRequest(action = "list_all"))

                withContext(Dispatchers.Main) {
                    if (response.isSuccessful && response.body()?.success == true) {
                        val body = response.body()!!
                        _pedidos.value = body.pedidos.orEmpty()
                        _coupons.value = body.coupons.orEmpty()
                        _announcements.value = body.announcements.orEmpty()
                        _resellerLinks.value = body.resellerLinks.orEmpty().filter { !it.resellerSlug.isNullOrBlank() }
                        onResult(true, "MÃ³dulos administrativos sincronizados.")
                    } else {
                        onResult(false, response.body()?.error ?: responseErrorMessage("Sincronizar mÃ³dulos", response))
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    onResult(false, "Error sincronizando mÃ³dulos: ${e.message}")
                }
            }
        }
    }

    fun updateProductSections(productId: String, sections: List<String>, onResult: (Boolean, String) -> Unit = { _, _ -> }) {
        viewModelScope.launch(Dispatchers.IO) {
            try {
                val res = runSupabaseAdminSync(AdminSyncRequest(action = "update_product_sections", productId = productId, sections = sections.ifEmpty { listOf("catalog") }))
                withContext(Dispatchers.Main) {
                    if (res.isSuccessful && res.body()?.success == true) {
                        fetchProducts()
                        onResult(true, "Apartados actualizados.")
                    } else {
                        onResult(false, res.body()?.error ?: responseErrorMessage("Actualizar apartados", res))
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) { onResult(false, "Error de red: ${e.message}") }
            }
        }
    }

    fun updatePedidoStatus(orderId: String, status: String, onResult: (Boolean, String) -> Unit = { _, _ -> }) {
        viewModelScope.launch(Dispatchers.IO) {
            try {
                val res = runSupabaseAdminSync(AdminSyncRequest(action = "update_order_status", orderId = orderId, status = status))
                withContext(Dispatchers.Main) {
                    if (res.isSuccessful && res.body()?.success == true) {
                        fetchAdminModules()
                        onResult(true, "Pedido actualizado.")
                    } else onResult(false, res.body()?.error ?: responseErrorMessage("Actualizar pedido", res))
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) { onResult(false, "Error de red: ${e.message}") }
            }
        }
    }

    fun saveCoupon(coupon: CouponDto, onResult: (Boolean, String) -> Unit = { _, _ -> }) {
        viewModelScope.launch(Dispatchers.IO) {
            try {
                val res = runSupabaseAdminSync(AdminSyncRequest(action = "save_coupon", coupon = coupon))
                withContext(Dispatchers.Main) {
                    if (res.isSuccessful && res.body()?.success == true) {
                        fetchAdminModules()
                        onResult(true, "CupÃ³n guardado.")
                    } else onResult(false, res.body()?.error ?: responseErrorMessage("Guardar cupÃ³n", res))
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) { onResult(false, "Error de red: ${e.message}") }
            }
        }
    }

    fun deleteCoupon(id: String, onResult: (Boolean, String) -> Unit = { _, _ -> }) {
        deleteRecord("delete_coupon", id, "CupÃ³n eliminado.", onResult)
    }

    fun saveAnnouncement(
        context: Context,
        announcement: AnnouncementDto,
        imageUri: Uri?,
        onResult: (Boolean, String) -> Unit = { _, _ -> }
    ) {
        _isLoading.value = true
        viewModelScope.launch(Dispatchers.IO) {
            try {
                var finalImageUrl = announcement.imageUrl
                if (imageUri != null) {
                    val bytes = context.contentResolver.openInputStream(imageUri)?.readBytes()
                    if (bytes != null) {
                        val contentType = context.contentResolver.getType(imageUri) ?: "image/jpeg"
                        val extension = when (contentType) {
                            "image/png" -> "png"
                            "image/webp" -> "webp"
                            else -> "jpg"
                        }
                        val filename = "announcement_${System.currentTimeMillis()}_${(1000..9999).random()}.$extension"
                        val uploadedUrl = uploadImageToSupabaseStorage(filename, contentType, bytes)
                        if (uploadedUrl != null) {
                            finalImageUrl = uploadedUrl
                        }
                    }
                }
                val finalAnnouncement = announcement.copy(imageUrl = finalImageUrl)
                val res = runSupabaseAdminSync(AdminSyncRequest(action = "save_announcement", announcement = finalAnnouncement))
                withContext(Dispatchers.Main) {
                    _isLoading.value = false
                    if (res.isSuccessful && res.body()?.success == true) {
                        fetchAdminModules()
                        onResult(true, "Anuncio guardado.")
                    } else onResult(false, res.body()?.error ?: responseErrorMessage("Guardar anuncio", res))
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    _isLoading.value = false
                    onResult(false, "Error de red: ${e.message}")
                }
            }
        }
    }

    fun deleteAnnouncement(id: String, onResult: (Boolean, String) -> Unit = { _, _ -> }) {
        deleteRecord("delete_announcement", id, "Anuncio eliminado.", onResult)
    }

    fun generateAnnouncementAi(payload: AnnouncementAiRequest, onResult: (AnnouncementAiResponse?, String) -> Unit) {
        viewModelScope.launch {
            try {
                val service = apiService ?: error("API no inicializada")
                val response = service.generateAnnouncementAi("${webApiBaseUrl()}api/feter/announcement-ai", payload)
                val body = response.body()
                if (response.isSuccessful && body != null && body.error.isNullOrBlank()) {
                    onResult(body, if (body.source == "gemini") "IA Gemini aplicada." else "IA local aplicada.")
                } else {
                    onResult(null, body?.error ?: responseErrorMessage("IA de anuncios", response))
                }
            } catch (e: Exception) {
                onResult(null, e.message ?: "No se pudo conectar con Gemini.")
            }
        }
    }

    private fun deleteRecord(action: String, id: String, message: String, onResult: (Boolean, String) -> Unit) {
        viewModelScope.launch(Dispatchers.IO) {
            try {
                val res = runSupabaseAdminSync(AdminSyncRequest(action = action, id = id))
                withContext(Dispatchers.Main) {
                    if (res.isSuccessful && res.body()?.success == true) {
                        fetchAdminModules()
                        onResult(true, message)
                    } else onResult(false, res.body()?.error ?: responseErrorMessage("Eliminar registro", res))
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) { onResult(false, "Error de red: ${e.message}") }
            }
        }
    }

    fun updateProductStock(
        productId: String,
        stockMap: Map<String, Int>,
        price: Double? = null,
        name: String? = null,
        onResult: (Boolean, String) -> Unit
    ) {
        _isLoading.value = true

        viewModelScope.launch(Dispatchers.IO) {
            try {
                val res = runSupabaseAdminSync(AdminSyncRequest(action = "update_product", productId = productId, stockBySize = stockMap, price = price, name = name))
                val responseIsSuccessful = res.isSuccessful && res.body()?.success == true

                withContext(Dispatchers.Main) {
                    _isLoading.value = false
                    if (responseIsSuccessful) {
                        fetchProducts() // Recargar lista
                        onResult(true, "Â¡Producto actualizado en tiempo real!")
                    } else {
                        onResult(false, res.body()?.error ?: responseErrorMessage("Actualizar producto", res))
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    _isLoading.value = false
                    onResult(false, "Error de red: ${e.message}")
                }
            }
        }
    }

    fun updateProductMetadata(
        productId: String,
        name: String,
        brand: String,
        category: String,
        price: Double,
        status: String,
        description: String,
        stockMap: Map<String, Int>,
        onResult: (Boolean, String) -> Unit
    ) {
        _isLoading.value = true

        viewModelScope.launch(Dispatchers.IO) {
            try {
                val res = runSupabaseAdminSync(AdminSyncRequest(action = "update_product", productId = productId, stockBySize = stockMap, price = price, name = name, description = description, category = category, brand = brand, status = status))
                val responseIsSuccessful = res.isSuccessful && res.body()?.success == true

                withContext(Dispatchers.Main) {
                    _isLoading.value = false
                    if (responseIsSuccessful) {
                        fetchProducts() // Recargar lista
                        onResult(true, "Â¡Producto actualizado exitosamente!")
                    } else {
                        onResult(false, res.body()?.error ?: responseErrorMessage("Actualizar producto", res))
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    _isLoading.value = false
                    onResult(false, "Error de red: ${e.message}")
                }
            }
        }
    }

    fun updateProductOperationalState(
        product: ProductDto,
        enable: Boolean? = null,
        clearStock: Boolean = false,
        onResult: (Boolean, String) -> Unit
    ) {
        _isLoading.value = true

        viewModelScope.launch(Dispatchers.IO) {
            try {
                val nextStatus = when (enable) {
                    true -> "activo"
                    false -> "inactivo"
                    null -> product.status
                }
                val nextStock = if (clearStock) {
                    product.stockBySize.orEmpty().keys.associateWith { 0 }
                } else {
                    product.stockBySize.orEmpty()
                }
                val res = runSupabaseAdminSync(
                    AdminSyncRequest(
                        action = "update_product",
                        productId = product.id,
                        stockBySize = nextStock,
                        price = product.price,
                        name = product.name,
                        description = product.description,
                        category = product.category,
                        brand = product.brand,
                        status = nextStatus
                    )
                )
                val ok = res.isSuccessful && res.body()?.success == true

                withContext(Dispatchers.Main) {
                    _isLoading.value = false
                    if (ok) {
                        fetchProducts()
                        val message = when {
                            clearStock && enable == false -> "Stock eliminado y publicaciÃ³n deshabilitada."
                            clearStock -> "Stock eliminado correctamente."
                            enable == true -> "PublicaciÃ³n habilitada."
                            enable == false -> "PublicaciÃ³n deshabilitada."
                            else -> "Producto actualizado."
                        }
                        onResult(true, message)
                    } else {
                        onResult(false, res.body()?.error ?: responseErrorMessage("Controlar stock", res))
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    _isLoading.value = false
                    onResult(false, "Error de red: ${e.message}")
                }
            }
        }
    }

    fun createNewProduct(name: String, category: String, price: Double, stockMap: Map<String, Int>, onResult: (Boolean, String) -> Unit) {
        _isLoading.value = true

        viewModelScope.launch(Dispatchers.IO) {
            try {
                val product = NewProductDto(
                    name = name,
                    category = category,
                    price = price,
                    stockBySize = stockMap,
                    stock = stockMap.values.sum()
                )
                val res = runSupabaseAdminSync(AdminSyncRequest(action = "create_product", productData = product))
                val responseIsSuccessful = res.isSuccessful && res.body()?.success == true

                withContext(Dispatchers.Main) {
                    _isLoading.value = false
                    if (responseIsSuccessful) {
                        fetchProducts()
                        onResult(true, "Â¡Producto '$name' creado exitosamente!")
                    } else {
                        onResult(false, res.body()?.error ?: responseErrorMessage("Crear producto", res))
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    _isLoading.value = false
                    onResult(false, "Error de red: ${e.message}")
                }
            }
        }
    }

    fun createNewProductWithImage(
        context: Context,
        name: String,
        category: String,
        price: Double,
        stockMap: Map<String, Int>,
        imageUri: Uri?,
        onResult: (Boolean, String) -> Unit
    ) {
        _isLoading.value = true

        viewModelScope.launch(Dispatchers.IO) {
            try {
                var imageUrl: String? = null

                // Si hay un URI de imagen, subirlo primero a Supabase Storage
                if (imageUri != null) {
                    val bytes = context.contentResolver.openInputStream(imageUri)?.readBytes()
                    if (bytes != null) {
                        val contentType = context.contentResolver.getType(imageUri) ?: "image/jpeg"
                        val extension = when (contentType) {
                            "image/png" -> "png"
                            "image/webp" -> "webp"
                            else -> "jpg"
                        }
                        val filename = "img_${System.currentTimeMillis()}_${(1000..9999).random()}.$extension"

                        imageUrl = uploadImageToSupabaseStorage(filename, contentType, bytes)
                    }
                }

                val imagesList = if (imageUrl != null) listOf(imageUrl) else null
                val product = NewProductDto(
                        name = name,
                        category = category,
                        price = price,
                        stockBySize = stockMap,
                        stock = stockMap.values.sum(),
                        images = imagesList,
                        image = imageUrl
                    )
                val res = runSupabaseAdminSync(AdminSyncRequest(action = "create_product", productData = product))
                val responseIsSuccessful = res.isSuccessful && res.body()?.success == true

                withContext(Dispatchers.Main) {
                    _isLoading.value = false
                    if (responseIsSuccessful) {
                        fetchProducts()
                        onResult(true, "Â¡Producto '$name' creado exitosamente!")
                    } else {
                        onResult(false, res.body()?.error ?: responseErrorMessage("Crear producto", res))
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    _isLoading.value = false
                    onResult(false, "Error de red: ${e.message}")
                }
            }
        }
    }

    fun bulkLoadStock(bulkProducts: List<NewProductDto>, onResult: (Boolean, String) -> Unit) {
        _isLoading.value = true

        viewModelScope.launch(Dispatchers.IO) {
            try {
                var bulkErrorMessage = "Error en carga masiva."
                val normalizedProducts = bulkProducts.map { it.copy(stock = it.stockBySize.values.sum()) }
                val res = runSupabaseAdminSync(AdminSyncRequest(action = "bulk_load", bulkProducts = normalizedProducts))
                if (!res.isSuccessful || res.body()?.success != true) {
                    bulkErrorMessage = res.body()?.error ?: responseErrorMessage("Carga masiva", res)
                }
                val responseIsSuccessful = res.isSuccessful && res.body()?.success == true

                withContext(Dispatchers.Main) {
                    _isLoading.value = false
                    if (responseIsSuccessful) {
                        fetchProducts()
                        onResult(true, "Â¡Carga masiva completada con Ã©xito!")
                    } else {
                        onResult(false, bulkErrorMessage)
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    _isLoading.value = false
                    onResult(false, "Error de red: ${e.message}")
                }
            }
        }
    }
}

// --- ACTIVIDAD PRINCIPAL CON INTEGRACIÃ“N DE RESILIENCIA Ã‰TER ---
class MainActivity : ComponentActivity() {
    companion object {
        var globalCrashTrace by mutableStateOf<String?>(null)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val context = this@MainActivity

        // --- ARNÃ‰S GLOBAL DE EXCEPCIONES EN TIEMPO DE EJECUCIÃ“N ---
        Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
            val sw = java.io.StringWriter()
            val pw = java.io.PrintWriter(sw)
            throwable.printStackTrace(pw)
            val stackTraceString = sw.toString()

            // Guardar log localmente en el cache
            try {
                val file = java.io.File(context.cacheDir, "feter_crash_log.txt")
                file.writeText("HILO: ${thread.name}\nALERTA: ${throwable.localizedMessage}\n\n$stackTraceString")
            } catch (e: Exception) {
                e.printStackTrace()
            }

            // Iniciar MainActivity en un nuevo proceso limpio
            try {
                val intent = android.content.Intent(context, MainActivity::class.java).apply {
                    putExtra("IS_CRASH", true)
                    addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK or android.content.Intent.FLAG_ACTIVITY_CLEAR_TASK)
                }
                context.startActivity(intent)
            } catch (e: Exception) {
                e.printStackTrace()
            }

            // Terminar el proceso actual para evitar diÃ¡logos de crash feos del sistema
            android.os.Process.killProcess(android.os.Process.myPid())
            java.lang.System.exit(10)
        }

        // Verificar si venimos de un crash anterior
        if (intent.getBooleanExtra("IS_CRASH", false)) {
            try {
                val file = java.io.File(cacheDir, "feter_crash_log.txt")
                if (file.exists()) {
                    globalCrashTrace = file.readText()
                }
            } catch (e: Exception) {
                globalCrashTrace = "Error al leer el archivo de crash: ${e.message}"
            }
        }

        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = FeterDarkBg
                ) {
                    val crashTrace = globalCrashTrace
                    if (crashTrace != null) {
                        FeterRescueTerminalScreen(
                            crashTrace = crashTrace,
                            onClearSettings = {
                                try {
                                    val file = java.io.File(cacheDir, "feter_crash_log.txt")
                                    if (file.exists()) file.delete()
                                    cacheDir.deleteRecursively()
                                    filesDir.deleteRecursively()
                                    val prefs = context.getSharedPreferences("feter_prefs", Context.MODE_PRIVATE)
                                    prefs.edit().clear().apply()
                                    Toast.makeText(context, "CachÃ© y configuraciÃ³n vaciados con Ã©xito.", Toast.LENGTH_LONG).show()
                                } catch (e: Exception) {
                                    Toast.makeText(context, "Fallo al vaciar: ${e.message}", Toast.LENGTH_LONG).show()
                                }
                            },
                            onRestart = {
                                globalCrashTrace = null
                                try {
                                    val file = java.io.File(cacheDir, "feter_crash_log.txt")
                                    if (file.exists()) file.delete()
                                } catch (e: Exception) {
                                    e.printStackTrace()
                                }
                                val newIntent = android.content.Intent(context, MainActivity::class.java).apply {
                                    addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK or android.content.Intent.FLAG_ACTIVITY_CLEAR_TASK)
                                }
                                context.startActivity(newIntent)
                            }
                        )
                    } else {
                        FeterStockAdminApp()
                    }
                }
            }
        }
    }
}

// --- PANTALLA DE RESCATE / TERMINAL DE DIAGNÃ“STICO FÃ‰TER ---
@Composable
fun FeterRescueTerminalScreen(
    crashTrace: String,
    onClearSettings: () -> Unit,
    onRestart: () -> Unit
) {
    val context = LocalContext.current
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF020202))
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        // Alerta futurista / Ãcono de Advertencia Ã‰ter
        Box(
            modifier = Modifier
                .size(64.dp)
                .border(2.dp, FeterRed, RoundedCornerShape(16.dp))
                .background(FeterRed.copy(alpha = 0.1f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.Warning,
                contentDescription = null,
                tint = FeterRed,
                modifier = Modifier.size(36.dp)
            )
        }

        Text(
            text = "FÃ‰TER RESCUE TERMINAL",
            fontWeight = FontWeight.Black,
            fontSize = 18.sp,
            color = FeterRed,
            letterSpacing = 2.sp,
            textAlign = TextAlign.Center
        )

        Text(
            text = "Se ha interceptado un error crÃ­tico antes del cierre. El sistema Ã‰ter ha encapsulado el fallo para diagnÃ³stico.",
            fontSize = 11.sp,
            color = FeterTextGray,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(horizontal = 8.dp)
        )

        // Terminal de logs con borde de neon
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .border(1.dp, FeterRed.copy(alpha = 0.3f), RoundedCornerShape(16.dp)),
            colors = CardDefaults.cardColors(containerColor = FeterCardBg),
            shape = RoundedCornerShape(16.dp)
        ) {
            Box(modifier = Modifier.padding(14.dp)) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(scrollState)
                ) {
                    Text(
                        text = crashTrace,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 10.sp,
                        color = Color(0xFF00FF66), // Color verde terminal
                        lineHeight = 14.sp
                    )
                }
            }
        }

        // Acciones de control y rescate
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Button(
                onClick = {
                    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                    val clip = ClipData.newPlainText("Feter App Crash Log", crashTrace)
                    clipboard.setPrimaryClip(clip)
                    Toast.makeText(context, "Â¡Logs copiados al portapapeles!", Toast.LENGTH_SHORT).show()
                },
                colors = ButtonDefaults.buttonColors(containerColor = FeterCyan, contentColor = Color.Black),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.weight(1f)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(16.dp))
                    Text("COPIAR LOGS", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            OutlinedButton(
                onClick = onClearSettings,
                colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White),
                border = BorderStroke(1.dp, Color.White.copy(alpha = 0.2f)),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.weight(1.2f)
            ) {
                Text("VACIAR CACHÃ‰ / REINICIAR", fontSize = 9.sp, fontWeight = FontWeight.Bold)
            }

            Button(
                onClick = onRestart,
                colors = ButtonDefaults.buttonColors(containerColor = FeterRed, contentColor = Color.White),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.weight(0.8f)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                    Text("REINTENTAR", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

// --- COMPOSABLE DE ENTRADA GENERAL ---
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FeterStockAdminApp(viewModel: FeterStockViewModel = viewModel()) {
    val products by viewModel.products.collectAsState()
    val resellerLinks by viewModel.resellerLinks.collectAsState()
    val pedidos by viewModel.pedidos.collectAsState()
    val coupons by viewModel.coupons.collectAsState()
    val announcements by viewModel.announcements.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val currentUrl by viewModel.serverUrl.collectAsState()
    val currentKey by viewModel.apiKey.collectAsState()

    val context = LocalContext.current
    var activeTab by remember { mutableStateOf("inventory") }

    // DiÃ¡logos de acciÃ³n
    var editingProduct by remember { mutableStateOf<ProductDto?>(null) }
    var editingMetadataProduct by remember { mutableStateOf<ProductDto?>(null) }
    var showSettingsDialog by remember { mutableStateOf(false) }
    var showCreateDialog by remember { mutableStateOf(false) }
    var showBulkDialog by remember { mutableStateOf(false) }
    var showDuplicateDialog by remember { mutableStateOf(false) }


    // Estados de bÃºsqueda y filtro
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("Todos") }
    var selectedStockFilter by remember { mutableStateOf("all") } // all, in_stock, low, out
    var sortMode by remember { mutableStateOf("name_asc") } // name_asc, name_desc, price_asc, price_desc, stock_asc, stock_desc
    var showSortMenu by remember { mutableStateOf(false) }

    // Sincronizar catÃ¡logo inicial
    LaunchedEffect(Unit) {
        viewModel.loadSettings(context)
        viewModel.fetchProducts { success, msg ->
            if (!success) {
                Toast.makeText(context, msg, Toast.LENGTH_LONG).show()
                showSettingsDialog = true // Forzar configuraciÃ³n si falla
            }
        }
        viewModel.fetchResellerLinks()
        viewModel.fetchAdminModules()
    }

    // â”€â”€ MÃšSICA GLOBAL (persiste en todos los tabs) â”€â”€
    val globalPlaylist = remember { ETER_TRACKS.shuffled().toMutableList() }
    var musicIndex by remember { mutableStateOf(0) }
    var musicMuted by rememberSaveable { mutableStateOf(false) }
    var musicVolume by rememberSaveable { mutableStateOf(0.25f) }
    var musicPlaying by remember { mutableStateOf(false) }
    var showMiniPlayer by remember { mutableStateOf(false) }
    val globalPlayer = remember { mutableStateOf<MediaPlayer?>(null) }

    fun applyMusicVolume() {
        val v = if (musicMuted) 0f else musicVolume
        globalPlayer.value?.setVolume(v, v)
    }

    fun playMusicTrack(index: Int) {
        globalPlayer.value?.release()
        val track = globalPlaylist[index % globalPlaylist.size]
        val mp = MediaPlayer.create(context, track.rawId) ?: return
        mp.setVolume(if (musicMuted) 0f else musicVolume, if (musicMuted) 0f else musicVolume)
        mp.setOnCompletionListener {
            musicIndex = (musicIndex + 1) % globalPlaylist.size
        }
        mp.start()
        globalPlayer.value = mp
        musicPlaying = true
    }

    LaunchedEffect(musicIndex) { playMusicTrack(musicIndex) }
    LaunchedEffect(musicMuted, musicVolume) { applyMusicVolume() }
    DisposableEffect(Unit) { onDispose { globalPlayer.value?.release() } }

    Scaffold(
        topBar = {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(
                                Color(0xFF050508),
                                FeterDarkBg
                            )
                        )
                    )
            ) {
                TopAppBar(
                    title = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            // Glowing dot indicator
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(RoundedCornerShape(50))
                                    .background(FeterCyan)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = "F\u00c9TER",
                                fontWeight = FontWeight.Black,
                                fontFamily = FontFamily.SansSerif,
                                fontSize = 20.sp,
                                color = Color.White,
                                letterSpacing = 6.sp
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "STOCK",
                                fontWeight = FontWeight.Thin,
                                fontSize = 20.sp,
                                color = FeterTextLight,
                                letterSpacing = 4.sp
                            )
                        }
                    },
                    actions = {
                        IconButton(onClick = { showDuplicateDialog = true }) {
                            Icon(Icons.Default.CopyAll, contentDescription = "Duplicados", tint = FeterCyan, modifier = Modifier.size(20.dp))
                        }
                        IconButton(onClick = { viewModel.fetchProducts { _, msg -> Toast.makeText(context, msg, Toast.LENGTH_SHORT).show() } }) {
                            Icon(Icons.Default.Refresh, contentDescription = "Refrescar", tint = FeterTextLight, modifier = Modifier.size(20.dp))
                        }
                        IconButton(onClick = { showSettingsDialog = true }) {
                            Icon(Icons.Default.Settings, contentDescription = "Ajustes", tint = FeterTextLight, modifier = Modifier.size(20.dp))
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = Color.Transparent,
                        titleContentColor = Color.White
                    )
                )
            }
        },
        bottomBar = {
            NavigationBar(
                containerColor = Color(0xFF080808),
                tonalElevation = 0.dp,
                modifier = Modifier.border(
                    width = 1.dp,
                    brush = Brush.horizontalGradient(listOf(Color.Transparent, FeterCyan.copy(alpha = 0.15f), Color.Transparent)),
                    shape = RoundedCornerShape(topStart = 0.dp, topEnd = 0.dp)
                )
            ) {
                val navItems = listOf(
                    Triple("inventory", "Inventario", Icons.AutoMirrored.Filled.List),
                    Triple("dashboard", "Dashboard", Icons.Default.Dashboard),
                    Triple("analysis", "AnÃ¡lisis", Icons.Default.Analytics),
                    Triple("orders", "Pedidos", Icons.Default.ReceiptLong),
                    Triple("promotions", "Promos", Icons.Default.LocalOffer),
                    Triple("announcements", "Anuncios", Icons.Default.Campaign),
                    Triple("catalog", "CatÃ¡logo", Icons.Default.Edit),
                    Triple("music", "MÃºsica", Icons.Default.MusicNote)
                )
                navItems.forEach { item ->
                    NavigationBarItem(
                        selected = activeTab == item.first,
                        onClick = {
                            activeTab = item.first
                            if (item.first != "inventory" && item.first != "catalog" && item.first != "music" && item.first != "dashboard") {
                                viewModel.fetchAdminModules()
                            }
                        },
                        icon = { Icon(item.third, contentDescription = null, modifier = Modifier.size(20.dp)) },
                        label = { Text(item.second, fontSize = 8.sp, fontWeight = FontWeight.Bold, letterSpacing = 0.sp, maxLines = 1) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = FeterCyan,
                            selectedTextColor = FeterCyan,
                            unselectedIconColor = FeterTextGray,
                            unselectedTextColor = FeterTextGray,
                            indicatorColor = FeterCyan.copy(alpha = 0.08f)
                        )
                    )
                }
            }
        },
        floatingActionButton = {
            if (activeTab == "inventory" || activeTab == "catalog") {
                FloatingActionButton(
                    onClick = { showCreateDialog = true },
                    containerColor = FeterCyan,
                    contentColor = Color.Black,
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = "AÃ±adir Producto", modifier = Modifier.size(26.dp))
                }
            }
        },
        containerColor = FeterDarkBg
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            if (activeTab == "inventory") {
                val stockMetrics = buildStockPublicationMetrics(products)
                val lowStockCount = stockMetrics.lowStock
                val outOfStockCount = stockMetrics.outOfStock
                val categories = remember(products) {
                    listOf("Todos") + products.mapNotNull { it.category }.distinct().sorted()
                }

                val filtered = products
                    .filter {
                        (searchQuery.isEmpty() || it.name.contains(searchQuery, ignoreCase = true) ||
                            (it.category?.contains(searchQuery, ignoreCase = true) ?: false))
                    }
                    .filter {
                        selectedCategory == "Todos" || it.category.equals(selectedCategory, ignoreCase = true)
                    }
                    .filter {
                        val stock = it.stockBySize?.values?.sum() ?: 0
                        when (selectedStockFilter) {
                            "in_stock" -> stock >= 5
                            "low" -> stock in 1..4
                            "out" -> stock == 0
                            else -> true
                        }
                    }
                    .let { list ->
                        when (sortMode) {
                            "name_asc" -> list.sortedBy { it.name.lowercase() }
                            "name_desc" -> list.sortedByDescending { it.name.lowercase() }
                            "price_asc" -> list.sortedBy { it.price }
                            "price_desc" -> list.sortedByDescending { it.price }
                            "stock_asc" -> list.sortedBy { it.stockBySize?.values?.sum() ?: 0 }
                            "stock_desc" -> list.sortedByDescending { it.stockBySize?.values?.sum() ?: 0 }
                            else -> list
                        }
                    }

                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    item {
                        // --- PANEL DE MÃ‰TRICAS RÃPIDAS ---
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 16.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            MetricCard("Modelos", products.size.toString(), "en catÃ¡logo", FeterCyan, Modifier.weight(1f))
                            MetricCard("CrÃ­ticos", lowStockCount.toString(), "bajo stock", FeterOrange, Modifier.weight(1f))
                            MetricCard("Agotados", outOfStockCount.toString(), "sin pares", FeterRed, Modifier.weight(1f))
                        }
                    }

                    item {
                        StockPublicationControlCard(
                            metrics = stockMetrics,
                            onOpenCatalog = { activeTab = "catalog" },
                            onOpenInventory = { activeTab = "inventory" }
                        )
                    }

                    item {
                        // --- BUSCADOR ---
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 10.dp)
                                .clip(RoundedCornerShape(14.dp))
                                .background(FeterCardBg)
                                .border(1.dp, Color.White.copy(alpha = 0.06f), RoundedCornerShape(14.dp)),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            OutlinedTextField(
                                value = searchQuery,
                                onValueChange = { searchQuery = it },
                                placeholder = { Text("Buscar por nombre o marca...", fontSize = 13.sp, color = FeterTextGray) },
                                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = FeterTextGray, modifier = Modifier.size(20.dp)) },
                                trailingIcon = {
                                    if (searchQuery.isNotEmpty()) {
                                        IconButton(onClick = { searchQuery = "" }) {
                                            Icon(Icons.Default.Close, contentDescription = "Limpiar", tint = FeterTextGray, modifier = Modifier.size(18.dp))
                                        }
                                    }
                                },
                                singleLine = true,
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedTextColor = Color.White,
                                    unfocusedTextColor = Color.White,
                                    focusedBorderColor = Color.Transparent,
                                    unfocusedBorderColor = Color.Transparent,
                                    focusedContainerColor = Color.Transparent,
                                    unfocusedContainerColor = Color.Transparent
                                ),
                                shape = RoundedCornerShape(14.dp),
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }

                    item {
                        // --- FILTROS POR CATEGORÃA ---
                        LazyRow(
                            modifier = Modifier.padding(bottom = 8.dp),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            items(categories) { cat ->
                                val isSelected = selectedCategory == cat
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(20.dp))
                                        .background(
                                            if (isSelected) FeterCyan.copy(alpha = 0.15f)
                                            else Color.White.copy(alpha = 0.04f)
                                        )
                                        .border(
                                            1.dp,
                                            if (isSelected) FeterCyan.copy(alpha = 0.5f) else Color.White.copy(alpha = 0.06f),
                                            RoundedCornerShape(20.dp)
                                        )
                                        .clickable { selectedCategory = cat }
                                        .padding(horizontal = 14.dp, vertical = 7.dp)
                                ) {
                                    Text(
                                        text = cat.uppercase(),
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (isSelected) FeterCyan else FeterTextLight,
                                        letterSpacing = 0.5.sp
                                    )
                                }
                            }
                        }
                    }

                    item {
                        // --- FILTROS DE STOCK + ORDEN ---
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 12.dp),
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            val stockFilters = listOf("all" to "Todos", "in_stock" to "En Stock", "low" to "Bajo", "out" to "Agotado")
                            stockFilters.forEach { (key, label) ->
                                val isSelected = selectedStockFilter == key
                                val chipColor = when(key) {
                                    "in_stock" -> FeterGreen
                                    "low" -> FeterOrange
                                    "out" -> FeterRed
                                    else -> FeterTextLight
                                }
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(
                                            if (isSelected) chipColor.copy(alpha = 0.12f)
                                            else Color.Transparent
                                        )
                                        .border(
                                            1.dp,
                                            if (isSelected) chipColor.copy(alpha = 0.4f) else Color.White.copy(alpha = 0.04f),
                                            RoundedCornerShape(8.dp)
                                        )
                                        .clickable { selectedStockFilter = key }
                                        .padding(horizontal = 10.dp, vertical = 5.dp)
                                ) {
                                    Text(
                                        text = label,
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (isSelected) chipColor else FeterTextGray
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.weight(1f))

                            // BotÃ³n de orden
                            Box {
                                IconButton(
                                    onClick = { showSortMenu = true },
                                    modifier = Modifier
                                        .size(32.dp)
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(Color.White.copy(alpha = 0.04f))
                                ) {
                                    Icon(Icons.Default.KeyboardArrowDown, contentDescription = "Ordenar", tint = FeterTextLight, modifier = Modifier.size(16.dp))
                                }
                                DropdownMenu(
                                    expanded = showSortMenu,
                                    onDismissRequest = { showSortMenu = false },
                                    containerColor = Color(0xFF151518)
                                ) {
                                    listOf(
                                        "name_asc" to "Nombre Aâ†’Z",
                                        "name_desc" to "Nombre Zâ†’A",
                                        "price_asc" to "Precio â†‘",
                                        "price_desc" to "Precio â†“",
                                        "stock_asc" to "Stock â†‘",
                                        "stock_desc" to "Stock â†“"
                                    ).forEach { (mode, label) ->
                                        DropdownMenuItem(
                                            text = {
                                                Text(
                                                    label,
                                                    color = if (sortMode == mode) FeterCyan else Color.White,
                                                    fontSize = 12.sp,
                                                    fontWeight = if (sortMode == mode) FontWeight.Bold else FontWeight.Normal
                                                )
                                            },
                                            onClick = { sortMode = mode; showSortMenu = false },
                                            leadingIcon = {
                                                if (sortMode == mode) Icon(Icons.Default.Check, contentDescription = null, tint = FeterCyan, modifier = Modifier.size(14.dp))
                                            }
                                        )
                                    }
                                }
                            }
                        }
                    }

                    if (isLoading) {
                        item {
                            Box(modifier = Modifier.fillMaxWidth().height(200.dp), contentAlignment = Alignment.Center) {
                                CircularProgressIndicator(color = FeterCyan)
                            }
                        }
                    } else if (filtered.isEmpty()) {
                        item {
                            Box(modifier = Modifier.fillMaxWidth().height(200.dp), contentAlignment = Alignment.Center) {
                                Text(
                                    "No se encontraron calzados",
                                    color = FeterTextGray,
                                    fontSize = 12.sp,
                                    fontFamily = FontFamily.Monospace,
                                    textAlign = TextAlign.Center
                                )
                            }
                        }
                    } else {
                        items(filtered) { product ->
                            ProductRowItem(
                                product = product,
                                serverUrl = currentUrl,
                                onClick = { editingProduct = product },
                                onToggleActive = {
                                    viewModel.updateProductOperationalState(product, enable = !product.isOperationalActive()) { _, msg ->
                                        Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()
                                    }
                                },
                                onClearStock = {
                                    viewModel.updateProductOperationalState(product, enable = false, clearStock = true) { _, msg ->
                                        Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()
                                    }
                                }
                            )
                        }
                    }
                }
            } else if (activeTab == "dashboard") {
                AdminDashboardOverviewScreen(
                    products = products,
                    pedidos = pedidos,
                    coupons = coupons,
                    announcements = announcements,
                    resellerLinks = resellerLinks,
                    onTabChange = { tab ->
                        activeTab = tab
                        if (tab != "inventory" && tab != "catalog" && tab != "music" && tab != "dashboard") {
                            viewModel.fetchAdminModules()
                        }
                    }
                )
            } else if (activeTab == "analysis") {
                SalesAnalysisScreen(pedidos = pedidos)
            } else if (activeTab == "orders") {
                OrdersAdminScreen(
                    pedidos = pedidos,
                    onStatusChange = { id, status ->
                        viewModel.updatePedidoStatus(id, status) { _, msg -> Toast.makeText(context, msg, Toast.LENGTH_SHORT).show() }
                    }
                )
            } else if (activeTab == "promotions") {
                PromotionsAdminScreen(
                    coupons = coupons,
                    onSave = { coupon -> viewModel.saveCoupon(coupon) { _, msg -> Toast.makeText(context, msg, Toast.LENGTH_SHORT).show() } },
                    onDelete = { id -> viewModel.deleteCoupon(id) { _, msg -> Toast.makeText(context, msg, Toast.LENGTH_SHORT).show() } }
                )
            } else if (activeTab == "announcements") {
                AnnouncementsAdminScreen(
                    announcements = announcements,
                    products = products,
                    onAiFill = { payload, callback -> viewModel.generateAnnouncementAi(payload) { response, msg -> callback(response, msg) } },
                    onSave = { announcement, imageUri -> viewModel.saveAnnouncement(context, announcement, imageUri) { _, msg -> Toast.makeText(context, msg, Toast.LENGTH_SHORT).show() } },
                    onDelete = { id -> viewModel.deleteAnnouncement(id) { _, msg -> Toast.makeText(context, msg, Toast.LENGTH_SHORT).show() } }
                )
            } else if (activeTab == "catalog") {
                CatalogAdminScreen(
                    products = products,
                    resellerLinks = resellerLinks,
                    isLoading = isLoading,
                    serverUrl = currentUrl,
                    onUpdateProductSections = { product, sections ->
                        viewModel.updateProductSections(product.id, sections) { _, msg -> Toast.makeText(context, msg, Toast.LENGTH_SHORT).show() }
                    },
                    onToggleProductActive = { product ->
                        viewModel.updateProductOperationalState(product, enable = !product.isOperationalActive()) { _, msg ->
                            Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()
                        }
                    },
                    onClearProductStock = { product ->
                        viewModel.updateProductOperationalState(product, enable = false, clearStock = true) { _, msg ->
                            Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()
                        }
                    },
                    onEditProductMetadata = { selectedProduct ->
                        editingMetadataProduct = selectedProduct
                    }
                )
            } else if (activeTab == "music") {
                MusicPlayerScreen(
                    playlist = globalPlaylist,
                    trackIndex = musicIndex,
                    onTrackIndexChange = { musicIndex = it },
                    isMuted = musicMuted,
                    onMuteChange = { musicMuted = it },
                    volume = musicVolume,
                    onVolumeChange = { musicVolume = it },
                    isPlaying = musicPlaying
                )
            }

            // â”€â”€ MINI PLAYER FLOTANTE (visible en todos los tabs) â”€â”€
            if (activeTab != "music") {
                Box(
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(end = 16.dp, bottom = 16.dp)
                ) {
                    if (showMiniPlayer) {
                        Box(
                            modifier = Modifier
                                .width(220.dp)
                                .clip(RoundedCornerShape(18.dp))
                                .background(Color(0xFF0A0A0F).copy(alpha = 0.97f))
                                .border(1.dp, FeterCyan.copy(alpha = 0.25f), RoundedCornerShape(18.dp))
                                .padding(12.dp)
                        ) {
                            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                                    Text("â™« Ã‰TER", fontSize = 9.sp, fontWeight = FontWeight.Black, letterSpacing = 3.sp, color = FeterCyan)
                                    IconButton(onClick = { showMiniPlayer = false }, modifier = Modifier.size(20.dp)) {
                                        Icon(Icons.Default.Close, contentDescription = null, tint = FeterTextGray, modifier = Modifier.size(14.dp))
                                    }
                                }
                                Text(
                                    globalPlaylist.getOrNull(musicIndex % globalPlaylist.size)?.displayName?.uppercase() ?: "",
                                    fontSize = 11.sp, fontWeight = FontWeight.Black, color = Color.White,
                                    maxLines = 1, overflow = TextOverflow.Ellipsis
                                )
                                Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
                                    IconButton(onClick = { musicIndex = if (musicIndex == 0) globalPlaylist.size - 1 else musicIndex - 1 }, modifier = Modifier.size(28.dp)) {
                                        Icon(Icons.Default.SkipPrevious, contentDescription = null, tint = FeterTextLight, modifier = Modifier.size(18.dp))
                                    }
                                    Box(
                                        modifier = Modifier.size(34.dp).clip(RoundedCornerShape(50))
                                            .background(Brush.radialGradient(listOf(FeterCyan, Color(0xFF0055FF))))
                                            .clickable { musicMuted = !musicMuted },
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            if (musicMuted) Icons.Default.PlayArrow else Icons.Default.Pause,
                                            contentDescription = null, tint = Color.Black, modifier = Modifier.size(18.dp)
                                        )
                                    }
                                    IconButton(onClick = { musicIndex = (musicIndex + 1) % globalPlaylist.size }, modifier = Modifier.size(28.dp)) {
                                        Icon(Icons.Default.SkipNext, contentDescription = null, tint = FeterTextLight, modifier = Modifier.size(18.dp))
                                    }
                                    Spacer(Modifier.weight(1f))
                                    IconButton(onClick = { musicMuted = !musicMuted }, modifier = Modifier.size(28.dp)) {
                                        Icon(
                                            if (musicMuted) Icons.Default.VolumeOff else Icons.Default.VolumeUp,
                                            contentDescription = null,
                                            tint = if (musicMuted) FeterTextGray else FeterCyan,
                                            modifier = Modifier.size(16.dp)
                                        )
                                    }
                                }
                            }
                        }
                    } else {
                        // BotÃ³n mini para abrir el player
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .clip(RoundedCornerShape(50))
                                .background(Color(0xFF0A0A0F))
                                .border(1.dp, FeterCyan.copy(alpha = 0.35f), RoundedCornerShape(50))
                                .clickable { showMiniPlayer = true },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                if (musicMuted) Icons.Default.VolumeOff else Icons.Default.MusicNote,
                                contentDescription = "Player",
                                tint = if (musicMuted) FeterTextGray else FeterCyan,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                }
            }

            // --- CÃ“DIGO DE DIÃLOGOS Y VENTANAS FLOTANTES ---
            if (showSettingsDialog) {
                SettingsDialog(
                    initialUrl = currentUrl,
                    initialKey = currentKey,
                    onDismiss = { showSettingsDialog = false },
                    onSave = { url, key ->
                        viewModel.updateSettings(context, url, key)
                        showSettingsDialog = false
                        viewModel.fetchProducts { success, msg ->
                            Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()
                        }
                        viewModel.fetchResellerLinks()
                    }
                )
            }

            if (showDuplicateDialog) {
                DuplicateDetectorDialog(
                    products = products,
                    serverUrl = currentUrl,
                    onDismiss = { showDuplicateDialog = false },
                    onToggleActive = { product ->
                        viewModel.updateProductOperationalState(product, enable = !product.isOperationalActive()) { _, msg ->
                            Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()
                        }
                    },
                    onClearStock = { product ->
                        viewModel.updateProductOperationalState(product, enable = false, clearStock = true) { _, msg ->
                            Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()
                        }
                    },
                    onEditProduct = { product ->
                        editingProduct = product
                        showDuplicateDialog = false
                    }
                )
            }

            editingProduct?.let { product ->
                StockEditorDialog(
                    product = product,
                    serverUrl = currentUrl,
                    onDismiss = { editingProduct = null },
                    onSave = { updatedSizes, newPrice, newName ->
                        viewModel.updateProductStock(
                            productId = product.id,
                            stockMap = updatedSizes,
                            price = newPrice,
                            name = newName
                        ) { success, msg ->
                            Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()
                        }
                        editingProduct = null
                    }
                )
            }

            editingMetadataProduct?.let { product ->
                CatalogMetadataEditorDialog(
                    product = product,
                    serverUrl = currentUrl,
                    onDismiss = { editingMetadataProduct = null },
                    onSave = { updatedName, updatedBrand, updatedCategory, updatedPrice, updatedStatus, updatedDescription ->
                        viewModel.updateProductMetadata(
                            productId = product.id,
                            name = updatedName,
                            brand = updatedBrand,
                            category = updatedCategory,
                            price = updatedPrice,
                            status = updatedStatus,
                            description = updatedDescription,
                            stockMap = product.stockBySize ?: emptyMap()
                        ) { success, msg ->
                            Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()
                        }
                        editingMetadataProduct = null
                    }
                )
            }

            if (showCreateDialog) {
                CreateProductDialog(
                    onDismiss = { showCreateDialog = false },
                    onSave = { name, category, price, stockMap, imageUri ->
                        viewModel.createNewProductWithImage(context, name, category, price, stockMap, imageUri) { success, msg ->
                            Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()
                        }
                        showCreateDialog = false
                    }
                )
            }

            if (showBulkDialog) {
                BulkLoadDialog(
                    onDismiss = { showBulkDialog = false },
                    onSave = { bulkList ->
                        viewModel.bulkLoadStock(bulkList) { success, msg ->
                            Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()
                        }
                        showBulkDialog = false
                    }
                )
            }
        }
    }
}

// --- TARJETA DE METRICA PREMIUM ---
@Composable
fun MetricCard(title: String, value: String, subtitle: String, glowColor: Color, modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(18.dp))
    ) {
        // Fondo con gradiente sutil hacia el color de acento
        Box(
            modifier = Modifier
                .matchParentSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            FeterSurfaceBg,
                            glowColor.copy(alpha = 0.04f)
                        )
                    )
                )
                .border(
                    BorderStroke(
                        1.dp,
                        Brush.verticalGradient(
                            colors = listOf(
                                Color.White.copy(alpha = 0.07f),
                                glowColor.copy(alpha = 0.2f)
                            )
                        )
                    ),
                    RoundedCornerShape(18.dp)
                )
        )
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp, vertical = 14.dp),
            horizontalAlignment = Alignment.Start
        ) {
            // Indicador de color vivo en la esquina
            Box(
                modifier = Modifier
                    .size(width = 24.dp, height = 3.dp)
                    .clip(RoundedCornerShape(50))
                    .background(glowColor)
            )
            Spacer(modifier = Modifier.height(10.dp))
            Text(
                text = value,
                fontSize = 28.sp,
                fontWeight = FontWeight.Black,
                color = Color.White,
                letterSpacing = (-0.5).sp
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = title.uppercase(),
                fontSize = 9.sp,
                fontWeight = FontWeight.ExtraBold,
                color = glowColor,
                letterSpacing = 1.5.sp
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = subtitle,
                fontSize = 9.sp,
                fontWeight = FontWeight.Medium,
                color = FeterTextGray,
                letterSpacing = 0.3.sp
            )
        }
    }
}

// --- FILA DE PRODUCTO INDIVIDUAL PREMIUM ---
@Composable
fun ProductRowItem(
    product: ProductDto,
    serverUrl: String,
    onClick: () -> Unit,
    onToggleActive: (() -> Unit)? = null,
    onClearStock: (() -> Unit)? = null
) {
    val totalStock = product.stockBySize?.values?.sum() ?: 0
    val stockColor = when {
        totalStock == 0 -> FeterRed
        totalStock < 5 -> FeterOrange
        else -> FeterGreen
    }
    val sizesCount = product.stockBySize?.count { it.value > 0 } ?: 0
    val isActive = product.isOperationalActive()
    val imageCount = product.imageCount()

    val imageUrl = remember(product.images, product.image, serverUrl) { resolveProductImageUrl(product, serverUrl) }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .clickable(onClick = onClick)
    ) {
        // Fondo con gradiente sutil
        Box(
            modifier = Modifier
                .matchParentSize()
                .background(
                    Brush.horizontalGradient(
                        colors = listOf(
                            FeterSurfaceBg,
                            Color(0xFF0D0D10)
                        )
                    )
                )
                .border(
                    1.dp,
                    Color.White.copy(alpha = 0.05f),
                    RoundedCornerShape(16.dp)
                )
        )

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // --- MINIATURA DE IMAGEN PREMIUM ---
            Box(
                modifier = Modifier
                    .size(88.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color(0xFF080808)),
                contentAlignment = Alignment.Center
            ) {
                if (imageUrl != null) {
                    AsyncImage(
                        model = ImageRequest.Builder(LocalContext.current)
                            .data(imageUrl)
                            .crossfade(400)
                            .build(),
                        contentDescription = product.name,
                        modifier = Modifier
                            .fillMaxSize()
                            .clip(RoundedCornerShape(12.dp)),
                        contentScale = androidx.compose.ui.layout.ContentScale.Crop
                    )
                } else {
                    // Placeholder con gradiente premium
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(
                                Brush.radialGradient(
                                    colors = listOf(
                                        Color(0xFF151518),
                                        Color(0xFF080808)
                                    )
                                )
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                imageVector = Icons.Default.ShoppingCart,
                                contentDescription = null,
                                tint = FeterTextGray.copy(alpha = 0.4f),
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "SIN IMG",
                                fontSize = 7.sp,
                                fontWeight = FontWeight.Bold,
                                color = FeterTextGray.copy(alpha = 0.4f),
                                letterSpacing = 1.sp
                            )
                        }
                    }
                }

                // Stock badge overlay en la esquina inferior derecha de la imagen
                Box(
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(4.dp)
                        .clip(RoundedCornerShape(6.dp))
                        .background(Color.Black.copy(alpha = 0.75f))
                        .border(1.dp, stockColor.copy(alpha = 0.5f), RoundedCornerShape(6.dp))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = "$totalStock",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black,
                        color = stockColor
                    )
                }
            }

            Spacer(modifier = Modifier.width(14.dp))

            // --- INFORMACIÃ“N DEL PRODUCTO ---
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = product.name.trim().uppercase(),
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = Color.White,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    letterSpacing = 0.5.sp
                )
                Text(
                    text = (product.category ?: "Sin CategorÃ­a").uppercase(),
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = FeterTextGray,
                    letterSpacing = 1.sp
                )

                // Precio + talles disponibles
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    // Precio con formato formateado
                    Text(
                        text = "$" + String.format("%,d", product.price.toInt()),
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Black,
                        color = FeterCyan
                    )
                    // Chip de talles
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(Color.White.copy(alpha = 0.04f))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = "$sizesCount talles",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = FeterTextLight
                        )
                    }
                }

                Spacer(modifier = Modifier.height(4.dp))

                // Botones de acciÃ³n dentro de la columna para evitar exprimir el texto
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    item {
                        StockActionChip(
                            label = if (isActive) "PUBLICADO" else "OCULTO",
                            color = if (isActive) FeterGreen else FeterTextGray,
                            icon = if (isActive) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                            onClick = onToggleActive
                        )
                    }
                    item {
                        StockActionChip(
                            label = "IMG $imageCount",
                            color = if (imageCount > 0) FeterCyan else FeterOrange,
                            icon = Icons.Default.Image,
                            onClick = null
                        )
                    }
                    if (totalStock > 0) {
                        item {
                            StockActionChip(
                                label = "STOCK 0",
                                color = FeterRed,
                                icon = Icons.Default.DeleteOutline,
                                onClick = onClearStock
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.width(8.dp))

            Icon(
                imageVector = Icons.Default.KeyboardArrowRight,
                contentDescription = null,
                tint = FeterTextGray.copy(alpha = 0.3f),
                modifier = Modifier.size(20.dp)
            )
        }
    }
}

// --- DIÃLOGO DE AJUSTES DEL SERVIDOR ---
@Composable
fun StockActionChip(
    label: String,
    color: Color,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    onClick: (() -> Unit)?
) {
    Row(
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .background(color.copy(alpha = 0.1f))
            .border(1.dp, color.copy(alpha = 0.25f), RoundedCornerShape(8.dp))
            .then(if (onClick != null) Modifier.clickable { onClick() } else Modifier)
            .padding(horizontal = 7.dp, vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(12.dp))
        Text(label, fontSize = 8.sp, fontWeight = FontWeight.Black, color = color, maxLines = 1)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsDialog(initialUrl: String, initialKey: String, onDismiss: () -> Unit, onSave: (String, String) -> Unit) {
    var url by remember { mutableStateOf(initialUrl) }
    var key by remember { mutableStateOf(initialKey) }
    val scrollState = rememberScrollState()

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .wrapContentHeight()
                .border(1.dp, FeterCyan.copy(alpha = 0.2f), RoundedCornerShape(28.dp)),
            colors = CardDefaults.cardColors(containerColor = FeterCardBg),
            shape = RoundedCornerShape(28.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(24.dp)
                    .fillMaxWidth()
                    .verticalScroll(scrollState),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    "CONEXIÃ“N FÃ‰TER PROTOCOL",
                    fontWeight = FontWeight.Black,
                    fontSize = 13.sp,
                    color = FeterCyan,
                    letterSpacing = 2.sp
                )

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    "CONEXIONES PRECONFIGURADAS",
                    fontWeight = FontWeight.Bold,
                    fontSize = 10.sp,
                    color = FeterTextGray,
                    letterSpacing = 1.sp,
                    modifier = Modifier.align(Alignment.Start)
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Preset 1: Next.js Production
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            url = "https://www.eter.store/"
                            key = "Feter"
                        }
                        .border(
                            1.dp,
                            if (url == "https://www.eter.store/") FeterCyan else Color.White.copy(alpha = 0.05f),
                            RoundedCornerShape(12.dp)
                        ),
                    colors = CardDefaults.cardColors(
                        containerColor = if (url == "https://www.eter.store/") FeterCyan.copy(alpha = 0.05f) else FeterDarkBg
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("SITIO WEB Ã‰TER (Recomendado)", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                            if (url == "https://www.eter.store/") {
                                Icon(Icons.Default.Check, contentDescription = null, tint = FeterCyan, modifier = Modifier.size(14.dp))
                            }
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            "API Next.js. Sincroniza stock y actualiza cachÃ© del sitio web automÃ¡ticamente.",
                            color = FeterTextGray,
                            fontSize = 9.sp,
                            lineHeight = 12.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Preset 2: Direct Supabase Connection
                val supabasePresetUrl = "https://tolzrvsykzmvndvomllt.supabase.co/rest/v1/"
                val supabasePresetKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvbHpydnN5a3ptdm5kdm9tbGx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwODQ5MDAsImV4cCI6MjA4NTY2MDkwMH0.pYQlxzkeUO6xsIDwe77kKCtapcVn507pgmcXPjhQH-o"
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            url = supabasePresetUrl
                            key = supabasePresetKey
                        }
                        .border(
                            1.dp,
                            if (url == supabasePresetUrl) FeterCyan else Color.White.copy(alpha = 0.05f),
                            RoundedCornerShape(12.dp)
                        ),
                    colors = CardDefaults.cardColors(
                        containerColor = if (url == supabasePresetUrl) FeterCyan.copy(alpha = 0.05f) else FeterDarkBg
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("SUPABASE DIRECTO (PostgREST)", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                            if (url == supabasePresetUrl) {
                                Icon(Icons.Default.Check, contentDescription = null, tint = FeterCyan, modifier = Modifier.size(14.dp))
                            }
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            "ConexiÃ³n directa a base de datos. Bypass Next.js para lectura/escritura de alta velocidad.",
                            color = FeterTextGray,
                            fontSize = 9.sp,
                            lineHeight = 12.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Preset 3: Local Emulator Next.js
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            url = "http://10.0.2.2:3000/"
                            key = "Feter"
                        }
                        .border(
                            1.dp,
                            if (url == "http://10.0.2.2:3000/") FeterCyan else Color.White.copy(alpha = 0.05f),
                            RoundedCornerShape(12.dp)
                        ),
                    colors = CardDefaults.cardColors(
                        containerColor = if (url == "http://10.0.2.2:3000/") FeterCyan.copy(alpha = 0.05f) else FeterDarkBg
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("DESARROLLO LOCAL (Emulador)", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                            if (url == "http://10.0.2.2:3000/") {
                                Icon(Icons.Default.Check, contentDescription = null, tint = FeterCyan, modifier = Modifier.size(14.dp))
                            }
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            "Servidor Next.js ejecutÃ¡ndose localmente en la PC de desarrollo (10.0.2.2:3000).",
                            color = FeterTextGray,
                            fontSize = 9.sp,
                            lineHeight = 12.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                Text(
                    "CONFIGURACIÃ“N MANUAL",
                    fontWeight = FontWeight.Bold,
                    fontSize = 10.sp,
                    color = FeterTextGray,
                    letterSpacing = 1.sp,
                    modifier = Modifier.align(Alignment.Start)
                )

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = url,
                    onValueChange = { url = it },
                    label = { Text("URL del Servidor / API") },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedBorderColor = FeterCyan,
                        unfocusedBorderColor = FeterGray
                    ),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = key,
                    onValueChange = { key = it },
                    label = { Text("Token de Seguridad / API Key") },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedBorderColor = FeterCyan,
                        unfocusedBorderColor = FeterGray
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(24.dp))

                Row(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    TextButton(
                        onClick = onDismiss,
                        colors = ButtonDefaults.textButtonColors(contentColor = Color.White),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("CANCELAR")
                    }
                    Button(
                        onClick = { onSave(url, key) },
                        colors = ButtonDefaults.buttonColors(containerColor = FeterCyan, contentColor = Color.Black),
                        modifier = Modifier.weight(1.5f)
                    ) {
                        Text("ENLAZAR")
                    }
                }
            }
        }
    }
}

// --- DIÃLOGO EDITOR DE TALLAS PREMIUM ---
@Composable
fun StockEditorDialog(
    product: ProductDto,
    serverUrl: String,
    onDismiss: () -> Unit,
    onSave: (Map<String, Int>, Double, String) -> Unit
) {
    var name by remember { mutableStateOf(product.name) }
    var priceStr by remember { mutableStateOf(product.price.toInt().toString()) }
    var quickSetValue by remember { mutableStateOf("") }

    val allSizesList = (33..46).map { it.toString() }
    val currentSizes = remember {
        val map = mutableStateMapOf<String, Int>()
        allSizesList.forEach { size ->
            map[size] = product.stockBySize?.get(size) ?: 0
        }
        map
    }

    val totalStock = currentSizes.values.sum()
    val activeSizes = currentSizes.count { it.value > 0 }

    val imageUrl = remember(product.images, product.image, serverUrl) { resolveProductImageUrl(product, serverUrl) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.92f)
                .border(
                    BorderStroke(
                        1.dp,
                        Brush.verticalGradient(
                            colors = listOf(
                                Color.White.copy(alpha = 0.1f),
                                FeterCyan.copy(alpha = 0.3f)
                            )
                        )
                    ),
                    RoundedCornerShape(28.dp)
                ),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF080808)),
            shape = RoundedCornerShape(28.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .fillMaxSize()
            ) {
                // Header con info del producto
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            "EDITOR DE PRODUCTO",
                            fontWeight = FontWeight.Black,
                            fontSize = 14.sp,
                            color = Color.White,
                            letterSpacing = 0.5.sp
                        )
                        Text(
                            "FÃ‰TER SYSTEM Â· SINCRO EN VIVO",
                            fontWeight = FontWeight.Bold,
                            fontSize = 8.sp,
                            color = FeterCyan,
                            letterSpacing = 2.sp
                        )
                    }
                    // Live stock counter badge
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(FeterCyan.copy(alpha = 0.1f))
                            .border(1.dp, FeterCyan.copy(alpha = 0.3f), RoundedCornerShape(10.dp))
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("$totalStock", fontWeight = FontWeight.Black, fontSize = 18.sp, color = FeterCyan)
                            Spacer(modifier = Modifier.width(4.dp))
                            Column {
                                Text("PARES", fontSize = 7.sp, fontWeight = FontWeight.Bold, color = FeterCyan, letterSpacing = 1.sp)
                                Text("$activeSizes talles", fontSize = 7.sp, color = FeterTextGray)
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Imagen compacta
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(130.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(Color(0xFF040404))
                        .border(1.dp, Color.White.copy(alpha = 0.06f), RoundedCornerShape(14.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    if (imageUrl != null) {
                        AsyncImage(
                            model = ImageRequest.Builder(LocalContext.current)
                                .data(imageUrl)
                                .crossfade(400)
                                .build(),
                            contentDescription = name,
                            modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(14.dp)),
                            contentScale = androidx.compose.ui.layout.ContentScale.Crop
                        )
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(
                                    Brush.verticalGradient(
                                        colors = listOf(Color.Transparent, Color.Black.copy(alpha = 0.6f))
                                    )
                                )
                        )
                    } else {
                        Icon(Icons.Default.ShoppingCart, contentDescription = null, tint = FeterTextGray.copy(alpha = 0.3f), modifier = Modifier.size(36.dp))
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Campos de ediciÃ³n en fila compacta
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        label = { Text("Nombre", fontSize = 10.sp) },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White, unfocusedTextColor = Color.White,
                            focusedBorderColor = FeterCyan, unfocusedBorderColor = FeterGray,
                            focusedContainerColor = FeterDarkBg, unfocusedContainerColor = FeterDarkBg
                        ),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1.5f),
                        singleLine = true,
                        textStyle = androidx.compose.ui.text.TextStyle(fontSize = 13.sp)
                    )
                    OutlinedTextField(
                        value = priceStr,
                        onValueChange = { priceStr = it },
                        label = { Text("Precio $", fontSize = 10.sp) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White, unfocusedTextColor = Color.White,
                            focusedBorderColor = FeterCyan, unfocusedBorderColor = FeterGray,
                            focusedContainerColor = FeterDarkBg, unfocusedContainerColor = FeterDarkBg
                        ),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f),
                        singleLine = true,
                        textStyle = androidx.compose.ui.text.TextStyle(fontSize = 13.sp)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // --- ACCIONES RÃPIDAS DE STOCK ---
                Text("ACCIONES RÃPIDAS", fontSize = 9.sp, fontWeight = FontWeight.Black, color = FeterTextGray, letterSpacing = 1.5.sp)
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    // Reset a 0
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(FeterRed.copy(alpha = 0.08f))
                            .border(1.dp, FeterRed.copy(alpha = 0.25f), RoundedCornerShape(8.dp))
                            .clickable { allSizesList.forEach { currentSizes[it] = 0 } }
                            .padding(horizontal = 10.dp, vertical = 7.dp)
                    ) {
                        Text("Reset 0", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = FeterRed)
                    }
                    // +1 a todos
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(FeterGreen.copy(alpha = 0.08f))
                            .border(1.dp, FeterGreen.copy(alpha = 0.25f), RoundedCornerShape(8.dp))
                            .clickable { allSizesList.forEach { currentSizes[it] = (currentSizes[it] ?: 0) + 1 } }
                            .padding(horizontal = 10.dp, vertical = 7.dp)
                    ) {
                        Text("+1 Todos", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = FeterGreen)
                    }
                    // -1 a todos
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(FeterOrange.copy(alpha = 0.08f))
                            .border(1.dp, FeterOrange.copy(alpha = 0.25f), RoundedCornerShape(8.dp))
                            .clickable { allSizesList.forEach { val v = currentSizes[it] ?: 0; if (v > 0) currentSizes[it] = v - 1 } }
                            .padding(horizontal = 10.dp, vertical = 7.dp)
                    ) {
                        Text("-1 Todos", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = FeterOrange)
                    }
                    Spacer(modifier = Modifier.weight(1f))
                    // Set valor custom
                    OutlinedTextField(
                        value = quickSetValue,
                        onValueChange = { quickSetValue = it },
                        placeholder = { Text("N", fontSize = 9.sp, color = FeterTextGray) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White, unfocusedTextColor = Color.White,
                            focusedBorderColor = FeterCyan, unfocusedBorderColor = FeterGray,
                            focusedContainerColor = FeterDarkBg, unfocusedContainerColor = FeterDarkBg
                        ),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.width(48.dp).height(38.dp),
                        textStyle = androidx.compose.ui.text.TextStyle(fontSize = 11.sp, textAlign = TextAlign.Center)
                    )
                    Box(
                        modifier = Modifier
                            .height(38.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(FeterCyan.copy(alpha = 0.12f))
                            .border(1.dp, FeterCyan.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
                            .clickable {
                                val v = quickSetValue.toIntOrNull() ?: 0
                                allSizesList.forEach { currentSizes[it] = v }
                            }
                            .padding(horizontal = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("Set", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = FeterCyan)
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // --- CARGA RÃPIDA MASIVA ---
                var shorthandStock by remember { mutableStateOf("") }
                Text("CARGA RÃPIDA (FÃ“RMULA PROVEEDOR)", fontSize = 9.sp, fontWeight = FontWeight.Black, color = FeterTextGray, letterSpacing = 1.5.sp)
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = shorthandStock,
                        onValueChange = { shorthandStock = it },
                        placeholder = { Text("Ej: 33x3,34,35x2,38/39", fontSize = 10.sp, color = FeterTextGray) },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White, unfocusedTextColor = Color.White,
                            focusedBorderColor = FeterCyan, unfocusedBorderColor = FeterGray,
                            focusedContainerColor = FeterDarkBg, unfocusedContainerColor = FeterDarkBg
                        ),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.weight(1.8f).height(46.dp),
                        textStyle = androidx.compose.ui.text.TextStyle(fontSize = 11.sp)
                    )
                    // BotÃ³n Sumar
                    Box(
                        modifier = Modifier
                            .height(46.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(FeterGreen.copy(alpha = 0.12f))
                            .border(1.dp, FeterGreen.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
                            .clickable {
                                val parsed = parseShorthandStock(shorthandStock)
                                parsed.forEach { (size, qty) ->
                                    currentSizes[size] = (currentSizes[size] ?: 0) + qty
                                }
                                shorthandStock = ""
                            }
                            .padding(horizontal = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("SUMAR", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = FeterGreen)
                    }
                    // BotÃ³n Reemplazar
                    Box(
                        modifier = Modifier
                            .height(46.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(FeterCyan.copy(alpha = 0.12f))
                            .border(1.dp, FeterCyan.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
                            .clickable {
                                val parsed = parseShorthandStock(shorthandStock)
                                allSizesList.forEach { size ->
                                    currentSizes[size] = parsed[size] ?: 0
                                }
                                shorthandStock = ""
                            }
                            .padding(horizontal = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("REEMPLAZAR", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = FeterCyan)
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))
                Text("STOCK POR TALLE", fontSize = 9.sp, fontWeight = FontWeight.Black, color = FeterTextGray, letterSpacing = 1.5.sp)
                Spacer(modifier = Modifier.height(6.dp))

                // Grid compacto de talles
                LazyColumn(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    // Mostrar de a 2 por fila
                    val pairs = allSizesList.chunked(2)
                    items(pairs) { pair ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            pair.forEach { size ->
                                val qty = currentSizes[size] ?: 0
                                Row(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(FeterDarkBg)
                                        .border(1.dp, if (qty > 0) FeterCyan.copy(alpha = 0.15f) else Color.White.copy(alpha = 0.03f), RoundedCornerShape(10.dp))
                                        .padding(horizontal = 8.dp, vertical = 5.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(size, color = if (qty > 0) Color.White else FeterTextGray, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                                    ) {
                                        IconButton(
                                            onClick = { if (qty > 0) currentSizes[size] = qty - 1 },
                                            modifier = Modifier.size(28.dp).clip(RoundedCornerShape(6.dp)).background(FeterGray)
                                        ) {
                                            Icon(Icons.Default.KeyboardArrowDown, contentDescription = null, tint = Color.White, modifier = Modifier.size(14.dp))
                                        }
                                        Text(
                                            qty.toString(),
                                            color = if (qty > 0) FeterCyan else FeterTextGray,
                                            fontSize = 14.sp,
                                            fontWeight = FontWeight.Black,
                                            modifier = Modifier.width(24.dp),
                                            textAlign = TextAlign.Center
                                        )
                                        IconButton(
                                            onClick = { currentSizes[size] = qty + 1 },
                                            modifier = Modifier.size(28.dp).clip(RoundedCornerShape(6.dp)).background(FeterGray)
                                        ) {
                                            Icon(Icons.Default.Add, contentDescription = null, tint = Color.White, modifier = Modifier.size(14.dp))
                                        }
                                    }
                                }
                            }
                            // Si queda un impar, padding
                            if (pair.size == 1) {
                                Spacer(modifier = Modifier.weight(1f))
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    TextButton(
                        onClick = onDismiss,
                        colors = ButtonDefaults.textButtonColors(contentColor = Color.White),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("CANCELAR", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                    Button(
                        onClick = {
                            val parsedPrice = priceStr.toDoubleOrNull() ?: product.price
                            onSave(currentSizes.toMap(), parsedPrice, name)
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = FeterCyan, contentColor = Color.Black),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1.5f)
                    ) {
                        Text("GUARDAR CAMBIOS", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

// --- DIÃLOGO DE CREACIÃ“N PREMIUM ---
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateProductDialog(onDismiss: () -> Unit, onSave: (String, String, Double, Map<String, Int>, Uri?) -> Unit) {
    var name by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("Sneakers") }
    var priceStr by remember { mutableStateOf("") }
    var quickStockStr by remember { mutableStateOf("") }
    var nameError by remember { mutableStateOf(false) }
    var priceError by remember { mutableStateOf(false) }
    var imageUri by remember { mutableStateOf<Uri?>(null) }

    val categoryOptions = listOf("Sneakers", "Urbanas", "Deportivas", "Borcegos", "Sandalias", "Casuales")
    val allSizesList = (33..46).map { it.toString() }
    val sizeMap = remember { mutableStateMapOf<String, Int>().apply { allSizesList.forEach { put(it, 0) } } }
    val totalStock = sizeMap.values.sum()

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.92f)
                .border(
                    BorderStroke(1.dp, Brush.verticalGradient(
                        colors = listOf(Color.White.copy(alpha = 0.08f), FeterGreen.copy(alpha = 0.25f))
                    )),
                    RoundedCornerShape(28.dp)
                ),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF080808)),
            shape = RoundedCornerShape(28.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .fillMaxSize()
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("NUEVO PRODUCTO", fontWeight = FontWeight.Black, fontSize = 14.sp, color = Color.White, letterSpacing = 0.5.sp)
                        Text("CREAR CALZADO EN CATÃLOGO", fontWeight = FontWeight.Bold, fontSize = 8.sp, color = FeterGreen, letterSpacing = 2.sp)
                    }
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(FeterGreen.copy(alpha = 0.1f))
                            .border(1.dp, FeterGreen.copy(alpha = 0.3f), RoundedCornerShape(10.dp))
                            .padding(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Text("$totalStock prs", fontWeight = FontWeight.Black, fontSize = 12.sp, color = FeterGreen)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // --- SELECCIONADOR DE IMAGEN PREMIUM ---
                val imageLauncher = rememberLauncherForActivityResult(
                    contract = ActivityResultContracts.GetContent()
                ) { uri ->
                    imageUri = uri
                }

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(110.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(Color(0xFF040404))
                        .border(
                            1.dp,
                            if (imageUri != null) FeterGreen.copy(alpha = 0.3f) else Color.White.copy(alpha = 0.06f),
                            RoundedCornerShape(14.dp)
                        )
                        .clickable { imageLauncher.launch("image/*") },
                    contentAlignment = Alignment.Center
                ) {
                    if (imageUri != null) {
                        AsyncImage(
                            model = ImageRequest.Builder(LocalContext.current)
                                .data(imageUri)
                                .crossfade(400)
                                .build(),
                            contentDescription = "Miniatura",
                            modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(14.dp)),
                            contentScale = androidx.compose.ui.layout.ContentScale.Crop
                        )
                        // Gradient cover
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(
                                    Brush.verticalGradient(
                                        colors = listOf(Color.Transparent, Color.Black.copy(alpha = 0.6f))
                                    )
                                )
                        )
                        // BotÃ³n para borrar
                        Box(
                            modifier = Modifier
                                .align(Alignment.TopEnd)
                                .padding(8.dp)
                                .size(24.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(FeterRed.copy(alpha = 0.8f))
                                .clickable { imageUri = null },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Close, contentDescription = "Quitar", tint = Color.White, modifier = Modifier.size(14.dp))
                        }
                        Text(
                            "CAMBIAR IMAGEN",
                            fontWeight = FontWeight.Bold,
                            fontSize = 8.sp,
                            color = Color.White.copy(alpha = 0.8f),
                            modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 6.dp),
                            letterSpacing = 1.sp
                        )
                    } else {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            Icon(Icons.Default.Add, contentDescription = null, tint = FeterGreen.copy(alpha = 0.7f), modifier = Modifier.size(24.dp))
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                "SUBIR FOTO DE PRODUCTO",
                                fontWeight = FontWeight.Black,
                                fontSize = 8.sp,
                                color = FeterGreen,
                                letterSpacing = 1.5.sp
                            )
                            Text(
                                "Soporta JPG, PNG desde tu galerÃ­a",
                                fontSize = 7.sp,
                                color = FeterTextGray
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Nombre con validaciÃ³n
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it; nameError = false },
                    label = { Text("Nombre del Calzado *", fontSize = 11.sp) },
                    isError = nameError,
                    supportingText = { if (nameError) Text("Obligatorio", color = FeterRed, fontSize = 9.sp) },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.White, unfocusedTextColor = Color.White,
                        focusedBorderColor = FeterCyan, unfocusedBorderColor = FeterGray,
                        focusedContainerColor = FeterDarkBg, unfocusedContainerColor = FeterDarkBg,
                        errorBorderColor = FeterRed
                    ),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(8.dp))

                // CategorÃ­a con chips seleccionables
                Text("CATEGORÃA", fontSize = 9.sp, fontWeight = FontWeight.Black, color = FeterTextGray, letterSpacing = 1.5.sp)
                Spacer(modifier = Modifier.height(6.dp))
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    items(categoryOptions) { cat ->
                        val isSelected = category == cat
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(20.dp))
                                .background(if (isSelected) FeterCyan.copy(alpha = 0.15f) else Color.White.copy(alpha = 0.04f))
                                .border(1.dp, if (isSelected) FeterCyan.copy(alpha = 0.5f) else Color.White.copy(alpha = 0.06f), RoundedCornerShape(20.dp))
                                .clickable { category = cat }
                                .padding(horizontal = 14.dp, vertical = 7.dp)
                        ) {
                            Text(cat.uppercase(), fontSize = 9.sp, fontWeight = FontWeight.Bold, color = if (isSelected) FeterCyan else FeterTextLight)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Precio con validaciÃ³n
                OutlinedTextField(
                    value = priceStr,
                    onValueChange = { priceStr = it; priceError = false },
                    label = { Text("Precio Base ($) *", fontSize = 11.sp) },
                    isError = priceError,
                    supportingText = { if (priceError) Text("Ingresa un precio vÃ¡lido", color = FeterRed, fontSize = 9.sp) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.White, unfocusedTextColor = Color.White,
                        focusedBorderColor = FeterCyan, unfocusedBorderColor = FeterGray,
                        focusedContainerColor = FeterDarkBg, unfocusedContainerColor = FeterDarkBg,
                        errorBorderColor = FeterRed
                    ),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Stock con acciones rÃ¡pidas
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text("STOCK", fontSize = 9.sp, fontWeight = FontWeight.Black, color = FeterTextGray, letterSpacing = 1.5.sp)
                    Spacer(modifier = Modifier.weight(1f))
                    OutlinedTextField(
                        value = quickStockStr,
                        onValueChange = { quickStockStr = it },
                        placeholder = { Text("N", fontSize = 9.sp, color = FeterTextGray) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White, unfocusedTextColor = Color.White,
                            focusedBorderColor = FeterCyan, unfocusedBorderColor = FeterGray,
                            focusedContainerColor = FeterDarkBg, unfocusedContainerColor = FeterDarkBg
                        ),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.width(50.dp).height(36.dp),
                        textStyle = androidx.compose.ui.text.TextStyle(fontSize = 11.sp, textAlign = TextAlign.Center)
                    )
                    Box(
                        modifier = Modifier
                            .height(36.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(FeterCyan.copy(alpha = 0.12f))
                            .border(1.dp, FeterCyan.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
                            .clickable {
                                val v = quickStockStr.toIntOrNull() ?: 0
                                allSizesList.forEach { sizeMap[it] = v }
                            }
                            .padding(horizontal = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("Set Todos", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = FeterCyan)
                    }
                    Box(
                        modifier = Modifier
                            .height(36.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(FeterRed.copy(alpha = 0.08f))
                            .border(1.dp, FeterRed.copy(alpha = 0.2f), RoundedCornerShape(8.dp))
                            .clickable { allSizesList.forEach { sizeMap[it] = 0 } }
                            .padding(horizontal = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("Reset", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = FeterRed)
                    }
                }

                Spacer(modifier = Modifier.height(6.dp))

                // --- CARGA RÃPIDA MASIVA ---
                var shorthandStock by remember { mutableStateOf("") }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = shorthandStock,
                        onValueChange = { shorthandStock = it },
                        placeholder = { Text("FÃ³rmula: 33x3,34,35x2,38/39", fontSize = 10.sp, color = FeterTextGray) },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White, unfocusedTextColor = Color.White,
                            focusedBorderColor = FeterGreen, unfocusedBorderColor = FeterGray,
                            focusedContainerColor = FeterDarkBg, unfocusedContainerColor = FeterDarkBg
                        ),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.weight(1.8f).height(46.dp),
                        textStyle = androidx.compose.ui.text.TextStyle(fontSize = 11.sp)
                    )
                    // BotÃ³n Sumar
                    Box(
                        modifier = Modifier
                            .height(46.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(FeterGreen.copy(alpha = 0.12f))
                            .border(1.dp, FeterGreen.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
                            .clickable {
                                val parsed = parseShorthandStock(shorthandStock)
                                parsed.forEach { (size, qty) ->
                                    sizeMap[size] = (sizeMap[size] ?: 0) + qty
                                }
                                shorthandStock = ""
                            }
                            .padding(horizontal = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("SUMAR", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = FeterGreen)
                    }
                    // BotÃ³n Reemplazar
                    Box(
                        modifier = Modifier
                            .height(46.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(FeterCyan.copy(alpha = 0.12f))
                            .border(1.dp, FeterCyan.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
                            .clickable {
                                val parsed = parseShorthandStock(shorthandStock)
                                allSizesList.forEach { size ->
                                    sizeMap[size] = parsed[size] ?: 0
                                }
                                shorthandStock = ""
                            }
                            .padding(horizontal = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("REEMPLAZAR", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = FeterCyan)
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Grid compacto de talles
                LazyColumn(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    val pairs = allSizesList.chunked(2)
                    items(pairs) { pair ->
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            pair.forEach { size ->
                                val qty = sizeMap[size] ?: 0
                                Row(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(FeterDarkBg)
                                        .border(1.dp, if (qty > 0) FeterGreen.copy(alpha = 0.15f) else Color.White.copy(alpha = 0.03f), RoundedCornerShape(10.dp))
                                        .padding(horizontal = 8.dp, vertical = 5.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(size, color = if (qty > 0) Color.White else FeterTextGray, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                        IconButton(
                                            onClick = { if (qty > 0) sizeMap[size] = qty - 1 },
                                            modifier = Modifier.size(28.dp).clip(RoundedCornerShape(6.dp)).background(FeterGray)
                                        ) { Icon(Icons.Default.KeyboardArrowDown, contentDescription = null, tint = Color.White, modifier = Modifier.size(14.dp)) }
                                        Text(qty.toString(), color = if (qty > 0) FeterGreen else FeterTextGray, fontSize = 14.sp, fontWeight = FontWeight.Black, modifier = Modifier.width(24.dp), textAlign = TextAlign.Center)
                                        IconButton(
                                            onClick = { sizeMap[size] = qty + 1 },
                                            modifier = Modifier.size(28.dp).clip(RoundedCornerShape(6.dp)).background(FeterGray)
                                        ) { Icon(Icons.Default.Add, contentDescription = null, tint = Color.White, modifier = Modifier.size(14.dp)) }
                                    }
                                }
                            }
                            if (pair.size == 1) Spacer(modifier = Modifier.weight(1f))
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    TextButton(onClick = onDismiss, colors = ButtonDefaults.textButtonColors(contentColor = Color.White), modifier = Modifier.weight(1f)) {
                        Text("CANCELAR", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                    Button(
                        onClick = {
                            nameError = name.isBlank()
                            priceError = priceStr.toDoubleOrNull() == null || (priceStr.toDoubleOrNull() ?: 0.0) <= 0
                            if (!nameError && !priceError) {
                                onSave(name, category, priceStr.toDoubleOrNull() ?: 0.0, sizeMap.toMap(), imageUri)
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = FeterGreen, contentColor = Color.Black),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1.5f)
                    ) {
                        Text("CREAR PRODUCTO", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

// --- DIÃLOGO DE CARGA MASIVA MEJORADO ---
@Composable
fun BulkLoadDialog(onDismiss: () -> Unit, onSave: (List<NewProductDto>) -> Unit) {
    var rawText by remember { mutableStateOf("") }
    val parsedCount = remember(rawText) {
        rawText.lines().count { it.trim().isNotEmpty() && !it.trim().startsWith("//") }
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.85f)
                .border(
                    BorderStroke(1.dp, Brush.verticalGradient(
                        colors = listOf(Color.White.copy(alpha = 0.08f), FeterOrange.copy(alpha = 0.25f))
                    )),
                    RoundedCornerShape(28.dp)
                ),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF080808)),
            shape = RoundedCornerShape(28.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .fillMaxSize()
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("CARGA MASIVA", fontWeight = FontWeight.Black, fontSize = 14.sp, color = Color.White, letterSpacing = 0.5.sp)
                        Text("IMPORTACIÃ“N EXPRESO", fontWeight = FontWeight.Bold, fontSize = 8.sp, color = FeterOrange, letterSpacing = 2.sp)
                    }
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(FeterOrange.copy(alpha = 0.1f))
                            .border(1.dp, FeterOrange.copy(alpha = 0.3f), RoundedCornerShape(10.dp))
                            .padding(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Text("$parsedCount items", fontWeight = FontWeight.Black, fontSize = 12.sp, color = FeterOrange)
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Instrucciones de formato
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(Color.White.copy(alpha = 0.03f))
                        .border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(10.dp))
                        .padding(10.dp)
                ) {
                    Column {
                        Text("FORMATO CSV", fontSize = 9.sp, fontWeight = FontWeight.Black, color = FeterOrange, letterSpacing = 1.sp)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Nombre, CategorÃ­a, Precio, Stock33, Stock34, ... Stock46", fontSize = 9.sp, color = FeterTextLight)
                        Text("MÃ­nimo: Nombre, CategorÃ­a, Precio", fontSize = 8.sp, color = FeterTextGray)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("// Ejemplo:", fontSize = 8.sp, color = FeterTextGray)
                        Text("Nike Dunk Low, Sneakers, 75000, 0,0,0,0,5,5,5,5,3,3,0,0,0,0", fontSize = 8.sp, color = FeterCyan.copy(alpha = 0.7f))
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = rawText,
                    onValueChange = { rawText = it },
                    placeholder = { Text("PegÃ¡ tu listado aquÃ­...", fontSize = 12.sp, color = FeterTextGray) },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedBorderColor = FeterOrange.copy(alpha = 0.5f),
                        unfocusedBorderColor = FeterGray,
                        focusedContainerColor = FeterDarkBg,
                        unfocusedContainerColor = FeterDarkBg
                    ),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    textStyle = androidx.compose.ui.text.TextStyle(fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                )

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    TextButton(onClick = onDismiss, colors = ButtonDefaults.textButtonColors(contentColor = Color.White), modifier = Modifier.weight(1f)) {
                        Text("CANCELAR", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                    Button(
                        onClick = {
                            val allSizes = (33..46).map { it.toString() }
                            val parsed = mutableListOf<NewProductDto>()
                            rawText.lines().forEach { line ->
                                if (line.trim().startsWith("//") || line.trim().isEmpty()) return@forEach
                                val parts = line.split(",").map { it.trim() }
                                if (parts.size >= 3) {
                                    val pName = parts[0]
                                    val pCategory = parts[1]
                                    val pPrice = parts[2].toDoubleOrNull() ?: 0.0
                                    val stockMap = mutableMapOf<String, Int>()
                                    allSizes.forEachIndexed { idx, size ->
                                        val stockIdx = 3 + idx
                                        stockMap[size] = if (parts.size > stockIdx) parts[stockIdx].toIntOrNull() ?: 0 else 0
                                    }
                                    parsed.add(NewProductDto(name = pName, category = pCategory, price = pPrice, stockBySize = stockMap))
                                }
                            }
                            onSave(parsed)
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = FeterOrange, contentColor = Color.Black),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1.5f),
                        enabled = parsedCount > 0
                    ) {
                        Text("CARGAR $parsedCount ITEMS", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
fun AdminSectionTitle(title: String, subtitle: String? = null) {
    Column(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 14.dp)) {
        Text(title.uppercase(), fontSize = 18.sp, fontWeight = FontWeight.Black, color = Color.White, letterSpacing = 1.sp)
        if (subtitle != null) Text(subtitle, fontSize = 11.sp, color = FeterTextGray, lineHeight = 15.sp)
    }
}

@Composable
fun StockPublicationControlCard(
    metrics: StockPublicationMetrics,
    onOpenCatalog: () -> Unit,
    onOpenInventory: () -> Unit,
    showActions: Boolean = true
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(Brush.verticalGradient(listOf(Color(0xFF071013), Color(0xFF09090B))))
            .border(1.dp, FeterCyan.copy(alpha = 0.18f), RoundedCornerShape(20.dp))
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Column(modifier = Modifier.weight(1f)) {
                Text("CONTROL DE PUBLICACIONES", fontSize = 9.sp, fontWeight = FontWeight.Black, color = FeterCyan, letterSpacing = 1.5.sp)
                Text("Stock visible, imÃ¡genes y estado operativo.", fontSize = 11.sp, color = FeterTextLight)
            }
            Icon(Icons.Default.ShoppingCart, contentDescription = null, tint = FeterCyan, modifier = Modifier.size(22.dp))
        }

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
            MiniStockMetric("Publicadas", metrics.activeProducts.toString(), FeterGreen, Modifier.weight(1f))
            MiniStockMetric("Con imagen", metrics.publishedWithImages.toString(), FeterCyan, Modifier.weight(1f))
            MiniStockMetric("ImÃ¡genes", metrics.imageSlots.toString(), FeterOrange, Modifier.weight(1f))
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
            MiniStockMetric("CatÃ¡logo", metrics.catalogVisible.toString(), FeterCyan, Modifier.weight(1f))
            MiniStockMetric("Inicio", metrics.homeVisible.toString(), FeterGreen, Modifier.weight(1f))
            MiniStockMetric("Sin stock", metrics.outOfStock.toString(), FeterRed, Modifier.weight(1f))
        }

        if (showActions) {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                Button(
                    onClick = onOpenCatalog,
                    colors = ButtonDefaults.buttonColors(containerColor = FeterCyan, contentColor = Color.Black),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Text("GESTIONAR CATÃLOGO", fontSize = 10.sp, fontWeight = FontWeight.Black)
                }
                OutlinedButton(
                    onClick = onOpenInventory,
                    border = BorderStroke(1.dp, Color.White.copy(alpha = 0.16f)),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Text("VER STOCK", fontSize = 10.sp, fontWeight = FontWeight.Black)
                }
            }
        }
    }
}

@Composable
fun MiniStockMetric(label: String, value: String, color: Color, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(14.dp))
            .background(Color.White.copy(alpha = 0.035f))
            .border(1.dp, color.copy(alpha = 0.16f), RoundedCornerShape(14.dp))
            .padding(10.dp)
    ) {
        Text(value, fontSize = 18.sp, fontWeight = FontWeight.Black, color = Color.White)
        Text(label.uppercase(), fontSize = 8.sp, fontWeight = FontWeight.Bold, color = color, maxLines = 1, overflow = TextOverflow.Ellipsis)
    }
}

// --- PANTALLA DASHBOARD ADMIN OVERVIEW ---
@Composable
fun AdminDashboardOverviewScreen(
    products: List<ProductDto>,
    pedidos: List<PedidoDto>,
    coupons: List<CouponDto>,
    announcements: List<AnnouncementDto>,
    resellerLinks: List<ResellerLinkDto>,
    onTabChange: (String) -> Unit
) {
    val validOrders = pedidos.filter { it.status != "cancelado" }
    val revenue = validOrders.sumOf { it.totalAmount ?: 0.0 }
    val units = validOrders.sumOf { order -> order.items?.sumOf { it.quantity ?: it.qty ?: 1 } ?: 0 }
    val stockMetrics = buildStockPublicationMetrics(products)
    val totalStock = stockMetrics.totalPairs
    val lowStock = stockMetrics.lowStock
    val outOfStock = stockMetrics.outOfStock
    val activeCoupons = coupons.count { it.isActive }
    val activeAnnouncements = announcements.count { it.isActive }
    val recentOrders = pedidos.take(5)
    val topModels = validOrders.flatMap { it.items.orEmpty() }
        .groupBy { it.productName ?: it.name ?: "Desconocido" }
        .mapValues { e -> e.value.sumOf { it.quantity ?: it.qty ?: 1 } }
        .toList().sortedByDescending { it.second }.take(5)

    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(horizontal = 14.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // HEADER
        item {
            Column(modifier = Modifier.fillMaxWidth().padding(top = 16.dp, bottom = 4.dp)) {
                Text(
                    "DASHBOARD ADMIN",
                    fontSize = 8.sp, fontWeight = FontWeight.Black,
                    letterSpacing = 2.sp, color = FeterCyan
                )
                Text(
                    "Resumen General",
                    fontSize = 22.sp, fontWeight = FontWeight.Black,
                    color = Color.White, letterSpacing = (-0.3).sp
                )
            }
        }

        // MÃ‰TRICAS PRINCIPALES â€” fila 1
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                MetricCard("Ingresos", "$" + String.format("%,.0f", revenue), "en pedidos", FeterGreen, Modifier.weight(1f))
                MetricCard("Pedidos", pedidos.size.toString(), "registrados", FeterCyan, Modifier.weight(1f))
            }
        }

        // MÃ‰TRICAS â€” fila 2
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                MetricCard("Unidades", units.toString(), "vendidas", FeterOrange, Modifier.weight(1f))
                MetricCard("Modelos", products.size.toString(), "en catÃ¡logo", FeterCyan, Modifier.weight(1f))
            }
        }

        // STOCK HEALTH
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(18.dp))
                    .background(FeterSurfaceBg)
                    .border(1.dp, Color.White.copy(alpha = 0.07f), RoundedCornerShape(18.dp))
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text("SALUD DE STOCK", fontSize = 9.sp, fontWeight = FontWeight.Black, color = FeterCyan, letterSpacing = 1.5.sp)
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    // Pares totales
                    Column(modifier = Modifier.weight(1f)) {
                        Text(totalStock.toString(), fontSize = 22.sp, fontWeight = FontWeight.Black, color = Color.White)
                        Text("pares totales", fontSize = 9.sp, color = FeterTextGray)
                    }
                    // Stock crÃ­tico
                    Column(modifier = Modifier.weight(1f)) {
                        Text(lowStock.toString(), fontSize = 22.sp, fontWeight = FontWeight.Black, color = FeterOrange)
                        Text("bajo stock", fontSize = 9.sp, color = FeterTextGray)
                    }
                    // Sin stock
                    Column(modifier = Modifier.weight(1f)) {
                        Text(outOfStock.toString(), fontSize = 22.sp, fontWeight = FontWeight.Black, color = FeterRed)
                        Text("agotados", fontSize = 9.sp, color = FeterTextGray)
                    }
                }
                // Barra de salud
                val healthPercent = if (products.isNotEmpty()) {
                    (products.size - outOfStock).toFloat() / products.size
                } else 1f
                val barColor = when {
                    healthPercent > 0.8f -> FeterGreen
                    healthPercent > 0.5f -> FeterOrange
                    else -> FeterRed
                }
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                        Text("Disponibilidad", fontSize = 9.sp, color = FeterTextGray)
                        Text("${(healthPercent * 100).toInt()}%", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = barColor)
                    }
                    Box(modifier = Modifier.fillMaxWidth().height(4.dp).clip(RoundedCornerShape(50)).background(FeterGray)) {
                        Box(modifier = Modifier.fillMaxWidth(healthPercent).height(4.dp).clip(RoundedCornerShape(50)).background(barColor))
                    }
                }
            }
        }

        item {
            StockPublicationControlCard(
                metrics = stockMetrics,
                onOpenCatalog = { onTabChange("catalog") },
                onOpenInventory = { onTabChange("inventory") }
            )
        }

        // ACCESO RÃPIDO A MÃ“DULOS
        item {
            Text("ACCESO RÃPIDO", fontSize = 9.sp, fontWeight = FontWeight.Black, color = FeterTextGray, letterSpacing = 1.5.sp)
        }
        item {
            val quickActions = listOf(
                Triple("AnÃ¡lisis", Icons.Default.Analytics, "analysis"),
                Triple("Pedidos", Icons.Default.ReceiptLong, "orders"),
                Triple("Promos", Icons.Default.LocalOffer, "promotions"),
                Triple("Anuncios", Icons.Default.Campaign, "announcements"),
                Triple("CatÃ¡logo", Icons.Default.Edit, "catalog"),
                Triple("MÃºsica", Icons.Default.MusicNote, "music")
            )
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.horizontalScroll(rememberScrollState())
            ) {
                quickActions.forEach { (label, icon, tab) ->
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(14.dp))
                            .background(FeterCardBg)
                            .border(1.dp, FeterCyan.copy(alpha = 0.15f), RoundedCornerShape(14.dp))
                            .clickable { onTabChange(tab) }
                            .padding(horizontal = 14.dp, vertical = 12.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Icon(icon, contentDescription = null, tint = FeterCyan, modifier = Modifier.size(20.dp))
                            Text(label, fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        }
                    }
                }
            }
        }

        // ESTADO DEL SISTEMA
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(18.dp))
                    .background(FeterSurfaceBg)
                    .border(1.dp, Color.White.copy(alpha = 0.06f), RoundedCornerShape(18.dp))
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text("ESTADO DEL SISTEMA", fontSize = 9.sp, fontWeight = FontWeight.Black, color = FeterCyan, letterSpacing = 1.5.sp)
                val systemItems = listOf(
                    Triple("Cupones activos", activeCoupons.toString(), FeterGreen),
                    Triple("Anuncios activos", activeAnnouncements.toString(), FeterCyan),
                    Triple("Revendedores", resellerLinks.size.toString(), FeterOrange),
                    Triple("Pedidos pendientes", pedidos.count { it.status == "pendiente" }.toString(), FeterOrange),
                    Triple("Pedidos completados", pedidos.count { it.status == "completado" }.toString(), FeterGreen),
                    Triple("Pedidos cancelados", pedidos.count { it.status == "cancelado" }.toString(), FeterRed)
                )
                systemItems.forEach { (label, value, color) ->
                    Row(
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(label, fontSize = 11.sp, color = FeterTextLight)
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(color.copy(alpha = 0.12f))
                                .padding(horizontal = 10.dp, vertical = 3.dp)
                        ) {
                            Text(value, fontSize = 11.sp, fontWeight = FontWeight.Black, color = color)
                        }
                    }
                    HorizontalDivider(color = Color.White.copy(alpha = 0.04f), thickness = 0.5.dp)
                }
            }
        }

        // ÃšLTIMOS PEDIDOS
        if (recentOrders.isNotEmpty()) {
            item {
                Text("ÃšLTIMOS PEDIDOS", fontSize = 9.sp, fontWeight = FontWeight.Black, color = FeterTextGray, letterSpacing = 1.5.sp)
            }
            items(recentOrders) { order ->
                val statusColor = when (order.status) {
                    "completado" -> FeterGreen
                    "cancelado" -> FeterRed
                    "procesando" -> FeterOrange
                    else -> FeterCyan
                }
                AdminListCard(
                    title = order.customerName ?: "Sin nombre",
                    subtitle = "$${String.format("%,.0f", order.totalAmount ?: 0.0)} Â· ${order.status ?: "pendiente"}",
                    accent = statusColor
                )
            }
        }

        // TOP MODELOS
        if (topModels.isNotEmpty()) {
            item {
                Text("TOP MODELOS", fontSize = 9.sp, fontWeight = FontWeight.Black, color = FeterTextGray, letterSpacing = 1.5.sp)
            }
            items(topModels) { (name, qty) ->
                AdminListCard(title = name, subtitle = "$qty unidades vendidas", accent = FeterGreen)
            }
        }

        item { Spacer(modifier = Modifier.height(20.dp)) }
    }
}

@Composable
fun SalesAnalysisScreen(pedidos: List<PedidoDto>) {
    val validOrders = pedidos.filter { it.status != "cancelado" }
    val revenue = validOrders.sumOf { it.totalAmount ?: 0.0 }
    val units = validOrders.sumOf { order -> order.items?.sumOf { it.quantity ?: it.qty ?: 1 } ?: 0 }
    val topModels = validOrders.flatMap { it.items.orEmpty() }
        .groupBy { it.productName ?: it.name ?: "Modelo sin nombre" }
        .mapValues { entry -> entry.value.sumOf { it.quantity ?: it.qty ?: 1 } }
        .toList()
        .sortedByDescending { it.second }
        .take(8)

    LazyColumn(modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { AdminSectionTitle("AnÃ¡lisis de ventas", "Pedidos, ingresos, unidades vendidas y modelos con mayor rotaciÃ³n.") }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                MetricCard("Pedidos", pedidos.size.toString(), "totales", FeterCyan, Modifier.weight(1f))
                MetricCard("Ingresos", "$" + String.format("%,.0f", revenue), "no cancelados", FeterGreen, Modifier.weight(1f))
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                MetricCard("Unidades", units.toString(), "vendidas", FeterOrange, Modifier.weight(1f))
                MetricCard("Activos", validOrders.size.toString(), "operables", FeterCyan, Modifier.weight(1f))
            }
        }
        items(topModels) { item -> AdminListCard(title = item.first, subtitle = "${item.second} unidades vendidas", accent = FeterGreen) }
    }
}

@Composable
fun OrdersAdminScreen(pedidos: List<PedidoDto>, onStatusChange: (String, String) -> Unit) {
    var search by remember { mutableStateOf("") }
    var status by remember { mutableStateOf("Todos") }
    val statuses = listOf("Todos", "pendiente", "procesando", "completado", "cancelado")
    val filtered = pedidos.filter { (status == "Todos" || it.status == status) && ((it.customerName ?: "").contains(search, ignoreCase = true) || it.id.contains(search, ignoreCase = true)) }

    LazyColumn(modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item { AdminSectionTitle("Pedidos", "Buscar, filtrar y actualizar pedidos entrantes desde pedidos.") }
        item { OutlinedTextField(value = search, onValueChange = { search = it }, placeholder = { Text("Buscar pedido o cliente", color = FeterTextGray) }, modifier = Modifier.fillMaxWidth(), singleLine = true) }
        item { LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) { items(statuses) { st -> FilterChip(selected = status == st, onClick = { status = st }, label = { Text(st.uppercase(), fontSize = 9.sp) }) } } }
        items(filtered) { order ->
            Column(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(FeterCardBg).border(1.dp, Color.White.copy(alpha = 0.08f), RoundedCornerShape(16.dp)).padding(14.dp)) {
                Text(order.customerName ?: "Cliente sin nombre", color = Color.White, fontWeight = FontWeight.Black, fontSize = 14.sp)
                Text("$" + String.format("%,.0f", order.totalAmount ?: 0.0) + " Â· ${order.items?.size ?: 0} Ã­tems Â· ${order.status ?: "pendiente"}", color = FeterTextLight, fontSize = 11.sp)
                Spacer(Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    statuses.drop(1).forEach { st -> AssistChip(onClick = { onStatusChange(order.id, st) }, label = { Text(st.take(4).uppercase(), fontSize = 8.sp) }) }
                }
            }
        }
    }
}

@Composable
fun PromotionsAdminScreen(coupons: List<CouponDto>, onSave: (CouponDto) -> Unit, onDelete: (String) -> Unit) {
    var code by remember { mutableStateOf("") }
    var value by remember { mutableStateOf("") }
    LazyColumn(modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item { AdminSectionTitle("Promociones", "CRUD de cupones de descuento conectados a coupons.") }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                OutlinedTextField(value = code, onValueChange = { code = it.uppercase() }, label = { Text("CÃ³digo") }, modifier = Modifier.weight(1f), singleLine = true)
                OutlinedTextField(value = value, onValueChange = { value = it }, label = { Text("Valor %") }, modifier = Modifier.weight(1f), singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number))
            }
        }
        item {
            Button(onClick = {
                val amount = value.toDoubleOrNull() ?: return@Button
                onSave(CouponDto(code = code.ifBlank { "ETER${System.currentTimeMillis() % 1000}" }, value = amount))
                code = ""; value = ""
            }, colors = ButtonDefaults.buttonColors(containerColor = FeterCyan, contentColor = Color.Black), modifier = Modifier.fillMaxWidth()) {
                Text("CREAR CUPÃ“N", fontWeight = FontWeight.Black)
            }
        }
        items(coupons) { coupon ->
            AdminListCard(title = coupon.code, subtitle = "${coupon.type} Â· ${coupon.value} Â· ${if (coupon.isActive) "activo" else "inactivo"}", accent = FeterCyan, trailing = { coupon.id?.let { TextButton(onClick = { onDelete(it) }) { Text("Eliminar", color = FeterRed) } } })
        }
    }
}

@Composable
fun AnnouncementsAdminScreenOld(announcements: List<AnnouncementDto>, onSave: (AnnouncementDto) -> Unit, onDelete: (String) -> Unit) {
    var title by remember { mutableStateOf("") }
    var content by remember { mutableStateOf("") }
    var pages by remember { mutableStateOf(setOf("home", "catalog")) }
    val pageOptions = listOf("home" to "Inicio", "catalog" to "CatÃ¡logo", "community" to "Comunidad", "about" to "Sobre Ã‰ter", "contact" to "Contacto")

    LazyColumn(modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item { AdminSectionTitle("Anuncios flotantes", "Plantillas y pÃ¡ginas especÃ­ficas para anuncios web.") }
        item { OutlinedTextField(value = title, onValueChange = { title = it }, label = { Text("TÃ­tulo") }, modifier = Modifier.fillMaxWidth(), singleLine = true) }
        item { OutlinedTextField(value = content, onValueChange = { content = it }, label = { Text("Contenido / CTA") }, modifier = Modifier.fillMaxWidth()) }
        item {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(pageOptions) { page ->
                    FilterChip(selected = pages.contains(page.first), onClick = { pages = if (pages.contains(page.first)) pages - page.first else pages + page.first }, label = { Text(page.second, fontSize = 9.sp) })
                }
            }
        }
        item {
            Button(onClick = {
                onSave(AnnouncementDto(title = title.ifBlank { "Anuncio Ã‰ter" }, content = content, targetPages = pages.ifEmpty { setOf("home") }.toList(), templateKey = "premium"))
                title = ""; content = ""
            }, colors = ButtonDefaults.buttonColors(containerColor = FeterCyan, contentColor = Color.Black), modifier = Modifier.fillMaxWidth()) {
                Text("CREAR ANUNCIO", fontWeight = FontWeight.Black)
            }
        }
        items(announcements) { announcement ->
            AdminListCard(title = announcement.title, subtitle = "${announcement.targetPages.joinToString()} Â· ${announcement.templateKey}", accent = FeterOrange, trailing = { announcement.id?.let { TextButton(onClick = { onDelete(it) }) { Text("Eliminar", color = FeterRed) } } })
        }
    }
}

@Composable
fun AnnouncementsAdminScreen(
    announcements: List<AnnouncementDto>,
    products: List<ProductDto>,
    onAiFill: (AnnouncementAiRequest, (AnnouncementAiResponse?, String) -> Unit) -> Unit,
    onSave: (AnnouncementDto, Uri?) -> Unit,
    onDelete: (String) -> Unit
) {
    var title by remember { mutableStateOf("") }
    var content by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("DROP") }
    var imageUrl by remember { mutableStateOf("") }
    var selectedImageUri by remember { mutableStateOf<Uri?>(null) }
    var ctaLabel by remember { mutableStateOf("VER CATALOGO") }
    var ctaUrl by remember { mutableStateOf("/resellers") }
    var priority by remember { mutableStateOf("10") }
    var isActive by remember { mutableStateOf(true) }
    var displayMode by remember { mutableStateOf("floating") }
    var templateKey by remember { mutableStateOf("drop") }
    var pages by remember { mutableStateOf(setOf("home")) }
    var editing by remember { mutableStateOf<AnnouncementDto?>(null) }
    var selectedProduct by remember { mutableStateOf<ProductDto?>(null) }
    var productQuery by remember { mutableStateOf("") }
    var previewAnnouncement by remember { mutableStateOf<AnnouncementDto?>(null) }
    var editorOpen by remember { mutableStateOf(false) }
    var isAiLoading by remember { mutableStateOf(false) }
    var aiStatus by remember { mutableStateOf<String?>(null) }

    val pageOptions = listOf("all" to "Toda la web", "home" to "Inicio", "catalog" to "Catalogo", "community" to "Comunidad", "about" to "Sobre ETER", "contact" to "Contacto")
    val displayOptions = listOf("floating" to "Centro", "banner" to "Barra", "modal" to "Modal")
    val templates = listOf(
        Triple("drop", "Drop premium", "Nuevo ingreso con imagen, urgencia y CTA directo."),
        Triple("flash", "Flash sale", "Oferta corta con prioridad alta y mensaje fuerte."),
        Triple("stock", "Stock real", "Aviso util para talles, disponibilidad y reposicion."),
        Triple("community", "Comunidad", "Invita a revendedores o clientes a una accion.")
    )
    val visualStyles = listOf(
        Triple("drop", "Cyan luxury", "Vidrio oscuro, glow cyan, producto protagonista."),
        Triple("rose", "Rose pulse", "Negro premium con acento rosa y energia editorial."),
        Triple("gold", "Gold elite", "Lujo sobrio, borde dorado y CTA fuerte."),
        Triple("mono", "Noir minimal", "Blanco/negro limpio para anuncios elegantes."),
        Triple("flash", "Flash neon", "Alto contraste para liquidaciones y urgencia."),
        Triple("stock", "Stock grid", "Tecnico, claro y perfecto para disponibilidad.")
    )

    val activeCount = announcements.count { it.isActive }
    val catalogCount = announcements.count { it.targetPages.contains("catalog") || it.targetPages.contains("all") }
    val filteredProducts = remember(products, productQuery) {
        products
            .filter { product ->
                productQuery.isBlank() ||
                    product.name.contains(productQuery, ignoreCase = true) ||
                    product.brand?.contains(productQuery, ignoreCase = true) == true ||
                    product.category?.contains(productQuery, ignoreCase = true) == true
            }
            .take(12)
    }

    fun resetForm() {
        editing = null
        title = ""
        content = ""
        category = "DROP"
        imageUrl = ""
        selectedImageUri = null
        ctaLabel = "VER CATALOGO"
        ctaUrl = "/resellers"
        priority = "10"
        isActive = true
        displayMode = "floating"
        templateKey = "drop"
        pages = setOf("home")
        selectedProduct = null
        editorOpen = false
    }

    fun applyProduct(product: ProductDto) {
        selectedProduct = product
        title = product.name.uppercase()
        category = product.brand?.ifBlank { product.category ?: "ETER" }?.uppercase() ?: "ETER"
        imageUrl = product.images?.firstOrNull().orEmpty().ifBlank { product.image.orEmpty() }
        ctaLabel = "PEDIR POR WHATSAPP"
        ctaUrl = "/catalog/${product.id}"
        pages = setOf("catalog")
        if (content.isBlank()) {
            content = "Modelo disponible con stock real. Precio: $" + String.format("%,.0f", product.price) + ". Consulta talles antes de que se agote."
        }
    }

    fun fillWithAi() {
        val product = selectedProduct
        isAiLoading = true
        aiStatus = "Conectando con Gemini..."
        onAiFill(
            AnnouncementAiRequest(
                templateKey = templateKey,
                productName = product?.name ?: title.ifBlank { null },
                brand = product?.brand,
                category = product?.category ?: category,
                price = product?.price,
                stock = product?.stock,
                targetPages = pages.toList(),
                tone = templateKey
            )
        ) { response, message ->
            isAiLoading = false
            aiStatus = message
            if (response != null) {
                title = response.title?.uppercase().orEmpty().ifBlank { title }
                content = response.content.orEmpty().ifBlank { content }
                category = response.category?.uppercase().orEmpty().ifBlank { category.ifBlank { product?.brand ?: "ETER" } }
                ctaLabel = response.ctaLabel?.uppercase().orEmpty().ifBlank { ctaLabel }
                priority = (response.priority ?: priority.toIntOrNull() ?: 0).toString()
                displayMode = response.displayMode.orEmpty().ifBlank { displayMode }
                imageUrl = imageUrl.ifBlank { product?.images?.firstOrNull().orEmpty().ifBlank { product?.image.orEmpty() } }
                ctaUrl = if (product != null) "/catalog/${product.id}" else ctaUrl.ifBlank { "/resellers" }
            }
        }
    }

    fun applyTemplate(key: String) {
        templateKey = key
        when (key) {
            "flash" -> {
                title = "SOLO POR HOY"
                content = "Oferta especial por tiempo limitado. Ideal para mover stock rapido y activar ventas por WhatsApp."
                category = "FLASH"
                ctaLabel = "VER OFERTAS"
                priority = "30"
                displayMode = "modal"
                pages = setOf("catalog")
            }
            "stock" -> {
                title = "STOCK ACTUALIZADO"
                content = "Modelos disponibles con talles visibles y compra rapida para revendedores."
                category = "STOCK"
                ctaLabel = "REVISAR STOCK"
                priority = "20"
                displayMode = "floating"
                pages = setOf("catalog")
            }
            "community" -> {
                title = "UNITE A LA COMUNIDAD"
                content = "Accede a novedades, soporte y herramientas para vender mas rapido."
                category = "COMUNIDAD"
                ctaLabel = "ENTRAR"
                ctaUrl = "/comunidad"
                priority = "8"
                displayMode = "banner"
                pages = setOf("home", "community")
            }
            else -> {
                title = "NUEVO DROP ETER"
                content = "Modelos seleccionados, visual premium y CTA directo para convertir visitas en consultas."
                category = "DROP"
                ctaLabel = "VER CATALOGO"
                ctaUrl = "/resellers"
                priority = "15"
                displayMode = "floating"
                pages = pages.ifEmpty { setOf("home") }
            }
        }
    }

    fun loadAnnouncement(announcement: AnnouncementDto) {
        editing = announcement
        title = announcement.title
        content = announcement.content.orEmpty()
        category = announcement.category ?: "DROP"
        imageUrl = announcement.imageUrl.orEmpty()
        selectedImageUri = null
        ctaLabel = announcement.ctaLabel ?: "VER CATALOGO"
        ctaUrl = announcement.ctaUrl ?: "/resellers"
        priority = announcement.priority.toString()
        isActive = announcement.isActive
        displayMode = announcement.displayMode.ifBlank { "floating" }
        templateKey = announcement.templateKey.ifBlank { "drop" }
        pages = announcement.targetPages.ifEmpty { listOf("home") }.toSet()
        selectedProduct = products.firstOrNull { product ->
            announcement.ctaUrl?.contains(product.id) == true ||
                announcement.imageUrl == product.image ||
                product.images?.contains(announcement.imageUrl) == true
        }
        editorOpen = true
    }

    val fileLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri ->
        selectedImageUri = uri
    }

    LazyColumn(modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(24.dp))
                    .background(Brush.linearGradient(listOf(FeterCyan.copy(alpha = 0.18f), Color(0xFF121218), Color.Black)))
                    .border(1.dp, FeterCyan.copy(alpha = 0.24f), RoundedCornerShape(24.dp))
                    .padding(18.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text("MODULO ANUNCIOS PRO", fontSize = 24.sp, fontWeight = FontWeight.Black, color = Color.White, lineHeight = 25.sp)
                Text("Crea, segmenta y previsualiza anuncios para la web sin salir de Feter Stock.", fontSize = 12.sp, color = FeterTextLight, lineHeight = 17.sp)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                    AnnouncementQuickStat("Activos", activeCount.toString(), FeterGreen, Modifier.weight(1f))
                    AnnouncementQuickStat("Catalogo", catalogCount.toString(), FeterCyan, Modifier.weight(1f))
                    AnnouncementQuickStat("Total", announcements.size.toString(), FeterOrange, Modifier.weight(1f))
                }
            }
        }

        item {
            Button(
                onClick = { resetForm(); editorOpen = true },
                colors = ButtonDefaults.buttonColors(containerColor = FeterCyan, contentColor = Color.Black),
                modifier = Modifier.fillMaxWidth().height(52.dp)
            ) {
                Icon(Icons.Default.Campaign, contentDescription = null, tint = Color.Black)
                Spacer(Modifier.width(8.dp))
                Text("CREAR NUEVO ANUNCIO", fontWeight = FontWeight.Black, fontSize = 13.sp)
            }
        }

        item { AdminSectionTitle("CampaÃ±as guardadas", "Toca una campaÃ±a para editarla en una pantalla interna.") }

        items(announcements) { announcement ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(18.dp))
                    .background(FeterCardBg)
                    .border(1.dp, if (announcement.isActive) FeterCyan.copy(alpha = 0.22f) else Color.White.copy(alpha = 0.06f), RoundedCornerShape(18.dp))
                    .clickable { loadAnnouncement(announcement) }
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(46.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(if (announcement.isActive) FeterCyan.copy(alpha = 0.14f) else Color.White.copy(alpha = 0.04f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.Campaign, contentDescription = null, tint = if (announcement.isActive) FeterCyan else FeterTextGray)
                }
                Column(modifier = Modifier.weight(1f)) {
                    Text(announcement.title, color = Color.White, fontWeight = FontWeight.Black, fontSize = 13.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    Text("${announcement.displayMode} - ${announcement.targetPages.joinToString()} - P${announcement.priority}", color = FeterTextLight, fontSize = 10.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    if (!announcement.ctaLabel.isNullOrBlank()) Text(announcement.ctaLabel, color = FeterCyan, fontSize = 9.sp, fontWeight = FontWeight.Bold, maxLines = 1)
                }
                Switch(
                    checked = announcement.isActive,
                    onCheckedChange = { onSave(announcement.copy(isActive = it), null) },
                    modifier = Modifier.width(48.dp)
                )
                IconButton(onClick = { previewAnnouncement = announcement }) {
                    Icon(Icons.Default.Visibility, contentDescription = null, tint = FeterCyan)
                }
                announcement.id?.let {
                    TextButton(onClick = { onDelete(it) }) { Text("Eliminar", color = FeterRed, fontSize = 11.sp) }
                }
            }
        }
    }

    if (editorOpen) {
        Dialog(onDismissRequest = { editorOpen = false }, properties = DialogProperties(usePlatformDefaultWidth = false)) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(FeterDarkBg)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column {
                        Text(if (editing == null) "NUEVO ANUNCIO" else "EDITAR ANUNCIO", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Black)
                        Text("Configura el anuncio en este panel dedicado para evitar confusiones.", color = FeterTextLight, fontSize = 11.sp)
                    }
                    IconButton(onClick = { editorOpen = false }) {
                        Icon(Icons.Default.Close, contentDescription = null, tint = Color.White)
                    }
                }

                AnnouncementPreviewCard(
                    title = title,
                    content = content,
                    category = category,
                    imageUrl = selectedImageUri ?: imageUrl,
                    ctaLabel = ctaLabel,
                    mode = displayMode
                )

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                    OutlinedButton(onClick = { fillWithAi() }, modifier = Modifier.weight(1f).height(46.dp)) {
                        if (isAiLoading) {
                            CircularProgressIndicator(color = FeterCyan, strokeWidth = 2.dp, modifier = Modifier.size(16.dp))
                        } else {
                            Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = FeterCyan, modifier = Modifier.size(16.dp))
                        }
                        Spacer(Modifier.width(6.dp))
                        Text(if (isAiLoading) "GEMINI" else "IA AUTOFILL", color = Color.White, fontWeight = FontWeight.Black, fontSize = 11.sp)
                    }

                    Button(
                        onClick = {
                            onSave(
                                AnnouncementDto(
                                    id = editing?.id,
                                    title = title.ifBlank { "Anuncio ETER" },
                                    content = content.ifBlank { null },
                                    category = category.ifBlank { "DROP" },
                                    imageUrl = imageUrl.ifBlank { null },
                                    isActive = isActive,
                                    targetPages = pages.ifEmpty { setOf("home") }.toList(),
                                    templateKey = templateKey,
                                    displayMode = displayMode,
                                    ctaLabel = ctaLabel.ifBlank { null },
                                    ctaUrl = ctaUrl.ifBlank { null },
                                    priority = priority.toIntOrNull() ?: 0
                                ),
                                selectedImageUri
                            )
                            resetForm()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = FeterCyan, contentColor = Color.Black),
                        modifier = Modifier.weight(1f).height(46.dp)
                    ) {
                        Text(if (editing == null) "PUBLICAR" else "GUARDAR", fontWeight = FontWeight.Black, fontSize = 11.sp)
                    }
                }

                LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.weight(1f)) {
                    item {
                        Text("PRESETS DE PLANTILLA", fontSize = 9.sp, fontWeight = FontWeight.Black, color = FeterTextGray, letterSpacing = 1.5.sp)
                        Spacer(Modifier.height(4.dp))
                        LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            items(templates) { template ->
                                AnnouncementTemplateCard(template.second, template.third, templateKey == template.first) { applyTemplate(template.first) }
                            }
                        }
                    }

                    item {
                        Text("DISEÃ‘O Y COLOR", fontSize = 9.sp, fontWeight = FontWeight.Black, color = FeterTextGray, letterSpacing = 1.5.sp)
                        Spacer(Modifier.height(4.dp))
                        LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            items(visualStyles) { style ->
                                AnnouncementDesignPresetCard(style.second, style.third, templateKey == style.first) { templateKey = style.first }
                            }
                        }
                    }

                    item {
                        ProductPickerSection(products = filteredProducts, selectedProduct = selectedProduct, query = productQuery, onQueryChange = { productQuery = it }, onSelect = { applyProduct(it) })
                    }

                    item { OutlinedTextField(value = title, onValueChange = { title = it }, label = { Text("Titulo") }, modifier = Modifier.fillMaxWidth(), singleLine = true) }
                    item { OutlinedTextField(value = content, onValueChange = { content = it }, label = { Text("Mensaje del anuncio") }, modifier = Modifier.fillMaxWidth().heightIn(min = 80.dp), minLines = 3) }

                    item {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                            OutlinedTextField(value = category, onValueChange = { category = it.uppercase() }, label = { Text("Categoria") }, modifier = Modifier.weight(1f), singleLine = true)
                            OutlinedTextField(value = priority, onValueChange = { priority = it }, label = { Text("Prioridad") }, modifier = Modifier.weight(1f), singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number))
                        }
                    }

                    item {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(14.dp))
                                .background(FeterCardBg)
                                .border(1.dp, Color.White.copy(alpha = 0.06f), RoundedCornerShape(14.dp))
                                .padding(10.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Text("IMAGEN DEL ANUNCIO", fontSize = 9.sp, fontWeight = FontWeight.Black, color = FeterCyan, letterSpacing = 1.sp)

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Button(
                                    onClick = { fileLauncher.launch("image/*") },
                                    colors = ButtonDefaults.buttonColors(containerColor = FeterCyan.copy(alpha = 0.15f), contentColor = FeterCyan),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Icon(Icons.Default.Image, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(Modifier.width(6.dp))
                                    Text(if (selectedImageUri != null) "CAMBIAR ARCHIVO" else "SUBIR ARCHIVO", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                                if (selectedImageUri != null) {
                                    IconButton(onClick = { selectedImageUri = null }) {
                                        Icon(Icons.Default.Close, contentDescription = "Quitar archivo", tint = FeterRed)
                                    }
                                }
                            }
                            if (selectedImageUri != null) {
                                Text("Cargado desde: ${selectedImageUri?.lastPathSegment}", color = FeterGreen, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                            } else {
                                OutlinedTextField(value = imageUrl, onValueChange = { imageUrl = it }, label = { Text("O URL de Imagen Remota") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                            }
                        }
                    }

                    item {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(14.dp))
                                .background(FeterCardBg)
                                .border(1.dp, Color.White.copy(alpha = 0.06f), RoundedCornerShape(14.dp))
                                .padding(10.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Text("LINK DE ACCIÃ“N (CTA)", fontSize = 9.sp, fontWeight = FontWeight.Black, color = FeterCyan, letterSpacing = 1.sp)

                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                                OutlinedTextField(value = ctaLabel, onValueChange = { ctaLabel = it.uppercase() }, label = { Text("Etiqueta Boton") }, modifier = Modifier.weight(1f), singleLine = true)
                            }

                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                OutlinedTextField(
                                    value = ctaUrl,
                                    onValueChange = { ctaUrl = it },
                                    label = { Text("Enlace o Ruta") },
                                    modifier = Modifier.weight(1f),
                                    singleLine = true
                                )
                                Button(
                                    onClick = {
                                        ctaUrl = "https://wa.me/5492236204002"
                                        ctaLabel = "WHATSAPP DIRECTO"
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF25D366), contentColor = Color.White),
                                    modifier = Modifier.height(56.dp)
                                ) {
                                    Icon(Icons.Default.Phone, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(Modifier.width(4.dp))
                                    Text("WA LINK", fontSize = 10.sp, fontWeight = FontWeight.Black)
                                }
                            }
                        }
                    }

                    item {
                        Text("Formato de despliegue", fontSize = 9.sp, fontWeight = FontWeight.Black, color = FeterTextGray, letterSpacing = 1.5.sp)
                        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            items(displayOptions) { option ->
                                AnnouncementChoiceChip(option.second, displayMode == option.first) { displayMode = option.first }
                            }
                        }
                    }

                    item {
                        Text("Mostrar en pÃ¡ginas", fontSize = 9.sp, fontWeight = FontWeight.Black, color = FeterTextGray, letterSpacing = 1.5.sp)
                        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            items(pageOptions) { page ->
                                AnnouncementChoiceChip(page.second, pages.contains(page.first)) {
                                    pages = if (page.first == "all") {
                                        setOf("all")
                                    } else {
                                        val clean = pages - "all"
                                        val next = if (clean.contains(page.first)) clean - page.first else clean + page.first
                                        next.ifEmpty { setOf("home") }
                                    }
                                }
                            }
                        }
                    }

                    item {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(18.dp))
                                .background(FeterCardBg)
                                .border(1.dp, Color.White.copy(alpha = 0.08f), RoundedCornerShape(18.dp))
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text("ESTADO ANUNCIO", fontSize = 11.sp, fontWeight = FontWeight.Black, color = Color.White)
                                Text(if (isActive) "Visible en la web elegida" else "Guardado como borrador", fontSize = 10.sp, color = FeterTextLight)
                            }
                            Switch(checked = isActive, onCheckedChange = { isActive = it })
                        }
                    }

                    if (editing != null) {
                        item {
                            OutlinedButton(onClick = { resetForm() }, modifier = Modifier.fillMaxWidth().height(48.dp)) {
                                Text("CANCELAR EDICIÃ“N", fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }

    previewAnnouncement?.let { announcement ->
        Dialog(onDismissRequest = { previewAnnouncement = null }) {
            Column(
                modifier = Modifier
                    .clip(RoundedCornerShape(26.dp))
                    .background(FeterDarkBg)
                    .border(1.dp, FeterCyan.copy(alpha = 0.24f), RoundedCornerShape(26.dp))
                    .padding(14.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                AnnouncementPreviewCard(announcement.title, announcement.content.orEmpty(), announcement.category ?: "ETER", announcement.imageUrl.orEmpty(), announcement.ctaLabel.orEmpty(), announcement.displayMode)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                    OutlinedButton(onClick = { loadAnnouncement(announcement); previewAnnouncement = null }, modifier = Modifier.weight(1f)) {
                        Text("EDITAR", color = Color.White, fontWeight = FontWeight.Black)
                    }
                    Button(onClick = { previewAnnouncement = null }, colors = ButtonDefaults.buttonColors(containerColor = FeterCyan, contentColor = Color.Black), modifier = Modifier.weight(1f)) {
                        Text("OK", fontWeight = FontWeight.Black)
                    }
                }
            }
        }
    }
}

@Composable
fun ProductPickerSection(products: List<ProductDto>, selectedProduct: ProductDto?, query: String, onQueryChange: (String) -> Unit, onSelect: (ProductDto) -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(22.dp))
            .background(FeterCardBg)
            .border(1.dp, Color.White.copy(alpha = 0.08f), RoundedCornerShape(22.dp))
            .padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
            Column {
                Text("PRODUCTO REAL", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
                Text(selectedProduct?.name ?: "Elige un modelo para poblar imagen, precio y link.", color = FeterTextLight, fontSize = 10.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
            Icon(Icons.Default.Inventory2, contentDescription = null, tint = FeterCyan)
        }
        OutlinedTextField(
            value = query,
            onValueChange = onQueryChange,
            placeholder = { Text("Buscar modelo, marca o categoria", color = FeterTextGray) },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = FeterCyan) }
        )
        LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            items(products) { product ->
                val selected = selectedProduct?.id == product.id
                Column(
                    modifier = Modifier
                        .width(150.dp)
                        .clip(RoundedCornerShape(18.dp))
                        .background(if (selected) FeterCyan.copy(alpha = 0.13f) else Color.White.copy(alpha = 0.04f))
                        .border(1.dp, if (selected) FeterCyan.copy(alpha = 0.55f) else Color.White.copy(alpha = 0.08f), RoundedCornerShape(18.dp))
                        .clickable { onSelect(product) }
                        .padding(10.dp),
                    verticalArrangement = Arrangement.spacedBy(7.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(82.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(Color.Black.copy(alpha = 0.35f)),
                        contentAlignment = Alignment.Center
                    ) {
                        val image = product.images?.firstOrNull().orEmpty().ifBlank { product.image.orEmpty() }
                        if (image.isNotBlank()) {
                            AsyncImage(model = image, contentDescription = null, modifier = Modifier.fillMaxSize())
                        } else {
                            Icon(Icons.Default.Image, contentDescription = null, tint = FeterTextGray)
                        }
                    }
                    Text(product.name.uppercase(), color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Black, maxLines = 2, overflow = TextOverflow.Ellipsis)
                    Text("$" + String.format("%,.0f", product.price) + " - stock ${product.stock}", color = if (product.stock > 0) FeterCyan else FeterRed, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun AnnouncementQuickStat(label: String, value: String, accent: Color, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(Color.Black.copy(alpha = 0.32f))
            .border(1.dp, accent.copy(alpha = 0.22f), RoundedCornerShape(16.dp))
            .padding(10.dp)
    ) {
        Text(value, color = accent, fontSize = 18.sp, fontWeight = FontWeight.Black)
        Text(label.uppercase(), color = FeterTextLight, fontSize = 8.sp, fontWeight = FontWeight.Bold, maxLines = 1)
    }
}

@Composable
fun AnnouncementTemplateCard(title: String, subtitle: String, selected: Boolean, onClick: () -> Unit) {
    Column(
        modifier = Modifier
            .width(172.dp)
            .clip(RoundedCornerShape(18.dp))
            .background(if (selected) FeterCyan.copy(alpha = 0.14f) else FeterCardBg)
            .border(1.dp, if (selected) FeterCyan.copy(alpha = 0.55f) else Color.White.copy(alpha = 0.08f), RoundedCornerShape(18.dp))
            .clickable(onClick = onClick)
            .padding(14.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = if (selected) FeterCyan else FeterTextGray, modifier = Modifier.size(18.dp))
        Text(title.uppercase(), color = Color.White, fontWeight = FontWeight.Black, fontSize = 11.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
        Text(subtitle, color = FeterTextLight, fontSize = 10.sp, lineHeight = 13.sp, maxLines = 3, overflow = TextOverflow.Ellipsis)
    }
}

@Composable
fun AnnouncementDesignPresetCard(title: String, subtitle: String, selected: Boolean, onClick: () -> Unit) {
    val accent = when {
        title.contains("Rose", ignoreCase = true) -> Color(0xFFFF007A)
        title.contains("Gold", ignoreCase = true) -> Color(0xFFFFC857)
        title.contains("Flash", ignoreCase = true) -> FeterOrange
        title.contains("Noir", ignoreCase = true) -> Color.White
        else -> FeterCyan
    }
    Row(
        modifier = Modifier
            .width(196.dp)
            .clip(RoundedCornerShape(18.dp))
            .background(Brush.linearGradient(listOf(accent.copy(alpha = if (selected) 0.18f else 0.08f), FeterCardBg)))
            .border(1.dp, if (selected) accent.copy(alpha = 0.62f) else Color.White.copy(alpha = 0.08f), RoundedCornerShape(18.dp))
            .clickable(onClick = onClick)
            .padding(12.dp),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(38.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(accent.copy(alpha = 0.18f))
                .border(1.dp, accent.copy(alpha = 0.35f), RoundedCornerShape(12.dp)),
            contentAlignment = Alignment.Center
        ) {
            Icon(Icons.Default.Palette, contentDescription = null, tint = accent, modifier = Modifier.size(19.dp))
        }
        Column(modifier = Modifier.weight(1f)) {
            Text(title.uppercase(), color = Color.White, fontWeight = FontWeight.Black, fontSize = 10.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
            Text(subtitle, color = FeterTextLight, fontSize = 9.sp, lineHeight = 12.sp, maxLines = 2, overflow = TextOverflow.Ellipsis)
        }
    }
}

@Composable
fun AnnouncementChoiceChip(label: String, selected: Boolean, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(999.dp))
            .background(if (selected) FeterCyan else Color.White.copy(alpha = 0.05f))
            .border(1.dp, if (selected) FeterCyan else Color.White.copy(alpha = 0.08f), RoundedCornerShape(999.dp))
            .clickable(onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 9.dp)
    ) {
        Text(label.uppercase(), color = if (selected) Color.Black else FeterTextLight, fontSize = 9.sp, fontWeight = FontWeight.Black)
    }
}

@Composable
fun AnnouncementPreviewCard(title: String, content: String, category: String, imageUrl: Any, ctaLabel: String, mode: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(24.dp))
            .background(Brush.linearGradient(listOf(Color(0xFF081014), FeterCardBg)))
            .border(1.dp, FeterCyan.copy(alpha = 0.22f), RoundedCornerShape(24.dp))
            .padding(14.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(74.dp)
                .clip(RoundedCornerShape(18.dp))
                .background(FeterCyan.copy(alpha = 0.1f))
                .border(1.dp, Color.White.copy(alpha = 0.08f), RoundedCornerShape(18.dp)),
            contentAlignment = Alignment.Center
        ) {
            val hasImage = when (imageUrl) {
                is Uri -> true
                is String -> imageUrl.isNotBlank()
                else -> false
            }
            if (hasImage) {
                AsyncImage(model = imageUrl, contentDescription = null, modifier = Modifier.fillMaxSize())
            } else {
                Icon(Icons.Default.Campaign, contentDescription = null, tint = FeterCyan, modifier = Modifier.size(30.dp))
            }
        }
        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text("${category.ifBlank { "ETER" }} - ${mode.uppercase()}", color = FeterCyan, fontSize = 9.sp, fontWeight = FontWeight.Black, letterSpacing = 1.5.sp)
            Text(title.ifBlank { "Titulo del anuncio" }, color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Black, maxLines = 2, overflow = TextOverflow.Ellipsis)
            Text(content.ifBlank { "Mensaje breve, util y facil de cerrar." }, color = FeterTextLight, fontSize = 11.sp, lineHeight = 15.sp, maxLines = 2, overflow = TextOverflow.Ellipsis)
            if (ctaLabel.isNotBlank()) Text(ctaLabel, color = Color.Black, fontSize = 9.sp, fontWeight = FontWeight.Black, modifier = Modifier.clip(RoundedCornerShape(8.dp)).background(FeterCyan).padding(horizontal = 9.dp, vertical = 5.dp))
        }
    }
}

@Composable
fun AdminListCard(title: String, subtitle: String, accent: Color, trailing: @Composable (() -> Unit)? = null) {
    Row(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(FeterCardBg).border(1.dp, accent.copy(alpha = 0.18f), RoundedCornerShape(16.dp)).padding(14.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
        Column(modifier = Modifier.weight(1f)) {
            Text(title, color = Color.White, fontWeight = FontWeight.Black, fontSize = 13.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
            Text(subtitle, color = FeterTextLight, fontSize = 11.sp, maxLines = 2, overflow = TextOverflow.Ellipsis)
        }
        trailing?.invoke()
    }
}

// --- COMPONIBLE DE ADMINISTRACIÃ“N DE CATÃLOGO ---
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CatalogAdminScreen(
    products: List<ProductDto>,
    resellerLinks: List<ResellerLinkDto>,
    isLoading: Boolean,
    serverUrl: String,
    onUpdateProductSections: (ProductDto, List<String>) -> Unit,
    onToggleProductActive: (ProductDto) -> Unit,
    onClearProductStock: (ProductDto) -> Unit,
    onEditProductMetadata: (ProductDto) -> Unit
) {
    val context = LocalContext.current
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("Todos") }
    var selectedStatus by remember { mutableStateOf("Todos") }

    val categories = remember(products) {
        listOf("Todos") + products.mapNotNull { it.category }.distinct().filter { !it.isNullOrBlank() }
    }

    val filtered = remember(products, searchQuery, selectedCategory, selectedStatus) {
        products.filter { product ->
            val matchesSearch = product.name.contains(searchQuery, ignoreCase = true) ||
                    (product.brand?.contains(searchQuery, ignoreCase = true) == true) ||
                    (product.description?.contains(searchQuery, ignoreCase = true) == true)
            val matchesCategory = selectedCategory == "Todos" || product.category == selectedCategory
            val matchesStatus = selectedStatus == "Todos" ||
                    (selectedStatus.lowercase() == "activo" && product.isOperationalActive()) ||
                    (selectedStatus.lowercase() == "inactivo" && !product.isOperationalActive())
            matchesSearch && matchesCategory && matchesStatus
        }
    }
    val publicationMetrics = remember(products) { buildStockPublicationMetrics(products) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        item {
            ResellerExclusiveLinksSection(
                resellerLinks = resellerLinks,
                onCopy = { link ->
                    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                    clipboard.setPrimaryClip(ClipData.newPlainText("Catalogo revendedor ETER", link))
                    Toast.makeText(context, "Link copiado", Toast.LENGTH_SHORT).show()
                }
            )
        }

        item {
            StockPublicationControlCard(
                metrics = publicationMetrics,
                onOpenCatalog = { },
                onOpenInventory = { },
                showActions = false
            )
        }

        // Search Bar
        item {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Buscar por nombre, marca o desc...", color = FeterTextGray, fontSize = 12.sp) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = FeterCyan) },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = { searchQuery = "" }) {
                            Icon(Icons.Default.Clear, contentDescription = null, tint = FeterTextGray)
                        }
                    }
                },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White,
                    focusedBorderColor = FeterCyan,
                    unfocusedBorderColor = FeterGray,
                    focusedContainerColor = FeterCardBg,
                    unfocusedContainerColor = FeterCardBg
                ),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
        }

        // CategorÃ­as selector Horizontal
        item {
            Text(
                "FILTRAR POR CATEGORÃA",
                fontSize = 8.sp,
                fontWeight = FontWeight.Bold,
                color = FeterCyan,
                letterSpacing = 1.5.sp
            )
            Spacer(modifier = Modifier.height(6.dp))
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(categories) { cat ->
                    val isSel = cat == selectedCategory
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (isSel) FeterCyan.copy(alpha = 0.15f) else Color.Transparent)
                            .border(
                                1.dp,
                                if (isSel) FeterCyan else FeterGray,
                                RoundedCornerShape(10.dp)
                            )
                            .clickable { selectedCategory = cat }
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text(
                            cat.uppercase(),
                            fontWeight = if (isSel) FontWeight.Black else FontWeight.Medium,
                            fontSize = 9.sp,
                            color = if (isSel) Color.White else FeterTextLight
                        )
                    }
                }
            }
        }

        // Filtro de Estado
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    "ESTADO:",
                    fontSize = 8.sp,
                    fontWeight = FontWeight.Bold,
                    color = FeterTextGray,
                    letterSpacing = 1.5.sp
                )
                val statuses = listOf("Todos", "Activo", "Inactivo")
                statuses.forEach { st ->
                    val isSel = st == selectedStatus
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (isSel) FeterCyan.copy(alpha = 0.1f) else Color.Transparent)
                            .border(
                                1.dp,
                                if (isSel) FeterCyan.copy(alpha = 0.5f) else FeterGray,
                                RoundedCornerShape(8.dp)
                            )
                            .clickable { selectedStatus = st }
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(
                            st.uppercase(),
                            fontWeight = if (isSel) FontWeight.Bold else FontWeight.Normal,
                            fontSize = 8.sp,
                            color = if (isSel) Color.White else FeterTextGray
                        )
                    }
                }
            }
        }

        // List body
        if (isLoading) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = FeterCyan)
                }
            }
        } else if (filtered.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        "No se encontraron calzados en el catÃ¡logo",
                        color = FeterTextGray,
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace,
                        textAlign = TextAlign.Center
                    )
                }
            }
        } else {
            items(filtered) { product ->
                CatalogAdminRowItem(
                    product = product,
                    serverUrl = serverUrl,
                    onUpdateSections = { sections -> onUpdateProductSections(product, sections) },
                    onToggleActive = { onToggleProductActive(product) },
                    onClearStock = { onClearProductStock(product) },
                    onClick = { onEditProductMetadata(product) }
                )
            }
        }
    }
}


// --- ITEM EN LA LISTA DE ADMINISTRACIÃ“N DE CATÃLOGO ---
@Composable
fun ResellerExclusiveLinksSection(
    resellerLinks: List<ResellerLinkDto>,
    onCopy: (String) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(18.dp))
            .background(Color(0xFF08080B))
            .border(1.dp, FeterCyan.copy(alpha = 0.18f), RoundedCornerShape(18.dp))
            .padding(14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("CATALOGOS EXCLUSIVOS", fontSize = 11.sp, fontWeight = FontWeight.Black, color = Color.White, letterSpacing = 1.2.sp)
                Text("Revendedores activos verificados", fontSize = 11.sp, fontWeight = FontWeight.Medium, color = FeterTextLight)
            }
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(999.dp))
                    .background(FeterCyan.copy(alpha = 0.12f))
                    .border(1.dp, FeterCyan.copy(alpha = 0.28f), RoundedCornerShape(999.dp))
                    .padding(horizontal = 10.dp, vertical = 5.dp)
            ) {
                Text("${resellerLinks.size} links", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = FeterCyan)
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        if (resellerLinks.isEmpty()) {
            Text("Sin revendedores activos con slug publico en este momento.", fontSize = 11.sp, color = FeterTextGray, lineHeight = 15.sp)
        } else {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                items(resellerLinks) { reseller ->
                    val slug = reseller.resellerSlug.orEmpty()
                    val link = "https://eter.store/c/$slug"
                    Column(
                        modifier = Modifier
                            .width(220.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(Color.White.copy(alpha = 0.04f))
                            .border(1.dp, Color.White.copy(alpha = 0.08f), RoundedCornerShape(14.dp))
                            .clickable { onCopy(link) }
                            .padding(12.dp)
                    ) {
                        Text(
                            reseller.fullName?.ifBlank { "Revendedor ETER" } ?: "Revendedor ETER",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(link, fontSize = 10.sp, color = FeterCyan, maxLines = 1, overflow = TextOverflow.Ellipsis)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Tocar para copiar", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = FeterTextGray, letterSpacing = 0.4.sp)
                    }
                }
            }
        }
    }
}

@Composable
fun CatalogAdminRowItem(
    product: ProductDto,
    serverUrl: String,
    onUpdateSections: (List<String>) -> Unit,
    onToggleActive: () -> Unit,
    onClearStock: () -> Unit,
    onClick: () -> Unit
) {
    val imageUrl = remember(product.images, product.image, serverUrl) { resolveProductImageUrl(product, serverUrl) }
    val isActive = product.isOperationalActive()
    val totalStock = product.totalPairs()
    val imageCount = product.imageCount()
    val sectionOptions = listOf(
        "home" to "Inicio",
        "catalog" to "CatÃ¡logo",
        "liquidation" to "LiquidaciÃ³n",
        "flash" to "Ofertas Flash"
    )
    var selectedSections by remember(product.id, product.productSections) {
        mutableStateOf(product.productSections?.toSet() ?: setOf("catalog"))
    }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .clickable(onClick = onClick)
    ) {
        Box(
            modifier = Modifier
                .matchParentSize()
                .background(
                    Brush.horizontalGradient(
                        colors = listOf(
                            FeterSurfaceBg,
                            Color(0xFF0D0D10)
                        )
                    )
                )
                .border(
                    1.dp,
                    Color.White.copy(alpha = 0.05f),
                    RoundedCornerShape(16.dp)
                )
        )

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Thumbnail
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color(0xFF080808)),
                contentAlignment = Alignment.Center
            ) {
                if (imageUrl != null) {
                    AsyncImage(
                        model = ImageRequest.Builder(LocalContext.current)
                            .data(imageUrl)
                            .crossfade(300)
                            .build(),
                        contentDescription = null,
                        modifier = Modifier.fillMaxSize()
                    )
                } else {
                    Icon(
                        Icons.Default.ShoppingCart,
                        contentDescription = null,
                        tint = FeterCyan.copy(alpha = 0.2f),
                        modifier = Modifier.size(32.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.width(12.dp))

            // Text info
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    product.name,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    color = Color.White,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )

                // Brand & Category
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        product.brand ?: "Ã‰TER",
                        fontWeight = FontWeight.Black,
                        fontSize = 8.sp,
                        color = FeterCyan,
                        letterSpacing = 1.sp
                    )
                    Text(
                        "|",
                        fontSize = 8.sp,
                        color = FeterTextGray
                    )
                    Text(
                        product.category ?: "Sneakers",
                        fontWeight = FontWeight.Medium,
                        fontSize = 9.sp,
                        color = FeterTextLight
                    )
                }

                // Price
                Text(
                    "$" + String.format("%,d", product.price.toInt()),
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp,
                    color = Color.White
                )
                LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
                    item {
                        StockActionChip(
                            label = "$imageCount IMG",
                            color = if (imageCount > 0) FeterCyan else FeterOrange,
                            icon = Icons.Default.Image,
                            onClick = null
                        )
                    }
                    item {
                        StockActionChip(
                            label = "$totalStock PARES",
                            color = when {
                                totalStock == 0 -> FeterRed
                                totalStock < 5 -> FeterOrange
                                else -> FeterGreen
                            },
                            icon = Icons.Default.ShoppingCart,
                            onClick = null
                        )
                    }
                }
                LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    items(sectionOptions) { option ->
                        val selected = selectedSections.contains(option.first)
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(7.dp))
                                .background(if (selected) FeterCyan.copy(alpha = 0.16f) else Color.White.copy(alpha = 0.04f))
                                .border(1.dp, if (selected) FeterCyan.copy(alpha = 0.5f) else Color.White.copy(alpha = 0.08f), RoundedCornerShape(7.dp))
                                .clickable {
                                    val next = if (selected) selectedSections - option.first else selectedSections + option.first
                                    selectedSections = if (next.isEmpty()) setOf("catalog") else next
                                    onUpdateSections(selectedSections.toList())
                                }
                                .padding(horizontal = 7.dp, vertical = 4.dp)
                        ) {
                            Text(option.second, fontSize = 8.sp, fontWeight = FontWeight.Bold, color = if (selected) FeterCyan else FeterTextGray)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.width(8.dp))

            // Right block with Status Pill & Edit Icon
            Column(
                horizontalAlignment = Alignment.End,
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Status Pill
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (isActive) FeterGreen.copy(alpha = 0.1f) else FeterTextGray.copy(alpha = 0.1f))
                        .border(
                            1.dp,
                            if (isActive) FeterGreen.copy(alpha = 0.3f) else FeterTextGray.copy(alpha = 0.3f),
                            RoundedCornerShape(8.dp)
                        )
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        if (isActive) "ACTIVO" else "INACTIVO",
                        fontWeight = FontWeight.Black,
                        fontSize = 7.sp,
                        color = if (isActive) FeterGreen else FeterTextGray,
                        letterSpacing = 0.5.sp
                    )
                }

                // Edit Icon Indicator
                IconButton(onClick = onToggleActive, modifier = Modifier.size(32.dp)) {
                    Icon(
                        if (isActive) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                        contentDescription = null,
                        tint = if (isActive) FeterOrange else FeterGreen,
                        modifier = Modifier.size(17.dp)
                    )
                }
                if (totalStock > 0) {
                    IconButton(onClick = onClearStock, modifier = Modifier.size(32.dp)) {
                        Icon(
                            Icons.Default.DeleteOutline,
                            contentDescription = null,
                            tint = FeterRed,
                            modifier = Modifier.size(17.dp)
                        )
                    }
                }
                IconButton(onClick = onClick, modifier = Modifier.size(32.dp)) {
                    Icon(
                        Icons.Default.Edit,
                        contentDescription = null,
                        tint = FeterCyan.copy(alpha = 0.7f),
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }
    }
}

// --- DIÃLOGO DE EDICIÃ“N DE METADATOS DE CATÃLOGO ---
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CatalogMetadataEditorDialog(
    product: ProductDto,
    serverUrl: String,
    onDismiss: () -> Unit,
    onSave: (String, String, String, Double, String, String) -> Unit
) {
    var name by remember { mutableStateOf(product.name) }
    var brand by remember { mutableStateOf(product.brand ?: "Ã‰TER") }
    var category by remember { mutableStateOf(product.category ?: "Sneakers") }
    var priceStr by remember { mutableStateOf(product.price.toInt().toString()) }
    var status by remember { mutableStateOf(product.status) }
    var description by remember { mutableStateOf(product.description ?: "") }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.92f)
                .border(
                    BorderStroke(
                        1.dp,
                        Brush.verticalGradient(
                            colors = listOf(
                                Color.White.copy(alpha = 0.1f),
                                FeterCyan.copy(alpha = 0.3f)
                            )
                        )
                    ),
                    RoundedCornerShape(28.dp)
                ),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF080808)),
            shape = RoundedCornerShape(28.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .fillMaxSize()
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            "EDITOR DE CATÃLOGO",
                            fontWeight = FontWeight.Black,
                            fontSize = 14.sp,
                            color = Color.White,
                            letterSpacing = 0.5.sp
                        )
                        Text(
                            "FÃ‰TER SYSTEM Â· METADATOS",
                            fontWeight = FontWeight.Bold,
                            fontSize = 8.sp,
                            color = FeterCyan,
                            letterSpacing = 2.sp
                        )
                    }

                    // Thumbnail preview if available
                    val imageUrl = remember(product.images, product.image, serverUrl) { resolveProductImageUrl(product, serverUrl) }
                    Box(
                        modifier = Modifier
                            .size(54.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFF141416))
                            .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(12.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        if (imageUrl != null) {
                            AsyncImage(
                                model = ImageRequest.Builder(LocalContext.current)
                                    .data(imageUrl)
                                    .crossfade(300)
                                    .build(),
                                contentDescription = null,
                                modifier = Modifier.fillMaxSize()
                            )
                        } else {
                            Icon(Icons.Default.ShoppingCart, contentDescription = null, tint = FeterCyan.copy(alpha = 0.5f), modifier = Modifier.size(24.dp))
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Form fields
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // Nombre Field
                    Column {
                        Text("NOMBRE DEL CALZADO", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = FeterCyan, letterSpacing = 1.sp)
                        Spacer(modifier = Modifier.height(6.dp))
                        OutlinedTextField(
                            value = name,
                            onValueChange = { name = it },
                            placeholder = { Text("Ej: Nike Dunk Low Black", color = FeterTextGray, fontSize = 12.sp) },
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White,
                                focusedBorderColor = FeterCyan,
                                unfocusedBorderColor = FeterGray,
                                focusedContainerColor = FeterCardBg,
                                unfocusedContainerColor = FeterCardBg
                            ),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }

                    // Brand & Category Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("MARCA", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = FeterCyan, letterSpacing = 1.sp)
                            Spacer(modifier = Modifier.height(6.dp))
                            OutlinedTextField(
                                value = brand,
                                onValueChange = { brand = it },
                                placeholder = { Text("Ej: Ã‰TER", color = FeterTextGray, fontSize = 12.sp) },
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedTextColor = Color.White,
                                    unfocusedTextColor = Color.White,
                                    focusedBorderColor = FeterCyan,
                                    unfocusedBorderColor = FeterGray,
                                    focusedContainerColor = FeterCardBg,
                                    unfocusedContainerColor = FeterCardBg
                                ),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                        Column(modifier = Modifier.weight(1f)) {
                            Text("CATEGORÃA", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = FeterCyan, letterSpacing = 1.sp)
                            Spacer(modifier = Modifier.height(6.dp))
                            OutlinedTextField(
                                value = category,
                                onValueChange = { category = it },
                                placeholder = { Text("Ej: Sneakers", color = FeterTextGray, fontSize = 12.sp) },
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedTextColor = Color.White,
                                    unfocusedTextColor = Color.White,
                                    focusedBorderColor = FeterCyan,
                                    unfocusedBorderColor = FeterGray,
                                    focusedContainerColor = FeterCardBg,
                                    unfocusedContainerColor = FeterCardBg
                                ),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                    }

                    // Price Field
                    Column {
                        Text("PRECIO ($)", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = FeterCyan, letterSpacing = 1.sp)
                        Spacer(modifier = Modifier.height(6.dp))
                        OutlinedTextField(
                            value = priceStr,
                            onValueChange = { priceStr = it },
                            placeholder = { Text("Ej: 85000", color = FeterTextGray, fontSize = 12.sp) },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White,
                                focusedBorderColor = FeterCyan,
                                unfocusedBorderColor = FeterGray,
                                focusedContainerColor = FeterCardBg,
                                unfocusedContainerColor = FeterCardBg
                            ),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }

                    // Status Selector (Activo / Inactivo)
                    Column {
                        Text("ESTADO DEL CALZADO EN CATÃLOGO", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = FeterCyan, letterSpacing = 1.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            val isActive = status.lowercase() == "activo"

                            // ACTIVO button
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(if (isActive) FeterGreen.copy(alpha = 0.15f) else Color.Transparent)
                                    .border(
                                        1.dp,
                                        if (isActive) FeterGreen else FeterGray,
                                        RoundedCornerShape(12.dp)
                                    )
                                    .clickable { status = "activo" }
                                    .padding(vertical = 12.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Box(
                                        modifier = Modifier
                                            .size(8.dp)
                                            .clip(RoundedCornerShape(50))
                                            .background(if (isActive) FeterGreen else FeterTextGray)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        "ACTIVO",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 11.sp,
                                        color = if (isActive) Color.White else FeterTextGray
                                    )
                                }
                            }

                            // INACTIVO button
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(if (!isActive) FeterRed.copy(alpha = 0.15f) else Color.Transparent)
                                    .border(
                                        1.dp,
                                        if (!isActive) FeterRed else FeterGray,
                                        RoundedCornerShape(12.dp)
                                    )
                                    .clickable { status = "inactivo" }
                                    .padding(vertical = 12.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Box(
                                        modifier = Modifier
                                            .size(8.dp)
                                            .clip(RoundedCornerShape(50))
                                            .background(if (!isActive) FeterRed else FeterTextGray)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        "INACTIVO",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 11.sp,
                                        color = if (!isActive) Color.White else FeterTextGray
                                    )
                                }
                            }
                        }
                    }

                    // Description Field
                    Column {
                        Text("DESCRIPCIÃ“N DEL PRODUCTO", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = FeterCyan, letterSpacing = 1.sp)
                        Spacer(modifier = Modifier.height(6.dp))
                        OutlinedTextField(
                            value = description,
                            onValueChange = { description = it },
                            placeholder = { Text("Agrega detalles del material, ajuste, estilo...", color = FeterTextGray, fontSize = 12.sp) },
                            minLines = 3,
                            maxLines = 5,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White,
                                focusedBorderColor = FeterCyan,
                                unfocusedBorderColor = FeterGray,
                                focusedContainerColor = FeterCardBg,
                                unfocusedContainerColor = FeterCardBg
                            ),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Action buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    TextButton(
                        onClick = onDismiss,
                        colors = ButtonDefaults.textButtonColors(contentColor = Color.White),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("CANCELAR", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                    Button(
                        onClick = {
                            val finalPrice = priceStr.toDoubleOrNull() ?: 0.0
                            onSave(
                                name.trim(),
                                brand.trim(),
                                category.trim(),
                                finalPrice,
                                status.trim(),
                                description.trim()
                            )
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = FeterCyan, contentColor = Color.Black),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1.5f),
                        enabled = name.isNotBlank()
                    ) {
                        Text("GUARDAR CAMBIOS", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}



// =============================================================================
// MUSIC PLAYER SCREEN â€” Eter Audio Experience
// =============================================================================
@Composable
fun MusicPlayerScreen(
    playlist: List<EterTrack>,
    trackIndex: Int,
    onTrackIndexChange: (Int) -> Unit,
    isMuted: Boolean,
    onMuteChange: (Boolean) -> Unit,
    volume: Float,
    onVolumeChange: (Float) -> Unit,
    isPlaying: Boolean
) {
    fun currentTrack() = playlist[trackIndex % playlist.size]

    val infiniteTransition = rememberInfiniteTransition(label = "viz")
    val bars = (0 until 5).map { i ->
        infiniteTransition.animateFloat(
            initialValue = 0.2f, targetValue = 1f,
            animationSpec = infiniteRepeatable(tween(350 + i * 80, easing = FastOutSlowInEasing), RepeatMode.Reverse),
            label = "bar$i"
        )
    }
    val barColors = listOf(FeterCyan, Color(0xFF8B5CF6), FeterCyan, Color(0xFF8B5CF6), FeterCyan)

    Column(
        modifier = Modifier.fillMaxSize().background(FeterDarkBg).padding(horizontal = 24.dp, vertical = 32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Text("ETER MUSIC", fontSize = 10.sp, fontWeight = FontWeight.Black, letterSpacing = 4.sp, color = FeterCyan, modifier = Modifier.padding(top = 8.dp))

        Row(horizontalArrangement = Arrangement.spacedBy(5.dp), verticalAlignment = Alignment.Bottom, modifier = Modifier.height(52.dp)) {
            bars.forEachIndexed { i, anim ->
                val h = if (isPlaying && !isMuted) anim.value else 0.15f
                Box(modifier = Modifier.width(5.dp).fillMaxHeight(h).clip(RoundedCornerShape(4.dp)).background(barColors[i].copy(alpha = if (isPlaying && !isMuted) 0.85f else 0.2f)))
            }
        }

        Box(
            modifier = Modifier.size(220.dp).clip(RoundedCornerShape(24.dp))
                .background(Brush.radialGradient(listOf(Color(0xFF0D0D18), Color(0xFF050508))))
                .border(1.dp, FeterCyan.copy(alpha = 0.2f), RoundedCornerShape(24.dp)),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("â™«", fontSize = 52.sp, color = FeterCyan.copy(alpha = 0.55f))
                Text("ETER", fontSize = 11.sp, fontWeight = FontWeight.Black, letterSpacing = 6.sp, color = FeterTextGray)
            }
        }

        Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(currentTrack().displayName.uppercase(), fontSize = 18.sp, fontWeight = FontWeight.Black, color = Color.White, textAlign = TextAlign.Center, maxLines = 2, overflow = TextOverflow.Ellipsis)
            Text("${trackIndex + 1} / ${playlist.size}", fontSize = 10.sp, color = FeterTextGray, letterSpacing = 2.sp)
        }

        Row(horizontalArrangement = Arrangement.spacedBy(20.dp), verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = { onTrackIndexChange(if (trackIndex == 0) playlist.size - 1 else trackIndex - 1) }) {
                Icon(Icons.Default.SkipPrevious, contentDescription = null, tint = FeterTextLight, modifier = Modifier.size(30.dp))
            }
            Box(
                modifier = Modifier.size(60.dp).clip(RoundedCornerShape(50))
                    .background(Brush.radialGradient(listOf(FeterCyan, Color(0xFF0055FF))))
                    .clickable { onMuteChange(!isMuted) },
                contentAlignment = Alignment.Center
            ) {
                Icon(if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow, contentDescription = null, tint = Color.Black, modifier = Modifier.size(30.dp))
            }
            IconButton(onClick = { onTrackIndexChange((trackIndex + 1) % playlist.size) }) {
                Icon(Icons.Default.SkipNext, contentDescription = null, tint = FeterTextLight, modifier = Modifier.size(30.dp))
            }
        }

        Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.fillMaxWidth()) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                IconButton(onClick = { onMuteChange(!isMuted) }) {
                    Icon(if (isMuted) Icons.Default.VolumeOff else Icons.Default.VolumeUp, contentDescription = null, tint = if (isMuted) FeterTextGray else FeterCyan, modifier = Modifier.size(22.dp))
                }
                Slider(
                    value = volume, onValueChange = onVolumeChange, valueRange = 0f..1f, modifier = Modifier.weight(1f),
                    colors = SliderDefaults.colors(thumbColor = FeterCyan, activeTrackColor = FeterCyan, inactiveTrackColor = FeterGray)
                )
                Text("${(volume * 100).toInt()}%", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = FeterTextGray, modifier = Modifier.width(32.dp))
            }
            Text("VOLUMEN", fontSize = 8.sp, letterSpacing = 2.sp, color = FeterTextGray.copy(alpha = 0.45f), fontWeight = FontWeight.Bold)
        }

        Spacer(modifier = Modifier.height(4.dp))
    }
}

@Composable
fun DuplicateDetectorDialog(
    products: List<ProductDto>,
    serverUrl: String,
    onDismiss: () -> Unit,
    onToggleActive: (ProductDto) -> Unit,
    onClearStock: (ProductDto) -> Unit,
    onEditProduct: (ProductDto) -> Unit
) {
    val context = LocalContext.current
    // Group products by their main image url (or list of images)
    val duplicateGroups = remember(products) {
        val groups = mutableMapOf<String, MutableList<ProductDto>>()
        products.forEach { p ->
            val img = p.image ?: p.images?.firstOrNull()
            if (!img.isNullOrBlank()) {
                val cleanImg = img.substringAfterLast("/") // compare by filename to be robust
                groups.getOrPut(cleanImg) { mutableListOf() }.add(p)
            }
        }
        groups.filter { it.value.size > 1 }
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(Icons.Default.CopyAll, contentDescription = null, tint = FeterCyan)
                Text("Publicaciones Duplicadas", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
            }
        },
        text = {
            if (duplicateGroups.isEmpty()) {
                Box(modifier = Modifier.fillMaxWidth().padding(24.dp), contentAlignment = Alignment.Center) {
                    Text("Â¡No se encontraron imÃ¡genes repetidas en el catÃ¡logo!", color = FeterTextLight, fontSize = 13.sp, textAlign = TextAlign.Center)
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxWidth().heightIn(max = 400.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    item {
                        Text(
                            "Se encontraron ${duplicateGroups.size} grupos de publicaciones que comparten la misma imagen. PodÃ©s desactivar o editar los duplicados aquÃ­.",
                            color = FeterTextGray,
                            fontSize = 11.sp
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                    }

                    items(duplicateGroups.entries.toList()) { entry ->
                        val cleanImg = entry.key
                        val groupProducts = entry.value
                        val repImgUrl = resolveProductImageUrl(groupProducts.first(), serverUrl)

                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF0F0F12)),
                            border = BorderStroke(1.dp, FeterOrange.copy(alpha = 0.2f))
                        ) {
                            Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                    // Thumbnail of the shared image
                                    Box(
                                        modifier = Modifier.size(54.dp).clip(RoundedCornerShape(8.dp)).background(Color.Black),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        if (repImgUrl != null) {
                                            AsyncImage(
                                                model = ImageRequest.Builder(LocalContext.current)
                                                    .data(repImgUrl)
                                                    .crossfade(200)
                                                    .build(),
                                                contentDescription = null,
                                                modifier = Modifier.fillMaxSize(),
                                                contentScale = androidx.compose.ui.layout.ContentScale.Crop
                                            )
                                        } else {
                                            Icon(Icons.Default.Image, contentDescription = null, tint = FeterTextGray)
                                        }
                                    }
                                    Column {
                                        Text("Imagen: $cleanImg", fontSize = 10.sp, color = FeterCyan, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                        Text("${groupProducts.size} repeticiones", fontSize = 11.sp, color = FeterOrange, fontWeight = FontWeight.Bold)
                                    }
                                }

                                Divider(color = Color.White.copy(alpha = 0.05f))

                                groupProducts.forEach { product ->
                                    val isActive = product.isOperationalActive()
                                    val stock = product.stockBySize?.values?.sum() ?: 0
                                    Row(
                                        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column(modifier = Modifier.weight(1f).padding(end = 8.dp)) {
                                            Text(product.name, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                            Text("ID: ${product.id.take(8)}... | Stock: $stock | ${if (isActive) "Activo" else "Inactivo"}", fontSize = 9.sp, color = FeterTextGray)
                                        }
                                        Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                            IconButton(
                                                onClick = { onToggleActive(product) },
                                                modifier = Modifier.size(28.dp).background(Color.White.copy(alpha = 0.05f), RoundedCornerShape(6.dp))
                                            ) {
                                                Icon(
                                                    imageVector = if (isActive) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                                    contentDescription = "Estado",
                                                    tint = if (isActive) FeterGreen else FeterTextGray,
                                                    modifier = Modifier.size(14.dp)
                                                )
                                            }
                                            IconButton(
                                                onClick = { onEditProduct(product) },
                                                modifier = Modifier.size(28.dp).background(Color.White.copy(alpha = 0.05f), RoundedCornerShape(6.dp))
                                            ) {
                                                Icon(
                                                    imageVector = Icons.Default.Edit,
                                                    contentDescription = "Editar",
                                                    tint = FeterCyan,
                                                    modifier = Modifier.size(14.dp)
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = onDismiss,
                colors = ButtonDefaults.buttonColors(containerColor = FeterCyan, contentColor = Color.Black)
            ) {
                Text("CERRAR", fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
        },
        containerColor = Color(0xFF151518)
    )
}
