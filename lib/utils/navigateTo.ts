import { useRouter } from "next/navigation";

import { Book, Chapter, Entity, Project } from "../types";

interface GoToProjectProps {
  project: Pick<Project, 'slug'>
  router?: ReturnType<typeof useRouter>
  params?: string
}

interface GotoEntitiesProps extends GoToProjectProps {
  entity?: Pick<Entity, 'slug'>
}

interface GotoBookProps extends GoToProjectProps {
  book?: Book
}

interface GotoChapterProps extends GoToProjectProps {
  book: Pick<Book, 'slug'>
  chapter?: Pick<Chapter, 'slug'>
}

export const goToProject = ({ params, project, router }: GoToProjectProps) => {
  const link = `/${project.slug}/project${params ? `?${params}` : ''}`
  if (router) router.push(link)
  return link
};

export const goToBook = ({ book, params, project, router }: GotoBookProps) => {
  const link = `/${project.slug}/books${book?.slug ? `/${book.slug}` : ''}${params ? `?${params}` : ''}`
  if (router) router.push(link)
  return link
};

export const goToChapter = ({ book, chapter, params, project, router }: GotoChapterProps) => {
  const link = `/${project.slug}/books/${book.slug}/chapters${chapter?.slug ? `/${chapter.slug}` : ''}${params ? `?${params}` : ''}`
  if (router) router.push(link)
  return link
};

export const goToEntity = ({ entity, params, project, router }: GotoEntitiesProps) => {
  const link = `/${project.slug}/entities/${entity?.slug}${params ? `?${params}` : ''}`
  if (router) router.push(link)
  return link
};
