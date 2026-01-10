// Mobile Menu Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navbar = document.querySelector('.navbar');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}

// Smooth Scroll (with sticky navbar offset)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        const target = document.querySelector(href);

        if (!target) return;

        e.preventDefault();

        const navHeight = navbar ? navbar.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 10;

        window.scrollTo({
            top,
            behavior: 'smooth'
        });
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (!navbar) return;

    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    } else {
        navbar.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
    }
});

// Animation on scroll
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.usp-card, .highlight-item, .review-card, .booking-card');

    if (!('IntersectionObserver' in window)) {
        elements.forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
};

// Carousel
const initCarousel = () => {
    const carouselInner = document.getElementById('carouselInner');
    const dotsContainer = document.getElementById('carouselDots');
    const currentSlideEl = document.getElementById('currentSlide');

    if (!carouselInner || !dotsContainer || !currentSlideEl) return;

    const items = carouselInner.querySelectorAll('.carousel-item');
    const totalSlides = items.length;
    let currentSlide = 0;
    let autoplayTimeout;

    const updateDots = () => {
        if (dotsContainer.children.length === 0) {
            for (let i = 0; i < totalSlides; i++) {
                const dot = document.createElement('button');
                dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('aria-label', `Vai alla foto ${i + 1}`);
                dot.onclick = () => {
                    currentSlide = i;
                    showSlide(currentSlide);
                };
                dotsContainer.appendChild(dot);
            }
        }

        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    };

    const updateCounter = () => {
        currentSlideEl.textContent = currentSlide + 1;
    };

    const startAutoplay = () => {
        autoplayTimeout = setInterval(() => {
            currentSlide = (currentSlide + 1) % totalSlides;
            showSlide(currentSlide);
        }, 5000);
    };

    const resetAutoplay = () => {
        clearInterval(autoplayTimeout);
        startAutoplay();
    };

    const showSlide = (n) => {
        items.forEach(item => item.classList.remove('active'));

        if (n >= totalSlides) currentSlide = 0;
        if (n < 0) currentSlide = totalSlides - 1;

        items[currentSlide].classList.add('active');
        updateDots();
        updateCounter();
        resetAutoplay();
    };

    // Keep compatibility with inline onclick
    window.moveCarousel = (n) => {
        currentSlide += n;
        showSlide(currentSlide);
    };

    showSlide(0);
    updateDots();
    startAutoplay();
};

// Legal modal (Privacy/Cookie quick view)
const initLegalModal = () => {
    const modal = document.getElementById('legalModal');
    const contentEl = document.getElementById('legalContent');
    const titleEl = document.getElementById('legalTitle');
    const openPageEl = document.getElementById('legalOpenPage');

    if (!modal || !contentEl || !titleEl || !openPageEl) return;

    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    };

    const openModal = () => {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');

        const closeBtn = modal.querySelector('[data-legal-close]');
        if (closeBtn) closeBtn.focus();
    };

    modal.querySelectorAll('[data-legal-close]').forEach(el => {
        el.addEventListener('click', closeModal);
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });

    const setLoading = () => {
        contentEl.innerHTML = '<p>Caricamento…</p>';
    };

    const loadLegal = async (url, label) => {
        setLoading();
        titleEl.textContent = label;
        openPageEl.href = url;

        try {
            const res = await fetch(url, { cache: 'no-store' });
            if (!res.ok) throw new Error('Fetch failed');

            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');

            const node = doc.querySelector('main') || doc.querySelector('.legal-page') || doc.querySelector('.legal-card');
            if (!node) throw new Error('Legal content not found');

            const clone = node.cloneNode(true);
            clone.querySelectorAll('a[href="index.html"], a[href="./index.html"], a[href="/index.html"], a[href="/"]').forEach(a => {
                const p = a.closest('p');
                if (p) p.remove();
                else a.remove();
            });

            // Keep classes/styles by injecting the wrapper element, not only its innerHTML
            contentEl.innerHTML = clone.outerHTML;
            openModal();
        } catch (err) {
            // Fallback: open full page if something goes wrong
            window.location.href = url;
        }
    };

    document.querySelectorAll('a.legal-link[data-legal]').forEach(link => {
        link.addEventListener('click', (e) => {
            const url = link.getAttribute('data-legal');
            if (!url) return;

            e.preventDefault();

            const isPrivacy = url.toLowerCase().includes('privacy');
            const label = isPrivacy ? 'Privacy Policy' : 'Cookie Policy';

            loadLegal(url, label);
        });
    });
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    animateOnScroll();
    initCarousel();
    initLegalModal();
});
