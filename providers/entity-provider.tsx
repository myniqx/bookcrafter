"use client"
import { Button } from "@/components/ui/button";
import { Entity, ProjectContextType } from "@/lib/types";
import { goToEntity } from "@/lib/utils/navigateTo";
import { BookOpen, StepBack } from "lucide-react";
import Link from "next/link";
import React, { createContext, useContext, useMemo } from "react";
import { useProject } from "./project-provider";


interface EntityContextType extends Omit<ProjectContextType, "updateEntity"> {
  entity: Entity
  updateEntity: (data: Partial<Entity>) => void;
}

interface EntityProviderProps {
  entitySlug: string;
  children: React.ReactNode;
}

const EntityContext = createContext<EntityContextType | null>(null);

export function EntityProvider({ children, entitySlug }: EntityProviderProps) {
  const {
    entities,
    updateEntity,
    ...rest
  } = useProject();

  const value = useMemo(
    () => {
      const entity = entities.find((e) => e.slug === entitySlug)

      return {
        entities,
        entity: entity!,
        updateEntity: (data: Partial<Entity>) => updateEntity(entitySlug, data),
      }
    },
    [entities, entitySlug, updateEntity]
  );

  if (!value.entity) {
    const link = goToEntity({ project: rest.project }) 
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
    <EntityContext.Provider value={{ ...value, ...rest }}>
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
