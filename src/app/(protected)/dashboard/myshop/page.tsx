'use client';

import { ResellerCatalogBuilder } from '@/components/reseller/ResellerCatalogBuilder';

export default function MyShopPage() {
    return (
        <div className="animate-in fade-in duration-700 pb-10">
            <ResellerCatalogBuilder isDashboard={true} />
        </div>
    );
}
