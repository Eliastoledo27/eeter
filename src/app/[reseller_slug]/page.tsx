import { redirect } from 'next/navigation';

export default async function LegacyResellerRedirect({ params }: { params: { reseller_slug: string } }) {
    // Redirect all top-level reseller requests to the new /c/ prefix for consistency and better routing
    redirect(`/c/${params.reseller_slug}`);
}
