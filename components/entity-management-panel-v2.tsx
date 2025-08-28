"use client"

import { useState } from "react"
import { Briefcase, Calendar, MapPin, Plus, Search, User } from "lucide-react"
import type { Entity, EntityType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEntitiesStore } from "@/lib/stores"

export function EntityManagementPanelV2() {
  const [activeTab, setActiveTab] = useState<EntityType>("character")
  const entities = useEntitiesStore(state => state.entities)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)

  const filteredEntities = entities
    .filter((entity) => entity.type === activeTab)
    .filter(
      (entity) =>
        entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.slug.toLowerCase().includes(searchTerm.toLowerCase()),
    )

  const entityTypeLabels = {
    character: "Characters",
    location: "Locations", 
    item: "Items",
    event: "Events"
  }

  return (
    <div className="space-y-4 h-full overflow-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{entityTypeLabels[activeTab]}</h2>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          variant={showCreateForm ? "secondary" : "default"}
        >
          {showCreateForm ? (
            "Cancel"
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              New {activeTab}
            </>
          )}
        </Button>
      </div>

      {showCreateForm ? (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Create entity form would go here
            </p>
            <Button 
              onClick={() => setShowCreateForm(false)}
              className="mt-2"
              size="sm"
            >
              Close
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search entities..."
                value={searchTerm}
              />
            </div>
          </div>

          <Tabs onValueChange={(value) => setActiveTab(value as EntityType)} value={activeTab}>
            <TabsList className="grid w-full grid-cols-4">
              {Object.entries({
                character: User,
                event: Calendar,
                item: Briefcase,
                location: MapPin,
              }).map(([value, Icon]) => (
                <TabsTrigger key={value} value={value}>
                  <Icon className="h-4 w-4 mr-2" />
                  {entityTypeLabels[value as EntityType]}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent className="mt-4" value={activeTab}>
              <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-auto pr-1">
                {filteredEntities.length === 0 ? (
                  <div className="text-center p-8 border rounded-lg bg-muted/20">
                    <p className="text-muted-foreground">No {activeTab}s found</p>
                  </div>
                ) : (
                  filteredEntities.map((entity) => (
                    <EntityCardV2
                      entity={entity}
                      key={entity.slug}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

interface EntityCardV2Props {
  entity: Entity
}

function EntityCardV2({ entity }: EntityCardV2Props) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="py-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <CardTitle className="text-base flex items-center justify-between">
          <span>{entity.name}</span>
          <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">@{entity.slug}</span>
        </CardTitle>
      </CardHeader>

      {expanded && (
        <CardContent>
          {entity.description && <p className="text-sm text-muted-foreground mb-4">{entity.description}</p>}
          
          {entity.properties && entity.properties.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Properties:</h4>
              {entity.properties.map((property) => (
                <div key={property.id} className="flex justify-between text-xs">
                  <span className="font-medium">{property.name}:</span>
                  <span className="text-muted-foreground">{property.value}</span>
                </div>
              ))}
            </div>
          )}
          
          {entity.notes && entity.notes.length > 0 && (
            <div className="space-y-2 mt-4">
              <h4 className="text-sm font-medium">Notes:</h4>
              {entity.notes.map((note) => (
                <div key={note.id} className="p-2 border rounded-md bg-muted/10">
                  <p className="text-sm font-medium">{note.title}</p>
                  <p className="text-xs text-muted-foreground">{note.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}