// SEO-related
export const title = 'Esaú Morais | Passionate Full-Stack Web Developer'
export const description =
  'Esaú Morais is a Full-Stack Web Developer focusing on JavaScript-based technologies, such as React.js, TypeScript, Next.js, Node.js and Remix.run'
export const ogImage = 'https://emots.dev/og_image.png'
export const url = 'https://emots.dev'

// Environment
export const BASE_URL =
  process.env.NODE_ENV !== 'development'
    ? 'https://emots.dev/'
    : process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
