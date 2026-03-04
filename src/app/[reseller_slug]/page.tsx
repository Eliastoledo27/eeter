import { redirect, notFound } from 'next/navigation';

export default async function LegacyResellerRedirect({ params }: { params: { reseller_slug: string } }) {
    const reserved = [
        'privacy', 'about', 'support', 'catalog', 'login', 'register',
        'dashboard', 'authenticity', 'shipping', 'returns', 'size-guide',
        'checkout', 'cart', 'collection', 'press', 'careers',
        'sustainability', 'order-confirmation', 'gift-cards', 'logout',
        'resellers', 'api', 'admin', 'profile'
    ];

    if (reserved.includes(params.reseller_slug.toLowerCase())) {
        // Let Next.js handle it or show not found if it somehow got here
        return notFound();
    }

    // Redirect all top-level reseller requests to the new /c/ prefix for consistency and better routing
    redirect(`/c/${params.reseller_slug}`);
}
