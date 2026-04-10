// ===== DSV Run Together - Main App JS =====

// ==========================================
// Supabase Config - ใส่ URL และ anon key ตรงนี้
// ==========================================
const SUPABASE_URL = ''; // ← ใส่ Supabase Project URL
const SUPABASE_ANON_KEY = ''; // ← ใส่ Supabase anon/public key

// Helper: Supabase REST API fetch
async function supabaseFetch(table, options = {}) {
    const { method = 'GET', body, select = '*', order } = options;
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
    if (method === 'GET') {
        url.searchParams.set('select', select);
        if (order) url.searchParams.set('order', order);
    }

    const headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
    };
    if (method === 'POST') {
        headers['Prefer'] = 'return=minimal';
    }

    const res = await fetch(url.toString(), {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        throw new Error(`Supabase ${method} ${table}: ${res.status}`);
    }
    if (method === 'GET') return res.json();
    return null;
}

function isSupabaseConfigured() {
    return SUPABASE_URL && SUPABASE_ANON_KEY;
}

// ===== Mobile Navigation Toggle =====
function toggleMenu() {
    const menu = document.getElementById('navMenu');
    menu.classList.toggle('active');
}

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        const menu = document.getElementById('navMenu');
        menu.classList.remove('active');
    });
});

// ===== Product Filter (Home page) =====
function filterProducts(type, btn) {
    const cards = document.querySelectorAll('.product-card');
    const tabs = document.querySelectorAll('.tab');

    tabs.forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    cards.forEach(card => {
        if (type === 'all' || card.dataset.type === type) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

// ===== Smooth scroll for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ===== Navbar scroll effect =====
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const currentScroll = window.pageYOffset;
    if (currentScroll > 50) {
        navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
    } else {
        navbar.style.boxShadow = '0 2px 16px rgba(0,0,0,0.15)';
    }
    lastScroll = currentScroll;
});

// ===== Toast Notification =====
function showToast(message, type = 'success') {
    // Remove existing toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}
