'use client'

import { toast, Toaster } from 'react-hot-toast'

import { useMediaQuery } from '@/hooks/mediaQuery'
import { cn } from '@/utils/classNames'

const Error = ({ error }: { error: Error }) => {
  const isMobile = useMediaQuery('(max-width: 768px)')
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
    <div className="col-span-6 flex min-h-screen flex-col items-center justify-center space-y-2">
      <p>Something went wrong. If the error persists, contact me.</p>
      <button
        type="button"
        className={cn(
          'relative overflow-hidden rounded-md  bg-rosewater/90 p-2 text-black backdrop-blur-md',
          'transition-all duration-500 hover:scale-95 active:scale-100'
        )}
        onClick={handleCopy}
      >
        Copy E-mail address
      </button>

      <Toaster position={!isMobile ? 'top-right' : 'top-center'} />
    </div>
  )
}

export default Error
