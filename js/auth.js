// Thrift Zone Authentication System with Supabase
class ThriftZoneAuth {
    constructor() {
        // Replace with your actual Supabase credentials
        this.supabaseUrl = 'YOUR_SUPABASE_URL'; // e.g., 'https://xyz.supabase.co'
        this.supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // Your anon public key
        
        // Initialize Supabase (will be set after credentials are configured)
        this.supabase = null;
        this.currentUser = null;
        
        this.init();
    }

    init() {
        // Check if Supabase credentials are configured
        if (this.supabaseUrl === 'YOUR_SUPABASE_URL' || this.supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
            console.error('Please configure your Supabase credentials in js/auth.js');
            this.setupDemoMode();
            return;
        }

        // Initialize Supabase
        this.supabase = window.supabase.createClient(this.supabaseUrl, this.supabaseAnonKey);
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Check for existing session
        this.checkAuthState();
        
        // Listen for auth changes
        this.supabase.auth.onAuthStateChange((event, session) => {
            this.handleAuthStateChange(event, session);
        });
    }

    setupDemoMode() {
        console.log('🚀 Auth Demo Mode - Replace credentials in js/auth.js');
        this.setupEventListeners();
        
        // Show demo notification
        setTimeout(() => {
            this.showNotification('Demo Mode: Please configure Supabase credentials', 'warning');
        }, 2000);
    }

    setupEventListeners() {
        // Login/Signup button clicks
        document.getElementById('login-btn')?.addEventListener('click', () => this.showLoginModal());
        document.getElementById('signup-btn')?.addEventListener('click', () => this.showSignupModal());
        document.getElementById('mobile-login-btn')?.addEventListener('click', () => this.showLoginModal());
        document.getElementById('mobile-signup-btn')?.addEventListener('click', () => this.showSignupModal());

        // Modal close buttons
        document.getElementById('close-login-modal')?.addEventListener('click', () => this.hideAuthModal());
        document.getElementById('close-signup-modal')?.addEventListener('click', () => this.hideAuthModal());
        document.getElementById('auth-overlay')?.addEventListener('click', (e) => {
            if (e.target.id === 'auth-overlay') this.hideAuthModal();
        });

        // Switch between login/signup
        document.getElementById('show-signup')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSignupModal();
        });
        document.getElementById('show-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginModal();
        });

        // Form submissions
        document.getElementById('login-form')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('signup-form')?.addEventListener('submit', (e) => this.handleSignup(e));

        // Social login
        document.getElementById('google-login')?.addEventListener('click', () => this.handleGoogleLogin());
        document.getElementById('google-signup')?.addEventListener('click', () => this.handleGoogleLogin());

        // Logout buttons
        document.getElementById('logout-btn')?.addEventListener('click', () => this.handleLogout());
        document.getElementById('mobile-logout-btn')?.addEventListener('click', () => this.handleLogout());

        // Forgot password
        document.getElementById('forgot-password-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleForgotPassword();
        });

        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.hideAuthModal();
        });
    }

    async checkAuthState() {
        if (!this.supabase) {
            // Demo mode - simulate checking for saved user
            const savedUser = localStorage.getItem('demo_user');
            if (savedUser) {
                this.currentUser = JSON.parse(savedUser);
                this.updateUIForLoggedInUser(this.currentUser);
            }
            return;
        }

        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            if (session && session.user) {
                this.currentUser = session.user;
                this.updateUIForLoggedInUser(this.currentUser);
            }
        } catch (error) {
            console.error('Error checking auth state:', error);
        }
    }

    handleAuthStateChange(event, session) {
        if (event === 'SIGNED_IN' && session) {
            this.currentUser = session.user;
            this.updateUIForLoggedInUser(session.user);
            this.hideAuthModal();
            this.showNotification('Welcome back! Successfully signed in.', 'success');
        } else if (event === 'SIGNED_OUT') {
            this.currentUser = null;
            this.updateUIForLoggedOutUser();
            this.showNotification('Successfully signed out.', 'info');
        }
    }

    // Modal Management
    showLoginModal() {
        this.hideSignupModal();
        document.getElementById('auth-overlay').style.display = 'flex';
        document.getElementById('login-modal').style.display = 'block';
        document.getElementById('signup-modal').style.display = 'none';
        setTimeout(() => {
            document.getElementById('login-email')?.focus();
        }, 100);
    }

    showSignupModal() {
        this.hideLoginModal();
        document.getElementById('auth-overlay').style.display = 'flex';
        document.getElementById('login-modal').style.display = 'none';
        document.getElementById('signup-modal').style.display = 'block';
        setTimeout(() => {
            document.getElementById('signup-name')?.focus();
        }, 100);
    }

    hideAuthModal() {
        document.getElementById('auth-overlay').style.display = 'none';
        this.resetForms();
    }

    hideLoginModal() {
        document.getElementById('login-modal').style.display = 'none';
    }

    hideSignupModal() {
        document.getElementById('signup-modal').style.display = 'none';
    }

    resetForms() {
        document.getElementById('login-form')?.reset();
        document.getElementById('signup-form')?.reset();
        this.hideLoadingStates();
    }

    // Authentication Handlers
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        if (!email || !password) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        this.showLoadingState('login');

        if (!this.supabase) {
            // Demo mode
            setTimeout(() => {
                const demoUser = {
                    id: 'demo-user-id',
                    email: email,
                    name: email.split('@')[0],
                    avatar_url: null
                };
                localStorage.setItem('demo_user', JSON.stringify(demoUser));
                this.currentUser = demoUser;
                this.updateUIForLoggedInUser(demoUser);
                this.hideAuthModal();
                this.showNotification('Demo login successful!', 'success');
                this.hideLoadingState('login');
            }, 1500);
            return;
        }

        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            // Success is handled by onAuthStateChange
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification(error.message || 'Login failed', 'error');
        } finally {
            this.hideLoadingState('login');
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const agreeTerms = document.getElementById('agree-terms').checked;
        
        if (!name || !email || !password || !confirmPassword) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        if (!agreeTerms) {
            this.showNotification('Please agree to the terms and conditions', 'error');
            return;
        }

        this.showLoadingState('signup');

        if (!this.supabase) {
            // Demo mode
            setTimeout(() => {
                const demoUser = {
                    id: 'demo-user-id',
                    email: email,
                    name: name,
                    avatar_url: null
                };
                localStorage.setItem('demo_user', JSON.stringify(demoUser));
                this.currentUser = demoUser;
                this.updateUIForLoggedInUser(demoUser);
                this.hideAuthModal();
                this.showNotification('Demo account created successfully!', 'success');
                this.hideLoadingState('signup');
            }, 2000);
            return;
        }

        try {
            const { data, error } = await this.supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: name,
                        display_name: name
                    }
                }
            });

            if (error) throw error;

            if (data.user && !data.user.email_confirmed_at) {
                this.showNotification('Please check your email to confirm your account', 'info');
            } else {
                this.showNotification('Account created successfully!', 'success');
            }
        } catch (error) {
            console.error('Signup error:', error);
            this.showNotification(error.message || 'Signup failed', 'error');
        } finally {
            this.hideLoadingState('signup');
        }
    }

    async handleGoogleLogin() {
        if (!this.supabase) {
            this.showNotification('Google login not available in demo mode', 'warning');
            return;
        }

        try {
            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });

            if (error) throw error;
        } catch (error) {
            console.error('Google login error:', error);
            this.showNotification('Google login failed', 'error');
        }
    }

    async handleLogout() {
        if (!this.supabase) {
            // Demo mode
            localStorage.removeItem('demo_user');
            this.currentUser = null;
            this.updateUIForLoggedOutUser();
            this.showNotification('Demo logout successful', 'info');
            return;
        }

        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error('Logout error:', error);
            this.showNotification('Logout failed', 'error');
        }
    }

    async handleForgotPassword() {
        const email = document.getElementById('login-email').value;
        
        if (!email) {
            this.showNotification('Please enter your email address first', 'error');
            return;
        }

        if (!this.supabase) {
            this.showNotification('Password reset not available in demo mode', 'warning');
            return;
        }

        try {
            const { error } = await this.supabase.auth.resetPasswordForEmail(email);
            if (error) throw error;
            
            this.showNotification('Password reset email sent! Check your inbox.', 'success');
        } catch (error) {
            console.error('Password reset error:', error);
            this.showNotification('Failed to send reset email', 'error');
        }
    }

    // UI Updates
    updateUIForLoggedInUser(user) {
        // Hide auth buttons
        document.getElementById('auth-buttons').style.display = 'none';
        document.getElementById('mobile-auth-buttons').style.display = 'none';
        
        // Show user profile
        document.getElementById('user-profile').style.display = 'block';
        document.getElementById('mobile-user-info').style.display = 'block';
        document.getElementById('mobile-user-actions').style.display = 'block';
        
        // Update user info
        const displayName = user.user_metadata?.full_name || user.user_metadata?.display_name || user.email?.split('@')[0] || 'User';
        const email = user.email;
        const avatarUrl = user.user_metadata?.avatar_url;
        
        // Desktop user info
        document.getElementById('user-name').textContent = displayName;
        document.getElementById('user-email').textContent = email;
        
        // Mobile user info
        document.getElementById('mobile-user-name').textContent = displayName;
        document.getElementById('mobile-user-email').textContent = email;
        
        // Avatar
        const userInitial = displayName.charAt(0).toUpperCase();
        document.getElementById('user-initial').textContent = userInitial;
        document.getElementById('mobile-user-avatar').textContent = userInitial;
        
        if (avatarUrl) {
            document.getElementById('user-avatar-img').src = avatarUrl;
            document.getElementById('user-avatar-img').style.display = 'block';
            document.getElementById('user-initial').style.display = 'none';
        } else {
            document.getElementById('user-avatar-img').style.display = 'none';
            document.getElementById('user-initial').style.display = 'block';
        }
    }

    updateUIForLoggedOutUser() {
        // Show auth buttons
        document.getElementById('auth-buttons').style.display = 'flex';
        document.getElementById('mobile-auth-buttons').style.display = 'flex';
        
        // Hide user profile
        document.getElementById('user-profile').style.display = 'none';
        document.getElementById('mobile-user-info').style.display = 'none';
        document.getElementById('mobile-user-actions').style.display = 'none';
    }

    // Loading States
    showLoadingState(type) {
        const button = document.getElementById(`${type}-submit`);
        const spinner = document.getElementById(`${type}-spinner`);
        const btnText = button.querySelector('.btn-text');
        
        button.disabled = true;
        spinner.style.display = 'inline-block';
        btnText.style.display = 'none';
    }

    hideLoadingState(type) {
        const button = document.getElementById(`${type}-submit`);
        const spinner = document.getElementById(`${type}-spinner`);
        const btnText = button.querySelector('.btn-text');
        
        button.disabled = false;
        spinner.style.display = 'none';
        btnText.style.display = 'inline';
    }

    hideLoadingStates() {
        this.hideLoadingState('login');
        this.hideLoadingState('signup');
    }

    // Notifications
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
            font-size: 0.9rem;
            line-height: 1.4;
        `;
        
        const icon = this.getNotificationIcon(type);
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="${icon}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, type === 'error' ? 5000 : 4000);
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

    getNotificationIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    // Public methods for other parts of the app
    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return !!this.currentUser;
    }

    async getCurrentSession() {
        if (!this.supabase) return null;
        
        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            return session;
        } catch (error) {
            console.error('Error getting session:', error);
            return null;
        }
    }
}

// Animation styles
const authAnimationStyles = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;

// Add animation styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = authAnimationStyles;
document.head.appendChild(styleSheet);

// Initialize authentication system
let thriftAuth;
document.addEventListener('DOMContentLoaded', () => {
    thriftAuth = new ThriftZoneAuth();
    
    // Make auth available globally
    window.thriftAuth = thriftAuth;
});

// Export for use in other files
window.ThriftZoneAuth = ThriftZoneAuth;
