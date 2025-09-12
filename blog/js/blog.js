// Thrift Zone Blog JavaScript
class ThriftZoneBlog {
    constructor() {
        this.articles = [];
        this.displayedArticles = 0;
        this.articlesPerPage = 6;
        this.currentFilter = 'all';
        this.currentSort = 'latest';
        this.init();
    }

    async init() {
        await this.loadArticles();
        this.setupEventListeners();
        this.renderFeaturedArticle();
        this.renderArticles();
        this.updateArticleCount();
    }

    async loadArticles() {
        try {
            const response = await fetch('data/articles.json');
            const data = await response.json();
            this.articles = data.articles || [];
        } catch (error) {
            console.error('Error loading articles:', error);
            this.articles = this.getDefaultArticles();
        }
    }

    setupEventListeners() {
        // Category filter buttons
        const filterBtns = document.querySelectorAll('.category-filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.category;
                this.displayedArticles = 0;
                this.renderArticles();
            });
        });

        // Sort dropdown
        const sortSelect = document.getElementById('sort-articles');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.displayedArticles = 0;
                this.renderArticles();
            });
        }

        // Load more button
        const loadMoreBtn = document.getElementById('load-more-articles-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreArticles();
            });
        }

        // Newsletter signup
        const subscribeBtn = document.getElementById('subscribe-btn');
        if (subscribeBtn) {
            subscribeBtn.addEventListener('click', () => {
                this.handleNewsletterSignup();
            });
        }

        // Search functionality
        this.setupSearch();
    }

    setupSearch() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                if (query.length > 2) {
                    this.searchArticles(query);
                } else if (query.length === 0) {
                    this.renderArticles();
                }
            });
        }
    }

    searchArticles(query) {
        const filteredArticles = this.articles.filter(article => 
            article.title.toLowerCase().includes(query) ||
            article.excerpt.toLowerCase().includes(query) ||
            article.tags.some(tag => tag.toLowerCase().includes(query))
        );
        
        this.renderFilteredArticles(filteredArticles);
    }

    getFilteredArticles() {
        if (this.currentFilter === 'all') {
            return this.articles;
        }
        return this.articles.filter(article => article.category === this.currentFilter);
    }

    getSortedArticles(articles) {
        const sorted = [...articles];
        switch (this.currentSort) {
            case 'popular':
                return sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
            case 'oldest':
                return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
            case 'latest':
            default:
                return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
    }

    renderFeaturedArticle() {
        const featuredSection = document.getElementById('featured-article');
        if (!featuredSection || this.articles.length === 0) return;

        const featuredArticle = this.articles.find(a => a.featured) || this.articles[0];
        const featuredContent = featuredSection.querySelector('.featured-content') || 
                               featuredSection.querySelector('.container');

        featuredContent.innerHTML = `
            <div class="featured-card">
                <div class="featured-image">
                    <img src="${featuredArticle.image}" alt="${featuredArticle.title}" loading="eager">
                </div>
                <div class="featured-content">
                    <div class="featured-badge">Featured Article</div>
                    <h2 class="featured-title">${featuredArticle.title}</h2>
                    <p class="featured-excerpt">${featuredArticle.excerpt}</p>
                    <div class="featured-meta">
                        <span><i class="fas fa-calendar"></i> ${this.formatDate(featuredArticle.date)}</span>
                        <span><i class="fas fa-clock"></i> ${featuredArticle.readTime} min read</span>
                        <span><i class="fas fa-eye"></i> ${featuredArticle.views || 0} views</span>
                    </div>
                    <a href="article.html?id=${featuredArticle.id}" class="featured-cta">
                        Read Full Article <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
    }

    renderArticles() {
        const container = document.getElementById('articles-grid');
        if (!container) return;

        const filteredArticles = this.getFilteredArticles();
        const sortedArticles = this.getSortedArticles(filteredArticles);
        const articlesToShow = sortedArticles.slice(0, this.displayedArticles + this.articlesPerPage);

        if (articlesToShow.length === 0) {
            container.innerHTML = `
                <div class="no-articles">
                    <i class="fas fa-search"></i>
                    <h3>No articles found</h3>
                    <p>Try a different category or search term.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        articlesToShow.forEach((article, index) => {
            const articleCard = this.createArticleCard(article);
            container.appendChild(articleCard);
            
            // Animate card entrance
            setTimeout(() => {
                articleCard.style.opacity = '1';
                articleCard.style.transform = 'translateY(0)';
            }, index * 100);
        });

        this.displayedArticles = articlesToShow.length;
        this.updateLoadMoreButton(filteredArticles.length);
    }

    renderFilteredArticles(articles) {
        const container = document.getElementById('articles-grid');
        if (!container) return;

        container.innerHTML = '';
        articles.forEach((article, index) => {
            const articleCard = this.createArticleCard(article);
            container.appendChild(articleCard);
            
            setTimeout(() => {
                articleCard.style.opacity = '1';
                articleCard.style.transform = 'translateY(0)';
            }, index * 100);
        });

        // Hide load more button for search results
        const loadMoreBtn = document.getElementById('load-more-articles-btn');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = 'none';
        }
    }

    createArticleCard(article) {
        const card = document.createElement('div');
        card.className = 'article-card';
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

        card.innerHTML = `
            <div class="article-card-image">
                <img src="${article.image}" alt="${article.title}" loading="lazy">
                <div class="article-card-category">${this.getCategoryName(article.category)}</div>
            </div>
            <div class="article-card-content">
                <h3 class="article-card-title">${article.title}</h3>
                <p class="article-card-excerpt">${article.excerpt}</p>
                <div class="article-card-meta">
                    <div class="article-card-date">
                        <i class="fas fa-calendar"></i>
                        <span>${this.formatDate(article.date)}</span>
                    </div>
                    <div class="article-card-reading-time">
                        <i class="fas fa-clock"></i>
                        <span>${article.readTime} min read</span>
                    </div>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            window.location.href = `article.html?id=${article.id}`;
        });

        return card;
    }

    updateLoadMoreButton(totalFilteredArticles) {
        const loadMoreBtn = document.getElementById('load-more-articles-btn');
        if (!loadMoreBtn) return;

        if (this.displayedArticles >= totalFilteredArticles) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }
    }

    loadMoreArticles() {
        const loadMoreBtn = document.getElementById('load-more-articles-btn');
        if (loadMoreBtn) {
            loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            
            setTimeout(() => {
                this.renderArticles();
                loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Load More Articles';
            }, 500);
        }
    }

    updateArticleCount() {
        const countElement = document.getElementById('total-articles');
        if (countElement) {
            countElement.textContent = this.articles.length;
        }
    }

    handleNewsletterSignup() {
        const emailInput = document.getElementById('newsletter-email');
        const subscribeBtn = document.getElementById('subscribe-btn');
        
        if (!emailInput || !emailInput.value) {
            this.showNotification('Please enter your email address', 'error');
            return;
        }

        const email = emailInput.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return;
        }

        // Simulate API call
        subscribeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
        
        setTimeout(() => {
            subscribeBtn.innerHTML = '<i class="fas fa-check"></i> Subscribed!';
            emailInput.value = '';
            this.showNotification('Successfully subscribed to newsletter!', 'success');
            
            setTimeout(() => {
                subscribeBtn.innerHTML = '<i class="fas fa-bell"></i> Subscribe';
            }, 3000);
        }, 1500);
    }

    getCategoryName(category) {
        const categoryNames = {
            'deals': 'Today\'s Deals',
            'reviews': 'Product Reviews',
            'tips': 'Shopping Tips',
            'guides': 'Buying Guides',
            'news': 'Deal News'
        };
        return categoryNames[category] || category;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2563eb'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 1002;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    // Default articles for fallback
    getDefaultArticles() {
        return [
            {
                id: '1',
                title: 'Top 10 Amazon Deals This Week - Save Up to 70%',
                excerpt: 'Discover the most amazing deals on Amazon this week including electronics, fashion, home appliances and more with incredible discounts.',
                content: '',
                category: 'deals',
                date: '2025-09-12',
                readTime: 5,
                image: '../images/blog/article-1.jpg',
                tags: ['amazon', 'deals', 'discounts', 'shopping'],
                author: 'Thrift Zone Team',
                featured: true,
                views: 1250,
                likes: 89
            },
            {
                id: '2',
                title: 'How to Find the Best Electronics Deals Online',
                excerpt: 'Learn proven strategies to find genuine electronics deals online and avoid fake discounts. Expert tips for smart tech shopping.',
                content: '',
                category: 'tips',
                date: '2025-09-11',
                readTime: 8,
                image: '../images/blog/article-2.jpg',
                tags: ['electronics', 'shopping tips', 'deals'],
                author: 'Thrift Zone Team',
                views: 890,
                likes: 67
            },
            {
                id: '3',
                title: 'iPhone 15 Pro Review - Is It Worth the Upgrade?',
                excerpt: 'Comprehensive review of iPhone 15 Pro including performance, camera quality, battery life, and value for money analysis.',
                content: '',
                category: 'reviews',
                date: '2025-09-10',
                readTime: 12,
                image: '../images/blog/article-3.jpg',
                tags: ['iphone', 'review', 'apple', 'smartphone'],
                author: 'Tech Expert',
                views: 2150,
                likes: 156
            }
        ];
    }
}

// Article Page Functions
async function loadArticle(articleId) {
    try {
        const response = await fetch('data/articles.json');
        const data = await response.json();
        const article = data.articles.find(a => a.id === articleId);
        
        if (article) {
            renderArticle(article);
            loadRelatedArticles(article.category, articleId);
        } else {
            showArticleNotFound();
        }
    } catch (error) {
        console.error('Error loading article:', error);
        showArticleNotFound();
    }
}

function renderArticle(article) {
    // Update page title and meta
    document.title = `${article.title} - Thrift Zone Blog`;
    document.getElementById('article-title').textContent = `${article.title} - Thrift Zone Blog`;
    document.getElementById('article-description').setAttribute('content', article.excerpt);
    
    // Update Open Graph meta tags
    document.getElementById('og-title').setAttribute('content', article.title);
    document.getElementById('og-description').setAttribute('content', article.excerpt);
    document.getElementById('og-image').setAttribute('content', window.location.origin + '/' + article.image);
    document.getElementById('og-url').setAttribute('content', window.location.href);

    // Update breadcrumb
    document.getElementById('current-article').textContent = article.title;

    // Update article header
    document.getElementById('article-category-badge').textContent = getCategoryName(article.category);
    document.getElementById('main-article-title').textContent = article.title;
    document.getElementById('article-author').textContent = article.author || 'Thrift Zone Team';
    document.getElementById('article-date').textContent = formatDate(article.date);
    document.getElementById('reading-time').textContent = `${article.readTime} min read`;

    // Update featured image
    const featuredImage = document.getElementById('article-featured-image');
    featuredImage.src = article.image;
    featuredImage.alt = article.title;

    // Update article body
    const articleBody = document.getElementById('article-body');
    if (article.content) {
        articleBody.innerHTML = article.content;
    } else {
        // Generate sample content based on category
        articleBody.innerHTML = generateArticleContent(article);
    }

    // Update tags
    const tagsContainer = document.getElementById('article-tags');
    tagsContainer.innerHTML = article.tags.map(tag => 
        `<a href="#" class="tag" onclick="searchByTag('${tag}')">#${tag}</a>`
    ).join('');

    // Update like count
    document.getElementById('like-count').textContent = article.likes || 0;
}

function generateArticleContent(article) {
    const contentTemplates = {
        deals: `
            <h2>Amazing Deals You Can't Miss</h2>
            <p>This week brings some of the most incredible deals we've seen all year. Whether you're looking for electronics, fashion, or home essentials, there's something for everyone.</p>
            
            <h3>Top Deal Categories</h3>
            <ul>
                <li><strong>Electronics:</strong> Up to 60% off on smartphones, laptops, and accessories</li>
                <li><strong>Fashion:</strong> Seasonal clearance with discounts up to 70%</li>
                <li><strong>Home & Kitchen:</strong> Essential appliances at unbeatable prices</li>
                <li><strong>Health & Beauty:</strong> Premium products at budget-friendly rates</li>
            </ul>

            <blockquote>
                "The key to great deals is timing and knowing where to look. Our team scouts thousands of products daily to bring you only the best offers."
            </blockquote>

            <h3>How to Maximize Your Savings</h3>
            <p>To get the most out of these deals, we recommend:</p>
            <ol>
                <li>Compare prices across different platforms</li>
                <li>Check for additional coupon codes</li>
                <li>Read customer reviews before purchasing</li>
                <li>Consider the total cost including shipping</li>
            </ol>

            <p>Remember, the best deals don't last long, so make sure to grab them while they're available!</p>
        `,
        tips: `
            <h2>Master the Art of Smart Shopping</h2>
            <p>Shopping smart isn't just about finding low prices – it's about getting the best value for your money while ensuring quality and reliability.</p>

            <h3>Essential Shopping Strategies</h3>
            <p>Here are the proven techniques that can help you save hundreds of rupees every month:</p>

            <h4>1. Research Before You Buy</h4>
            <p>Never make impulse purchases on expensive items. Take time to research the product, read reviews, and compare prices across different platforms.</p>

            <h4>2. Use Price Tracking Tools</h4>
            <p>Set up price alerts for products you want. Many websites offer price history and will notify you when prices drop.</p>

            <h4>3. Understand Return Policies</h4>
            <p>Always check the return and exchange policies before making a purchase. This can save you from costly mistakes.</p>

            <blockquote>
                "A smart shopper is not just someone who finds cheap prices, but someone who finds the best value."
            </blockquote>

            <h3>Common Shopping Mistakes to Avoid</h3>
            <ul>
                <li>Buying without comparing prices</li>
                <li>Ignoring shipping costs and taxes</li>
                <li>Not reading product specifications carefully</li>
                <li>Falling for fake discount claims</li>
            </ul>
        `,
        reviews: `
            <h2>Comprehensive Product Analysis</h2>
            <p>In this detailed review, we'll examine every aspect of this product to help you make an informed purchasing decision.</p>

            <h3>Design and Build Quality</h3>
            <p>The first thing you notice is the attention to detail in the design. The build quality feels premium and durable, suggesting this product will last for years with proper care.</p>

            <h3>Performance and Features</h3>
            <p>During our testing period, we evaluated the product under various conditions to ensure our review reflects real-world usage.</p>

            <h4>Key Features:</h4>
            <ul>
                <li>High-quality materials and construction</li>
                <li>Intuitive user interface</li>
                <li>Excellent performance in daily use</li>
                <li>Good value for the price point</li>
            </ul>

            <h3>Pros and Cons</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 2rem 0;">
                <div>
                    <h4 style="color: #10b981;">✓ Pros</h4>
                    <ul>
                        <li>Excellent build quality</li>
                        <li>Great performance</li>
                        <li>Good customer support</li>
                        <li>Competitive pricing</li>
                    </ul>
                </div>
                <div>
                    <h4 style="color: #ef4444;">✗ Cons</h4>
                    <ul>
                        <li>Limited color options</li>
                        <li>Could use better packaging</li>
                        <li>Minor learning curve</li>
                    </ul>
                </div>
            </div>

            <h3>Final Verdict</h3>
            <p>Based on our comprehensive testing, this product offers excellent value for money and would be a solid choice for most users.</p>

            <p><strong>Rating: 4.5/5 stars</strong></p>
        `
    };

    return contentTemplates[article.category] || contentTemplates.deals;
}

function getCategoryName(category) {
    const categoryNames = {
        'deals': 'Today\'s Deals',
        'reviews': 'Product Reviews',
        'tips': 'Shopping Tips',
        'guides': 'Buying Guides',
        'news': 'Deal News'
    };
    return categoryNames[category] || category;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Social sharing functions
function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
}

function shareOnTwitter() {
    const title = encodeURIComponent(document.querySelector('.main-article-title').textContent);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${title}&url=${url}`, '_blank', 'width=600,height=400');
}

function shareOnWhatsApp() {
    const title = document.querySelector('.main-article-title').textContent;
    const url = window.location.href;
    const text = encodeURIComponent(`${title} - ${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
}

function copyArticleLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        showNotification('Article link copied to clipboard!', 'success');
    });
}

// Article interaction functions
function likeArticle() {
    const likeBtn = document.querySelector('.like-btn');
    const likeCount = document.getElementById('like-count');
    const currentCount = parseInt(likeCount.textContent);
    
    if (likeBtn.classList.contains('liked')) {
        likeBtn.classList.remove('liked');
        likeBtn.querySelector('i').className = 'far fa-heart';
        likeCount.textContent = currentCount - 1;
    } else {
        likeBtn.classList.add('liked');
        likeBtn.querySelector('i').className = 'fas fa-heart';
        likeCount.textContent = currentCount + 1;
        
        // Animation
        likeBtn.style.transform = 'scale(1.2)';
        setTimeout(() => {
            likeBtn.style.transform = 'scale(1)';
        }, 200);
    }
}

function shareArticle() {
    if (navigator.share) {
        const title = document.querySelector('.main-article-title').textContent;
        navigator.share({
            title: title,
            text: `Check out this article: ${title}`,
            url: window.location.href
        });
    } else {
        copyArticleLink();
    }
}

function bookmarkArticle() {
    const bookmarkBtn = document.querySelector('.bookmark-btn');
    
    if (bookmarkBtn.classList.contains('bookmarked')) {
        bookmarkBtn.classList.remove('bookmarked');
        bookmarkBtn.querySelector('i').className = 'far fa-bookmark';
        showNotification('Article removed from bookmarks', 'info');
    } else {
        bookmarkBtn.classList.add('bookmarked');
        bookmarkBtn.querySelector('i').className = 'fas fa-bookmark';
        showNotification('Article bookmarked!', 'success');
    }
}

function submitComment() {
    const commentText = document.getElementById('comment-text');
    
    if (!commentText.value.trim()) {
        showNotification('Please write a comment before submitting', 'error');
        return;
    }

    // Simulate comment submission
    showNotification('Comment submitted successfully!', 'success');
    commentText.value = '';
}

// Related articles and other functions
async function loadRelatedArticles(category, currentArticleId) {
    try {
        const response = await fetch('data/articles.json');
        const data = await response.json();
        const relatedArticles = data.articles
            .filter(article => article.category === category && article.id !== currentArticleId)
            .slice(0, 3);

        const relatedGrid = document.getElementById('related-articles-grid');
        if (relatedGrid && relatedArticles.length > 0) {
            relatedGrid.innerHTML = relatedArticles.map(article => `
                <div class="article-card" onclick="window.location.href='article.html?id=${article.id}'">
                    <div class="article-card-image">
                        <img src="${article.image}" alt="${article.title}">
                    </div>
                    <div class="article-card-content">
                        <h4 class="article-card-title">${article.title}</h4>
                        <div class="article-card-meta">
                            <span><i class="fas fa-calendar"></i> ${formatDate(article.date)}</span>
                            <span><i class="fas fa-clock"></i> ${article.readTime} min</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading related articles:', error);
    }
}

function showArticleNotFound() {
    document.querySelector('.article-main').innerHTML = `
        <div class="container">
            <div style="text-align: center; padding: 4rem 0;">
                <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #ef4444; margin-bottom: 2rem;"></i>
                <h1>Article Not Found</h1>
                <p>The article you're looking for doesn't exist or may have been removed.</p>
                <a href="index.html" class="btn-primary">Back to Blog</a>
            </div>
        </div>
    `;
}

function searchByTag(tag) {
    window.location.href = `index.html?search=${encodeURIComponent(tag)}`;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2563eb'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 1002;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize blog
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('articles-grid')) {
        // Blog listing page
        window.thriftBlog = new ThriftZoneBlog();
    }
    
    // Handle search parameter from URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    if (searchQuery && window.thriftBlog) {
        document.getElementById('search-input').value = searchQuery;
        window.thriftBlog.searchArticles(searchQuery);
    }
});
