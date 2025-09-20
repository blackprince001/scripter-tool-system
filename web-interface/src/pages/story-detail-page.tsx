"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  CheckCircle,
  Edit,
  Save,
  X,
  Calendar,
  Folder
} from "lucide-react"
import { updateStory, finalizeStory, fetchProjects, fetchUsers, Story, Project, User as UserType, fetchStory } from "../api/api"

export default function StoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [story, setStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<UserType[]>([])
  const [loadingMeta, setLoadingMeta] = useState(true)

  // Edit form state
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")

  // Finalize form state
  const [finalizeData, setFinalizeData] = useState({
    project_slug: "",
    assignee_username: "",
    task_title: "",
    task_description: ""
  })

  useEffect(() => {
    if (id)
    {
      loadStory()
    }
    loadMetadata()
  }, [id])

  const loadMetadata = async () => {
    setLoadingMeta(true)
    try
    {
      const [projectsData, usersData] = await Promise.all([
        fetchProjects(),
        fetchUsers()
      ])
      setProjects(projectsData)
      setUsers(usersData)
    } catch (err)
    {
      console.error("Failed to load metadata:", err)
      setError("Failed to load projects and users")
    } finally
    {
      setLoadingMeta(false)
    }
  }

  const loadStory = async () => {
    if (!id) return

    setLoading(true)
    setError(null)
    try
    {
      const storyData = await fetchStory(id)
      setStory(storyData)
      setEditTitle(storyData.title)
      setEditContent(storyData.content)
    } catch (err)
    {
      setError("Failed to load story")
      console.error("Error loading story:", err)
    } finally
    {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!story) return

    setSaving(true)
    setError(null)
    try
    {
      const updatedStory = await updateStory(story.id, {
        title: editTitle,
        content: editContent
      })
      setStory(updatedStory)
      setEditing(false)
      setSuccess("Story updated successfully")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err)
    {
      setError("Failed to update story")
      console.error("Error updating story:", err)
    } finally
    {
      setSaving(false)
    }
  }

  const handleFinalize = async () => {
    if (!story || !finalizeData.project_slug || !finalizeData.assignee_username)
    {
      setError("Please fill in project slug and assignee username")
      return
    }

    setFinalizing(true)
    setError(null)
    try
    {
      const finalizedStory = await finalizeStory(story.id, {
        project_slug: finalizeData.project_slug,
        assignee_username: finalizeData.assignee_username,
        task_title: finalizeData.task_title || undefined,
        task_description: finalizeData.task_description || undefined
      })
      setStory(finalizedStory)
      setSuccess("Story finalized and task created successfully!")
      setTimeout(() => setSuccess(null), 5000)
    } catch (err)
    {
      setError("Failed to finalize story")
      console.error("Error finalizing story:", err)
    } finally
    {
      setFinalizing(false)
    }
  }

  const cancelEdit = () => {
    if (story)
    {
      setEditTitle(story.title)
      setEditContent(story.content)
    }
    setEditing(false)
  }

  if (loading)
  {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <Skeleton className="h-10 w-32 mb-4" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
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
      </div>
    )
  }

  if (!story)
  {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert>
          <AlertDescription>Story not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-3xl font-bold">Story Details</h1>
          <Badge variant={story.status === "finalized" ? "default" : "secondary"}>
            {story.status}
          </Badge>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Created: {new Date(story.created_at).toLocaleDateString()}
          </div>
          {story.updated_at && (
            <div className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Updated: {new Date(story.updated_at).toLocaleDateString()}
            </div>
          )}
          {story.project_id && (
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Project ID: {story.project_id}
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Story Content */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {editing ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-xl font-bold"
              />
            ) : (
              story.title
            )}
          </CardTitle>

          {!editing && story.status === "draft" && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          )}

          {editing && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={cancelEdit}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {editing ? (
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[300px] resize-none"
            />
          ) : (
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{story.content}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Finalize Section */}
      {story.status === "draft" && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Finalize Story & Create Task
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Metadata Loading Error */}
            {!loadingMeta && (projects.length === 0 || users.length === 0) && (
              <Alert>
                <AlertDescription>
                  {projects.length === 0 && users.length === 0
                    ? "No projects or users available. Please ensure your channel management database is properly set up."
                    : projects.length === 0
                      ? "No projects available. Please create a project in your channel management system first."
                      : "No users available. Please create users in your channel management system first."}
                </AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="project_slug">Project *</Label>
                {loadingMeta ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    value={finalizeData.project_slug}
                    onValueChange={(value) => setFinalizeData(prev => ({ ...prev, project_slug: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project..." />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.length === 0 ? (
                        <SelectItem value="" disabled>
                          No projects available
                        </SelectItem>
                      ) : (
                        projects.map((project) => (
                          <SelectItem key={project.id} value={project.slug}>
                            {project.name} ({project.slug})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>
                <Label htmlFor="assignee_username">Assignee *</Label>
                {loadingMeta ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    value={finalizeData.assignee_username}
                    onValueChange={(value) => setFinalizeData(prev => ({ ...prev, assignee_username: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an assignee..." />
                    </SelectTrigger>
                    <SelectContent>
                      {users.length === 0 ? (
                        <SelectItem value="" disabled>
                          No users available
                        </SelectItem>
                      ) : (
                        users.map((user) => (
                          <SelectItem key={user.id} value={user.username}>
                            {user.username}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="task_title">Task Title (Optional)</Label>
              <Input
                id="task_title"
                value={finalizeData.task_title}
                onChange={(e) => setFinalizeData(prev => ({ ...prev, task_title: e.target.value }))}
                placeholder="Leave empty to use story title"
              />
            </div>

            <div>
              <Label htmlFor="task_description">Task Description (Optional)</Label>
              <Textarea
                id="task_description"
                value={finalizeData.task_description}
                onChange={(e) => setFinalizeData(prev => ({ ...prev, task_description: e.target.value }))}
                placeholder="Leave empty to use story content"
                rows={3}
              />
            </div>

            {/* Selection Info */}
            {finalizeData.project_slug && finalizeData.assignee_username && (
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium text-sm mb-2">Task will be created with:</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>
                    <strong>Project:</strong> {projects.find(p => p.slug === finalizeData.project_slug)?.name || finalizeData.project_slug}
                  </div>
                  <div>
                    <strong>Assignee:</strong> {finalizeData.assignee_username}
                  </div>
                  <div>
                    <strong>Task Title:</strong> {finalizeData.task_title || `Story: ${story?.title}`}
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleFinalize}
              disabled={finalizing || loadingMeta || !finalizeData.project_slug || !finalizeData.assignee_username}
              className="w-full"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {loadingMeta ? "Loading..." : finalizing ? "Finalizing..." : "Finalize Story & Create Task"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Finalized Status */}
      {story.status === "finalized" && (
        <Card className="mt-6 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Story Finalized
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">
              This story has been finalized and a task has been created in the channel management project.
            </p>
            {story.project_id && (
              <p className="text-sm text-green-600 mt-2">
                Project ID: {story.project_id}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
