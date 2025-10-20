// ===================================
// ThriftMaal Community Forum
// Complete JavaScript with 300 Posts
// Mobile-First, SEO Optimized
// ===================================

// ===================================
// DEFAULT DATA - 300 Posts with Comments & Replies
// ===================================

const DEFAULT_POSTS_DATA = [
  {
    "id": 1,
    "title": "Best time to find deals on electronics",
    "author": "ThriftQueen",
    "category": "Thrift Shopping Tips",
    "timestamp": "2025-09-18T16:38:04.134169",
    "views": 1989,
    "likes": 312,
    "commentsCount": 50,
    "excerpt": "I've noticed that early morning is the best time to catch fresh deals...",
    "content": "I've noticed that early morning is the best time to catch fresh deals...\n\nI've been shopping on ThriftMaal for a while now and wanted to share my experience. This is specifically about the thrift shopping tips section. Feel free to ask any questions in the comments below!\n\nHope this helps the community. Happy shopping! 🛍️",
    "tags": ["tips", "shopping-guide", "savings"],
    "isPinned": false,
    "isLocked": false,
    "comments": []
  }
  // Note: Full data with all 300 posts will be loaded from localStorage or initialized
];

// ===================================
// Global State Management
// ===================================

let allPosts = [];
let displayedPosts = [];
let filteredPosts = [];
let currentCategory = 'all';
let currentSort = 'latest';
let currentSearchQuery = '';
let postsPerPage = 12;
let currentPage = 1;
let currentUser = null;

// ===================================
// LocalStorage Keys
// ===================================

const STORAGE_KEYS = {
    POSTS: 'thriftmaal_community_posts',
    USER: 'thriftmaal_community_user',
    LIKED_POSTS: 'thriftmaal_liked_posts',
    LIKED_COMMENTS: 'thriftmaal_liked_comments'
};

// ===================================
// Initialization
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 ThriftMaal Community initialized');
    initializeCommunity();
});

function initializeCommunity() {
    // Load or initialize data
    loadCommunityData();
    
    // Setup current user
    setupCurrentUser();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initial render
    renderPosts();
    updateStatistics();
    
    console.log('✅ Community loaded with', allPosts.length, 'posts');
}

// ===================================
// Data Management
// ===================================

function loadCommunityData() {
    const savedPosts = localStorage.getItem(STORAGE_KEYS.POSTS);
    
    if (savedPosts) {
        try {
            allPosts = JSON.parse(savedPosts);
            console.log('📦 Loaded posts from localStorage');
        } catch (e) {
            console.error('Error loading posts:', e);
            initializeDefaultData();
        }
    } else {
        initializeDefaultData();
    }
    
    filteredPosts = [...allPosts];
}

function initializeDefaultData() {
    console.log('🔧 Initializing default community data...');
    
    // Generate all 300 posts with complete data
    allPosts = generateDefaultPosts();
    
    // Save to localStorage
    saveCommunityData();
    
    console.log('✅ Generated', allPosts.length, 'default posts');
}

function generateDefaultPosts() {
    const categories = [
        "Thrift Shopping Tips",
        "Product Reviews", 
        "Fashion & Style",
        "Sustainability",
        "Deal Alerts",
        "General Discussion"
    ];
    
    const postTemplates = {
        "Thrift Shopping Tips": [
            {"title": "Best time to find deals on electronics", "excerpt": "I've noticed that early morning is the best time to catch fresh deals..."},
            {"title": "How to spot genuine products", "excerpt": "Here are my top 5 tips for identifying authentic products when shopping..."},
            {"title": "Negotiation tricks that actually work", "excerpt": "After years of thrift shopping, I've learned these negotiation strategies..."},
            {"title": "Hidden gems in home & kitchen category", "excerpt": "Found amazing kitchen appliances at 70% off! Let me share where..."},
            {"title": "Weekend shopping strategy", "excerpt": "Weekends are tricky but here's how I maximize my savings..."}
        ],
        "Product Reviews": [
            {"title": "Review: Amazing Bluetooth headphones under ₹500", "excerpt": "Just received these headphones and I'm blown away by the quality..."},
            {"title": "My experience with trending fashion items", "excerpt": "Ordered 3 items last week and here's my honest review..."},
            {"title": "Sports equipment - Worth it or not?", "excerpt": "Testing out the yoga mats and dumbbells from recent deals..."},
            {"title": "Electronics haul - Quality check", "excerpt": "Bought 5 gadgets this month. Here's what worked and what didn't..."},
            {"title": "Beauty products review - Surprised!", "excerpt": "Never expected such quality at these prices. Full review inside..."}
        ],
        "Fashion & Style": [
            {"title": "Budget outfit ideas for office", "excerpt": "Created 5 professional looks under ₹2000 each using ThriftMaal finds..."},
            {"title": "Trending accessories this season", "excerpt": "What's hot right now and how to style them affordably..."},
            {"title": "Seasonal wardrobe update tips", "excerpt": "Switching from winter to summer without breaking the bank..."},
            {"title": "Mixing high and low fashion", "excerpt": "How I combine thrift finds with premium pieces for killer looks..."},
            {"title": "Sustainable fashion choices", "excerpt": "Building an eco-friendly wardrobe while saving money..."}
        ],
        "Sustainability": [
            {"title": "Why thrift shopping is eco-friendly", "excerpt": "The environmental impact of choosing second-hand and discounted items..."},
            {"title": "Reducing packaging waste", "excerpt": "Tips for minimal waste when online shopping..."},
            {"title": "Upcycling old purchases", "excerpt": "Creative ways to give new life to old items..."},
            {"title": "Conscious consumption guide", "excerpt": "How to shop smart and reduce environmental footprint..."},
            {"title": "Community swap ideas", "excerpt": "Starting a local exchange program for items we no longer need..."}
        ],
        "Deal Alerts": [
            {"title": "🔥 Flash sale alert - Electronics 80% off!", "excerpt": "Just saw this incredible deal go live. Limited stock!..."},
            {"title": "Weekend mega sale incoming", "excerpt": "Insider info on upcoming deals this weekend. Don't miss..."},
            {"title": "Price drop alert on trending items", "excerpt": "Tracking these products for weeks, finally at best price..."},
            {"title": "Loot deal - Grab before it ends!", "excerpt": "This won't last long. Under ₹500 deal of the day..."},
            {"title": "Bank offers stacking guide", "excerpt": "How to combine offers for maximum savings this month..."}
        ],
        "General Discussion": [
            {"title": "Best purchase of the month", "excerpt": "What's the best thing you bought this month? Share your wins..."},
            {"title": "ThriftMaal shopping experience", "excerpt": "How has your experience been? Let's discuss improvements..."},
            {"title": "Budget management tips", "excerpt": "How do you manage your shopping budget? Share strategies..."},
            {"title": "Favorite categories to shop", "excerpt": "What do you shop for most? Electronics, fashion, or something else?..."},
            {"title": "Community wishlist thread", "excerpt": "What deals are you waiting for? Let's create a wishlist..."}
        ]
    };
    
    const usernames = [
        "DealHunter", "SmartShopper", "ThriftQueen", "BudgetMaster", "SaveMoneyPro",
        "FashionFinder", "TechDeals", "ShopSmart", "PriyaKumar", "RahulSharma",
        "AnanyaR", "VikramSingh", "SnehaGupta", "ArjunMehta", "PoojaSharma",
        "KaranJoshi", "NehaDas", "SiddharthK", "RiyaPatil", "AmitVerma",
        "DivyaRao", "SanjayKumar", "MeghaShah", "VarunReddy", "KritikaS"
    ];
    
    const commentTemplates = [
        "Great tip! Thanks for sharing this.",
        "I tried this and it works perfectly!",
        "Do you have more details on this?",
        "This saved me so much money!",
        "Where exactly did you find this deal?",
        "Totally agree with your points here.",
        "Can you share the link please?",
        "This is exactly what I was looking for!",
        "Amazing quality for the price!",
        "Has anyone else tried this?",
        "Update: Just ordered this! Excited!",
        "Thanks for the honest review.",
        "What about the warranty on this?",
        "Delivery was quick or took time?",
        "Is it still available?",
        "Best community for shopping tips! ❤️",
        "You should check out the electronics section too!",
        "Following this thread for updates.",
        "This deal is 🔥🔥🔥",
        "Absolutely worth every rupee!"
    ];
    
    const replyTemplates = [
        "Thanks for the info!",
        "You're welcome! 😊",
        "Check my latest post for more details.",
        "DM me if you need the link.",
        "Yes, it's still working!",
        "I'll update once I receive mine."
    ];
    
    const posts = [];
    let postId = 1;
    const postsPerCategory = 50;
    
    categories.forEach(category => {
        const templates = postTemplates[category];
        
        for (let i = 0; i < postsPerCategory; i++) {
            const template = templates[i % templates.length];
            const postNum = Math.floor(i / templates.length) + 1;
            const titleSuffix = postNum > 1 ? ` - Part ${postNum}` : "";
            
            const daysAgo = Math.floor(Math.random() * 90);
            const hoursAgo = Math.floor(Math.random() * 24);
            const postDate = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000));
            
            const author = usernames[Math.floor(Math.random() * usernames.length)];
            const views = Math.floor(Math.random() * 4950) + 50;
            const likes = Math.floor(Math.random() * 495) + 5;
            const commentsCount = Math.floor(Math.random() * 48) + 2;
            
            const fullContent = `${template.excerpt}\n\nI've been shopping on ThriftMaal for a while now and wanted to share my experience. This is specifically about the ${category.toLowerCase()} section. Feel free to ask any questions in the comments below!\n\nHope this helps the community. Happy shopping! 🛍️`;
            
            let tags = [];
            if (category === "Deal Alerts") {
                tags = ["deals", "flash-sale", "limited-time"];
            } else if (category === "Product Reviews") {
                tags = ["review", "honest-opinion", "quality-check"];
            } else if (category === "Fashion & Style") {
                tags = ["fashion", "style-tips", "trending"];
            } else if (category === "Sustainability") {
                tags = ["eco-friendly", "sustainable", "green"];
            } else if (category === "Thrift Shopping Tips") {
                tags = ["tips", "shopping-guide", "savings"];
            } else {
                tags = ["discussion", "community"];
            }
            
            const post = {
                id: postId,
                title: template.title + titleSuffix,
                author: author,
                category: category,
                timestamp: postDate.toISOString(),
                views: views,
                likes: likes,
                commentsCount: commentsCount,
                excerpt: template.excerpt,
                content: fullContent,
                tags: tags,
                isPinned: (likes > 400 && commentsCount > 40),
                isLocked: false,
                comments: []
            };
            
            // Generate comments
            const numComments = Math.min(commentsCount, 15);
            for (let j = 0; j < numComments; j++) {
                const commentDate = new Date(postDate.getTime() + (Math.random() * 48 * 60 * 60 * 1000));
                const comment = {
                    id: `c${postId}_${j + 1}`,
                    author: usernames[Math.floor(Math.random() * usernames.length)],
                    content: commentTemplates[Math.floor(Math.random() * commentTemplates.length)],
                    timestamp: commentDate.toISOString(),
                    likes: Math.floor(Math.random() * 50),
                    replies: []
                };
                
                // Add replies (30% chance)
                if (Math.random() > 0.7) {
                    const numReplies = Math.floor(Math.random() * 3) + 1;
                    for (let k = 0; k < numReplies; k++) {
                        const replyDate = new Date(commentDate.getTime() + (Math.random() * 24 * 60 * 60 * 1000));
                        const reply = {
                            id: `r${postId}_${j + 1}_${k + 1}`,
                            author: usernames[Math.floor(Math.random() * usernames.length)],
                            content: replyTemplates[Math.floor(Math.random() * replyTemplates.length)],
                            timestamp: replyDate.toISOString(),
                            likes: Math.floor(Math.random() * 20)
                        };
                        comment.replies.push(reply);
                    }
                }
                
                post.comments.push(comment);
            }
            
            posts.push(post);
            postId++;
        }
    });
    
    return posts;
}

function saveCommunityData() {
    try {
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(allPosts));
    } catch (e) {
        console.error('Error saving posts:', e);
    }
}

function setupCurrentUser() {
    let user = localStorage.getItem(STORAGE_KEYS.USER);
    
    if (!user) {
        // Generate random guest user
        const guestNames = ["Guest", "User", "Shopper", "Member"];
        const randomNum = Math.floor(Math.random() * 10000);
        user = `${guestNames[Math.floor(Math.random() * guestNames.length)]}${randomNum}`;
        localStorage.setItem(STORAGE_KEYS.USER, user);
    }
    
    currentUser = user;
    console.log('👤 Current user:', currentUser);
}

// ===================================
// Event Listeners
// ===================================

function setupEventListeners() {
    // Category navigation
    const categoryLinks = document.querySelectorAll('.category-link');
    categoryLinks.forEach(link => {
        link.addEventListener('click', handleCategoryClick);
    });
    
    // Search
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    if (searchBtn) searchBtn.addEventListener('click', handleSearch);
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }
    
    // Sort
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.addEventListener('change', handleSortChange);
    
    // New post
    const newPostBtn = document.getElementById('new-post-btn');
    if (newPostBtn) newPostBtn.addEventListener('click', openNewPostModal);
    
    // Modal controls
    const closeModal = document.getElementById('close-modal');
    const cancelPost = document.getElementById('cancel-post');
    if (closeModal) closeModal.addEventListener('click', closeNewPostModal);
    if (cancelPost) cancelPost.addEventListener('click', closeNewPostModal);
    
    // Post form
    const postForm = document.getElementById('new-post-form');
    if (postForm) postForm.addEventListener('submit', handleNewPost);
    
    // Load more
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) loadMoreBtn.addEventListener('click', loadMorePosts);
    
    // Close modals on outside click
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// ===================================
// Category Filtering
// ===================================

function handleCategoryClick(e) {
    e.preventDefault();
    
    const category = e.currentTarget.dataset.category;
    
    // Update active state
    document.querySelectorAll('.category-link').forEach(link => {
        link.classList.remove('active');
    });
    e.currentTarget.classList.add('active');
    
    // Filter posts
    currentCategory = category;
    currentPage = 1;
    filterAndSortPosts();
    renderPosts();
}

// ===================================
// Search Functionality
// ===================================

function handleSearch() {
    const searchInput = document.getElementById('search-input');
    currentSearchQuery = searchInput.value.trim().toLowerCase();
    currentPage = 1;
    filterAndSortPosts();
    renderPosts();
}

// ===================================
// Sort Functionality
// ===================================

function handleSortChange(e) {
    currentSort = e.target.value;
    filterAndSortPosts();
    renderPosts();
}

// ===================================
// Filter and Sort Logic
// ===================================

function filterAndSortPosts() {
    // Filter by category
    if (currentCategory === 'all') {
        filteredPosts = [...allPosts];
    } else {
        filteredPosts = allPosts.filter(post => post.category === currentCategory);
    }
    
    // Filter by search query
    if (currentSearchQuery) {
        filteredPosts = filteredPosts.filter(post => {
            return post.title.toLowerCase().includes(currentSearchQuery) ||
                   post.excerpt.toLowerCase().includes(currentSearchQuery) ||
                   post.content.toLowerCase().includes(currentSearchQuery) ||
                   post.tags.some(tag => tag.toLowerCase().includes(currentSearchQuery));
        });
    }
    
    // Sort posts
    switch (currentSort) {
        case 'popular':
            filteredPosts.sort((a, b) => b.likes - a.likes);
            break;
        case 'trending':
            filteredPosts.sort((a, b) => (b.likes + b.commentsCount * 2) - (a.likes + a.commentsCount * 2));
            break;
        case 'most-commented':
            filteredPosts.sort((a, b) => b.commentsCount - a.commentsCount);
            break;
        case 'latest':
        default:
            filteredPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            break;
    }
    
    // Move pinned posts to top
    const pinnedPosts = filteredPosts.filter(p => p.isPinned);
    const regularPosts = filteredPosts.filter(p => !p.isPinned);
    filteredPosts = [...pinnedPosts, ...regularPosts];
}

// ===================================
// Render Posts
// ===================================

function renderPosts() {
    const container = document.getElementById('posts-container');
    if (!container) return;
    
    // Calculate posts to display
    const startIndex = 0;
    const endIndex = currentPage * postsPerPage;
    displayedPosts = filteredPosts.slice(startIndex, endIndex);
    
    // Clear container
    container.innerHTML = '';
    
    // Check if no posts
    if (displayedPosts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No posts found</h3>
                <p>Try adjusting your search or filter criteria</p>
            </div>
        `;
        updateLoadMoreButton();
        return;
    }
    
    // Render each post
    displayedPosts.forEach(post => {
        const postCard = createPostCard(post);
        container.appendChild(postCard);
    });
    
    updateLoadMoreButton();
}

function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'post-card' + (post.isPinned ? ' pinned' : '');
    card.onclick = () => openPostDetail(post.id);
    
    const timeAgo = getTimeAgo(post.timestamp);
    const authorInitial = post.author.charAt(0).toUpperCase();
    
    card.innerHTML = `
        <div class="post-header">
            <div class="post-avatar">${authorInitial}</div>
            <div class="post-meta">
                <span class="post-author">${escapeHtml(post.author)}</span>
                <span class="post-time">${timeAgo}</span>
            </div>
            <span class="post-category-badge">${escapeHtml(post.category)}</span>
        </div>
        
        <h3 class="post-title">${escapeHtml(post.title)}</h3>
        <p class="post-excerpt">${escapeHtml(post.excerpt)}</p>
        
        <div class="post-tags">
            ${post.tags.map(tag => `<span class="post-tag">#${escapeHtml(tag)}</span>`).join('')}
        </div>
        
        <div class="post-footer">
            <div class="post-stat">
                <i class="fas fa-eye"></i>
                <span>${formatNumber(post.views)}</span>
            </div>
            <div class="post-stat">
                <i class="fas fa-heart"></i>
                <span>${formatNumber(post.likes)}</span>
            </div>
            <div class="post-stat">
                <i class="fas fa-comments"></i>
                <span>${formatNumber(post.commentsCount)}</span>
            </div>
        </div>
    `;
    
    return card;
}

// ===================================
// Post Detail Modal
// ===================================

function openPostDetail(postId) {
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;
    
    // Increment views
    post.views++;
    saveCommunityData();
    
    const modal = document.getElementById('post-detail-modal');
    const content = document.getElementById('post-detail-content');
    
    if (!modal || !content) return;
    
    const timeAgo = getTimeAgo(post.timestamp);
    const authorInitial = post.author.charAt(0).toUpperCase();
    const isLiked = isPostLiked(post.id);
    
    content.innerHTML = `
        <div class="post-detail-header">
            <h2 class="post-detail-title">${escapeHtml(post.title)}</h2>
            
            <div class="post-detail-meta">
                <div class="post-detail-author-info">
                    <div class="post-detail-avatar">${authorInitial}</div>
                    <div>
                        <div class="post-detail-author-name">${escapeHtml(post.author)}</div>
                        <div class="post-detail-time">${timeAgo}</div>
                    </div>
                </div>
                
                <span class="post-category-badge">${escapeHtml(post.category)}</span>
                
                <div class="post-detail-stats">
                    <div class="post-detail-stat">
                        <i class="fas fa-eye"></i>
                        <span>${formatNumber(post.views)} views</span>
                    </div>
                    <div class="post-detail-stat">
                        <i class="fas fa-heart"></i>
                        <span>${formatNumber(post.likes)} likes</span>
                    </div>
                    <div class="post-detail-stat">
                        <i class="fas fa-comments"></i>
                        <span>${formatNumber(post.commentsCount)} comments</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="post-detail-content">${escapeHtml(post.content)}</div>
        
        <div class="post-tags">
            ${post.tags.map(tag => `<span class="post-tag">#${escapeHtml(tag)}</span>`).join('')}
        </div>
        
        <div class="post-detail-actions">
            <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="togglePostLike(${post.id})">
                <i class="fas fa-heart"></i>
                <span>${isLiked ? 'Liked' : 'Like'}</span>
            </button>
            <button class="action-btn" onclick="sharePost(${post.id})">
                <i class="fas fa-share"></i>
                <span>Share</span>
            </button>
        </div>
        
        <div class="comments-section">
            <h3 class="comments-header">${post.comments.length} Comments</h3>
            
            <div class="comment-form">
                <textarea class="comment-input" id="new-comment-input" placeholder="Add a comment..."></textarea>
                <button class="comment-submit" onclick="submitComment(${post.id})">
                    <i class="fas fa-paper-plane"></i> Post Comment
                </button>
            </div>
            
            <div class="comments-list" id="comments-list">
                ${renderComments(post.comments)}
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    
    // Setup close button
    const closeBtn = document.getElementById('close-detail-modal');
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.classList.remove('active');
            renderPosts(); // Refresh to show updated likes/views
        };
    }
}

function renderComments(comments) {
    if (comments.length === 0) {
        return '<p style="text-align: center; color: var(--text-light); padding: 20px;">No comments yet. Be the first to comment!</p>';
    }
    
    return comments.map(comment => {
        const timeAgo = getTimeAgo(comment.timestamp);
        const authorInitial = comment.author.charAt(0).toUpperCase();
        const isLiked = isCommentLiked(comment.id);
        
        return `
            <div class="comment-item">
                <div class="comment-header">
                    <div class="comment-avatar">${authorInitial}</div>
                    <span class="comment-author">${escapeHtml(comment.author)}</span>
                    <span class="comment-time">${timeAgo}</span>
                </div>
                <div class="comment-content">${escapeHtml(comment.content)}</div>
                <div class="comment-actions">
                    <span class="comment-action ${isLiked ? 'liked' : ''}" onclick="toggleCommentLike('${comment.id}')">
                        <i class="fas fa-heart"></i> ${comment.likes}
                    </span>
                    <span class="comment-action">
                        <i class="fas fa-reply"></i> Reply
                    </span>
                </div>
                
                ${comment.replies.length > 0 ? `
                    <div class="comment-replies">
                        ${comment.replies.map(reply => {
                            const replyTimeAgo = getTimeAgo(reply.timestamp);
                            const replyInitial = reply.author.charAt(0).toUpperCase();
                            const isReplyLiked = isCommentLiked(reply.id);
                            
                            return `
                                <div class="reply-item">
                                    <div class="comment-header">
                                        <div class="comment-avatar">${replyInitial}</div>
                                        <span class="comment-author">${escapeHtml(reply.author)}</span>
                                        <span class="comment-time">${replyTimeAgo}</span>
                                    </div>
                                    <div class="comment-content">${escapeHtml(reply.content)}</div>
                                    <div class="comment-actions">
                                        <span class="comment-action ${isReplyLiked ? 'liked' : ''}" onclick="toggleCommentLike('${reply.id}')">
                                            <i class="fas fa-heart"></i> ${reply.likes}
                                        </span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// ===================================
// New Post Modal
// ===================================

function openNewPostModal() {
    const modal = document.getElementById('new-post-modal');
    if (modal) modal.classList.add('active');
}

function closeNewPostModal() {
    const modal = document.getElementById('new-post-modal');
    if (modal) modal.classList.remove('active');
    
    // Reset form
    const form = document.getElementById('new-post-form');
    if (form) form.reset();
}

function handleNewPost(e) {
    e.preventDefault();
    
    const title = document.getElementById('post-title').value.trim();
    const category = document.getElementById('post-category').value;
    const content = document.getElementById('post-content').value.trim();
    const tagsInput = document.getElementById('post-tags').value.trim();
    
    if (!title || !category || !content) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Parse tags
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
    
    // Create new post
    const newPost = {
        id: allPosts.length > 0 ? Math.max(...allPosts.map(p => p.id)) + 1 : 1,
        title: title,
        author: currentUser,
        category: category,
        timestamp: new Date().toISOString(),
        views: 0,
        likes: 0,
        commentsCount: 0,
        excerpt: content.substring(0, 150) + (content.length > 150 ? '...' : ''),
        content: content,
        tags: tags,
        isPinned: false,
        isLocked: false,
        comments: []
    };
    
    // Add to posts
    allPosts.unshift(newPost);
    saveCommunityData();
    
    // Close modal
    closeNewPostModal();
    
    // Refresh view
    currentCategory = 'all';
    currentPage = 1;
    filterAndSortPosts();
    renderPosts();
    updateStatistics();
    
    // Show success message
    alert('Post created successfully! 🎉');
}

// ===================================
// Comment Functionality
// ===================================

function submitComment(postId) {
    const input = document.getElementById('new-comment-input');
    const content = input.value.trim();
    
    if (!content) {
        alert('Please enter a comment');
        return;
    }
    
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;
    
    const newComment = {
        id: `c${postId}_${Date.now()}`,
        author: currentUser,
        content: content,
        timestamp: new Date().toISOString(),
        likes: 0,
        replies: []
    };
    
    post.comments.unshift(newComment);
    post.commentsCount++;
    saveCommunityData();
    
    // Refresh modal
    openPostDetail(postId);
}

// ===================================
// Like Functionality
// ===================================

function togglePostLike(postId) {
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;
    
    const likedPosts = getLikedPosts();
    const isLiked = likedPosts.includes(postId);
    
    if (isLiked) {
        post.likes--;
        const index = likedPosts.indexOf(postId);
        likedPosts.splice(index, 1);
    } else {
        post.likes++;
        likedPosts.push(postId);
    }
    
    localStorage.setItem(STORAGE_KEYS.LIKED_POSTS, JSON.stringify(likedPosts));
    saveCommunityData();
    
    // Refresh modal
    openPostDetail(postId);
}

function isPostLiked(postId) {
    const likedPosts = getLikedPosts();
    return likedPosts.includes(postId);
}

function getLikedPosts() {
    const liked = localStorage.getItem(STORAGE_KEYS.LIKED_POSTS);
    return liked ? JSON.parse(liked) : [];
}

function toggleCommentLike(commentId) {
    const likedComments = getLikedComments();
    const isLiked = likedComments.includes(commentId);
    
    // Find and update comment
    allPosts.forEach(post => {
        post.comments.forEach(comment => {
            if (comment.id === commentId) {
                comment.likes += isLiked ? -1 : 1;
            }
            comment.replies.forEach(reply => {
                if (reply.id === commentId) {
                    reply.likes += isLiked ? -1 : 1;
                }
            });
        });
    });
    
    if (isLiked) {
        const index = likedComments.indexOf(commentId);
        likedComments.splice(index, 1);
    } else {
        likedComments.push(commentId);
    }
    
    localStorage.setItem(STORAGE_KEYS.LIKED_COMMENTS, JSON.stringify(likedComments));
    saveCommunityData();
    
    // Find current post and refresh
    const modal = document.getElementById('post-detail-modal');
    if (modal.classList.contains('active')) {
        const postId = findPostByCommentId(commentId);
        if (postId) openPostDetail(postId);
    }
}

function isCommentLiked(commentId) {
    const likedComments = getLikedComments();
    return likedComments.includes(commentId);
}

function getLikedComments() {
    const liked = localStorage.getItem(STORAGE_KEYS.LIKED_COMMENTS);
    return liked ? JSON.parse(liked) : [];
}

function findPostByCommentId(commentId) {
    for (const post of allPosts) {
        for (const comment of post.comments) {
            if (comment.id === commentId) return post.id;
            for (const reply of comment.replies) {
                if (reply.id === commentId) return post.id;
            }
        }
    }
    return null;
}

// ===================================
// Share Functionality
// ===================================

function sharePost(postId) {
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;
    
    const shareData = {
        title: post.title,
        text: post.excerpt,
        url: `${window.location.origin}/community?post=${postId}`
    };
    
    if (navigator.share) {
        navigator.share(shareData).catch(err => console.log('Share cancelled'));
    } else {
        // Fallback: Copy link
        navigator.clipboard.writeText(shareData.url).then(() => {
            alert('Link copied to clipboard!');
        }).catch(err => {
            console.error('Could not copy:', err);
        });
    }
}

// ===================================
// Load More Posts
// ===================================

function loadMorePosts() {
    currentPage++;
    renderPosts();
}

function updateLoadMoreButton() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (!loadMoreBtn) return;
    
    const totalPosts = filteredPosts.length;
    const displayedCount = displayedPosts.length;
    
    if (displayedCount >= totalPosts) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'inline-flex';
        const remaining = totalPosts - displayedCount;
        loadMoreBtn.innerHTML = `<i class="fas fa-plus"></i> Load More (${remaining} remaining)`;
    }
}

// ===================================
// Update Statistics
// ===================================

function updateStatistics() {
    // Update total posts
    const totalPostsEl = document.getElementById('total-posts');
    if (totalPostsEl) totalPostsEl.textContent = formatNumber(allPosts.length);
    
    // Update category counts
    const categoryCounts = {
        'all': allPosts.length,
        'Thrift Shopping Tips': allPosts.filter(p => p.category === 'Thrift Shopping Tips').length,
        'Product Reviews': allPosts.filter(p => p.category === 'Product Reviews').length,
        'Fashion & Style': allPosts.filter(p => p.category === 'Fashion & Style').length,
        'Sustainability': allPosts.filter(p => p.category === 'Sustainability').length,
        'Deal Alerts': allPosts.filter(p => p.category === 'Deal Alerts').length,
        'General Discussion': allPosts.filter(p => p.category === 'General Discussion').length
    };
    
    document.getElementById('count-all').textContent = categoryCounts['all'];
    document.getElementById('count-tips').textContent = categoryCounts['Thrift Shopping Tips'];
    document.getElementById('count-reviews').textContent = categoryCounts['Product Reviews'];
    document.getElementById('count-fashion').textContent = categoryCounts['Fashion & Style'];
    document.getElementById('count-sustain').textContent = categoryCounts['Sustainability'];
    document.getElementById('count-deals').textContent = categoryCounts['Deal Alerts'];
    document.getElementById('count-general').textContent = categoryCounts['General Discussion'];
}

// ===================================
// Utility Functions
// ===================================

function getTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return past.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===================================
// Console Welcome Message
// ===================================

console.log('%c🛍️ ThriftMaal Community Forum', 'color: #FF6B35; font-size: 20px; font-weight: bold;');
console.log('%cVersion 1.0.0 | Mobile-First | SEO Optimized', 'color: #6B7280; font-size: 12px;');
console.log('%c300 Posts Loaded | LocalStorage Enabled', 'color: #10B981; font-size: 12px;');
