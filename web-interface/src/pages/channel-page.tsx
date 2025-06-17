"use client"

import { useState } from "react"
import ChannelInput from "../components/channel-input"
import VideoList from "../components/video-list"
import { fetchChannelVideos } from "../api/api"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Video, AlertCircle } from "lucide-react"

type VideoType = {
  id: string
  title: string
  publishedAt: string
  thumbnail: string
}

export default function ChannelPage() {
  const [videos, setVideos] = useState<VideoType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFetch = async (channelId: string) => {
    setLoading(true)
    setError(null)
    try
    {
      const data = await fetchChannelVideos(channelId)
      setVideos(
        data.videos.map((v: any) => ({
          id: v.video_id,
          title: v.title,
          publishedAt: v.published_at,
          thumbnail: v.thumbnail,
        })),
      )
    } catch (e: any)
    {
      setError(e.message || "Failed to fetch videos")
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
          <Video className="h-6 w-6 text-red-500" />
          <h1 className="text-3xl font-bold">Channel Videos</h1>
        </div>
        <p className="text-muted-foreground">Fetch and browse videos from any YouTube channel</p>
      </div>

      {/* Channel Input */}
      <ChannelInput onFetch={handleFetch} isLoading={loading} />

      {/* Loading State */}
      {loading && (
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Loading Videos...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="border border-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Videos List */}
      {!loading && !error && videos.length > 0 && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Found {videos.length} videos</h2>
          </div>
          <VideoList videos={videos} onSelect={(videoId) => console.log("Selected:", videoId)} />
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && videos.length === 0 && (
        <Card className="card-elevated">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Video className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">Enter a YouTube channel ID above to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
