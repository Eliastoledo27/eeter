'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SortableWidgetProps {
    id: string;
    children: React.ReactNode;
    colSpan?: string; // Tailwind class e.g. "col-span-12"
}

export function SortableWidget({ id, children, colSpan = 'col-span-12' }: SortableWidgetProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`${colSpan} relative group/widget`}
        >
            {/* Drag Handle - Only visible on hover */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-2 right-2 p-1 bg-black/60 backdrop-blur rounded opacity-0 group-hover/widget:opacity-100 hover:bg-primary/20 cursor-grab active:cursor-grabbing transition-all z-20 text-gray-400 hover:text-white"
            >
                <GripVertical size={16} />
            </div>
            {children}
        </div>
    );
}
