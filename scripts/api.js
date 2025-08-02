class MovieAPI {
    constructor() {
        this.baseURL = 'https://api.themoviedb.org/3';
        this.apiKey = this.getApiKey();
        this.imageBaseURL = 'https://image.tmdb.org/t/p/';
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000;
    }

    getApiKey() {
        return window?.TMDB_API_KEY || 
               localStorage.getItem('tmdb_api_key') ||
               '079f0ba47ae5ef01bae156e5a0c7e059'; 
    }

    async makeRequest(endpoint, params = {}) {
        // Create cache key
        const cacheKey = `${endpoint}_${JSON.stringify(params)}`;
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
            this.cache.delete(cacheKey);
        }

        // Add API key to parameters
        const searchParams = new URLSearchParams({
            api_key: this.apiKey,
            ...params
        });

        const url = `${this.baseURL}${endpoint}?${searchParams}`;

        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw new Error(`Failed to fetch data: ${error.message}`);
        }
    }

    async getTrending(mediaType = 'movie', timeWindow = 'day') {
        return this.makeRequest(`/trending/${mediaType}/${timeWindow}`);
    }

    async getPopular(page = 1) {
        return this.makeRequest('/movie/popular', { page });
    }

    async getTopRated(page = 1) {
        return this.makeRequest('/movie/top_rated', { page });
    }

    async getUpcoming(page = 1) {
        return this.makeRequest('/movie/upcoming', { page });
    }

    async getNowPlaying(page = 1) {
        return this.makeRequest('/movie/now_playing', { page });
    }

    async getMoviesByGenre(genreId, page = 1) {
        return this.makeRequest('/discover/movie', {
            with_genres: genreId,
            page,
            sort_by: 'popularity.desc'
        });
    }

    async getTVShowsByGenre(genreId, page = 1) {
        return this.makeRequest('/discover/tv', {
            with_genres: genreId,
            page,
            sort_by: 'popularity.desc'
        });
    }

    async searchMovies(query, page = 1) {
        if (!query.trim()) {
            throw new Error('Search query cannot be empty');
        }
        return this.makeRequest('/search/movie', { query, page });
    }

    async searchTV(query, page = 1) {
        if (!query.trim()) {
            throw new Error('Search query cannot be empty');
        }
        return this.makeRequest('/search/tv', { query, page });
    }

    async searchMulti(query, page = 1) {
        if (!query.trim()) {
            throw new Error('Search query cannot be empty');
        }
        return this.makeRequest('/search/multi', { query, page });
    }

    async getMovieDetails(movieId) {
        return this.makeRequest(`/movie/${movieId}`, {
            append_to_response: 'videos,credits,similar,reviews'
        });
    }

    async getTVDetails(tvId) {
        return this.makeRequest(`/tv/${tvId}`, {
            append_to_response: 'videos,credits,similar,reviews'
        });
    }

    async getMovieCredits(movieId) {
        return this.makeRequest(`/movie/${movieId}/credits`);
    }

    async getTVCredits(tvId) {
        return this.makeRequest(`/tv/${tvId}/credits`);
    }

    async getPersonDetails(personId) {
        return this.makeRequest(`/person/${personId}`, {
            append_to_response: 'movie_credits,tv_credits'
        });
    }

    async getMovieGenres() {
        return this.makeRequest('/genre/movie/list');
    }

    async getTVGenres() {
        return this.makeRequest('/genre/tv/list');
    }

    // Advanced filtering
    async getFilteredMovies(filters, page = 1) {
        const params = { page, sort_by: 'popularity.desc' };

        if (filters.genre) {
            params.with_genres = filters.genre;
        }

        if (filters.year) {
            params.primary_release_year = filters.year;
        }

        if (filters.rating) {
            params['vote_average.gte'] = filters.rating;
        }

        if (filters.language) {
            params.with_original_language = filters.language;
        }

        if (filters.region) {
            params.region = filters.region;
        }

        if (filters.actor) {
            params.with_cast = filters.actor;
        }

        if (filters.director) {
            params.with_crew = filters.director;
        }

        return this.makeRequest('/discover/movie', params);
    }

    async getFilteredTV(filters, page = 1) {
        const params = { page, sort_by: 'popularity.desc' };

        if (filters.genre) {
            params.with_genres = filters.genre;
        }

        if (filters.year) {
            params.first_air_date_year = filters.year;
        }

        if (filters.rating) {
            params['vote_average.gte'] = filters.rating;
        }

        if (filters.language) {
            params.with_original_language = filters.language;
        }

        return this.makeRequest('/discover/tv', params);
    }

    // Get movies by region (Bollywood, Hollywood, Tollywood)
    async getBollywoodMovies(page = 1) {
        return this.makeRequest('/discover/movie', {
            with_original_language: 'hi',
            region: 'IN',
            page,
            sort_by: 'popularity.desc'
        });
    }

    async getTollywoodMovies(page = 1) {
        return this.makeRequest('/discover/movie', {
            with_original_language: 'te',
            region: 'IN',
            page,
            sort_by: 'popularity.desc'
        });
    }

    async getHollywoodMovies(page = 1) {
        return this.makeRequest('/discover/movie', {
            with_original_language: 'en',
            region: 'US',
            page,
            sort_by: 'popularity.desc'
        });
    }

    // Get movies by specific actors
    async getMoviesByActor(actorId, page = 1) {
        return this.makeRequest('/discover/movie', {
            with_cast: actorId,
            page,
            sort_by: 'popularity.desc'
        });
    }

    // Search for actors
    async searchActors(query, page = 1) {
        return this.makeRequest('/search/person', { query, page });
    }

    // Get actor's movie credits
    async getActorMovies(actorId) {
        const person = await this.getPersonDetails(actorId);
        return person.movie_credits;
    }

    // Get similar movies
    async getSimilarMovies(movieId, page = 1) {
        return this.makeRequest(`/movie/${movieId}/similar`, { page });
    }

    // Get movie reviews
    async getMovieReviews(movieId, page = 1) {
        return this.makeRequest(`/movie/${movieId}/reviews`, { page });
    }

    // Get movie videos (trailers, teasers, etc.)
    async getMovieVideos(movieId) {
        return this.makeRequest(`/movie/${movieId}/videos`);
    }

    // Utility methods for image URLs
    getPosterURL(posterPath, size = 'w500') {
        if (!posterPath) return null;
        return `${this.imageBaseURL}${size}${posterPath}`;
    }

    getBackdropURL(backdropPath, size = 'w1280') {
        if (!backdropPath) return null;
        return `${this.imageBaseURL}${size}${backdropPath}`;
    }

    getProfileURL(profilePath, size = 'w185') {
        if (!profilePath) return null;
        return `${this.imageBaseURL}${size}${profilePath}`;
    }

    // Get configuration (image sizes, etc.)
    async getConfiguration() {
        return this.makeRequest('/configuration');
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
    }

    // Get cache stats
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }

    // Advanced search with multiple filters
    async advancedSearch(options = {}) {
        const {
            query,
            type = 'movie', // 'movie', 'tv', 'person', 'multi'
            page = 1,
            includeAdult = false,
            year,
            region
        } = options;

        const params = { query, page, include_adult: includeAdult };

        if (year) params.year = year;
        if (region) params.region = region;

        return this.makeRequest(`/search/${type}`, params);
    }

    // Get trending by specific time window and media type
    async getTrendingWithOptions(options = {}) {
        const {
            mediaType = 'all', // 'movie', 'tv', 'person', 'all'
            timeWindow = 'day', // 'day', 'week'
            page = 1
        } = options;

        return this.makeRequest(`/trending/${mediaType}/${timeWindow}`, { page });
    }

    // Get movies by language
    async getMoviesByLanguage(language, page = 1) {
        return this.makeRequest('/discover/movie', {
            with_original_language: language,
            page,
            sort_by: 'popularity.desc'
        });
    }

    // Get movies by release date range
    async getMoviesByDateRange(startDate, endDate, page = 1) {
        return this.makeRequest('/discover/movie', {
            'primary_release_date.gte': startDate,
            'primary_release_date.lte': endDate,
            page,
            sort_by: 'popularity.desc'
        });
    }

    // Get high-rated movies (above specific rating)
    async getHighRatedMovies(minRating = 8.0, page = 1) {
        return this.makeRequest('/discover/movie', {
            'vote_average.gte': minRating,
            'vote_count.gte': 1000, // Ensure movies have enough votes
            page,
            sort_by: 'vote_average.desc'
        });
    }

    // Error handling wrapper
    async safeRequest(requestFunc, fallbackData = null) {
        try {
            return await requestFunc();
        } catch (error) {
            console.error('API request failed:', error);
            if (fallbackData) {
                return fallbackData;
            }
            throw error;
        }
    }

    // Batch requests for multiple endpoints
    async batchRequests(requests) {
        try {
            const promises = requests.map(request => this.makeRequest(request.endpoint, request.params));
            const results = await Promise.allSettled(promises);
            
            return results.map((result, index) => ({
                request: requests[index],
                success: result.status === 'fulfilled',
                data: result.status === 'fulfilled' ? result.value : null,
                error: result.status === 'rejected' ? result.reason : null
            }));
        } catch (error) {
            console.error('Batch request failed:', error);
            throw error;
        }
    }
}

// Create global instance
const movieAPI = new MovieAPI();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MovieAPI;
}
