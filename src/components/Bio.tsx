'use client'

import { useState } from 'react'

import Image from 'next/image'

import { cn } from '@/utils/classNames'
import { currentAge } from '@/utils/date'
import { shimmer, toBase64 } from '@/utils/shimmer'
import { IconPlayerPlay, IconPlayerPause } from '@tabler/icons-react'

export const Bio = () => {
  const [isCursorAnimated, setIsCursorAnimated] = useState(true)

  return (
    <div className="p-200 col-span-4 flex items-center justify-center overflow-hidden rounded-2xl border border-neutral-200/10 bg-[#1A1A1A]/90 backdrop-blur-md md:col-span-4 md:h-52">
      <div className="flex flex-col items-center space-y-4 py-8 px-6 md:flex-row md:space-y-0 md:space-x-4">
        <div className=" relative aspect-square h-24 w-24">
          <Image
            src="/me.jpg"
            className="border-pink-500 rounded-full border object-cover grayscale"
            alt="Myself standing in front of the camera with a silly smile and messy hair"
            fill
            placeholder="blur"
            blurDataURL={`data:image/svg+xml;base64,${toBase64(
              shimmer(96, 96)
            )}`}
          />
        </div>

        <div className="relative space-y-1">
          <h1 className="font-title text-center text-xl font-bold tracking-tighter text-white md:text-left">
            Esaú Morais
          </h1>

          <pre className="relative whitespace-pre-wrap text-left text-neutral-200">
            <code>
              {JSON.stringify(
                { age: currentAge, role: 'Full-Stack Web Developer' },
                null,
                2
              )}
            </code>
            <span
              className={cn(
                'absolute bottom-[3px] ml-1 inline-block h-4 w-1  bg-white',
                isCursorAnimated && 'animate-cursor'
              )}
            />
          </pre>

          <button
            aria-label={
              !isCursorAnimated
                ? 'Play cursor animation'
                : 'Stop cursor animation'
            }
            className="absolute right-0 bottom-0"
            type="button"
            onClick={() => setIsCursorAnimated((prev) => !prev)}
          >
            {!isCursorAnimated ? <IconPlayerPlay /> : <IconPlayerPause />}
          </button>
        </div>
      </div>
    </div>
  )
}
