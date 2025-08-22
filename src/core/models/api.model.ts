export interface ApiResponse<T> {
    data: T
    success: boolean
    message?: string
    timestamp: string
  }
  export interface ApiError {
    error: string
    message: string
    status: number
    timestamp: string
    requestId: string
  }