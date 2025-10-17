// ====================================================================
// THRIFT ZONE - CUSTOMIZED PRODUCT PAGE JAVASCRIPT
// Features: Image Zoom, Lazy Loading, Live Viewers, Share, Sticky Buy
// ====================================================================

'use strict';

// Product Page Module
const ProductPage = (() => {
    // Private variables
    let currentProduct = null;
    let productTimer = null;
    let viewerInterval = null;
    const cachedElements = {};
    
    // Initialize on DOM load
    const init = () => {
        cacheElements();
        const productId = getProductIdFromURL();
        
        if (productId) {
            loadProductData(productId);
        } else {
            showProductNotFound();
        }
        
        initializeEventListeners();
        initializeStickyBuyButton();
    };
    
    // Cache DOM elements
    const cacheElements = () => {
        cachedElements.productLoading = document.getElementById('product-loading');
        cachedElements.productDetails = document.getElementById('product-details');
        cachedElements.productNotFound = document.getElementById('product-not-found');
        cachedElements.productImage = document.getElementById('product-image');
        cachedElements.stickyBuyMobile = document.getElementById('sticky-buy-mobile');
        cachedElements.buyButton = document.getElementById('buy-now-btn');
        cachedElements.stickyBuyBtn = document.getElementById('sticky-buy-btn');
        cachedElements.shareBtn = document.getElementById('share-btn');
    };
    
    // Get product ID from URL
    const getProductIdFromURL = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id') || urlParams.get('title');
    };
    
    // Load product data with retry logic
    const loadProductData = async (productId, retries = 3) => {
        showLoadingState();
        
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch('data/products.json');
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                const product = findProduct(data.products, productId);
                
                if (product) {
                    currentProduct = product;
                    await displayProduct(product);
                    loadRelatedProducts(product.category, data.products);
                    hideLoadingState();
                    return;
                } else {
                    showProductNotFound();
                    return;
                }
                
            } catch (error) {
                console.error(`Attempt ${i + 1} failed:`, error);
                
                if (i === retries - 1) {
                    showToast('Failed to load product. Please refresh the page.');
                    showProductNotFound();
                }
                
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    };
    
    // Find product in data
    const findProduct = (products, productId) => {
        return products.find(p => 
            p.id == productId || 
            p.title.toLowerCase().replace(/[^a-z0-9]/g, '-') === productId
        );
    };
    
    // Display product information
    const displayProduct = async (product) => {
        cleanupTimers();
        
        // Enhanced product data
        const enhancedData = enhanceProductData(product);
        
        // Update page metadata
        updatePageMetadata(product, enhancedData);
        
        // Update breadcrumbs
        updateBreadcrumbs(product);
        
        // Update product image with lazy loading
        updateProductImage(product);
        
        // Update badges
        updateBadges(enhancedData);
        
        // Update product info
        updateProductInfo(product);
        
        // Update pricing
        updatePricing(enhancedData);
        
        // Setup buy buttons
        setupBuyButtons(product);
        
        // Initialize features
        initializeProductTimer();
        initializeLiveViewers();
        initializeImageZoom();
        
        // Load product specifications
        loadProductSpecifications(product);
        
        // Show product details
        cachedElements.productDetails.style.display = 'block';
        cachedElements.productDetails.classList.add('fade-in');
    };
    
    // Enhance product data with calculated values
    const enhanceProductData = (product) => {
        const currentPriceMatch = product.price.match(/₹?([0-9,]+)/);
        const currentPrice = currentPriceMatch ? 
            parseInt(currentPriceMatch[1].replace(/,/g, '')) : 999;
        
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
    };
    
    // Update page metadata
    const updatePageMetadata = (product, enhancedData) => {
        const title = `${product.title} - ${enhancedData.discountPercent}% OFF - Thrift Zone`;
        const description = `Buy ${product.title} at ₹${enhancedData.salePrice} (was ₹${enhancedData.originalPrice}). Save ₹${enhancedData.savings} on ${product.category} products at Thrift Zone.`;
        const currentUrl = window.location.href;
        
        document.title = title;
        document.getElementById('product-title').textContent = title;
        document.getElementById('product-meta-description').content = description;
        
        // Open Graph tags
        document.getElementById('og-title')?.setAttribute('content', title);
        document.getElementById('og-description')?.setAttribute('content', description);
        document.getElementById('og-image')?.setAttribute('content', product.image || '');
        document.getElementById('og-url')?.setAttribute('content', currentUrl);
    };
    
    // Update breadcrumbs
    const updateBreadcrumbs = (product) => {
        const categoryElement = document.getElementById('breadcrumb-category');
        const productElement = document.getElementById('breadcrumb-product');
        
        if (categoryElement) {
            categoryElement.textContent = 
                product.category.charAt(0).toUpperCase() + product.category.slice(1);
        }
        
        if (productElement) {
            const truncated = product.title.substring(0, 30);
            productElement.textContent = truncated + (product.title.length > 30 ? '...' : '');
        }
    };
    
    // Update product image with lazy loading
    const updateProductImage = (product) => {
        const img = cachedElements.productImage;
        if (!img) return;
        
        img.setAttribute('data-src', product.image || 'images/placeholder.jpg');
        img.alt = product.title;
        
        // Lazy load image
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const imgElement = entry.target;
                    imgElement.src = imgElement.getAttribute('data-src');
                    imgElement.removeAttribute('data-src');
                    obs.unobserve(imgElement);
                }
            });
        });
        
        observer.observe(img);
    };
    
    // Update badges
    const updateBadges = (enhancedData) => {
        const discountBadge = document.getElementById('discount-badge');
        const limitedBadge = document.getElementById('limited-time-badge');
        
        if (discountBadge) {
            discountBadge.textContent = `${enhancedData.discountPercent}% OFF`;
        }
        
        if (limitedBadge && enhancedData.isLimitedTime) {
            limitedBadge.style.display = 'inline-block';
        }
    };
    
    // Update product info
    const updateProductInfo = (product) => {
        const nameElement = document.getElementById('product-name');
        const categoryElement = document.querySelector('#product-category .category-name');
        
        if (nameElement) nameElement.textContent = product.title;
        if (categoryElement) {
            categoryElement.textContent = 
                product.category.charAt(0).toUpperCase() + product.category.slice(1);
        }
    };
    
    // Update pricing
    const updatePricing = (enhancedData) => {
        const elements = {
            currentPrice: document.getElementById('current-price'),
            originalPrice: document.getElementById('original-price'),
            discountPercent: document.getElementById('discount-percent'),
            savingsAmount: document.getElementById('savings-amount'),
            stickyPrice: document.getElementById('sticky-price'),
            stickyOriginal: document.getElementById('sticky-original')
        };
        
        if (elements.currentPrice) elements.currentPrice.textContent = enhancedData.salePrice;
        if (elements.originalPrice) elements.originalPrice.textContent = `₹${enhancedData.originalPrice}`;
        if (elements.discountPercent) elements.discountPercent.textContent = `${enhancedData.discountPercent}% OFF`;
        if (elements.savingsAmount) elements.savingsAmount.textContent = `You Save ₹${enhancedData.savings}`;
        if (elements.stickyPrice) elements.stickyPrice.textContent = `₹${enhancedData.salePrice}`;
        if (elements.stickyOriginal) elements.stickyOriginal.textContent = `₹${enhancedData.originalPrice}`;
    };
    
    // Setup buy buttons
    const setupBuyButtons = (product) => {
        const affiliateLink = product.affiliate_link || product.affiliateLink || product.link;
        
        if (cachedElements.buyButton) {
            cachedElements.buyButton.onclick = () => redirectToAmazon(affiliateLink);
        }
        
        if (cachedElements.stickyBuyBtn) {
            cachedElements.stickyBuyBtn.onclick = () => redirectToAmazon(affiliateLink);
        }
    };
    
    // Initialize product timer
    const initializeProductTimer = () => {
        const timerElements = {
            hours: document.getElementById('hours'),
            minutes: document.getElementById('minutes'),
            seconds: document.getElementById('seconds')
        };
        
        if (!timerElements.hours) return;
        
        const randomMinutes = Math.floor(Math.random() * 690) + 30;
        let endTime = Date.now() + (randomMinutes * 60 * 1000);
        
        const updateTimer = () => {
            const now = Date.now();
            const timeLeft = endTime - now;
            
            if (timeLeft <= 0) {
                endTime = Date.now() + (Math.floor(Math.random() * 690) + 30) * 60 * 1000;
                return;
            }
            
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            
            if (timerElements.hours) {
                timerElements.hours.textContent = hours.toString().padStart(2, '0');
            }
            if (timerElements.minutes) {
                timerElements.minutes.textContent = minutes.toString().padStart(2, '0');
            }
            if (timerElements.seconds) {
                timerElements.seconds.textContent = seconds.toString().padStart(2, '0');
            }
        };
        
        updateTimer();
        productTimer = setInterval(updateTimer, 1000);
    };
    
    // Initialize live viewers count
    const initializeLiveViewers = () => {
        const viewerElement = document.getElementById('viewer-count');
        if (!viewerElement) return;
        
        let viewerCount = Math.floor(Math.random() * 50) + 15;
        viewerElement.textContent = viewerCount;
        
        viewerInterval = setInterval(() => {
            const change = Math.floor(Math.random() * 7) - 3;
            viewerCount = Math.max(10, Math.min(100, viewerCount + change));
            viewerElement.textContent = viewerCount;
        }, 5000);
    };
    
    // Initialize image zoom functionality
    const initializeImageZoom = () => {
        const img = cachedElements.productImage;
        const container = document.getElementById('image-zoom-container');
        const lens = document.getElementById('zoom-lens');
        const result = document.getElementById('zoom-result');
        
        if (!img || !container || !lens || !result || window.innerWidth < 768) return;
        
        let zoomRatio = 2;
        
        container.addEventListener('mouseenter', () => {
            lens.style.display = 'block';
            result.style.display = 'block';
            result.style.backgroundImage = `url('${img.src}')`;
            result.style.backgroundSize = `${img.width * zoomRatio}px ${img.height * zoomRatio}px`;
        });
        
        container.addEventListener('mouseleave', () => {
            lens.style.display = 'none';
            result.style.display = 'none';
        });
        
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;
            
            x = Math.max(lens.offsetWidth / 2, Math.min(x, rect.width - lens.offsetWidth / 2));
            y = Math.max(lens.offsetHeight / 2, Math.min(y, rect.height - lens.offsetHeight / 2));
            
            lens.style.left = (x - lens.offsetWidth / 2) + 'px';
            lens.style.top = (y - lens.offsetHeight / 2) + 'px';
            
            const bgPosX = -((x / rect.width) * img.width * zoomRatio - result.offsetWidth / 2);
            const bgPosY = -((y / rect.height) * img.height * zoomRatio - result.offsetHeight / 2);
            
            result.style.backgroundPosition = `${bgPosX}px ${bgPosY}px`;
        });
    };
    
    // Load product specifications
    const loadProductSpecifications = (product) => {
        const specsContainer = document.getElementById('specs-content');
        if (!specsContainer) return;
        
        const specs = generateSpecs(product);
        
        specsContainer.innerHTML = specs.map(spec => `
            <div class="spec-item">
                <div class="spec-label">${spec.label}</div>
                <div class="spec-value">${spec.value}</div>
            </div>
        `).join('');
    };
    
    // Generate product specifications
    const generateSpecs = (product) => {
        const specs = [
            { label: 'Category', value: product.category.charAt(0).toUpperCase() + product.category.slice(1) },
            { label: 'Availability', value: 'In Stock' },
            { label: 'Shipping', value: 'Free Delivery' },
            { label: 'Return Policy', value: '30 Days' }
        ];
        
        if (product.brand) {
            specs.unshift({ label: 'Brand', value: product.brand });
        }
        
        return specs;
    };
    
    // Load related products
    const loadRelatedProducts = (category, allProducts) => {
        const container = document.getElementById('related-products-grid');
        if (!container) return;
        
        // Get related products
        let relatedProducts = allProducts
            .filter(p => p.category === category && p.id !== currentProduct.id)
            .slice(0, 4);
        
        // If not enough, add random products
        if (relatedProducts.length < 4) {
            const remaining = allProducts
                .filter(p => p.id !== currentProduct.id && !relatedProducts.includes(p))
                .slice(0, 4 - relatedProducts.length);
            relatedProducts = [...relatedProducts, ...remaining];
        }
        
        // Display products
        container.innerHTML = relatedProducts.map(product => {
            const productUrl = createProductURL(product);
            return `
                <div class="related-product-card" onclick="window.location.href='${productUrl}'">
                    <img src="${product.image || 'images/placeholder.jpg'}" 
                         alt="${product.title}" 
                         class="related-product-image"
                         loading="lazy">
                    <div class="related-product-info">
                        <h3 class="related-product-title">${product.title}</h3>
                        <div class="related-product-price">${product.price}</div>
                    </div>
                </div>
            `;
        }).join('');
    };
    
    // Create product URL
    const createProductURL = (product) => {
        const titleSlug = product.title.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);
        return `product.html?id=${product.id}&title=${titleSlug}`;
    };
    
    // Redirect to Amazon with modal
    const redirectToAmazon = (affiliateLink) => {
        if (!affiliateLink || affiliateLink === 'undefined' || affiliateLink === '') {
            showToast('Product link not available. Please try another product.');
            return;
        }
        
        const modal = document.getElementById('redirect-modal');
        if (!modal) return;
        
        modal.style.display = 'flex';
        
        let countdown = 3;
        const countdownElement = document.getElementById('countdown-timer');
        const countdownText = document.getElementById('countdown-text');
        
        if (countdownElement) countdownElement.textContent = countdown;
        if (countdownText) countdownText.textContent = countdown;
        
        const countdownInterval = setInterval(() => {
            countdown--;
            
            if (countdownElement) countdownElement.textContent = countdown;
            if (countdownText) countdownText.textContent = countdown;
            
            if (countdown < 0) {
                clearInterval(countdownInterval);
                
                // Validate and open URL
                let finalUrl = affiliateLink;
                if (!finalUrl.startsWith('http')) {
                    finalUrl = 'https://' + finalUrl;
                }
                
                try {
                    const urlObj = new URL(finalUrl);
                    window.open(urlObj.href, '_blank', 'noopener,noreferrer');
                } catch (error) {
                    console.error('Invalid URL:', error);
                    showToast('Invalid product link.');
                }
                
                modal.style.display = 'none';
            }
        }, 1000);
        
        // Close on outside click
        const closeModal = (e) => {
            if (e.target === modal) {
                clearInterval(countdownInterval);
                modal.style.display = 'none';
                modal.removeEventListener('click', closeModal);
            }
        };
        
        modal.addEventListener('click', closeModal);
    };
    
    // Initialize sticky buy button
    const initializeStickyBuyButton = () => {
        if (window.innerWidth > 768) return;
        
        let lastScrollTop = 0;
        const stickyButton = cachedElements.stickyBuyMobile;
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const buyButtonRect = cachedElements.buyButton?.getBoundingClientRect();
            
            if (buyButtonRect && buyButtonRect.bottom < 0 && scrollTop > lastScrollTop) {
                stickyButton.style.display = 'block';
                setTimeout(() => stickyButton.classList.add('show'), 10);
            } else if (buyButtonRect && buyButtonRect.top > 0) {
                stickyButton.classList.remove('show');
                setTimeout(() => stickyButton.style.display = 'none', 300);
            }
            
            lastScrollTop = scrollTop;
        });
    };
    
    // Initialize event listeners
    const initializeEventListeners = () => {
        // Share button
        if (cachedElements.shareBtn) {
            cachedElements.shareBtn.addEventListener('click', openShareModal);
        }
        
        // Mobile menu toggle
        const menuToggle = document.getElementById('mobile-menu-toggle');
        const mobileNav = document.getElementById('mobile-nav');
        const closeBtn = document.querySelector('.mobile-nav-close');
        
        if (menuToggle && mobileNav) {
            menuToggle.addEventListener('click', () => {
                mobileNav.classList.toggle('active');
            });
        }
        
        if (closeBtn && mobileNav) {
            closeBtn.addEventListener('click', () => {
                mobileNav.classList.remove('active');
            });
        }
    };
    
    // Open share modal
    const openShareModal = () => {
        const modal = document.getElementById('share-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    };
    
    // Close share modal
    window.closeShareModal = () => {
        const modal = document.getElementById('share-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    };
    
    // Share on platform
    window.shareOn = (platform) => {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(currentProduct?.title || 'Amazing Deal');
        const text = encodeURIComponent(`Check out this amazing deal: ${currentProduct?.title}`);
        
        const shareUrls = {
            whatsapp: `https://wa.me/?text=${text}%20${url}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
            telegram: `https://t.me/share/url?url=${url}&text=${text}`,
            copy: 'copy'
        };
        
        if (platform === 'copy') {
            navigator.clipboard.writeText(window.location.href)
                .then(() => {
                    showToast('Link copied to clipboard!');
                    closeShareModal();
                })
                .catch(() => {
                    // Fallback
                    const textArea = document.createElement('textarea');
                    textArea.value = window.location.href;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    showToast('Link copied!');
                    closeShareModal();
                });
        } else if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
            closeShareModal();
        }
    };
    
    // UI state functions
    const showLoadingState = () => {
        if (cachedElements.productLoading) cachedElements.productLoading.style.display = 'block';
        if (cachedElements.productDetails) cachedElements.productDetails.style.display = 'none';
        if (cachedElements.productNotFound) cachedElements.productNotFound.style.display = 'none';
    };
    
    const hideLoadingState = () => {
        if (cachedElements.productLoading) cachedElements.productLoading.style.display = 'none';
    };
    
    const showProductNotFound = () => {
        if (cachedElements.productLoading) cachedElements.productLoading.style.display = 'none';
        if (cachedElements.productDetails) cachedElements.productDetails.style.display = 'none';
        if (cachedElements.productNotFound) cachedElements.productNotFound.style.display = 'block';
    };
    
    // Show toast notification
    const showToast = (message, duration = 3000) => {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #2874F0;
            color: white;
            padding: 14px 20px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease-out;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, duration);
    };
    
    // Cleanup timers
    const cleanupTimers = () => {
        if (productTimer) {
            clearInterval(productTimer);
            productTimer = null;
        }
        if (viewerInterval) {
            clearInterval(viewerInterval);
            viewerInterval = null;
        }
    };
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', cleanupTimers);
    
    // Public API
    return {
        init
    };
})();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ProductPage.init);
} else {
    ProductPage.init();
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
