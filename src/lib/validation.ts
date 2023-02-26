import { z } from 'zod'

export const contactSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'E-mail is required' })
    .email({ message: 'E-mail must be valid' })
    .trim(),
  subject: z.string().min(1, { message: 'Subject is required' }).trim(),
  message: z.string().min(1, { message: 'Message is required' }).trim(),
})

export type ContactValues = z.infer<typeof contactSchema>
