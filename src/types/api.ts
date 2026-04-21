export interface ApiError {
  response?: { data?: { error?: { detail?: string } } }
  message?: string
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  return (err as ApiError)?.response?.data?.error?.detail || fallback
}
