'use client'

import { useFormStatus } from 'react-dom'

export const SubmitButton = () => {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      className={
        'relative block w-full self-center overflow-hidden bg-green p-2 text-black transition-all duration-500 hover:scale-95 active:scale-100 disabled:cursor-not-allowed disabled:opacity-70 md:w-[300px] md:self-start'
      }
      disabled={pending}
    >
      Send
    </button>
  )
}
