import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    // nodemailer
    SMTP_EMAIL: z.string(),
    SMTP_PASS: z.string(),
    // notion
    NOTION_KEY: z.string().regex(/^secret_[a-zA-Z0-9]{43}$/),
    DATABASE_ID: z.string().regex(/^([0-9a-fA-F]{32})$/),
    // captcha
    SECRET_KEY: z.string(),
  },
  client: {
    // captcha
    NEXT_PUBLIC_SITE_KEY: z.string(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_SITE_KEY: process.env.NEXT_PUBLIC_SITE_KEY,
  },
})
