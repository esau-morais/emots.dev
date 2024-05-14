'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'
import { useCallback } from 'react'
import { useEffect, useRef } from 'react'
import { useFormState } from 'react-dom'
import { toast } from 'react-hot-toast'

import { sendMessage } from '@/lib/actions'
import { env } from '@/lib/env'
import type { TurnstileServerValidationResponse } from '@marsidev/react-turnstile'
import { Turnstile } from '@marsidev/react-turnstile'

import { SubmitButton } from './submit-button'

const initialState = {
  error: {},
}

export const ContactForm = () => {
  const [status, setStatus] = useState<
    'solved' | 'error' | 'expired' | 'loading' | null
  >()
  const [token, setToken] = useState<string>()
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction] = useFormState(sendMessage, initialState)
  const errors = state?.error

  useEffect(() => {
    if (!errors) {
      toast.success('Messsage sent!')
      formRef.current?.reset()
    }
  }, [errors])

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

  const onSubmit = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault()

    const formData = new FormData(formRef.current as HTMLFormElement)

    const captchValidated = await validateCaptcha()

    if (captchValidated?.success || status === 'solved') {
      formAction(formData)
      toast.success('message sent!')
      formRef.current?.reset()
    } else {
      toast.error('please solve the challenge to send a message')
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col space-y-4">
      <fieldset className="grid border-l-2 border-surface0 pl-4">
        <div className="flex w-full items-baseline justify-between leading-8">
          <legend>E-mail</legend>
          {errors?.email?.length ? (
            <small className="text-sm text-flamingo">{errors?.email[0]}</small>
          ) : null}
        </div>
        <div className="inline-flex items-center space-x-2">
          <span className="text-mauve">&gt;</span>
          <input
            id="email"
            name="email"
            placeholder="contact@emots.dev"
            className="w-full bg-transparent p-2"
          />
        </div>
      </fieldset>

      <fieldset className="grid border-l-2 border-surface0 pl-4">
        <div className="flex w-full items-baseline justify-between leading-8">
          <legend>Subject</legend>
          {errors?.subject?.length ? (
            <small className="text-sm text-flamingo">{errors.subject[0]}</small>
          ) : null}
        </div>
        <div className="inline-flex items-center space-x-2">
          <span className="text-mauve">&gt;</span>
          <input
            type="subject"
            id="subject"
            name="subject"
            placeholder="Describe what you wanna talk about in a few words"
            className="w-full bg-transparent p-2"
          />
        </div>
      </fieldset>

      <fieldset className="grid border-l-2 border-surface0 pl-4">
        <div className="flex w-full items-baseline justify-between leading-8">
          <legend>Message</legend>
          {errors?.message?.length ? (
            <small className="text-sm text-flamingo">{errors.message[0]}</small>
          ) : null}
        </div>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Give more details about the given subject here..."
          className="max-h-[50vh] min-h-[20vh] w-full resize-y bg-transparent py-2"
        />
      </fieldset>

      <Turnstile
        className="!bg-base/80"
        options={{
          appearance: 'execute',
        }}
        siteKey={env.NEXT_PUBLIC_SITE_KEY}
        onError={() => setStatus('error')}
        onExpire={() => setStatus('expired')}
        onSuccess={(token) => {
          setToken(token)
          setStatus('solved')
        }}
      />

      <SubmitButton />
    </form>
  )
}
