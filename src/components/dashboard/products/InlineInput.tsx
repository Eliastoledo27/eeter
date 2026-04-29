'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Check, X, Loader2 } from 'lucide-react';

interface InlineInputProps {
    value: string | number;
    onSave: (value: string) => Promise<void>;
    type?: 'text' | 'number';
    className?: string;
    prefix?: string;
}

export function InlineInput({ value, onSave, type = 'text', className, prefix }: InlineInputProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value.toString());
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setCurrentValue(value.toString());
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleSave = async () => {
        if (currentValue === value.toString()) {
            setIsEditing(false);
            return;
        }

        setIsLoading(true);
        try {
            await onSave(currentValue);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save inline edit:', error);
            setCurrentValue(value.toString()); // Revert on error
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') {
            setCurrentValue(value.toString());
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            <div className="relative flex items-center min-w-[100px]">
                {prefix && <span className="absolute left-3 text-[10px] text-[#00E5FF] font-black pointer-events-none">{prefix}</span>}
                <input
                    ref={inputRef}
                    type={type}
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSave}
                    className={cn(
                        "w-full bg-white/[0.05] border border-[#00E5FF]/40 text-white font-black text-sm rounded-xl py-2 transition-all outline-none shadow-[0_0_15px_rgba(0,229,255,0.1)]",
                        prefix ? "pl-7" : "px-3",
                        className
                    )}
                    disabled={isLoading}
                />
                <div className="absolute right-2 flex gap-1">
                    {isLoading ? (
                        <Loader2 size={12} className="animate-spin text-[#00E5FF]" />
                    ) : (
                        <>
                            <Check size={12} className="text-emerald-400" />
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div 
            onClick={() => setIsEditing(true)}
            className={cn(
                "cursor-pointer hover:text-[#00E5FF] transition-colors flex items-center gap-1 group",
                className
            )}
        >
            {prefix && <span className="text-xs text-[#00E5FF] opacity-50">{prefix}</span>}
            <span>{value}</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                 <Check size={10} className="text-white/20" />
            </span>
        </div>
    );
}
