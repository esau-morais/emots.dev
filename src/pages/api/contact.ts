import { NextApiRequest, NextApiResponse } from 'next'

import { env } from '@/lib/env'
import { contactSchema } from '@/lib/validation'
import nodemailer from 'nodemailer'
import { z } from 'zod'

const { SMTP_EMAIL, SMTP_PASS } = env

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, subject, message } = contactSchema.parse(req.body)

  const transporter = nodemailer.createTransport({
    host: 'smtpout.secureserver.net',
    port: 465,
    auth: {
      user: SMTP_EMAIL,
      pass: SMTP_PASS,
    },
  })

  try {
    await transporter.sendMail({
      from: email,
      to: SMTP_EMAIL,
      subject: subject,
      html: `<p>You have a new message</p><br>
        <hr />
        <p><strong>E-mail: </strong> ${email}</p><br>
        <p><strong>Mensagem: </strong> ${message}</p><br>
      `,
    })

    return res.status(200).json({ error: null })
  } catch (error) {
    if (error instanceof z.ZodError)
      return res.status(400).json({ error: error.message })

    if (error instanceof Error)
      return res.status(500).json({ error: error.message || error.toString() })
  }
}

export default handler
