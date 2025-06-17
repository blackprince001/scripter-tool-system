"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Settings } from "lucide-react"

type CategoryWeight = { name: string; weight: number }

type Props = {
  categories: string[]
  onGenerate: (weights: CategoryWeight[], style: string, length: number) => void
  isLoading?: boolean
}

export default function StoryGenerator({ categories, onGenerate, isLoading = false }: Props) {
  const [weights, setWeights] = useState<CategoryWeight[]>(categories.map((cat) => ({ name: cat, weight: 50 })))
  const [style, setStyle] = useState("professional")
  const [length, setLength] = useState([500])

  const updateWeight = (categoryName: string, weight: number) => {
    setWeights((prev) => prev.map((w) => (w.name === categoryName ? { ...w, weight } : w)))
  }

  const handleGenerate = () => {
    onGenerate(weights, style, length[0])
  }

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Story Generator
        </CardTitle>
        <CardDescription>Configure story generation parameters and category weights</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Style Selection */}
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

        {/* Length Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Story Length</Label>
            <Badge variant="secondary">{length[0]} words</Badge>
          </div>
          <Slider value={length} onValueChange={setLength} max={2000} min={100} step={50} className="w-full" />
        </div>

        {/* Category Weights */}
        {categories.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <Label>Category Weights</Label>
            </div>
            <div className="space-y-4">
              {categories.map((category) => {
                const weight = weights.find((w) => w.name === category)?.weight || 50
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">{category}</Label>
                      <Badge variant="outline">{weight}%</Badge>
                    </div>
                    <Slider
                      value={[weight]}
                      onValueChange={([value]) => updateWeight(category, value)}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <Button onClick={handleGenerate} disabled={isLoading || categories.length === 0} className="w-full">
          {isLoading ? "Generating Story..." : "Generate Story"}
        </Button>
      </CardContent>
    </Card>
  )
}
