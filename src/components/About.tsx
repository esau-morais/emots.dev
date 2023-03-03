'use client'

import { currentAge } from '@/utils/date'

const About = () => {
  return (
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
  )
}

export default About
