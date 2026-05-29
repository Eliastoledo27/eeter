package com.example.myapplication.network

import com.google.gson.annotations.SerializedName
import okhttp3.RequestBody
import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Url

data class ProductDto(
    val id: String,
    val name: String,
    val description: String?,
    val category: String?,
    val price: Double,
    val image: String?,
    val images: List<String>?,
    @SerializedName("stock_by_size") val stockBySize: Map<String, Int>?,
    val stock: Int,
    val status: String,
    val brand: String?,
    @SerializedName("product_sections") val productSections: List<String>? = null
)

data class ResellerLinkDto(
    val id: String,
    @SerializedName("full_name") val fullName: String?,
    @SerializedName("reseller_slug") val resellerSlug: String?,
    val role: String?,
    @SerializedName("is_premium") val isPremium: Boolean?
)

data class NewProductDto(
    val id: String? = null,
    val name: String,
    val description: String = "",
    val category: String = "Otros",
    val price: Double,
    val images: List<String>? = null,
    val image: String? = null,
    @SerializedName("stock_by_size") val stockBySize: Map<String, Int>,
    val stock: Int? = null,
    val status: String = "activo",
    val brand: String = "Éter",
    @SerializedName("product_sections") val productSections: List<String> = listOf("catalog")
)


data class PedidoItemDto(
    @SerializedName("product_id") val productId: String? = null,
    @SerializedName("product_name") val productName: String? = null,
    val name: String? = null,
    val size: String? = null,
    val quantity: Int? = null,
    val qty: Int? = null,
    @SerializedName("unit_price") val unitPrice: Double? = null,
    val price: Double? = null
)

data class PedidoDto(
    val id: String,
    @SerializedName("customer_name") val customerName: String? = null,
    @SerializedName("customer_email") val customerEmail: String? = null,
    @SerializedName("total_amount") val totalAmount: Double? = null,
    val status: String? = null,
    val items: List<PedidoItemDto>? = null,
    @SerializedName("created_at") val createdAt: String? = null,
    @SerializedName("discount_amount") val discountAmount: Double? = null
)

data class CouponDto(
    val id: String? = null,
    val code: String,
    val type: String = "percentage",
    val value: Double,
    @SerializedName("min_purchase") val minPurchase: Double? = null,
    @SerializedName("is_active") val isActive: Boolean = true,
    @SerializedName("usage_limit") val usageLimit: Int? = null,
    @SerializedName("usage_count") val usageCount: Int? = null,
    @SerializedName("expires_at") val expiresAt: String? = null
)

data class AnnouncementDto(
    val id: String? = null,
    val title: String,
    val content: String? = null,
    val category: String? = null,
    @SerializedName("image_url") val imageUrl: String? = null,
    @SerializedName("is_active") val isActive: Boolean = true,
    @SerializedName("target_pages") val targetPages: List<String> = listOf("home"),
    @SerializedName("template_key") val templateKey: String = "minimal",
    @SerializedName("display_mode") val displayMode: String = "floating",
    @SerializedName("cta_label") val ctaLabel: String? = null,
    @SerializedName("cta_url") val ctaUrl: String? = null,
    val priority: Int = 0
)

data class AnnouncementAiRequest(
    val templateKey: String? = null,
    val productName: String? = null,
    val brand: String? = null,
    val category: String? = null,
    val price: Double? = null,
    val stock: Int? = null,
    val targetPages: List<String> = emptyList(),
    val tone: String? = null
)

data class AnnouncementAiResponse(
    val title: String? = null,
    val content: String? = null,
    val category: String? = null,
    val ctaLabel: String? = null,
    val priority: Int? = null,
    val displayMode: String? = null,
    val source: String? = null,
    val error: String? = null
)

data class AdminSyncRequest(
    val action: String,
    val productId: String? = null,
    val sections: List<String>? = null,
    @SerializedName("stockBySize") val stockBySize: Map<String, Int>? = null,
    val price: Double? = null,
    val name: String? = null,
    val description: String? = null,
    val category: String? = null,
    val brand: String? = null,
    val orderId: String? = null,
    val status: String? = null,
    val productData: NewProductDto? = null,
    val bulkProducts: List<NewProductDto>? = null,
    val coupon: CouponDto? = null,
    val announcement: AnnouncementDto? = null,
    val id: String? = null
)

data class AdminRpcRequest(
    val payload: AdminSyncRequest
)

data class AdminSyncResponse(
    val success: Boolean,
    val error: String? = null,
    val pedidos: List<PedidoDto>? = null,
    val coupons: List<CouponDto>? = null,
    val announcements: List<AnnouncementDto>? = null,
    val resellerLinks: List<ResellerLinkDto>? = null
)

interface ProductApiService {
    @GET("productos?select=id,name,description,category,price,image,images,stock_by_size,stock,status,brand,product_sections&order=name.asc")
    suspend fun getSupabaseProducts(
        @Header("apikey") apiKey: String,
        @Header("Authorization") token: String
    ): Response<List<ProductDto>>

    @POST("rpc/feter_admin_sync")
    suspend fun supabaseAdminSync(
        @Header("apikey") apiKey: String,
        @Header("Authorization") token: String,
        @Header("x-admin-token") adminToken: String,
        @Body payload: AdminRpcRequest
    ): Response<AdminSyncResponse>

    @POST
    suspend fun uploadSupabaseStorageObject(
        @Url url: String,
        @Header("apikey") apiKey: String,
        @Header("Authorization") token: String,
        @Header("Content-Type") contentType: String,
        @Header("x-upsert") upsert: String = "false",
        @Body body: RequestBody
    ): Response<ResponseBody>

    @POST
    suspend fun generateAnnouncementAi(
        @Url url: String,
        @Body payload: AnnouncementAiRequest
    ): Response<AnnouncementAiResponse>

}
