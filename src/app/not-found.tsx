import Link from 'next/link'

import { cn } from '@/utils/classNames'

const NotFound = () => {
  return (
    <div className="col-span-6 flex min-h-screen flex-col items-center justify-center space-y-2">
      <p>Not Found</p>
      <Link
        className={cn(
          'relative overflow-hidden rounded-md  bg-rosewater/90 p-2 text-black backdrop-blur-md',
          'transition-all duration-500 hover:scale-95 active:scale-100'
        )}
        href="/"
      >
        Go home
      </Link>
    </div>
  )
}

export default NotFound
