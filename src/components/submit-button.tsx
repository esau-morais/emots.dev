'use client'

import { useFormStatus } from 'react-dom'

import { IconLoader2 } from '@tabler/icons-react'

export const SubmitButton = () => {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      className={
        'relative block w-full self-center bg-green p-2 text-black transition-all duration-500 hover:scale-95 active:scale-100 disabled:cursor-not-allowed disabled:bg-opacity-50 md:w-[300px] md:self-start'
      }
      disabled={pending}
    >
      <span>Send</span>
      {pending ? (
        <div
          aria-live="polite"
          role="status"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <IconLoader2 aria-hidden className="animate-spin" color="white" />
          <span className="sr-only">Submitting...</span>
        </div>
      ) : null}
    </button>
  )
}
