// ThriftZone Community JavaScript
// Complete functionality for discussion board with localStorage

class ThriftZoneCommunity {
    constructor() {
        this.currentUser = null;
        this.discussions = [];
        this.simUsers = [];
        this.currentPage = 1;
        this.discussionsPerPage = 10;
        this.currentCategory = 'all';
        this.currentSort = 'latest';
        
        this.init();
    }

    init() {
        this.loadUserData();
        this.initializeSimulatedUsers();
        this.generateDailyContent();
        this.setupEventListeners();
        this.loadDiscussions();
        this.updateUI();
        this.startDailyRotation();
    }

    // === USER MANAGEMENT ===
    loadUserData() {
        const userData = localStorage.getItem('tz_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.showCommunityInterface();
        } else {
            this.showUserSetup();
        }
    }

    saveUserData() {
        localStorage.setItem('tz_user', JSON.stringify(this.currentUser));
    }

    createUser(username, avatar) {
        this.currentUser = {
            id: this.generateId(),
            username: username,
            avatar: avatar,
            joinedAt: new Date().toISOString(),
            reputation: 0,
            postsCount: 0,
            likesGiven: 0,
            likesReceived: 0
        };
        this.saveUserData();
        this.showCommunityInterface();
        this.showToast('Welcome to ThriftZone Community! 🎉', 'success');
    }

    // === SIMULATED USERS AND CONTENT ===
    initializeSimulatedUsers() {
        const savedUsers = localStorage.getItem('tz_sim_users');
        if (savedUsers) {
            this.simUsers = JSON.parse(savedUsers);
        } else {
            this.generateSimulatedUsers();
        }
    }

    generateSimulatedUsers() {
        const indianNames = [
            'Rahul_Deals', 'Priya_Shopper', 'Amit_Bargains', 'Sneha_Savings', 'Vikram_Hunter',
            'Anita_Deals', 'Rajesh_Coupons', 'Kavya_Offers', 'Suresh_Loot', 'Neha_Discounts',
            'Karan_Savings', 'Riya_Bargains', 'Ashish_Deals', 'Pooja_Offers', 'Manish_Hunter',
            'Shreya_Coupons', 'Nikhil_Loot', 'Divya_Savings', 'Rohit_Deals', 'Sapna_Bargains'
        ];
        
        const avatars = ['🛍️', '💰', '🔥', '⚡', '🎯', '💎', '🏆', '🌟', '⭐', '🎪'];
        
        this.simUsers = [];
        for (let i = 0; i < 500; i++) {
            this.simUsers.push({
                id: `sim_${i}`,
                username: `${indianNames[i % indianNames.length]}${Math.floor(Math.random() * 999)}`,
                avatar: avatars[Math.floor(Math.random() * avatars.length)],
                reputation: Math.floor(Math.random() * 1000) + 50,
                joinedAt: this.getRandomPastDate(),
                badge: this.getRandomBadge()
            });
        }
        localStorage.setItem('tz_sim_users', JSON.stringify(this.simUsers));
    }

    getRandomBadge() {
        const badges = ['Deal Hunter', 'Bargain Expert', 'Coupon Master', 'Shopping Guru', 'Loot King'];
        return badges[Math.floor(Math.random() * badges.length)];
    }

    getRandomPastDate() {
        const now = new Date();
        const pastDate = new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000);
        return pastDate.toISOString();
    }

    // === DAILY CONTENT GENERATION ===
    generateDailyContent() {
        const today = new Date().toDateString();
        const lastGenerated = localStorage.getItem('tz_last_content_date');
        
        if (lastGenerated !== today) {
            this.createDailyDiscussions();
            localStorage.setItem('tz_last_content_date', today);
        }
    }

    createDailyDiscussions() {
        const discussionTemplates = [
            {
                category: 'flash-deals',
                titles: [
                    '🔥 Amazon Lightning Deal: {product} for just ₹{price}!',
                    '⚡ Flipkart Flash Sale: {product} 70% off!',
                    '💥 Myntra Mega Deal: {brand} collection starting ₹{price}',
                    '🚀 Paytm Mall Super Deal: {product} with extra cashback!'
                ],
                contents: [
                    'Bhai log, just spotted this amazing deal! {product} original price ₹{original} but abhi sirf ₹{price} mein mil raha hai. Maine order kar diya, you guys should also check it out. Link expire ho jaega jaldi! 🏃‍♂️',
                    'Guys, this is pure loot! {product} ka price drop dekh ke main shock ho gaya. Quality top-notch hai, reviews bhi acche hain. Paisa vasool deal hai yaar! 💯',
                    'Fellow deal hunters! Found this gem on {platform}. {product} ke liye bohot time se wait kar raha tha. Finally good price mein mil gaya. Sharing with community! 🎯'
                ]
            },
            {
                category: 'coupons',
                titles: [
                    '💳 HDFC Card Offer: Extra 10% off on {platform}',
                    '🎫 Working Coupon: {code} for ₹{discount} off',
                    '💰 Cashback Alert: {percent}% back on {category} shopping',
                    '🏦 Bank Offer: SBI users get ₹{amount} instant discount'
                ],
                contents: [
                    'Verified working code guys! {code} use karke ₹{discount} save kiya just now. Valid till {date}. Hurry up! 🏃‍♀️',
                    'Pro tip: {platform} pe {card} use karo for extra savings. Mujhe ₹{amount} extra discount mila. Thank me later! 😉',
                    'Bank offer hack: First transaction with {bank} debit card gets ₹{amount} cashback. Tested and working! 🏧'
                ]
            },
            {
                category: 'reviews',
                titles: [
                    '⭐ {product} Review: Worth the hype?',
                    '🔍 Honest Review: {brand} {product} after 6 months use',
                    '💡 Should you buy {product}? My experience',
                    '📱 {product} vs {competitor}: Which one to choose?'
                ],
                contents: [
                    'Used {product} for {duration} now. Build quality solid hai, performance bhi acchi. Price ke hisaab se value for money. Recommended! 👍',
                    'Maine {price} mein liya tha {product}. After using extensively, can say its worth every penny. Pros: {pros}. Cons: {cons}. Overall 8/10! ⭐',
                    'Honest review time! {product} delivered more than expected. Quality, features, everything top-notch. For ₹{price}, its a steal deal! 💯'
                ]
            },
            {
                category: 'shopping-tips',
                titles: [
                    '💡 Pro Tips: How to get maximum discounts during sales',
                    '🎯 Shopping Strategy: My Diwali shopping plan',
                    '💳 Credit Card Hacks for extra savings',
                    '📱 Best apps for price comparison and deals'
                ],
                contents: [
                    'Sharing my tested shopping strategy: 1) Compare prices across platforms 2) Check bank offers 3) Use cashback apps 4) Time your purchase during sales. Saved ₹50K+ last year! 💰',
                    'Festival season aane wala hai guys! Start karo preparations. Wishlist banao, price track karo, bank offers check karo. Early bird gets the best deals! 🐦',
                    'Credit card game strong karna hai toh ye tricks follow karo: {tip1}, {tip2}, {tip3}. Mera monthly savings ₹5K+ increase hua hai! 📈'
                ]
            }
        ];

        const products = ['iPhone 15', 'Samsung Galaxy S24', 'OnePlus 12', 'Redmi Note 13', 'MacBook Air', 'iPad Pro', 'AirPods Pro', 'Sony WH-1000XM5', 'JBL Flip 6', 'Realme GT'];
        const brands = ['Nike', 'Adidas', 'Puma', 'Reebok', 'Levi\'s', 'H&M', 'Zara', 'Uniqlo', 'Allen Solly', 'Peter England'];
        const platforms = ['Amazon', 'Flipkart', 'Myntra', 'Ajio', 'Nykaa', 'BigBasket'];

        const savedDiscussions = localStorage.getItem('tz_discussions');
        this.discussions = savedDiscussions ? JSON.parse(savedDiscussions) : [];

        // Generate 50 new discussions daily
        for (let i = 0; i < 50; i++) {
            const template = discussionTemplates[Math.floor(Math.random() * discussionTemplates.length)];
            const randomUser = this.simUsers[Math.floor(Math.random() * this.simUsers.length)];
            
            const discussion = {
                id: this.generateId(),
                authorId: randomUser.id,
                authorName: randomUser.username,
                authorAvatar: randomUser.avatar,
                category: template.category,
                title: this.fillTemplate(template.titles[Math.floor(Math.random() * template.titles.length)], {
                    product: products[Math.floor(Math.random() * products.length)],
                    brand: brands[Math.floor(Math.random() * brands.length)],
                    platform: platforms[Math.floor(Math.random() * platforms.length)],
                    price: Math.floor(Math.random() * 50000) + 1000,
                    code: this.generateCouponCode(),
                    discount: Math.floor(Math.random() * 2000) + 100,
                    percent: Math.floor(Math.random() * 50) + 5,
                    amount: Math.floor(Math.random() * 1000) + 100
                }),
                content: this.fillTemplate(template.contents[Math.floor(Math.random() * template.contents.length)], {
                    product: products[Math.floor(Math.random() * products.length)],
                    platform: platforms[Math.floor(Math.random() * platforms.length)],
                    price: Math.floor(Math.random() * 50000) + 1000,
                    original: Math.floor(Math.random() * 80000) + 20000,
                    duration: ['3 months', '6 months', '1 year'][Math.floor(Math.random() * 3)],
                    pros: 'Good build, nice features, value for money',
                    cons: 'Battery could be better'
                }),
                createdAt: new Date().toISOString(),
                likes: Math.floor(Math.random() * 50),
                views: Math.floor(Math.random() * 200) + 50,
                replyCount: Math.floor(Math.random() * 20),
                isSimulated: true
            };

            this.discussions.unshift(discussion);
        }

        // Keep only latest 1000 discussions to manage storage
        if (this.discussions.length > 1000) {
            this.discussions = this.discussions.slice(0, 1000);
        }

        this.saveDiscussions();
    }

    fillTemplate(template, data) {
        return template.replace(/\{(\w+)\}/g, (match, key) => data[key] || match);
    }

    generateCouponCode() {
        const codes = ['SAVE20', 'DEAL50', 'MEGA30', 'LOOT40', 'FLASH25', 'SUPER60', 'ULTRA35'];
        return codes[Math.floor(Math.random() * codes.length)];
    }

    // === DISCUSSION MANAGEMENT ===
    loadDiscussions() {
        const saved = localStorage.getItem('tz_discussions');
        this.discussions = saved ? JSON.parse(saved) : [];
    }

    saveDiscussions() {
        localStorage.setItem('tz_discussions', JSON.stringify(this.discussions));
    }

    createDiscussion(title, content, category) {
        if (!this.currentUser) return;

        const discussion = {
            id: this.generateId(),
            authorId: this.currentUser.id,
            authorName: this.currentUser.username,
            authorAvatar: this.currentUser.avatar,
            category: category,
            title: title,
            content: content,
            createdAt: new Date().toISOString(),
            likes: 0,
            views: 0,
            replyCount: 0,
            replies: [],
            isSimulated: false
        };

        this.discussions.unshift(discussion);
        this.currentUser.postsCount++;
        this.saveDiscussions();
        this.saveUserData();
        this.renderDiscussions();
        this.showToast('Discussion posted successfully! 🎉', 'success');
    }

    // === UI MANAGEMENT ===
    setupEventListeners() {
        // User setup
        document.getElementById('join-community-btn')?.addEventListener('click', () => {
            const username = document.getElementById('username-input').value.trim();
            const selectedAvatar = document.querySelector('.avatar-option.active')?.dataset.avatar || '💎';
            
            if (username.length < 3) {
                this.showToast('Username must be at least 3 characters long', 'error');
                return;
            }
            
            this.createUser(username, selectedAvatar);
        });

        // Avatar selection
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
            });
        });

        // Post creation
        document.getElementById('create-post-btn')?.addEventListener('click', () => {
            const title = document.getElementById('post-textarea').value.trim();
            const category = document.getElementById('post-category').value;
            
            if (!title) {
                this.showToast('Please write something to post', 'error');
                return;
            }
            
            this.createDiscussion(title.slice(0, 100), title, category);
            document.getElementById('post-textarea').value = '';
        });

        // Character count
        document.getElementById('post-textarea')?.addEventListener('input', (e) => {
            const count = e.target.value.length;
            document.getElementById('char-count').textContent = count;
            
            if (count > 450) {
                document.getElementById('char-count').style.color = 'var(--error)';
            } else {
                document.getElementById('char-count').style.color = 'var(--text-muted)';
            }
        });

        // Category filtering
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.category;
                this.currentPage = 1;
                this.renderDiscussions();
            });
        });

        // Sorting
        document.getElementById('sort-discussions')?.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderDiscussions();
        });

        // Load more
        document.getElementById('load-more-discussions')?.addEventListener('click', () => {
            this.currentPage++;
            this.renderDiscussions(true);
        });

        // Modal close
        document.getElementById('modal-close')?.addEventListener('click', () => {
            this.closeModal();
        });

        document.querySelector('.modal-overlay')?.addEventListener('click', () => {
            this.closeModal();
        });
    }

    showUserSetup() {
        document.getElementById('user-setup-card').style.display = 'block';
        document.getElementById('post-creation').style.display = 'none';
    }

    showCommunityInterface() {
        document.getElementById('user-setup-card').style.display = 'none';
        document.getElementById('post-creation').style.display = 'block';
        
        if (this.currentUser) {
            document.getElementById('username-display').textContent = this.currentUser.username;
            document.getElementById('user-avatar-display').textContent = this.currentUser.avatar;
        }
    }

    renderDiscussions(append = false) {
        let filteredDiscussions = this.discussions;
        
        // Apply category filter
        if (this.currentCategory !== 'all') {
            filteredDiscussions = filteredDiscussions.filter(d => d.category === this.currentCategory);
        }
        
        // Apply sorting
        switch (this.currentSort) {
            case 'trending':
                filteredDiscussions.sort((a, b) => (b.likes + b.views) - (a.likes + a.views));
                break;
            case 'most-liked':
                filteredDiscussions.sort((a, b) => b.likes - a.likes);
                break;
            default: // latest
                filteredDiscussions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        
        const startIndex = (this.currentPage - 1) * this.discussionsPerPage;
        const endIndex = startIndex + this.discussionsPerPage;
        const pageDiscussions = filteredDiscussions.slice(startIndex, endIndex);
        
        const container = document.getElementById('discussions-container');
        
        if (!append) {
            container.innerHTML = '';
        }
        
        pageDiscussions.forEach(discussion => {
            const discussionEl = this.createDiscussionElement(discussion);
            container.appendChild(discussionEl);
        });
        
        // Show/hide load more button
        const loadMoreBtn = document.getElementById('load-more-discussions');
        if (endIndex >= filteredDiscussions.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }
    }

    createDiscussionElement(discussion) {
        const div = document.createElement('div');
        div.className = 'discussion-card';
        div.innerHTML = `
            <div class="discussion-header">
                <div class="discussion-avatar">${discussion.authorAvatar}</div>
                <div class="discussion-meta">
                    <div class="discussion-author">${discussion.authorName}</div>
                    <div class="discussion-time">${this.formatTimeAgo(discussion.createdAt)}</div>
                </div>
                <div class="category-tag">${this.getCategoryEmoji(discussion.category)} ${this.getCategoryName(discussion.category)}</div>
            </div>
            <div class="discussion-content">
                <h4>${discussion.title}</h4>
                <p class="discussion-preview">${discussion.content.slice(0, 150)}${discussion.content.length > 150 ? '...' : ''}</p>
            </div>
            <div class="discussion-stats">
                <div class="stat-item">
                    <i class="fas fa-heart"></i>
                    <span>${discussion.likes}</span>
                </div>
                <div class="stat-item">
                    <i class="fas fa-eye"></i>
                    <span>${discussion.views}</span>
                </div>
                <div class="stat-item">
                    <i class="fas fa-comments"></i>
                    <span>${discussion.replyCount}</span>
                </div>
            </div>
        `;
        
        div.addEventListener('click', () => {
            this.openDiscussionModal(discussion);
        });
        
        return div;
    }

    getCategoryEmoji(category) {
        const emojis = {
            'flash-deals': '⚡',
            'reviews': '⭐',
            'coupons': '🎫',
            'shopping-tips': '💡',
            'suggestions': '💭'
        };
        return emojis[category] || '🔥';
    }

    getCategoryName(category) {
        const names = {
            'flash-deals': 'Flash Deals',
            'reviews': 'Reviews',
            'coupons': 'Coupons',
            'shopping-tips': 'Tips',
            'suggestions': 'Suggestions'
        };
        return names[category] || 'Discussion';
    }

    openDiscussionModal(discussion) {
        // Increment views
        discussion.views++;
        this.saveDiscussions();
        
        const modal = document.getElementById('discussion-modal');
        const modalBody = document.getElementById('modal-body');
        
        modalBody.innerHTML = `
            <div class="modal-discussion">
                <div class="discussion-header">
                    <div class="discussion-avatar">${discussion.authorAvatar}</div>
                    <div class="discussion-meta">
                        <div class="discussion-author">${discussion.authorName}</div>
                        <div class="discussion-time">${this.formatTimeAgo(discussion.createdAt)}</div>
                    </div>
                    <div class="category-tag">${this.getCategoryEmoji(discussion.category)} ${this.getCategoryName(discussion.category)}</div>
                </div>
                <div class="discussion-content">
                    <h3>${discussion.title}</h3>
                    <p>${discussion.content}</p>
                </div>
                <div class="discussion-actions">
                    <button class="like-btn ${discussion.likedByUser ? 'liked' : ''}" onclick="community.toggleLike('${discussion.id}')">
                        <i class="fas fa-heart"></i>
                        <span>${discussion.likes}</span>
                    </button>
                    <div class="discussion-stats">
                        <span><i class="fas fa-eye"></i> ${discussion.views} views</span>
                        <span><i class="fas fa-comments"></i> ${discussion.replyCount} replies</span>
                    </div>
                </div>
            </div>
            <div class="replies-section">
                <h4>💬 Community Responses</h4>
                <div class="replies-container" id="replies-container">
                    ${this.generateSampleReplies(discussion)}
                </div>
            </div>
        `;
        
        modal.classList.add('active');
    }

    generateSampleReplies(discussion) {
        const sampleReplies = [
            'Bhai, this is legit! Just ordered, thanks for sharing! 🔥',
            'Price kitna tha original? Seems like good deal! 💰',
            'Maine bhi same product liya tha last month, totally worth it! ⭐',
            'Link working nahi hai yaar, koi alternative suggest karo 😢',
            'Paisa vasool deal hai! Community rocks! 🎯',
            'Quality kaisi hai? Reviews share kar sakte ho? 🤔',
            'Bank offer ke saath aur discount mil sakta hai kya? 💳',
            'Thanks for the heads up! Saved ₹2000 💪',
            'Is deal ka expiry kab hai? Time limit? ⏰',
            'Amazing find! This community is pure gold! 🏆'
        ];
        
        let repliesHTML = '';
        const replyCount = Math.min(Math.floor(Math.random() * 5) + 1, 5);
        
        for (let i = 0; i < replyCount; i++) {
            const randomUser = this.simUsers[Math.floor(Math.random() * this.simUsers.length)];
            const randomReply = sampleReplies[Math.floor(Math.random() * sampleReplies.length)];
            
            repliesHTML += `
                <div class="reply-item">
                    <div class="reply-avatar">${randomUser.avatar}</div>
                    <div class="reply-content">
                        <div class="reply-author">${randomUser.username}</div>
                        <div class="reply-text">${randomReply}</div>
                        <div class="reply-time">${this.formatTimeAgo(new Date(Date.now() - Math.random() * 86400000).toISOString())}</div>
                    </div>
                </div>
            `;
        }
        
        return repliesHTML;
    }

    closeModal() {
        document.getElementById('discussion-modal').classList.remove('active');
    }

    updateUI() {
        // Update stats
        document.getElementById('total-members').textContent = this.simUsers.length.toLocaleString();
        document.getElementById('today-discussions').textContent = Math.floor(Math.random() * 50) + 30;
        
        // Update top contributors
        this.updateTopContributors();
        
        // Render discussions
        this.renderDiscussions();
    }

    updateTopContributors() {
        const topUsers = this.simUsers
            .sort((a, b) => b.reputation - a.reputation)
            .slice(0, 5);
            
        const container = document.getElementById('top-contributors');
        container.innerHTML = topUsers.map(user => `
            <div class="contributor-item">
                <div class="contributor-avatar">${user.avatar}</div>
                <div class="contributor-info">
                    <div class="contributor-name">${user.username}</div>
                    <div class="contributor-points">${user.reputation} points</div>
                </div>
            </div>
        `).join('');
    }

    // === UTILITY FUNCTIONS ===
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString('en-IN');
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        const container = document.getElementById('toast-container');
        container.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => container.removeChild(toast), 300);
        }, 3000);
    }

    startDailyRotation() {
        // Check every hour for new day
        setInterval(() => {
            this.generateDailyContent();
        }, 3600000); // 1 hour
    }

    // Monthly cleanup
    performMonthlyCleanup() {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        // Keep user posts, remove old simulated content
        this.discussions = this.discussions.filter(d => 
            !d.isSimulated || new Date(d.createdAt) > oneMonthAgo
        );
        
        this.saveDiscussions();
    }
}

// Initialize community when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.community = new ThriftZoneCommunity();
});

// Global functions for modal interactions
window.toggleLike = function(discussionId) {
    // Implementation for like toggle
    console.log('Toggling like for:', discussionId);
};

// Add styles for reply items
const additionalCSS = `
.modal-discussion {
    margin-bottom: 2rem;
}

.discussion-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-light);
}

.like-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.like-btn:hover {
    background: var(--primary-color);
    color: white;
}

.like-btn.liked {
    background: var(--error);
    color: white;
}

.replies-section h4 {
    margin: 2rem 0 1rem;
    color: var(--text-primary);
}

.reply-item {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: var(--surface);
    border-radius: 8px;
}

.reply-avatar {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: var(--primary-color);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    flex-shrink: 0;
}

.reply-content {
    flex: 1;
}

.reply-author {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
}

.reply-text {
    color: var(--text-secondary);
    line-height: 1.5;
    margin-bottom: 0.5rem;
}

.reply-time {
    font-size: 0.8rem;
    color: var(--text-muted);
}
`;

// Append additional CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalCSS;
document.head.appendChild(styleSheet);
