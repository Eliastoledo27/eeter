'use client';

import { useState, useEffect } from 'react';
import { getAllResellers } from '@/app/actions/reseller-catalog';
import { adminUpdateProfile } from '@/app/actions/profiles';
import type { Profile } from '@/types/profiles';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import {
    Search,
    Store,
    Edit,
    Ban,
    CheckCircle,
    XCircle,
    Coins,
    RefreshCw,
    ExternalLink,
    Mail,
    Phone,
    Sparkles,
    AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

function formatDate(dateStr?: string | null) {
    if (!dateStr) return 'Nunca';
    try {
        const date = new Date(dateStr);
        return date.toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return 'Inválido';
    }
}

export function AdminMyShopManager() {
    const [resellers, setResellers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

    // Modal states
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isSuspendOpen, setIsSuspendOpen] = useState(false);
    const [selectedReseller, setSelectedReseller] = useState<Profile | null>(null);

    // Edit form states
    const [fullName, setFullName] = useState('');
    const [slug, setSlug] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [markup, setMarkup] = useState<number>(0);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadResellers();
    }, []);

    const loadResellers = async () => {
        setLoading(true);
        try {
            const { data, error } = await getAllResellers();
            if (error) {
                toast.error(error);
            } else if (data) {
                setResellers(data);
            }
        } catch (err) {
            console.error('Error loading resellers:', err);
            toast.error('Error al cargar revendedores');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEdit = (reseller: Profile) => {
        setSelectedReseller(reseller);
        setFullName(reseller.full_name || '');
        setSlug(reseller.reseller_slug || '');
        setWhatsapp(reseller.whatsapp_number || '');
        setMarkup(reseller.reseller_markup || 0);
        setIsEditOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedReseller) return;

        setIsSaving(true);
        try {
            // Clean slug: remove spaces, lowercase, and remove special characters
            const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');

            const updateData = {
                full_name: fullName.trim() || null,
                reseller_slug: cleanSlug || null,
                whatsapp_number: whatsapp.trim() || null,
                reseller_markup: Number(markup) >= 0 ? Number(markup) : 0
            };

            const { success, error } = await adminUpdateProfile(selectedReseller.id, updateData);

            if (success) {
                toast.success('Tienda actualizada correctamente');
                setIsEditOpen(false);
                loadResellers();
            } else {
                toast.error(error || 'Error al actualizar la tienda');
            }
        } catch (err) {
            console.error('Error saving reseller store:', err);
            toast.error('Error al procesar la actualización');
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenSuspend = (reseller: Profile) => {
        setSelectedReseller(reseller);
        setIsSuspendOpen(true);
    };

    const handleConfirmSuspend = async () => {
        if (!selectedReseller) return;

        setIsSaving(true);
        try {
            // Suspends storefront by setting slug to null as per instructions
            const { success, error } = await adminUpdateProfile(selectedReseller.id, {
                reseller_slug: null
            });

            if (success) {
                toast.success(`Tienda de ${selectedReseller.full_name || 'Revendedor'} suspendida correctamente`);
                setIsSuspendOpen(false);
                loadResellers();
            } else {
                toast.error(error || 'Error al suspender la tienda');
            }
        } catch (err) {
            console.error('Error suspending reseller:', err);
            toast.error('Error al procesar la suspensión');
        } finally {
            setIsSaving(false);
        }
    };

    // Filter resellers based on search term and status filter
    const filteredResellers = resellers.filter(reseller => {
        const matchesSearch =
            reseller.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reseller.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reseller.reseller_slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reseller.whatsapp_number?.includes(searchTerm);

        const isActive = Boolean(reseller.reseller_slug);
        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'active' && isActive) ||
            (statusFilter === 'suspended' && !isActive);

        return matchesSearch && matchesStatus;
    });

    // Compute stats
    const totalShops = resellers.length;
    const activeShops = resellers.filter(r => Boolean(r.reseller_slug)).length;
    const suspendedShops = totalShops - activeShops;
    const activeWithMarkup = resellers.filter(r => Boolean(r.reseller_slug) && r.reseller_markup > 0);
    const averageMarkup = activeWithMarkup.length > 0
        ? Math.round(activeWithMarkup.reduce((sum, r) => sum + r.reseller_markup, 0) / activeWithMarkup.length)
        : 0;

    return (
        <div className="space-y-8 p-4 md:p-6 text-white max-w-7xl mx-auto">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#00E5FF] to-[#FF007A] bg-clip-text text-transparent flex items-center gap-3">
                        <Store className="h-8 w-8 text-[#00E5FF]" />
                        Ajustes Mi Tienda
                    </h2>
                    <p className="text-zinc-400 mt-2 text-sm max-w-xl">
                        Panel de administración central para supervisar, editar y suspender catálogos activos de revendedores de manera gratuita.
                    </p>
                </div>
                <Button
                    onClick={loadResellers}
                    disabled={loading}
                    className="bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white flex items-center gap-2 transition-all hover:border-[#00E5FF]/50"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Actualizar Lista
                </Button>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-[#00E5FF]/30 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#00E5FF]/5 rounded-bl-full pointer-events-none transition-all group-hover:bg-[#00E5FF]/10" />
                    <p className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">Tiendas Totales</p>
                    <p className="text-4xl font-black mt-2 text-white">{totalShops}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
                        <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
                        <span>Resgistrados en el ecosistema</span>
                    </div>
                </div>

                <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none transition-all group-hover:bg-emerald-500/10" />
                    <p className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">Tiendas Activas</p>
                    <p className="text-4xl font-black mt-2 text-emerald-400">{activeShops}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400/80">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Catálogos públicos online</span>
                    </div>
                </div>

                <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-rose-500/30 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full pointer-events-none transition-all group-hover:bg-rose-500/10" />
                    <p className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">Tiendas Suspendidas</p>
                    <p className="text-4xl font-black mt-2 text-rose-500">{suspendedShops}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-rose-400/80">
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Sin slug / fuera de línea</span>
                    </div>
                </div>

                <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-[#FF007A]/30 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF007A]/5 rounded-bl-full pointer-events-none transition-all group-hover:bg-[#FF007A]/10" />
                    <p className="text-zinc-400 text-xs uppercase tracking-wider font-semibold">Margen Promedio</p>
                    <p className="text-4xl font-black mt-2 text-[#FF007A]">${averageMarkup.toLocaleString()}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
                        <Coins className="h-3.5 w-3.5 text-[#FF007A]" />
                        <span>Ganancia añadida por calzado</span>
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 h-4.5 w-4.5" />
                    <Input
                        placeholder="Buscar por nombre, correo, slug o teléfono..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-zinc-950/60 border-white/10 text-white placeholder-zinc-500 focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] rounded-xl h-11"
                    />
                </div>

                <div className="flex bg-zinc-950/60 border border-white/10 p-1 rounded-xl w-full md:w-auto">
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`flex-1 md:flex-none px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                            statusFilter === 'all'
                                ? 'bg-gradient-to-r from-[#00E5FF] to-[#00B0FF] text-black shadow-md'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        Todos ({totalShops})
                    </button>
                    <button
                        onClick={() => setStatusFilter('active')}
                        className={`flex-1 md:flex-none px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                            statusFilter === 'active'
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-md'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        Activos ({activeShops})
                    </button>
                    <button
                        onClick={() => setStatusFilter('suspended')}
                        className={`flex-1 md:flex-none px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                            statusFilter === 'suspended'
                                ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        Suspendidos ({suspendedShops})
                    </button>
                </div>
            </div>

            {/* Main Table section */}
            <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-3">
                        <RefreshCw className="h-8 w-8 text-[#00E5FF] animate-spin" />
                        <p className="text-zinc-400 text-sm">Cargando tiendas de revendedores...</p>
                    </div>
                ) : filteredResellers.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4 text-center px-4">
                        <Store className="h-16 w-16 text-zinc-600 border border-white/5 p-4 rounded-full bg-white/5" />
                        <div>
                            <h3 className="text-lg font-bold text-white">No se encontraron tiendas</h3>
                            <p className="text-zinc-500 text-sm mt-1 max-w-sm">
                                Intenta cambiar los criterios de búsqueda o filtros para encontrar lo que buscas.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-zinc-950/60 border-b border-white/10">
                                <TableRow className="hover:bg-transparent border-white/10">
                                    <TableHead className="text-zinc-400 font-bold py-4">Showroom / Revendedor</TableHead>
                                    <TableHead className="text-zinc-400 font-bold py-4">Enlace de la Tienda</TableHead>
                                    <TableHead className="text-zinc-400 font-bold py-4">Datos Bancarios</TableHead>
                                    <TableHead className="text-zinc-400 font-bold py-4">Margen / WhatsApp</TableHead>
                                    <TableHead className="text-zinc-400 font-bold py-4">Actividad</TableHead>
                                    <TableHead className="text-zinc-400 font-bold py-4">Estado</TableHead>
                                    <TableHead className="text-zinc-400 font-bold py-4 text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredResellers.map((reseller) => {
                                    const isActive = Boolean(reseller.reseller_slug);
                                    const hasBankDetails = reseller.bank_owner_name && (reseller.bank_cbu || reseller.bank_alias);
                                    return (
                                        <TableRow
                                            key={reseller.id}
                                            className="border-white/10 hover:bg-white/[0.02] transition-colors"
                                        >
                                            {/* Name and Email */}
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center font-bold text-lg text-zinc-300">
                                                        {(reseller.full_name || reseller.email || 'R')[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white text-base">
                                                            {reseller.full_name || 'Sin nombre configurado'}
                                                        </p>
                                                        <p className="text-zinc-400 text-xs flex items-center gap-1 mt-0.5">
                                                            <Mail className="h-3 w-3 text-zinc-500" />
                                                            {reseller.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Slug Link */}
                                            <TableCell className="py-4">
                                                {isActive ? (
                                                    <a
                                                        href={`/c/${reseller.reseller_slug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[#00E5FF] hover:underline text-sm font-medium flex items-center gap-1.5 group"
                                                    >
                                                        <span>éter.store/c/{reseller.reseller_slug}</span>
                                                        <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                                                    </a>
                                                ) : (
                                                    <span className="text-zinc-600 text-sm italic">Sin enlace / Fuera de línea</span>
                                                )}
                                            </TableCell>

                                            {/* Bank details summary (critical anti-scam / anti-malpractice indicator) */}
                                            <TableCell className="py-4">
                                                {hasBankDetails ? (
                                                    <div className="text-xs space-y-0.5 font-mono text-zinc-300">
                                                        <p className="font-bold text-white truncate max-w-[180px]">{reseller.bank_owner_name}</p>
                                                        {reseller.bank_cbu && <p className="text-[10px] text-zinc-400">CBU: {reseller.bank_cbu}</p>}
                                                        {reseller.bank_alias && <p className="text-[10px] text-zinc-400">Alias: {reseller.bank_alias}</p>}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col gap-1">
                                                        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 px-2 py-0.5 text-[10px] font-bold rounded-lg w-max flex items-center gap-1">
                                                            <AlertTriangle className="h-3 w-3" /> FALTAN DATOS
                                                        </Badge>
                                                        <span className="text-[10px] text-zinc-500 italic">No puede recibir cobros</span>
                                                    </div>
                                                )}
                                            </TableCell>

                                            {/* Margen / WhatsApp */}
                                            <TableCell className="py-4">
                                                <div className="text-xs space-y-0.5 text-zinc-300">
                                                    <p className="font-bold text-white">${(reseller.reseller_markup || 0).toLocaleString()} ARS</p>
                                                    {reseller.whatsapp_number ? (
                                                        <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            {reseller.whatsapp_number}
                                                        </p>
                                                    ) : (
                                                        <p className="text-[10px] text-zinc-500 italic">Sin WhatsApp</p>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Actividad: Último inicio y Última edición */}
                                            <TableCell className="py-4">
                                                <div className="text-xs space-y-0.5 font-mono text-zinc-300">
                                                    <p><span className="text-zinc-500 text-[10px]">Inicio:</span> {formatDate(reseller.last_activity)}</p>
                                                    <p><span className="text-zinc-500 text-[10px]">Edición:</span> {formatDate(reseller.updated_at)}</p>
                                                </div>
                                            </TableCell>

                                            {/* Status Badge */}
                                            <TableCell className="py-4">
                                                {isActive ? (
                                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-2.5 py-1 rounded-lg font-medium text-xs">
                                                        Activa
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 px-2.5 py-1 rounded-lg font-medium text-xs">
                                                        Suspendida
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleOpenEdit(reseller)}
                                                        className="bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white hover:text-[#00E5FF] hover:border-[#00E5FF]/40 flex items-center gap-1 h-9 rounded-lg"
                                                    >
                                                        <Edit className="h-3.5 w-3.5" />
                                                        Editar
                                                    </Button>

                                                    {isActive ? (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleOpenSuspend(reseller)}
                                                            className="bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/20 hover:border-rose-500/50 text-rose-400 flex items-center gap-1 h-9 rounded-lg"
                                                        >
                                                            <Ban className="h-3.5 w-3.5" />
                                                            Suspender
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleOpenEdit(reseller)}
                                                            className="bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 border border-[#00E5FF]/20 hover:border-[#00E5FF]/50 text-[#00E5FF] flex items-center gap-1 h-9 rounded-lg"
                                                        >
                                                            <CheckCircle className="h-3.5 w-3.5" />
                                                            Activar
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {/* EDIT SHOP MODAL */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-zinc-950 border border-white/10 text-white max-w-md rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                            <Store className="h-5 w-5 text-[#00E5FF]" />
                            Editar Configuración de Tienda
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400 text-sm mt-1">
                            Ajusta el nombre, slug del catálogo público, margen de ganancia y WhatsApp de pedidos para el revendedor.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedReseller && (
                        <div className="space-y-5 my-4">
                            {/* Readonly Account Info */}
                            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3.5 flex items-center gap-3">
                                <Mail className="h-4.5 w-4.5 text-zinc-500" />
                                <div>
                                    <p className="text-zinc-500 text-2xs uppercase tracking-wider font-bold">Cuenta de Acceso</p>
                                    <p className="text-zinc-300 text-sm font-medium">{selectedReseller.email}</p>
                                </div>
                            </div>

                            {/* Showroom name input */}
                            <div className="space-y-2">
                                <label className="text-zinc-300 text-xs font-bold">Nombre del Showroom (Título)</label>
                                <Input
                                    placeholder="Ej: Zapatillas VIP, Elias Calzados"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="bg-zinc-900 border-white/10 text-white focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] rounded-xl h-11"
                                />
                            </div>

                            {/* Storefront slug input */}
                            <div className="space-y-2">
                                <label className="text-zinc-300 text-xs font-bold">Slug del Catálogo (Dirección URL)</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-3 text-zinc-500 text-sm select-none">éter.store/c/</span>
                                    <Input
                                        placeholder="elias-tole"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        className="pl-[92px] bg-zinc-900 border-white/10 text-white focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] rounded-xl h-11"
                                    />
                                </div>
                                <p className="text-zinc-500 text-3xs mt-1">
                                    Solo letras, números y guiones. Dejar vacío desactivará la tienda pública.
                                </p>
                            </div>

                            {/* WhatsApp input */}
                            <div className="space-y-2">
                                <label className="text-zinc-300 text-xs font-bold">WhatsApp para Pedidos</label>
                                <Input
                                    placeholder="Ej: 5491122334455"
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(e.target.value)}
                                    className="bg-zinc-900 border-white/10 text-white focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] rounded-xl h-11"
                                />
                                <p className="text-zinc-500 text-3xs mt-1">
                                    Código de país + código de área sin el 0 ni el 15.
                                </p>
                            </div>

                            {/* Markup input */}
                            <div className="space-y-2">
                                <label className="text-zinc-300 text-xs font-bold">Margen Global de Ganancia (ARS)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-semibold">$</span>
                                    <Input
                                        type="number"
                                        min="0"
                                        placeholder="12000"
                                        value={markup === 0 ? '' : markup}
                                        onChange={(e) => setMarkup(Math.max(0, parseInt(e.target.value) || 0))}
                                        className="pl-7 bg-zinc-900 border-white/10 text-white focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] rounded-xl h-11"
                                    />
                                </div>
                                <p className="text-zinc-500 text-3xs mt-1">
                                    Monto que se sumará al precio mayorista de cada producto en la tienda del revendedor.
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0 mt-6">
                        <Button
                            onClick={() => setIsEditOpen(false)}
                            variant="ghost"
                            className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl h-11"
                            disabled={isSaving}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSaveEdit}
                            className="bg-gradient-to-r from-[#00E5FF] to-[#00B0FF] hover:from-[#00B0FF] hover:to-[#0080FF] text-black font-bold rounded-xl h-11 px-6 shadow-lg shadow-[#00E5FF]/20"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* SUSPEND CONFIRMATION MODAL */}
            <Dialog open={isSuspendOpen} onOpenChange={setIsSuspendOpen}>
                <DialogContent className="bg-zinc-950 border border-white/10 text-white max-w-md rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-white flex items-center gap-2 text-rose-500">
                            <AlertTriangle className="h-5 w-5" />
                            Suspender Tienda
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400 text-sm mt-1">
                            ¿Estás seguro de que deseas suspender la tienda de {selectedReseller?.full_name || 'este revendedor'}?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 my-4 flex gap-3">
                        <Ban className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                        <div className="text-xs text-rose-200 leading-relaxed">
                            Esta acción establecerá el <span className="font-bold">slug del catálogo a nulo</span>, lo que desactivará inmediatamente su página pública en la dirección <span className="underline font-bold">éter.store/c/{selectedReseller?.reseller_slug}</span>. El revendedor aún conservará su cuenta pero sus clientes no podrán acceder a su catálogo.
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 mt-6">
                        <Button
                            onClick={() => setIsSuspendOpen(false)}
                            variant="ghost"
                            className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl h-11"
                            disabled={isSaving}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleConfirmSuspend}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl h-11 px-6 shadow-lg shadow-rose-600/20"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Suspendiendo...' : 'Sí, suspender tienda'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
