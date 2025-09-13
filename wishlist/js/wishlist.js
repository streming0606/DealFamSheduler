// Thrift Zone Wishlist System
class ThriftZoneWishlist {
    constructor() {
        this.wishlist = [];
        this.viewMode = 'grid'; // or 'list'
        this.filterCategory = 'all';
        this.sortBy = 'date-desc'; // date-desc, date-asc, price-asc, price-desc

        this.init();
    }

    init() {
        this.loadWishlist();
        this.setupEventListeners();
        this.renderWishlist();
        this.updateSummary();
    }

    loadWishlist() {
        // Load wishlist from localStorage
        const savedWishlist = localStorage.getItem('thriftzone_wishlist');
        if (savedWishlist) {
            this.wishlist = JSON.parse(savedWishlist);
        } else {
            this.wishlist = [];
        }
    }

    saveWishlist() {
        localStorage.setItem('thriftzone_wishlist', JSON.stringify(this.wishlist));
    }

    setupEventListeners() {
        // Category filter change
        document.getElementById('category-filter')?.addEventListener('change', (e) => {
            this.filterCategory = e.target.value;
            this.renderWishlist();
        });

        // Sort change
        document.getElementById('sort-filter')?.addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.renderWishlist();
        });

        // View buttons
        document.getElementById('grid-view-btn')?.addEventListener('click', () => this.setView('grid'));
        document.getElementById('list-view-btn')?.addEventListener('click', () => this.setView('list'));

        // Clear all
        document.getElementById('clear-all-btn')?.addEventListener('click', () => this.clearAllWishlist());

        // Share wishlist
        document.getElementById('share-wishlist-btn')?.addEventListener('click', () => this.shareWishlist());
    }

    setView(view) {
        this.viewMode = view;
        document.getElementById('grid-view-btn').classList.toggle('active', view === 'grid');
        document.getElementById('list-view-btn').classList.toggle('active', view === 'list');
        this.renderWishlist();
    }

    getFilteredWishlist() {
        if (this.filterCategory === 'all') return this.wishlist;
        return this.wishlist.filter(item => item.category === this.filterCategory);
    }

    getSortedWishlist(filtered) {
        const sorted = [...filtered];
        switch (this.sortBy) {
            case 'date-asc':
                return sorted.sort((a, b) => new Date(a.added_at) - new Date(b.added_at));
            case 'price-asc':
                return sorted.sort((a, b) => a.salePrice - b.salePrice);
            case 'price-desc':
                return sorted.sort((a, b) => b.salePrice - a.salePrice);
            case 'date-desc':
            default:
                return sorted.sort((a, b) => new Date(b.added_at) - new Date(a.added_at));
        }
    }

    renderWishlist() {
        const container = document.getElementById('wishlist-items');
        const emptyState = document.getElementById('wishlist-empty');
        const summary = document.getElementById('wishlist-summary');
        const filtered = this.getFilteredWishlist();
        const sorted = this.getSortedWishlist(filtered);

        if (!container) return;

        if (sorted.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
            summary.style.display = 'none';
            return;
        }

        emptyState.style.display = 'none';
        container.style.display = 'grid';
        container.className = `wishlist-items ${this.viewMode}`;
        summary.style.display = 'block';

        container.innerHTML = '';

        sorted.forEach(item => {
            const card = this.createWishCard(item);
            container.appendChild(card);
        });

        this.updateSummary();
    }

    createWishCard(item) {
        const card = document.createElement('div');
        card.className = 'wishlist-card';

        card.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div class="wishlist-content-info">
                <div class="wishlist-product-title" title="${item.title}">${item.title}</div>
                <div>
                    <span class="wishlist-product-price">₹${item.salePrice.toLocaleString('en-IN')}</span>
                    <span class="wishlist-product-original-price">₹${item.originalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div class="wishlist-product-savings">
                    You Save ₹${(item.originalPrice - item.salePrice).toLocaleString('en-IN')}
                </div>
                <div class="wishlist-actions-pad">
                    <button class="wishlist-addcart-btn" title="Add to Cart" onclick="addToCartFromWishlist('${item.id}')">
                        <i class="fas fa-shopping-cart"></i>
                        Add to Cart
                    </button>
                    <button class="wishlist-remove-btn" title="Remove" onclick="removeFromWishlist('${item.id}')">
                        <i class="fas fa-trash"></i>
                        Remove
                    </button>
                </div>
            </div>
        `;
        return card;
    }

    updateSummary() {
        const summaryItems = document.getElementById('summary-items');
        const summaryValue = document.getElementById('summary-value');
        const summarySavings = document.getElementById('summary-savings');

        const filtered = this.getFilteredWishlist();
        const totalItems = filtered.length;
        const totalValue = filtered.reduce((sum, item) => sum + item.salePrice, 0);
        const totalSavings = filtered.reduce((sum, item) => sum + (item.originalPrice - item.salePrice), 0);

        if (summaryItems) summaryItems.textContent = totalItems;
        if (summaryValue) summaryValue.textContent = `₹${totalValue.toLocaleString('en-IN')}`;
        if (summarySavings) summarySavings.textContent = `₹${totalSavings.toLocaleString('en-IN')}`;

        const wishlistCount = document.getElementById('wishlist-count');
        if (wishlistCount) wishlistCount.textContent = totalItems;
    }

    clearAllWishlist() {
        if (confirm('Are you sure you want to clear your entire wishlist?')) {
            this.wishlist = [];
            this.renderWishlist();
            this.saveWishlist();
        }
    }

    shareWishlist() {
        if (this.wishlist.length === 0) {
            alert('Your wishlist is empty');
            return;
        }

        const listItems = this.wishlist.map(item => `- ${item.title} (₹${item.salePrice.toLocaleString('en-IN')})`).join('\n');

        const message = `My Wishlist on Thrift Zone:\n${listItems}\nCheck out amazing deals at https://yourdomain.com`;

        if (navigator.share) {
            navigator.share({
                title: 'My Wishlist - Thrift Zone',
                text: message,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(message).then(() => {
                alert('Wishlist copied to clipboard!');
            });
        }
    }
}

// Global functions to interact with wishlist buttons in cards
function removeFromWishlist(id) {
    if (window.thriftWishlist) {
        window.thriftWishlist.wishlist = window.thriftWishlist.wishlist.filter(item => item.id !== id);
        window.thriftWishlist.saveWishlist();
        window.thriftWishlist.renderWishlist();
    }
}

function addToCartFromWishlist(id) {
    alert('Add to cart functionality is coming soon! Product ID: ' + id);
}

// Initialize wishlist system
document.addEventListener('DOMContentLoaded', () => {
    window.thriftWishlist = new ThriftZoneWishlist();
});
