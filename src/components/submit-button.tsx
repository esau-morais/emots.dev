'use client'

import { useFormStatus } from 'react-dom'

export const SubmitButton = () => {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      className={
        'relative block overflow-hidden bg-green p-2 text-black transition-all duration-500 hover:scale-95 active:scale-100 disabled:cursor-not-allowed disabled:opacity-70 md:w-1/2'
      }
      disabled={pending}
    >
      Send
    </button>
  )
}
