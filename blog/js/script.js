// ===========================
// ThriftMaal Blog - Dynamic Script
// ===========================

// Global variables
let allPosts = [];
let currentCategory = 'all';

// DOM Elements
const blogContainer = document.getElementById('blogContainer');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const noResults = document.getElementById('noResults');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadPosts();
    initializeEventListeners();
});

// Load posts from JSON file
async function loadPosts() {
    try {
        const response = await fetch('./data/posts.json');
        if (!response.ok) throw new Error('Failed to load posts');
        
        allPosts = await response.json();
        displayPosts(allPosts);
    } catch (error) {
        console.error('Error loading posts:', error);
        blogContainer.innerHTML = `
            <div class="loading">
                ⚠️ Unable to load blog posts. Please try again later.
            </div>
        `;
    }
}

// Display posts in the grid
function displayPosts(posts) {
    if (posts.length === 0) {
        blogContainer.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }

    blogContainer.style.display = 'grid';
    noResults.style.display = 'none';

    blogContainer.innerHTML = posts.map(post => `
<div class="blog-card" onclick="window.location.href='./posts/article?post=${post.slug}'">
            <img src="${post.image}" alt="${post.title}" loading="lazy">
            <div class="blog-info">
                <span class="blog-category">${post.category}</span>
                <h3>${post.title}</h3>
                <p>${post.summary}</p>
                <div class="blog-meta">
                    <span>📅 ${post.date}</span>
                    <span>⏱️ ${post.readTime}</span>
                </div>
                <a href="./posts/post-template.html?post=${post.slug}" class="btn">Read More</a>
            </div>
        </div>
    `).join('');
}

// Filter posts by category
function filterByCategory(category) {
    currentCategory = category;
    
    // Update active button
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });

    // Filter and display
    applyFilters();
}

// Search posts
function searchPosts(query) {
    applyFilters(query);
}

// Apply all filters (search + category)
function applyFilters(searchQuery = '') {
    let filtered = allPosts;

    // Apply category filter
    if (currentCategory !== 'all') {
        filtered = filtered.filter(post => post.category === currentCategory);
    }

    // Apply search filter
    if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(post => 
            post.title.toLowerCase().includes(query) ||
            post.summary.toLowerCase().includes(query) ||
            post.category.toLowerCase().includes(query)
        );
    }

    displayPosts(filtered);
}

// Initialize event listeners
function initializeEventListeners() {
    // Category filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterByCategory(this.dataset.category);
        });
    });

    // Search input
    searchInput.addEventListener('input', function(e) {
        searchPosts(e.target.value);
    });

    // Mobile menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
        });
    });
}

// Smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Lazy loading images optimization
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}
