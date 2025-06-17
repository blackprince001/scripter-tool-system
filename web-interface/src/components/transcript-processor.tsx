"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Youtube, Zap } from "lucide-react"

type Props = {
  onProcess: (url: string, category?: string, autoCategorize?: boolean) => void
  categories: string[]
  isLoading?: boolean
}

export default function TranscriptProcessor({ onProcess, categories, isLoading = false }: Props) {
  const [url, setUrl] = useState("")
  const [category, setCategory] = useState("")
  const [autoCategorize, setAutoCategorize] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim())
    {
      onProcess(url.trim(), category, autoCategorize)
    }
  }

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Youtube className="h-5 w-5 text-red-500" />
          Process Transcript
        </CardTitle>
        <CardDescription>Extract and process transcripts from YouTube videos</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-url">YouTube Video URL</Label>
            <Input
              id="video-url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="focus-ring"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} disabled={autoCategorize}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="auto-categorize"
                checked={autoCategorize}
                onCheckedChange={(checked) => setAutoCategorize(checked === true)}
              />
              <Label htmlFor="auto-categorize" className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4" />
                Auto Categorize
              </Label>
            </div>
          </div>

          <Button type="submit" disabled={!url.trim() || isLoading} className="w-full">
            {isLoading ? "Processing Transcript..." : "Process Transcript"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
