"use client"

import { useState } from "react"

import { Edit, Save, Trash } from "lucide-react"

import type { Note } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { formatDate } from "@/lib/utils"
import { useEntity } from "@/providers/entity-provider"


export function NotesList() {
  const { entity, project, saveProject, updateEntity } = useEntity()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")

  const notes = entity.notes || []

  if (notes.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">Henüz hiç not yok. Yeni bir not ekleyin.</p>
      </div>
    )
  }

  const handleEdit = (note: Note) => {
    setEditingId(note.id)
    setEditTitle(note.title)
    setEditContent(note.content)
  }

  const handleSave = (note: Note) => {

    updateEntity({
      notes: (entity.notes || []).map((n) => {
        if (n.id === note.id) {
          return {
            ...n,
            content: editContent,
            title: editTitle,
          }
        }
        return n
      }),
    })

    saveProject()
    setEditingId(null)
  }

  const handleDelete = (noteId: string) => {
    if (!project || !confirm("Bu notu silmek istediğinizden emin misiniz?")) return

    updateEntity({
      notes: (entity.notes || []).filter((note) => note.id !== noteId),
    })

    saveProject()
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <Card key={note.id}>
          <CardHeader className="py-3">
            <CardTitle className="text-base flex items-center justify-between">
              {editingId === note.id ? (
                <Input className="flex-1" onChange={(e) => setEditTitle(e.target.value)} value={editTitle} />
              ) : (
                <span>{note.title}</span>
              )}
              <div className="flex gap-1">
                {editingId === note.id ? (
                  <Button onClick={() => handleSave(note)} size="icon">
                    <Save className="h-4 w-4" />
                  </Button>
                ) : (
                  <>
                    <Button onClick={() => handleEdit(note)} size="icon" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => handleDelete(note.id)} size="icon" variant="ghost">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editingId === note.id ? (
              <Textarea onChange={(e) => setEditContent(e.target.value)} rows={5} value={editContent} />
            ) : (
              <div className="text-sm whitespace-pre-wrap">
                {note.content}
                <div className="text-xs text-muted-foreground mt-2">{formatDate(note.createdAt)}</div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
