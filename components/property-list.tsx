"use client"

import { useState } from "react"

import { Edit, Save, Star, StarOff } from "lucide-react"

import type { EntityProperty } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useEntity } from "@/providers/entity-provider"


export function PropertyList() {
  const { entity, saveProject, updateEntity } = useEntity()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  const properties = entity.properties || []

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
    updateEntity({
      properties: (entity.properties || []).map((prop) => {
        if (prop.id === property.id) {
          return {
            ...prop,
            value: editValue,
          }
        }
        return prop
      }),
    })

    saveProject()

    setEditingId(null)
  }

  const handleToggleDefault = (property: EntityProperty) => {
    updateEntity({
      properties: (entity.properties || []).map((prop) => {
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
      }),
    })

    saveProject()
  }

  return (
    <div className="space-y-4">
      {properties.map((property) => (
        <Card key={property.id}>
          <CardHeader className="py-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>{property.name}</span>
              <Button
                onClick={() => handleToggleDefault(property)}
                size="icon"
                title={property.isDefault ? "Varsayılan Özellik" : "Varsayılan Yap"}
                variant="ghost"
              >
                {property.isDefault ? <Star className="h-4 w-4 text-yellow-500" /> : <StarOff className="h-4 w-4" />}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editingId === property.id ? (
              <div className="flex gap-2">
                <Input className="flex-1" onChange={(e) => setEditValue(e.target.value)} value={editValue} />
                <Button onClick={() => handleSave(property)} size="icon">
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  {property.value || <span className="text-muted-foreground italic">Boş</span>}
                </div>
                <Button onClick={() => handleEdit(property)} size="icon" variant="ghost">
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
