"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Clock } from "lucide-react"

type Transcript = {
  id: string
  title: string
  category: string
  preview: string
  duration?: string
}

type Props = {
  transcripts: Transcript[]
  onSelect: (id: string) => void
}

export default function TranscriptList({ transcripts, onSelect }: Props) {
  if (transcripts.length === 0)
  {
    return (
      <Card className="card-elevated">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No transcripts available. Process some videos to get started.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {transcripts.map((transcript) => (
        <Card
          key={transcript.id}
          className="card-interactive hover-lift cursor-pointer"
          onClick={() => onSelect(transcript.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-2 line-clamp-2">{transcript.title}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {transcript.category}
                  </Badge>
                  {transcript.duration && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {transcript.duration}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{transcript.preview}</p>
              </div>
              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
