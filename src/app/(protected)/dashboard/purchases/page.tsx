'use client';

import { useEffect, useState } from 'react';
import { getPurchases, getResellers, getProductsForPurchase, PurchaseRecord } from '@/app/actions/purchases';
import { PurchaseForm } from '@/components/admin/purchases/PurchaseForm';
import { PurchaseList } from '@/components/admin/purchases/PurchaseList';
import { PurchaseTicket } from '@/components/admin/purchases/PurchaseTicket';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Receipt, History, Sparkles } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface Reseller {
    id: string;
    full_name: string | null;
    email: string;
}

interface ProductOption {
    id: string;
    name: string;
    base_price: number;
    images: string[] | null;
}

interface TicketOrder extends PurchaseRecord {
    referenceCode: string; // Required for PurchaseTicket
    items: {
        name: string;
        quantity: number;
        price: number;
        size?: string;
    }[];
    customer_name: string;
    total_amount: number;
}

export default function PurchasesPage() {
    const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
    const [resellers, setResellers] = useState<Reseller[]>([]);
    const [products, setProducts] = useState<ProductOption[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<TicketOrder | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [p, r, pr] = await Promise.all([
                    getPurchases(),
                    getResellers(),
                    getProductsForPurchase()
                ]);
                setPurchases(p);
                setResellers(r);
                setProducts(pr);
            } catch (error) {
                console.error('Error loading purchases data:', error);
            }
        };
        loadData();
    }, []);

    const handlePurchaseSuccess = async (code: string, orderId: string) => {
        setShowForm(false);
        // Reload list
        const updated = await getPurchases();
        setPurchases(updated);

        // Find the new order to show ticket
        const newOrder = updated.find(p => p.id === orderId);
        if (newOrder) {
            // We need to fetch full items for the ticket, but for now we can mock from newOrder
            setSelectedOrder({
                ...newOrder,
                referenceCode: code,
                customer_name: newOrder.reseller_name,
                total_amount: newOrder.total,
                items: [{
                    name: newOrder.product_name,
                    quantity: newOrder.quantity,
                    price: newOrder.price,
                }]
            } as TicketOrder);
        }
    };

    const handleViewTicket = (id: string) => {
        const order = purchases.find(p => p.id === id);
        if (order) {
            setSelectedOrder({
                ...order,
                referenceCode: order.reference_code,
                customer_name: order.reseller_name,
                total_amount: order.total,
                items: [{
                    name: order.product_name,
                    quantity: order.quantity,
                    price: order.price,
                }]
            } as TicketOrder);
        }
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tight flex items-center gap-3">
                        <Receipt className="text-primary" size={36} />
                        Gestión de Compras
                    </h1>
                    <p className="text-muted-foreground font-medium mt-1">Registro de transacciones exclusivas para revendedores VIP.</p>
                </div>

                <button
                    onClick={() => setShowForm(!showForm)}
                    className="group relative px-8 py-4 bg-primary text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 overflow-hidden shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 active:scale-95 transition-all"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    {showForm ? <History size={18} /> : <Plus size={18} />}
                    <span className="relative z-10">{showForm ? 'Ver Historial' : 'Registrar Nueva Compra'}</span>
                </button>
            </div>

            <main className="relative">
                <AnimatePresence mode="wait">
                    {showForm ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-3xl mx-auto"
                        >
                            <div className="text-center mb-10">
                                <span className="px-4 py-2 bg-accent/10 text-accent rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-accent/20">
                                    Admin Only Access
                                </span>
                                <h2 className="text-2xl font-black text-foreground mt-4">Formulario de Registro</h2>
                                <p className="text-muted-foreground text-sm mt-2">Complete los detalles de la venta para generar el comprobante oficial.</p>
                            </div>
                            <PurchaseForm
                                resellers={resellers}
                                products={products}
                                onSuccess={handlePurchaseSuccess}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                <div className="bg-white/40 backdrop-blur-3xl p-8 rounded-[2rem] border border-white/60 shadow-xl relative overflow-hidden group">
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mb-2">Total Operado</p>
                                    <p className="text-3xl font-black text-foreground font-heading">
                                        ${purchases.reduce((acc, p) => acc + p.total, 0).toLocaleString('es-AR')}
                                    </p>
                                    <div className="mt-4 flex items-center gap-2 text-emerald-500 font-bold text-[10px] uppercase tracking-widest">
                                        <Sparkles size={12} />
                                        Métricas en tiempo real
                                    </div>
                                </div>
                                <div className="bg-white/40 backdrop-blur-3xl p-8 rounded-[2rem] border border-white/60 shadow-xl relative overflow-hidden group">
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors" />
                                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mb-2">Pedidos Realizados</p>
                                    <p className="text-3xl font-black text-foreground font-heading">
                                        {purchases.length}
                                    </p>
                                    <p className="mt-4 text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Últimos 30 días</p>
                                </div>
                                <div className="bg-white/40 backdrop-blur-3xl p-8 rounded-[2rem] border border-white/60 shadow-xl relative overflow-hidden group">
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
                                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mb-2">Revendedores Activos</p>
                                    <p className="text-3xl font-black text-foreground font-heading">
                                        {resellers.length}
                                    </p>
                                    <p className="mt-4 text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Red ETER VIP</p>
                                </div>
                            </div>

                            <PurchaseList
                                purchases={purchases}
                                onViewTicket={handleViewTicket}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Ticket Modal */}
            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="max-w-md p-0 bg-transparent border-none shadow-none gap-0">
                    {selectedOrder && (
                        <PurchaseTicket
                            order={selectedOrder}
                            onClose={() => setSelectedOrder(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
