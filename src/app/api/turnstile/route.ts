import { env } from '@/lib/env'
import type { TurnstileServerValidationResponse } from '@marsidev/react-turnstile'
const VERIFY_ENDPOINT =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify'

const responseHeaders = {
  'content-type': 'application/json',
} satisfies HeadersInit

export const POST = async (request: Request) => {
  const body = (await request.json()) as { token: string }
  const ip = request.headers.get('CF-Connecting-IP') as string

  const formData = new FormData()

  formData.append('secret', env.SECRET_KEY)
  formData.append('response', body.token)
  formData.append('remoteip', ip)

  const data = (await fetch(VERIFY_ENDPOINT, {
    body: formData,
    method: 'POST',
  }).then((res) => res.json())) as TurnstileServerValidationResponse

  if (!data.success) {
    return new Response(JSON.stringify(data), {
      status: 400,
      headers: responseHeaders,
    })
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: responseHeaders,
  })
}
