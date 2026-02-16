'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Globe } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const languages = [
        { code: 'es', label: 'ESP' },
        { code: 'en', label: 'ENG' },
        { code: 'pt', label: 'POR' },
        { code: 'fr', label: 'FRA' },
    ];

    const onSelectChange = (nextLocale: string) => {
        const date = new Date();
        date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
        document.cookie = `NEXT_LOCALE=${nextLocale}; expires=${date.toUTCString()}; path=/`;

        startTransition(() => {
            router.refresh();
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    disabled={isPending}
                    className="flex items-center gap-2 px-3 py-1.5 rounded border border-primary/20 bg-black/40 hover:bg-black/60 hover:border-primary/50 text-xs text-gray-400 hover:text-white transition-all font-mono tracking-wider disabled:opacity-50"
                >
                    <Globe size={14} className="text-primary" />
                    {locale.toUpperCase()}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-black/90 border border-primary/20 text-white min-w-[100px]">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => onSelectChange(lang.code)}
                        className={`text-xs font-mono tracking-wider cursor-pointer hover:bg-white/10 hover:text-primary focus:bg-white/10 focus:text-primary ${locale === lang.code ? 'text-primary' : 'text-gray-400'}`}
                    >
                        {lang.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
