import { ProfilesManager } from '@/components/dashboard/admin/ProfilesManager';

export const metadata = {
    title: 'Gestión de Perfiles | ÉTER Store',
    description: 'Administra usuarios, roles y permisos del sistema',
};

export default function ProfilesPage() {
    return <ProfilesManager />;
}
