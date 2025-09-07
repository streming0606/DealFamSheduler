// Theme Management for Thrift Zone
class ThriftZoneTheme {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.currentTheme = localStorage.getItem('thriftzone_theme') || 'light';
        this.init();
    }
    
    init() {
        // Set initial theme
        this.applyTheme(this.currentTheme);
        
        // Setup theme toggle
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
        
        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem('thriftzone_theme')) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        
        // Add switching animation
        if (this.themeToggle) {
            this.themeToggle.classList.add('switching');
            setTimeout(() => {
                this.themeToggle.classList.remove('switching');
            }, 600);
        }
        
        // Show theme change notification
        this.showThemeNotification(newTheme);
    }
    
    applyTheme(theme) {
        this.currentTheme = theme;
        
        // Apply to document
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update toggle icon
        if (this.themeToggle) {
            const icon = this.themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            }
            this.themeToggle.title = `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`;
        }
        
        // Store preference
        localStorage.setItem('thriftzone_theme', theme);
        
        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(theme);
        
        // Trigger custom event for other components
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }
    
    updateMetaThemeColor(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.setAttribute('name', 'theme-color');
            document.head.appendChild(metaThemeColor);
        }
        
        const color = theme === 'light' ? '#ffffff' : '#1a202c';
        metaThemeColor.setAttribute('content', color);
    }
    
    showThemeNotification(theme) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: var(--surface);
            color: var(--text-primary);
            border: 1px solid var(--border);
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 1002;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: slideInRight 0.3s ease;
        `;
        
        const icon = theme === 'light' ? '☀️' : '🌙';
        const message = theme === 'light' ? 'Light mode enabled' : 'Dark mode enabled';
        
        notification.innerHTML = `
            <span style="font-size: 1.2rem;">${icon}</span>
            <span style="font-weight: 500;">${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
    
    getTheme() {
        return this.currentTheme;
    }
    
    // Method to detect system preference
    getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }
}

// Initialize theme management
function initializeTheme() {
    window.thriftTheme = new ThriftZoneTheme();
}

// Export for use in main script
window.initializeTheme = initializeTheme;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTheme);
} else {
    initializeTheme();
}
