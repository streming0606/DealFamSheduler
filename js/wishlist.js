// Wishlist Management System with Supabase
class WishlistManager {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.wishlists = [];
    this.currentWishlist = null;
    this.wishlistItems = new Map();
  }

  // Initialize wishlist system
  async initialize() {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        console.log('User not authenticated');
        return false;
      }

      await this.loadWishlists();
      
      // Create default wishlist if none exists
      if (this.wishlists.length === 0) {
        await this.createWishlist('My Wishlist');
      } else {
        this.currentWishlist = this.wishlists[0];
      }

      return true;
    } catch (error) {
      console.error('Error initializing wishlist:', error);
      return false;
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  // Check if user is authenticated
  async isAuthenticated() {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  // Load all wishlists for current user
  async loadWishlists() {
    try {
      const { data, error } = await this.supabase
        .from('wishlists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      this.wishlists = data || [];
      
      // Load items for each wishlist
      for (const wishlist of this.wishlists) {
        await this.loadWishlistItems(wishlist.id);
      }

      return this.wishlists;
    } catch (error) {
      console.error('Error loading wishlists:', error);
      return [];
    }
  }

  // Load items for a specific wishlist
  async loadWishlistItems(wishlistId) {
    try {
      const { data, error } = await this.supabase
        .from('wishlist_items')
        .select('*')
        .eq('wishlist_id', wishlistId)
        .order('added_at', { ascending: false });

      if (error) throw error;

      this.wishlistItems.set(wishlistId, data || []);
      return data;
    } catch (error) {
      console.error('Error loading wishlist items:', error);
      return [];
    }
  }

  // Create new wishlist
  async createWishlist(name = 'My Wishlist') {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        this.showToast('Please login to create a wishlist', 'error');
        return null;
      }

      const { data, error } = await this.supabase
        .from('wishlists')
        .insert([{ name, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      this.wishlists.unshift(data);
      this.wishlistItems.set(data.id, []);
      
      if (!this.currentWishlist) {
        this.currentWishlist = data;
      }

      this.showToast('Wishlist created successfully', 'success');
      return data;
    } catch (error) {
      console.error('Error creating wishlist:', error);
      this.showToast('Failed to create wishlist', 'error');
      return null;
    }
  }

  // Add product to wishlist
  async addToWishlist(product, wishlistId = null) {
    try {
      // Check authentication
      const isAuth = await this.isAuthenticated();
      if (!isAuth) {
        this.showLoginPrompt();
        return false;
      }

      // Use current wishlist if not specified
      const targetWishlistId = wishlistId || this.currentWishlist?.id;
      
      if (!targetWishlistId) {
        // Create default wishlist if none exists
        const newWishlist = await this.createWishlist('My Wishlist');
        if (!newWishlist) return false;
        this.currentWishlist = newWishlist;
      }

      // Check if product already in wishlist
      const items = this.wishlistItems.get(targetWishlistId || this.currentWishlist.id) || [];
      const exists = items.some(item => item.product_id === product.id);

      if (exists) {
        this.showToast('Product already in wishlist', 'info');
        return false;
      }

      // Insert item
      const { data, error } = await this.supabase
        .from('wishlist_items')
        .insert([{
          wishlist_id: targetWishlistId || this.currentWishlist.id,
          product_id: product.id,
          product_data: {
            title: product.title,
            price: product.price,
            originalPrice: product.originalPrice,
            image: product.image,
            rating: product.rating,
            category: product.category,
            discount: product.discount,
            link: product.link
          }
        }])
        .select()
        .single();

      if (error) throw error;

      // Update local cache
      const wishlistId = targetWishlistId || this.currentWishlist.id;
      const currentItems = this.wishlistItems.get(wishlistId) || [];
      currentItems.unshift(data);
      this.wishlistItems.set(wishlistId, currentItems);

      this.showToast('Added to wishlist ❤️', 'success');
      this.updateWishlistUI();
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      this.showToast('Failed to add to wishlist', 'error');
      return false;
    }
  }

  // Remove product from wishlist
  async removeFromWishlist(productId, wishlistId = null) {
    try {
      const targetWishlistId = wishlistId || this.currentWishlist?.id;
      
      if (!targetWishlistId) return false;

      // Find the item
      const items = this.wishlistItems.get(targetWishlistId) || [];
      const item = items.find(i => i.product_id === productId);

      if (!item) return false;

      // Delete from database
      const { error } = await this.supabase
        .from('wishlist_items')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      // Update local cache
      const updatedItems = items.filter(i => i.product_id !== productId);
      this.wishlistItems.set(targetWishlistId, updatedItems);

      this.showToast('Removed from wishlist', 'success');
      this.updateWishlistUI();
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      this.showToast('Failed to remove from wishlist', 'error');
      return false;
    }
  }

  // Toggle product in wishlist
  async toggleWishlist(product) {
    const isInWishlist = this.isInWishlist(product.id);
    
    if (isInWishlist) {
      return await this.removeFromWishlist(product.id);
    } else {
      return await this.addToWishlist(product);
    }
  }

  // Check if product is in any wishlist
  isInWishlist(productId) {
    for (const [_, items] of this.wishlistItems) {
      if (items.some(item => item.product_id === productId)) {
        return true;
      }
    }
    return false;
  }

  // Get all wishlist items
  getAllWishlistItems() {
    const allItems = [];
    for (const [wishlistId, items] of this.wishlistItems) {
      const wishlist = this.wishlists.find(w => w.id === wishlistId);
      items.forEach(item => {
        allItems.push({
          ...item,
          wishlistName: wishlist?.name || 'Unknown'
        });
      });
    }
    return allItems;
  }

  // Get items for specific wishlist
  getWishlistItems(wishlistId) {
    return this.wishlistItems.get(wishlistId) || [];
  }

  // Delete entire wishlist
  async deleteWishlist(wishlistId) {
    try {
      const { error } = await this.supabase
        .from('wishlists')
        .delete()
        .eq('id', wishlistId);

      if (error) throw error;

      // Update local cache
      this.wishlists = this.wishlists.filter(w => w.id !== wishlistId);
      this.wishlistItems.delete(wishlistId);

      // Update current wishlist if deleted
      if (this.currentWishlist?.id === wishlistId) {
        this.currentWishlist = this.wishlists[0] || null;
      }

      this.showToast('Wishlist deleted', 'success');
      return true;
    } catch (error) {
      console.error('Error deleting wishlist:', error);
      this.showToast('Failed to delete wishlist', 'error');
      return false;
    }
  }

  // Rename wishlist
  async renameWishlist(wishlistId, newName) {
    try {
      const { error } = await this.supabase
        .from('wishlists')
        .update({ name: newName, updated_at: new Date().toISOString() })
        .eq('id', wishlistId);

      if (error) throw error;

      // Update local cache
      const wishlist = this.wishlists.find(w => w.id === wishlistId);
      if (wishlist) {
        wishlist.name = newName;
      }

      this.showToast('Wishlist renamed', 'success');
      return true;
    } catch (error) {
      console.error('Error renaming wishlist:', error);
      this.showToast('Failed to rename wishlist', 'error');
      return false;
    }
  }

  // Generate shareable link for wishlist
  async generateShareLink(wishlistId) {
    // This would require additional table and logic for public sharing
    // For now, return a placeholder
    const baseUrl = window.location.origin;
    return `${baseUrl}/wishlist/shared/${wishlistId}`;
  }

  // Show login prompt
  showLoginPrompt() {
    const modal = document.createElement('div');
    modal.className = 'wishlist-login-modal';
    modal.innerHTML = `
      <div class="wishlist-login-modal-content">
        <div class="wishlist-login-icon">
          <i class="fas fa-heart"></i>
        </div>
        <h3>Login Required</h3>
        <p>Please login to add products to your wishlist</p>
        <div class="wishlist-login-buttons">
          <button class="btn-primary" onclick="window.location.href='/login.html'">Login</button>
          <button class="btn-secondary" onclick="this.closest('.wishlist-login-modal').remove()">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  // Show toast notification
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `wishlist-toast wishlist-toast-${type}`;
    toast.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Update UI elements
  updateWishlistUI() {
    // Update heart icons on product cards
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
      const productId = btn.dataset.productId;
      const isInWishlist = this.isInWishlist(productId);
      
      if (isInWishlist) {
        btn.classList.add('active');
        btn.querySelector('i').classList.remove('far');
        btn.querySelector('i').classList.add('fas');
      } else {
        btn.classList.remove('active');
        btn.querySelector('i').classList.remove('fas');
        btn.querySelector('i').classList.add('far');
      }
    });
  }
}

// Export for use in other files
window.WishlistManager = WishlistManager;
