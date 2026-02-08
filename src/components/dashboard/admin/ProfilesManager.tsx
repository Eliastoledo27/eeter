'use client';

import { useState, useEffect } from 'react';
import { getAllProfiles, adminUpdateProfile } from '@/app/actions/profiles';
import Image from 'next/image';
import type { Profile, UserRole } from '@/types/profiles';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Crown, Headphones, Store, User, Check, X } from 'lucide-react';
import { toast } from 'sonner';

const ROLE_ICONS = {
    admin: Crown,
    support: Headphones,
    reseller: Store,
    user: User,
};

const ROLE_COLORS = {
    admin: 'bg-error/10 text-error border-error/20',
    support: 'bg-warning/10 text-warning border-warning/20',
    reseller: 'bg-primary/10 text-primary border-primary/20',
    user: 'bg-content-muted/10 text-content-muted border-content-muted/20',
};

const ROLE_LABELS = {
    admin: 'Admin',
    support: 'Soporte',
    reseller: 'Revendedor',
    user: 'Usuario',
};

export function ProfilesManager() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingRole, setEditingRole] = useState<UserRole>('user');

    useEffect(() => {
        loadProfiles();
    }, []);

    const loadProfiles = async () => {
        setLoading(true);
        const { data, error } = await getAllProfiles();

        if (error) {
            toast.error(error);
        } else if (data) {
            setProfiles(data);
        }

        setLoading(false);
    };

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        const { success, error } = await adminUpdateProfile(userId, { role: newRole });

        if (success) {
            toast.success('Rol actualizado correctamente');
            setEditingId(null);
            loadProfiles();
        } else {
            toast.error(error || 'Error al actualizar rol');
        }
    };

    const filteredProfiles = profiles.filter(profile => {
        const matchesSearch =
            profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            profile.whatsapp_number?.includes(searchTerm);

        const matchesRole = roleFilter === 'all' || profile.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    const roleStats = {
        admin: profiles.filter(p => p.role === 'admin').length,
        support: profiles.filter(p => p.role === 'support').length,
        reseller: profiles.filter(p => p.role === 'reseller').length,
        user: profiles.filter(p => p.role === 'user').length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-content-heading">Gestión de Perfiles</h2>
                    <p className="text-content-muted mt-1">
                        Administra usuarios, roles y permisos
                    </p>
                </div>
                <Button onClick={loadProfiles} variant="outline">
                    Actualizar
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {(Object.keys(ROLE_LABELS) as UserRole[]).map(role => {
                    const Icon = ROLE_ICONS[role];
                    return (
                        <div
                            key={role}
                            className="border border-border rounded-lg p-4 bg-surface hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${ROLE_COLORS[role]}`}>
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-content-muted">{ROLE_LABELS[role]}</p>
                                        <p className="text-2xl font-bold text-content-heading">{roleStats[role]}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted h-4 w-4" />
                    <Input
                        placeholder="Buscar por nombre, email o teléfono..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole | 'all')}>
                    <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="Filtrar por rol" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los roles</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="support">Soporte</SelectItem>
                        <SelectItem value="reseller">Revendedor</SelectItem>
                        <SelectItem value="user">Usuario</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="border border-border rounded-lg overflow-hidden bg-surface">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>WhatsApp</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Premium</TableHead>
                            <TableHead>Puntos</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-content-muted">
                                    Cargando perfiles...
                                </TableCell>
                            </TableRow>
                        ) : filteredProfiles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-content-muted">
                                    No se encontraron perfiles
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProfiles.map(profile => {
                                const Icon = ROLE_ICONS[profile.role];
                                const isEditing = editingId === profile.id;

                                return (
                                    <TableRow key={profile.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {profile.avatar_url ? (
                                                    <Image
                                                        src={profile.avatar_url}
                                                        alt={profile.full_name || 'Avatar'}
                                                        width={32}
                                                        height={32}
                                                        className="w-8 h-8 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                                                        {profile.full_name?.charAt(0) || profile.email?.charAt(0) || 'U'}
                                                    </div>
                                                )}
                                                <span className="font-medium text-content-heading">
                                                    {profile.full_name || 'Sin nombre'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-content-muted">{profile.email}</TableCell>
                                        <TableCell className="text-content-muted">{profile.whatsapp_number || '-'}</TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <Select
                                                    value={editingRole}
                                                    onValueChange={(v) => setEditingRole(v as UserRole)}
                                                >
                                                    <SelectTrigger className="w-[140px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="user">Usuario</SelectItem>
                                                        <SelectItem value="reseller">Revendedor</SelectItem>
                                                        <SelectItem value="support">Soporte</SelectItem>
                                                        <SelectItem value="admin">Admin</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Badge className={ROLE_COLORS[profile.role]}>
                                                    <Icon size={14} className="mr-1" />
                                                    {ROLE_LABELS[profile.role]}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-content-muted font-mono text-sm">
                                            {profile.reseller_slug || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {profile.is_premium ? (
                                                <Badge className="bg-warning/10 text-warning border-warning/20">
                                                    Premium
                                                </Badge>
                                            ) : (
                                                <span className="text-content-muted text-sm">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-content-heading font-medium">
                                            {profile.points}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {isEditing ? (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleRoleChange(profile.id, editingRole)}
                                                            className="h-8 w-8 p-0 text-success hover:bg-success/10"
                                                        >
                                                            <Check size={16} />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => setEditingId(null)}
                                                            className="h-8 w-8 p-0 text-error hover:bg-error/10"
                                                        >
                                                            <X size={16} />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setEditingId(profile.id);
                                                            setEditingRole(profile.role);
                                                        }}
                                                    >
                                                        Editar Rol
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
