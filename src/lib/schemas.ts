import { z } from 'zod'
import { isDisposableEmail, isAllowedDomain } from '@/config/email'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export const registerSchema = z.object({
  fullName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z
    .string()
    .email('Email inválido')
    .refine((email) => !isDisposableEmail(email), {
      message: 'No se permiten correos temporales o desechables',
      path: ['email'],
    })
    .refine((email) => isAllowedDomain(email), {
      message:
        'Dominio de correo no permitido en este entorno. Usa un dominio válido (ej: gmail.com)',
      path: ['email'],
    }),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
