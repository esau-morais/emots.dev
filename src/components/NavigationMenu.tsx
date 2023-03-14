'use client'

import React from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/utils/classNames'
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu'
import { IconChevronDown } from '@tabler/icons-react'

const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn('fixed bottom-4 flex w-full justify-center', className)}
    {...props}
  />
))
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName

const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn(
      'group flex items-center justify-center space-x-4 rounded-full border border-neutral-200/10 bg-[#161616]/80 py-1 px-2 font-semibold text-white backdrop-blur-md focus:outline-none',
      className
    )}
    {...props}
  >
    {children}
  </NavigationMenuPrimitive.List>
))
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName

const NavigationMenuItem = NavigationMenuPrimitive.Item

const defaultItemStyle =
  'hover:bg-neutral-800 inline-flex items-center justify-center rounded-3xl text-sm font-medium transition-colors focus:outline-none focus:bg-neutral-800 disabled:opacity-50 disabled:pointer-events-none bg-transparent data-[active=true]:bg-neutral-800 h-10 py-2 px-4 group w-max'

const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(defaultItemStyle, 'group', className)}
    {...props}
  >
    {children}{' '}
    <IconChevronDown
      className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
))
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName

const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      'data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=to-start]:slide-out-to-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=from-end]:slide-in-from-right-52 top-0 left-0 w-full md:absolute md:w-auto ',
      className
    )}
    {...props}
  />
))
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName

const NavigationMenuLink = NavigationMenuPrimitive.Link

export const BottomBar = () => {
  const pathname = usePathname()
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem
          className={defaultItemStyle}
          data-active={pathname === '/'}
        >
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink>Main</NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem
          className={defaultItemStyle}
          data-active={pathname === '/works'}
        >
          <Link href="/works" legacyBehavior passHref>
            <NavigationMenuLink>Works</NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
