import type { TurnstileServerValidationResponse } from '@marsidev/react-turnstile'
import { z } from 'zod'

import { env } from './env'

export const contactSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Please enter your email' })
    .email({ message: 'Please provide a valid email' })
    .trim(),
  subject: z.string().min(1, { message: 'Please enter a subject' }).trim(),
  message: z.string().min(1, { message: 'Please enter a message' }).trim(),
  'cf-turnstile-response': z.custom().refine(
    async (val) => {
      if (!val) return

      const res = await fetch(`${env.NEXT_PUBLIC_URL}/api/turnstile`, {
        method: 'POST',
        body: JSON.stringify({
          token: val,
        }),
        headers: {
          'content-type': 'application/json',
        },
      })
      const data = (await res.json()) as TurnstileServerValidationResponse

      return data.success
    },
    {
      message: 'solve the challenge to send a message',
    }
  ),
})

export type ContactValues = z.infer<typeof contactSchema>
