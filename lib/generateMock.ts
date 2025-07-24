import { Book, Chapter, Entity, EntityType, EntityUsage, Project } from "./types";

export const generateMock = (
  entityCount: number = 3,
  bookCount: number = 3,
  chapterCount: number = 3
) => {
  // Generate mock entities
  const mockEntities: Entity[] = Array.from({ length: entityCount }, (_, i) => ({
    createdAt: new Date().toISOString(),
    description: `Description for Entity ${i + 1}`,
    imageIds: [],
    name: `Entity ${i + 1}`,
    notes: [
      {
        completed: false,
        content: `Important note about Entity ${i + 1}`,
        createdAt: new Date().toISOString(),
        id: `note-${i + 1}`,
        title: `Note for Entity ${i + 1}`
      }
    ],
    properties: [
      {
        id: `prop-${i + 1}-1`,
        isDefault: true,
        name: 'Age',
        value: `${20 + i * 5}`
      },
      {
        id: `prop-${i + 1}-2`,
        name: 'Occupation',
        value: `Occupation ${i + 1}`
      }
    ],
    slug: `entity-${i + 1}`,
    type: 'character' as EntityType,
    updatedAt: new Date().toISOString(),
    usages: []
  }));

  // Generate mock books
  const mockBooks: Book[] = Array.from({ length: bookCount }, (_, i) => ({
    createdAt: new Date().toISOString(),
    description: `Description for Book ${i + 1}`,
    order: i + 1,
    slug: `book-${i + 1}`,
    title: `Book ${i + 1}`,
    updatedAt: new Date().toISOString()
  }));

  // Generate mock chapters with entity references
  const mockChapters: Chapter[] = [];
  mockBooks.forEach((book) => {
    Array.from({ length: chapterCount }, (_, chapterIndex) => {
      const chapterSlug = `${book.slug}-chapter-${chapterIndex + 1}`;
      const entityRefsInContent = mockEntities.slice(0, Math.min(2, mockEntities.length))
        .map(entity => `{{ @${entity.slug} }}`)
        .join(' and ');

      const chapter: Chapter = {
        bookSlug: book.slug,
        content: `This is the content of Chapter ${chapterIndex + 1} in ${book.title}. It mentions ${entityRefsInContent} in the story.`,
        createdAt: new Date().toISOString(),
        number: chapterIndex + 1,
        slug: chapterSlug,
        title: `Chapter ${chapterIndex + 1}`,
        updatedAt: new Date().toISOString(),
      };

      mockChapters.push(chapter);
    });
  });

  // Update entity usages based on chapter content
  const updatedEntities = mockEntities.map(entity => {
    const usages: EntityUsage[] = [];

    mockChapters.forEach(chapter => {
      const book = mockBooks.find(b => b.slug === chapter.bookSlug);
      if (book && chapter.content?.includes(`{{ @${entity.slug} }}`)) {
        usages.push({
          bookSlug: book.slug,
          chapterSlug: chapter.slug,
          count: 1
        });
      }
    });

    return {
      ...entity,
      usages
    };
  });

  const date = new Date().toISOString()
  const project: Project = {
    books: mockBooks,
    chapters: mockChapters,
    entities: updatedEntities,
    images: [],
    metadata: {
      adapterType: 'localStorage',
      createdAt: date,
      description: `Mock project created at ${date}`,
      name: `Mock Project ${date}`,
      slug: `mock-project-${date.replace(/:/g, "-")}`,
      updatedAt: date
    }
  }

  return project
}
