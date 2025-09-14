// web-interface/src/utils/storage.ts
export class StorageManager {
  private static readonly PREFIX = 'scripter_tool_'
  
  static setItem(key: string, value: any, ttl?: number): void {
    const item = {
      value,
      timestamp: Date.now(),
      ttl: ttl || null
    }
    localStorage.setItem(`${this.PREFIX}${key}`, JSON.stringify(item))
  }
  
  static getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(`${this.PREFIX}${key}`)
      if (!item) return null
      
      const parsed = JSON.parse(item)
      
      // Check if item has expired
      if (parsed.ttl && Date.now() - parsed.timestamp > parsed.ttl) {
        this.removeItem(key)
        return null
      }
      
      return parsed.value
    } catch {
      return null
    }
  }
  
  static removeItem(key: string): void {
    localStorage.removeItem(`${this.PREFIX}${key}`)
  }
  
  static clear(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.PREFIX))
      .forEach(key => localStorage.removeItem(key))
  }
  
  // Specific methods for our app
  static setChannelData(channelId: string, data: any): void {
    this.setItem(`channel_${channelId}`, data, 24 * 60 * 60 * 1000) // 24 hours
  }
  
  static getChannelData(channelId: string): any {
    return this.getItem(`channel_${channelId}`)
  }
  
  static setProcessingStatus(videoId: string, status: any): void {
    this.setItem(`processing_${videoId}`, status, 60 * 60 * 1000) // 1 hour
  }
  
  static getProcessingStatus(videoId: string): any {
    return this.getItem(`processing_${videoId}`)
  }
  
  static addActivity(activity: any): void {
    const activities = Array.isArray(this.getItem('recentActivity')) ? this.getItem('recentActivity') as any[] : [];
    activities.unshift({
      ...activity,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    })
    
    // Keep only last 50 activities
    this.setItem('recentActivity', activities.slice(0, 50))
  }
  
  static updateStats(stats: { totalVideos?: number; processedVideos?: number }): void {
    const currentStats = this.getItem('stats') || { totalVideos: 0, processedVideos: 0 }
    const newStats = { ...currentStats, ...stats }
    this.setItem('stats', newStats)
    
    // Update individual counters
    if (stats.totalVideos !== undefined) {
      this.setItem('totalVideos', stats.totalVideos)
    }
    if (stats.processedVideos !== undefined) {
      this.setItem('processedVideos', stats.processedVideos)
    }
  }
}