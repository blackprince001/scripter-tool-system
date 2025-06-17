"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Play } from "lucide-react"

type Video = {
  id: string
  title: string
  publishedAt: string
  thumbnail: string
  duration?: string
  viewCount?: string
}

type Props = {
  videos: Video[]
  onSelect: (videoId: string) => void
}

export default function VideoList({ videos, onSelect }: Props) {
  if (videos.length === 0)
  {
    return (
      <Card className="card-elevated">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Play className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">No videos found. Try fetching from a different channel.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid-responsive">
      {videos.map((video) => (
        <Card
          key={video.id}
          className="card-interactive hover-lift cursor-pointer overflow-hidden"
          onClick={() => onSelect(video.id)}
        >
          <div className="relative">
            <img src={video.thumbnail || "/placeholder.svg"} alt={video.title} className="w-full h-48 object-cover" />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
              <Play className="h-8 w-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
            </div>
            {video.duration && (
              <Badge className="absolute bottom-2 right-2 bg-black/80 text-white">{video.duration}</Badge>
            )}
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-2 line-clamp-2">{video.title}</h3>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(video.publishedAt).toLocaleDateString()}
              </div>
              {video.viewCount && <span>{video.viewCount} views</span>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
