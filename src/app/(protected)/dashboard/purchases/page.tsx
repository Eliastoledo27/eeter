'use client';

import { useEffect, useState } from 'react';
import { getPurchases, getResellers, getProductsForPurchase, PurchaseRecord } from '@/app/actions/purchases';
import { PurchaseForm } from '@/components/admin/purchases/PurchaseForm';
import { PurchaseList } from '@/components/admin/purchases/PurchaseList';
import { PurchaseTicket } from '@/components/admin/purchases/PurchaseTicket';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, History, Sparkles, ShoppingBag, Users } from 'lucide-react';
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
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-2xl font-light text-white font-mono tracking-tighter flex items-center gap-3">
                        ORDER MANAGEMENT <span className="text-primary">{'//'}</span> LOGISTICS
                    </h1>
                    <p className="text-xs text-gray-500 font-mono mt-2 tracking-widest uppercase">
                        Administrative Transaction record
                    </p>
                </div>

                <button
                    onClick={() => setShowForm(!showForm)}
                    className="group relative px-6 py-3 bg-primary/10 border border-primary/50 text-primary hover:bg-primary hover:text-white rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 overflow-hidden transition-all shadow-[0_0_15px_rgba(200,138,4,0.1)] hover:shadow-[0_0_25px_rgba(200,138,4,0.3)]"
                >
                    {showForm ? <History size={16} /> : <Plus size={16} />}
                    <span className="relative z-10">{showForm ? 'VIEW HISTORY' : 'REGISTER NEW ORDER'}</span>
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
                                <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-[10px] font-mono uppercase tracking-[0.2em] border border-primary/20">
                                    Admin Only Access
                                </span>
                                <h2 className="text-2xl font-bold text-white mt-4 font-mono">NEW TRANSACTION ENTRY</h2>
                                <p className="text-gray-400 text-xs mt-2 font-mono">Fill in details to generate official invoice.</p>
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
                                <div className="bg-black/40 backdrop-blur-md p-6 rounded-xl border border-white/10 relative overflow-hidden group">
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
                                    <div className="flex justify-between items-start mb-4">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Total Revenue</p>
                                        <Sparkles size={14} className="text-primary animate-pulse" />
                                    </div>
                                    <p className="text-3xl font-light text-white font-mono tracking-tighter">
                                        ${purchases.reduce((acc, p) => acc + p.total, 0).toLocaleString('es-AR')}
                                    </p>
                                    <div className="mt-4 flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-widest">
                                        LIVE DATA
                                    </div>
                                </div>

                                <div className="bg-black/40 backdrop-blur-md p-6 rounded-xl border border-white/10 relative overflow-hidden group">
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
                                    <div className="flex justify-between items-start mb-4">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Orders Processed</p>
                                        <ShoppingBag size={14} className="text-gray-400" />
                                    </div>
                                    <p className="text-3xl font-light text-white font-mono tracking-tighter">
                                        {purchases.length}
                                    </p>
                                    <p className="mt-4 text-[10px] text-gray-500 font-mono tracking-widest uppercase">Last 30 Days</p>
                                </div>

                                <div className="bg-black/40 backdrop-blur-md p-6 rounded-xl border border-white/10 relative overflow-hidden group">
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
                                    <div className="flex justify-between items-start mb-4">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Active Resellers</p>
                                        <Users size={14} className="text-blue-400" />
                                    </div>
                                    <p className="text-3xl font-light text-white font-mono tracking-tighter">
                                        {resellers.length}
                                    </p>
                                    <p className="mt-4 text-[10px] text-gray-500 font-mono tracking-widest uppercase">VIP Network</p>
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
