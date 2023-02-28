'use client'

import { toast } from 'react-hot-toast'

import { cn } from '@/utils/classNames'

const Error = ({ error }: { error: Error }) => {
  console.error({ error })

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
    <div className="col-span-6 flex flex-col items-center justify-center space-y-2">
      <p>Something went wrong. If the error persists, contact me.</p>
      <button
        className={cn(
          'relative overflow-hidden rounded-md  bg-rosewater/90 p-2 text-black backdrop-blur-md',
          'transition-all duration-500 hover:scale-95 active:scale-100'
        )}
        onClick={handleCopy}
      >
        Copy E-mail address
      </button>
    </div>
  )
}

export default Error
