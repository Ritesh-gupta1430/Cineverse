class CineVerse {
    constructor() {
        this.currentSection = 'home';
        this.isLoading = false;
        this.searchTimeout = null;
        this.currentPage = 1;
        this.currentFilters = {};
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeLoader();
        this.initializeAnimations();
        this.checkUserSession();
        this.loadInitialContent();
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('hamburger').addEventListener('click', this.toggleMobileMenu);
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Search
        document.getElementById('search-input').addEventListener('input', (e) => this.handleSearch(e));
        document.getElementById('search-input').addEventListener('focus', this.showSearchResults);
        document.getElementById('search-input').addEventListener('blur', () => {
            setTimeout(() => this.hideSearchResults(), 200);
        });

        // Auth Modal
        document.getElementById('login-btn').addEventListener('click', this.showAuthModal);
        document.getElementById('close-modal').addEventListener('click', this.hideAuthModal);
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchAuthTab(e));
        });

        // Forms
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));

        // Filters
        document.getElementById('apply-filters').addEventListener('click', this.applyFilters.bind(this));
        document.getElementById('clear-filters').addEventListener('click', this.clearFilters.bind(this));
        document.getElementById('load-more').addEventListener('click', this.loadMore.bind(this));

        // Movie Modal
        document.getElementById('close-movie-modal').addEventListener('click', this.hideMovieModal);

        // Scroll Events
        window.addEventListener('scroll', this.handleScroll.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));

        // Keyboard Events
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Click outside modal
        document.getElementById('auth-modal').addEventListener('click', (e) => {
            if (e.target.id === 'auth-modal') this.hideAuthModal();
        });

        document.getElementById('movie-modal').addEventListener('click', (e) => {
            if (e.target.id === 'movie-modal') this.hideMovieModal();
        });
    }

    initializeLoader() {
        setTimeout(() => {
            document.getElementById('loader').classList.add('hidden');
            document.body.style.overflow = 'auto';
        }, 2000);
    }

    initializeAnimations() {
        // Initialize scroll animations
        this.setupScrollAnimations();
        
        // Initialize parallax effects
        this.setupParallaxEffects();
        
        // Initialize interactive elements
        this.setupInteractiveElements();
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, observerOptions);

        // Add scroll reveal to elements
        document.querySelectorAll('.movie-card, .reason-card, .team-member').forEach(el => {
            el.classList.add('scroll-reveal');
            observer.observe(el);
        });

        const gridObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const items = entry.target.querySelectorAll('.movie-card');
                    items.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.add('grid-animate', 'animate');
                        }, index * 100);
                    });
                }
            });
        }, observerOptions);

        document.querySelectorAll('.movie-grid').forEach(grid => {
            gridObserver.observe(grid);
        });
    }

    setupParallaxEffects() {
        const parallaxElements = document.querySelectorAll('.parallax-element');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            parallaxElements.forEach(element => {
                element.style.transform = `translateY(${rate}px)`;
            });
        });
    }

    setupInteractiveElements() {
        // Ripple effect
        document.querySelectorAll('.ripple-effect').forEach(element => {
            element.addEventListener('click', this.createRipple);
        });

        // Cursor effects
        document.querySelectorAll('.cursor-effect').forEach(element => {
            element.addEventListener('mousemove', this.handleCursorEffect);
        });
    }

    createRipple(e) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    handleCursorEffect(e) {
        const element = e.currentTarget;
        const rect = element.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        element.style.setProperty('--mouse-x', x + '%');
        element.style.setProperty('--mouse-y', y + '%');
    }

    toggleMobileMenu() {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    }

    handleNavigation(e) {
        e.preventDefault();
        const targetSection = e.target.getAttribute('href').substring(1);
        this.showSection(targetSection);
        
        // Close mobile menu if open
        document.getElementById('hamburger').classList.remove('active');
        document.getElementById('nav-menu').classList.remove('active');
    }

    showSection(sectionId) {
        // Hide current section
        const currentSection = document.querySelector('.section.active');
        if (currentSection) {
            currentSection.classList.add('page-transition-exit');
            setTimeout(() => {
                currentSection.classList.remove('active', 'page-transition-exit');
            }, 500);
        }

        // Show new section
        setTimeout(() => {
            const newSection = document.getElementById(sectionId);
            newSection.classList.add('active', 'page-transition-enter');
            setTimeout(() => {
                newSection.classList.remove('page-transition-enter');
            }, 500);
        }, 250);

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[href="#${sectionId}"]`).classList.add('active');

        this.currentSection = sectionId;
        
        // Load section-specific content
        this.loadSectionContent(sectionId);
    }

    loadSectionContent(sectionId) {
        switch (sectionId) {
            case 'explore':
                if (!document.getElementById('explore-grid').hasChildNodes()) {
                    this.loadExploreContent();
                }
                break;
            case 'watchlist':
                this.loadWatchlistContent();
                break;
        }
    }

    async loadInitialContent() {
        try {
            // Load trending movies
            const trending = await movieAPI.getTrending();
            this.renderTrendingSlider(trending.results);
            
            // Load different categories
            const topRated = await movieAPI.getTopRated();
            this.renderMovieSlider('top-rated-track', topRated.results.slice(0, 12));
            
            const popular = await movieAPI.getPopular();
            this.renderMovieSlider('top-10-track', popular.results.slice(0, 12));
            
            // Load genre-based content
            this.loadGenreContent();
            
        } catch (error) {
            console.error('Error loading initial content:', error);
            this.showError('Failed to load content. Please try again.');
        }
    }

    async loadGenreContent() {
        try {
            // Action movies
            const action = await movieAPI.getMoviesByGenre(28);
            this.renderMovieSlider('action-track', action.results.slice(0, 12));
            
            // Horror movies
            const horror = await movieAPI.getMoviesByGenre(27);
            this.renderMovieSlider('horror-track', horror.results.slice(0, 12));
            
            // Comedy movies
            const comedy = await movieAPI.getMoviesByGenre(35);
            this.renderMovieSlider('comedy-track', comedy.results.slice(0, 12));
            
            // Animation movies
            const animation = await movieAPI.getMoviesByGenre(16);
            this.renderMovieSlider('animation-track', animation.results.slice(0, 12));
            
        } catch (error) {
            console.error('Error loading genre content:', error);
        }
    }

    slideMovies(sectionName, direction) {
        const track = document.getElementById(`${sectionName}-track`);
        if (!track) return;

        const cardWidth = 250; // Approximate card width + margin
        const visibleCards = Math.floor(window.innerWidth / cardWidth);
        const scrollAmount = cardWidth * visibleCards;
        
        track.scrollBy({
            left: direction * scrollAmount,
            behavior: 'smooth'
        });
    }

    renderTrendingSlider(movies) {
        const sliderTrack = document.getElementById('slider-track');
        const movieCards = movies.concat(movies).map(movie => this.createMovieCard(movie, 'slider')).join('');
        sliderTrack.innerHTML = movieCards;
    }

    renderMovieGrid(gridId, movies) {
        const grid = document.getElementById(gridId);
        if (!grid) return;
        const movieCards = movies.map(movie => this.createMovieCard(movie)).join('');
        grid.innerHTML = movieCards;
        
        // Add click listeners
        grid.querySelectorAll('.movie-card').forEach(card => {
            card.addEventListener('click', () => {
                const movieId = card.dataset.movieId;
                this.showMovieDetails(movieId);
            });
        });
    }

    renderMovieSlider(trackId, movies) {
        const track = document.getElementById(trackId);
        if (!track) return;
        const movieCards = movies.map(movie => this.createMovieCard(movie, 'slider')).join('');
        track.innerHTML = movieCards;
        
        // Add click listeners
        track.querySelectorAll('.movie-card').forEach(card => {
            card.addEventListener('click', () => {
                const movieId = card.dataset.movieId;
                this.showMovieDetails(movieId);
            });
        });
    }

    createMovieCard(movie, type = 'grid') {
        const posterUrl = movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://via.placeholder.com/300x450/1a1a2e/ffffff?text=No+Image';
        
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
        const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA';
        
        return `
            <div class="movie-card ${type === 'slider' ? 'movie-card-advanced' : ''} cursor-effect ripple-effect" data-movie-id="${movie.id}">
                <img src="${posterUrl}" alt="${movie.title}" class="movie-poster" loading="lazy">
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <div class="movie-meta">
                        <span class="movie-year">${year}</span>
                        <span class="movie-rating">
                            <i class="fas fa-star"></i>
                            ${rating}
                        </span>
                    </div>
                </div>
                <div class="movie-overlay">
                    <div class="overlay-content">
                        <h3>${movie.title}</h3>
                        <p>${movie.overview ? movie.overview.substring(0, 100) + '...' : 'No description available.'}</p>
                        <div class="overlay-actions">
                            <button class="action-btn" onclick="event.stopPropagation(); cineVerse.addToWatchlist(${movie.id})">
                                <i class="fas fa-plus"></i> Watchlist
                            </button>
                            <button class="action-btn secondary" onclick="event.stopPropagation(); cineVerse.showMovieDetails(${movie.id})">
                                <i class="fas fa-info"></i> Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadExploreContent() {
        try {
            const movies = await movieAPI.getPopular(1);
            this.renderMovieGrid('explore-grid', movies.results);
            this.currentPage = 1;
        } catch (error) {
            console.error('Error loading explore content:', error);
            this.showError('Failed to load movies. Please try again.');
        }
    }

    async applyFilters() {
        try {
            this.currentFilters = {
                genre: document.getElementById('genre-filter').value,
                year: document.getElementById('year-filter').value,
                rating: document.getElementById('rating-filter').value,
                language: document.getElementById('language-filter').value
            };
            
            this.showLoading('explore-grid');
            const movies = await movieAPI.getFilteredMovies(this.currentFilters);
            this.renderMovieGrid('explore-grid', movies.results);
            this.currentPage = 1;
            
        } catch (error) {
            console.error('Error applying filters:', error);
            this.showError('Failed to apply filters. Please try again.');
        }
    }

    clearFilters() {
        document.getElementById('genre-filter').value = '';
        document.getElementById('year-filter').value = '';
        document.getElementById('rating-filter').value = '';
        document.getElementById('language-filter').value = '';
        this.currentFilters = {};
        this.loadExploreContent();
    }

    async loadMore() {
        try {
            this.currentPage++;
            const movies = Object.keys(this.currentFilters).length > 0
                ? await movieAPI.getFilteredMovies(this.currentFilters, this.currentPage)
                : await movieAPI.getPopular(this.currentPage);
            
            const grid = document.getElementById('explore-grid');
            const newCards = movies.results.map(movie => this.createMovieCard(movie)).join('');
            grid.insertAdjacentHTML('beforeend', newCards);
            
            // Add click listeners to new cards
            const newCardElements = grid.querySelectorAll('.movie-card:not([data-listener])');
            newCardElements.forEach(card => {
                card.addEventListener('click', () => {
                    const movieId = card.dataset.movieId;
                    this.showMovieDetails(movieId);
                });
                card.setAttribute('data-listener', 'true');
            });
            
        } catch (error) {
            console.error('Error loading more movies:', error);
            this.showError('Failed to load more movies.');
        }
    }

    async handleSearch(e) {
        const query = e.target.value.trim();
        
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        if (query.length < 2) {
            this.hideSearchResults();
            return;
        }
        
        this.searchTimeout = setTimeout(async () => {
            try {
                const results = await movieAPI.searchMovies(query);
                this.displaySearchResults(results.results.slice(0, 5));
            } catch (error) {
                console.error('Search error:', error);
            }
        }, 300);
    }

    displaySearchResults(results) {
        const searchResults = document.getElementById('search-results');
        
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
        } else {
            const resultsHTML = results.map(movie => {
                const posterUrl = movie.poster_path 
                    ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                    : 'https://via.placeholder.com/50x75/1a1a2e/ffffff?text=No+Image';
                
                return `
                    <div class="search-result-item" data-movie-id="${movie.id}">
                        <img src="${posterUrl}" alt="${movie.title}" class="search-result-poster">
                        <div class="search-result-info">
                            <h4>${movie.title}</h4>
                            <p>${movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}</p>
                        </div>
                    </div>
                `;
            }).join('');
            
            searchResults.innerHTML = resultsHTML;
            
            // Add click listeners
            searchResults.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const movieId = item.dataset.movieId;
                    this.showMovieDetails(movieId);
                    this.hideSearchResults();
                    document.getElementById('search-input').value = '';
                });
            });
        }
        
        this.showSearchResults();
    }

    showSearchResults() {
        document.getElementById('search-results').style.display = 'block';
    }

    hideSearchResults() {
        document.getElementById('search-results').style.display = 'none';
    }

    async showMovieDetails(movieId) {
        try {
            const movie = await movieAPI.getMovieDetails(movieId);
            const credits = await movieAPI.getMovieCredits(movieId);
            
            const modalBody = document.getElementById('movie-modal-body');
            modalBody.innerHTML = this.createMovieDetailsHTML(movie, credits);
            
            document.getElementById('movie-modal').classList.add('active');
            
        } catch (error) {
            console.error('Error loading movie details:', error);
            this.showError('Failed to load movie details.');
        }
    }

    createMovieDetailsHTML(movie, credits) {
        const posterUrl = movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://via.placeholder.com/300x450/1a1a2e/ffffff?text=No+Image';
        
        const backdropUrl = movie.backdrop_path 
            ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
            : '';
        
        const director = credits.crew.find(person => person.job === 'Director');
        const cast = credits.cast.slice(0, 5);
        
        return `
            <div class="movie-details">
                ${backdropUrl ? `<div class="movie-backdrop" style="background-image: url('${backdropUrl}')"></div>` : ''}
                <div class="movie-details-content">
                    <div class="movie-details-poster">
                        <img src="${posterUrl}" alt="${movie.title}">
                    </div>
                    <div class="movie-details-info">
                        <h1>${movie.title}</h1>
                        <div class="movie-details-meta">
                            <span><i class="fas fa-calendar"></i> ${movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}</span>
                            <span><i class="fas fa-clock"></i> ${movie.runtime ? movie.runtime + ' min' : 'N/A'}</span>
                            <span><i class="fas fa-star"></i> ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                        </div>
                        <div class="movie-genres">
                            ${movie.genres.map(genre => `<span class="genre-tag">${genre.name}</span>`).join('')}
                        </div>
                        <p class="movie-overview">${movie.overview || 'No overview available.'}</p>
                        <div class="movie-credits">
                            ${director ? `<p><strong>Director:</strong> ${director.name}</p>` : ''}
                            ${cast.length > 0 ? `<p><strong>Cast:</strong> ${cast.map(actor => actor.name).join(', ')}</p>` : ''}
                        </div>
                        <div class="movie-actions">
                            <button class="action-btn pulse-btn" onclick="cineVerse.addToWatchlist(${movie.id})">
                                <i class="fas fa-plus"></i> Add to Watchlist
                            </button>
                            <button class="action-btn secondary" onclick="cineVerse.shareMovie(${movie.id})">
                                <i class="fas fa-share"></i> Share
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    hideMovieModal() {
        document.getElementById('movie-modal').classList.remove('active');
    }

    addToWatchlist(movieId) {
        if (window.watchlistManager) {
            window.watchlistManager.addToWishlist(movieId);
            this.showNotification('Added to watchlist!', 'success');
        }
    }

    shareMovie(movieId) {
        if (navigator.share) {
            navigator.share({
                title: 'Check out this movie!',
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            this.showNotification('Link copied to clipboard!', 'success');
        }
    }

    loadWatchlistContent() {
        const watchlist = window.watchlistManager ? window.watchlistManager.getWishlist() : [];
        const content = document.getElementById('watchlist-content');
        const emptyState = document.getElementById('empty-watchlist');
        
        if (watchlist.length === 0) {
            content.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            content.style.display = 'block';
            emptyState.style.display = 'none';
            
            // Create grid for watchlist items
            content.innerHTML = `
                <div class="movie-grid" id="watchlist-grid">
                    ${watchlist.map(movie => this.createWatchlistCard(movie)).join('')}
                </div>
            `;
            
            // Add event listeners
            content.querySelectorAll('.movie-card').forEach(card => {
                card.addEventListener('click', () => {
                    const movieId = card.dataset.movieId;
                    this.showMovieDetails(movieId);
                });
            });
        }
    }

    createWatchlistCard(movie) {
        const posterUrl = movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://via.placeholder.com/300x450/1a1a2e/ffffff?text=No+Image';
        
        return `
            <div class="movie-card cursor-effect ripple-effect" data-movie-id="${movie.id}">
                <img src="${posterUrl}" alt="${movie.title}" class="movie-poster" loading="lazy">
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <div class="movie-meta">
                        <span class="movie-year">${movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}</span>
                        <span class="movie-rating">
                            <i class="fas fa-star"></i>
                            ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                        </span>
                    </div>
                </div>
                <div class="movie-overlay">
                    <div class="overlay-content">
                        <h3>${movie.title}</h3>
                        <p>${movie.overview ? movie.overview.substring(0, 100) + '...' : 'No description available.'}</p>
                        <div class="overlay-actions">
                            <button class="action-btn" onclick="event.stopPropagation(); cineVerse.removeFromWatchlist(${movie.id})">
                                <i class="fas fa-trash"></i> Remove
                            </button>
                            <button class="action-btn secondary" onclick="event.stopPropagation(); cineVerse.showMovieDetails(${movie.id})">
                                <i class="fas fa-info"></i> Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    removeFromWatchlist(movieId) {
        if (window.watchlistManager) {
            window.watchlistManager.removeFromWishlist(movieId);
            this.loadWatchlistContent();
            this.showNotification('Removed from watchlist!', 'success');
        }
    }

    showAuthModal() {
        document.getElementById('auth-modal').classList.add('active');
    }

    hideAuthModal() {
        document.getElementById('auth-modal').classList.remove('active');
    }

    switchAuthTab(e) {
        const tab = e.target.dataset.tab;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        // Update forms
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        document.getElementById(`${tab}-form`).classList.add('active');
        
        // Update modal title
        document.getElementById('modal-title').textContent = 
            tab === 'login' ? 'Login to CineVerse' : 'Join CineVerse';
    }

    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // Simulate login (frontend only)
        if (email && password) {
            const userData = { name: email.split('@')[0], email: email };
            localStorage.setItem('user_session', JSON.stringify(userData));
            this.showProfile(userData);
            this.hideAuthModal();
            this.showNotification('Login successful!', 'success');
        } else {
            this.showNotification('Please fill in all fields', 'error');
        }
    }

    handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;
        
        if (!name || !email || !password || !confirm) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (password !== confirm) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }
        
        // Simulate registration (frontend only)
        const userData = { name: name, email: email };
        localStorage.setItem('user_session', JSON.stringify(userData));
        this.showProfile(userData);
        this.hideAuthModal();
        this.showNotification('Registration successful!', 'success');
    }

    handleScroll() {
        const navbar = document.getElementById('navbar');
        const scrollTop = window.pageYOffset;
        
        // Navbar scroll effect
        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Scroll-based text animation
        const scrollTexts = document.querySelectorAll('.scroll-text');
        const scrollPercent = Math.min(scrollTop / window.innerHeight, 1);
        
        scrollTexts.forEach((text, index) => {
            const baseSize = 3.5; // rem
            const maxSize = 4.5; // rem
            const size = baseSize + (maxSize - baseSize) * scrollPercent;
            text.style.fontSize = `${size}rem`;
        });
        
        // Parallax effects
        this.updateParallaxElements(scrollTop);
    }

    updateParallaxElements(scrollTop) {
        const parallaxElements = document.querySelectorAll('.floating-card');
        parallaxElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = -(scrollTop * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }

    handleResize() {
        // Handle responsive changes
        const searchContainer = document.querySelector('.search-container');
        if (window.innerWidth <= 768) {
            searchContainer.style.display = 'none';
        } else {
            searchContainer.style.display = 'flex';
        }
    }

    handleKeyboard(e) {
        // Handle keyboard shortcuts
        if (e.key === 'Escape') {
            if (document.getElementById('auth-modal').classList.contains('active')) {
                this.hideAuthModal();
            }
            if (document.getElementById('movie-modal').classList.contains('active')) {
                this.hideMovieModal();
            }
        }
        
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            document.getElementById('search-input').focus();
        }
    }

    showLoading(elementId) {
        const element = document.getElementById(elementId);
        element.innerHTML = `
            <div class="loading-placeholder">
                <div class="spinner-dots">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                <p>Loading movies...</p>
            </div>
        `;
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Simple profile management
    showProfile(userData) {
        const loginBtn = document.getElementById('login-btn');
        const profileDropdown = document.getElementById('profile-dropdown');
        const profileName = document.getElementById('profile-name');
        const profileEmail = document.getElementById('profile-email');
        
        loginBtn.style.display = 'none';
        profileDropdown.style.display = 'block';
        profileName.textContent = userData.name || 'User';
        profileEmail.textContent = userData.email || 'user@example.com';
    }

    logout() {
        const loginBtn = document.getElementById('login-btn');
        const profileDropdown = document.getElementById('profile-dropdown');
        
        loginBtn.style.display = 'block';
        profileDropdown.style.display = 'none';
        
        // Clear user data from localStorage
        localStorage.removeItem('user_session');
        this.showNotification('Logged out successfully!', 'success');
    }

    checkUserSession() {
        const userSession = localStorage.getItem('user_session');
        if (userSession) {
            try {
                const userData = JSON.parse(userSession);
                this.showProfile(userData);
            } catch (error) {
                localStorage.removeItem('user_session');
            }
        }
    }
}

// Initialize the application and global instances
let cineVerse, animationController, watchlistManager;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize instances in correct order
    animationController = new AnimationController();
    watchlistManager = new WishlistManager();
    cineVerse = new CineVerse();
    
    // Make instances globally available
    window.cineVerse = cineVerse;
    window.animationController = animationController;
    window.watchlistManager = watchlistManager;
});

// Global function for easy access
window.showSection = (sectionId) => {
    if (window.cineVerse) {
        window.cineVerse.showSection(sectionId);
    }
};

// Add notification styles to head
const notificationStyles = `
<style>
.notification {
    position: fixed;
    top: 100px;
    right: 20px;
    background: var(--gradient-card);
    border-radius: var(--border-radius);
    padding: 1rem;
    box-shadow: var(--shadow-dark);
    transform: translateX(400px);
    transition: transform 0.3s ease;
    z-index: 10000;
    border-left: 4px solid var(--primary-color);
}

.notification.show {
    transform: translateX(0);
}

.notification-success {
    border-left-color: #4CAF50;
}

.notification-error {
    border-left-color: #F44336;
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-color);
}

.notification-content i {
    font-size: 1.2rem;
}

.loading-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
    text-align: center;
}

.movie-details {
    position: relative;
}

.movie-backdrop {
    height: 300px;
    background-size: cover;
    background-position: center;
    position: relative;
    border-radius: var(--border-radius) var(--border-radius) 0 0;
}

.movie-backdrop::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(transparent, var(--background-darker));
}

.movie-details-content {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 2rem;
    padding: 2rem;
}

.movie-details-poster img {
    width: 100%;
    border-radius: var(--border-radius);
}

.movie-details-info h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.movie-details-meta {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    color: var(--text-secondary);
}

.movie-details-meta span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.movie-genres {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
}

.genre-tag {
    background: var(--gradient-primary);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 15px;
    font-size: 0.8rem;
}

.movie-overview {
    line-height: 1.6;
    margin-bottom: 1.5rem;
    color: var(--text-secondary);
}

.movie-credits {
    margin-bottom: 2rem;
}

.movie-credits p {
    margin-bottom: 0.5rem;
    color: var(--text-secondary);
}

.movie-actions {
    display: flex;
    gap: 1rem;
}

@media (max-width: 768px) {
    .movie-details-content {
        grid-template-columns: 1fr;
        gap: 1rem;
        padding: 1rem;
    }
    
    .movie-details-poster {
        text-align: center;
    }
    
    .movie-details-poster img {
        max-width: 200px;
    }
    
    .notification {
        right: 10px;
        left: 10px;
        transform: translateY(-100px);
    }
    
    .notification.show {
        transform: translateY(0);
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', notificationStyles);
