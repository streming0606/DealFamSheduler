/* ========================================
   THRIFTMAAL COUPON PAGE JAVASCRIPT
   Full Functionality & Interactions
   ======================================== */

// ========================================
// COUPON DATA
// ========================================
const couponData = {
    amazon: [
        {
            id: 'amz-1',
            title: 'Great Indian Festival: Up To 80% Off + Extra 10%',
            description: 'Get additional 10% instant discount on HDFC cards. Lowest prices of the year!',
            code: 'FESTIVAL80',
            type: 'code',
            discount: '80% OFF',
            badge: 'hot',
            usedCount: 324,
            expiry: 'Oct 31, 2025',
            link: 'https://amazon.in',
            featured: true
        },
        {
            id: 'amz-2',
            title: 'PC & Gaming Accessories: Up To 80% Off',
            description: 'Shop gaming keyboards, mouse, headsets, and more at unbeatable prices.',
            code: 'GAMING80',
            type: 'code',
            discount: '80% OFF',
            badge: 'trending',
            usedCount: 3003,
            expiry: 'Nov 15, 2025',
            link: 'https://amazon.in',
            featured: false
        },
        {
            id: 'amz-3',
            title: 'Smartphones: Up To 50% Off + Bank Discounts',
            description: 'Latest smartphones from Samsung, OnePlus, Xiaomi & more with exchange offers.',
            code: null,
            type: 'deal',
            discount: '50% OFF',
            badge: 'limited',
            usedCount: 1725,
            expiry: 'Dec 07, 2025',
            link: 'https://amazon.in',
            featured: false
        }
    ],
    flipkart: [
        {
            id: 'flp-1',
            title: 'Big Billion Days: Upto 90% Off on Everything',
            description: 'Biggest sale of the year! Extra discounts on credit cards + exchange offers.',
            code: 'BIGBILLION',
            type: 'code',
            discount: '90% OFF',
            badge: 'hot',
            usedCount: 5421,
            expiry: 'Oct 25, 2025',
            link: 'https://flipkart.com',
            featured: true
        },
        {
            id: 'flp-2',
            title: 'Fashion: Min 50% Off + Extra 10% on ₹2999+',
            description: 'Shop from top brands like Nike, Puma, Levi\'s & more with additional discounts.',
            code: 'FASHION10',
            type: 'code',
            discount: '60% OFF',
            badge: 'new',
            usedCount: 2156,
            expiry: 'Nov 30, 2025',
            link: 'https://flipkart.com',
            featured: false
        },
        {
            id: 'flp-3',
            title: 'Electronics: Flat ₹5000 Off on Orders Above ₹50,000',
            description: 'Buy TVs, laptops, cameras, and appliances with huge discounts.',
            code: 'ELECT5000',
            type: 'code',
            discount: '₹5000 OFF',
            badge: null,
            usedCount: 892,
            expiry: 'Dec 15, 2025',
            link: 'https://flipkart.com',
            featured: false
        }
    ],
    myntra: [
        {
            id: 'myn-1',
            title: 'End of Season Sale: Up To 70% Off + Extra 20%',
            description: 'Shop from 5000+ brands with additional discounts on fashion & lifestyle.',
            code: 'EOSS20',
            type: 'code',
            discount: '70% OFF',
            badge: 'hot',
            usedCount: 4267,
            expiry: 'Oct 28, 2025',
            link: 'https://myntra.com',
            featured: true
        },
        {
            id: 'myn-2',
            title: 'First Order: Flat ₹300 Off on Orders Above ₹1999',
            description: 'New users get instant discount on first purchase. Limited period offer!',
            code: 'FIRST300',
            type: 'code',
            discount: '₹300 OFF',
            badge: null,
            usedCount: 1543,
            expiry: 'Dec 31, 2025',
            link: 'https://myntra.com',
            featured: false
        }
    ],
    nykaa: [
        {
            id: 'nyk-1',
            title: 'Beauty Bonanza: Up To 60% Off + Free Gifts',
            description: 'Shop makeup, skincare, haircare & more from top brands with free shipping.',
            code: 'BEAUTY60',
            type: 'code',
            discount: '60% OFF',
            badge: 'hot',
            usedCount: 3421,
            expiry: 'Nov 10, 2025',
            link: 'https://nykaa.com',
            featured: true
        },
        {
            id: 'nyk-2',
            title: 'Luxury Brands: Extra 20% Off on Orders Above ₹2500',
            description: 'Get exclusive discounts on premium international beauty brands.',
            code: 'LUXURY20',
            type: 'code',
            discount: '20% OFF',
            badge: null,
            usedCount: 987,
            expiry: 'Nov 20, 2025',
            link: 'https://nykaa.com',
            featured: false
        }
    ],
    ajio: [
        {
            id: 'aji-1',
            title: 'Fashion Week: Flat 70% Off on Entire Fashion Range',
            description: 'Shop western wear, ethnic wear, footwear & accessories at lowest prices.',
            code: 'AJIO70',
            type: 'code',
            discount: '70% OFF',
            badge: 'trending',
            usedCount: 2567,
            expiry: 'Oct 30, 2025',
            link: 'https://ajio.com',
            featured: true
        },
        {
            id: 'aji-2',
            title: 'Bank Offer: Extra 10% Off with ICICI Cards',
            description: 'Get instant discount on orders above ₹1990 with ICICI credit cards.',
            code: 'ICICI10',
            type: 'code',
            discount: '10% OFF',
            badge: null,
            usedCount: 1234,
            expiry: 'Nov 05, 2025',
            link: 'https://ajio.com',
            featured: false
        }
    ],
    swiggy: [
        {
            id: 'swg-1',
            title: 'Flat 60% Off on First 3 Orders for New Users',
            description: 'Order food from your favorite restaurants with massive discounts.',
            code: 'SWIGGY60',
            type: 'code',
            discount: '60% OFF',
            badge: 'hot',
            usedCount: 8934,
            expiry: 'Dec 31, 2025',
            link: 'https://swiggy.com',
            featured: true
        },
        {
            id: 'swg-2',
            title: 'Free Delivery on Orders Above ₹199',
            description: 'Save on delivery charges with this exclusive code. Valid on all restaurants.',
            code: 'FREEDEL',
            type: 'code',
            discount: 'FREE DELIVERY',
            badge: null,
            usedCount: 5621,
            expiry: 'Nov 30, 2025',
            link: 'https://swiggy.com',
            featured: false
        }
    ]
};

// Store information
const storeInfo = {
    amazon: {
        name: 'Amazon India',
        logo: 'images/stores/amazon.png',
        url: 'https://amazon.in'
    },
    flipkart: {
        name: 'Flipkart',
        logo: 'images/stores/flipkart.png',
        url: 'https://flipkart.com'
    },
    myntra: {
        name: 'Myntra',
        logo: 'images/stores/myntra.png',
        url: 'https://myntra.com'
    },
    nykaa: {
        name: 'Nykaa',
        logo: 'images/stores/nykaa.png',
        url: 'https://nykaa.com'
    },
    ajio: {
        name: 'AJIO',
        logo: 'images/stores/ajio.png',
        url: 'https://ajio.com'
    },
    swiggy: {
        name: 'Swiggy',
        logo: 'images/stores/swiggy.png',
        url: 'https://swiggy.com'
    }
};

// ========================================
// DOM ELEMENTS
// ========================================
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
const mobileNavClose = document.querySelector('.mobile-nav-close');
const searchInput = document.getElementById('search-input');
const couponModal = document.getElementById('coupon-modal');
const modalClose = document.getElementById('modal-close');
const modalCodeText = document.getElementById('modal-code-text');
const modalStoreName = document.getElementById('modal-store-name');
const modalStoreLogo = document.getElementById('modal-store-logo');
const modalUsers = document.getElementById('modal-users');
const modalExpiry = document.getElementById('modal-expiry');
const modalShopBtn = document.getElementById('modal-shop-btn');
const copyAgainBtn = document.getElementById('copy-again-btn');

// ========================================
// MOBILE MENU FUNCTIONALITY
// ========================================
if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        mobileNav.classList.add('active');
        mobileNav.setAttribute('aria-hidden', 'false');
        mobileMenuToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    });
}

if (mobileNavClose) {
    mobileNavClose.addEventListener('click', closeMobileNav);
}

function closeMobileNav() {
    mobileNav.classList.remove('active');
    mobileNav.setAttribute('aria-hidden', 'true');
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

// Close mobile nav on click outside
mobileNav?.addEventListener('click', (e) => {
    if (e.target === mobileNav) {
        closeMobileNav();
    }
});

// Close mobile nav on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav?.classList.contains('active')) {
        closeMobileNav();
    }
});

// ========================================
// SEARCH FUNCTIONALITY
// ========================================
let searchTimeout;

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.toLowerCase().trim();
        
        searchTimeout = setTimeout(() => {
            if (query.length > 0) {
                searchCoupons(query);
            } else {
                // Reset to show all coupons
                resetCouponDisplay();
            }
        }, 300);
    });
}

function searchCoupons(query) {
    const allCouponCards = document.querySelectorAll('.coupon-card');
    const allStoreBlocks = document.querySelectorAll('.store-block');
    let foundResults = false;

    allStoreBlocks.forEach(block => {
        const couponsInStore = block.querySelectorAll('.coupon-card');
        let storeHasResults = false;

        couponsInStore.forEach(card => {
            const title = card.querySelector('.coupon-title')?.textContent.toLowerCase() || '';
            const desc = card.querySelector('.coupon-desc')?.textContent.toLowerCase() || '';
            const code = card.querySelector('.coupon-code')?.textContent.toLowerCase() || '';

            if (title.includes(query) || desc.includes(query) || code.includes(query)) {
                card.style.display = 'block';
                storeHasResults = true;
                foundResults = true;
            } else {
                card.style.display = 'none';
            }
        });

        // Hide store block if no results found
        block.style.display = storeHasResults ? 'block' : 'none';
    });

    // Show no results message if needed
    handleNoResults(foundResults);
}

function resetCouponDisplay() {
    const allCouponCards = document.querySelectorAll('.coupon-card');
    const allStoreBlocks = document.querySelectorAll('.store-block');
    
    allCouponCards.forEach(card => card.style.display = 'block');
    allStoreBlocks.forEach(block => block.style.display = 'block');
    
    // Remove no results message if exists
    const noResultsMsg = document.querySelector('.no-results-message');
    if (noResultsMsg) {
        noResultsMsg.remove();
    }
}

function handleNoResults(foundResults) {
    const existingMsg = document.querySelector('.no-results-message');
    
    if (!foundResults) {
        if (!existingMsg) {
            const storesSection = document.querySelector('.stores-section .container');
            const noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'no-results-message';
            noResultsDiv.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; background: white; border-radius: 16px; margin: 20px 0;">
                    <i class="fas fa-search" style="font-size: 4rem; color: #FF6B35; margin-bottom: 20px;"></i>
                    <h3 style="font-size: 1.5rem; margin-bottom: 12px;">No coupons found</h3>
                    <p style="color: #666;">Try searching with different keywords or browse all coupons below.</p>
                </div>
            `;
            storesSection.prepend(noResultsDiv);
        }
    } else {
        if (existingMsg) {
            existingMsg.remove();
        }
    }
}

// ========================================
// COPY TO CLIPBOARD FUNCTIONALITY
// ========================================
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            textArea.remove();
            return Promise.resolve();
        } catch (err) {
            textArea.remove();
            return Promise.reject(err);
        }
    }
}

// ========================================
// COUPON MODAL FUNCTIONALITY
// ========================================
let currentCouponData = null;

function openCouponModal(couponCode, store, usedCount, expiry, link) {
    currentCouponData = { couponCode, store, link };
    
    // Copy to clipboard
    copyToClipboard(couponCode)
        .then(() => {
            // Update modal content
            modalCodeText.textContent = couponCode;
            modalStoreName.textContent = storeInfo[store].name;
            modalStoreLogo.src = storeInfo[store].logo;
            modalStoreLogo.alt = storeInfo[store].name + ' Logo';
            modalUsers.textContent = usedCount;
            modalExpiry.textContent = expiry;
            
            // Show modal
            couponModal.classList.add('active');
            couponModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            
            // Focus on close button for accessibility
            setTimeout(() => modalClose?.focus(), 100);
            
            // Track event (for analytics)
            trackCouponClick(store, couponCode);
        })
        .catch(err => {
            console.error('Failed to copy:', err);
            alert('Failed to copy code. Please try again.');
        });
}

function closeCouponModal() {
    couponModal.classList.remove('active');
    couponModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    currentCouponData = null;
}

// Modal close events
if (modalClose) {
    modalClose.addEventListener('click', closeCouponModal);
}

couponModal?.addEventListener('click', (e) => {
    if (e.target === couponModal) {
        closeCouponModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && couponModal?.classList.contains('active')) {
        closeCouponModal();
    }
});

// Copy again button
if (copyAgainBtn) {
    copyAgainBtn.addEventListener('click', () => {
        if (currentCouponData) {
            copyToClipboard(currentCouponData.couponCode)
                .then(() => {
                    // Show feedback
                    copyAgainBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    setTimeout(() => {
                        copyAgainBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Again';
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy:', err);
                    alert('Failed to copy code. Please try again.');
                });
        }
    });
}

// Shop now button
if (modalShopBtn) {
    modalShopBtn.addEventListener('click', () => {
        if (currentCouponData) {
            window.open(currentCouponData.link, '_blank', 'noopener,noreferrer');
            closeCouponModal();
        }
    });
}

// ========================================
// GET CODE BUTTON FUNCTIONALITY
// ========================================
function attachCouponButtonListeners() {
    // Get Code buttons
    const getCodeButtons = document.querySelectorAll('.get-code-btn');
    
    getCodeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const code = this.getAttribute('data-code');
            const store = this.getAttribute('data-store');
            
            // Find parent coupon card to get details
            const couponCard = this.closest('.coupon-card');
            const usedCountEl = couponCard.querySelector('.stat strong');
            const expiryEl = couponCard.querySelectorAll('.stat strong')[1];
            
            const usedCount = usedCountEl ? usedCountEl.textContent : '0';
            const expiry = expiryEl ? expiryEl.textContent : 'Limited Time';
            
            // Get store link
            const link = storeInfo[store]?.url || '#';
            
            // Open modal
            openCouponModal(code, store, usedCount, expiry, link);
        });
    });

    // Get Deal buttons (no code, direct link)
    const getDealButtons = document.querySelectorAll('.get-deal-btn');
    
    getDealButtons.forEach(button => {
        button.addEventListener('click', function() {
            const store = this.getAttribute('data-store');
            const link = storeInfo[store]?.url || '#';
            
            // Track event
            trackCouponClick(store, 'NO_CODE_DEAL');
            
            // Open store in new tab
            window.open(link, '_blank', 'noopener,noreferrer');
        });
    });
}

// ========================================
// FAQ ACCORDION FUNCTIONALITY
// ========================================
function initFAQAccordion() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.closest('.faq-item');
            const isActive = faqItem.classList.contains('active');
            
            // Close all other FAQs
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
                item.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });
            
            // Toggle current FAQ
            if (!isActive) {
                faqItem.classList.add('active');
                this.setAttribute('aria-expanded', 'true');
            } else {
                faqItem.classList.remove('active');
                this.setAttribute('aria-expanded', 'false');
            }
        });
    });
}

// ========================================
// SHOW MORE FUNCTIONALITY
// ========================================
function initShowMoreButtons() {
    const showMoreButtons = document.querySelectorAll('.show-more-btn');
    
    showMoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            const store = this.getAttribute('data-store');
            
            // In a real implementation, you would load more coupons from API
            // For now, we'll just show a message
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading more deals...';
            
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-check"></i> All deals loaded!';
                this.disabled = true;
                this.style.opacity = '0.5';
                this.style.cursor = 'not-allowed';
            }, 1000);
        });
    });
}

// ========================================
// HERO CTA BUTTON
// ========================================
function initHeroCTA() {
    const heroCTA = document.querySelector('.hero-cta');
    
    if (heroCTA) {
        heroCTA.addEventListener('click', () => {
            const storesSection = document.querySelector('.stores-section');
            if (storesSection) {
                storesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
}

// ========================================
// TRACKING & ANALYTICS
// ========================================
function trackCouponClick(store, couponCode) {
    // Analytics tracking
    console.log(`Coupon clicked: ${store} - ${couponCode}`);
    
    // Google Analytics example (uncomment if you have GA)
    // if (typeof gtag !== 'undefined') {
    //     gtag('event', 'coupon_click', {
    //         'store': store,
    //         'coupon_code': couponCode
    //     });
    // }
    
    // Facebook Pixel example (uncomment if you have FB Pixel)
    // if (typeof fbq !== 'undefined') {
    //     fbq('track', 'ViewContent', {
    //         content_name: `${store} - ${couponCode}`,
    //         content_category: 'Coupon'
    //     });
    // }
}

// ========================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#main-content') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ========================================
// CATEGORY LINKS ACTIVE STATE
// ========================================
function initCategoryLinks() {
    const categoryLinks = document.querySelectorAll('.category-link');
    
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Remove active class from all
            categoryLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked
            this.classList.add('active');
        });
    });
}

// ========================================
// LAZY LOAD IMAGES
// ========================================
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// ========================================
// SCROLL TO TOP BUTTON
// ========================================
function initScrollToTop() {
    // Create scroll to top button
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollBtn.setAttribute('aria-label', 'Scroll to top');
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #FF6B35, #FF8C42);
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 1.2rem;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 99;
        box-shadow: 0 4px 16px rgba(255, 107, 53, 0.3);
    `;
    
    document.body.appendChild(scrollBtn);
    
    // Show/hide button on scroll
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollBtn.style.opacity = '1';
            scrollBtn.style.visibility = 'visible';
        } else {
            scrollBtn.style.opacity = '0';
            scrollBtn.style.visibility = 'hidden';
        }
    });
    
    // Scroll to top on click
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ========================================
// COUNTDOWN TIMER (for urgent deals)
// ========================================
function startCountdownTimer(element, endDate) {
    const timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = endDate - now;
        
        if (distance < 0) {
            clearInterval(timer);
            element.textContent = 'Expired';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        element.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }, 1000);
}

// ========================================
// LOCAL STORAGE - SAVE USER PREFERENCES
// ========================================
function saveUserPreference(key, value) {
    try {
        localStorage.setItem(`thriftmaal_${key}`, JSON.stringify(value));
    } catch (e) {
        console.error('Failed to save preference:', e);
    }
}

function getUserPreference(key) {
    try {
        const value = localStorage.getItem(`thriftmaal_${key}`);
        return value ? JSON.parse(value) : null;
    } catch (e) {
        console.error('Failed to get preference:', e);
        return null;
    }
}

// Track recently viewed coupons
function trackRecentlyViewed(couponId, store) {
    let recent = getUserPreference('recent_coupons') || [];
    
    // Remove if already exists
    recent = recent.filter(item => item.id !== couponId);
    
    // Add to beginning
    recent.unshift({ id: couponId, store, timestamp: Date.now() });
    
    // Keep only last 10
    recent = recent.slice(0, 10);
    
    saveUserPreference('recent_coupons', recent);
}

// ========================================
// NOTIFICATION SYSTEM
// ========================================
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#4CAF50' : '#FF6B35'};
        color: white;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        z-index: 1001;
        animation: slideIn 0.3s ease;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
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
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('ThriftMaal Coupon Page Loaded');
    
    // Initialize all features
    attachCouponButtonListeners();
    initFAQAccordion();
    initShowMoreButtons();
    initHeroCTA();
    initSmoothScroll();
    initCategoryLinks();
    initLazyLoading();
    initScrollToTop();
    
    // Show welcome notification (optional)
    setTimeout(() => {
        showNotification('🎉 Welcome to ThriftMaal! Find the best deals today!', 'success');
    }, 1000);
});

// ========================================
// PAGE VISIBILITY - Pause animations when tab inactive
// ========================================
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause any animations or timers
        console.log('Page hidden');
    } else {
        // Resume animations
        console.log('Page visible');
    }
});

// ========================================
// ONLINE/OFFLINE DETECTION
// ========================================
window.addEventListener('online', () => {
    showNotification('✅ You are back online!', 'success');
});

window.addEventListener('offline', () => {
    showNotification('⚠️ You are offline. Some features may not work.', 'error');
});

// ========================================
// PERFORMANCE MONITORING
// ========================================
if ('performance' in window && 'PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            console.log('Performance:', entry.name, entry.duration);
        }
    });
    
    observer.observe({ entryTypes: ['navigation', 'resource'] });
}

// ========================================
// EXPORT FOR USE IN OTHER MODULES
// ========================================
window.ThriftMaalCoupons = {
    openCouponModal,
    closeCouponModal,
    showNotification,
    trackCouponClick,
    couponData,
    storeInfo
};

console.log('✅ ThriftMaal Coupon Page JavaScript Loaded Successfully!');
