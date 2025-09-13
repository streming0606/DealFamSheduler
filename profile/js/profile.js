// Profile Management System for Thrift Zone
class ThriftZoneProfile {
    constructor() {
        this.currentUser = null;
        this.profileData = {};
        this.init();
    }

    async init() {
        // Wait for auth to initialize
        setTimeout(() => {
            this.checkAuthAndLoadProfile();
            this.setupEventListeners();
        }, 500);
    }

    async checkAuthAndLoadProfile() {
        // Check if user is logged in
        if (window.thriftAuth && window.thriftAuth.isLoggedIn()) {
            this.currentUser = window.thriftAuth.getCurrentUser();
            await this.loadUserProfile();
            this.updateProfileDisplay();
        } else {
            // Check for demo user
            const demoUser = localStorage.getItem('demo_user');
            if (demoUser) {
                this.currentUser = JSON.parse(demoUser);
                await this.loadUserProfile();
                this.updateProfileDisplay();
            } else {
                // Redirect to login if not authenticated
                window.location.href = '../index.html';
            }
        }
    }

    async loadUserProfile() {
        try {
            // Try to load from Supabase first
            if (window.thriftAuth && window.thriftAuth.supabase && this.currentUser.id) {
                const { data, error } = await window.thriftAuth.supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', this.currentUser.id)
                    .single();

                if (data) {
                    this.profileData = data;
                } else {
                    // Create default profile
                    this.profileData = this.createDefaultProfile();
                }
            } else {
                // Load from localStorage for demo users
                const savedProfile = localStorage.getItem(`profile_${this.currentUser.id}`);
                this.profileData = savedProfile ? 
                    JSON.parse(savedProfile) : 
                    this.createDefaultProfile();
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            this.profileData = this.createDefaultProfile();
        }
    }

    createDefaultProfile() {
        const now = new Date();
        return {
            id: this.currentUser.id,
            full_name: this.currentUser.name || this.currentUser.email?.split('@')[0] || 'User',
            email: this.currentUser.email,
            phone: '',
            date_of_birth: '',
            gender: '',
            bio: '',
            address_line1: '',
            address_line2: '',
            city: '',
            state: '',
            pincode: '',
            avatar_url: this.currentUser.avatar_url || '',
            preferences: {
                categories: [],
                min_price: 0,
                max_price: 10000,
                email_notifications: true,
                push_notifications: false,
                sms_notifications: false
            },
            created_at: now.toISOString(),
            updated_at: now.toISOString()
        };
    }

    updateProfileDisplay() {
        // Update header profile info
        const displayName = this.profileData.full_name || 'User';
        const email = this.profileData.email || '';
        const joinDate = new Date(this.profileData.created_at).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long'
        });

        // Update profile header
        document.getElementById('profile-display-name').textContent = displayName;
        document.getElementById('profile-display-email').textContent = email;
        document.getElementById('profile-join-date').textContent = joinDate;

        // Update avatar
        const initial = displayName.charAt(0).toUpperCase();
        document.getElementById('profile-initial').textContent = initial;

        if (this.profileData.avatar_url) {
            document.getElementById('profile-avatar-img').src = this.profileData.avatar_url;
            document.getElementById('profile-avatar-img').style.display = 'block';
            document.getElementById('profile-initial').style.display = 'none';
        }

        // Update stats
        this.updateProfileStats();

        // Populate form fields
        this.populateFormFields();
    }

    updateProfileStats() {
        // Get wishlist count
        const wishlist = JSON.parse(localStorage.getItem('thriftzone_wishlist') || '[]');
        document.getElementById('total-wishlist').textContent = wishlist.length;

        // Mock data for orders and savings
        document.getElementById('total-orders').textContent = Math.floor(Math.random() * 20) + 5;
        document.getElementById('total-saved').textContent = `₹${(Math.floor(Math.random() * 50000) + 10000).toLocaleString('en-IN')}`;
    }

    populateFormFields() {
        // Personal Information
        document.getElementById('full-name').value = this.profileData.full_name || '';
        document.getElementById('phone-number').value = this.profileData.phone || '';
        document.getElementById('date-of-birth').value = this.profileData.date_of_birth || '';
        document.getElementById('gender').value = this.profileData.gender || '';
        document.getElementById('bio').value = this.profileData.bio || '';

        // Address Information
        document.getElementById('address-line1').value = this.profileData.address_line1 || '';
        document.getElementById('address-line2').value = this.profileData.address_line2 || '';
        document.getElementById('city').value = this.profileData.city || '';
        document.getElementById('state').value = this.profileData.state || '';
        document.getElementById('pincode').value = this.profileData.pincode || '';

        // Preferences
        if (this.profileData.preferences) {
            // Categories
            const categories = this.profileData.preferences.categories || [];
            document.querySelectorAll('input[name="categories"]').forEach(checkbox => {
                checkbox.checked = categories.includes(checkbox.value);
            });

            // Price range
            const minPrice = this.profileData.preferences.min_price || 0;
            const maxPrice = this.profileData.preferences.max_price || 10000;
            document.getElementById('min-price').value = minPrice;
            document.getElementById('max-price').value = maxPrice;
            document.getElementById('min-price-value').textContent = minPrice.toLocaleString('en-IN');
            document.getElementById('max-price-value').textContent = maxPrice.toLocaleString('en-IN');

            // Notifications
            document.getElementById('email-notifications').checked = this.profileData.preferences.email_notifications !== false;
            document.getElementById('push-notifications').checked = this.profileData.preferences.push_notifications === true;
            document.getElementById('sms-notifications').checked = this.profileData.preferences.sms_notifications === true;
        }
    }


    

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.profile-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Form submissions
        document.getElementById('personal-info-form')?.addEventListener('submit', (e) => this.handlePersonalInfoSubmit(e));
        document.getElementById('address-form')?.addEventListener('submit', (e) => this.handleAddressSubmit(e));
        document.getElementById('preferences-form')?.addEventListener('submit', (e) => this.handlePreferencesSubmit(e));
        document.getElementById('security-form')?.addEventListener('submit', (e) => this.handleSecuritySubmit(e));
        document.getElementById('notifications-form')?.addEventListener('submit', (e) => this.handleNotificationsSubmit(e));

        // Avatar upload
        document.getElementById('avatar-upload')?.addEventListener('change', (e) => this.handleAvatarUpload(e));

        // Price range sliders
        document.getElementById('min-price')?.addEventListener('input', (e) => {
            document.getElementById('min-price-value').textContent = parseInt(e.target.value).toLocaleString('en-IN');
        });
        document.getElementById('max-price')?.addEventListener('input', (e) => {
            document.getElementById('max-price-value').textContent = parseInt(e.target.value).toLocaleString('en-IN');
        });
    }

    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.profile-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.profile-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    async handlePersonalInfoSubmit(e) {
        e.preventDefault();
        
        const formData = {
            full_name: document.getElementById('full-name').value,
            phone: document.getElementById('phone-number').value,
            date_of_birth: document.getElementById('date-of-birth').value,
            gender: document.getElementById('gender').value,
            bio: document.getElementById('bio').value
        };

        await this.saveProfileData(formData);
        this.showNotification('Personal information updated successfully!', 'success');
    }

    async handleAddressSubmit(e) {
        e.preventDefault();
        
        const addressData = {
            address_line1: document.getElementById('address-line1').value,
            address_line2: document.getElementById('address-line2').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            pincode: document.getElementById('pincode').value
        };

        await this.saveProfileData(addressData);
        this.showNotification('Address information updated successfully!', 'success');
    }

    async handlePreferencesSubmit(e) {
        e.preventDefault();
        
        const categories = Array.from(document.querySelectorAll('input[name="categories"]:checked'))
            .map(cb => cb.value);
        
        const preferences = {
            categories: categories,
            min_price: parseInt(document.getElementById('min-price').value),
            max_price: parseInt(document.getElementById('max-price').value)
        };

        await this.saveProfileData({ preferences: { ...this.profileData.preferences, ...preferences } });
        this.showNotification('Shopping preferences updated successfully!', 'success');
    }

    async handleSecuritySubmit(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            this.showNotification('New passwords do not match', 'error');
            return;
        }

        if (newPassword.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        // Handle password update
        if (window.thriftAuth && window.thriftAuth.supabase) {
            try {
                const { error } = await window.thriftAuth.supabase.auth.updateUser({
                    password: newPassword
                });

                if (error) throw error;

                this.showNotification('Password updated successfully!', 'success');
                document.getElementById('security-form').reset();
            } catch (error) {
                this.showNotification('Failed to update password: ' + error.message, 'error');
            }
        } else {
            // Demo mode
            this.showNotification('Password updated successfully (Demo mode)!', 'success');
            document.getElementById('security-form').reset();
        }
    }

    async handleNotificationsSubmit(e) {
        e.preventDefault();
        
        const notificationPrefs = {
            email_notifications: document.getElementById('email-notifications').checked,
            push_notifications: document.getElementById('push-notifications').checked,
            sms_notifications: document.getElementById('sms-notifications').checked
        };

        await this.saveProfileData({ 
            preferences: { ...this.profileData.preferences, ...notificationPrefs } 
        });
        this.showNotification('Notification preferences updated successfully!', 'success');
    }

    async handleAvatarUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select an image file', 'error');
            return;
        }

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            this.showNotification('Image size must be less than 2MB', 'error');
            return;
        }

        try {
            // Create a preview
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('profile-avatar-img').src = e.target.result;
                document.getElementById('profile-avatar-img').style.display = 'block';
                document.getElementById('profile-initial').style.display = 'none';
            };
            reader.readAsDataURL(file);

            // In a real app, you would upload to Supabase Storage here
            // For demo, we'll save as base64 in localStorage
            const base64 = await this.fileToBase64(file);
            await this.saveProfileData({ avatar_url: base64 });
            
            this.showNotification('Profile picture updated successfully!', 'success');
        } catch (error) {
            this.showNotification('Failed to upload profile picture', 'error');
        }
    }

    async saveProfileData(updates) {
        try {
            // Update local profileData
            this.profileData = { ...this.profileData, ...updates, updated_at: new Date().toISOString() };

            if (window.thriftAuth && window.thriftAuth.supabase && this.currentUser.id) {
                // Save to Supabase
                const { error } = await window.thriftAuth.supabase
                    .from('profiles')
                    .upsert(this.profileData);

                if (error) throw error;
            } else {
                // Save to localStorage for demo users
                localStorage.setItem(`profile_${this.currentUser.id}`, JSON.stringify(this.profileData));
            }

            // Update display
            this.updateProfileDisplay();
        } catch (error) {
            console.error('Error saving profile:', error);
            throw error;
        }
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 2001;
            animation: slideInRight 0.3s ease;
            max-width: 350px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    getNotificationColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || colors.info;
    }
}

// Global functions
function triggerAvatarUpload() {
    document.getElementById('avatar-upload').click();
}

function deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        // Handle account deletion
        if (window.thriftAuth) {
            window.thriftAuth.handleLogout();
        }
        localStorage.clear();
        alert('Account deleted successfully');
        window.location.href = '../index.html';
    }
}

// Initialize profile system
document.addEventListener('DOMContentLoaded', () => {
    window.thriftProfile = new ThriftZoneProfile();
});
