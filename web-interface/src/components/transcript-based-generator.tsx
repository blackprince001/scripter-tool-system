"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Zap } from "lucide-react"
import { fetchTranscriptsByCategory, fetchCategories } from "../api/api"

type Props = {
  onGenerate: (data: any) => void
  isLoading?: boolean
}

type Transcript = {
  id: string
  title: string
  category: string
  preview: string
}

export default function TranscriptBasedGenerator({ onGenerate, isLoading = false }: Props) {
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [selectedTranscripts, setSelectedTranscripts] = useState<string[]>([])
  const [style, setStyle] = useState("professional")
  const [length, setLength] = useState([500])
  const [variationsCount, setVariationsCount] = useState(3)
  const [loadingTranscripts, setLoadingTranscripts] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try
    {
      const cats = await fetchCategories()
      setCategories(cats.map(c => c.name))
    } catch (error)
    {
      console.error('Failed to load categories:', error)
    }
  }

  const loadTranscripts = async (category: string) => {
    setLoadingTranscripts(true)
    try
    {
      const data = await fetchTranscriptsByCategory(category, 20)
      const transcriptList = data.material.map((text: string, idx: number) => ({
        id: data.video_ids[idx],
        title: `Transcript ${idx + 1}`,
        category: data.category,
        preview: text.slice(0, 100) + "..."
      }))
      setTranscripts(transcriptList)
    } catch (error)
    {
      console.error('Failed to load transcripts:', error)
    } finally
    {
      setLoadingTranscripts(false)
    }
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setSelectedTranscripts([])
    if (category)
    {
      loadTranscripts(category)
    } else
    {
      setTranscripts([])
    }
  }

  const toggleTranscript = (transcriptId: string) => {
    setSelectedTranscripts(prev =>
      prev.includes(transcriptId)
        ? prev.filter(id => id !== transcriptId)
        : [...prev, transcriptId]
    )
  }

  const selectAll = () => {
    setSelectedTranscripts(transcripts.map(t => t.id))
  }

  const selectNone = () => {
    setSelectedTranscripts([])
  }

  const handleGenerate = () => {
    onGenerate({
      transcript_ids: selectedTranscripts,
      style,
      length: length[0],
      variations_count: variationsCount
    })
  }

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-green-500" />
          Transcript-Based Generation
        </CardTitle>
        <CardDescription>
          Generate stories from specific transcripts you select
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Selection */}
        <div className="space-y-2">
          <Label>Select Category</Label>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a category to load transcripts" />
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

        {/* Transcript Selection */}
        {selectedCategory && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Select Transcripts ({selectedTranscripts.length} selected)</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={selectNone}>
                  Select None
                </Button>
              </div>
            </div>

            {loadingTranscripts ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {transcripts.map((transcript) => (
                  <div
                    key={transcript.id}
                    className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={selectedTranscripts.includes(transcript.id)}
                      onCheckedChange={() => toggleTranscript(transcript.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{transcript.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{transcript.preview}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Generation Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Writing Style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Variations Count</Label>
            <Select value={variationsCount.toString()} onValueChange={(v) => setVariationsCount(parseInt(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 variation</SelectItem>
                <SelectItem value="2">2 variations</SelectItem>
                <SelectItem value="3">3 variations</SelectItem>
                <SelectItem value="5">5 variations</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Length Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Story Length</Label>
            <Badge variant="secondary">{length[0]} words</Badge>
          </div>
          <Slider value={length} onValueChange={setLength} max={2000} min={100} step={50} className="w-full" />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isLoading || selectedTranscripts.length === 0}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Generating Stories...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Generate from {selectedTranscripts.length} Transcripts
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}