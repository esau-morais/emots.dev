import { type NextRequest, ImageResponse } from 'next/server'

import { BASE_URL } from '@/utils/consts'

export const config = {
  runtime: 'edge',
}

const font = fetch(
  new URL('../../../../public/PPTelegraf-Regular.otf', import.meta.url)
).then((res) => res.arrayBuffer())

export const GET = async (req: NextRequest) => {
  const { searchParams } = req.nextUrl
  const workTitle = searchParams.get('title')
  const fontData = await font

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
          backgroundImage: `url(${BASE_URL}/BlueLight.jpg)`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 100%',
        }}
      >
        <div
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
            fontFamily: 'PPTelegraf',
          }}
        >
          {workTitle}
        </div>
      </div>
    ),
    {
      width: 1920,
      height: 1080,
      fonts: [
        {
          name: 'PPTelegraf',
          data: fontData,
          style: 'normal',
        },
      ],
    }
  )
}
