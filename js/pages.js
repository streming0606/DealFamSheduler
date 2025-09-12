// Thrift Zone Pages JavaScript
class ThriftZonePages {
    constructor() {
        this.init();
    }

    init() {
        this.setupContactForm();
        this.setupFAQ();
        this.setupLegalNavigation();
        this.setupSearch();
    }

    setupContactForm() {
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactSubmission(contactForm);
            });
        }
    }

    handleContactSubmission(form) {
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        // Simulate form submission
        setTimeout(() => {
            // Show success message
            this.showNotification('Message sent successfully! We\'ll get back to you within 24 hours.', 'success');
            
            // Reset form
            form.reset();
            
            // Reset button
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
            
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 3000);
        }, 2000);
    }

    setupFAQ() {
        // FAQ category filters
        const categoryBtns = document.querySelectorAll('.faq-category');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterFAQ(btn.dataset.category);
                
                // Update active state
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // FAQ accordion
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            if (question) {
                question.addEventListener('click', () => {
                    this.toggleFAQItem(item);
                });
            }
        });

        // FAQ search
        const faqSearch = document.getElementById('faq-search');
        if (faqSearch) {
            faqSearch.addEventListener('input', (e) => {
                this.searchFAQ(e.target.value);
            });
        }
    }

    filterFAQ(category) {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            if (category === 'all' || item.dataset.category === category) {
                item.style.display = 'block';
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, 100);
            } else {
                item.style.display = 'none';
            }
        });
    }

    toggleFAQItem(item) {
        const isActive = item.classList.contains('active');
        
        // Close all other items
        document.querySelectorAll('.faq-item.active').forEach(activeItem => {
            if (activeItem !== item) {
                activeItem.classList.remove('active');
            }
        });
        
        // Toggle current item
        if (isActive) {
            item.classList.remove('active');
        } else {
            item.classList.add('active');
        }
    }

    searchFAQ(query) {
        const faqItems = document.querySelectorAll('.faq-item');
        const searchTerm = query.toLowerCase();
        
        if (searchTerm.length === 0) {
            // Show all items
            faqItems.forEach(item => {
                item.style.display = 'block';
            });
            return;
        }
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question h3').textContent.toLowerCase();
            const answer = item.querySelector('.faq-answer p').textContent.toLowerCase();
            
            if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                item.style.display = 'block';
                // Highlight search terms
                this.highlightSearchTerm(item, searchTerm);
            } else {
                item.style.display = 'none';
            }
        });
    }

    highlightSearchTerm(item, term) {
        const question = item.querySelector('.faq-question h3');
        const answer = item.querySelector('.faq-answer p');
        
        [question, answer].forEach(element => {
            const text = element.textContent;
            const regex = new RegExp(`(${term})`, 'gi');
            element.innerHTML = text.replace(regex, '<mark style="background: #fff3cd; padding: 1px 2px; border-radius: 2px;">$1</mark>');
        });
    }

    setupLegalNavigation() {
        const navLinks = document.querySelectorAll('.legal-nav-list a');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update active state
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            });
        });

        // Highlight current section on scroll
        window.addEventListener('scroll', () => {
            this.updateLegalNavigation(navLinks);
        });
    }

    updateLegalNavigation(navLinks) {
        const sections = document.querySelectorAll('.legal-section[id]');
        const headerHeight = document.querySelector('.header').offsetHeight;
        const scrollPosition = window.scrollY + headerHeight + 100;
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.id;
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    setupSearch() {
        const searchInputs = document.querySelectorAll('#search-input, #faq-search');
        
        searchInputs.forEach(input => {
            // Add search functionality specific to each page
            if (input.id === 'search-input' && window.location.pathname.includes('pages/')) {
                input.placeholder = 'Search pages...';
                // Could implement page-specific search here
            }
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2563eb'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 1002;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            font-weight: 500;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
}

// Initialize pages functionality
document.addEventListener('DOMContentLoaded', () => {
    window.thriftPages = new ThriftZonePages();
});

// Smooth scroll for all internal links
document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});
