/// <reference types="vite/client" />
const API_BASE = import.meta.env.VITE_API_BASE || "https://scripter-tool-system-api.fly.dev";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (!response.ok) {
    let errorMessage: string;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || JSON.stringify(errorData);
    } catch (e) {
      errorMessage = await response.text();
    }
    throw new ApiError(response.status, errorMessage || response.statusText);
  }

  if (response.status === 204 || response.headers.get("Content-Length") === "0") {
    return undefined as T;
  }

  return response.json();
}

export type Video = {
  video_id: string;
  title: string;
  published_at: string;
  thumbnail: string;
};

export type ChannelVideosResponse = {
  channel_id: string;
  total_videos: number;
  videos: Video[];
};

export type Category = {
  name: string;
};

export type Transcript = {
  _id: string;
  video_id: string;
  title: string;
  transcript: string;
  category: string;
  sanitized_category: string;
  created_at: string;
  metadata?: Record<string, any>;
};

export type TranscriptProcessResponse = {
  status: string;
  video_id: string;
  category: string;
  auto_generated: boolean;
};

export type CategoryWeight = {
  name: string;
  weight: number;
};

export type GeneratedStoryResponse = {
  variations: string[];
  created_at?: string;
};

export type Story = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
};

export async function fetchChannelVideos(channelId: string, maxResults = 20, order = "date"): Promise<ChannelVideosResponse> {
  const params = new URLSearchParams({ max_results: String(maxResults), order });
  return apiRequest(`/youtube/channel/${channelId}/videos?${params.toString()}`);
}


export async function fetchCategories(): Promise<Category[]> {
  return apiRequest(`/categories/`);
}

export async function processTranscript(url: string, category?: string, autoCategorize = true): Promise<TranscriptProcessResponse> {
  const params = new URLSearchParams({ url, auto_categorize: String(autoCategorize) });
  if (category) params.append("category", category);
  return apiRequest(`/transcripts/process`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
}

export async function fetchTranscript(videoId: string, category?: string): Promise<Transcript> {
  const params = new URLSearchParams();
  if (category) {
    params.append("category", category);
  }
  const queryString = params.toString();
  return apiRequest(`/transcripts/${videoId}${queryString ? `?${queryString}` : ""}`);
}

export async function fetchTranscriptsByCategory(category: string, limit = 20): Promise<{ category: string; total_transcripts: number; material: string[]; video_ids: string[] }> {
  const params = new URLSearchParams({ limit: String(limit) });
  return apiRequest(`/transcripts/by-category/${encodeURIComponent(category)}?${params.toString()}`);
}

export async function deleteTranscript(videoId: string, category: string): Promise<void> {
  const params = new URLSearchParams({ category });
  await apiRequest(`/transcripts/${videoId}?${params.toString()}`, { method: "DELETE" });
}

export async function generateStory(data: {
  category_weights: CategoryWeight[];

  variations_count: number;
  style: string;
  material_per_category: number;
  length: number;
}): Promise<GeneratedStoryResponse> {
  return apiRequest(`/generate/story`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function generateStoryFromTranscripts(data: {
  transcript_ids: string[];
  variations_count: number;
  style: string;
  length: number;
}): Promise<GeneratedStoryResponse> {
  return apiRequest(`/generate/story-from-transcripts`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function generateStoryFromSynopsis(data: {
  story: string;
  variations_count: number;
  style: string;
  length: number;
}): Promise<GeneratedStoryResponse> {
  return apiRequest(`/generate/story-from-synopsis`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}


export async function fetchStory(storyId: string): Promise<Story> {
  return apiRequest(`/stories/${storyId}`);
}

export async function deleteStory(storyId: string): Promise<void> {
  await apiRequest(`/stories/${storyId}`, { method: "DELETE" });
}

export async function createStory(data: { title: string; content: string }): Promise<Story> {
  return apiRequest(`/stories/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateStory(storyId: string, data: { title?: string; content?: string }): Promise<Story> {
  return apiRequest(`/stories/${storyId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
