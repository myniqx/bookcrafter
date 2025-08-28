"use client"

import { useState } from 'react'
import { useCurrentProjectStore, useCurrentBookStore, useCurrentChapterStore, useEntitiesStore } from '@/lib/stores'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MarkdownEditorV2 } from '@/components/markdown-editor-v2'

export default function TestNewSystemPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  // Store states
  const projectMetadata = useCurrentProjectStore(state => state.metadata)
  const setMetadata = useCurrentProjectStore(state => state.setMetadata)
  
  const book = useCurrentBookStore(state => state.book)
  const setBook = useCurrentBookStore(state => state.setBook)
  
  const chapter = useCurrentChapterStore(state => state.chapter)
  const content = useCurrentChapterStore(state => state.content)
  const setChapter = useCurrentChapterStore(state => state.setChapter)
  const setContent = useCurrentChapterStore(state => state.setContent)
  
  const entities = useEntitiesStore(state => state.entities)
  const setEntities = useEntitiesStore(state => state.setEntities)
  
  // Test data setup
  const setupTestData = () => {
    setIsLoading(true)
    setMessage('Setting up test data...')
    
    // Mock project metadata
    const mockProject = {
      slug: 'test-project',
      name: 'Test Project',
      description: 'A test project for the new system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      adapterType: 'localStorage' as const
    }
    setMetadata(mockProject)
    
    // Mock book
    const mockBook = {
      slug: 'test-book',
      title: 'Test Book',
      description: 'A test book',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft' as const
    }
    setBook(mockBook)
    
    // Mock chapter
    const mockChapter = {
      slug: 'test-chapter',
      title: 'Test Chapter',
      description: 'A test chapter',
      number: 1,
      content: 'This is a test chapter with some @hero references and @location.name mentions.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bookSlug: 'test-book'
    }
    setChapter(mockChapter)
    
    // Mock entities
    const mockEntities = [
      {
        name: 'Hero',
        slug: 'hero',
        type: 'character' as const,
        description: 'The main character',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        properties: [
          { id: '1', name: 'name', value: 'John Smith', isDefault: true },
          { id: '2', name: 'age', value: '25' },
        ],
        usages: []
      },
      {
        name: 'Magic City',
        slug: 'location',
        type: 'location' as const,
        description: 'A magical city',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        properties: [
          { id: '1', name: 'name', value: 'Arcanum', isDefault: true },
          { id: '2', name: 'population', value: '100000' },
        ],
        usages: []
      }
    ]
    setEntities(mockEntities)
    
    setMessage('Test data setup complete! Try typing "@hero" or "@location.name" in the editor!')
    setIsLoading(false)
  }
  
  const testStorePerformance = () => {
    setMessage('Testing store performance...')
    
    const start = performance.now()
    // Simulate rapid updates
    for (let i = 0; i < 1000; i++) {
      setContent(`Test content ${i}`)
    }
    const end = performance.now()
    
    setMessage(`Performance test: ${(end - start).toFixed(2)}ms for 1000 updates`)
  }
  
  const resetStores = () => {
    useCurrentProjectStore.getState().reset()
    useCurrentBookStore.getState().reset()
    useCurrentChapterStore.getState().reset()
    useEntitiesStore.getState().reset()
    setMessage('Stores reset!')
  }
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🚀 New Zustand + Performance System Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={setupTestData} disabled={isLoading}>
              Setup Test Data
            </Button>
            <Button onClick={testStorePerformance} disabled={isLoading} variant="outline">
              Test Performance
            </Button>
            <Button onClick={resetStores} variant="destructive">
              Reset Stores
            </Button>
          </div>
          
          {message && (
            <div className="p-3 bg-muted rounded-md">
              {message}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Store States Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Project Store</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto max-h-32">
              {JSON.stringify(projectMetadata, null, 2)}
            </pre>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Book Store</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto max-h-32">
              {JSON.stringify(book, null, 2)}
            </pre>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Chapter Store</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto max-h-32">
              {JSON.stringify({ title: chapter?.title, hasUnsavedChanges: useCurrentChapterStore.getState().hasUnsavedChanges }, null, 2)}
            </pre>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Entities ({entities.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs space-y-1">
              {entities.map(entity => (
                <div key={entity.slug} className="p-1 bg-muted/20 rounded">
                  @{entity.slug} → {entity.properties.find(p => p.isDefault)?.value}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Editor Test */}
      {chapter && (
        <Card>
          <CardHeader>
            <CardTitle>📝 Performance Optimized Editor</CardTitle>
            <p className="text-sm text-muted-foreground">
              Try typing "@hero" or "@location.name" to see entity suggestions!
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <MarkdownEditorV2
                projectSlug="test-project"
                bookId="test-book"
                chapterId="test-chapter"
                onProcessedContentChange={(processed) => {
                  console.log('Processed content:', processed)
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}