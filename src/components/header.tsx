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
    <header className="sticky top-0 flex h-10 items-center justify-between border-b border-[#313244] bg-[#1e1e2e]/80 backdrop-blur-sm">
      <nav className="flex size-full divide-x">
        {NAV_ITEMS.map((item, idx) => (
          <Link
            key={idx}
            className="flex items-center border-[#313244] px-4 text-[#cdd6f4] last:!border-r hover:bg-[#11111b] focus:bg-[#11111b] focus:outline-none data-[active=true]:bg-[#11111b]"
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
