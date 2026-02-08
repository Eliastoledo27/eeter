'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { registerPurchase } from '@/app/actions/purchases';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Loader2, User, Package, Hash, DollarSign } from 'lucide-react';


interface PurchaseFormProps {
    resellers: { id: string, full_name: string | null, email: string }[];
    products: { id: string, name: string, base_price: number }[];
    onSuccess: (code: string, orderId: string) => void;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            disabled={pending}
            type="submit"
            className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold uppercase tracking-widest transition-all shadow-xl shadow-primary/20"
        >
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Registrando...
                </>
            ) : (
                <>
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Registrar Compra VIP
                </>
            )}
        </Button>
    );
}

export function PurchaseForm({ resellers, products, onSuccess }: PurchaseFormProps) {
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [price, setPrice] = useState<string>('');

    const handleProductChange = (id: string) => {
        setSelectedProduct(id);
        const product = products.find(p => p.id === id);
        if (product) {
            setPrice(product.base_price.toString());
        }
    };

    const action = async (formData: FormData) => {
        const result = await registerPurchase(formData);
        if (result.success) {
            toast.success(result.message);
            if (result.referenceCode && result.orderId) {
                onSuccess(result.referenceCode, result.orderId);
            }
        } else {
            toast.error(result.message);
        }
    };

    return (
        <form action={action} className="space-y-6 bg-white/40 backdrop-blur-3xl p-8 rounded-[2rem] border border-white/60 shadow-2xl">
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] ml-2">Revendedor</label>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40">
                        <User size={18} />
                    </div>
                    <select
                        name="reseller_id"
                        required
                        className="w-full h-14 pl-12 pr-4 bg-white/60 border border-white/80 rounded-2xl text-sm font-bold appearance-none focus:ring-4 focus:ring-accent/5 focus:border-accent/30 transition-all outline-none"
                    >
                        <option value="">Seleccionar Revendedor...</option>
                        {resellers.map(r => (
                            <option key={r.id} value={r.id}>{r.full_name || r.email}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] ml-2">Producto</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40">
                            <Package size={18} />
                        </div>
                        <select
                            name="product_id"
                            required
                            value={selectedProduct}
                            onChange={(e) => handleProductChange(e.target.value)}
                            className="w-full h-14 pl-12 pr-4 bg-white/60 border border-white/80 rounded-2xl text-sm font-bold appearance-none focus:ring-4 focus:ring-accent/5 focus:border-accent/30 transition-all outline-none"
                        >
                            <option value="">Seleccionar Producto...</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] ml-2">Talle (Opcional)</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40">
                            <Hash size={18} />
                        </div>
                        <input
                            name="size"
                            placeholder="Ej: 42, XL, etc"
                            className="w-full h-14 pl-12 pr-4 bg-white/60 border border-white/80 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-accent/5 focus:border-accent/30 transition-all outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] ml-2">Cantidad</label>
                    <div className="relative">
                        <input
                            name="quantity"
                            type="number"
                            min="1"
                            defaultValue="1"
                            required
                            className="w-full h-14 px-6 bg-white/60 border border-white/80 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-accent/5 focus:border-accent/30 transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] ml-2">Precio de Venta</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40">
                            <DollarSign size={18} />
                        </div>
                        <input
                            name="price"
                            type="number"
                            required
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full h-14 pl-12 pr-4 bg-white/60 border border-white/80 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-accent/5 focus:border-accent/30 transition-all outline-none text-accent"
                        />
                    </div>
                </div>
            </div>

            <SubmitButton />
        </form>
    );
}
