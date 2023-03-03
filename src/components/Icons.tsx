'use client'

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
  IconBrandTypescript,
  type TablerIconsProps,
} from '@tabler/icons-react'

const defaultIconStyling: TablerIconsProps = {
  width: 32,
  height: 32,
  strokeWidth: 1.5,
}

export const Icons = () => {
  return (
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
  )
}
