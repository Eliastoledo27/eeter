import { redirect } from 'next/navigation';

export default async function LegacyResellerRedirect({ params }: { params: { reseller_slug: string } }) {
    const reserved = ['privacy', 'about', 'support', 'catalog', 'api', 'login', 'register', 'dashboard', 'authenticity', 'shipping', 'returns', 'size-guide'];

    if (reserved.includes(params.reseller_slug)) {
        // Let Next.js handle it or show not found if it somehow got here
        return null;
    }

    // Redirect all top-level reseller requests to the new /c/ prefix for consistency and better routing
    redirect(`/c/${params.reseller_slug}`);
}
