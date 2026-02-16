'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2, Save, X, Package } from "lucide-react"
import type { InventoryItem } from '@/app/actions/inventory-actions'
import { updateProductNames } from '@/app/actions/inventory-actions' // Ensure this action is exported
import { cn } from "@/lib/utils"

interface BulkEditNamesModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    products: InventoryItem[]
    onSuccess: () => void
}

export function BulkEditNamesModal({ isOpen, onOpenChange, products, onSuccess }: BulkEditNamesModalProps) {
    const [loading, setLoading] = useState(false)
    const [editedNames, setEditedNames] = useState<Record<string, string>>({})

    const handleNameChange = (id: string, value: string) => {
        setEditedNames(prev => ({ ...prev, [id]: value }))
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            const updates = Object.entries(editedNames).map(([id, name]) => ({ id, name }))

            // Only send updates for products that actually changed (optional optimization)
            const changes = updates.filter(update => {
                const original = products.find(p => p.id === update.id)
                return original && original.name !== update.name
            })

            if (changes.length === 0) {
                toast.info("No hay cambios para guardar")
                setLoading(false)
                return
            }

            const result = await updateProductNames(changes)

            if (result.error) {
                toast.error("Error al actualizar nombres", { description: result.error })
            } else {
                toast.success(`${changes.length} productos actualizados correctamente`)
                setEditedNames({})
                onSuccess()
                onOpenChange(false)
            }
        } catch (error) {
            toast.error("Error inesperado")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setEditedNames({})
        onOpenChange(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col bg-stone-950/95 border-stone-800 text-stone-200">
                <DialogHeader className="px-1">
                    <DialogTitle className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Edición Masiva de Nombres
                    </DialogTitle>
                    <DialogDescription className="text-stone-400">
                        Edita los nombres de los productos rápidamente. Los cambios se aplicarán al guardar.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2 -mr-2 py-4 space-y-2 min-h-0">
                    {products.length === 0 ? (
                        <div className="text-center py-10 text-stone-500">
                            No hay productos disponibles.
                        </div>
                    ) : (
                        products.map((product) => (
                            <div
                                key={product.id}
                                className={cn(
                                    "flex items-center gap-4 p-3 rounded-xl border transition-all duration-200",
                                    editedNames[product.id] !== undefined && editedNames[product.id] !== product.name
                                        ? "bg-emerald-950/20 border-emerald-500/30 shadow-[0_0_15px_-5px_rgba(16,185,129,0.2)]"
                                        : "bg-stone-900/50 border-stone-800 hover:border-stone-700"
                                )}
                            >
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-900 border border-stone-800 flex-shrink-0 relative group">
                                    {product.images?.[0] ? (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-stone-700">
                                            <Package className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-[10px] uppercase tracking-wider font-mono text-stone-500">
                                            {product.id.slice(0, 8)}...
                                        </span>
                                        <span className={cn(
                                            "text-[10px] font-medium px-1.5 py-0.5 rounded border",
                                            product.is_active
                                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                : "bg-red-500/10 text-red-500 border-red-500/20"
                                        )}>
                                            {product.is_active ? 'ACTIVO' : 'INACTIVO'}
                                        </span>
                                    </div>
                                    <Input
                                        value={editedNames[product.id] !== undefined ? editedNames[product.id] : product.name}
                                        onChange={(e) => handleNameChange(product.id, e.target.value)}
                                        className="h-9 w-full bg-stone-950 border-stone-800 text-stone-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 placeholder:text-stone-700 font-medium"
                                        placeholder="Nombre del producto"
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <DialogFooter className="pt-4 border-t border-stone-800 flex items-center justify-between sm:justify-between w-full">
                    <div className="text-xs text-stone-500 font-mono">
                        {Object.keys(editedNames).length} cambios pendientes
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={handleClose} disabled={loading} className="hover:bg-stone-800 text-stone-400 hover:text-stone-200">
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={loading}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Guardar Cambios
                                </>
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
