'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy
} from '@dnd-kit/sortable';
import { SortableWidget } from './SortableWidget';
import { UserProfile } from './widgets/UserProfile';
import { LastLogin } from './widgets/LastLogin';
import { GlobalPortfolio } from './widgets/GlobalPortfolio';
import { RegionalOperations } from './widgets/RegionalOperations';
import { TacticalFeed } from './widgets/TacticalFeed';
import { QuickActions } from './widgets/QuickActions';
import { StatsWidget } from './widgets/StatsWidget';
import { ActivityTimeline } from './widgets/ActivityTimeline';
import { PerformanceWidget } from './widgets/PerformanceWidget';
import { useTranslations } from 'next-intl';
import { RotateCcw } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { hasPermission } from '@/config/roles'; // Import helper

const componentMap: Record<string, React.ComponentType> = {
    user_profile: UserProfile,
    last_login: LastLogin,
    stats: StatsWidget,
    portfolio: GlobalPortfolio,
    regional: RegionalOperations,
    tactical: TacticalFeed,
    quick: QuickActions,
    timeline: ActivityTimeline,
    performance: PerformanceWidget
};

const defaultLayout = [
    { id: 'user_profile', span: 'col-span-12 md:col-span-4 lg:col-span-3' },
    { id: 'last_login', span: 'col-span-12 md:col-span-4 lg:col-span-3' },
    { id: 'timeline', span: 'col-span-12 md:col-span-4 lg:col-span-3' },
];

const initialItems = [
    { id: 'stats', span: 'col-span-12' },
    { id: 'user_profile', span: 'col-span-12 md:col-span-4' },
    { id: 'last_login', span: 'col-span-12 md:col-span-3' },
    { id: 'timeline', span: 'col-span-12 md:col-span-5' },
    { id: 'portfolio', span: 'col-span-12 md:col-span-5' },
    { id: 'regional', span: 'col-span-12 md:col-span-7' },
    { id: 'performance', span: 'col-span-12 lg:col-span-8' },
    { id: 'tactical', span: 'col-span-12' },
    { id: 'quick', span: 'col-span-12' },
];

// Define permissions required for each widget
const WIDGET_PERMISSIONS: Record<string, string> = {
    stats: 'view_dashboard',
    user_profile: 'view_dashboard',
    last_login: 'view_dashboard',
    timeline: 'view_dashboard',
    quick: 'view_dashboard',
    portfolio: 'view_analytics', // restricted
    regional: 'view_crm',        // restricted
    performance: 'view_analytics', // restricted
    tactical: 'view_analytics',  // restricted
};

export function DashboardGrid() {
    const t = useTranslations('dashboard');
    const [items, setItems] = useState(initialItems);
    const [mounted, setMounted] = useState(false);
    const { role } = usePermissions(); // Use hook for consistency

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        setMounted(true);

        const saved = localStorage.getItem('dashboard_layout');
        let currentItems = initialItems;

        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.every(p => componentMap[p.id])) {
                    currentItems = parsed;
                }
            } catch (e) {
                console.error("Failed to load layout", e);
            }
        }

        // Filter items based on permissions
        const filteredItems = currentItems.filter(item => {
            const required = WIDGET_PERMISSIONS[item.id];
            return !required || hasPermission(role, required);
        });

        setItems(filteredItems);

    }, [role]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);
                localStorage.setItem('dashboard_layout', JSON.stringify(newItems));
                return newItems;
            });
        }
    };

    const resetLayout = () => {
        const filteredInitial = initialItems.filter(item => {
            const required = WIDGET_PERMISSIONS[item.id];
            return !required || hasPermission(role, required);
        });
        setItems(filteredInitial);
        localStorage.removeItem('dashboard_layout');
    };

    if (!mounted) return null;

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button
                    onClick={resetLayout}
                    className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors"
                >
                    <RotateCcw size={12} />
                    {t('widgets.reset')}
                </button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={items.map(i => i.id)}
                    strategy={rectSortingStrategy}
                >
                    <div className="grid grid-cols-12 gap-6 pb-20">
                        {items.map((item) => {
                            const Component = componentMap[item.id];
                            return (
                                <SortableWidget key={item.id} id={item.id} colSpan={item.span}>
                                    {Component ? <Component /> : null}
                                </SortableWidget>
                            );
                        })}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}
