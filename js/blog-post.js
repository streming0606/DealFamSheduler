// ============================================================================
// THRIFT MAAL BLOG POST - JAVASCRIPT
// Individual Blog Post Page Functionality
// ============================================================================

let currentPost = null;
let allBlogPosts = [];

// Initialize Blog Post Page
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📄 Blog Post Page initialized');
    
    // Get post slug from URL
    const postSlug = getPostSlugFromURL();
    
    if (postSlug) {
        await loadBlogPost(postSlug);
        setupShareButtons();
        generateTableOfContents();
        setupStickyElements();
        trackPageView();
    } else {
        showError('Post not found');
    }
});

// Get Post Slug from URL
function getPostSlugFromURL() {
    const pathParts = window.location.pathname.split('/');
    return pathParts[pathParts.length - 1].replace('.html', '');
}

// Load Blog Post Data
async function loadBlogPost(slug) {
    try {
        const response = await fetch('../data/blog-data.json');
        const data = await response.json();
        allBlogPosts = data.posts;
        
        currentPost = allBlogPosts.find(post => post.slug === slug);
        
        if (currentPost) {
            renderBlogPost(currentPost);
            renderRelatedPosts(currentPost);
            renderSidebarPopularPosts();
            updateSEOTags(currentPost);
        } else {
            showError('Blog post not found');
        }
    } catch (error) {
        console.error('Error loading blog post:', error);
        showError('Failed to load blog post');
    }
}

// Render Blog Post Content
function renderBlogPost(post) {
    // Update breadcrumb
    updateBreadcrumb(post);
    
    // Update article header
    document.getElementById('article-category').textContent = getCategoryName(post.category);
    document.getElementById('article-date').textContent = formatDate(post.publishDate);
    document.getElementById('article-date').setAttribute('datetime', post.publishDate);
    document.getElementById('reading-time').textContent = post.readTime;
    document.getElementById('article-title').textContent = post.title;
    document.getElementById('author-name').textContent = post.author;
    document.getElementById('article-updated').textContent = formatDate(post.updatedDate || post.publishDate);
    
    // Update featured image
    const featuredImage = document.getElementById('featured-image');
    featuredImage.src = post.image;
    featuredImage.alt = post.title;
    
    // Render article content
    renderArticleContent(post.content);
    
    // Render tags
    renderTags(post.tags);
    
    // Update author bio
    document.getElementById('author-bio-name').textContent = post.author;
    document.getElementById('author-bio-description').textContent = post.authorBio || 'Expert writer at Thrift Maal, passionate about helping people save money through smart shopping.';
}

// Render Article Content
function renderArticleContent(content) {
    const articleContent = document.getElementById('article-content');
    
    if (Array.isArray(content)) {
        // Content is structured array
        const contentHTML = content.map(section => {
            switch(section.type) {
                case 'heading':
                    return `<h${section.level} id="${slugify(section.text)}">${section.text}</h${section.level}>`;
                case 'paragraph':
                    return `<p>${section.text}</p>`;
                case 'list':
                    const items = section.items.map(item => `<li>${item}</li>`).join('');
                    return section.ordered ? `<ol>${items}</ol>` : `<ul>${items}</ul>`;
                case 'quote':
                    return `<blockquote>${section.text}</blockquote>`;
                case 'image':
                    return `<img src="${section.src}" alt="${section.alt}" loading="lazy">`;
                default:
                    return '';
            }
        }).join('');
        
        articleContent.innerHTML = contentHTML;
    } else {
        // Content is HTML string
        articleContent.innerHTML = content;
    }
    
    // Add affiliate notice to external links
    addAffiliateLinkNotice();
}

// Generate Table of Contents
function generateTableOfContents() {
    const articleContent = document.getElementById('article-content');
    const headings = articleContent.querySelectorAll('h2, h3');
    const tocList = document.getElementById('toc-list');
    const tocContainer = document.getElementById('table-of-contents');
    
    if (headings.length < 3) {
        tocContainer.style.display = 'none';
        return;
    }
    
    const tocHTML = Array.from(headings).map(heading => {
        const id = heading.id || slugify(heading.textContent);
        heading.id = id;
        
        const indent = heading.tagName === 'H3' ? 'style="margin-left: 20px;"' : '';
        return `<li ${indent}><a href="#${id}">${heading.textContent}</a></li>`;
    }).join('');
    
    tocList.innerHTML = tocHTML;
    
    // Smooth scroll to sections
    tocList.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').slice(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Render Tags
function renderTags(tags) {
    const tagsContainer = document.getElementById('article-tags-list');
    const tagsHTML = tags.map(tag => `
        <span class="tag-item">${tag}</span>
    `).join('');
    tagsContainer.innerHTML = tagsHTML;
}

// Render Related Posts
function renderRelatedPosts(currentPost) {
    const relatedPosts = allBlogPosts
        .filter(post => 
            post.id !== currentPost.id && 
            (post.category === currentPost.category || 
             post.tags.some(tag => currentPost.tags.includes(tag)))
        )
        .slice(0, 3);
    
    const relatedPostsGrid = document.getElementById('related-posts-grid');
    
    if (relatedPosts.length === 0) {
        relatedPostsGrid.innerHTML = '<p>No related articles found.</p>';
        return;
    }
    
    const relatedHTML = relatedPosts.map(post => `
        <div class="blog-card">
            <div class="blog-card-image">
                <img src="${post.image}" alt="${post.title}" loading="lazy">
                <span class="blog-card-category">${getCategoryName(post.category)}</span>
            </div>
            <div class="blog-card-content">
                <div class="blog-card-meta">
                    <span><i class="far fa-calendar"></i> ${formatDate(post.publishDate)}</span>
                </div>
                <h3 class="blog-card-title">${post.title}</h3>
                <a href="${post.url}" class="blog-card-read-more">
                    Read Article <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </div>
    `).join('');
    
    relatedPostsGrid.innerHTML = relatedHTML;
}

// Render Sidebar Popular Posts
function renderSidebarPopularPosts() {
    const popularPosts = allBlogPosts
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);
    
    const sidebarPopularPosts = document.getElementById('sidebar-popular-posts');
    
    const popularHTML = popularPosts.map(post => `
        <div class="popular-post-item" onclick="window.location.href='${post.url}'">
            <div class="popular-post-image">
                <img src="${post.image}" alt="${post.title}" loading="lazy">
            </div>
            <div class="popular-post-info">
                <h4 class="popular-post-title">${post.title}</h4>
                <p class="popular-post-date">${formatDate(post.publishDate)}</p>
            </div>
        </div>
    `).join('');
    
    sidebarPopularPosts.innerHTML = popularHTML;
}

// Update Breadcrumb
function updateBreadcrumb(post) {
    const breadcrumbList = document.getElementById('breadcrumb-list');
    breadcrumbList.innerHTML = `
        <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a itemprop="item" href="/">
                <span itemprop="name">Home</span>
            </a>
            <meta itemprop="position" content="1" />
        </li>
        <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a itemprop="item" href="/blog/">
                <span itemprop="name">Blog</span>
            </a>
            <meta itemprop="position" content="2" />
        </li>
        <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a itemprop="item" href="/blog/category/${post.category}">
                <span itemprop="name">${getCategoryName(post.category)}</span>
            </a>
            <meta itemprop="position" content="3" />
        </li>
        <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <span itemprop="name">${post.title}</span>
            <meta itemprop="position" content="4" />
        </li>
    `;
}

// Update SEO Meta Tags
function updateSEOTags(post) {
    // Page title
    document.getElementById('page-title').textContent = `${post.title} - Thrift Maal Blog`;
    document.title = `${post.title} - Thrift Maal Blog`;
    
    // Meta description
    document.getElementById('page-description').setAttribute('content', post.excerpt);
    
    // Keywords
    document.getElementById('page-keywords').setAttribute('content', post.tags.join(', '));
    
    // Author
    document.getElementById('page-author').setAttribute('content', post.author);
    
    // Canonical URL
    const canonicalUrl = `https://thriftmaal.com${post.url}`;
    document.getElementById('page-canonical').setAttribute('href', canonicalUrl);
    
    // Open Graph tags
    document.getElementById('og-title').setAttribute('content', post.title);
    document.getElementById('og-description').setAttribute('content', post.excerpt);
    document.getElementById('og-url').setAttribute('content', canonicalUrl);
    document.getElementById('og-image').setAttribute('content', post.image);
    document.getElementById('article-published').setAttribute('content', post.publishDate);
    document.getElementById('article-modified').setAttribute('content', post.updatedDate || post.publishDate);
    document.getElementById('article-author').setAttribute('content', post.author);
    
    // Twitter Card tags
    document.getElementById('twitter-title').setAttribute('content', post.title);
    document.getElementById('twitter-description').setAttribute('content', post.excerpt);
    document.getElementById('twitter-image').setAttribute('content', post.image);
    
    // Update Schema.org structured data
    const schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.excerpt,
        "image": post.image,
        "author": {
            "@type": "Person",
            "name": post.author
        },
        "publisher": {
            "@type": "Organization",
            "name": "Thrift Maal",
            "logo": {
                "@type": "ImageObject",
                "url": "https://thriftmaal.com/images/logo.png"
            }
        },
        "datePublished": post.publishDate,
        "dateModified": post.updatedDate || post.publishDate,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonicalUrl
        },
        "keywords": post.tags.join(', '),
        "articleSection": getCategoryName(post.category),
        "wordCount": calculateWordCount(post.content)
    };
    
    document.getElementById('article-schema').textContent = JSON.stringify(schema, null, 2);
}

// ============================================================================
// SOCIAL SHARING FUNCTIONS
// ============================================================================

function setupShareButtons() {
    // Share buttons are already in HTML with onclick attributes
    console.log('✓ Share buttons ready');
}

function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
    trackShare('Facebook');
}

function shareOnTwitter() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(document.title);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'width=600,height=400');
    trackShare('Twitter');
}

function shareOnWhatsApp() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(document.title);
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
    trackShare('WhatsApp');
}

function shareOnLinkedIn() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=600,height=400');
    trackShare('LinkedIn');
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Link copied to clipboard!');
        trackShare('Copy Link');
    });
}

function trackShare(platform) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'share', {
            'method': platform,
            'content_type': 'article',
            'item_id': currentPost?.slug
        });
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-IN', options);
}

function getCategoryName(category) {
    const categoryNames = {
        'shopping-tips': 'Shopping Tips',
        'product-guides': 'Product Guides',
        'deals-offers': 'Deals & Offers',
        'student-discounts': 'Student Discounts',
        'festival-sales': 'Festival Sales',
        'brand-reviews': 'Brand Reviews'
    };
    return categoryNames[category] || category;
}

function slugify(text) {
    return text.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
}

function calculateWordCount(content) {
    if (Array.isArray(content)) {
        return content.reduce((count, section) => {
            if (section.text) {
                return count + section.text.split(/\s+/).length;
            }
            return count;
        }, 0);
    }
    return content.split(/\s+/).length;
}

function addAffiliateLinkNotice() {
    const articleContent = document.getElementById('article-content');
    const externalLinks = articleContent.querySelectorAll('a[href^="http"]');
    
    externalLinks.forEach(link => {
        if (!link.href.includes('thriftmaal.com')) {
            link.setAttribute('rel', 'nofollow noopener noreferrer');
            link.setAttribute('target', '_blank');
        }
    });
}

function setupStickyElements() {
    const sidebar = document.querySelector('.sticky-sidebar');
    if (!sidebar) return;
    
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        if (scrollPosition > 200) {
            sidebar.classList.add('is-sticky');
        } else {
            sidebar.classList.remove('is-sticky');
        }
    });
}

function trackPageView() {
    if (typeof gtag !== 'undefined' && currentPost) {
        gtag('event', 'page_view', {
            'page_title': currentPost.title,
            'page_location': window.location.href,
            'page_path': window.location.pathname,
            'content_group': currentPost.category
        });
    }
}

function showError(message) {
    const articleContent = document.getElementById('article-content');
    if (articleContent) {
        articleContent.innerHTML = `
            <div class="error-message" style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: #f44336; margin-bottom: 20px;"></i>
                <h2>${message}</h2>
                <p><a href="/blog/">Return to Blog</a></p>
            </div>
        `;
    }
}

console.log('✓ Blog Post JavaScript loaded');
