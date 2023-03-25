export const getPageMetadata = (page: any) => ({
  id: page.id,
  cover: page.properties.Cover.files[0]?.file.url,
  title: page.properties.Title.title[0].plain_text,
  slug: page.properties.Slug.rich_text[0].plain_text,
  type: page.properties.Type.select.name,
  createdAt: page.created_time,
  editedAt: page.last_edited_time,
})
