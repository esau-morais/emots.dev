import { currentAge } from '@/utils/date'
import { IconArrowUpRight } from '@tabler/icons-react'
import Link from 'next/link'

const Home = () => {
  return (
    <div className="mx-auto max-w-3xl [counter-reset:about]">
      <div className="mb-6 pl-4 text-center text-overlay0 md:text-left">
        <h1 className="text-xl font-bold tracking-tighter text-rosewater">
          Esaú Morais
        </h1>

        <p className="text-text">
          {currentAge} y/o Front-End Engineer @ Atomos
        </p>
      </div>

      <pre
        className="whitespace-normal border-l-2 border-transparent p-4 text-overlay0 transition-colors before:pr-4 before:![content:counter(about)] before:![counter-increment:about] hover:bg-[#11111b] focus:border-[#f5e0dc] focus:bg-[#11111b] focus:outline-none"
        tabIndex={0}
      >
        # Hello, there! I&apos;m Esaú [ee-saw]. I currently live in Brazil and
        I&apos;ve been learning more about web development since 2020 and my
        passion relies on building what people want. Besides that, I&apos;m a
        freshman studying Software Engineering.
      </pre>

      <pre
        className="whitespace-normal border-l-2 border-transparent p-4 text-overlay0 transition-colors before:pr-4 before:![content:counter(about)] before:![counter-increment:about] hover:bg-[#11111b] focus:border-[#f5e0dc] focus:bg-[#11111b] focus:outline-none"
        tabIndex={0}
      >
        # Beyond this, I&apos;m a musician since I was young and enjoy my
        free-time watching live streams/k-dramas, working out, and more
      </pre>

      <pre
        className="group w-full whitespace-normal border-l-2 border-transparent p-4 text-overlay0 transition-colors before:pr-4 before:![content:counter(about)] before:![counter-increment:about] hover:bg-[#11111b] focus:border-[#f5e0dc] focus:bg-[#11111b] focus:outline-none"
        tabIndex={0}
      >
        <span># Checkout my </span>
        <Link
          className="inline-flex items-center space-x-0.5 underline underline-offset-2"
          href="/work"
        >
          <span>Work</span>
          <IconArrowUpRight
            className="invisible group-hover:visible"
            size={20}
          />
        </Link>
      </pre>
    </div>
  )
}

export default Home
