"use client"

import { useState, useEffect } from "react"
import TranscriptProcessor from "../components/transcript-processor"
import TranscriptList from "../components/transcript-list"
import { fetchCategories, processTranscript, fetchTranscriptsByCategory } from "../api/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Filter } from "lucide-react"

export default function TranscriptsPage() {
  const [categories, setCategories] = useState<string[]>([])
  const [transcripts, setTranscripts] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchCategories()
      .then((cats) => setCategories(cats.map((c) => c.name)))
      .finally(() => setCategoriesLoading(false))
  }, [])

  useEffect(() => {
    if (selectedCategory)
    {
      setLoading(true)
      fetchTranscriptsByCategory(selectedCategory)
        .then((data) => {
          setTranscripts(
            data.material.map((text: string, idx: number) => ({
              id: data.video_ids[idx],
              title: `Transcript ${idx + 1}`,
              category: data.category,
              preview: text.slice(0, 100) + "...",
            })),
          )
        })
        .catch((error) => {
          console.error("Failed to fetch transcripts:", error)
        })
        .finally(() => setLoading(false))
    }
  }, [selectedCategory])

  const handleProcess = async (url: string, category?: string, autoCategorize?: boolean) => {
    setProcessing(true)
    try
    {
      await processTranscript(url, category, autoCategorize)
      if (category) setSelectedCategory(category)
      // Refresh categories in case new ones were created
      const cats = await fetchCategories()
      setCategories(cats.map((c) => c.name))
    } catch (error)
    {
      console.error("Failed to process transcript:", error)
    } finally
    {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-sections">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <FileText className="h-6 w-6 text-blue-500" />
          <h1 className="text-3xl font-bold">Transcripts</h1>
        </div>
        <p className="text-muted-foreground">Process YouTube videos and manage transcripts by category</p>
      </div>

      {/* Transcript Processor */}
      <TranscriptProcessor onProcess={handleProcess} categories={categories} isLoading={processing} />

      {/* Category Filter */}
      {!categoriesLoading && categories.length > 0 && (
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="category-filter">Select Category</Label>
              <Select value={selectedCategory || ""} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a category to view transcripts" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories Loading */}
      {categoriesLoading && (
        <Card className="card-elevated">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transcripts Loading */}
      {loading && (
        <Card className="card-elevated">
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transcripts List */}
      {!loading && selectedCategory && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {transcripts.length} transcripts in "{selectedCategory}"
            </h2>
          </div>
          <TranscriptList transcripts={transcripts} onSelect={(id) => console.log("Selected transcript:", id)} />
        </div>
      )}

      {/* Empty States */}
      {!categoriesLoading && categories.length === 0 && (
        <Card className="card-elevated">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No categories available. Process some videos to get started.
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && selectedCategory && transcripts.length === 0 && (
        <Card className="card-elevated">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">No transcripts found in "{selectedCategory}" category.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
