// Wishlist Management System
class WishlistManager {
    constructor() {
        this.storageKey = 'cineverse_watchlist';
        this.wishlist = this.loadWishlist();
        this.observers = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateWishlistUI();
    }

    setupEventListeners() {
        // Listen for storage changes (sync across tabs)
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey) {
                this.wishlist = this.loadWishlist();
                this.notifyObservers();
                this.updateWishlistUI();
            }
        });

        // Listen for visibility change to refresh data
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.refreshWishlist();
            }
        });
    }

    // Load wishlist from localStorage
    loadWishlist() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading wishlist:', error);
            return [];
        }
    }

    // Save wishlist to localStorage
    saveWishlist() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.wishlist));
            this.notifyObservers();
            return true;
        } catch (error) {
            console.error('Error saving wishlist:', error);
            this.showError('Failed to save to wishlist. Storage might be full.');
            return false;
        }
    }

    // Add movie to wishlist
    async addToWishlist(movieId) {
        try {
            // Check if already in wishlist
            if (this.isInWishlist(movieId)) {
                this.showNotification('Already in your watchlist!', 'info');
                return false;
            }

            // Fetch movie details
            const movieDetails = await movieAPI.getMovieDetails(movieId);
            
            // Create wishlist item
            const wishlistItem = {
                id: movieDetails.id,
                title: movieDetails.title,
                poster_path: movieDetails.poster_path,
                backdrop_path: movieDetails.backdrop_path,
                overview: movieDetails.overview,
                release_date: movieDetails.release_date,
                vote_average: movieDetails.vote_average,
                genre_ids: movieDetails.genres.map(g => g.id),
                genres: movieDetails.genres,
                runtime: movieDetails.runtime,
                addedAt: new Date().toISOString(),
                watched: false,
                rating: null,
                notes: '',
                favorite: false
            };

            // Add to wishlist
            this.wishlist.unshift(wishlistItem);
            
            // Save and update UI
            if (this.saveWishlist()) {
                this.showNotification('Added to watchlist!', 'success');
                this.updateWishlistUI();
                this.updateWishlistButtons(movieId, true);
                
                // Animate the addition
                this.animateWishlistAdd();
                
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            this.showError('Failed to add to watchlist. Please try again.');
            return false;
        }
    }

    // Remove movie from wishlist
    removeFromWishlist(movieId) {
        const index = this.wishlist.findIndex(item => item.id === movieId);
        
        if (index !== -1) {
            const removedItem = this.wishlist[index];
            this.wishlist.splice(index, 1);
            
            if (this.saveWishlist()) {
                this.showNotification('Removed from watchlist!', 'success');
                this.updateWishlistUI();
                this.updateWishlistButtons(movieId, false);
                
                // Animate the removal
                this.animateWishlistRemove(index);
                
                return true;
            }
        }
        
        return false;
    }

    // Check if movie is in wishlist
    isInWishlist(movieId) {
        return this.wishlist.some(item => item.id === movieId);
    }

    // Get wishlist
    getWishlist() {
        return [...this.wishlist]; // Return copy
    }

    // Get wishlist item by ID
    getWishlistItem(movieId) {
        return this.wishlist.find(item => item.id === movieId);
    }

    // Update movie in wishlist (rating, notes, etc.)
    updateWishlistItem(movieId, updates) {
        const index = this.wishlist.findIndex(item => item.id === movieId);
        
        if (index !== -1) {
            this.wishlist[index] = { ...this.wishlist[index], ...updates };
            this.saveWishlist();
            this.updateWishlistUI();
            return true;
        }
        
        return false;
    }

    // Mark as watched/unwatched
    toggleWatched(movieId) {
        const item = this.getWishlistItem(movieId);
        if (item) {
            const newWatchedStatus = !item.watched;
            this.updateWishlistItem(movieId, { 
                watched: newWatchedStatus,
                watchedAt: newWatchedStatus ? new Date().toISOString() : null
            });
            
            this.showNotification(
                newWatchedStatus ? 'Marked as watched!' : 'Marked as unwatched!',
                'success'
            );
            
            return newWatchedStatus;
        }
        return false;
    }

    // Toggle favorite status
    toggleFavorite(movieId) {
        const item = this.getWishlistItem(movieId);
        if (item) {
            const newFavoriteStatus = !item.favorite;
            this.updateWishlistItem(movieId, { favorite: newFavoriteStatus });
            
            this.showNotification(
                newFavoriteStatus ? 'Added to favorites!' : 'Removed from favorites!',
                'success'
            );
            
            return newFavoriteStatus;
        }
        return false;
    }

    // Rate movie
    rateMovie(movieId, rating) {
        if (rating < 1 || rating > 10) {
            this.showError('Rating must be between 1 and 10');
            return false;
        }

        this.updateWishlistItem(movieId, { 
            rating: rating,
            ratedAt: new Date().toISOString()
        });
        
        this.showNotification(`Rated ${rating}/10!`, 'success');
        return true;
    }

    // Add notes
    addNotes(movieId, notes) {
        this.updateWishlistItem(movieId, { 
            notes: notes,
            notesUpdatedAt: new Date().toISOString()
        });
        
        this.showNotification('Notes saved!', 'success');
        return true;
    }

    // Search within wishlist
    searchWishlist(query) {
        if (!query.trim()) {
            return this.getWishlist();
        }

        const lowercaseQuery = query.toLowerCase();
        return this.wishlist.filter(item => {
            return item.title.toLowerCase().includes(lowercaseQuery) ||
                   item.overview.toLowerCase().includes(lowercaseQuery) ||
                   item.genres.some(genre => genre.name.toLowerCase().includes(lowercaseQuery));
        });
    }

    // Filter wishlist
    filterWishlist(filters = {}) {
        let filtered = [...this.wishlist];

        // Filter by watched status
        if (filters.watched !== undefined) {
            filtered = filtered.filter(item => item.watched === filters.watched);
        }

        // Filter by favorite status
        if (filters.favorite !== undefined) {
            filtered = filtered.filter(item => item.favorite === filters.favorite);
        }

        // Filter by genre
        if (filters.genre) {
            filtered = filtered.filter(item => 
                item.genres.some(g => g.id === parseInt(filters.genre))
            );
        }

        // Filter by rating
        if (filters.minRating) {
            filtered = filtered.filter(item => 
                item.vote_average >= parseFloat(filters.minRating)
            );
        }

        // Filter by year
        if (filters.year) {
            filtered = filtered.filter(item => {
                if (!item.release_date) return false;
                const year = new Date(item.release_date).getFullYear();
                return year === parseInt(filters.year);
            });
        }

        return filtered;
    }

    // Sort wishlist
    sortWishlist(sortBy = 'addedAt', order = 'desc') {
        const sorted = [...this.wishlist];

        sorted.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case 'releaseDate':
                    aValue = new Date(a.release_date || 0);
                    bValue = new Date(b.release_date || 0);
                    break;
                case 'rating':
                    aValue = a.vote_average || 0;
                    bValue = b.vote_average || 0;
                    break;
                case 'addedAt':
                    aValue = new Date(a.addedAt);
                    bValue = new Date(b.addedAt);
                    break;
                case 'userRating':
                    aValue = a.rating || 0;
                    bValue = b.rating || 0;
                    break;
                default:
                    aValue = a.addedAt;
                    bValue = b.addedAt;
            }

            if (order === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

        return sorted;
    }

    // Get statistics
    getWishlistStats() {
        const total = this.wishlist.length;
        const watched = this.wishlist.filter(item => item.watched).length;
        const favorites = this.wishlist.filter(item => item.favorite).length;
        const rated = this.wishlist.filter(item => item.rating).length;
        
        const genreCount = {};
        this.wishlist.forEach(item => {
            item.genres.forEach(genre => {
                genreCount[genre.name] = (genreCount[genre.name] || 0) + 1;
            });
        });

        const averageRating = rated > 0 
            ? this.wishlist
                .filter(item => item.rating)
                .reduce((sum, item) => sum + item.rating, 0) / rated
            : 0;

        return {
            total,
            watched,
            unwatched: total - watched,
            favorites,
            rated,
            averageRating: averageRating.toFixed(1),
            topGenres: Object.entries(genreCount)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
        };
    }

    // Export wishlist
    exportWishlist() {
        try {
            const exportData = {
                exportDate: new Date().toISOString(),
                version: '1.0',
                wishlist: this.wishlist
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `cineverse-watchlist-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            this.showNotification('Wishlist exported successfully!', 'success');
            return true;
        } catch (error) {
            console.error('Export error:', error);
            this.showError('Failed to export wishlist');
            return false;
        }
    }

    // Import wishlist
    async importWishlist(file) {
        try {
            const text = await file.text();
            const importData = JSON.parse(text);
            
            if (!importData.wishlist || !Array.isArray(importData.wishlist)) {
                throw new Error('Invalid wishlist format');
            }

            // Merge with existing wishlist (avoid duplicates)
            const existingIds = new Set(this.wishlist.map(item => item.id));
            const newItems = importData.wishlist.filter(item => !existingIds.has(item.id));
            
            this.wishlist = [...this.wishlist, ...newItems];
            
            if (this.saveWishlist()) {
                this.showNotification(`Imported ${newItems.length} new items!`, 'success');
                this.updateWishlistUI();
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Import error:', error);
            this.showError('Failed to import wishlist. Invalid file format.');
            return false;
        }
    }

    // Clear entire wishlist
    clearWishlist() {
        if (confirm('Are you sure you want to clear your entire watchlist? This action cannot be undone.')) {
            this.wishlist = [];
            this.saveWishlist();
            this.updateWishlistUI();
            this.showNotification('Watchlist cleared!', 'info');
            return true;
        }
        return false;
    }

    // Update wishlist UI
    updateWishlistUI() {
        // Update wishlist count in navbar
        this.updateWishlistCount();
        
        // Update wishlist page if currently viewing
        if (window.cineVerse && window.cineVerse.currentSection === 'watchlist') {
            window.cineVerse.loadWatchlistContent();
        }
        
        // Update all wishlist buttons
        this.updateAllWishlistButtons();
    }

    updateWishlistCount() {
        const countElements = document.querySelectorAll('.wishlist-count');
        const count = this.wishlist.length;
        
        countElements.forEach(element => {
            element.textContent = count;
            element.style.display = count > 0 ? 'inline' : 'none';
        });
    }

    updateAllWishlistButtons() {
        const buttons = document.querySelectorAll('[data-movie-id]');
        buttons.forEach(button => {
            const movieId = parseInt(button.dataset.movieId);
            if (movieId) {
                this.updateWishlistButtons(movieId, this.isInWishlist(movieId));
            }
        });
    }

    updateWishlistButtons(movieId, isInWishlist) {
        const buttons = document.querySelectorAll(`[data-movie-id="${movieId}"] .action-btn`);
        
        buttons.forEach(button => {
            if (button.textContent.includes('Watchlist') || button.textContent.includes('Remove')) {
                if (isInWishlist) {
                    button.innerHTML = '<i class="fas fa-check"></i> In Watchlist';
                    button.classList.add('in-wishlist');
                } else {
                    button.innerHTML = '<i class="fas fa-plus"></i> Watchlist';
                    button.classList.remove('in-wishlist');
                }
            }
        });
    }

    // Animation methods
    animateWishlistAdd() {
        const wishlistIcon = document.querySelector('.nav-link[href="#watchlist"]');
        if (wishlistIcon) {
            wishlistIcon.style.transform = 'scale(1.2)';
            wishlistIcon.style.transition = 'transform 0.3s ease';
            
            setTimeout(() => {
                wishlistIcon.style.transform = 'scale(1)';
            }, 300);
        }
    }

    animateWishlistRemove(index) {
        const wishlistGrid = document.getElementById('watchlist-grid');
        if (wishlistGrid) {
            const cards = wishlistGrid.querySelectorAll('.movie-card');
            if (cards[index]) {
                cards[index].style.transform = 'scale(0)';
                cards[index].style.opacity = '0';
                cards[index].style.transition = 'all 0.3s ease';
            }
        }
    }

    // Observer pattern for UI updates
    addObserver(callback) {
        this.observers.push(callback);
    }

    removeObserver(callback) {
        const index = this.observers.indexOf(callback);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }

    notifyObservers() {
        this.observers.forEach(callback => {
            try {
                callback(this.getWishlist());
            } catch (error) {
                console.error('Observer callback error:', error);
            }
        });
    }

    // Refresh wishlist (re-fetch movie data)
    async refreshWishlist() {
        try {
            const refreshPromises = this.wishlist.map(async (item) => {
                try {
                    const updated = await movieAPI.getMovieDetails(item.id);
                    return {
                        ...item,
                        title: updated.title,
                        poster_path: updated.poster_path,
                        backdrop_path: updated.backdrop_path,
                        overview: updated.overview,
                        vote_average: updated.vote_average,
                        runtime: updated.runtime,
                        genres: updated.genres,
                        lastUpdated: new Date().toISOString()
                    };
                } catch (error) {
                    console.warn(`Failed to refresh movie ${item.id}:`, error);
                    return item; // Keep original if refresh fails
                }
            });

            const refreshedWishlist = await Promise.all(refreshPromises);
            this.wishlist = refreshedWishlist;
            this.saveWishlist();
            
        } catch (error) {
            console.error('Failed to refresh wishlist:', error);
        }
    }

    // Utility methods
    showNotification(message, type = 'info') {
        if (window.cineVerse && window.cineVerse.showNotification) {
            window.cineVerse.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    // Backup and restore
    createBackup() {
        const backup = {
            timestamp: new Date().toISOString(),
            wishlist: this.wishlist,
            version: '1.0'
        };
        
        localStorage.setItem(`${this.storageKey}_backup`, JSON.stringify(backup));
        this.showNotification('Backup created!', 'success');
    }

    restoreBackup() {
        try {
            const backup = localStorage.getItem(`${this.storageKey}_backup`);
            if (backup) {
                const backupData = JSON.parse(backup);
                this.wishlist = backupData.wishlist || [];
                this.saveWishlist();
                this.updateWishlistUI();
                this.showNotification('Backup restored!', 'success');
                return true;
            } else {
                this.showError('No backup found');
                return false;
            }
        } catch (error) {
            console.error('Restore error:', error);
            this.showError('Failed to restore backup');
            return false;
        }
    }

    // Get memory usage
    getStorageUsage() {
        try {
            const data = JSON.stringify(this.wishlist);
            const bytes = new Blob([data]).size;
            const kb = (bytes / 1024).toFixed(2);
            const mb = (bytes / (1024 * 1024)).toFixed(2);
            
            return {
                bytes,
                kb: `${kb} KB`,
                mb: `${mb} MB`,
                items: this.wishlist.length
            };
        } catch (error) {
            return { error: 'Unable to calculate storage usage' };
        }
    }
}

// Create global instance
const wishlistManager = new WishlistManager();

// Add wishlist count to navbar (if element exists)
document.addEventListener('DOMContentLoaded', () => {
    const wishlistLink = document.querySelector('.nav-link[href="#watchlist"]');
    if (wishlistLink && !wishlistLink.querySelector('.wishlist-count')) {
        const countBadge = document.createElement('span');
        countBadge.className = 'wishlist-count';
        countBadge.style.cssText = `
            background: var(--primary-color);
            color: white;
            border-radius: 50%;
            padding: 2px 6px;
            font-size: 0.8rem;
            margin-left: 5px;
            display: none;
        `;
        wishlistLink.appendChild(countBadge);
    }
    
    wishlistManager.updateWishlistUI();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WishlistManager;
}
