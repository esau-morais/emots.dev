export type WorkMetadata = {
  id: string
  cover: string
  title: string
  slug: string
  type: 'Project' | 'Design'
  createdAt: Date | string
  editedAt: Date | string
}

export type Work = {
  metadata: WorkMetadata
  markdown: string
}
