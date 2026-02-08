'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Product, CatalogFilter } from '@/types';
import { SupabaseProductRepository } from '@/infrastructure/repositories/SupabaseProductRepository';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase';

export function useCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Dependency Injection (Manual for now)
  const repository = useMemo(() => new SupabaseProductRepository(), []);
  const supabase = useMemo(() => createClient(), []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await repository.findAll();
      setProducts(data);
    } catch {
      // console.error('Error fetching products:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    setIsMounted(true);
    refresh();

    // Real-time subscription
    // Note: This is leaky abstraction (Supabase specific), ideally should be in Repository too
    const channel = supabase
      .channel('catalog_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'productos' },
        () => {
          refresh();
        })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh, supabase]);

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // console.log('Attempting to create product:', product); // Removed log
      await repository.create(product);
      toast.success('Producto agregado correctamente');
      refresh();
    } catch (error: unknown) {
      console.error('Error adding product:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('row-level security')) {
        toast.error('Error de Permisos: No tienes permiso para crear productos.', {
          description: 'Ejecuta el script SQL de "SETUP.md" en Supabase para habilitar la escritura.',
          duration: 10000
        });
      } else {
        toast.error(`Error al crear producto: ${errorMessage}`);
      }
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      await repository.update(product.id, product);
      toast.success('Producto actualizado correctamente');
      refresh();
    } catch (error: unknown) {
      // console.error('Error updating product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Error al actualizar: ${errorMessage}`);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await repository.delete(id);
      toast.success('Producto eliminado');
      refresh();
    } catch (error: unknown) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar producto');
    }
  };

  const filterProducts = (filters: CatalogFilter) => {
    if (!isMounted) return [];

    return products.filter(p => {
      const matchesQuery = p.name.toLowerCase().includes(filters.query.toLowerCase());
      const matchesCategory = filters.category === 'Todos' || !filters.category || p.category === filters.category;
      return matchesQuery && matchesCategory;
    });
  };

  const categories = useMemo(() => {
    if (!isMounted) return ['Todos'];
    const unique = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
    return ['Todos', ...unique];
  }, [products, isMounted]);

  return {
    products: isMounted ? products : [],
    loading: loading || !isMounted,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    filterProducts,
    refresh
  };
}
