"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { PenTool, Zap, FileText } from "lucide-react"
import { Textarea } from "./ui/textarea"

type Props = {
  onGenerate: (data: any) => void
  isLoading?: boolean
}

export default function SynopsisBasedGenerator({ onGenerate, isLoading = false }: Props) {
  const [synopsis, setSynopsis] = useState("")
  const [style, setStyle] = useState("professional")
  const [length, setLength] = useState([500])
  const [variationsCount, setVariationsCount] = useState(3)

  const handleGenerate = () => {
    onGenerate({
      synopsis,
      style,
      length: length[0],
      variations_count: variationsCount
    })
  }

  const wordCount = synopsis.trim().split(/\s+/).filter(word => word.length > 0).length

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="h-5 w-5 text-orange-500" />
          Synopsis-Based Generation
        </CardTitle>
        <CardDescription>
          Generate story variations from your own synopsis or idea
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Synopsis Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Story Synopsis</Label>
            <Badge variant="outline">{wordCount} words</Badge>
          </div>
          <Textarea
            placeholder="Enter your story synopsis, idea, or prompt here..."
            value={synopsis}
            onChange={(e: any) => setSynopsis(e.target.value)}
            className="min-h-[120px]"
          />
          <p className="text-xs text-muted-foreground">
            Provide a detailed synopsis for better story generation results
          </p>
        </div>

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

        {/* Example Prompts */}
        <div className="space-y-2">
          <Label>Example Prompts</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              "A young entrepreneur discovers a hidden technology that could change the world, but powerful corporations will stop at nothing to control it.",
              "In a post-apocalyptic world, a group of survivors must navigate dangerous territories to reach the last safe haven.",
              "A detective with a unique ability to see the last moments of a person's life must solve a series of mysterious deaths.",
              "A time traveler accidentally changes a small event in the past, causing a ripple effect that threatens the future."
            ].map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setSynopsis(prompt)}
                className="text-left h-auto p-3 justify-start"
              >
                <FileText className="h-3 w-3 mr-2 flex-shrink-0" />
                <span className="text-xs line-clamp-2">{prompt}</span>
              </Button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isLoading || synopsis.trim().length === 0}
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
              Generate from Synopsis
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}