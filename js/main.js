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

// Home link: scroll to top instead of reloading page
const initHomeScroll = () => {
    const homeLinks = document.querySelectorAll('a[href="index.html"], a[href="./index.html"], a[href="/"]');

    homeLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // If already on the homepage, prevent reload and just scroll to top
            const path = window.location.pathname || '';
            const onHome = path.endsWith('/') || path.endsWith('/index.html');
            if (!onHome) return;

            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
};

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
    const elements = document.querySelectorAll('.usp-card, .highlight-item, .review-card, .booking-card, .booking-card-calendar');

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
            const isRegolamento = url.toLowerCase().includes('regolamento');
            const label = isPrivacy ? 'Privacy Policy' : (isRegolamento ? 'Regolamento' : 'Cookie Policy');

            loadLegal(url, label);
        });
    });
};

// Direct booking form (mailto)
const initDirectBookingForm = () => {
    const form = document.getElementById('directBookingForm');
    const errorEl = document.getElementById('directBookingError');

    if (!form) return;

    const setError = (msg) => {
        if (errorEl) errorEl.textContent = msg;
    };

    const clearError = () => setError('');

    const fmt = (v) => (v || '').toString().trim();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        clearError();

        const nome = fmt(document.getElementById('dbNome')?.value);
        const cognome = fmt(document.getElementById('dbCognome')?.value);
        const email = fmt(document.getElementById('dbEmail')?.value);
        const telefono = fmt(document.getElementById('dbTelefono')?.value);
        const ospiti = fmt(document.getElementById('dbOspiti')?.value);
        const arrivo = fmt(document.getElementById('dbArrivo')?.value);
        const partenza = fmt(document.getElementById('dbPartenza')?.value);
        const messaggio = fmt(document.getElementById('dbMessaggio')?.value);
        const privacyOk = document.getElementById('dbPrivacy')?.checked;

        if (!nome || !cognome || !email || !telefono || !ospiti || !arrivo || !partenza) {
            setError('Compila tutti i campi obbligatori (Nome, Cognome, Email, Telefono, Ospiti, Arrivo, Partenza).');
            return;
        }

        if (!privacyOk) {
            setError('Per inviare la richiesta, conferma di aver letto e accettato Privacy Policy e Regolamento.');
            return;
        }

        if (partenza <= arrivo) {
            setError('La data di partenza deve essere successiva alla data di arrivo.');
            return;
        }

        const subject = `Richiesta prenotazione - ${nome} ${cognome} (${arrivo} → ${partenza})`;

        const bodyLines = [
            'Richiesta di prenotazione (dal sito Casa Vacanze Fiore Ciampino)',
            '',
            `Nome: ${nome}`,
            `Cognome: ${cognome}`,
            `Email: ${email}`,
            `Telefono: ${telefono}`,
            `Numero ospiti: ${ospiti}`,
            `Data arrivo: ${arrivo}`,
            `Data partenza: ${partenza}`,
        ];

        if (messaggio) {
            bodyLines.push('', 'Messaggio:', messaggio);
        }

        bodyLines.push('', '---', 'Inviato tramite form (mailto).');

        const mailto = `mailto:casafioreciampino@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;

        window.location.href = mailto;
    });
};

// Availability calendar (static JSON generated by GitHub Actions)
const initAvailabilityCalendar = () => {
    const root = document.getElementById('availabilityCalendar');
    if (!root) return;

    // Mark as enhanced so CSS can style the full widget
    root.classList.add('availability-calendar--enhanced');

    const pad2 = (n) => String(n).padStart(2, '0');
    const toISODateLocal = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const booked = new Set();
    let generatedAt = '';

    const today = startOfDay(new Date());

    // ---- DOM scaffold ----
    root.innerHTML = `
        <div class="cal-header">
            <button type="button" class="cal-nav" data-dir="-1" aria-label="Mese precedente">‹</button>
            <div class="cal-title" aria-live="polite"></div>
            <button type="button" class="cal-nav" data-dir="1" aria-label="Mese successivo">›</button>
        </div>
        <div class="cal-weekdays" aria-hidden="true">
            <div class="cal-weekday">Lun</div>
            <div class="cal-weekday">Mar</div>
            <div class="cal-weekday">Mer</div>
            <div class="cal-weekday">Gio</div>
            <div class="cal-weekday">Ven</div>
            <div class="cal-weekday">Sab</div>
            <div class="cal-weekday">Dom</div>
        </div>
        <div class="cal-grid" role="grid" aria-label="Calendario disponibilità"></div>
        <div class="cal-legend" aria-label="Legenda disponibilità">
            <span class="legend-item"><span class="legend-swatch is-available" aria-hidden="true"></span> Libero</span>
            <span class="legend-item"><span class="legend-swatch is-booked" aria-hidden="true"></span> Prenotato</span>
        </div>
        <div class="cal-status" aria-live="polite">Caricamento disponibilità…</div>
    `;

    const titleEl = root.querySelector('.cal-title');
    const gridEl = root.querySelector('.cal-grid');
    const statusEl = root.querySelector('.cal-status');

    const fmtMonth = new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' });
    const fmtDayLong = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    let view = new Date(today.getFullYear(), today.getMonth(), 1);
    let selectedISO = '';

    const getDayIndexMonFirst = (date) => (date.getDay() + 6) % 7; // 0=Mon ... 6=Sun

    const setStatus = (dateObj, isBooked) => {
        const labelDate = fmtDayLong.format(dateObj);
        if (isBooked) {
            statusEl.innerHTML = `<strong>${labelDate}</strong>: <strong>Prenotato</strong> (rosso).`;
        } else {
            statusEl.innerHTML = `<strong>${labelDate}</strong>: <strong>Libero</strong> (verde).`;
        }

        if (generatedAt) {
            statusEl.innerHTML += ` <span style="opacity:.75; font-weight:600;">(agg. ${generatedAt})</span>`;
        }
    };

    const render = () => {
        if (!titleEl || !gridEl) return;

        titleEl.textContent = fmtMonth.format(view);
        gridEl.innerHTML = '';

        const year = view.getFullYear();
        const month = view.getMonth();

        const first = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const lead = getDayIndexMonFirst(first);
        const totalCells = 42; // 6 weeks

        const prevMonthDays = new Date(year, month, 0).getDate();

        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('button');
            cell.type = 'button';
            cell.className = 'cal-day';

            const dayNum = i - lead + 1;

            // Outside days (previous / next month)
            if (dayNum < 1) {
                cell.textContent = String(prevMonthDays + dayNum);
                cell.classList.add('is-outside');
                cell.disabled = true;
                gridEl.appendChild(cell);
                continue;
            }

            if (dayNum > daysInMonth) {
                cell.textContent = String(dayNum - daysInMonth);
                cell.classList.add('is-outside');
                cell.disabled = true;
                gridEl.appendChild(cell);
                continue;
            }

            // In-month day
            const dateObj = new Date(year, month, dayNum);
            const iso = toISODateLocal(dateObj);
            const isBooked = booked.has(iso);
            const isPast = startOfDay(dateObj) < today;

            cell.textContent = String(dayNum);
            cell.dataset.date = iso;
            cell.setAttribute('aria-label', `${fmtDayLong.format(dateObj)}: ${isBooked ? 'prenotato' : 'libero'}${isPast ? ', giorno passato' : ''}`);

            cell.classList.add(isBooked ? 'is-booked' : 'is-available');

            if (isPast) {
                cell.classList.add('is-past');
                cell.disabled = true;
            }

            if (iso === toISODateLocal(today)) cell.classList.add('is-today');
            if (iso === selectedISO) cell.classList.add('is-selected');

            if (!isPast) {
                cell.addEventListener('click', () => {
                    selectedISO = iso;

                    // Update selection UI without re-rendering everything
                    root.querySelectorAll('.cal-day.is-selected').forEach(btn => btn.classList.remove('is-selected'));
                    cell.classList.add('is-selected');

                    setStatus(dateObj, isBooked);
                });
            }

            gridEl.appendChild(cell);
        }

        // If selection is on a different month, reset to neutral message
        const selectedInView = selectedISO && selectedISO.startsWith(`${year}-${pad2(month + 1)}-`);
        if (!selectedInView) {
            if (statusEl) {
                statusEl.textContent = generatedAt ? `Seleziona un giorno per vedere lo stato. (agg. ${generatedAt})` : 'Seleziona un giorno per vedere lo stato.';
            }
            selectedISO = '';
        }
    };

    const loadAvailability = async () => {
        try {
            // cache-bust because GitHub Pages can cache aggressively
            const res = await fetch(`data/availability.json?v=${Date.now()}`, { cache: 'no-store' });
            if (!res.ok) throw new Error('Availability fetch failed');

            const json = await res.json();
            const list = Array.isArray(json?.booked) ? json.booked : [];

            booked.clear?.();
            list.forEach(d => booked.add(String(d)));

            generatedAt = String(json?.generated_at || '').replace('T', ' ').replace('Z', ' UTC').trim();

            render();
        } catch (e) {
            // Graceful fallback
            if (statusEl) statusEl.textContent = 'Disponibilità non disponibile al momento. Riprova tra poco.';
            render();
        }
    };

    root.querySelectorAll('.cal-nav').forEach(btn => {
        btn.addEventListener('click', () => {
            const dir = Number(btn.getAttribute('data-dir') || '0');
            view = new Date(view.getFullYear(), view.getMonth() + dir, 1);
            render();
        });
    });

    // First render + load
    render();
    loadAvailability();
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initHomeScroll();
    animateOnScroll();
    initCarousel();
    initLegalModal();
    initDirectBookingForm();
    initAvailabilityCalendar();
});
