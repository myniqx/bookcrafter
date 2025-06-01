import { useRouter } from "next/navigation";



export const goToProject = (projectSlug: string, router?: ReturnType<typeof useRouter>) => {
  if (router) return router.push(`/${projectSlug}/project`);
  return `/${projectSlug}/project`;
};

export const goToBook = (projectSlug: string, bookSlug?: string, router?: ReturnType<typeof useRouter>) => {
  if (router) return router.push(`/${projectSlug}/books/${bookSlug || ''}`);
  return `/${projectSlug}/books/${bookSlug || ''}`;
};

export const goToChapter = (projectSlug: string, bookSlug: string, chapterSlug: string, router?: ReturnType<typeof useRouter>) => {
  if (router) return router.push(`/${projectSlug}/books/${bookSlug}/${chapterSlug}`);
  return `/${projectSlug}/books/${bookSlug}/${chapterSlug}`;
};

export const goToEntity = (projectSlug: string, entitySlug?: string, router?: ReturnType<typeof useRouter>) => {
  if (router) return router.push(`/${projectSlug}/entities/${entitySlug || ''}`);
  return `/${projectSlug}/entities/${entitySlug || ''}`;
};
