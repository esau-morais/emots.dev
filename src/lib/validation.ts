import { z } from 'zod'

export const contactSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Please enter your email' })
    .email({ message: 'Please provide a valid email' })
    .trim(),
  subject: z.string().min(1, { message: 'Please enter a subject' }).trim(),
  message: z.string().min(1, { message: 'Please enter a message' }).trim(),
})

export type ContactValues = z.infer<typeof contactSchema>
