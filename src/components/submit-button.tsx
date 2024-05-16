'use client'

import { useFormStatus } from 'react-dom'

import { IconLoader2 } from '@tabler/icons-react'

export const SubmitButton = () => {
  // FIXME: pending is probably not working because of onSubmit
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      className={
        'relative block w-full self-center bg-green p-2 text-black transition-all duration-500 hover:scale-95 active:scale-100 disabled:cursor-not-allowed disabled:bg-opacity-50 md:w-[300px] md:self-start'
      }
      disabled={pending}
    >
      {!pending ? (
        <span>Send</span>
      ) : (
        <div role="status" className="absolute left-1/2 -translate-x-1/2">
          <IconLoader2 aria-hidden className="animate-spin" color="white" />
          <span className="sr-only">Submitting...</span>
        </div>
      )}
    </button>
  )
}
