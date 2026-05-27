/* ===== NAV ===== */
(function () {
    const listElements = document.querySelectorAll('.menu__item--show');
    const list = document.querySelector('.menu__links');
    const menu = document.querySelector('.menu__hamburguer');

    const addClick = () => {
        listElements.forEach(element => {
            element.addEventListener('click', () => {
                let subMenu = element.children[1];
                let height = 0;
                element.classList.toggle('menu__item--active');
                if (subMenu.clientHeight === 0) {
                    height = subMenu.scrollHeight;
                }
                subMenu.style.height = `${height}px`;
            });
        });
    };

    const deleteStyleHeight = () => {
        listElements.forEach(element => {
            if (element.children[1].getAttribute('style')) {
                element.children[1].removeAttribute('style');
                element.classList.remove('menu__item--active');
            }
        });
    };

    window.addEventListener('resize', () => {
        if (window.innerWidth > 800) {
            deleteStyleHeight();
            if (list.classList.contains('menu__links--show'))
                list.classList.remove('menu__links--show');
        } else {
            addClick();
        }
    });

    if (window.innerWidth <= 800) addClick();
    if (menu) menu.addEventListener('click', () => list.classList.toggle('menu__links--show'));
})();

/* ===== FAQ ===== */
const preguntas = document.querySelectorAll('.pregunta');
preguntas.forEach(pregunta =>
    pregunta.addEventListener('click', () => {
        const respuesta = pregunta.nextElementSibling;
        const icono = pregunta.lastElementChild;
        if (respuesta.style.display === 'block') {
            respuesta.style.display = 'none';
            icono.className = 'fa fa-angle-down';
        } else {
            respuesta.style.display = 'block';
            icono.className = 'fa fa-angle-up';
        }
    })
);

/* ===== CART ===== */
let cart = JSON.parse(localStorage.getItem('ccb_cart') || '[]');

function saveCart() {
    localStorage.setItem('ccb_cart', JSON.stringify(cart));
}

function updateCartCounter() {
    const total = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = total;
        el.style.display = total > 0 ? 'flex' : 'none';
    });
}

function addToCart(name, price, img) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ name, price, img, qty: 1 });
    }
    saveCart();
    updateCartCounter();
    showToast(`"${name}" agregado al carrito 🛒`);
}

function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    saveCart();
    updateCartCounter();
    renderCartSidebar();
}

function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    if (!sidebar) return;
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
    renderCartSidebar();
}

function renderCartSidebar() {
    const body = document.getElementById('cart-body');
    const totalEl = document.getElementById('cart-total');
    if (!body) return;

    if (cart.length === 0) {
        body.innerHTML = '<p class="cart-empty">Tu carrito está vacío.</p>';
        totalEl.textContent = '';
        return;
    }

    body.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.img}" alt="${item.name}">
            <div class="cart-item-info">
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-price">$${(item.price * item.qty).toFixed(2)} (x${item.qty})</span>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart('${item.name.replace(/'/g, "\\'")}')">✕</button>
        </div>
    `).join('');

    const totalAmt = cart.reduce((s, i) => s + i.price * i.qty, 0);
    totalEl.textContent = `Total: $${totalAmt.toFixed(2)}`;
}

function showToast(msg) {
    const t = document.getElementById('cart-toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2800);
}

/* ===== LOGIN ===== */
function getUser() {
    return localStorage.getItem('ccb_user');
}

function updateLoginUI() {
    const user = getUser();
    const btn = document.getElementById('btn-login');
    if (!btn) return;
    if (user) {
        btn.innerHTML = `<i class="fa fa-user-circle"></i> ${user} <span class="logout-link" onclick="logout(event)">Salir</span>`;
        btn.classList.add('logged-in');
    } else {
        btn.innerHTML = `<i class="fa fa-user"></i> Iniciar sesión`;
        btn.classList.remove('logged-in');
    }
}

function openLoginModal() {
    if (getUser()) return;
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.classList.add('open');
        document.getElementById('login-email').focus();
        document.getElementById('login-error').textContent = '';
    }
}

function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) modal.classList.remove('open');
}

function submitLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value;
    const err = document.getElementById('login-error');
    if (!email || !pass) {
        err.textContent = 'Completá todos los campos.';
        return;
    }
    const username = email.split('@')[0];
    localStorage.setItem('ccb_user', username);
    closeLoginModal();
    updateLoginUI();
    showToast(`¡Bienvenido, ${username}! 🎮`);
}

function logout(e) {
    e.stopPropagation();
    localStorage.removeItem('ccb_user');
    updateLoginUI();
    showToast('Sesión cerrada.');
}

/* ===== DOM INJECTION ===== */
function injectUI() {
    // Cart sidebar
    const sidebar = document.createElement('div');
    sidebar.id = 'cart-sidebar';
    sidebar.innerHTML = `
        <div class="cart-header">
            <h2>Tu carrito</h2>
            <button class="cart-close" onclick="toggleCart()">✕</button>
        </div>
        <div id="cart-body" class="cart-body"></div>
        <div id="cart-total" class="cart-total-line"></div>
        <button class="btn-checkout" onclick="showToast('¡Gracias por tu compra! 🎮')">Finalizar compra</button>
    `;
    document.body.appendChild(sidebar);

    // Overlay
    const overlay = document.createElement('div');
    overlay.id = 'cart-overlay';
    overlay.onclick = toggleCart;
    document.body.appendChild(overlay);

    // Toast
    const toast = document.createElement('div');
    toast.id = 'cart-toast';
    document.body.appendChild(toast);

    // Login modal
    const modal = document.createElement('div');
    modal.id = 'login-modal';
    modal.innerHTML = `
        <div class="login-modal-box">
            <button class="login-close" onclick="closeLoginModal()">✕</button>
            <h2>Iniciar sesión</h2>
            <form onsubmit="submitLogin(event)">
                <input id="login-email" type="email" placeholder="Correo electrónico" autocomplete="email" required>
                <input id="login-pass" type="password" placeholder="Contraseña" required>
                <span id="login-error" class="login-error"></span>
                <button type="submit" class="btn-submit-login">Entrar</button>
                <p class="login-hint">Podés ingresar con cualquier correo y contraseña.</p>
            </form>
        </div>
    `;
    modal.addEventListener('click', e => { if (e.target === modal) closeLoginModal(); });
    document.body.appendChild(modal);

    updateLoginUI();
    updateCartCounter();
}

document.addEventListener('DOMContentLoaded', injectUI);
