"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Plus,
  Search,
  Eye,
  Calendar,
  FileText,
  ArrowLeft
} from "lucide-react"
import { Story } from "../api/api"

export default function StoriesListPage() {
  const navigate = useNavigate()
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStories()
  }, [])

  const loadStories = async () => {
    setLoading(true)
    setError(null)
    try
    {
      // Note: This would need to be implemented in the backend
      // For now, we'll show a placeholder
      setStories([])
    } catch (err)
    {
      setError("Failed to load stories")
      console.error("Error loading stories:", err)
    } finally
    {
      setLoading(false)
    }
  }

  const filteredStories = stories.filter(story =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status)
    {
      case "finalized":
        return "default"
      case "draft":
        return "secondary"
      default:
        return "outline"
    }
  }

  const handleViewStory = (story: Story) => {
    navigate(`/stories/${story.id}`)
  }

  const handleCreateStory = () => {
    navigate("/stories")
  }

  if (loading)
  {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-6">
          <Skeleton className="h-10 w-32 mb-4" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">All Stories</h1>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button onClick={handleCreateStory}>
            <Plus className="h-4 w-4 mr-2" />
            Create Story
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stories Grid */}
      {filteredStories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No stories found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm ? "No stories match your search criteria." : "You haven't created any stories yet."}
            </p>
            <Button onClick={handleCreateStory}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Story
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => (
            <Card key={story.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">{story.title}</CardTitle>
                  <Badge variant={getStatusColor(story.status)}>
                    {story.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                  {story.content}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(story.created_at).toLocaleDateString()}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleViewStory(story)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>

                {story.project_id && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Project ID: {story.project_id}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
