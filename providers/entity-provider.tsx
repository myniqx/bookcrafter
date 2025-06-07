"use client"
import { Button } from "@/components/ui/button";
import { Entity, Project } from "@/lib/types";
import { goToEntity } from "@/lib/utils/navigateTo";
import { BookOpen, StepBack } from "lucide-react";
import Link from "next/link";
import React, { createContext, useContext, useMemo } from "react";
import { useProject } from "./project-provider";


interface EntityContextType {
  project: Project
  entities: Entity[]
  entity: Entity
  updateEntity: (data: Partial<Entity>) => void;
  saveProject: () => Promise<boolean>;
  hasUnsavedChanges: boolean;
}

interface EntityProviderProps {
  entitySlug: string;
  children: React.ReactNode;
}

const EntityContext = createContext<EntityContextType | null>(null);

export function EntityProvider({ children, entitySlug }: EntityProviderProps) {
  const {
    entities,
    hasUnsavedChanges,
    project,
    saveProject,
    updateEntity
  } = useProject();

  const value = useMemo(
    () => {
      const entity = entities.find((e) => e.slug === entitySlug)

      return {
        entities,
        entity: entity!,
        hasUnsavedChanges,
        project,
        saveProject,
        updateEntity: (data: Partial<Entity>) => updateEntity(entitySlug, data)
      }
    },
    [entities, hasUnsavedChanges, project, saveProject, entitySlug, updateEntity]
  );

  if (!value.entity) {
    const link = goToEntity({ project  })
    return (
      <div className="text-center p-28  rounded-lg bg-muted/20">
        <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground mb-4">Entity (slug {entitySlug}) not found</p>
        <Link href={link}>
          <Button>
            <StepBack className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <EntityContext.Provider value={value}>
      {children}
    </EntityContext.Provider>
  );
}

export function useEntity() {
  const context = useContext(EntityContext);
  if (!context) {
    throw new Error("useEntity must be used within a EntityProvider");
  }
  return context;
}
