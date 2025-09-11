// Enhanced createProductCard function with all requested customizations
function createProductCard(product, index = 0) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-category', product.category);
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    // Format date
    const date = new Date(product.posted_date);
    const formattedDate = date.toLocaleDateString('en-IN');
    
    // Enhanced price calculation with assumed original price
    const priceData = calculateEnhancedPricing(product.price);
    
    // Generate rating stars
    const ratingStars = generateRatingStars(product.rating);
    
    // Random stock level (30% chance of showing low stock)
    const showLowStock = Math.random() < 0.3;
    
    // Generate random but consistent likes/shares based on product ID
    const socialStats = generateSocialStats(product.id);
    
    // Unique timer ID for countdown
    const timerId = 'timer_' + product.id.replace(/[^a-zA-Z0-9]/g, '');
    
    card.innerHTML = `
        <div class="product-image-container">
            ${product.image ? 
                `<img src="${product.image}" alt="${product.title}" class="product-image" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\"product-placeholder\"><i class=\"fas fa-image\"></i></div>'">` 
                : 
                '<div class="product-placeholder"><i class="fas fa-image"></i></div>'
            }
            
            <div class="product-badges">
                ${priceData.discount > 0 ? `<span class="badge badge-discount">${priceData.discount}% OFF</span>` : ''}
                <span class="badge badge-limited">LIMITED TIME</span>
            </div>
            
            <button class="wishlist-btn" onclick="toggleWishlist('${product.id}', this)" title="Add to wishlist">
                <i class="far fa-heart"></i>
            </button>
        </div>
        
        <div class="product-info">
            <div class="product-category">${product.category}</div>
            
            <h3 class="product-title">${product.title}</h3>
            
            <div class="product-rating">
                <div class="rating-stars">${ratingStars}</div>
                <span class="rating-text">${extractRatingText(product.rating)}</span>
            </div>
            
            <div class="product-price-section">
                <div class="price-row">
                    <span class="price-original">₹${priceData.originalPrice}</span>
                    <span class="price-current">₹${priceData.currentPrice}</span>
                </div>
                <div class="savings-section">
                    <span class="savings-amount">Save ₹${priceData.savings}</span>
                    <span class="discount-percentage">${priceData.discount}% OFF</span>
                </div>
            </div>
            
            ${showLowStock ? '<div class="stock-indicator">🔥 Only few left!</div>' : ''}
            
            <div class="countdown-timer">
                <span class="timer-label">Deal expires in:</span>
                <span class="timer-value" id="${timerId}">02:00:00</span>
            </div>
            
            <div class="product-meta">
                <div class="product-date">📅 ${formattedDate}</div>
                <div class="product-source">Amazon</div>
            </div>
            
            <div class="product-actions">
                <a href="${product.affiliate_link}" 
                   target="_blank" 
                   class="deal-btn" 
                   onclick="trackClick('${product.id}')"
                   rel="noopener noreferrer">
                    <i class="fas fa-bolt"></i>
                    Grab Deal Now
                </a>
                
                <div class="social-actions">
                    <button class="like-btn" onclick="toggleLike('${product.id}', this)" title="Like this deal">
                        <i class="far fa-thumbs-up"></i>
                        <span class="like-count">${socialStats.likes}</span>
                    </button>
                    <button class="share-btn" onclick="shareProduct('${product.id}')" title="Share deal">
                        <i class="fas fa-share-alt"></i>
                        <span class="share-count">${socialStats.shares}</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Initialize 2-hour countdown timer
    setTimeout(() => {
        initializeDealCountdown(timerId);
    }, 100);
    
    return card;
}

// Enhanced pricing calculation function
function calculateEnhancedPricing(priceString) {
    // Extract current price from string like "₹1,799" or "₹Special Price"
    const priceMatch = priceString.match(/₹(\d+,?\d*)/);
    
    if (!priceMatch) {
        // Handle "Special Price" or other non-numeric prices
        return {
            currentPrice: "999",
            originalPrice: "1,299",
            savings: "300",
            discount: 23
        };
    }
    
    const currentPrice = parseInt(priceMatch[1].replace(',', ''));
    
    // Calculate assumed original price (15-25% higher)
    const discountPercent = 15 + Math.floor(Math.random() * 10); // 15-25%
    const originalPrice = Math.round(currentPrice / (1 - discountPercent / 100));
    const savings = originalPrice - currentPrice;
    
    return {
        currentPrice: currentPrice.toLocaleString('en-IN'),
        originalPrice: originalPrice.toLocaleString('en-IN'),
        savings: savings.toLocaleString('en-IN'),
        discount: discountPercent
    };
}

// Generate consistent social stats based on product ID
function generateSocialStats(productId) {
    // Create a simple hash from product ID for consistency
    let hash = 0;
    for (let i = 0; i < productId.length; i++) {
        const char = productId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Use hash to generate consistent random-looking numbers
    const likes = 50 + (Math.abs(hash) % 200); // 50-250 likes
    const shares = 10 + (Math.abs(hash) % 80);  // 10-90 shares
    
    return { likes, shares };
}

// 2-hour countdown timer function
function initializeDealCountdown(timerId) {
    const timer = document.getElementById(timerId);
    if (!timer) return;
    
    // Set countdown to exactly 2 hours (7200 seconds)
    let timeLeft = 2 * 60 * 60; // 2 hours in seconds
    
    const updateTimer = () => {
        if (timeLeft <= 0) {
            timer.parentElement.innerHTML = '<div class="countdown-timer" style="background: #666;"><span class="timer-label">Deal Expired</span></div>';
            return;
        }
        
        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;
        
        timer.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        timeLeft--;
        setTimeout(updateTimer, 1000);
    };
    
    updateTimer();
}

// Like functionality
function toggleLike(productId, button) {
    const icon = button.querySelector('i');
    const countSpan = button.querySelector('.like-count');
    const isLiked = button.classList.contains('liked');
    
    if (isLiked) {
        button.classList.remove('liked');
        icon.className = 'far fa-thumbs-up';
        countSpan.textContent = parseInt(countSpan.textContent) - 1;
        removeFromLikes(productId);
    } else {
        button.classList.add('liked');
        icon.className = 'fas fa-thumbs-up';
        countSpan.textContent = parseInt(countSpan.textContent) + 1;
        addToLikes(productId);
    }
    
    // Add animation
    button.style.transform = 'scale(1.2)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 200);
}

// Like storage functions
function addToLikes(productId) {
    let likes = JSON.parse(localStorage.getItem('thriftzone_likes') || '[]');
    if (!likes.includes(productId)) {
        likes.push(productId);
        localStorage.setItem('thriftzone_likes', JSON.stringify(likes));
    }
}

function removeFromLikes(productId) {
    let likes = JSON.parse(localStorage.getItem('thriftzone_likes') || '[]');
    likes = likes.filter(id => id !== productId);
    localStorage.setItem('thriftzone_likes', JSON.stringify(likes));
}

// Enhanced share function (preserving existing functionality)
function shareProduct(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    // Increment share count visually
    const shareBtn = event.target.closest('.share-btn');
    const shareCount = shareBtn.querySelector('.share-count');
    if (shareCount) {
        shareCount.textContent = parseInt(shareCount.textContent) + 1;
    }
    
    const shareData = {
        title: `Thrift Zone - ${product.title}`,
        text: `🔥 Amazing Deal Alert! ${product.title} - Check out this exclusive offer with huge savings!`,
        url: product.affiliate_link
    };
    
    if (navigator.share) {
        navigator.share(shareData);
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`).then(() => {
            showNotification('Deal link copied to clipboard! 🎉');
        });
    }
    
    // Add animation
    shareBtn.style.transform = 'scale(1.2)';
    setTimeout(() => {
        shareBtn.style.transform = 'scale(1)';
    }, 200);
}
