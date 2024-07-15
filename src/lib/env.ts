import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    // notion
    NOTION_KEY: z.string().regex(/^secret_[a-zA-Z0-9]{43}$/),
    DATABASE_ID: z.string().regex(/^([0-9a-fA-F]{32})$/),
    // captcha
    SECRET_KEY: z.string(),
  },
  experimental__runtimeEnv: {},
})
