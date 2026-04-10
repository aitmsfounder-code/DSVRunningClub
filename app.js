// ===== Running Club - Main App JS =====

// ==========================================
// Supabase Config
// ==========================================
const SUPABASE_URL = 'https://dbeifdqpsmfbsjhckank.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_2B1zgph7j1q1ypLRJi1PGw_tOirzbZj';

// ===== Supabase REST API Helper =====
async function supabaseFetch(table, options = {}) {
    const { method = 'GET', body, select = '*', order, filters, returnData = false } = options;
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);

    if (method === 'GET') {
        url.searchParams.set('select', select);
        if (order) url.searchParams.set('order', order);
    }

    // Apply filters (e.g., { 'id': 'eq.5', 'name': 'ilike.*john*' })
    if (filters) {
        Object.entries(filters).forEach(([key, val]) => {
            url.searchParams.set(key, val);
        });
    }

    const token = getAuthToken() || SUPABASE_ANON_KEY;
    const headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    if (method === 'POST') {
        headers['Prefer'] = returnData ? 'return=representation' : 'return=minimal';
    }
    if (method === 'PATCH') {
        headers['Prefer'] = 'return=minimal';
    }

    const res = await fetch(url.toString(), {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Supabase ${method} ${table}: ${res.status} ${errText}`);
    }

    if (method === 'GET') return res.json();
    if (returnData) return res.json();
    return null;
}

function isSupabaseConfigured() {
    return SUPABASE_URL && SUPABASE_ANON_KEY;
}

// ===== Supabase Auth =====
function getAuthToken() {
    try {
        const session = JSON.parse(localStorage.getItem('dsv_admin_session') || 'null');
        if (session && session.access_token) {
            // Check expiry
            if (session.expires_at && Date.now() / 1000 > session.expires_at) {
                localStorage.removeItem('dsv_admin_session');
                return null;
            }
            return session.access_token;
        }
    } catch (e) {}
    return null;
}

async function adminLogin(email, password) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error_description || err.msg || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem('dsv_admin_session', JSON.stringify({
        access_token: data.access_token,
        expires_at: data.expires_at,
        user: data.user,
    }));
    return data;
}

function adminLogout() {
    localStorage.removeItem('dsv_admin_session');
}

function isAdminLoggedIn() {
    return !!getAuthToken();
}

// ===== Supabase Storage: Upload Slip =====
async function uploadSlip(file, orderId) {
    const resized = await resizeImage(file, 800, 0.7);
    const ext = resized.type === 'image/webp' ? 'webp' : 'jpg';
    const filename = `slip_${orderId}_${Date.now()}.${ext}`;

    const token = getAuthToken() || SUPABASE_ANON_KEY;

    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/slips/${filename}`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': resized.type,
            'x-upsert': 'true',
        },
        body: resized,
    });

    if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Upload failed: ${res.status} ${errText}`);
    }

    // Return public URL
    return `${SUPABASE_URL}/storage/v1/object/public/slips/${filename}`;
}

// ===== Client-side Image Resize =====
function resizeImage(file, maxSize = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let w = img.width, h = img.height;
                if (w > maxSize || h > maxSize) {
                    if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
                    else { w = Math.round(w * maxSize / h); h = maxSize; }
                }
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);

                // Try webp first, fallback to jpeg
                canvas.toBlob(
                    (blob) => {
                        if (blob) { resolve(blob); return; }
                        // Fallback to jpeg
                        canvas.toBlob(
                            (jpgBlob) => jpgBlob ? resolve(jpgBlob) : reject(new Error('Resize failed')),
                            'image/jpeg', quality
                        );
                    },
                    'image/webp', quality
                );
            };
            img.onerror = () => reject(new Error('Invalid image'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('File read error'));
        reader.readAsDataURL(file);
    });
}

// ===== Status Badge Helper =====
function statusBadge(status) {
    const map = {
        'รับออเดอร์': 'badge-status-pending',
        'แจ้งชำระค่าเสื้อ': 'badge-status-slip',
        'ชำระแล้ว': 'badge-status-paid',
    };
    const cls = map[status] || 'badge-status-pending';
    return `<span class="badge-status ${cls}">${status || 'รับออเดอร์'}</span>`;
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
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// ===== Navbar scroll effect =====
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    const currentScroll = window.pageYOffset;
    navbar.style.boxShadow = currentScroll > 50
        ? '0 4px 20px rgba(0,0,0,0.2)'
        : '0 2px 16px rgba(0,0,0,0.15)';
    lastScroll = currentScroll;
});

// ===== Toast Notification =====
function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}
