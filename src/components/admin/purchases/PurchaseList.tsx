'use client';

import { PurchaseRecord } from '@/app/actions/purchases';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MoreHorizontal, Eye, ShoppingCart, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PurchaseListProps {
    purchases: PurchaseRecord[];
    onViewTicket: (id: string) => void;
}

export function PurchaseList({ purchases, onViewTicket }: PurchaseListProps) {
    if (purchases.length === 0) {
        return (
            <div className="bg-black/40 backdrop-blur-3xl rounded-[2.5rem] p-20 text-center border border-white/10 shadow-xl">
                <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground/20 mb-6" />
                <h3 className="text-xl font-bold text-foreground mb-2">Sin registros de compras</h3>
                <p className="text-muted-foreground max-w-xs mx-auto text-sm">Aún no se han registrado compras manuales para revendedores.</p>
            </div>
        );
    }

    return (
        <div className="bg-black/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-white/5 bg-black/40">
                <h3 className="text-lg font-bold text-foreground">Historial de Operaciones</h3>
                <p className="text-xs text-muted-foreground font-medium">Registro cronológico de ventas a revendedores</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/5">
                            <th className="px-8 py-5 text-left text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">Referencia</th>
                            <th className="px-8 py-5 text-left text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">Revendedor</th>
                            <th className="px-8 py-5 text-left text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">Producto</th>
                            <th className="px-8 py-5 text-left text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">Inversión</th>
                            <th className="px-8 py-5 text-left text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">Fecha</th>
                            <th className="px-8 py-5 text-right text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {purchases.map((purchase) => (
                            <tr key={purchase.id} className="hover:bg-accent/5 transition-colors group">
                                <td className="px-8 py-6">
                                    <span className="text-xs font-black tracking-widest text-white bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 shadow-sm group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                                        {purchase.reference_code}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-[10px] font-black border border-accent/20">
                                            {purchase.reseller_name.charAt(0).toUpperCase()}
                                        </div>
                                        <p className="text-sm font-bold text-foreground">{purchase.reseller_name}</p>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-foreground">{purchase.product_name}</span>
                                        <span className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Cantidad: {purchase.quantity}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span suppressHydrationWarning className="text-sm font-black text-accent">
                                        ${Number(purchase.total).toLocaleString('es-AR')}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2 text-muted-foreground font-medium text-xs">
                                        <Calendar size={12} />
                                        {format(new Date(purchase.created_at), "d MMM, yy", { locale: es })}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-black/5 rounded-xl">
                                                <MoreHorizontal size={18} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-black/90 backdrop-blur-2xl border-white/10 rounded-2xl shadow-2xl p-2 min-w-[160px]">
                                            <DropdownMenuItem
                                                onClick={() => onViewTicket(purchase.id)}
                                                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-foreground hover:bg-primary hover:text-white rounded-xl cursor-not-allowed transition-all"
                                            >
                                                <Eye size={16} /> Ver Ticket
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-foreground hover:bg-black/5 rounded-xl cursor-pointer">
                                                <Tag size={16} /> Editar Registro
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
