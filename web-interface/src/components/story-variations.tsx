"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, FileText, Save, Eye } from "lucide-react"
import { createStory, Story } from "../api/api"

type Props = {
  stories: string[]
}

export default function StoryVariations({ stories }: Props) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [saving, setSaving] = useState(false)
  const [savedStories, setSavedStories] = useState<{ [key: number]: Story }>({})

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleSaveStory = async (index: number, content: string) => {
    if (!editingTitle.trim())
    {
      alert("Please enter a title for the story")
      return
    }

    setSaving(true)
    try
    {
      const savedStory = await createStory({
        title: editingTitle,
        content: content
      })

      setSavedStories(prev => ({ ...prev, [index]: savedStory }))
      setEditingIndex(null)
      setEditingTitle("")
    } catch (error)
    {
      console.error("Failed to save story:", error)
      alert("Failed to save story")
    } finally
    {
      setSaving(false)
    }
  }

  const handleViewStory = (story: Story) => {
    window.open(`/stories/${story.id}`, '_blank')
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
        {stories.map((story, idx) => {
          const savedStory = savedStories[idx]
          return (
            <Card key={idx} className="card-elevated">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Variation {idx + 1}</CardTitle>
                  <div className="flex items-center gap-2">
                    {savedStory && (
                      <Badge variant={savedStory.status === "finalized" ? "default" : "secondary"}>
                        {savedStory.status}
                      </Badge>
                    )}
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(story)} className="h-8 w-8 p-0">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-line text-sm leading-relaxed">{story}</p>
                </div>

                {/* Save/View Actions */}
                <div className="mt-4 pt-4 border-t">
                  {!savedStory ? (
                    <div className="flex items-center gap-2">
                      {editingIndex === idx ? (
                        <div className="flex items-center gap-2 w-full">
                          <Input
                            placeholder="Enter story title..."
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSaveStory(idx, story)}
                            disabled={saving}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? "Saving..." : "Save"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingIndex(null)
                              setEditingTitle("")
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => setEditingIndex(idx)}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save Story
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleViewStory(savedStory)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View & Finalize
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Saved on {new Date(savedStory.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
