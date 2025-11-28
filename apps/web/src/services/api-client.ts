/**
 * API Client service
 * Centralized HTTP client for making API requests
 * Automatically handles JWT token management and refresh
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Log API URL on module load (for debugging)
if (typeof window !== 'undefined') {
  console.log('[API Client] Initialized with API URL:', API_URL);
}

// Storage keys for tokens
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number>;
  skipAuth?: boolean; // Skip adding auth header (for login/register endpoints)
}

interface RefreshTokenResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: unknown;
  };
  error?: string;
}

class ApiClient {
  private baseUrl: string;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get access token from localStorage
   */
  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  /**
   * Get refresh token from localStorage
   */
  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Set access token in localStorage
   */
  public setAccessToken(token: string | null): void {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  }

  /**
   * Set refresh token in localStorage
   */
  public setRefreshToken(token: string | null): void {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }

  /**
   * Set both tokens (used after login/refresh)
   */
  public setTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  }

  /**
   * Clear all tokens (logout)
   */
  public clearTokens(): void {
    this.setAccessToken(null);
    this.setRefreshToken(null);
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<string | null> {
    // If already refreshing, return the existing promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          // Refresh failed, clear tokens
          this.clearTokens();
          return null;
        }

        const data: RefreshTokenResponse = await response.json();

        if (data.success && data.data) {
          // Update tokens
          this.setTokens(data.data.accessToken, data.data.refreshToken);
          return data.data.accessToken;
        }

        // Refresh failed, clear tokens
        this.clearTokens();
        return null;
      } catch (error) {
        console.error('Error refreshing token:', error);
        this.clearTokens();
        return null;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number>): string {
    const url = new URL(endpoint, this.baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    
    return url.toString();
  }

  /**
   * Make HTTP request with automatic token refresh on 401
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
    retryCount: number = 0
  ): Promise<T> {
    const { params, headers = {}, skipAuth = false, ...fetchOptions } = options;

    const url = this.buildUrl(endpoint, params);

    // Build headers
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(headers as Record<string, string>),
    };

    // Add Authorization header if token exists and not skipping auth
    if (!skipAuth) {
      const accessToken = this.getAccessToken();
      if (accessToken) {
        defaultHeaders['Authorization'] = `Bearer ${accessToken}`;
      }
    }

    try {
      console.log(`[API Client] Making ${fetchOptions.method || 'GET'} request to:`, url);
      console.log('[API Client] Request options:', {
        method: fetchOptions.method || 'GET',
        headers: defaultHeaders,
        body: fetchOptions.body,
      });

      const response = await fetch(url, {
        ...fetchOptions,
        headers: defaultHeaders,
      });

      console.log('[API Client] Response status:', response.status, response.statusText);
      console.log('[API Client] Response headers:', Object.fromEntries(response.headers.entries()));

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && !skipAuth && retryCount === 0) {
        const newAccessToken = await this.refreshAccessToken();
        
        if (newAccessToken) {
          // Retry the request with new token
          return this.request<T>(endpoint, options, retryCount + 1);
        } else {
          // Refresh failed, throw error
          const errorData = await response.json().catch(() => ({
            error: 'Authentication failed. Please login again.',
          }));
          throw new Error(errorData.error || 'Authentication failed');
        }
      }

      if (!response.ok) {
        // Try to get error response body
        let errorData;
        try {
          const text = await response.text();
          console.error('[API Client] Error response body:', text);
          errorData = text ? JSON.parse(text) : { error: `HTTP error! status: ${response.status}` };
        } catch (parseError) {
          errorData = {
            error: `HTTP error! status: ${response.status} ${response.statusText}`,
          };
        }
        
        console.error('[API Client] Error data:', errorData);
        
        // Create error with full details
        const error = new Error(errorData.error || `HTTP error! status: ${response.status}`) as Error & {
          details?: unknown;
          status?: number;
        };
        error.details = errorData.details;
        error.status = response.status;
        throw error;
      }

      const responseData = await response.json();
      console.log('[API Client] Response data:', responseData);
      return responseData;
    } catch (error) {
      console.error('[API Client] Request failed:', error);
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        const errorMessage = `Unable to connect to the API server at ${this.baseUrl}. ` +
          `Please make sure the API server is running. ` +
          `Full URL attempted: ${url}`;
        console.error('[API Client] Connection error:', errorMessage);
        throw new Error(errorMessage);
      }
      if (error instanceof Error) {
        console.error('[API Client] Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
        throw error;
      }
      console.error('[API Client] Unexpected error:', error);
      throw new Error('An unexpected error occurred');
    }
  }

  /**
   * GET request
   */
  public async get<T>(endpoint: string, params?: Record<string, string | number>, skipAuth?: boolean): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      params,
      skipAuth,
    });
  }

  /**
   * POST request
   */
  public async post<T>(endpoint: string, data?: unknown, skipAuth?: boolean): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth,
    });
  }

  /**
   * PUT request
   */
  public async put<T>(endpoint: string, data?: unknown, skipAuth?: boolean): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      skipAuth,
    });
  }

  /**
   * PATCH request
   */
  public async patch<T>(endpoint: string, data?: unknown, skipAuth?: boolean): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      skipAuth,
    });
  }

  /**
   * DELETE request
   */
  public async delete<T>(endpoint: string, skipAuth?: boolean): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      skipAuth,
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;

