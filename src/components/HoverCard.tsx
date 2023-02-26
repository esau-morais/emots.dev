import type { PropsWithChildren } from 'react'

import { cn } from '@/utils/classNames'

export const hoverClassName =
  'transform-gpu transition-all duration-500 will-change-[outline,_transform] group-hover:scale-95 active:scale-100'

export const CardHoverEffect = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => {
  return <div className={cn('group', className)}>{children}</div>
}
