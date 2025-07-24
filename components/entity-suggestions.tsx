import React, { useEffect, useRef } from 'react';
import { Entity } from '../lib/types';

interface EntitySuggestionProps {
  entities: Entity[]
  visible: boolean
  onSelect: (entity: Entity) => void
  posX: number
  posY: number
  selectedIndex: number
}

export const EntitySuggestions: React.FC<EntitySuggestionProps> = ({
  entities, onSelect,
  posX, posY, selectedIndex, visible
}) => {

  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (visible && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }
    }
  }, [selectedIndex, visible])

  if (!visible || !entities || entities.length === 0) return null;

  <div
    className="absolute z-10 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto w-64"
    ref={suggestionsRef}
    style={{
      left: `${posX}px`,
      top: `${posY}px`,
    }}
  >
    {entities.map((entity, index) => (
      <div
        className={`p-2 cursor-pointer flex items-center gap-1 border-b border-border/50 last:border-b-0 ${index === selectedIndex
          ? "bg-primary/10 border-primary/20"
          : "hover:bg-muted/50"
          }`}
        key={entity.slug}
        onClick={() => onSelect(entity)}
      >
        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{entity.name}</div>
          <div className="text-xs text-muted-foreground truncate">@{entity.slug}</div>
          {entity.properties.find(p => p.isDefault) && (
            <div className="text-xs text-muted-foreground/70 truncate mt-1">
              {entity.properties.find(p => p.isDefault)!.value.substring(0, 30)}
              {entity.properties.find(p => p.isDefault)!.value.length > 30 ? '...' : ''}
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
};
