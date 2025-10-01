// MEGA LOOT COUPONS DATA - 50 Top Indian E-commerce Deals
const MEGA_LOOT_COUPONS = [
    // Amazon India - Electronics & More
    { id: "amazon-1", store: "amazon", storeName: "Amazon India", code: "DIWALIBLAST1000", expires: "2025-11-02", usedBy: 15432, category: "electronics", affiliateUrl: "https://amzn.to/your-amazon-tag", megaLoot: true, flashSale: true, trending: true },
    { id: "amazon-2", store: "amazon", storeName: "Amazon India", code: "MEGASAVEMAX", expires: "2025-11-20", usedBy: 4322, category: "electronics", affiliateUrl: "https://amzn.to/your-amazon-tag", megaLoot: true },
    { id: "amazon-3", store: "amazon", storeName: "Amazon India", code: "PRIMELOOT250", expires: "2025-10-25", usedBy: 8934, category: "home", affiliateUrl: "https://amzn.to/your-amazon-tag", trending: true, hotDeal: true },

    // Flipkart - MEGA DEALS
    { id: "flipkart-1", store: "flipkart", storeName: "Flipkart", code: "BLACKFRIDAY500", expires: "2025-11-29", usedBy: 12876, category: "fashion", affiliateUrl: "https://fkrt.it/your-flipkart-tag", megaLoot: true, hotDeal: true, trending: true },
    { id: "flipkart-2", store: "flipkart", storeName: "Flipkart", code: "BIGLOOT500", expires: "2025-11-10", usedBy: 7823, category: "electronics", affiliateUrl: "https://fkrt.it/your-flipkart-tag", megaLoot: true, trending: true },
    { id: "flipkart-3", store: "flipkart", storeName: "Flipkart", code: "SUPERSALEMAX", expires: "2025-10-28", usedBy: 5439, category: "fashion", affiliateUrl: "https://fkrt.it/your-flipkart-tag", flashSale: true, hotDeal: true },

    // Myntra - Fashion LOOT
    { id: "myntra-1", store: "myntra", storeName: "Myntra", code: "STYLELOOT400", expires: "2025-11-05", usedBy: 6847, category: "fashion", affiliateUrl: "https://www.myntra.com/?src=your-myntra-tag", megaLoot: true, trending: true },
    { id: "myntra-2", store: "myntra", storeName: "Myntra", code: "FASHIONSALE60", expires: "2025-10-30", usedBy: 4295, category: "beauty", affiliateUrl: "https://www.myntra.com/?src=your-myntra-tag", hotDeal: true },

    // Nykaa - Beauty LOOT
    { id: "nykaa-1", store: "nykaa", storeName: "Nykaa", code: "GLOWSALE250", expires: "2025-10-28", usedBy: 4262, category: "beauty", affiliateUrl: "https://www.nykaa.com/?src=your-nykaa-tag", flashSale: true, hotDeal: true, trending: true },
    { id: "nykaa-2", store: "nykaa", storeName: "Nykaa", code: "GLOWDEAL300", expires: "2025-11-18", usedBy: 7586, category: "beauty", affiliateUrl: "https://www.nykaa.com/?src=your-nykaa-tag", hotDeal: true, trending: true },

    // Add more sample coupons for demonstration
    { id: "swiggy-1", store: "swiggy", storeName: "Swiggy", code: "FOODLOOT200", expires: "2025-10-26", usedBy: 8923, category: "food", affiliateUrl: "https://www.swiggy.com/?src=your-swiggy-tag", trending: true, hotDeal: true },
    { id: "paytm-1", store: "paytmmall", storeName: "Paytm Mall", code: "PAYTMLOOTFLASH", expires: "2025-10-25", usedBy: 9948, category: "electronics", affiliateUrl: "https://paytmmall.com/?src=your-paytm-tag", flashSale: true, hotDeal: true, limitedTime: true },
];

// JavaScript functionality
const PAGE_SIZE = 12;
let filtered = [...MEGA_LOOT_COUPONS];
let rendered = 0;
let activeStore = "all";
let activeCategory = "all"; 
let searchQuery = "";

const els = {};
let countdownInterval = null;
let currentAffiliate = null;

document.addEventListener("DOMContentLoaded", () => {
    cacheElements();
    bindFilters();
    bindSearch();
    renderFeatured();
    applyFilters();
    bindLoadMore();
    bindModal();
    updateHeroStats();
});

function cacheElements() {
    els.grid = document.getElementById("coupon-grid");
    els.featured = document.getElementById("featured-coupons-grid");
    els.count = document.getElementById("coupon-count");
    els.statActive = document.getElementById("stat-active");
    els.loadMore = document.getElementById("load-more-coupons");
    // Modal elements
    els.modalOverlay = document.getElementById("coupon-modal");
    els.modalClose = document.getElementById("modal-close");
    els.modalCode = document.getElementById("modal-coupon-code");
    els.modalExpiry = document.getElementById("modal-expiry");
    els.modalUsers = document.getElementById("modal-users");
    els.copyBtn = document.getElementById("copy-btn");
    els.copySuccess = document.getElementById("copy-success");
    els.countdown = document.getElementById("countdown-timer");
    els.applyBtn = document.getElementById("apply-coupon-btn");
    els.modalStore = document.getElementById("modal-store");
}

function bindFilters() {
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activeStore = btn.dataset.store || "all";
            applyFilters();
        });
    });
    
    document.querySelectorAll(".category-filter").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".category-filter").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activeCategory = btn.dataset.category || "all";
            applyFilters();
        });
    });
}

function bindSearch() {
    const input = document.getElementById("coupon-search");
    if (!input) return;
    input.addEventListener("input", (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        applyFilters();
    });
}

function applyFilters() {
    filtered = MEGA_LOOT_COUPONS.filter(c =>
        (activeStore === "all" || c.store === activeStore) &&
        (activeCategory === "all" || c.category === activeCategory) &&
        (
            !searchQuery ||
            c.code.toLowerCase().includes(searchQuery) ||
            c.storeName.toLowerCase().includes(searchQuery) ||
            c.category.toLowerCase().includes(searchQuery)
        )
    );
    
    // Sort by most attractive first
    filtered.sort((a, b) => {
        const aScore = (a.megaLoot ? 4 : 0) + (a.flashSale ? 3 : 0) + (a.hotDeal ? 2 : 0) + (a.trending ? 1 : 0);
        const bScore = (b.megaLoot ? 4 : 0) + (b.flashSale ? 3 : 0) + (b.hotDeal ? 2 : 0) + (b.trending ? 1 : 0);
        return bScore - aScore;
    });
    
    rendered = 0;
    els.grid.innerHTML = "";
    renderMore();
    updateCounts();
}

function renderFeatured() {
    // Show top LOOT deals (mega loot + trending)
    const featured = MEGA_LOOT_COUPONS
        .filter(c => c.megaLoot || c.flashSale || c.hotDeal)
        .sort((a, b) => b.usedBy - a.usedBy)
        .slice(0, 6);
        
    els.featured.innerHTML = featured.map(c => couponCardHTML(c, true)).join("");
    featured.forEach(c => bindCardInteractions(c.id));
}

function bindLoadMore() {
    els.loadMore.addEventListener("click", renderMore);
}

function renderMore() {
    const next = filtered.slice(rendered, rendered + PAGE_SIZE);
    const html = next.map(c => couponCardHTML(c, false)).join("");
    els.grid.insertAdjacentHTML("beforeend", html);
    next.forEach(c => bindCardInteractions(c.id));
    rendered += next.length;
    els.loadMore.style.display = rendered < filtered.length ? "inline-flex" : "none";
}

function couponCardHTML(coupon, featured = false) {
    const badges = [];
    if (coupon.megaLoot) badges.push('<span class="badge mega-loot">💰 MEGA LOOT</span>');
    if (coupon.flashSale) badges.push('<span class="badge flash-sale">⚡ FLASH SALE</span>');
    if (coupon.hotDeal) badges.push('<span class="badge hot-deal">🔥 HOT DEAL</span>');
    if (coupon.trending) badges.push('<span class="badge trending">📈 TRENDING</span>');
    if (coupon.limitedTime) badges.push('<span class="badge limited">⏰ LIMITED</span>');
    
    const badgeHTML = badges.slice(0, 2).join('');
    
    // Store icon with brand color
    const storeColors = {
        amazon: '#FF9900',
        flipkart: '#2874F0', 
        myntra: '#FF3F6C',
        nykaa: '#FC2779',
        swiggy: '#FC8019',
        paytmmall: '#00BAF2'
    };
    
    const storeColor = storeColors[coupon.store] || '#333';
    const storeInitial = coupon.storeName.charAt(0);
    
    return `
        <div class="coupon-card" id="card-${coupon.id}">
            <div class="badge-container">${badgeHTML}</div>
            <div class="store-row">
                <div class="store-logo" style="background: ${storeColor}; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; width: 40px; height: 40px; border-radius: 8px;">${storeInitial}</div>
                <div class="store-name">${coupon.storeName}</div>
            </div>
            <div class="code-pill ${coupon.megaLoot ? 'mega-code' : ''}">
                <i class="fas fa-ticket"></i> 
                <span class="code-text">${coupon.code}</span>
            </div>
            <div class="coupon-stats">
                <div class="expiry"><i class="fas fa-clock"></i> ${formatDate(coupon.expires)}</div>
                <div class="used"><i class="fas fa-users"></i> ${coupon.usedBy.toLocaleString()} used</div>
            </div>
            <div class="actions">
                <button class="btn copy-btn" data-id="${coupon.id}">
                    <i class="fas fa-copy"></i> Copy
                </button>
                <button class="btn apply-btn ${coupon.megaLoot ? 'mega-apply' : ''}" data-id="${coupon.id}">
                    <i class="fas fa-bolt"></i> ${coupon.megaLoot ? 'GRAB LOOT' : 'Apply Now'}
                </button>
            </div>
        </div>
    `;
}

function bindCardInteractions(id) {
    const card = document.getElementById(`card-${id}`);
    if (!card) return;
    
    const coupon = MEGA_LOOT_COUPONS.find(c => c.id === id);
    const copyBtn = card.querySelector(".copy-btn");
    const applyBtn = card.querySelector(".apply-btn");

    copyBtn.addEventListener("click", () => openModal(coupon, { autoCopy: true }));
    applyBtn.addEventListener("click", () => openModal(coupon, { autoCopy: true, autoOpen: true }));
}

function openModal(coupon, opts = { autoCopy: true, autoOpen: false }) {
    document.body.style.overflow = "hidden";
    els.modalOverlay.classList.add("active");
    
    // Update modal content
    const storeColors = {
        amazon: '#FF9900',
        flipkart: '#2874F0', 
        myntra: '#FF3F6C',
        nykaa: '#FC2779',
        swiggy: '#FC8019',
        paytmmall: '#00BAF2'
    };
    
    const storeColor = storeColors[coupon.store] || '#333';
    const storeInitial = coupon.storeName.charAt(0);
    
    els.modalStore.querySelector(".store-logo").style.background = storeColor;
    els.modalStore.querySelector(".store-logo").textContent = storeInitial;
    els.modalStore.querySelector(".store-name").textContent = coupon.storeName;
    els.modalCode.textContent = coupon.code;
    els.modalExpiry.textContent = formatDate(coupon.expires);
    els.modalUsers.textContent = coupon.usedBy.toLocaleString();
    currentAffiliate = coupon.affiliateUrl;

    // Update modal title
    const title = document.querySelector(".modal-title");
    if (coupon.megaLoot) {
        title.textContent = "💰 MEGA LOOT ACTIVATED!";
    } else if (coupon.flashSale) {
        title.textContent = "⚡ FLASH SALE CODE!";
    } else if (coupon.hotDeal) {
        title.textContent = "🔥 HOT DEAL UNLOCKED!";
    } else {
        title.textContent = "🎉 Coupon Ready!";
    }

    // Start countdown
    startCountdown(new Date(coupon.expires + "T23:59:59"));

    // Auto copy
    if (opts.autoCopy) doCopy(coupon.code);

    // Auto open
    if (opts.autoOpen) {
        setTimeout(() => {
            window.open(currentAffiliate, "_blank", "noopener,noreferrer");
        }, 500);
    }
}

function closeModal() {
    els.modalOverlay.classList.remove("active");
    document.body.style.overflow = "";
    stopCountdown();
    els.copySuccess.style.display = "none";
}

function bindModal() {
    els.modalClose.addEventListener("click", closeModal);
    els.modalOverlay.addEventListener("click", (e) => {
        if (e.target === els.modalOverlay) closeModal();
    });
    
    els.copyBtn.addEventListener("click", () => doCopy(els.modalCode.textContent));
    els.applyBtn.addEventListener("click", () => {
        if (currentAffiliate) {
            window.open(currentAffiliate, "_blank", "noopener,noreferrer");
        }
    });
}

function doCopy(text) {
    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(() => showCopySuccess());
    } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand("copy");
            showCopySuccess();
        } catch (err) {
            console.error("Copy failed:", err);
        }
        document.body.removeChild(textarea);
    }
}

function showCopySuccess() {
    els.copySuccess.style.display = "block";
    setTimeout(() => {
        els.copySuccess.style.display = "none";
    }, 2000);
}

function startCountdown(expiryDate) {
    stopCountdown();
    
    function updateCountdown() {
        const now = new Date();
        const diff = expiryDate - now;
        
        if (diff <= 0) {
            els.countdown.textContent = "EXPIRED";
            stopCountdown();
            return;
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        els.countdown.textContent = `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
    }
    
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

function stopCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short", 
        year: "numeric"
    });
}

function updateCounts() {
    els.count.textContent = filtered.length.toString();
}

function updateHeroStats() {
    const totalActive = MEGA_LOOT_COUPONS.length;
    const megaLootCount = MEGA_LOOT_COUPONS.filter(c => c.megaLoot).length;
    const flashSaleCount = MEGA_LOOT_COUPONS.filter(c => c.flashSale).length;
    
    if (els.statActive) els.statActive.textContent = totalActive.toString();
    
    // Update other stats
    document.getElementById("stat-mega").textContent = `${megaLootCount} MEGA`;
    document.getElementById("stat-flash").textContent = `${flashSaleCount} FLASH`;
}

// Mobile menu toggle
document.getElementById("mobile-menu-toggle")?.addEventListener("click", () => {
    document.getElementById("mobile-nav").classList.toggle("active");
});
