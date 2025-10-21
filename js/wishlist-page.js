// Wishlist Page Controller
let wishlistManager;
let currentWishlistId = null;

// Initialize Supabase (use your actual credentials)
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎁 Wishlist page initialized');
    
    // Initialize wishlist manager
    wishlistManager = new WishlistManager(supabase);
    window.wishlistManager = wishlistManager;
    
    const initialized = await wishlistManager.initialize();
    
    if (!initialized) {
        // Redirect to login if not authenticated
        window.location.href = '/login.html';
        return;
    }
    
    // Load and display wishlists
    await loadWishlistTabs();
    
    // Select first wishlist by default
    if (wishlistManager.wishlists.length > 0) {
        selectWishlist(wishlistManager.wishlists[0].id);
    }
});

// Load wishlist tabs
async function loadWishlistTabs() {
    const tabsContainer = document.getElementById('wishlist-tabs');
    tabsContainer.innerHTML = '';
    
    wishlistManager.wishlists.forEach(wishlist => {
        const items = wishlistManager.getWishlistItems(wishlist.id);
        const tab = document.createElement('button');
        tab.className = 'wishlist-tab';
        tab.dataset.wishlistId = wishlist.id;
        tab.innerHTML = `
            <span class="tab-name">${wishlist.name}</span>
            <span class="tab-count">${items.length}</span>
        `;
        tab.onclick = () => selectWishlist(wishlist.id);
        tabsContainer.appendChild(tab);
    });
}

// Select and display wishlist
function selectWishlist(wishlistId) {
    currentWishlistId = wishlistId;
    
    // Update active tab
    document.querySelectorAll('.wishlist-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.wishlistId === wishlistId) {
            tab.classList.add('active');
        }
    });
    
    // Load items
    displayWishlistItems(wishlistId);
}

// Display wishlist items
function displayWishlistItems(wishlistId) {
    const items = wishlistManager.getWishlistItems(wishlistId);
    const container = document.getElementById('wishlist-items');
    const emptyState = document.getElementById('wishlist-empty');
    const infoElement = document.getElementById('wishlist-info');
    
    // Update info
    infoElement.innerHTML = `<span class="item-count">${items.length} item${items.length !== 1 ? 's' : ''}</span>`;
    
    if (items.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'flex';
        return;
    }
    
    container.style.display = 'grid';
    emptyState.style.display = 'none';
    container.innerHTML = '';
    
    items.forEach(item => {
        const product = item.product_data;
        const card = document.createElement('div');
        card.className = 'wishlist-product-card';
        
        card.innerHTML = `
            <button class="remove-wishlist-btn" 
                    onclick="removeFromWishlist('${item.product_id}')"
                    aria-label="Remove from wishlist">
                <i class="fas fa-times"></i>
            </button>
            
            <div class="wishlist-product-image">
                <img src="${product.image}" alt="${product.title}" loading="lazy">
                ${product.discount ? `<span class="discount-badge">${product.discount}% OFF</span>` : ''}
            </div>
            
            <div class="wishlist-product-info">
                <span class="product-category">${product.category || 'General'}</span>
                <h3 class="product-title">${product.title}</h3>
                
                <div class="product-rating">
                    <div class="stars">${renderStars(product.rating || 4)}</div>
                    <span class="rating-value">${product.rating || 4} /5</span>
                </div>
                
                <div class="product-price">
                    <span class="current-price">₹${product.price}</span>
                    ${product.originalPrice ? `
                        <span class="original-price">₹${product.originalPrice}</span>
                    ` : ''}
                </div>
                
                <div class="wishlist-product-actions">
                    <button class="btn-primary" onclick="window.open('${product.link}', '_blank')">
                        Get This Deal
                    </button>
                    <button class="btn-secondary" onclick="moveToWishlist('${item.product_id}')">
                        <i class="fas fa-arrow-right"></i> Move
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Render star rating
function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let html = '';
    
    for (let i = 0; i < fullStars; i++) {
        html += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        html += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        html += '<i class="far fa-star"></i>';
    }
    
    return html;
}

// Remove from wishlist
async function removeFromWishlist(productId) {
    const success = await wishlistManager.removeFromWishlist(productId, currentWishlistId);
    if (success) {
        await loadWishlistTabs();
        displayWishlistItems(currentWishlistId);
    }
}

// Create new wishlist
async function createNewWishlist() {
    const name = prompt('Enter wishlist name:');
    if (!name || name.trim() === '') return;
    
    const wishlist = await wishlistManager.createWishlist(name.trim());
    if (wishlist) {
        await loadWishlistTabs();
        selectWishlist(wishlist.id);
    }
}

// Rename current wishlist
async function renameCurrentWishlist() {
    if (!currentWishlistId) return;
    
    const wishlist = wishlistManager.wishlists.find(w => w.id === currentWishlistId);
    const newName = prompt('Enter new name:', wishlist?.name || '');
    
    if (!newName || newName.trim() === '') return;
    
    const success = await wishlistManager.renameWishlist(currentWishlistId, newName.trim());
    if (success) {
        await loadWishlistTabs();
    }
}

// Delete current wishlist
async function deleteCurrentWishlist() {
    if (!currentWishlistId) return;
    
    const wishlist = wishlistManager.wishlists.find(w => w.id === currentWishlistId);
    const confirmed = confirm(`Are you sure you want to delete "${wishlist?.name}"?`);
    
    if (!confirmed) return;
    
    const success = await wishlistManager.deleteWishlist(currentWishlistId);
    if (success) {
        await loadWishlistTabs();
        if (wishlistManager.wishlists.length > 0) {
            selectWishlist(wishlistManager.wishlists[0].id);
        }
    }
}

// Share current wishlist
async function shareCurrentWishlist() {
    if (!currentWishlistId) return;
    
    const shareLink = await wishlistManager.generateShareLink(currentWishlistId);
    
    // Try native share API first
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'My Wishlist',
                text: 'Check out my wishlist on Thrift Maal!',
                url: shareLink
            });
            return;
        } catch (error) {
            console.log('Share cancelled or failed:', error);
        }
    }
    
    // Fallback: Copy to clipboard
    try {
        await navigator.clipboard.writeText(shareLink);
        wishlistManager.showToast('Link copied to clipboard!', 'success');
    } catch (error) {
        // Final fallback: Show link in prompt
        prompt('Copy this link to share:', shareLink);
    }
}

// Move product to different wishlist
async function moveToWishlist(productId) {
    const wishlists = wishlistManager.wishlists.filter(w => w.id !== currentWishlistId);
    
    if (wishlists.length === 0) {
        wishlistManager.showToast('Create another wishlist first', 'info');
        return;
    }
    
    // Create modal for selecting wishlist
    const modal = document.createElement('div');
    modal.className = 'wishlist-move-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Move to Wishlist</h3>
            <div class="wishlist-options">
                ${wishlists.map(w => `
                    <button class="wishlist-option" onclick="moveProductToWishlist('${productId}', '${w.id}')">
                        ${w.name}
                    </button>
                `).join('')}
            </div>
            <button class="btn-secondary" onclick="this.closest('.wishlist-move-modal').remove()">Cancel</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Execute move
async function moveProductToWishlist(productId, targetWishlistId) {
    // Get product data
    const items = wishlistManager.getWishlistItems(currentWishlistId);
    const item = items.find(i => i.product_id === productId);
    
    if (!item) return;
    
    // Remove from current wishlist
    await wishlistManager.removeFromWishlist(productId, currentWishlistId);
    
    // Add to target wishlist
    await wishlistManager.addToWishlist(item.product_data, targetWishlistId);
    
    // Refresh display
    await loadWishlistTabs();
    displayWishlistItems(currentWishlistId);
    
    // Close modal
    document.querySelector('.wishlist-move-modal')?.remove();
}
