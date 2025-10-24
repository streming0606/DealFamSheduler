// Thrift Maal Blog - Single Post JavaScript
// Handles individual blog post functionality

// Global Variables
let currentPost = null;
let relatedPosts = [];

// DOM Elements
const postTitle = document.getElementById('post-title');
const postAuthor = document.getElementById('post-author');
const postDate = document.getElementById('post-date');
const readingTime = document.getElementById('reading-time');
const postViews = document.getElementById('post-views');
const postBody = document.getElementById('post-body');
const postTags = document.getElementById('post-tags');
const postCategoryBadge = document.getElementById('post-category-badge');
const featuredImageContainer = document.getElementById('featured-image-container');
const tocList = document.getElementById('toc-list');
const sidebarTOC = document.getElementById('sidebar-toc');
const relatedPostsContainer = document.getElementById('related-posts');
const sidebarPopular = document.getElementById('sidebar-popular');
const breadcrumbNav = document.getElementById('breadcrumb-nav');
const authorName = document.getElementById('author-name');
const authorBio = document.getElementById('author-bio');

// Initialize Post on Load
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Blog post page initialized');
    initializePost();
});

// Main Initialization
async function initializePost() {
    try {
        // Get post slug from URL
        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('slug');
        
        if (!slug) {
            showError('Blog post not found');
            return;
        }
        
        // Load post data
        await loadPost(slug);
        
        // Render post content
        renderPost();
        
        // Generate table of contents
        generateTableOfContents();
        
        // Load related posts
        loadRelatedPosts();
        
        // Setup share buttons
        setupShareButtons();
        
        // Track page view
        trackPageView();
        
        // Update schema markup
        updateSchemaMarkup();
        
        console.log('✅ Blog post loaded successfully');
    } catch (error) {
        console.error('❌ Error loading post:', error);
        showError('Failed to load blog post');
    }
}

// Load Post Data
async function loadPost(slug) {
    try {
        const response = await fetch('data/blog-posts.json');
        if (!response.ok) throw new Error('Failed to fetch posts');
        
        const data = await response.json();
        currentPost = data.posts.find(post => post.slug === slug);
        
        if (!currentPost) {
            throw new Error('Post not found');
        }
        
        // Increment views (in production, send to backend)
        currentPost.views = (currentPost.views || 0) + 1;
        
        console.log('📖 Post loaded:', currentPost.title);
    } catch (error) {
        throw error;
    }
}

// Render Post Content
function renderPost() {
    // Update page title
    document.title = `${currentPost.title} - Thrift Maal Blog`;
    
    // Update meta tags
    updateMetaTags();
    
    // Update breadcrumb
    updateBreadcrumb();
    
    // Render category badge
    if (postCategoryBadge) {
        postCategoryBadge.innerHTML = `
            <span style="background: var(--primary-color); color: white; padding: 0.375rem 0.875rem; border-radius: 20px; font-size: 0.875rem; font-weight: 600; text-transform: uppercase;">
                <i class="${getCategoryIcon(currentPost.category)}"></i>
                ${formatCategory(currentPost.category)}
            </span>
        `;
    }
    
    // Set post title
    if (postTitle) {
        postTitle.textContent = currentPost.title;
    }
    
    // Set author
    if (postAuthor) {
        postAuthor.textContent = currentPost.author;
    }
    
    if (authorName) {
        authorName.textContent = currentPost.author;
    }
    
    if (authorBio) {
        authorBio.textContent = currentPost.authorBio || 'Expert content writer passionate about helping people save money through smart shopping.';
    }
    
    // Set publish date
    if (postDate) {
        const date = new Date(currentPost.publishDate);
        postDate.textContent = date.toLocaleDateString('en-IN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        postDate.setAttribute('datetime', currentPost.publishDate);
    }
    
    // Set reading time
    if (readingTime) {
        readingTime.textContent = `${currentPost.readTime} min read`;
    }
    
    // Set views
    if (postViews) {
        postViews.textContent = `${currentPost.views || 0} views`;
    }
    
    // Render featured image
    if (featuredImageContainer && currentPost.image) {
        featuredImageContainer.innerHTML = `
            <img src="${currentPost.image}" 
                 alt="${currentPost.title}" 
                 loading="eager"
                 style="width: 100%; height: auto; max-height: 500px; object-fit: cover; border-radius: 12px;"
                 onerror="this.src='../images/placeholder-blog.jpg'">
        `;
    }
    
    // Render post body
    if (postBody) {
        postBody.innerHTML = formatPostContent(currentPost.content);
    }
    
    // Render tags
    if (postTags && currentPost.tags) {
        postTags.innerHTML = currentPost.tags.map(tag => `
            <a href="index.html?tag=${encodeURIComponent(tag)}" class="tag-badge" style="display: inline-block; padding: 0.375rem 0.875rem; background: var(--surface); color: var(--text-secondary); border: 1px solid var(--border); border-radius: 15px; font-size: 0.875rem; text-decoration: none; margin-right: 0.5rem; margin-bottom: 0.5rem; transition: all 0.3s;">
                #${tag}
            </a>
        `).join('');
    }
}

// Format Post Content
function formatPostContent(content) {
    // Convert markdown-style content to HTML
    // This is a simple implementation - in production use a proper markdown parser
    
    let html = content;
    
    // Convert headers
    html = html.replace(/### (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/## (.*?)$/gm, '<h2>$1</h2>');
    
    // Convert bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert lists
    html = html.replace(/^\- (.*?)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*?<\/li>\n?)+/gs, '<ul>$&</ul>');
    
    // Convert paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    
    // Add styling to post body elements
    const style = `
        <style>
            .post-body {
                font-size: 1.0625rem;
                line-height: 1.8;
                color: var(--text-primary);
            }
            .post-body h2 {
                font-family: var(--font-heading);
                font-size: 1.875rem;
                font-weight: 700;
                color: var(--text-primary);
                margin: 2.5rem 0 1.25rem;
                padding-bottom: 0.75rem;
                border-bottom: 2px solid var(--primary-color);
            }
            .post-body h3 {
                font-family: var(--font-heading);
                font-size: 1.5rem;
                font-weight: 600;
                color: var(--text-primary);
                margin: 2rem 0 1rem;
            }
            .post-body h4 {
                font-size: 1.25rem;
                font-weight: 600;
                margin: 1.5rem 0 0.875rem;
            }
            .post-body p {
                margin-bottom: 1.5rem;
                line-height: 1.8;
            }
            .post-body ul, .post-body ol {
                margin: 1.5rem 0 1.5rem 2rem;
                line-height: 1.8;
            }
            .post-body li {
                margin-bottom: 0.75rem;
            }
            .post-body strong {
                font-weight: 600;
                color: var(--text-primary);
            }
            .post-body a {
                color: var(--primary-color);
                text-decoration: underline;
                transition: color 0.3s;
            }
            .post-body a:hover {
                color: var(--primary-hover);
            }
            .post-body img {
                width: 100%;
                height: auto;
                border-radius: 8px;
                margin: 2rem 0;
                box-shadow: var(--shadow-md);
            }
            .post-body blockquote {
                margin: 2rem 0;
                padding: 1.5rem 2rem;
                background: var(--surface);
                border-left: 4px solid var(--primary-color);
                font-style: italic;
                color: var(--text-secondary);
            }
            .post-body code {
                background: var(--code-bg);
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 0.9em;
            }
            .post-body pre {
                background: var(--code-bg);
                padding: 1.5rem;
                border-radius: 8px;
                overflow-x: auto;
                margin: 1.5rem 0;
            }
            .post-body table {
                width: 100%;
                border-collapse: collapse;
                margin: 2rem 0;
            }
            .post-body th, .post-body td {
                padding: 0.75rem;
                border: 1px solid var(--border);
                text-align: left;
            }
            .post-body th {
                background: var(--surface);
                font-weight: 600;
            }
        </style>
    `;
    
    return style + html;
}

// Generate Table of Contents
function generateTableOfContents() {
    if (!postBody) return;
    
    const headings = postBody.querySelectorAll('h2, h3');
    if (headings.length === 0) {
        // Hide TOC if no headings
        document.getElementById('toc-container')?.remove();
        document.querySelector('.sticky-toc-widget')?.remove();
        return;
    }
    
    const tocHTML = Array.from(headings).map((heading, index) => {
        const id = `heading-${index}`;
        heading.id = id;
        
        const level = heading.tagName.toLowerCase();
        const indent = level === 'h3' ? 'margin-left: 1.25rem;' : '';
        
        return `
            <li style="${indent}">
                <a href="#${id}" class="toc-link" style="color: var(--text-secondary); text-decoration: none; display: block; padding: 0.375rem 0; transition: color 0.3s; font-size: ${level === 'h3' ? '0.875rem' : '0.9375rem'};">
                    ${heading.textContent}
                </a>
            </li>
        `;
    }).join('');
    
    if (tocList) {
        tocList.innerHTML = tocHTML;
    }
    
    if (sidebarTOC) {
        sidebarTOC.innerHTML = tocHTML;
    }
    
    // Add click handlers for smooth scroll
    document.querySelectorAll('.toc-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Update URL without reload
                history.pushState(null, '', `#${targetId}`);
            }
        });
        
        // Hover effect
        link.addEventListener('mouseenter', (e) => {
            e.target.style.color = 'var(--primary-color)';
        });
        link.addEventListener('mouseleave', (e) => {
            e.target.style.color = 'var(--text-secondary)';
        });
    });
}

// Load Related Posts
async function loadRelatedPosts() {
    try {
        const response = await fetch('data/blog-posts.json');
        const data = await response.json();
        
        // Get posts from same category, excluding current post
        relatedPosts = data.posts
            .filter(post => 
                post.category === currentPost.category && 
                post.slug !== currentPost.slug
            )
            .slice(0, 3);
        
        renderRelatedPosts();
        renderSidebarPopular();
    } catch (error) {
        console.error('Error loading related posts:', error);
    }
}

// Render Related Posts
function renderRelatedPosts() {
    if (!relatedPostsContainer || relatedPosts.length === 0) return;
    
    const html = relatedPosts.map(post => `
        <article class="blog-card">
            <a href="post.html?slug=${post.slug}" style="text-decoration: none; color: inherit;">
                <div class="blog-card-image" style="width: 100%; height: 200px; overflow: hidden; border-radius: 10px 10px 0 0;">
                    <img src="${post.image}" 
                         alt="${post.title}" 
                         loading="lazy"
                         style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s;"
                         onmouseover="this.style.transform='scale(1.05)'"
                         onmouseout="this.style.transform='scale(1)'"
                         onerror="this.src='../images/placeholder-blog.jpg'">
                </div>
                <div class="blog-card-content" style="padding: 1.5rem;">
                    <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.75rem; line-height: 1.4;">
                        ${post.title}
                    </h3>
                    <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 1rem; line-height: 1.6;">
                        ${post.excerpt}
                    </p>
                    <div style="display: flex; align-items: center; gap: 1rem; font-size: 0.8125rem; color: var(--text-muted);">
                        <span><i class="fas fa-calendar"></i> ${formatDate(post.publishDate)}</span>
                        <span><i class="fas fa-clock"></i> ${post.readTime} min</span>
                    </div>
                </div>
            </a>
        </article>
    `).join('');
    
    relatedPostsContainer.innerHTML = html;
}

// Render Sidebar Popular Posts
function renderSidebarPopular() {
    if (!sidebarPopular) return;
    
    // Get popular posts
    fetch('data/blog-posts.json')
        .then(res => res.json())
        .then(data => {
            const popularPosts = data.posts
                .sort((a, b) => b.views - a.views)
                .slice(0, 5);
            
            const html = popularPosts.map(post => `
                <a href="post.html?slug=${post.slug}" style="display: flex; gap: 0.875rem; padding: 0.875rem 0; border-bottom: 1px solid var(--border); text-decoration: none; color: inherit; transition: transform 0.2s;">
                    <div style="width: 80px; height: 80px; border-radius: 6px; overflow: hidden; flex-shrink: 0;">
                        <img src="${post.image}" 
                             alt="${post.title}"
                             loading="lazy"
                             style="width: 100%; height: 100%; object-fit: cover;"
                             onerror="this.src='../images/placeholder-blog.jpg'">
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <h5 style="font-size: 0.875rem; font-weight: 600; margin-bottom: 0.375rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                            ${post.title}
                        </h5>
                        <p style="font-size: 0.75rem; color: var(--text-muted);">
                            <i class="fas fa-calendar"></i> ${formatDate(post.publishDate)}
                        </p>
                    </div>
                </a>
            `).join('');
            
            sidebarPopular.innerHTML = html;
        })
        .catch(err => console.error('Error loading popular posts:', err));
}

// Setup Share Buttons
function setupShareButtons() {
    const shareButtons = document.querySelectorAll('.share-btn');
    const currentURL = window.location.href;
    const title = currentPost.title;
    
    shareButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const platform = btn.dataset.platform;
            
            switch(platform) {
                case 'facebook':
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentURL)}`, '_blank', 'width=600,height=400');
                    break;
                case 'twitter':
                    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentURL)}&text=${encodeURIComponent(title)}`, '_blank', 'width=600,height=400');
                    break;
                case 'whatsapp':
                    window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + currentURL)}`, '_blank');
                    break;
                case 'linkedin':
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentURL)}`, '_blank', 'width=600,height=400');
                    break;
                case 'copy':
                    copyToClipboard(currentURL);
                    showToast('Link copied to clipboard!', 'success');
                    break;
            }
            
            // Track share event
            if (typeof gtag !== 'undefined') {
                gtag('event', 'share', {
                    'event_category': 'engagement',
                    'event_label': platform,
                    'value': currentPost.slug
                });
            }
        });
    });
}

// Update Breadcrumb
function updateBreadcrumb() {
    if (!breadcrumbNav) return;
    
    const html = `
        <li class="breadcrumb-item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a href="../index.html" itemprop="item" style="color: var(--primary-color); text-decoration: none;">
                <span itemprop="name">Home</span>
            </a>
            <meta itemprop="position" content="1" />
        </li>
        <li class="breadcrumb-item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a href="index.html" itemprop="item" style="color: var(--primary-color); text-decoration: none;">
                <span itemprop="name">Blog</span>
            </a>
            <meta itemprop="position" content="2" />
        </li>
        <li class="breadcrumb-item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a href="index.html?category=${currentPost.category}" itemprop="item" style="color: var(--primary-color); text-decoration: none;">
                <span itemprop="name">${formatCategory(currentPost.category)}</span>
            </a>
            <meta itemprop="position" content="3" />
        </li>
        <li class="breadcrumb-item active" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <span itemprop="name" style="color: var(--text-muted);">${currentPost.title}</span>
            <meta itemprop="position" content="4" />
        </li>
    `;
    
    breadcrumbNav.innerHTML = html;
}

// Update Meta Tags
function updateMetaTags() {
    // Description
    document.querySelector('meta[name="description"]').setAttribute('content', currentPost.excerpt);
    
    // Keywords
    if (currentPost.tags) {
        document.querySelector('meta[name="keywords"]').setAttribute('content', currentPost.tags.join(', '));
    }
    
    // Author
    document.querySelector('meta[name="author"]').setAttribute('content', currentPost.author);
    
    // Article meta tags
    document.querySelector('meta[property="article:published_time"]').setAttribute('content', currentPost.publishDate);
    document.querySelector('meta[property="article:modified_time"]').setAttribute('content', currentPost.modifiedDate || currentPost.publishDate);
    document.querySelector('meta[property="article:author"]').setAttribute('content', currentPost.author);
    document.querySelector('meta[property="article:section"]').setAttribute('content', formatCategory(currentPost.category));
    
    // Open Graph
    document.querySelector('meta[property="og:title"]').setAttribute('content', currentPost.title);
    document.querySelector('meta[property="og:description"]').setAttribute('content', currentPost.excerpt);
    document.querySelector('meta[property="og:url"]').setAttribute('content', window.location.href);
    document.querySelector('meta[property="og:image"]').setAttribute('content', currentPost.image);
    
    // Twitter Card
    document.querySelector('meta[name="twitter:title"]').setAttribute('content', currentPost.title);
    document.querySelector('meta[name="twitter:description"]').setAttribute('content', currentPost.excerpt);
    document.querySelector('meta[name="twitter:image"]').setAttribute('content', currentPost.image);
    
    // Canonical URL
    document.querySelector('link[rel="canonical"]').setAttribute('href', window.location.href);
}

// Update Schema Markup
function updateSchemaMarkup() {
    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": currentPost.title,
        "description": currentPost.excerpt,
        "image": currentPost.image,
        "datePublished": currentPost.publishDate,
        "dateModified": currentPost.modifiedDate || currentPost.publishDate,
        "author": {
            "@type": "Person",
            "name": currentPost.author
        },
        "publisher": {
            "@type": "Organization",
            "name": "Thrift Maal",
            "logo": {
                "@type": "ImageObject",
                "url": "https://thriftmaal.com/images/logo.png"
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": window.location.href
        }
    };
    
    document.getElementById('article-schema').textContent = JSON.stringify(articleSchema);
}

// Track Page View
function trackPageView() {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            'page_title': currentPost.title,
            'page_location': window.location.href,
            'page_path': window.location.pathname
        });
    }
}

// Utility Functions
function formatCategory(category) {
    return category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function getCategoryIcon(category) {
    const icons = {
        'shopping-tips': 'fas fa-lightbulb',
        'deal-guides': 'fas fa-tags',
        'product-reviews': 'fas fa-star',
        'festival-sales': 'fas fa-gift',
        'student-discounts': 'fas fa-graduation-cap',
        'brand-reviews': 'fas fa-building'
    };
    return icons[category] || 'fas fa-folder';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background-color: ${type === 'success' ? '#10B981' : '#EF4444'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showError(message) {
    if (postBody) {
        postBody.innerHTML = `
            <div style="text-align: center; padding: 4rem 2rem;">
                <i class="fas fa-exclamation-circle" style="font-size: 4rem; color: var(--error); margin-bottom: 1.5rem;"></i>
                <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">${message}</h2>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">The blog post you're looking for doesn't exist or has been removed.</p>
                <a href="index.html" style="display: inline-block; padding: 0.875rem 2rem; background: var(--primary-color); color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
                    <i class="fas fa-arrow-left"></i> Back to Blog
                </a>
            </div>
        `;
    }
}
