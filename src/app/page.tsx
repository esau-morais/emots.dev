import About from '@/components/About'
import { Bio } from '@/components/Bio'
import { CardHoverEffect } from '@/components/Card'
import { ContactForm } from '@/components/ContactForm'
import { Container } from '@/components/Container'
import { Icons } from '@/components/Icons'
import { cn } from '@/utils/classNames'
import { IconBrandTwitter } from '@tabler/icons-react'

const Home = () => {
  return (
    <Container className="mx-auto grid max-w-3xl grid-cols-6 gap-6 px-6 pb-20 pt-16">
      <Bio />

      <CardHoverEffect className="col-span-6 h-52 md:col-span-2 md:h-full">
        <a
          href="https://twitter.com/_3morais"
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
        </a>
      </CardHoverEffect>

      <div className="col-span-6 flex flex-col items-start justify-center space-y-2 rounded-2xl bg-blue/90 p-6 backdrop-blur-md md:col-span-2">
        <h2 className="font-title text-lg font-bold">Tech Stack</h2>
        <Icons />
      </div>

      <About />

      <div className="col-span-6 space-y-4 rounded-2xl bg-green/90 p-6 text-black backdrop-blur-md">
        <ContactForm />
      </div>
    </Container>
  )
}

export default Home
