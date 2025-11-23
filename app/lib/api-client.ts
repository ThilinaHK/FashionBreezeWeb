// Optimized API client with caching and retry logic
class ApiClient {
  private cache = new Map();
  private readonly baseURL = '';
  
  private async fetchWithRetry(url: string, options: RequestInit = {}, retries = 2): Promise<Response> {
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });
        
        if (response.ok) {
          return response;
        }
        
        if (i === retries) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        if (i === retries) {
          throw error;
        }
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    
    throw new Error('Max retries exceeded');
  }
  
  async get(endpoint: string, useCache = true) {
    const cacheKey = `GET:${endpoint}`;
    
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 300000) { // 5 minutes cache
        return cached.data;
      }
    }
    
    try {
      const response = await this.fetchWithRetry(`${this.baseURL}${endpoint}`);
      const data = await response.json();
      
      if (useCache) {
        this.cache.set(cacheKey, { data, timestamp: Date.now() });
      }
      
      return data;
    } catch (error) {
      console.error(`API GET error for ${endpoint}:`, error);
      
      // Return cached data if available, even if expired
      if (this.cache.has(cacheKey)) {
        console.log('Returning stale cached data due to error');
        return this.cache.get(cacheKey).data;
      }
      
      throw error;
    }
  }
  
  async post(endpoint: string, data: any) {
    try {
      const response = await this.fetchWithRetry(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      // Clear related cache entries
      this.clearCacheByPattern(endpoint.split('/')[1]);
      
      return await response.json();
    } catch (error) {
      console.error(`API POST error for ${endpoint}:`, error);
      throw error;
    }
  }
  
  async put(endpoint: string, data: any) {
    try {
      const response = await this.fetchWithRetry(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      
      this.clearCacheByPattern(endpoint.split('/')[1]);
      
      return await response.json();
    } catch (error) {
      console.error(`API PUT error for ${endpoint}:`, error);
      throw error;
    }
  }
  
  async delete(endpoint: string) {
    try {
      const response = await this.fetchWithRetry(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
      });
      
      this.clearCacheByPattern(endpoint.split('/')[1]);
      
      return await response.json();
    } catch (error) {
      console.error(`API DELETE error for ${endpoint}:`, error);
      throw error;
    }
  }
  
  private clearCacheByPattern(pattern: string) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
  
  clearCache() {
    this.cache.clear();
  }
}

export const apiClient = new ApiClient();