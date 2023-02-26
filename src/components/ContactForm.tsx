'use client'

import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { contactSchema, ContactValues } from '@/lib/validation'
import { cn } from '@/utils/classNames'
import { zodResolver } from '@hookform/resolvers/zod'

export const ContactForm = () => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
  })

  const sendMessage = async (values: ContactValues) => {
    const promise = fetch('/api/contact', {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
      method: 'POST',
    })

    await toast.promise(promise, {
      success: 'Messsage sent!',
      loading: 'Contacting Esaú...',
      error: (error: Error) => error?.message ?? 'Something went wrong...',
    })
  }
  return (
    <>
      <div className="space-y-1">
        <h2 className="font-title text-lg font-bold">Get in touch</h2>
        <p>
          Feel free to reach out and provide feedback, hire me or even just give
          a friendly hello
        </p>
      </div>

      <form
        onSubmit={handleSubmit(sendMessage)}
        className="flex flex-col space-y-4"
      >
        <fieldset>
          <legend>E-mail</legend>
          <input
            type="email"
            id="email"
            placeholder="contact@emots.dev"
            className="w-full rounded-md p-2"
            {...register('email')}
          />

          <small className="text-red-500 mt-2 text-sm">
            {errors.email?.message}
          </small>
        </fieldset>

        <fieldset>
          <legend>Subject</legend>
          <input
            type="subject"
            id="subject"
            placeholder="Describe what you wanna talk about in few words"
            className="w-full rounded-md p-2"
            {...register('subject')}
          />

          <small className="text-red-500 mt-2 text-sm">
            {errors.subject?.message}
          </small>
        </fieldset>

        <fieldset>
          <legend>Body</legend>
          <textarea
            id="message"
            rows={5}
            placeholder="Give more details about the given subject here..."
            className="w-full resize-y rounded-md p-2"
            {...register('message')}
          />

          <small className="text-red-500 mt-2 text-sm">
            {errors.message?.message}
          </small>
        </fieldset>

        <button
          type="submit"
          className={cn(
            'relative w-1/2 self-end overflow-hidden rounded-md bg-black p-2 text-white',
            'transform-gpu transition-all duration-500 will-change-[outline,_transform] hover:scale-95 active:scale-100'
          )}
        >
          Send
        </button>
      </form>
    </>
  )
}
