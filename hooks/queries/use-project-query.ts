import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Project, ProjectMetadata } from '@/lib/types'
import { HybridFileAdapter } from '@/lib/file-adapters/hybrid-file-adapter'

const fileAdapter = new HybridFileAdapter()

export const useProjectsQuery = () => {
  return useQuery({
    queryFn: () => fileAdapter.getProjects(),
    queryKey: ['projects'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useProjectQuery = (slug: string) => {
  return useQuery({
    enabled: !!slug,
    queryFn: () => fileAdapter.loadProject(slug),
    queryKey: ['project', slug],
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useSaveProjectMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (project: Project) => fileAdapter.saveProject(project),
    onSuccess: (_, project) => {
      // Update the projects list
      queryClient.setQueryData(['projects'], (old: ProjectMetadata[] | undefined) => {
        if (!old) return []

        const existingIndex = old.findIndex(p => p.slug === project.metadata.slug)
        const projectBase = project.metadata

        if (existingIndex >= 0) {
          const newProjects = [...old]
          newProjects[existingIndex] = projectBase
          return newProjects
        } else {
          return [...old, projectBase]
        }
      })

      // Update the specific project
      queryClient.setQueryData(['project', project.metadata.slug], project)
    },
  })
}

export const useDeleteProjectMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slug: string) => fileAdapter.deleteProject(slug),
    onSuccess: (_, slug) => {
      // Remove from projects list
      queryClient.setQueryData(['projects'], (old: ProjectMetadata[] | undefined) => {
        return old?.filter(p => p.slug !== slug) || []
      })

      // Remove the specific project
      queryClient.removeQueries({ queryKey: ['project', slug] })
    },
  })
}
