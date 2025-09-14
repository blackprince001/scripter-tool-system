"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sparkles,
  BookOpen,
  FileText,
  PenTool,
  Zap,
  Target,
  Layers
} from "lucide-react"
import {
  fetchCategories,
  generateStory,
  generateStoryFromTranscripts,
  generateStoryFromSynopsis,
} from "../api/api"
import { StorageManager } from '../utils/storage'
import StoryVariations from "../components/story-variations"
import CategoryBasedGenerator from "@/components/category-based-generator"
import TranscriptBasedGenerator from "@/components/transcript-based-generator"
import SynopsisBasedGenerator from "@/components/synopsis-based-generator"

type GenerationMethod = 'categories' | 'transcripts' | 'synopsis'

export default function EnhancedStoryPage() {
  const [categories, setCategories] = useState<string[]>([])
  const [stories, setStories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [activeMethod, setActiveMethod] = useState<GenerationMethod>('categories')
  const [recentStories, setRecentStories] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setCategoriesLoading(true)
    try
    {
      const cats = await fetchCategories()
      setCategories(cats.map((c) => c.name))

      // Load recent stories from cache
      const cached = StorageManager.getItem('recentStories')
      setRecentStories(Array.isArray(cached) ? cached : [])
    } catch (error)
    {
      console.error('Failed to load data:', error)
    } finally
    {
      setCategoriesLoading(false)
    }
  }

  const handleGenerate = async (data: any, method: GenerationMethod) => {
    setLoading(true)
    try
    {
      let result

      switch (method)
      {
        case 'categories':
          result = await generateStory({
            category_weights: data.weights,
            variations_count: data.variations_count || 3,
            style: data.style,
            material_per_category: data.material_per_category || 5,
            length: data.length,
          })
          break

        case 'transcripts':
          result = await generateStoryFromTranscripts({
            transcript_ids: data.transcript_ids,
            variations_count: data.variations_count || 3,
            style: data.style,
            length: data.length,
          })
          break

        case 'synopsis':
          result = await generateStoryFromSynopsis({
            story: data.synopsis,
            variations_count: data.variations_count || 3,
            style: data.style,
            length: data.length,
          })
          break
      }

      setStories(result.variations)

      // Save to recent stories
      const newStory = {
        id: Date.now().toString(),
        method,
        data,
        stories: result.variations,
        created_at: new Date().toISOString()
      }

      const updated = [newStory, ...recentStories].slice(0, 10)
      setRecentStories(updated)
      StorageManager.setItem('recentStories', updated)

      // Add activity
      StorageManager.addActivity({
        type: 'story_generated',
        title: `Generated ${result.variations.length} story variations`,
        status: 'success'
      })

    } catch (error)
    {
      console.error("Failed to generate story:", error)
      StorageManager.addActivity({
        type: 'story_generated',
        title: 'Story generation failed',
        status: 'error'
      })
    } finally
    {
      setLoading(false)
    }
  }

  const getMethodIcon = (method: GenerationMethod) => {
    switch (method)
    {
      case 'categories': return <Target className="h-4 w-4" />
      case 'transcripts': return <FileText className="h-4 w-4" />
      case 'synopsis': return <PenTool className="h-4 w-4" />
    }
  }

  const getMethodTitle = (method: GenerationMethod) => {
    switch (method)
    {
      case 'categories': return 'Category-Based'
      case 'transcripts': return 'Transcript-Based'
      case 'synopsis': return 'Synopsis-Based'
    }
  }

  if (categoriesLoading)
  {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        <Card className="card-elevated">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-500" />
          <h1 className="text-3xl font-bold">Enhanced Story Generator</h1>
        </div>
        <p className="text-muted-foreground">Generate stories from multiple sources with advanced controls</p>
      </div>

      {/* Generation Methods Tabs */}
      <Tabs value={activeMethod} onValueChange={(value: string) => setActiveMethod(value as GenerationMethod)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="transcripts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Transcripts
          </TabsTrigger>
          <TabsTrigger value="synopsis" className="flex items-center gap-2">
            <PenTool className="h-4 w-4" />
            Synopsis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-6">
          <CategoryBasedGenerator
            categories={categories}
            onGenerate={(data) => handleGenerate(data, 'categories')}
            isLoading={loading}
          />
        </TabsContent>

        <TabsContent value="transcripts" className="space-y-6">
          <TranscriptBasedGenerator
            onGenerate={(data) => handleGenerate(data, 'transcripts')}
            isLoading={loading}
          />
        </TabsContent>

        <TabsContent value="synopsis" className="space-y-6">
          <SynopsisBasedGenerator
            onGenerate={(data) => handleGenerate(data, 'synopsis')}
            isLoading={loading}
          />
        </TabsContent>
      </Tabs>

      {/* Empty Categories State */}
      {categories.length === 0 && (
        <Card className="card-elevated">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No categories available. Process some transcripts first to get started.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Story Variations */}
      {stories.length > 0 && <StoryVariations stories={stories} />}

      {/* Recent Stories */}
      {recentStories.length > 0 && (
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Recent Stories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentStories.slice(0, 5).map((story) => (
                <div key={story.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    {getMethodIcon(story.method)}
                    <div>
                      <p className="text-sm font-medium">
                        {getMethodTitle(story.method)} - {story.stories.length} variations
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(story.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStories(story.stories)}
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    Load
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
