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
                if (subMenu.clientHeight === 0) height = subMenu.scrollHeight;
                subMenu.style.height = height + 'px';
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

/* ===== FORMS — intercept all submit (newsletter + footer) ===== */
document.addEventListener('submit', function (e) {
    const form = e.target;
    // Newsletter suscripción
    if (form.closest('.newsletter')) {
        e.preventDefault();
        const emailInput = form.querySelector('input[type="email"]');
        if (emailInput && emailInput.value.trim()) {
            showToast('¡Suscripción exitosa! Te avisaremos las novedades 📧');
            form.reset();
        } else {
            showToast('Ingresá un correo válido.');
        }
        return;
    }
    // Footer "Regístrese"
    if (form.closest('.footer-col')) {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]');
        if (email && email.value.trim()) {
            showToast('¡Te uniste a la lista! 📬');
            form.reset();
        }
        return;
    }
});

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
        cart.push({ name: name, price: price, img: img, qty: 1 });
    }
    saveCart();
    updateCartCounter();
    showToast('"' + name + '" agregado al carrito 🛒');
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

    body.innerHTML = cart.map(function (item) {
        return '<div class="cart-item">' +
            '<img src="' + item.img + '" alt="' + item.name + '">' +
            '<div class="cart-item-info">' +
            '<span class="cart-item-name">' + item.name + '</span>' +
            '<span class="cart-item-price">$' + (item.price * item.qty).toFixed(2) + ' (x' + item.qty + ')</span>' +
            '</div>' +
            '<button class="cart-item-remove" onclick="removeFromCart(\'' + item.name.replace(/'/g, "\\'") + '\')">✕</button>' +
            '</div>';
    }).join('');

    const totalAmt = cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
    totalEl.textContent = 'Total: $' + totalAmt.toFixed(2);
}

function showToast(msg) {
    const t = document.getElementById('cart-toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 2800);
}

/* ===== AUTH ===== */
function getUser() {
    return localStorage.getItem('ccb_user');
}

function updateLoginUI() {
    const user = getUser();
    const btn = document.getElementById('btn-login');
    const btnReg = document.getElementById('btn-register');
    if (!btn) return;

    if (user) {
        btn.innerHTML = '<i class="fa fa-user-circle"></i> ' + user +
            ' <span class="logout-link" onclick="logout(event)">Salir</span>';
        btn.classList.add('logged-in');
        if (btnReg) btnReg.style.display = 'none';
    } else {
        btn.innerHTML = '<i class="fa fa-user"></i> Ingresar';
        btn.classList.remove('logged-in');
        if (btnReg) btnReg.style.display = '';
    }
}

function openAuthModal(view) {
    if (getUser()) return;
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    modal.classList.add('open');
    switchAuthView(view || 'login');
    clearAuthErrors();
    setTimeout(function () {
        const focus = document.getElementById(view === 'register' ? 'reg-name' : 'login-email');
        if (focus) focus.focus();
    }, 80);
}

function openLoginModal() { openAuthModal('login'); }
function openRegisterModal() { openAuthModal('register'); }

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('open');
}

function switchToRegister() {
    switchAuthView('register');
    clearAuthErrors();
    setTimeout(function () {
        var f = document.getElementById('reg-name');
        if (f) f.focus();
    }, 50);
}

function switchToLogin() {
    switchAuthView('login');
    clearAuthErrors();
    setTimeout(function () {
        var f = document.getElementById('login-email');
        if (f) f.focus();
    }, 50);
}

function switchAuthView(view) {
    var loginView = document.getElementById('auth-login-view');
    var regView = document.getElementById('auth-register-view');
    if (loginView) loginView.style.display = view === 'login' ? '' : 'none';
    if (regView) regView.style.display = view === 'register' ? '' : 'none';
}

function clearAuthErrors() {
    var e1 = document.getElementById('login-error');
    var e2 = document.getElementById('reg-error');
    if (e1) e1.textContent = '';
    if (e2) e2.textContent = '';
}

function submitLogin(e) {
    e.preventDefault();
    var email = document.getElementById('login-email').value.trim();
    var pass = document.getElementById('login-pass').value;
    var err = document.getElementById('login-error');
    if (!email || !pass) { err.textContent = 'Completá todos los campos.'; return; }
    var username = email.split('@')[0];
    localStorage.setItem('ccb_user', username);
    closeAuthModal();
    updateLoginUI();
    showToast('¡Bienvenido, ' + username + '! 🎮');
}

function submitRegister(e) {
    e.preventDefault();
    var name = document.getElementById('reg-name').value.trim();
    var email = document.getElementById('reg-email').value.trim();
    var pass = document.getElementById('reg-pass').value;
    var pass2 = document.getElementById('reg-pass2').value;
    var err = document.getElementById('reg-error');
    if (!name || !email || !pass || !pass2) { err.textContent = 'Completá todos los campos.'; return; }
    if (pass !== pass2) { err.textContent = 'Las contraseñas no coinciden.'; return; }
    if (pass.length < 6) { err.textContent = 'La contraseña debe tener al menos 6 caracteres.'; return; }
    localStorage.setItem('ccb_user', name);
    closeAuthModal();
    updateLoginUI();
    showToast('¡Cuenta creada! Bienvenido, ' + name + '! 🎮');
}

function logout(e) {
    e.stopPropagation();
    localStorage.removeItem('ccb_user');
    updateLoginUI();
    showToast('Sesión cerrada.');
}

/* ===== DOM INJECTION ===== */
function injectUI() {
    /* Cart sidebar */
    var sidebar = document.createElement('div');
    sidebar.id = 'cart-sidebar';
    sidebar.innerHTML =
        '<div class="cart-header">' +
        '<h2>Tu carrito</h2>' +
        '<button class="cart-close" onclick="toggleCart()">✕</button>' +
        '</div>' +
        '<div id="cart-body" class="cart-body"></div>' +
        '<div id="cart-total" class="cart-total-line"></div>' +
        '<button class="btn-checkout" onclick="showToast(\'¡Gracias por tu compra! 🎮\')">Finalizar compra</button>';
    document.body.appendChild(sidebar);

    /* Overlay */
    var overlay = document.createElement('div');
    overlay.id = 'cart-overlay';
    overlay.onclick = toggleCart;
    document.body.appendChild(overlay);

    /* Toast */
    var toast = document.createElement('div');
    toast.id = 'cart-toast';
    document.body.appendChild(toast);

    /* Auth modal (login + register) */
    var modal = document.createElement('div');
    modal.id = 'auth-modal';
    modal.innerHTML =
        '<div class="auth-modal-box">' +
        /* ---- Login view ---- */
        '<div id="auth-login-view">' +
        '<button class="auth-close" onclick="closeAuthModal()">✕</button>' +
        '<h2>Iniciar sesión</h2>' +
        '<form onsubmit="submitLogin(event)">' +
        '<input id="login-email" type="email" placeholder="Correo electrónico" autocomplete="email">' +
        '<input id="login-pass" type="password" placeholder="Contraseña">' +
        '<span id="login-error" class="auth-error"></span>' +
        '<button type="submit" class="btn-submit-auth">Entrar</button>' +
        '<p class="auth-hint">Podés ingresar con cualquier correo y contraseña.</p>' +
        '</form>' +
        '<p class="auth-switch">¿No tenés cuenta? <span onclick="switchToRegister()">Crear una</span></p>' +
        '</div>' +
        /* ---- Register view ---- */
        '<div id="auth-register-view" style="display:none">' +
        '<button class="auth-close" onclick="closeAuthModal()">✕</button>' +
        '<h2>Crear cuenta</h2>' +
        '<form onsubmit="submitRegister(event)">' +
        '<input id="reg-name" type="text" placeholder="Nombre" autocomplete="name">' +
        '<input id="reg-email" type="email" placeholder="Correo electrónico" autocomplete="email">' +
        '<input id="reg-pass" type="password" placeholder="Contraseña (mín. 6 caracteres)">' +
        '<input id="reg-pass2" type="password" placeholder="Confirmar contraseña">' +
        '<span id="reg-error" class="auth-error"></span>' +
        '<button type="submit" class="btn-submit-auth">Crear cuenta</button>' +
        '<p class="auth-hint">Podés registrarte con cualquier dato.</p>' +
        '</form>' +
        '<p class="auth-switch">¿Ya tenés cuenta? <span onclick="switchToLogin()">Iniciar sesión</span></p>' +
        '</div>' +
        '</div>';
    modal.addEventListener('click', function (e) { if (e.target === modal) closeAuthModal(); });
    document.body.appendChild(modal);

    /* Inject "Crear cuenta" button next to login btn */
    var btnLogin = document.getElementById('btn-login');
    if (btnLogin) {
        var btnReg = document.createElement('button');
        btnReg.className = 'btn-register';
        btnReg.id = 'btn-register';
        btnReg.setAttribute('onclick', 'openRegisterModal()');
        btnReg.innerHTML = '<i class="fa fa-user-plus"></i> Crear cuenta';
        btnLogin.insertAdjacentElement('afterend', btnReg);
    }

    updateLoginUI();
    updateCartCounter();
}

document.addEventListener('DOMContentLoaded', injectUI);
