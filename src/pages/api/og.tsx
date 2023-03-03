import type { NextRequest } from 'next/server'

import { BASE_URL } from '@/utils/consts'
import { ImageResponse } from '@vercel/og'

export const config = {
  runtime: 'edge',
}

const handler = (req: NextRequest) => {
  const { searchParams } = req.nextUrl
  const workTitle = searchParams.get('title')

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: `url(${BASE_URL}/gradient.jpg)`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 100%',
        }}
      >
        <div
          tw="font-sans"
          style={{
            marginLeft: 190,
            marginRight: 190,
            display: 'flex',
            fontSize: 130,
            letterSpacing: '-0.05em',
            fontStyle: 'normal',
            color: 'white',
            lineHeight: '120px',
            whiteSpace: 'pre-wrap',
          }}
        >
          {workTitle}
        </div>
      </div>
    ),
    {
      width: 1920,
      height: 1080,
    }
  )
}

export default handler
