import prisma from 'lib/prisma'
import randomColor from 'randomcolor'

export const upsertTags = async (tags: string[]) => {
  return await prisma.$transaction(async tx => {
    const existingTags = await tx.tag.findMany({
      select: { id: true, name: true },
      where: { name: { in: tags } }
    })

    const existingNames = existingTags.map(tag => tag.name)
    const existingIDs = existingTags.map(tag => tag.id)

    // 2. should only create tags that do not already exist
    const createdCount = await tx.tag.createMany({
      data: tags
        .filter(tag => !existingNames.includes(tag))
        .map(tag => ({
          name: tag,
          // 3. should give new tags random colors
          color: randomColor({ luminosity: 'light' })
        }))
    })

    const tagIds = existingTags.map(tag => tag.id)

    // 4. should find and return new tag IDs
    if (createdCount.count) {
      const createdTags = await tx.tag.findMany({
        select: { id: true },
        where: {
          name: { in: tags },
          id: { notIn: existingIDs }
        }
      })

      const createdIds = createdTags.map(tag => tag.id)
      tagIds.push(...createdIds)
    }

    // 1. should return a list of tag IDs
    // 5. should return an empty array if no tags are passed
    return tagIds
  })
}

export const deleteOrphanedTags = async (ids: number[]) => {
  return await prisma.tag.deleteMany({
    where: {
      quotes: { none: {} },
      id: { in: ids }
    }
  })
}
