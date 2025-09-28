// Product Page JavaScript - Complete Implementation
let currentProduct = null;
let productTimer = null;

// Initialize product page
document.addEventListener('DOMContentLoaded', function() {
    const productId = getProductIdFromURL();
    if (productId) {
        loadProductData(productId);
    } else {
        showProductNotFound();
    }
});

// Get product ID from URL parameters
function getProductIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || urlParams.get('title');
}

// Load product data
async function loadProductData(productId) {
    try {
        showLoadingState();
        
        // Load products data
        const response = await fetch('data/products.json');
        const data = await response.json();
        
        // Find product by ID or title
        const product = data.products.find(p => 
            p.id == productId || 
            p.title.toLowerCase().replace(/[^a-z0-9]/g, '-') === productId
        );
        
        if (product) {
            currentProduct = product;
            displayProduct(product);
            loadRelatedProducts(product.category);
            hideLoadingState();
        } else {
            showProductNotFound();
        }
    } catch (error) {
        console.error('Error loading product:', error);
        showProductNotFound();
    }
}

// Display product information
function displayProduct(product) {
    // Enhanced product data
    const enhancedData = enhanceProductData(product);
    
    // Update page title and meta
    document.title = `${product.title} - Thrift Zone`;
    document.getElementById('product-meta-description').content = 
        `${product.title} - Amazing deals and discounts. Save big on ${product.category} products at Thrift Zone.`;
    
    // Breadcrumbs
    document.getElementById('breadcrumb-category').textContent = 
        product.category.charAt(0).toUpperCase() + product.category.slice(1);
    document.getElementById('breadcrumb-product').textContent = 
        product.title.substring(0, 30) + (product.title.length > 30 ? '...' : '');
    
    // Product image and badges
    const productImage = document.getElementById('product-image');
    productImage.src = product.image || 'images/placeholder.jpg';
    productImage.alt = product.title;
    
    // Update badges
    document.getElementById('discount-badge').textContent = `${enhancedData.discountPercent}% OFF`;
    
    if (enhancedData.isLimitedTime) {
        document.getElementById('limited-time-badge').style.display = 'inline-block';
    }
    
    if (enhancedData.isLowStock) {
        document.getElementById('stock-badge').style.display = 'inline-block';
    }
    
    // Product info
    document.getElementById('product-name').textContent = product.title;
    document.getElementById('product-category').querySelector('.category-name').textContent = 
        product.category.charAt(0).toUpperCase() + product.category.slice(1);
    
    // Pricing
    document.getElementById('current-price').textContent = enhancedData.salePrice;
    document.getElementById('original-price').textContent = `₹${enhancedData.originalPrice}`;
    document.getElementById('discount-percent').textContent = `${enhancedData.discountPercent}% OFF`;
    document.getElementById('savings-amount').textContent = `You Save ₹${enhancedData.savings}`;
    
    // Buy button - FIXED: Use correct property name
    const buyButton = document.getElementById('buy-now-btn');
    buyButton.onclick = () => redirectToAmazon(product.affiliate_link || product.affiliateLink);
    
    // Initialize timer
    initializeProductTimer();
    
    // Load enhanced features
    loadProductFeatures(product);
    
    // Show product details
    document.getElementById('product-details').style.display = 'block';
}

// Enhanced product data generator (same as main site)
function enhanceProductData(product) {
    const currentPriceMatch = product.price.match(/₹?([0-9,]+)/);
    const currentPrice = currentPriceMatch ? parseInt(currentPriceMatch[1].replace(/,/g, '')) : 999;
    
    const markup = 1.3 + (Math.random() * 0.7);
    const originalPrice = Math.round(currentPrice * markup);
    const savings = originalPrice - currentPrice;
    const discountPercent = Math.round((savings / originalPrice) * 100);
    
    return {
        salePrice: currentPrice.toLocaleString('en-IN'),
        originalPrice: originalPrice.toLocaleString('en-IN'),
        savings: savings.toLocaleString('en-IN'),
        discountPercent: discountPercent,
        isLimitedTime: Math.random() > 0.6,
        isLowStock: Math.random() > 0.7
    };
}

// Initialize product timer
function initializeProductTimer() {
    const minMinutes = 30;
    const maxMinutes = 720; // 12 hours
    const randomMinutes = Math.floor(Math.random() * (maxMinutes - minMinutes + 1)) + minMinutes;
    
    let endTime = Date.now() + (randomMinutes * 60 * 1000);
    
    // Update timer immediately
    updateTimer(endTime);
    
    // Update every second
    productTimer = setInterval(() => updateTimer(endTime), 1000);
}

// Update timer display
function updateTimer(endTime) {
    const now = Date.now();
    const timeLeft = endTime - now;
    
    if (timeLeft <= 0) {
        // Reset timer
        const minMinutes = 30;
        const maxMinutes = 720;
        const randomMinutes = Math.floor(Math.random() * (maxMinutes - minMinutes + 1)) + minMinutes;
        endTime = Date.now() + (randomMinutes * 60 * 1000);
        return;
    }
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    // Update individual timer elements
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    
    if (hoursElement) hoursElement.textContent = hours.toString().padStart(2, '0');
    if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
    if (secondsElement) secondsElement.textContent = seconds.toString().padStart(2, '0');
}

// Load product features (likes, comments)
function loadProductFeatures(product) {
    const productIndex = product.id || Math.random().toString(36).substr(2, 9);
    
    // Load likes
    const likes = getLikes(productIndex);
    document.getElementById('like-count').textContent = likes;
    document.getElementById('like-display').textContent = likes;
    
    // Load comments
    const comments = getComments(productIndex);
    document.getElementById('comment-count').textContent = comments.length;
    document.getElementById('comment-display').textContent = comments.length;
    
    // Check if liked
    if (isLiked(productIndex)) {
        const likeBtn = document.querySelector('.like-btn');
        if (likeBtn) {
            likeBtn.classList.add('active');
            likeBtn.querySelector('i').className = 'fas fa-thumbs-up';
        }
    }
}

// Load related products
async function loadRelatedProducts(category) {
    try {
        const response = await fetch('data/products.json');
        const data = await response.json();
        
        // Get related products (same category, excluding current product)
        const relatedProducts = data.products
            .filter(p => p.category === category && p.id !== currentProduct.id)
            .slice(0, 4);
        
        if (relatedProducts.length > 0) {
            displayRelatedProducts(relatedProducts);
        } else {
            // Show random products if no same category products
            const randomProducts = data.products
                .filter(p => p.id !== currentProduct.id)
                .slice(0, 4);
            displayRelatedProducts(randomProducts);
        }
    } catch (error) {
        console.error('Error loading related products:', error);
    }
}

// Display related products
function displayRelatedProducts(products) {
    const container = document.getElementById('related-products-grid');
    container.innerHTML = '';
    
    products.forEach(product => {
        const productUrl = createProductURL(product);
        
        const card = document.createElement('div');
        card.className = 'related-product-card';
        card.onclick = () => window.location.href = productUrl;
        
        card.innerHTML = `
            <img src="${product.image || 'images/placeholder.jpg'}" 
                 alt="${product.title}" 
                 class="related-product-image"
                 loading="lazy">
            <div class="related-product-info">
                <h3 class="related-product-title">${product.title}</h3>
                <div class="related-product-price">₹${product.price}</div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Create product URL with title
function createProductURL(product) {
    const titleSlug = product.title.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
    return `product.html?id=${product.id}&title=${titleSlug}`;
}

// Redirect to Amazon with modal - FIXED AND ENHANCED
function redirectToAmazon(affiliateLink) {
    console.log('Redirecting to:', affiliateLink); // Debug log
    
    if (!affiliateLink || affiliateLink === 'undefined' || affiliateLink === '') {
        alert('Product link not available. Please try another product.');
        return;
    }
    
    // Show redirect modal
    const modal = document.getElementById('redirect-modal');
    modal.style.display = 'flex';
    
    // Countdown timer (2 seconds)
    let countdown = 2;
    const countdownElement = document.getElementById('countdown-timer');
    const countdownText = document.getElementById('countdown-text');
    
    // Update initial countdown display
    if (countdownElement) countdownElement.textContent = countdown;
    if (countdownText) countdownText.textContent = countdown;
    
    const countdownInterval = setInterval(() => {
        countdown--;
        
        if (countdownElement) countdownElement.textContent = countdown;
        if (countdownText) countdownText.textContent = countdown;
        
        if (countdown < 0) {
            clearInterval(countdownInterval);
            
            // Ensure we have a valid URL
            let finalUrl = affiliateLink;
            if (!finalUrl.startsWith('http')) {
                finalUrl = 'https://' + finalUrl;
            }
            
            console.log('Opening URL:', finalUrl); // Debug log
            window.open(finalUrl, '_blank');
            modal.style.display = 'none';
        }
    }, 1000);
    
    // Close modal if clicked outside
    modal.onclick = (e) => {
        if (e.target === modal) {
            clearInterval(countdownInterval);
            modal.style.display = 'none';
        }
    };
}

// Product interaction functions
function toggleLike() {
    const productIndex = currentProduct.id || Math.random().toString(36).substr(2, 9);
    const likeBtn = document.querySelector('.like-btn');
    const likeCount = document.getElementById('like-display');
    
    let likes = getLikes(productIndex);
    const isCurrentlyLiked = isLiked(productIndex);
    
    if (isCurrentlyLiked) {
        likes = Math.max(0, likes - 1);
        setLiked(productIndex, false);
        likeBtn.classList.remove('active');
        likeBtn.querySelector('i').className = 'far fa-thumbs-up';
    } else {
        likes += 1;
        setLiked(productIndex, true);
        likeBtn.classList.add('active');
        likeBtn.querySelector('i').className = 'fas fa-thumbs-up';
    }
    
    setLikes(productIndex, likes);
    likeCount.textContent = likes;
    document.getElementById('like-count').textContent = likes;
}

function toggleWishlist() {
    const wishlistBtn = document.querySelector('.wishlist-btn');
    const icon = wishlistBtn.querySelector('i');
    const text = wishlistBtn.querySelector('span');
    
    if (wishlistBtn.classList.contains('active')) {
        wishlistBtn.classList.remove('active');
        icon.className = 'far fa-heart';
        text.textContent = 'Save for Later';
        showToast('Removed from wishlist');
    } else {
        wishlistBtn.classList.add('active');
        icon.className = 'fas fa-heart';
        text.textContent = 'In Wishlist';
        showToast('Added to wishlist');
    }
}

function shareProduct() {
    const productTitle = currentProduct.title;
    const currentUrl = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: `${productTitle} - Thrift Zone`,
            text: 'Check out this amazing deal!',
            url: currentUrl
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback to copying link
        navigator.clipboard.writeText(currentUrl).then(() => {
            showToast('Product link copied!');
        }).catch(() => {
            // Manual copy fallback
            const textArea = document.createElement('textarea');
            textArea.value = currentUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showToast('Product link copied!');
        });
    }
}

function showComments() {
    const modal = document.getElementById('comment-modal');
    const commentsList = document.getElementById('comments-list');
    
    const productIndex = currentProduct.id || Math.random().toString(36).substr(2, 9);
    const comments = getComments(productIndex);
    
    commentsList.innerHTML = comments.map(comment => `
        <div class="comment-item">
            <div class="comment-author">${comment.author}</div>
            <div class="comment-text">${comment.text}</div>
            <div class="comment-date">${comment.date}</div>
        </div>
    `).join('');
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 20px;">No comments yet!</p>';
    }
    
    modal.style.display = 'flex';
}

function closeCommentModal() {
    document.getElementById('comment-modal').style.display = 'none';
}

function submitComment() {
    const input = document.getElementById('comment-input');
    const text = input.value.trim();
    
    if (!text) return;
    
    const productIndex = currentProduct.id || Math.random().toString(36).substr(2, 9);
    addComment(productIndex, text);
    
    input.value = '';
    closeCommentModal();
    
    // Update comment count
    const comments = getComments(productIndex);
    document.getElementById('comment-count').textContent = comments.length;
    document.getElementById('comment-display').textContent = comments.length;
    
    showToast('Comment added!');
}

// Utility functions (same as main site)
function getLikes(productIndex) {
    const likes = JSON.parse(localStorage.getItem('productLikes') || '{}');
    return likes[productIndex] || Math.floor(Math.random() * 50) + 10;
}

function setLikes(productIndex, count) {
    const likes = JSON.parse(localStorage.getItem('productLikes') || '{}');
    likes[productIndex] = count;
    localStorage.setItem('productLikes', JSON.stringify(likes));
}

function isLiked(productIndex) {
    const liked = JSON.parse(localStorage.getItem('likedProducts') || '{}');
    return liked[productIndex] || false;
}

function setLiked(productIndex, isLiked) {
    const liked = JSON.parse(localStorage.getItem('likedProducts') || '{}');
    liked[productIndex] = isLiked;
    localStorage.setItem('likedProducts', JSON.stringify(liked));
}

function getComments(productIndex) {
    const comments = JSON.parse(localStorage.getItem('productComments') || '{}');
    if (!comments[productIndex]) {
        comments[productIndex] = getDefaultComments();
        localStorage.setItem('productComments', JSON.stringify(comments));
    }
    return comments[productIndex];
}

function getDefaultComments() {
    const defaultComments = [
        { author: 'Sarah', text: 'Great deal!', date: '2d ago' },
        { author: 'Mike', text: 'Amazing quality!', date: '1d ago' },
        { author: 'Priya', text: 'Love it!', date: '5h ago' }
    ];
    const numComments = Math.floor(Math.random() * 3);
    return defaultComments.slice(0, numComments);
}

function addComment(productIndex, text) {
    const comments = getComments(productIndex);
    const newComment = {
        author: 'You',
        text: text,
        date: 'now'
    };
    comments.unshift(newComment);
    
    const allComments = JSON.parse(localStorage.getItem('productComments') || '{}');
    allComments[productIndex] = comments;
    localStorage.setItem('productComments', JSON.stringify(allComments));
}

// UI state functions
function showLoadingState() {
    document.getElementById('product-loading').style.display = 'block';
    document.getElementById('product-details').style.display = 'none';
    document.getElementById('product-not-found').style.display = 'none';
}

function hideLoadingState() {
    document.getElementById('product-loading').style.display = 'none';
}

function showProductNotFound() {
    document.getElementById('product-loading').style.display = 'none';
    document.getElementById('product-details').style.display = 'none';
    document.getElementById('product-not-found').style.display = 'block';
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #2874F0;
        color: white;
        padding: 12px 16px;
        border-radius: 6px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (document.body.contains(toast)) {
            document.body.removeChild(toast);
        }
    }, 3000);
}

// Navigation functions
function goBack() {
    if (document.referrer && document.referrer.includes(window.location.hostname)) {
        history.back();
    } else {
        window.location.href = 'index.html';
    }
}

// Clean up timer on page unload
window.addEventListener('beforeunload', () => {
    if (productTimer) {
        clearInterval(productTimer);
    }
});
