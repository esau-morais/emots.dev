export type WorkMetadata = {
  id: string
  cover: string
  title: string
  slug: string
}

export type Work = {
  metadata: WorkMetadata
  markdown: string
}
