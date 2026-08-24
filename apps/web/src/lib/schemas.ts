import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(8, 'Minimo 8 caratteri'),
});

export const registerSchema = z.object({
  firstName: z.string().min(1, 'Obbligatorio'),
  lastName: z.string().min(1, 'Obbligatorio'),
  email: z.string().email('Email non valida'),
  password: z.string().min(8, 'Minimo 8 caratteri'),
  organizationName: z.string().min(2, 'Minimo 2 caratteri'),
});

export const customerSchema = z.object({
  name: z.string().min(1, 'Nome obbligatorio'),
});

export const contactSchema = z.object({
  name: z.string().min(1, 'Nome obbligatorio'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  role: z.string().optional(),
});
