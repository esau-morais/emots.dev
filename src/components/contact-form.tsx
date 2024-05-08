'use client'

import { useEffect, useRef } from 'react'
import { useFormState } from 'react-dom'
import { toast } from 'react-hot-toast'

import { sendMessage } from '@/lib/actions'

import { SubmitButton } from './submit-button'

const initialState = {
  error: {},
}

export const ContactForm = () => {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction] = useFormState(sendMessage, initialState)
  const errors = state?.error

  useEffect(() => {
    if (!errors) {
      toast.success('Messsage sent!')
      formRef.current?.reset()
    }
  }, [errors])

  return (
    <form ref={formRef} action={formAction} className="flex flex-col space-y-4">
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

      <SubmitButton />
    </form>
  )
}
