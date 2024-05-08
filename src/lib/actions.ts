'use server'

import { env } from '@/lib/env'
import nodemailer from 'nodemailer'
const { SMTP_EMAIL, SMTP_PASS } = env
import type { z } from 'zod'

import { contactSchema } from './validation'

type Error = z.typeToFlattenedError<
  z.infer<typeof contactSchema>
>['fieldErrors']

type State = { error: Error } | { error: null }

export const sendMessage = async (_: State | undefined, formData: FormData) => {
  const validatedFields = contactSchema.safeParse({
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  })
  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    }
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: SMTP_EMAIL,
      pass: SMTP_PASS,
    },
  })

  const res = await transporter.sendMail({
    from: validatedFields.data.email,
    to: SMTP_EMAIL,
    subject: validatedFields.data.subject,
    html: `<p>You have a new message</p><br>
        <hr />
        <p><strong>E-mail: </strong> ${validatedFields.data.email}</p><br>
        <p><strong>Mensagem: </strong> ${validatedFields.data.subject}</p><br>
      `,
  })

  if (res.response) return { error: null }
}
