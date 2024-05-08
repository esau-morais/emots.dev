'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  {
    path: '/',
    label: 'home',
  },
  {
    path: '/work',
    label: 'work',
  },
] as const

export const Header = () => {
  const path = usePathname()

  return (
    <header className="sticky top-0 flex h-10 items-center justify-between border-b border-surface0 bg-base/80 backdrop-blur-sm">
      <nav className="flex size-full divide-x">
        {NAV_ITEMS.map((item, idx) => (
          <Link
            key={idx}
            className="flex items-center border-surface0 px-4 text-text last:!border-r hover:bg-crust focus:bg-crust focus:outline-none data-[active=true]:bg-crust"
            href={item.path}
            data-active={path === item.path}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
