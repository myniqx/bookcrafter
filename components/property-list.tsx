"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { EntityProperty } from "@/lib/types"
import { Edit, Save, Star, StarOff } from "lucide-react"
import { useProject } from "@/hooks/use-project"

interface PropertyListProps {
  properties: EntityProperty[]
  entityId: string
  projectId: string
}

export function PropertyList({ properties, entityId, projectId }: PropertyListProps) {
  const { project, saveProject } = useProject(projectId)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  if (properties.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">Henüz hiç özellik yok. Yeni bir özellik ekleyin.</p>
      </div>
    )
  }

  const handleEdit = (property: EntityProperty) => {
    setEditingId(property.id)
    setEditValue(property.value)
  }

  const handleSave = (property: EntityProperty) => {
    if (!project) return

    const updatedEntities = project.entities.map((entity) => {
      if (entity.id === entityId) {
        const updatedProperties = entity.properties.map((prop) => {
          if (prop.id === property.id) {
            return {
              ...prop,
              value: editValue,
            }
          }
          return prop
        })

        return {
          ...entity,
          properties: updatedProperties,
        }
      }
      return entity
    })

    saveProject({
      ...project,
      entities: updatedEntities,
      updatedAt: new Date().toISOString(),
    })

    setEditingId(null)
  }

  const handleToggleDefault = (property: EntityProperty) => {
    if (!project) return

    const updatedEntities = project.entities.map((entity) => {
      if (entity.id === entityId) {
        const updatedProperties = entity.properties.map((prop) => {
          if (prop.id === property.id) {
            return {
              ...prop,
              isDefault: !prop.isDefault,
            }
          } else if (prop.isDefault && property.id !== prop.id) {
            // Ensure only one default property
            return {
              ...prop,
              isDefault: false,
            }
          }
          return prop
        })

        return {
          ...entity,
          properties: updatedProperties,
        }
      }
      return entity
    })

    saveProject({
      ...project,
      entities: updatedEntities,
      updatedAt: new Date().toISOString(),
    })
  }

  return (
    <div className="space-y-4">
      {properties.map((property) => (
        <Card key={property.id}>
          <CardHeader className="py-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>{property.name}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleToggleDefault(property)}
                title={property.isDefault ? "Varsayılan Özellik" : "Varsayılan Yap"}
              >
                {property.isDefault ? <Star className="h-4 w-4 text-yellow-500" /> : <StarOff className="h-4 w-4" />}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editingId === property.id ? (
              <div className="flex gap-2">
                <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1" />
                <Button size="icon" onClick={() => handleSave(property)}>
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  {property.value || <span className="text-muted-foreground italic">Boş</span>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(property)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
