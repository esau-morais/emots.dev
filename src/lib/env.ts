import { z } from 'zod'

const schema = z.object({
  // nodemailer
  SMTP_EMAIL: z.string(),
  SMTP_PASS: z.string(),
  // notion
  NOTION_KEY: z.string().regex(/^secret_[a-zA-Z0-9]{43}$/),
  DATABASE_ID: z.string().regex(/^([0-9a-fA-F]{32})$/),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  console.error(
    '❌ Invalid environment variables: ',
    JSON.stringify(parsed.error.format(), null, 4)
  )
  process.exit(1)
}

export const env = parsed.data
