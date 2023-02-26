import Link from 'next/link'

import { Bio } from '@/components/Bio'
import { ContactForm } from '@/components/ContactForm'
import { CardHoverEffect } from '@/components/HoverCard'
import { cn } from '@/utils/classNames'
import { currentAge } from '@/utils/date'
import {
  IconBrandCss3,
  IconBrandDocker,
  IconBrandGit,
  IconBrandGraphql,
  IconBrandHtml5,
  IconBrandJavascript,
  IconBrandMysql,
  IconBrandNextjs,
  IconBrandPrisma,
  IconBrandReact,
  IconBrandTailwind,
  IconBrandTwitter,
  IconBrandTypescript,
  TablerIconsProps,
} from '@tabler/icons-react'

const defaultIconStyling: TablerIconsProps = {
  width: 32,
  height: 32,
  strokeWidth: 1.5,
}

const Home = () => {
  return (
    <>
      <Bio />

      <CardHoverEffect className="col-span-2 h-full">
        <Link
          href="https://twitter.com/alistaiir"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'flex h-full items-center justify-center rounded-2xl bg-sky/90 text-4xl text-white backdrop-blur-md'
          )}
        >
          <span className="sr-only">Twitter</span>
          <span className="transform-gpu transition group-hover:-rotate-[10deg] group-hover:scale-[1.3]">
            <IconBrandTwitter width={48} height={48} strokeWidth={1} />
          </span>
        </Link>
      </CardHoverEffect>

      <div className="col-span-3 flex flex-col items-start justify-center space-y-2 rounded-2xl bg-blue/90 p-6 backdrop-blur-md md:col-span-2">
        <h2 className="font-title text-lg font-bold">Tech Stack</h2>
        <div className="grid w-full grid-cols-4 grid-rows-4 gap-4 [&>svg]:w-full [&>svg]:text-center">
          <IconBrandHtml5 {...defaultIconStyling} />
          <IconBrandCss3 {...defaultIconStyling} />
          <IconBrandJavascript {...defaultIconStyling} />
          <IconBrandTypescript {...defaultIconStyling} />
          <IconBrandReact {...defaultIconStyling} />
          <IconBrandNextjs {...defaultIconStyling} />
          <IconBrandTailwind {...defaultIconStyling} />
          <IconBrandMysql {...defaultIconStyling} />
          <IconBrandGraphql {...defaultIconStyling} />
          <IconBrandDocker {...defaultIconStyling} />
          <IconBrandPrisma {...defaultIconStyling} />
          <IconBrandGit {...defaultIconStyling} />
        </div>
      </div>

      <div className="col-span-6 space-y-2 rounded-2xl bg-rosewater/90 p-6 text-black backdrop-blur-md md:col-span-4">
        <h2 className="font-title text-lg font-bold">Welcome to my world</h2>

        <p>
          I’m Esaú [ee-saw]. I am {currentAge} years-old and I currently live at
          Brazil. I&apos;ve been decrypting and learning more about the web
          development world since 2020.
        </p>

        <p>
          Beyond this world, I&apos;m a musician since I was young and enjoy my
          free-time watching live streams, working out (muay thai and gym), and
          more
        </p>
      </div>

      <div className="col-span-6 space-y-4 rounded-2xl bg-green/90 p-6 text-black backdrop-blur-md">
        <ContactForm />
      </div>
    </>
  )
}

export default Home
