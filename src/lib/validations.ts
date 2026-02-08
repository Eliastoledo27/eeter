import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe ser detallada"),
  category: z.string().min(1, "Selecciona una categoría"),
  basePrice: z.coerce.number().min(0.01, "El precio debe ser mayor a 0"),
  images: z.string().url("URL de imagen inválida").optional().or(z.literal('')),
  // We'll handle stock as a simplified single number for the form or JSON editor
  totalStock: z.coerce.number().min(0, "El stock no puede ser negativo").default(0),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});
