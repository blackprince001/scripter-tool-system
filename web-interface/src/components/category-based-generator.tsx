"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Target, Settings, Zap } from "lucide-react"

type CategoryWeight = { name: string; weight: number }

type Props = {
  categories: string[]
  onGenerate: (data: any) => void
  isLoading?: boolean
}

export default function CategoryBasedGenerator({ categories, onGenerate, isLoading = false }: Props) {
  const [weights, setWeights] = useState<CategoryWeight[]>(categories.map((cat) => ({ name: cat, weight: 50 })))
  const [style, setStyle] = useState("professional")
  const [length, setLength] = useState([500])
  const [variationsCount, setVariationsCount] = useState(3)
  const [materialPerCategory, setMaterialPerCategory] = useState(5)

  const updateWeight = (categoryName: string, weight: number) => {
    setWeights((prev) => prev.map((w) => (w.name === categoryName ? { ...w, weight } : w)))
  }

  const handleGenerate = () => {
    onGenerate({
      weights,
      style,
      length: length[0],
      variations_count: variationsCount,
      material_per_category: materialPerCategory
    })
  }

  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0)
  const isBalanced = Math.abs(totalWeight - 100) < 10

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-500" />
          Category-Based Generation
        </CardTitle>
        <CardDescription>
          Generate stories by weighting different categories of content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Advanced Settings */}
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

        {/* Material Per Category */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Material Per Category</Label>
            <Badge variant="outline">{materialPerCategory} transcripts</Badge>
          </div>
          <Slider
            value={[materialPerCategory]}
            onValueChange={([value]) => setMaterialPerCategory(value)}
            max={20}
            min={1}
            step={1}
            className="w-full"
          />
        </div>

        {/* Category Weights */}
        {categories.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <Label>Category Weights</Label>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isBalanced ? "default" : "secondary"}>
                  Total: {totalWeight}%
                </Badge>
                {!isBalanced && (
                  <Badge variant="outline" className="text-xs">
                    Auto-balance recommended
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {categories.map((category) => {
                const weight = weights.find((w) => w.name === category)?.weight || 50
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">{category}</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{weight}%</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateWeight(category, 0)}
                          className="h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
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

        <Button
          onClick={handleGenerate}
          disabled={isLoading || categories.length === 0}
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
              Generate Stories
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}