"use client"

import { useState, useEffect } from "react"
import StoryGenerator from "../components/story-generator"
import StoryVariations from "../components/story-variations"
import { fetchCategories, generateStory, type CategoryWeight } from "../api/api"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Sparkles, BookOpen } from "lucide-react"

export default function StoryPage() {
  const [categories, setCategories] = useState<string[]>([])
  const [stories, setStories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
      .then((cats) => setCategories(cats.map((c) => c.name)))
      .finally(() => setCategoriesLoading(false))
  }, [])

  const handleGenerate = async (weights: CategoryWeight[], style: string, length: number) => {
    setLoading(true)
    try
    {
      const res = await generateStory({
        category_weights: weights,
        variations_count: 3,
        style,
        material_per_category: 1,
        length,
      })
      setStories(res.variations)
    } catch (error)
    {
      console.error("Failed to generate story:", error)
    } finally
    {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-sections">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-500" />
          <h1 className="text-3xl font-bold">Story Generator</h1>
        </div>
        <p className="text-muted-foreground">Generate compelling stories from your processed transcripts</p>
      </div>

      {/* Categories Loading */}
      {categoriesLoading && (
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
      )}

      {/* Story Generator */}
      {!categoriesLoading && <StoryGenerator categories={categories} onGenerate={handleGenerate} isLoading={loading} />}

      {/* Empty Categories State */}
      {!categoriesLoading && categories.length === 0 && (
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
    </div>
  )
}
