// API Configuration
const API_KEY = 'd62fa017f76547bba810b1046e36f21a'; // Replace with your actual API key
const BASE_URL = 'https://api.spoonacular.com/recipes';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const filterTags = document.querySelectorAll('.filter-tag');
const categoryCards = document.querySelectorAll('.category-card');
const recipeFavorites = document.querySelectorAll('.recipe-favorite');
const navLinks = document.querySelectorAll('.nav-link');

// State Management
let currentQuery = '';
let favorites = JSON.parse(localStorage.getItem('recipe-favorites') || '[]');

// Indian Cuisine Keywords for better search
const indianKeywords = {
    'biryani': ['biryani', 'biriyani', 'rice', 'basmati'],
    'curry': ['curry', 'masala', 'gravy', 'sauce'],
    'dal': ['dal', 'lentil', 'daal', 'dhal'],
    'roti': ['roti', 'chapati', 'bread', 'naan'],
    'samosa': ['samosa', 'fried', 'pastry', 'snack'],
    'dosa': ['dosa', 'crepe', 'south indian', 'rice batter'],
    'tandoori': ['tandoori', 'grilled', 'roasted', 'clay oven'],
    'paneer': ['paneer', 'cottage cheese', 'indian cheese'],
    'chicken tikka': ['chicken tikka', 'grilled chicken', 'marinated chicken'],
    'butter chicken': ['butter chicken', 'murgh makhani', 'creamy chicken'],
    'rajma': ['rajma', 'kidney beans', 'red beans'],
    'chole': ['chole', 'chickpeas', 'garbanzo beans'],
    'pulao': ['pulao', 'pilaf', 'flavored rice'],
    'kheer': ['kheer', 'rice pudding', 'indian dessert'],
    'gulab jamun': ['gulab jamun', 'sweet balls', 'milk solids'],
    'masala chai': ['masala chai', 'spiced tea', 'indian tea'],
    'korma': ['korma', 'creamy curry', 'mild curry'],
    'vindaloo': ['vindaloo', 'spicy curry', 'goan curry'],
    'idli': ['idli', 'steamed rice cake', 'south indian breakfast'],
    'vada': ['vada', 'fried lentil donuts', 'medu vada']
};

// Popular Indian dishes for suggestions
const popularIndianDishes = [
    'Butter Chicken', 'Biryani', 'Dal Tadka', 'Paneer Butter Masala',
    'Chicken Tikka Masala', 'Chole Bhature', 'Dosa', 'Samosa',
    'Tandoori Chicken', 'Rajma', 'Palak Paneer', 'Aloo Gobi',
    'Fish Curry', 'Mutton Curry', 'Pav Bhaji', 'Vada Pav'
];

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadFavorites();
    addIndianCuisineFeatures();
});

// Initialize Application
function initializeApp() {
    // Add smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Load initial content
    updateFavoriteButtons();
    
    // Set active nav link based on scroll
    window.addEventListener('scroll', updateActiveNavLink);
    
    // Load some popular Indian recipes on initial load
    loadInitialIndianRecipes();
}

// Add Indian Cuisine Specific Features
function addIndianCuisineFeatures() {
    // Add Indian cuisine filter tags
    addIndianFilterTags();
    
    // Add search suggestions for Indian dishes
    addSearchSuggestions();
    
    // Add Indian recipe categories
    addIndianCategories();
}

// Add Indian Filter Tags
function addIndianFilterTags() {
    const quickFilters = document.querySelector('.quick-filters');
    
    // Add Indian cuisine specific filters
    const indianFilters = [
        { label: 'Indian', filter: 'indian cuisine' },
        { label: 'Vegetarian Indian', filter: 'indian vegetarian' },
        { label: 'Spicy', filter: 'spicy indian' },
        { label: 'Dal', filter: 'dal lentil' },
        { label: 'Biryani', filter: 'biryani' }
    ];
    
    indianFilters.forEach(filterItem => {
        const filterTag = document.createElement('button');
        filterTag.className = 'filter-tag indian-filter';
        filterTag.textContent = filterItem.label;
        filterTag.dataset.filter = filterItem.filter;
        
        filterTag.addEventListener('click', (e) => {
            const filter = e.target.dataset.filter;
            searchInput.value = filter;
            handleSearch();
            
            // Update active filter
            document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
        });
        
        quickFilters.appendChild(filterTag);
    });
}

// Add Search Suggestions
function addSearchSuggestions() {
    const searchContainer = document.querySelector('.search-container');
    
    // Create suggestions dropdown
    const suggestionsDropdown = document.createElement('div');
    suggestionsDropdown.className = 'search-suggestions';
    suggestionsDropdown.style.display = 'none';
    searchContainer.appendChild(suggestionsDropdown);
    
    // Add input event listener for suggestions
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length > 1) {
            showSearchSuggestions(query, suggestionsDropdown);
        } else {
            suggestionsDropdown.style.display = 'none';
        }
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target)) {
            suggestionsDropdown.style.display = 'none';
        }
    });
}

// Show Search Suggestions
function showSearchSuggestions(query, dropdown) {
    const suggestions = [];
    
    // Add matching Indian dishes
    popularIndianDishes.forEach(dish => {
        if (dish.toLowerCase().includes(query)) {
            suggestions.push(dish);
        }
    });
    
    // Add matching keywords
    Object.keys(indianKeywords).forEach(key => {
        if (key.includes(query) || indianKeywords[key].some(keyword => keyword.includes(query))) {
            suggestions.push(key.charAt(0).toUpperCase() + key.slice(1));
        }
    });
    
    // Remove duplicates and limit to 6 suggestions
    const uniqueSuggestions = [...new Set(suggestions)].slice(0, 6);
    
    if (uniqueSuggestions.length > 0) {
        dropdown.innerHTML = uniqueSuggestions.map(suggestion => 
            `<div class="suggestion-item" data-suggestion="${suggestion}">${suggestion}</div>`
        ).join('');
        
        dropdown.style.display = 'block';
        
        // Add click handlers to suggestions
        dropdown.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', (e) => {
                searchInput.value = e.target.dataset.suggestion;
                dropdown.style.display = 'none';
                handleSearch();
            });
        });
    } else {
        dropdown.style.display = 'none';
    }
}

// Add Indian Categories
function addIndianCategories() {
    const categoriesGrid = document.querySelector('.categories-grid');
    
    const indianCategories = [
        {
            name: 'Indian Curry',
            category: 'indian-curry',
            images: [
                'https://images.unsplash.com/photo-1574781330855-d0db06ba2e55?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80',
                'https://images.unsplash.com/photo-1631452180539-96aca7d48617?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80',
                'https://via.placeholder.com/300x200/FF6B35/white?text=Indian+Curry'
            ],
            count: '500+ recipes'
        },
        {
            name: 'Biryani & Rice',
            category: 'biryani-rice',
            images: [
                'https://images.unsplash.com/photo-1563379091339-03246963d63a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80',
                'https://images.unsplash.com/photo-1589302168068-964664d93dc0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80',
                'https://via.placeholder.com/300x200/FF6B35/white?text=Biryani+%26+Rice'
            ],
            count: '150+ recipes'
        },
        {
            name: 'Indian Bread',
            category: 'indian-bread',
            images: [
                'https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80',
                'https://images.unsplash.com/photo-1574653367344-8da0bf3a0c46?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80',
                'https://via.placeholder.com/300x200/FF6B35/white?text=Indian+Bread'
            ],
            count: '80+ recipes'
        },
        {
            name: 'Indian Sweets',
            category: 'indian-sweets',
            images: [
                'https://images.unsplash.com/photo-1606471181254-993244dc4ae4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80',
                'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80',
                'https://via.placeholder.com/300x200/FF6B35/white?text=Indian+Sweets'
            ],
            count: '120+ recipes'
        }
    ];
    
    indianCategories.forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card indian-category';
        categoryCard.dataset.category = category.category;
        
        const primaryImage = category.images[0];
        
        categoryCard.innerHTML = `
            <div class="category-image">
                <div class="category-loading">
                    <div class="loading-spinner"></div>
                </div>
                <img src="${primaryImage}" 
                     alt="${category.name}"
                     loading="lazy"
                     onload="handleImageLoad(this)"
                     onerror="handleImageError(this, ${JSON.stringify(category.images).replace(/"/g, '&quot;')}, 0)">
                <div class="category-placeholder" style="display: none;">
                    <i class="fas fa-utensils"></i>
                    <p>${category.name}</p>
                </div>
            </div>
            <div class="category-content">
                <h4 class="category-title">${category.name}</h4>
                <div class="category-rating">
                    <div class="stars small">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star-half-alt"></i>
                    </div>
                    <span class="rating-count">${category.count}</span>
                </div>
            </div>
        `;
        
        categoryCard.addEventListener('click', (e) => {
            const categoryName = category.name.toLowerCase();
            searchInput.value = categoryName;
            handleSearch();
            document.getElementById('recipes').scrollIntoView();
        });
        
        categoriesGrid.appendChild(categoryCard);
    });
}

// Universal Image Loading Handler (consolidated for all images)
function handleImageLoad(img) {
    const loadingDiv = img.parentElement.querySelector('.category-loading, .image-loading');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
    img.style.opacity = '1';
    img.classList.add('loaded');
}

// Universal Image Error Handler (consolidated for all images)
function handleImageError(img, fallbackImages, attemptIndex) {
    console.log(`Image failed to load: ${img.src}, trying fallback ${attemptIndex + 1}`);
    
    const loadingDiv = img.parentElement.querySelector('.category-loading, .image-loading');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
    
    if (attemptIndex < fallbackImages.length - 1) {
        // Try next fallback image
        img.src = fallbackImages[attemptIndex + 1];
        img.onerror = () => handleImageError(img, fallbackImages, attemptIndex + 1);
    } else {
        // All images failed, show placeholder
        img.style.display = 'none';
        let placeholder = img.parentElement.querySelector('.category-placeholder, .image-placeholder');
        
        if (!placeholder) {
            // Create placeholder if it doesn't exist
            placeholder = document.createElement('div');
            placeholder.className = 'image-placeholder';
            placeholder.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; text-align: center; display: flex; flex-direction: column; align-items: center;';
            placeholder.innerHTML = `
                <i class="fas fa-utensils" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                <p style="font-weight: 600;">${img.alt}</p>
            `;
            img.parentElement.appendChild(placeholder);
            img.parentElement.style.background = 'linear-gradient(135deg, #FF6B35, #F7931E)';
        }
        
        placeholder.style.display = 'flex';
    }
}

// Load Initial Indian Recipes
async function loadInitialIndianRecipes() {
    try {
        await fetchAndDisplayRecipes('indian cuisine', true);
    } catch (error) {
        console.log('Initial load error:', error);
        // Fallback to popular dishes
        loadPopularRecipes();
    }
}

// Enhanced Search Handler with Indian Cuisine Support
async function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) {
        showNotification('Please enter a search term', 'warning');
        return;
    }
    
    currentQuery = query;
    showLoading(true);
    
    try {
        // Enhance query for Indian dishes
        const enhancedQuery = enhanceIndianQuery(query);
        await fetchAndDisplayRecipes(enhancedQuery);
        
        // Scroll to results
        document.getElementById('recipes').scrollIntoView();
        
    } catch (error) {
        console.error('Search error:', error);
        showNotification('Failed to search recipes. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Enhance Query for Indian Dishes
function enhanceIndianQuery(query) {
    const lowerQuery = query.toLowerCase();
    
    // Check if it's an Indian dish keyword
    for (const [key, keywords] of Object.entries(indianKeywords)) {
        if (lowerQuery.includes(key) || keywords.some(keyword => lowerQuery.includes(keyword))) {
            // Add Indian cuisine context to improve search results
            return `${query} indian cuisine`;
        }
    }
    
    // If query contains indian-related terms, enhance it
    const indianTerms = ['curry', 'masala', 'tandoori', 'biryani', 'dal', 'paneer'];
    if (indianTerms.some(term => lowerQuery.includes(term))) {
        return `${query} indian`;
    }
    
    return query;
}

// Enhanced Fetch and Display Recipes with Indian Cuisine Priority
async function fetchAndDisplayRecipes(query, isInitialLoad = false) {
    try {
        // Primary search with image size specification
        let url = `${BASE_URL}/complexSearch?query=${encodeURIComponent(query)}&number=12&apiKey=${API_KEY}&addRecipeInformation=true&fillIngredients=true&imageSize=636x393`;
        
        // Add cuisine filter for Indian searches
        if (query.toLowerCase().includes('indian')) {
            url += '&cuisine=indian';
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            // Enhance images before displaying
            const enhancedResults = data.results.map(recipe => ({
                ...recipe,
                image: recipe.image ? recipe.image.replace('312x231', '636x393') : null
            }));
            
            updateRecipesSection(enhancedResults, isInitialLoad);
        } else {
            // If no results, try alternative Indian search
            if (query.toLowerCase().includes('indian')) {
                await tryAlternativeIndianSearch(query);
            } else {
                showNoResults();
            }
        }
        
    } catch (error) {
        throw error;
    }
}

// Alternative Indian Search
async function tryAlternativeIndianSearch(originalQuery) {
    const alternativeQueries = [
        'indian curry',
        'indian vegetarian',
        'chicken tikka',
        'biryani',
        'dal curry'
    ];
    
    for (const altQuery of alternativeQueries) {
        try {
            const url = `${BASE_URL}/complexSearch?query=${encodeURIComponent(altQuery)}&number=8&apiKey=${API_KEY}&addRecipeInformation=true&cuisine=indian`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                updateRecipesSection(data.results, false, `Similar Indian recipes for "${originalQuery}"`);
                return;
            }
        } catch (error) {
            console.log('Alternative search failed:', error);
        }
    }
    
    showNoResults();
}

// Setup Event Listeners
function setupEventListeners() {
    // Search functionality
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Filter tags (including Indian filters)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-tag')) {
            const filter = e.target.dataset.filter;
            searchInput.value = filter;
            handleSearch();
            
            // Update active filter
            document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
        }
    });
    
    // Category cards (including Indian categories)
    document.addEventListener('click', (e) => {
        if (e.target.closest('.category-card')) {
            const card = e.target.closest('.category-card');
            const category = card.dataset.category;
            let categoryName = category.replace('-', ' ');
            
            // Special handling for Indian categories
            if (card.classList.contains('indian-category')) {
                categoryName = card.querySelector('.category-title').textContent;
            }
            
            searchInput.value = categoryName;
            handleSearch();
            
            // Scroll to results
            document.getElementById('recipes').scrollIntoView();
        }
    });
    
    // Recipe favorites
    recipeFavorites.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(e.target.closest('button'));
        });
    });
    
    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView();
                
                // Update active nav link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
    
    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSignup);
    }
    
    // Recipe cards click
    const recipeCards = document.querySelectorAll('.recipe-card');
    recipeCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.recipe-favorite')) {
                handleRecipeClick(card);
            }
        });
    });
}

// Update Recipes Section
function updateRecipesSection(recipes, isInitialLoad = false, customTitle = null) {
    const featuredRecipes = document.querySelector('.featured-recipes');
    featuredRecipes.innerHTML = '';
    
    recipes.forEach((recipe, index) => {
        const recipeCard = createRecipeCard(recipe, index < 2);
        featuredRecipes.appendChild(recipeCard);
    });
    
    // Update section title
    const sectionTitle = document.querySelector('.health-recipes .section-title');
    if (customTitle) {
        sectionTitle.textContent = customTitle;
    } else if (isInitialLoad) {
        sectionTitle.textContent = 'Popular Indian Recipes';
    } else {
        sectionTitle.textContent = `Search Results for "${currentQuery}"`;
    }
    
    // Re-attach event listeners
    setupRecipeCardListeners();
}

// Enhanced Create Recipe Card with Robust Image Handling
function createRecipeCard(recipe, isFeatured = false) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    if (isFeatured) card.classList.add('featured');
    
    const summary = recipe.summary ? 
        recipe.summary.replace(/<[^>]*>/g, '').substring(0, 120) + '...' : 
        'Delicious recipe to try at home.';
    
    const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
    const badges = ['Featured', 'Popular', 'Trending', 'New', 'Authentic', 'Spicy'];
    const randomBadge = badges[Math.floor(Math.random() * badges.length)];
    
    // Multiple reliable fallback images
    const fallbackImages = [
        // High-quality food images from Unsplash
        'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
        'https://images.unsplash.com/photo-1574781330855-d0db06ba2e55?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
        // Final fallback with your brand colors
        'https://via.placeholder.com/400x300/FF6B35/white?text=Recipe+Image'
    ];
    
    // Check if it's an Indian dish
    const isIndianDish = recipe.cuisines && recipe.cuisines.includes('Indian') || 
                        recipe.title.toLowerCase().includes('curry') ||
                        recipe.title.toLowerCase().includes('masala') ||
                        recipe.title.toLowerCase().includes('biryani') ||
                        recipe.title.toLowerCase().includes('dal') ||
                        recipe.title.toLowerCase().includes('tandoori');
    
    // Better image URL handling
    let recipeImage = recipe.image;
    
    // Clean and enhance Spoonacular image URLs
    if (recipeImage) {
        // Replace small image with larger version
        recipeImage = recipeImage.replace('312x231', '636x393');
        recipeImage = recipeImage.replace('312x150', '636x393');
        
        // Ensure HTTPS
        if (recipeImage.startsWith('http://')) {
            recipeImage = recipeImage.replace('http://', 'https://');
        }
    } else {
        // Use a random fallback image
        recipeImage = fallbackImages[Math.floor(Math.random() * (fallbackImages.length - 1))];
    }
    
    card.innerHTML = `
        <div class="recipe-image">
            <div class="image-loading">
                <div class="loading-spinner"></div>
            </div>
            <img src="${recipeImage}" 
                 alt="${recipe.title}" 
                 class="recipe-img"
                 loading="lazy"
                 onload="handleImageLoad(this)"
                 onerror="handleImageError(this, ${JSON.stringify(fallbackImages).replace(/"/g, '&quot;')}, 0)">
            <div class="image-placeholder" style="display: none;">
                <i class="fas fa-utensils"></i>
                <p>${recipe.title}</p>
            </div>
            <div class="recipe-badge ${isIndianDish ? 'indian-badge' : ''}">${randomBadge}</div>
            ${isIndianDish ? '<div class="cuisine-badge">🇮🇳 Indian</div>' : ''}
            <button class="recipe-favorite" data-recipe-id="${recipe.id}">
                <i class="${favorites.includes(recipe.id) ? 'fas' : 'far'} fa-heart"></i>
            </button>
        </div>
        <div class="recipe-content">
            <div class="recipe-rating">
                <div class="stars">
                    ${generateStars(rating)}
                </div>
                <span class="rating-text">${rating}</span>
            </div>
            <h4 class="recipe-title">${recipe.title}</h4>
            <p class="recipe-description">${summary}</p>
            <div class="recipe-meta">
                <span class="recipe-time">
                    <i class="far fa-clock"></i>
                    ${recipe.readyInMinutes || 30} min
                </span>
                <span class="recipe-servings">
                    <i class="fas fa-users"></i>
                    ${recipe.servings || 4} servings
                </span>
                <span class="recipe-difficulty">
                    <i class="fas fa-signal"></i>
                    ${getDifficulty(recipe.readyInMinutes)}
                </span>
                ${recipe.vegan ? '<span class="recipe-vegan"><i class="fas fa-leaf"></i> Vegan</span>' : ''}
                ${recipe.vegetarian ? '<span class="recipe-vegetarian"><i class="fas fa-seedling"></i> Vegetarian</span>' : ''}
            </div>
        </div>
    `;
    
    return card;
}

// Generate Stars
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHtml = '';
    
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        starsHtml += '<i class="fas fa-star-half-alt"></i>';
    }
    
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="far fa-star"></i>';
    }
    
    return starsHtml;
}

// Get Difficulty Level
function getDifficulty(minutes) {
    if (!minutes) return 'Medium';
    if (minutes <= 20) return 'Easy';
    if (minutes <= 45) return 'Medium';
    return 'Hard';
}

// Setup Recipe Card Listeners
function setupRecipeCardListeners() {
    const recipeCards = document.querySelectorAll('.recipe-card');
    const recipeFavorites = document.querySelectorAll('.recipe-favorite');
    
    recipeCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.recipe-favorite')) {
                handleRecipeClick(card);
            }
        });
    });
    
    recipeFavorites.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(btn);
        });
    });
}

// Handle Recipe Click (Enhanced with Indian recipe support)
function handleRecipeClick(card) {
    const title = card.querySelector('.recipe-title').textContent;
    const recipeId = card.querySelector('.recipe-favorite').dataset.recipeId;
    
    // Check if it's an Indian dish for specialized modal
    const isIndianDish = card.querySelector('.cuisine-badge');
    
    openRecipeInNewTab(recipeId, title, card.querySelector('.recipe-img').src, isIndianDish);
}

// Open Recipe in New Tab
async function openRecipeInNewTab(recipeId, title, cardImage, isIndianDish) {
    // Create the new tab content
    const newTab = window.open('', '_blank');
    
    // Show loading page first
    newTab.document.write(createLoadingPage(title, cardImage, isIndianDish));
    
    try {
        // Fetch detailed recipe information
        const recipeDetails = await fetchRecipeDetails(recipeId);
        
        // Replace loading content with full recipe details
        newTab.document.open();
        newTab.document.write(createRecipeDetailsPage(recipeDetails, isIndianDish));
        newTab.document.close();
        
    } catch (error) {
        console.error('Error loading recipe details:', error);
        
        // Show error page with fallback options
        newTab.document.open();
        newTab.document.write(createErrorPage(title, recipeId, cardImage));
        newTab.document.close();
    }
}

// Fetch Recipe Details
async function fetchRecipeDetails(recipeId) {
    const url = `${BASE_URL}/${recipeId}/information?apiKey=${API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

// Create Loading Page
function createLoadingPage(title, cardImage, isIndianDish) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - Recipe Details</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        <style>
            ${getRecipePageStyles()}
        </style>
    </head>
    <body>
        <div class="recipe-page">
            <div class="recipe-header">
                <div class="recipe-image-header">
                    <img src="${cardImage}" alt="${title}" onerror="this.src='https://via.placeholder.com/800x400/FF6B35/white?text=Recipe+Image'">
                    <div class="recipe-overlay">
                        <h1>${title} ${isIndianDish ? '🇮🇳' : ''}</h1>
                        ${isIndianDish ? '<div class="cuisine-tag">Indian Cuisine</div>' : ''}
                    </div>
                </div>
            </div>
            
            <div class="recipe-content">
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <h3>Loading Recipe Details...</h3>
                    <p>Fetching ingredients, instructions, and nutrition information...</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
}

// Create Recipe Details Page
function createRecipeDetailsPage(recipe, isIndianDish) {
    const instructions = recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 
        ? recipe.analyzedInstructions[0].steps 
        : [];
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${recipe.title} - Recipe Details</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        <style>
            ${getRecipePageStyles()}
        </style>
    </head>
    <body>
        <div class="recipe-page">
            <!-- Header Section -->
            <div class="recipe-header">
                <div class="recipe-image-header">
                    <img src="${recipe.image || 'https://via.placeholder.com/800x400/FF6B35/white?text=Recipe+Image'}" 
                         alt="${recipe.title}" 
                         onerror="this.src='https://via.placeholder.com/800x400/FF6B35/white?text=Recipe+Image'">
                    <div class="recipe-overlay">
                        <h1>${recipe.title} ${isIndianDish ? '🇮🇳' : ''}</h1>
                        ${isIndianDish ? '<div class="cuisine-tag">Indian Cuisine</div>' : ''}
                        <div class="recipe-quick-stats">
                            <span><i class="far fa-clock"></i> ${recipe.readyInMinutes || 'N/A'} min</span>
                            <span><i class="fas fa-users"></i> ${recipe.servings || 'N/A'} servings</span>
                            <span><i class="fas fa-signal"></i> ${getDifficulty(recipe.readyInMinutes)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recipe Content -->
            <div class="recipe-content">
                <div class="recipe-container">
                    
                    <!-- Recipe Summary -->
                    <div class="recipe-section">
                        <h2>About This Recipe</h2>
                        <p class="recipe-summary">${recipe.summary ? recipe.summary.replace(/<[^>]*>/g, '') : 'A delicious recipe perfect for any occasion.'}</p>
                    </div>

                    <!-- Recipe Stats -->
                    <div class="recipe-section">
                        <div class="recipe-stats-grid">
                            <div class="stat-card">
                                <i class="far fa-clock"></i>
                                <h3>${recipe.readyInMinutes || 'N/A'}</h3>
                                <p>Minutes</p>
                            </div>
                            <div class="stat-card">
                                <i class="fas fa-users"></i>
                                <h3>${recipe.servings || 'N/A'}</h3>
                                <p>Servings</p>
                            </div>
                            <div class="stat-card">
                                <i class="fas fa-fire"></i>
                                <h3>${recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount?.toFixed(0) || 'N/A'}</h3>
                                <p>Calories</p>
                            </div>
                            <div class="stat-card">
                                <i class="fas fa-star"></i>
                                <h3>${recipe.spoonacularScore ? (recipe.spoonacularScore / 20).toFixed(1) : '4.5'}</h3>
                                <p>Rating</p>
                            </div>
                        </div>
                    </div>

                    <!-- Diet & Health Info -->
                    ${recipe.vegetarian || recipe.vegan || recipe.glutenFree || recipe.dairyFree ? `
                    <div class="recipe-section">
                        <h2>Dietary Information</h2>
                        <div class="dietary-tags">
                            ${recipe.vegetarian ? '<span class="diet-tag vegetarian"><i class="fas fa-seedling"></i> Vegetarian</span>' : ''}
                            ${recipe.vegan ? '<span class="diet-tag vegan"><i class="fas fa-leaf"></i> Vegan</span>' : ''}
                            ${recipe.glutenFree ? '<span class="diet-tag gluten-free"><i class="fas fa-wheat"></i> Gluten Free</span>' : ''}
                            ${recipe.dairyFree ? '<span class="diet-tag dairy-free"><i class="fas fa-cow"></i> Dairy Free</span>' : ''}
                            ${recipe.ketogenic ? '<span class="diet-tag keto"><i class="fas fa-fire-alt"></i> Keto</span>' : ''}
                        </div>
                    </div>
                    ` : ''}

                    <!-- Ingredients Section -->
                    ${recipe.extendedIngredients ? `
                    <div class="recipe-section">
                        <h2><i class="fas fa-list"></i> Ingredients</h2>
                        <div class="ingredients-list">
                            ${recipe.extendedIngredients.map(ingredient => `
                                <div class="ingredient-item">
                                    <div class="ingredient-image">
                                        <img src="https://spoonacular.com/cdn/ingredients_100x100/${ingredient.image}" 
                                             alt="${ingredient.name}"
                                             onerror="this.src='https://via.placeholder.com/50x50/FF6B35/white?text=?'">
                                    </div>
                                    <div class="ingredient-details">
                                        <h4>${ingredient.name}</h4>
                                        <p>${ingredient.original}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}

                    <!-- Instructions Section -->
                    ${instructions.length > 0 ? `
                    <div class="recipe-section">
                        <h2><i class="fas fa-clipboard-list"></i> Instructions</h2>
                        <div class="instructions-list">
                            ${instructions.map((step, index) => `
                                <div class="instruction-step">
                                    <div class="step-number">${index + 1}</div>
                                    <div class="step-content">
                                        <p>${step.step}</p>
                                        ${step.ingredients && step.ingredients.length > 0 ? `
                                            <div class="step-ingredients">
                                                <strong>Ingredients needed:</strong> ${step.ingredients.map(ing => ing.name).join(', ')}
                                            </div>
                                        ` : ''}
                                        ${step.equipment && step.equipment.length > 0 ? `
                                            <div class="step-equipment">
                                                <strong>Equipment:</strong> ${step.equipment.map(eq => eq.name).join(', ')}
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}

                    <!-- Nutrition Information -->
                    ${recipe.nutrition?.nutrients ? `
                    <div class="recipe-section">
                        <h2><i class="fas fa-chart-pie"></i> Nutrition Information</h2>
                        <div class="nutrition-grid">
                            ${recipe.nutrition.nutrients.slice(0, 8).map(nutrient => `
                                <div class="nutrition-item">
                                    <h4>${nutrient.amount.toFixed(1)}${nutrient.unit}</h4>
                                    <p>${nutrient.name}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}

                    <!-- Action Buttons -->
                    <div class="recipe-section">
                        <div class="recipe-actions">
                            <button class="btn-primary" onclick="window.print()">
                                <i class="fas fa-print"></i> Print Recipe
                            </button>
                            ${recipe.sourceUrl ? `
                                <button class="btn-secondary" onclick="window.open('${recipe.sourceUrl}', '_blank')">
                                    <i class="fas fa-external-link-alt"></i> Original Source
                                </button>
                            ` : ''}
                            <button class="btn-secondary" onclick="window.close()">
                                <i class="fas fa-times"></i> Close
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>

        <script>
            // Add some interactivity
            document.addEventListener('DOMContentLoaded', function() {
                // Add smooth scrolling for any internal links
                document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                    anchor.addEventListener('click', function (e) {
                        e.preventDefault();
                        document.querySelector(this.getAttribute('href')).scrollIntoView({
                            behavior: 'smooth'
                        });
                    });
                });
            });
        </script>
    </body>
    </html>
    `;
}

// Create Error Page
function createErrorPage(title, recipeId, cardImage) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recipe Not Found - ${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        <style>
            ${getRecipePageStyles()}
        </style>
    </head>
    <body>
        <div class="recipe-page">
            <div class="recipe-header">
                <div class="recipe-image-header">
                    <img src="${cardImage}" alt="${title}" onerror="this.src='https://via.placeholder.com/800x400/FF6B35/white?text=Recipe+Not+Found'">
                    <div class="recipe-overlay">
                        <h1>${title}</h1>
                    </div>
                </div>
            </div>
            
            <div class="recipe-content">
                <div class="recipe-container">
                    <div class="error-container">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h2>Recipe Details Not Available</h2>
                        <p>We couldn't load the detailed information for this recipe, but you can still view it on the original source.</p>
                        
                        <div class="error-actions">
                            <button class="btn-primary" onclick="window.open('https://spoonacular.com/recipes/${title.replace(/\s+/g, '-').toLowerCase()}-${recipeId}', '_blank')">
                                <i class="fas fa-external-link-alt"></i> View on Spoonacular
                            </button>
                            <button class="btn-secondary" onclick="window.close()">
                                <i class="fas fa-times"></i> Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
}

// Get Recipe Page Styles
function getRecipePageStyles() {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Poppins', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }

        .recipe-page {
            min-height: 100vh;
        }

        /* Header Styles */
        .recipe-header {
            position: relative;
            height: 400px;
            overflow: hidden;
        }

        .recipe-image-header {
            position: relative;
            width: 100%;
            height: 100%;
        }

        .recipe-image-header img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .recipe-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(transparent, rgba(0,0,0,0.8));
            color: white;
            padding: 3rem 2rem 2rem;
        }

        .recipe-overlay h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
        }

        .cuisine-tag {
            display: inline-block;
            background: linear-gradient(135deg, #FF6B35, #F7931E);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }

        .recipe-quick-stats {
            display: flex;
            gap: 2rem;
            font-size: 1rem;
        }

        .recipe-quick-stats span {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        /* Content Styles */
        .recipe-content {
            background: white;
            margin-top: -50px;
            position: relative;
            z-index: 2;
            border-radius: 25px 25px 0 0;
            min-height: 500px;
        }

        .recipe-container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 2rem;
        }

        .recipe-section {
            margin-bottom: 3rem;
        }

        .recipe-section h2 {
            color: #333;
            font-size: 1.8rem;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .recipe-section h2 i {
            color: #FF6B35;
        }

        .recipe-summary {
            font-size: 1.1rem;
            line-height: 1.8;
            color: #666;
        }

        /* Stats Grid */
        .recipe-stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
        }

        .stat-card {
            background: linear-gradient(135deg, #FF6B35, #F7931E);
            color: white;
            text-align: center;
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(255, 107, 53, 0.3);
        }

        .stat-card i {
            font-size: 2rem;
            margin-bottom: 1rem;
        }

        .stat-card h3 {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        /* Dietary Tags */
        .dietary-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .diet-tag {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.9rem;
        }

        .diet-tag.vegetarian {
            background: #4CAF50;
            color: white;
        }

        .diet-tag.vegan {
            background: #2E7D32;
            color: white;
        }

        .diet-tag.gluten-free {
            background: #FFC107;
            color: #333;
        }

        .diet-tag.dairy-free {
            background: #2196F3;
            color: white;
        }

        .diet-tag.keto {
            background: #9C27B0;
            color: white;
        }

        /* Ingredients */
        .ingredients-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
        }

        .ingredient-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 4px solid #FF6B35;
        }

        .ingredient-image img {
            width: 50px;
            height: 50px;
            border-radius: 8px;
            object-fit: cover;
        }

        .ingredient-details h4 {
            color: #333;
            font-weight: 600;
            margin-bottom: 0.3rem;
        }

        .ingredient-details p {
            color: #666;
            font-size: 0.9rem;
        }

        /* Instructions */
        .instructions-list {
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }

        .instruction-step {
            display: flex;
            gap: 1.5rem;
        }

        .step-number {
            background: linear-gradient(135deg, #FF6B35, #F7931E);
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1.1rem;
            flex-shrink: 0;
        }

        .step-content {
            flex: 1;
        }

        .step-content p {
            font-size: 1.1rem;
            line-height: 1.8;
            margin-bottom: 1rem;
        }

        .step-ingredients,
        .step-equipment {
            background: #f8f9fa;
            padding: 0.8rem;
            border-radius: 8px;
            margin-top: 0.5rem;
            font-size: 0.9rem;
        }

        .step-ingredients strong,
        .step-equipment strong {
            color: #FF6B35;
        }

        /* Nutrition */
        .nutrition-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
        }

        .nutrition-item {
            text-align: center;
            padding: 1.5rem;
            background: #f8f9fa;
            border-radius: 10px;
            border-top: 4px solid #FF6B35;
        }

        .nutrition-item h4 {
            color: #FF6B35;
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .nutrition-item p {
            color: #666;
            font-size: 0.9rem;
        }

        /* Action Buttons */
        .recipe-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }

        .btn-primary,
        .btn-secondary {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 12px 24px;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            border: none;
            font-size: 1rem;
        }

        .btn-primary {
            background: linear-gradient(135deg, #FF6B35, #F7931E);
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 107, 53, 0.4);
        }

        .btn-secondary {
            background: transparent;
            color: #FF6B35;
            border: 2px solid #FF6B35;
        }

        .btn-secondary:hover {
            background: #FF6B35;
            color: white;
            transform: translateY(-2px);
        }

        /* Loading Styles */
        .loading-container,
        .error-container {
            text-align: center;
            padding: 4rem 2rem;
        }

        .loading-spinner {
            width: 60px;
            height: 60px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #FF6B35;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 2rem;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .error-container i {
            font-size: 4rem;
            color: #FF6B35;
            margin-bottom: 2rem;
        }

        .error-container h2 {
            color: #333;
            margin-bottom: 1rem;
        }

        .error-container p {
            color: #666;
            font-size: 1.1rem;
            margin-bottom: 2rem;
        }

        .error-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .recipe-overlay h1 {
                font-size: 2rem;
            }

            .recipe-quick-stats {
                flex-direction: column;
                gap: 0.5rem;
            }

            .recipe-container {
                padding: 1rem;
            }

            .instruction-step {
                flex-direction: column;
                gap: 1rem;
            }

            .recipe-stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .nutrition-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .ingredients-list {
                grid-template-columns: 1fr;
            }

            .recipe-actions {
                flex-direction: column;
                align-items: center;
            }

            .btn-primary,
            .btn-secondary {
                width: 100%;
                max-width: 300px;
                justify-content: center;
            }
        }

        /* Print Styles */
        @media print {
            .recipe-actions {
                display: none;
            }
            
            .recipe-overlay {
                background: white;
                color: black;
            }
            
            .stat-card {
                background: white;
                color: black;
                border: 2px solid #FF6B35;
            }
        }
    `;
}

// Toggle Favorite
function toggleFavorite(btn) {
    const recipeId = parseInt(btn.dataset.recipeId);
    const icon = btn.querySelector('i');
    
    if (favorites.includes(recipeId)) {
        favorites = favorites.filter(id => id !== recipeId);
        icon.className = 'far fa-heart';
        showNotification('Removed from favorites', 'info');
    } else {
        favorites.push(recipeId);
        icon.className = 'fas fa-heart';
        showNotification('Added to favorites', 'success');
    }
    
    localStorage.setItem('recipe-favorites', JSON.stringify(favorites));
}

// Load Favorites
function loadFavorites() {
    updateFavoriteButtons();
}

// Update Favorite Buttons
function updateFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll('.recipe-favorite');
    favoriteButtons.forEach(btn => {
        const recipeId = parseInt(btn.dataset.recipeId);
        const icon = btn.querySelector('i');
        
        if (favorites.includes(recipeId)) {
            icon.className = 'fas fa-heart';
        } else {
            icon.className = 'far fa-heart';
        }
    });
}

// Show Loading
function showLoading(show) {
    loadingOverlay.style.display = show ? 'flex' : 'none';
}

// Show No Results
function showNoResults() {
    const featuredRecipes = document.querySelector('.featured-recipes');
    featuredRecipes.innerHTML = `
        <div class="no-results">
            <h3>No recipes found</h3>
            <p>Try searching with different keywords or browse our Indian cuisine categories</p>
            <div class="suggested-searches">
                <p><strong>Popular Indian dishes to try:</strong></p>
                <div class="suggestion-tags">
                    ${popularIndianDishes.slice(0, 6).map(dish => 
                        `<button class="suggestion-tag" onclick="searchInput.value='${dish}'; handleSearch();">${dish}</button>`
                    ).join('')}
                </div>
            </div>
        </div>
    `;
}

// Show Notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Update Active Nav Link
function updateActiveNavLink() {
    const sections = ['home', 'recipes', 'categories'];
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        const navLink = document.querySelector(`[href="#${sectionId}"]`);
        
        if (section && navLink) {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                navLinks.forEach(link => link.classList.remove('active'));
                navLink.classList.add('active');
            }
        }
    });
}

// Enhanced Handle Newsletter Signup with Local Storage
function handleNewsletterSignup(e) {
    e.preventDefault();
    const emailInput = e.target.querySelector('.newsletter-input');
    const email = emailInput.value.trim();
    
    if (email && isValidEmail(email)) {
        // Store email in local storage
        storeEmailInLocalStorage(email);
        
        // Show success notification
        showNotification('Thank you for subscribing to Indian recipe updates!', 'success');
        
        // Clear the input field
        emailInput.value = '';
        
        // Update UI to show subscription status
        updateNewsletterUI(true);
        
    } else {
        showNotification('Please enter a valid email address', 'warning');
        emailInput.focus();
    }
}

// Store Email in Local Storage
function storeEmailInLocalStorage(email) {
    try {
        // Get existing subscribers from local storage
        let subscribers = JSON.parse(localStorage.getItem('newsletter-subscribers') || '[]');
        
        // Check if email already exists
        const existingSubscriber = subscribers.find(sub => sub.email === email);
        
        if (existingSubscriber) {
            showNotification('You are already subscribed!', 'info');
            return;
        }
        
        // Create subscriber object with timestamp
        const subscriber = {
            email: email,
            subscribedAt: new Date().toISOString(),
            id: Date.now(), // Simple ID generation
            status: 'active'
        };
        
        // Add to subscribers array
        subscribers.push(subscriber);
        
        // Store back to local storage
        localStorage.setItem('newsletter-subscribers', JSON.stringify(subscribers));
        
        // Update subscriber count
        updateSubscriberCount(subscribers.length);
        
        console.log('📧 Email stored successfully:', subscriber);
        
    } catch (error) {
        console.error('Error storing email:', error);
        showNotification('Failed to subscribe. Please try again.', 'error');
    }
}

// Update Subscriber Count Display
function updateSubscriberCount(count) {
    const countDisplay = document.querySelector('.subscriber-count');
    if (countDisplay) {
        countDisplay.textContent = `${count} subscribers`;
    }
}

// Update Newsletter UI based on subscription status
function updateNewsletterUI(isSubscribed) {
    const newsletterForm = document.querySelector('.newsletter-form');
    const newsletterBtn = document.querySelector('.newsletter-btn');
    
    if (isSubscribed) {
        newsletterBtn.innerHTML = '<i class="fas fa-check"></i> Subscribed!';
        newsletterBtn.style.background = '#4CAF50';
        newsletterBtn.disabled = true;
        
        // Re-enable after 3 seconds
        setTimeout(() => {
            newsletterBtn.innerHTML = 'Subscribe';
            newsletterBtn.style.background = 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)';
            newsletterBtn.disabled = false;
        }, 3000);
    }
}

// Get All Subscribers (utility function)
function getAllSubscribers() {
    try {
        return JSON.parse(localStorage.getItem('newsletter-subscribers') || '[]');
    } catch (error) {
        console.error('Error getting subscribers:', error);
        return [];
    }
}

// Check if Email is Subscribed
function isEmailSubscribed(email) {
    const subscribers = getAllSubscribers();
    return subscribers.some(sub => sub.email === email && sub.status === 'active');
}

// Unsubscribe Email (bonus feature)
function unsubscribeEmail(email) {
    try {
        let subscribers = getAllSubscribers();
        subscribers = subscribers.map(sub => 
            sub.email === email ? { ...sub, status: 'unsubscribed', unsubscribedAt: new Date().toISOString() } : sub
        );
        
        localStorage.setItem('newsletter-subscribers', JSON.stringify(subscribers));
        showNotification('Successfully unsubscribed!', 'info');
        
    } catch (error) {
        console.error('Error unsubscribing:', error);
        showNotification('Failed to unsubscribe. Please try again.', 'error');
    }
}

// Clear All Subscribers (admin function)
function clearAllSubscribers() {
    if (confirm('Are you sure you want to clear all subscribers?')) {
        localStorage.removeItem('newsletter-subscribers');
        updateSubscriberCount(0);
        showNotification('All subscribers cleared!', 'info');
    }
}

// Enhanced Email Validation (consolidated - removed duplicate)
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Basic regex check
    if (!emailRegex.test(email)) {
        return false;
    }
    
    // Additional checks
    if (email.length > 254) return false; // RFC limit
    if (email.includes('..')) return false; // No consecutive dots
    
    return true;
}

// Load Popular Recipes (Fallback)
function loadPopularRecipes() {
    const featuredRecipes = document.querySelector('.featured-recipes');
    featuredRecipes.innerHTML = `
        <div class="popular-dishes">
            <h3>Popular Indian Dishes</h3>
            <div class="dish-grid">
                ${popularIndianDishes.slice(0, 8).map(dish => `
                    <div class="dish-card" onclick="searchInput.value='${dish}'; handleSearch();">
                        <h4>${dish}</h4>
                        <p>Click to search</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Debug Image Loading
function debugImageLoading() {
    console.log('🔍 Debugging Image Loading...');
    
    const images = document.querySelectorAll('.recipe-img, .category-image img');
    images.forEach((img, index) => {
        console.log(`Image ${index + 1}:`, {
            src: img.src,
            loaded: img.complete,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            error: img.src.includes('placeholder')
        });
        
        if (!img.complete || img.naturalWidth === 0) {
            console.warn(`❌ Image ${index + 1} failed to load:`, img.src);
        } else {
            console.log(`✅ Image ${index + 1} loaded successfully`);
        }
    });
}
