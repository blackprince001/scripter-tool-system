"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, FileText } from "lucide-react"

type Props = {
  stories: string[]
}

export default function StoryVariations({ stories }: Props) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (stories.length === 0)
  {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Generated Stories</h3>
        <Badge variant="secondary">{stories.length} variations</Badge>
      </div>

      <div className="space-y-4">
        {stories.map((story, idx) => (
          <Card key={idx} className="card-elevated">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Variation {idx + 1}</CardTitle>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(story)} className="h-8 w-8 p-0">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-line text-sm leading-relaxed">{story}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
