// ============================================
// LEGAL PAGES - INTERACTIVE FUNCTIONALITY
// JavaScript for TOS & Privacy Policy Pages
// ============================================

(function() {
  'use strict';
  
  // ============================================
  // INITIALIZATION
  // ============================================
  
  document.addEventListener('DOMContentLoaded', function() {
    initSmoothScrolling();
    initActiveSection();
    initBackButton();
    initTableOfContents();
    initScrollToTop();
    initPrintFunctionality();
    initAccessibility();
  });
  
  // ============================================
  // SMOOTH SCROLLING
  // ============================================
  
  function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        // Skip empty hash links
        if (href === '#' || href === '#!') {
          e.preventDefault();
          return;
        }
        
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          e.preventDefault();
          
          const offset = 100; // Offset for sticky elements
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          // Update URL hash without jumping
          if (history.pushState) {
            history.pushState(null, null, href);
          }
          
          // Focus the target for accessibility
          targetElement.setAttribute('tabindex', '-1');
          targetElement.focus();
          
          // Add visual feedback
          highlightSection(targetElement);
        }
      });
    });
  }
  
  // ============================================
  // HIGHLIGHT SECTION ON NAVIGATION
  // ============================================
  
  function highlightSection(element) {
    // Remove any existing highlights
    const highlighted = document.querySelectorAll('.section-highlight');
    highlighted.forEach(el => el.classList.remove('section-highlight'));
    
    // Add highlight class
    element.classList.add('section-highlight');
    
    // Remove highlight after animation
    setTimeout(() => {
      element.classList.remove('section-highlight');
    }, 2000);
  }
  
  // Add CSS for highlight animation if not already present
  if (!document.getElementById('highlight-style')) {
    const style = document.createElement('style');
    style.id = 'highlight-style';
    style.textContent = `
      .section-highlight {
        animation: sectionPulse 2s ease;
      }
      
      @keyframes sectionPulse {
        0%, 100% {
          box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
        }
        50% {
          box-shadow: 0 0 0 10px rgba(99, 102, 241, 0.3);
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // ============================================
  // ACTIVE SECTION TRACKING
  // ============================================
  
  function initActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const tocLinks = document.querySelectorAll('.toc a');
    
    if (sections.length === 0 || tocLinks.length === 0) return;
    
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          
          // Update TOC links
          tocLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, observerOptions);
    
    sections.forEach(section => observer.observe(section));
  }
  
  // Add CSS for active TOC link
  if (!document.getElementById('toc-active-style')) {
    const style = document.createElement('style');
    style.id = 'toc-active-style';
    style.textContent = `
      .toc a.active {
        background: rgba(99, 102, 241, 0.15);
        border-left-color: #6366f1;
        color: #ffffff;
        font-weight: 600;
      }
    `;
    document.head.appendChild(style);
  }
  
  // ============================================
  // BACK BUTTON FUNCTIONALITY
  // ============================================
  
  function initBackButton() {
    const backButton = document.querySelector('.back-button');
    
    if (backButton) {
      backButton.addEventListener('click', goBack);
    }
  }
  
  // ============================================
  // TABLE OF CONTENTS COLLAPSE (Mobile)
  // ============================================
  
  function initTableOfContents() {
    const toc = document.querySelector('.toc');
    
    if (!toc) return;
    
    // Make TOC collapsible on mobile
    if (window.innerWidth <= 768) {
      const tocHeader = toc.querySelector('h3');
      
      if (tocHeader) {
        tocHeader.style.cursor = 'pointer';
        tocHeader.style.userSelect = 'none';
        
        // Add toggle icon
        const toggleIcon = document.createElement('span');
        toggleIcon.className = 'toc-toggle';
        toggleIcon.innerHTML = '▼';
        toggleIcon.style.marginLeft = 'auto';
        toggleIcon.style.transition = 'transform 0.3s ease';
        tocHeader.style.display = 'flex';
        tocHeader.style.justifyContent = 'space-between';
        tocHeader.appendChild(toggleIcon);
        
        const tocContent = toc.querySelector('ul');
        
        tocHeader.addEventListener('click', function() {
          const isExpanded = tocContent.style.display !== 'none';
          
          if (isExpanded) {
            tocContent.style.display = 'none';
            toggleIcon.style.transform = 'rotate(-90deg)';
          } else {
            tocContent.style.display = 'grid';
            toggleIcon.style.transform = 'rotate(0deg)';
          }
        });
      }
    }
  }
  
  // ============================================
  // SCROLL TO TOP BUTTON
  // ============================================
  
  function initScrollToTop() {
    // Create scroll to top button
    const scrollButton = document.createElement('button');
    scrollButton.className = 'scroll-to-top';
    scrollButton.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 19V5M5 12l7-7 7 7"/>
      </svg>
    `;
    scrollButton.setAttribute('aria-label', 'Scroll to top');
    document.body.appendChild(scrollButton);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .scroll-to-top {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        border: none;
        border-radius: 50%;
        color: white;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
      }
      
      .scroll-to-top.visible {
        opacity: 1;
        visibility: visible;
      }
      
      .scroll-to-top:hover {
        transform: translateY(-4px);
        box-shadow: 0 6px 30px rgba(99, 102, 241, 0.6);
      }
      
      .scroll-to-top:active {
        transform: translateY(-2px);
      }
      
      .scroll-to-top svg {
        width: 24px;
        height: 24px;
      }
      
      @media (max-width: 768px) {
        .scroll-to-top {
          bottom: 1.5rem;
          right: 1.5rem;
          width: 45px;
          height: 45px;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Show/hide on scroll
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        scrollButton.classList.add('visible');
      } else {
        scrollButton.classList.remove('visible');
      }
    });
    
    // Scroll to top on click
    scrollButton.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  // ============================================
  // PRINT FUNCTIONALITY
  // ============================================
  
  function initPrintFunctionality() {
    // Add keyboard shortcut for printing (Ctrl/Cmd + P)
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        window.print();
      }
    });
  }
  
  // ============================================
  // ACCESSIBILITY ENHANCEMENTS
  // ============================================
  
  function initAccessibility() {
    // Add skip to content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add ID to main content
    const legalContent = document.querySelector('.legal-content');
    if (legalContent) {
      legalContent.id = 'main-content';
    }
    
    // Skip link styles
    const style = document.createElement('style');
    style.textContent = `
      .skip-link {
        position: absolute;
        top: -40px;
        left: 0;
        background: #6366f1;
        color: white;
        padding: 0.75rem 1.5rem;
        text-decoration: none;
        border-radius: 0 0 8px 0;
        z-index: 10000;
        transition: top 0.3s ease;
      }
      
      .skip-link:focus {
        top: 0;
      }
    `;
    document.head.appendChild(style);
    
    // Keyboard navigation for sections
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
      // Add keyboard navigation hint
      section.setAttribute('role', 'region');
      const heading = section.querySelector('h2');
      if (heading) {
        section.setAttribute('aria-labelledby', heading.id || `section-${index}`);
        if (!heading.id) {
          heading.id = `section-${index}`;
        }
      }
    });
  }
  
  // ============================================
  // COPY SECTION LINK FUNCTIONALITY
  // ============================================
  
  function initCopySectionLink() {
    const headings = document.querySelectorAll('section h2, section h3');
    
    headings.forEach(heading => {
      if (heading.parentElement.id) {
        heading.style.cursor = 'pointer';
        heading.title = 'Click to copy link to this section';
        
        heading.addEventListener('click', function() {
          const sectionId = this.parentElement.id;
          const url = `${window.location.origin}${window.location.pathname}#${sectionId}`;
          
          // Copy to clipboard
          if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
              showCopyNotification(this);
            }).catch(err => {
              console.error('Failed to copy:', err);
            });
          } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            try {
              document.execCommand('copy');
              showCopyNotification(this);
            } catch (err) {
              console.error('Failed to copy:', err);
            }
            document.body.removeChild(textArea);
          }
        });
      }
    });
  }
  
  function showCopyNotification(element) {
    const notification = document.createElement('span');
    notification.className = 'copy-notification';
    notification.textContent = '✓ Link copied!';
    notification.style.cssText = `
      position: absolute;
      background: #10b981;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.3s ease;
      pointer-events: none;
      z-index: 1000;
    `;
    
    element.style.position = 'relative';
    element.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    }, 10);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 2000);
  }
  
  // Initialize copy functionality
  initCopySectionLink();
  
  // ============================================
  // READING PROGRESS INDICATOR
  // ============================================
  
  function initReadingProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    document.body.appendChild(progressBar);
    
    const style = document.createElement('style');
    style.textContent = `
      .reading-progress {
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #6366f1, #a78bfa);
        z-index: 10000;
        transition: width 0.2s ease;
      }
    `;
    document.head.appendChild(style);
    
    window.addEventListener('scroll', function() {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
      
      progressBar.style.width = Math.min(scrollPercent, 100) + '%';
    });
  }
  
  initReadingProgress();
  
  // ============================================
  // THEME PERSISTENCE (if dark/light mode added)
  // ============================================
  
  function initTheme() {
    const savedTheme = localStorage.getItem('legal-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
  
  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  
  // Debounce function for performance
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // Throttle function for scroll events
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  
  // ============================================
  // RESPONSIVE BEHAVIOR
  // ============================================
  
  function handleResize() {
    // Reinitialize TOC collapse on window resize
    const toc = document.querySelector('.toc');
    if (toc && window.innerWidth > 768) {
      const tocContent = toc.querySelector('ul');
      if (tocContent) {
        tocContent.style.display = 'grid';
      }
    }
  }
  
  window.addEventListener('resize', debounce(handleResize, 250));
  
  // ============================================
  // PERFORMANCE MONITORING
  // ============================================
  
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Log performance metrics if needed
        // console.log('Performance:', entry);
      }
    });
    
    observer.observe({ entryTypes: ['navigation', 'resource'] });
  }
  
  // ============================================
  // LOG INITIALIZATION
  // ============================================
  
  console.log('%c✅ Legal Pages Initialized', 'color: #10b981; font-weight: bold; font-size: 14px;');
  console.log('%cFeatures Active:', 'color: #6366f1; font-weight: bold;');
  console.log('  • Smooth scrolling');
  console.log('  • Active section tracking');
  console.log('  • Scroll to top button');
  console.log('  • Reading progress indicator');
  console.log('  • Accessibility enhancements');
  console.log('  • Copy section links');
  
})();

// ============================================
// GLOBAL FUNCTION: GO BACK
// ============================================

function goBack() {
  // Check if there's a previous page in history
  if (document.referrer && document.referrer !== '') {
    window.history.back();
  } else {
    // If no referrer, go to main page or settings
    // Assuming the legal pages are accessed from settings
    window.location.href = 'index.html#settings';
  }
}

// ============================================
// EXPORT FUNCTIONS FOR EXTERNAL USE
// ============================================

window.LegalPages = {
  goBack: goBack,
  scrollToSection: function(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },
  printPage: function() {
    window.print();
  },
  getActiveSection: function() {
    const sections = document.querySelectorAll('section[id]');
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 100 && rect.bottom >= 100) {
        return section.id;
      }
    }
    return null;
  }
};

console.log('%c📋 Legal Pages API available at window.LegalPages', 'color: #a78bfa; font-style: italic;');
