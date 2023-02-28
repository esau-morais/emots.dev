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
    reset,
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
  })

  const sendMessage = async (values: ContactValues) => {
    const res = await fetch('/api/contact', {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
      method: 'POST',
    })

    const data = (await res.json()) as { error: Error }
    if (!data.error) reset()
  }

  const onSubmit = async (values: ContactValues) => {
    await toast.promise(sendMessage(values), {
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
        onSubmit={handleSubmit(onSubmit)}
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

          <small className="mt-2 text-sm text-[#850000]">
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

          <small className="mt-2 text-sm text-[#850000]">
            {errors.subject?.message}
          </small>
        </fieldset>

        <fieldset>
          <legend>Message</legend>
          <textarea
            id="message"
            rows={5}
            placeholder="Give more details about the given subject here..."
            className="max-h-[50vh] min-h-[20vh] w-full resize-y rounded-md p-2"
            {...register('message')}
          />

          <small className="mt-2 text-sm text-[#850000]">
            {errors.message?.message}
          </small>
        </fieldset>

        <button
          type="submit"
          className={cn(
            'relative block overflow-hidden rounded-md bg-black p-2 text-white md:w-1/2 md:self-end',
            'transition-all duration-500 hover:scale-95 active:scale-100'
          )}
        >
          Send
        </button>
      </form>
    </>
  )
}
