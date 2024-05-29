'use client'

import { useEffect, useRef } from 'react'
import { useFormState } from 'react-dom'
import { toast } from 'react-hot-toast'

import { sendMessage } from '@/lib/actions'
import { env } from '@/lib/env'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { Turnstile } from '@marsidev/react-turnstile'

import { SubmitButton } from './submit-button'

const initialState = {
  error: {},
}

export const ContactForm = () => {
  const formRef = useRef<HTMLFormElement>(null)
  const turnstileRef = useRef<TurnstileInstance>(null)
  const [state, formAction] = useFormState(sendMessage, initialState)
  const errors = state?.error

  useEffect(() => {
    if (!errors) {
      toast.success('Messsage sent!')
      formRef.current?.reset()
    } else if (errors['cf-turnstile-response']) {
      turnstileRef.current?.reset()
    }
  }, [errors])

  return (
    <form ref={formRef} action={formAction} className="flex flex-col space-y-4">
      {errors?.['cf-turnstile-response']?.length ? (
        <div
          role="alert"
          className="flex-1 border border-flamingo p-2 text-sm text-flamingo"
          aria-live="polite"
        >
          <p>{errors['cf-turnstile-response'][0]}</p>
        </div>
      ) : null}

      <fieldset className="grid border-l-2 border-surface0 pl-4">
        <div className="flex w-full items-baseline justify-between leading-8">
          <legend id="email-field">E-mail</legend>
          {errors?.email?.length ? (
            <small
              id="email-error"
              className="text-sm text-flamingo"
              aria-live="polite"
            >
              {errors?.email[0]}
            </small>
          ) : null}
        </div>
        <div className="inline-flex items-center space-x-2">
          <span className="text-mauve">&gt;</span>
          <input
            id="email"
            name="email"
            placeholder="contact@emots.dev"
            className="w-full bg-transparent p-2"
            aria-invalid={!!errors?.email?.length}
            aria-describedby={
              errors?.email?.length ? 'email-error' : 'email-field'
            }
          />
        </div>
      </fieldset>

      <fieldset className="grid border-l-2 border-surface0 pl-4">
        <div className="flex w-full items-baseline justify-between leading-8">
          <legend id="subject-field">Subject</legend>
          {errors?.subject?.length ? (
            <small
              id="subject-error"
              className="text-sm text-flamingo"
              aria-live="polite"
            >
              {errors.subject[0]}
            </small>
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
            aria-invalid={!!errors?.subject?.length}
            aria-describedby={
              errors?.subject?.length ? 'subject-error' : 'subject-field'
            }
          />
        </div>
      </fieldset>

      <fieldset className="grid border-l-2 border-surface0 pl-4">
        <div className="flex w-full items-baseline justify-between leading-8">
          <legend id="message-field">Message</legend>
          {errors?.message?.length ? (
            <small
              id="message-error"
              className="text-sm text-flamingo"
              aria-live="polite"
            >
              {errors.message[0]}
            </small>
          ) : null}
        </div>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Give more details about the given subject here..."
          className="max-h-[50vh] min-h-[20vh] w-full resize-y bg-transparent py-2"
          aria-invalid={!!errors?.message?.length}
          aria-describedby={
            errors?.message?.length ? 'message-error' : 'message-field'
          }
        />
      </fieldset>

      <Turnstile
        ref={turnstileRef}
        className="!w-full !bg-base/80 md:!w-fit [&_iframe]:!w-full md:[&_iframe]:!w-fit"
        options={{
          appearance: 'execute',
        }}
        siteKey={env.NEXT_PUBLIC_SITE_KEY}
        onError={() => turnstileRef.current?.reset()}
        onExpire={() => turnstileRef.current?.reset()}
      />

      <SubmitButton />
    </form>
  )
}
