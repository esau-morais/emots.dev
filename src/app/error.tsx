'use client'

import { toast } from 'react-hot-toast'

const Error = ({ error }: { error: Error }) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText('contact@emots.dev')
      toast.success('Copied!')
    } catch (err) {
      if (err instanceof Error)
        toast.error(error.message ?? 'Could not copy E-mail address')
    }
  }

  return (
    <div className="flex h-full flex-col items-center justify-center space-y-2">
      <p>Something went wrong. If the error persists, contact me.</p>
      <button
        type="button"
        className="relative overflow-hidden bg-rosewater p-2 text-black transition-all duration-500 hover:scale-95 active:scale-100"
        onClick={handleCopy}
      >
        Copy E-mail address
      </button>
    </div>
  )
}

export default Error
