import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'

import Script from 'next/script'

import { env } from '../env'
import type { TurnstileServerValidationResponse } from '../types/turnstile'

export const useTurnstileCaptcha = () => {
  const [token, setToken] = useState<string>()

  const widgetId = useRef<string | undefined | null>()
  const containerRef = useRef<HTMLDivElement>(null)

  const content = useMemo(
    () => (
      <>
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback"
          strategy="lazyOnload"
          defer
          async
        />
        <div ref={containerRef} id="cpt-trnstl-container" />
      </>
    ),
    []
  )

  const initializeCaptcha = () => {
    if (!window.turnstile?.render || !containerRef.current) {
      console.warn('Turnstile has not been loaded or container not found')
      return
    }

    const id = window.turnstile.render(containerRef.current, {
      sitekey: env.NEXT_PUBLIC_SITE_KEY,
      callback: (token) => setToken(token),
    })

    return id
  }

  useEffect(() => {
    if (window) {
      // @ts-expect-error implicit any
      window.onloadTurnstileCallback = initializeCaptcha
    }

    return () => {
      // @ts-expect-error implicit any
      delete window[onloadTurnstileCallback]
    }
  }, [])

  useEffect(() => {
    initializeCaptcha()
  }, [content])

  const resetWidget = useCallback(() => {
    if (!window.turnstile?.reset || !widgetId.current) {
      console.warn('Turnstile has not been loaded')
      return
    }

    window.turnstile.reset(widgetId.current)
  }, [widgetId])

  const validateCaptcha = useCallback(async () => {
    try {
      const res = await fetch('/api/turnstile', {
        method: 'POST',
        body: JSON.stringify({
          token,
        }),
        headers: {
          'content-type': 'application/json',
        },
      })
      const data = (await res.json()) as TurnstileServerValidationResponse

      return data
    } catch (error) {
      toast.error('could not send message')
    }
  }, [token])

  return { content, token, validateCaptcha, resetWidget }
}
