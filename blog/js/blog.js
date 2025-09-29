// Thrift Zone Blog JavaScript with SEO-Friendly URLs
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
        this.setupRouting();
        this.setupEventListeners();
        this.handleRoute();
    }

    // URL slug generation function
    generateSlug(title) {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    async loadArticles() {
        try {
            const response = await fetch('data/articles.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.articles = data.articles || [];
            
            // Generate slugs if missing
            this.articles.forEach(article => {
                if (!article.slug) {
                    article.slug = this.generateSlug(article.title);
                }
            });
        } catch (error) {
            console.error('Error loading articles:', error);
            this.articles = this.getDefaultArticles();
        }
    }

    setupRouting() {
        // Handle browser back/forward navigation
        window.addEventListener('popstate', () => {
            this.handleRoute();
        });

        // Handle GitHub Pages redirect
        if (sessionStorage.redirect) {
            const redirect = sessionStorage.redirect;
            delete sessionStorage.redirect;
            history.replaceState(null, null, redirect);
        }
    }

    handleRoute() {
        const path = window.location.pathname;
        const segments = path.split('/').filter(segment => segment);
        
        // Check if we're on an article page
        if (segments.length >= 2 && segments[0] === 'blog') {
            const slug = segments[1];
            this.loadArticleBySlug(slug);
        } else {
            // We're on the blog index page
            this.renderBlogIndex();
        }
    }

    renderBlogIndex() {
        // Show blog index elements
        const blogSections = [
            '.blog-hero',
            '.blog-categories', 
            '.featured-article',
            '.blog-articles',
            '.blog-newsletter'
        ];
        
        blogSections.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) element.style.display = 'block';
        });

        // Hide article content
        const articleMain = document.querySelector('.article-main');
        if (articleMain) articleMain.style.display = 'none';

        this.renderFeaturedArticle();
        this.renderArticles();
        this.updateArticleCount();
    }

    async loadArticleBySlug(slug) {
        const article = this.articles.find(a => a.slug === slug);
        
        if (article) {
            this.renderArticlePage(article);
            this.loadRelatedArticles(article.category, article.id);
        } else {
            this.showArticleNotFound();
        }
    }

    renderArticlePage(article) {
        // Hide blog index elements
        const blogSections = [
            '.blog-hero',
            '.blog-categories', 
            '.featured-article',
            '.blog-articles',
            '.blog-newsletter'
        ];
        
        blogSections.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) element.style.display = 'none';
        });

        // Show article content
        let articleMain = document.querySelector('.article-main');
        if (!articleMain) {
            // Create article main if it doesn't exist
            articleMain = document.createElement('main');
            articleMain.className = 'article-main';
            articleMain.innerHTML = this.getArticleTemplate();
            document.querySelector('header').insertAdjacentElement('afterend', articleMain);
        }
        
        articleMain.style.display = 'block';
        this.renderArticle(article);
    }

    getArticleTemplate() {
        return `
            <div class="container">
                <!-- Breadcrumbs -->
                <nav class="breadcrumbs">
                    <a href="../index.html">Home</a>
                    <span class="separator">›</span>
                    <a href="javascript:void(0)" onclick="window.thriftBlog.navigateToIndex()">Blog</a>
                    <span class="separator">›</span>
                    <span id="current-article">Article</span>
                </nav>

                <article class="article-content">
                    <!-- Article Header -->
                    <header class="article-header">
                        <div class="article-category" id="article-category-badge">
                            Loading...
                        </div>
                        <h1 class="article-title" id="main-article-title">
                            Loading Article...
                        </h1>
                        <div class="article-meta">
                            <div class="article-author">
                                <img src="../images/author-avatar.png" alt="Author" class="author-avatar">
                                <span class="author-name" id="article-author">Thrift Zone Team</span>
                            </div>
                            <div class="article-date">
                                <i class="fas fa-calendar"></i>
                                <span id="article-date">Loading...</span>
                            </div>
                            <div class="article-reading-time">
                                <i class="fas fa-clock"></i>
                                <span id="reading-time">5 min read</span>
                            </div>
                        </div>
                        <div class="article-share">
                            <span class="share-label">Share:</span>
                            <button class="share-btn facebook" onclick="shareOnFacebook()">
                                <i class="fab fa-facebook"></i>
                            </button>
                            <button class="share-btn twitter" onclick="shareOnTwitter()">
                                <i class="fab fa-twitter"></i>
                            </button>
                            <button class="share-btn whatsapp" onclick="shareOnWhatsApp()">
                                <i class="fab fa-whatsapp"></i>
                            </button>
                            <button class="share-btn copy" onclick="copyArticleLink()">
                                <i class="fas fa-link"></i>
                            </button>
                        </div>
                    </header>

                    <!-- Article Featured Image -->
                    <div class="article-image">
                        <img id="article-featured-image" src="" alt="" loading="eager">
                    </div>

                    <!-- Article Body -->
                    <div class="article-body" id="article-body">
                        <!-- Content will be loaded here -->
                    </div>

                    <!-- Article Tags -->
                    <div class="article-tags" id="article-tags">
                        <!-- Tags will be loaded here -->
                    </div>

                    <!-- Article Actions -->
                    <div class="article-actions">
                        <button class="action-btn like-btn" onclick="likeArticle()">
                            <i class="far fa-heart"></i>
                            <span id="like-count">0</span>
                        </button>
                        <button class="action-btn share-btn" onclick="shareArticle()">
                            <i class="fas fa-share"></i>
                            Share
                        </button>
                        <button class="action-btn bookmark-btn" onclick="bookmarkArticle()">
                            <i class="far fa-bookmark"></i>
                            Save
                        </button>
                    </div>
                </article>

                <!-- Related Articles -->
                <section class="related-articles">
                    <h3>Related Articles</h3>
                    <div class="related-articles-grid" id="related-articles-grid">
                        <!-- Related articles will be loaded here -->
                    </div>
                </section>

                <!-- Comments Section -->
                <section class="comments-section">
                    <h3>Comments</h3>
                    <div class="comment-form">
                        <textarea placeholder="Share your thoughts about this article..." id="comment-text"></textarea>
                        <button class="submit-comment-btn" onclick="submitComment()">
                            <i class="fas fa-paper-plane"></i>
                            Post Comment
                        </button>
                    </div>
                    <div class="comments-list" id="comments-list">
                        <!-- Comments will be loaded here -->
                    </div>
                </section>
            </div>
        `;
    }

    navigateToIndex() {
        this.navigateToUrl('/blog/');
    }

    navigateToArticle(slug) {
        this.navigateToUrl(`/blog/${slug}/`);
    }

    navigateToUrl(url) {
        history.pushState(null, null, url);
        this.handleRoute();
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













// Image Optimization Functions
class ImageOptimizer {
    constructor() {
        this.supportedFormats = this.checkImageSupport();
        this.lazyImageObserver = null;
        this.initLazyLoading();
    }

    checkImageSupport() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        return {
            webp: canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0,
            avif: canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0
        };
    }

    getOptimizedImageUrl(imagePath, format = 'webp') {
        if (!imagePath) return '';
        
        const pathParts = imagePath.split('.');
        const extension = pathParts.pop();
        const basePath = pathParts.join('.');
        
        // Return WebP version if supported, otherwise original
        if (this.supportedFormats.webp && format === 'webp') {
            return `${basePath}.webp`;
        }
        
        return imagePath;
    }

    generateImageSrcSet(imagePath) {
        if (!imagePath) return '';
        
        const pathParts = imagePath.split('.');
        const extension = pathParts.pop();
        const basePath = pathParts.join('.');
        
        const sizes = [320, 640, 960, 1280];
        const srcSet = sizes.map(size => 
            `${basePath}-${size}w.${extension} ${size}w`
        ).join(', ');
        
        return srcSet;
    }

    optimizeImage(imgElement, imagePath, alt = '', caption = '') {
        // Set loading attributes
        imgElement.loading = 'lazy';
        imgElement.decoding = 'async';
        
        // Set alt text for SEO
        imgElement.alt = alt || this.generateAltText(imagePath);
        
        // Add structured data attributes
        imgElement.setAttribute('itemProp', 'image');
        
        // Set optimized source
        const optimizedSrc = this.getOptimizedImageUrl(imagePath);
        imgElement.src = optimizedSrc;
        
        // Add srcset for responsive images
        const srcSet = this.generateImageSrcSet(imagePath);
        if (srcSet) {
            imgElement.srcset = srcSet;
            imgElement.sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
        }
        
        // Add error handling
        imgElement.onerror = () => {
            imgElement.classList.add('image-error');
            console.error(`Failed to load image: ${imagePath}`);
        };
        
        // Add load success handler
        imgElement.onload = () => {
            imgElement.classList.add('loaded');
            imgElement.classList.remove('loading');
        };
        
        return imgElement;
    }

    generateAltText(imagePath) {
        const filename = imagePath.split('/').pop().split('.')[0];
        return filename.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    initLazyLoading() {
        if ('IntersectionObserver' in window) {
            this.lazyImageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.dataset.src;
                        
                        if (src) {
                            img.src = src;
                            img.classList.remove('lazy-image');
                            img.classList.add('loaded');
                            this.lazyImageObserver.unobserve(img);
                        }
                    }
                });
            });
        }
    }

    makeLazy(imgElement, src) {
        imgElement.dataset.src = src;
        imgElement.classList.add('lazy-image');
        imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+';
        
        if (this.lazyImageObserver) {
            this.lazyImageObserver.observe(imgElement);
        }
    }

    addImageSchema(article) {
        const existingSchema = document.querySelector('script[type="application/ld+json"]');
        if (existingSchema) {
            const schema = JSON.parse(existingSchema.textContent);
            
            // Add image information to existing schema
            if (article.images) {
                schema.image = {
                    "@type": "ImageObject",
                    "url": window.location.origin + "/" + article.images.featured,
                    "width": 1200,
                    "height": 630,
                    "caption": article.imageAlt || article.title
                };
                
                // Add thumbnail
                if (article.images.thumbnail) {
                    schema.thumbnailUrl = window.location.origin + "/" + article.images.thumbnail;
                }
            }
            
            existingSchema.textContent = JSON.stringify(schema);
        }
    }
}

// Initialize Image Optimizer
const imageOptimizer = new ImageOptimizer();

// Enhanced Article Card Creation with Image Optimization
ThriftZoneBlog.prototype.createArticleCard = function(article) {
    const card = document.createElement('div');
    card.className = 'article-card';
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    card.style.cursor = 'pointer';

    // Use thumbnail if available, otherwise use main image
    const imageUrl = article.images?.thumbnail || article.image;
    const imageAlt = article.imageAlt || `${article.title} - ${this.getCategoryName(article.category)}`;

    card.innerHTML = `
        <div class="article-card-image">
            <img class="lazy-image" 
                 data-src="${imageUrl}" 
                 alt="${imageAlt}"
                 loading="lazy"
                 decoding="async">
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

    // Optimize the image
    const img = card.querySelector('img');
    imageOptimizer.makeLazy(img, imageUrl);

    card.addEventListener('click', () => {
        this.navigateToArticle(article.slug);
    });

    return card;
};

// Enhanced Article Rendering with SEO Images
ThriftZoneBlog.prototype.renderArticle = function(article) {
    // Update page title and meta with SEO data
    const seoTitle = article.seo?.metaTitle || `${article.title} - Thrift Zone Blog`;
    const seoDescription = article.seo?.metaDescription || article.excerpt;
    
    document.title = seoTitle;
    
    // Update meta description
    this.updateMetaTag('name', 'description', seoDescription);
    
    // Update Open Graph meta tags with optimized images
    const socialImage = article.images?.social || article.images?.featured || article.image;
    this.updateMetaTag('property', 'og:title', article.title);
    this.updateMetaTag('property', 'og:description', seoDescription);
    this.updateMetaTag('property', 'og:image', window.location.origin + '/' + socialImage);
    this.updateMetaTag('property', 'og:url', window.location.href);
    this.updateMetaTag('property', 'og:type', 'article');
    
    // Add Twitter Card meta tags
    this.updateMetaTag('name', 'twitter:card', 'summary_large_image');
    this.updateMetaTag('name', 'twitter:image', window.location.origin + '/' + socialImage);
    
    // Update canonical URL
    const canonicalUrl = article.seo?.canonicalUrl || window.location.pathname;
    this.updateLinkTag('canonical', window.location.origin + canonicalUrl);

    // Update breadcrumb
    document.getElementById('current-article').textContent = article.title;

    // Update article header
    document.getElementById('article-category-badge').textContent = this.getCategoryName(article.category);
    document.getElementById('main-article-title').textContent = article.title;
    document.getElementById('article-author').textContent = article.author || 'Thrift Zone Team';
    document.getElementById('article-date').textContent = this.formatDate(article.date);
    document.getElementById('reading-time').textContent = `${article.readTime} min read`;

    // Update featured image with optimization
    const featuredImage = document.getElementById('article-featured-image');
    const mainImageUrl = article.images?.featured || article.image;
    const imageAlt = article.imageAlt || article.title;
    
    imageOptimizer.optimizeImage(featuredImage, mainImageUrl, imageAlt);

    // Update article body
    const articleBody = document.getElementById('article-body');
    if (article.content) {
        articleBody.innerHTML = article.content;
        
        // Optimize all images in article content
        const contentImages = articleBody.querySelectorAll('img');
        contentImages.forEach(img => {
            if (img.src) {
                imageOptimizer.optimizeImage(img, img.src, img.alt);
            }
        });
    } else {
        articleBody.innerHTML = this.generateArticleContent(article);
    }

    // Add image gallery if available
    if (article.images?.gallery && article.images.gallery.length > 0) {
        const galleryHtml = `
            <div class="image-gallery">
                ${article.images.gallery.map(imgUrl => `
                    <div class="gallery-image">
                        <img class="lazy-image" 
                             data-src="${imgUrl}" 
                             alt="${article.title} gallery image"
                             loading="lazy">
                    </div>
                `).join('')}
            </div>
        `;
        articleBody.insertAdjacentHTML('beforeend', galleryHtml);
        
        // Initialize lazy loading for gallery images
        const galleryImages = articleBody.querySelectorAll('.gallery-image img');
        galleryImages.forEach(img => {
            imageOptimizer.makeLazy(img, img.dataset.src);
        });
    }

    // Update tags
    const tagsContainer = document.getElementById('article-tags');
    tagsContainer.innerHTML = article.tags.map(tag => 
        `<a href="javascript:void(0)" class="tag" onclick="window.thriftBlog.searchByTag('${tag}')">#${tag}</a>`
    ).join('');

    // Update like count
    document.getElementById('like-count').textContent = article.likes || 0;

    // Add enhanced structured data with image information
    this.addEnhancedStructuredData(article);
    
    // Add image schema
    imageOptimizer.addImageSchema(article);
};

// Helper function to update link tags
ThriftZoneBlog.prototype.updateLinkTag = function(rel, href) {
    let link = document.querySelector(`link[rel="${rel}"]`);
    if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
    }
    link.href = href;
};

// Enhanced structured data with image information
ThriftZoneBlog.prototype.addEnhancedStructuredData = function(article) {
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
        existingScript.remove();
    }

    const mainImage = article.images?.featured || article.image;
    const thumbnailImage = article.images?.thumbnail;

    // Enhanced structured data
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": article.title,
        "description": article.seo?.metaDescription || article.excerpt,
        "author": {
            "@type": "Person",
            "name": article.author || "Thrift Zone Team"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Thrift Zone",
            "logo": {
                "@type": "ImageObject",
                "url": window.location.origin + "/images/logo-icon.png",
                "width": 60,
                "height": 60
            }
        },
        "datePublished": article.date,
        "dateModified": article.date,
        "image": {
            "@type": "ImageObject",
            "url": window.location.origin + "/" + mainImage,
            "width": 1200,
            "height": 630,
            "caption": article.imageAlt || article.title
        },
        "url": window.location.href,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": window.location.href
        },
        "wordCount": this.calculateWordCount(article.content),
        "keywords": article.tags.join(", ")
    };

    // Add thumbnail if available
    if (thumbnailImage) {
        structuredData.thumbnailUrl = window.location.origin + "/" + thumbnailImage;
    }

    // Add image gallery if available
    if (article.images?.gallery && article.images.gallery.length > 0) {
        structuredData.image = [
            structuredData.image,
            ...article.images.gallery.map(imgUrl => ({
                "@type": "ImageObject",
                "url": window.location.origin + "/" + imgUrl,
                "caption": `${article.title} - Additional Image`
            }))
        ];
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
};

// Helper function to calculate word count
ThriftZoneBlog.prototype.calculateWordCount = function(content) {
    if (!content) return 0;
    const text = content.replace(/<[^>]*>/g, '');
    return text.trim().split(/\s+/).length;
};












        

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
        let debounceTimer;
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    const query = e.target.value.toLowerCase();
                    if (query.length > 2) {
                        this.searchArticles(query);
                    } else if (query.length === 0) {
                        this.renderArticles();
                    }
                }, 300);
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
                    <button class="featured-cta" onclick="window.thriftBlog.navigateToArticle('${featuredArticle.slug}')">
                        Read Full Article <i class="fas fa-arrow-right"></i>
                    </button>
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
        card.style.cursor = 'pointer';

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
            this.navigateToArticle(article.slug);
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

    renderArticle(article) {
        // Update page title and meta
        document.title = `${article.title} - Thrift Zone Blog`;
        
        // Update meta description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            document.head.appendChild(metaDesc);
        }
        metaDesc.content = article.excerpt;

        // Update Open Graph meta tags
        this.updateMetaTag('property', 'og:title', article.title);
        this.updateMetaTag('property', 'og:description', article.excerpt);
        this.updateMetaTag('property', 'og:image', window.location.origin + '/' + article.image);
        this.updateMetaTag('property', 'og:url', window.location.href);
        this.updateMetaTag('property', 'og:type', 'article');

        // Update breadcrumb
        document.getElementById('current-article').textContent = article.title;

        // Update article header
        document.getElementById('article-category-badge').textContent = this.getCategoryName(article.category);
        document.getElementById('main-article-title').textContent = article.title;
        document.getElementById('article-author').textContent = article.author || 'Thrift Zone Team';
        document.getElementById('article-date').textContent = this.formatDate(article.date);
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
            articleBody.innerHTML = this.generateArticleContent(article);
        }

        // Update tags
        const tagsContainer = document.getElementById('article-tags');
        tagsContainer.innerHTML = article.tags.map(tag => 
            `<a href="javascript:void(0)" class="tag" onclick="window.thriftBlog.searchByTag('${tag}')">#${tag}</a>`
        ).join('');

        // Update like count
        document.getElementById('like-count').textContent = article.likes || 0;

        // Add structured data
        this.addStructuredData(article);
    }

    updateMetaTag(attribute, attributeValue, content) {
        let meta = document.querySelector(`meta[${attribute}="${attributeValue}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute(attribute, attributeValue);
            document.head.appendChild(meta);
        }
        meta.content = content;
    }

    addStructuredData(article) {
        // Remove existing structured data
        const existingScript = document.querySelector('script[type="application/ld+json"]');
        if (existingScript) {
            existingScript.remove();
        }

        // Add new structured data
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": article.title,
            "description": article.excerpt,
            "author": {
                "@type": "Person",
                "name": article.author || "Thrift Zone Team"
            },
            "publisher": {
                "@type": "Organization",
                "name": "Thrift Zone",
                "logo": {
                    "@type": "ImageObject",
                    "url": window.location.origin + "/images/logo-icon.png"
                }
            },
            "datePublished": article.date,
            "dateModified": article.date,
            "image": window.location.origin + "/" + article.image,
            "url": window.location.href,
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": window.location.href
            }
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(structuredData);
        document.head.appendChild(script);
    }

    async loadRelatedArticles(category, currentArticleId) {
        const relatedArticles = this.articles
            .filter(article => article.category === category && article.id !== currentArticleId)
            .slice(0, 3);

        const relatedGrid = document.getElementById('related-articles-grid');
        if (relatedGrid && relatedArticles.length > 0) {
            relatedGrid.innerHTML = relatedArticles.map(article => `
                <div class="article-card" onclick="window.thriftBlog.navigateToArticle('${article.slug}')">
                    <div class="article-card-image">
                        <img src="${article.image}" alt="${article.title}">
                    </div>
                    <div class="article-card-content">
                        <h4 class="article-card-title">${article.title}</h4>
                        <div class="article-card-meta">
                            <span><i class="fas fa-calendar"></i> ${this.formatDate(article.date)}</span>
                            <span><i class="fas fa-clock"></i> ${article.readTime} min</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    showArticleNotFound() {
        const articleMain = document.querySelector('.article-main');
        if (articleMain) {
            articleMain.innerHTML = `
                <div class="container">
                    <div style="text-align: center; padding: 4rem 0;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #ef4444; margin-bottom: 2rem;"></i>
                        <h1>Article Not Found</h1>
                        <p>The article you're looking for doesn't exist or may have been removed.</p>
                        <button class="btn-primary" onclick="window.thriftBlog.navigateToIndex()">Back to Blog</button>
                    </div>
                </div>
            `;
        }
    }

    searchByTag(tag) {
        this.navigateToIndex();
        setTimeout(() => {
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = tag;
                this.searchArticles(tag);
            }
        }, 100);
    }

    generateArticleContent(article) {
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
                slug: 'top-10-amazon-deals-this-week-save-up-to-70',
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
            }
        ];
    }
}

// Social sharing functions
function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
}

function shareOnTwitter() {
    const title = encodeURIComponent(document.querySelector('#main-article-title').textContent);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${title}&url=${url}`, '_blank', 'width=600,height=400');
}

function shareOnWhatsApp() {
    const title = document.querySelector('#main-article-title').textContent;
    const url = window.location.href;
    const text = encodeURIComponent(`${title} - ${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
}

function copyArticleLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        window.thriftBlog.showNotification('Article link copied to clipboard!', 'success');
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
        const title = document.querySelector('#main-article-title').textContent;
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
        window.thriftBlog.showNotification('Article removed from bookmarks', 'info');
    } else {
        bookmarkBtn.classList.add('bookmarked');
        bookmarkBtn.querySelector('i').className = 'fas fa-bookmark';
        window.thriftBlog.showNotification('Article bookmarked!', 'success');
    }
}

function submitComment() {
    const commentText = document.getElementById('comment-text');
    
    if (!commentText.value.trim()) {
        window.thriftBlog.showNotification('Please write a comment before submitting', 'error');
        return;
    }

    // Simulate comment submission
    window.thriftBlog.showNotification('Comment submitted successfully!', 'success');
    commentText.value = '';
}

// Initialize blog
document.addEventListener('DOMContentLoaded', () => {
    window.thriftBlog = new ThriftZoneBlog();
});
