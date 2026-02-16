'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { DashboardWelcome } from '@/components/dashboard/DashboardWelcome';

function DashboardContent() {
    return (
        <div className="animate-in fade-in duration-700 pb-20">
            <DashboardWelcome />
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="p-8"><Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" /></div>}>
            <DashboardContent />
        </Suspense>
    );
}
