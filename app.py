"""Aplicación Flask de ejemplo para la tienda Coca-Cola Byte."""

import sqlite3
from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__, static_url_path='', static_folder='.')
app.secret_key = 'devkey'
DATABASE = 'database.db'


def get_db():
    """Abre una conexión SQLite y la retorna."""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Crea tablas y carga productos de ejemplo si es necesario."""
    conn = get_db()
    c = conn.cursor()
    c.execute(
        '''CREATE TABLE IF NOT EXISTS users (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               username TEXT UNIQUE,
               password TEXT)''')
    c.execute(
        '''CREATE TABLE IF NOT EXISTS contacts (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               name TEXT,
               email TEXT,
               message TEXT)''')
    c.execute(
        '''CREATE TABLE IF NOT EXISTS products (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               name TEXT,
               price REAL,
               image TEXT)''')
    conn.commit()

    # Insertar productos de muestra si la tabla está vacía
    count = c.execute('SELECT COUNT(*) FROM products').fetchone()[0]
    if count == 0:
        products = [
            ('Remera Negra', 20.0, 'img/remera_negra.png'),
            ('Remera Gris', 20.0, 'img/remera_gris.png'),
            ('Buzo Negro', 35.0, 'img/buzo_negro.png'),
            ('Buzo Blanco', 35.0, 'img/buzo_blanco.png'),
            ('Zapatillas', 50.0, 'img/zapatillas.jpg'),
            ('Sandalias Negras', 25.0, 'img/chinela.jpg'),
            ('Sandalias Blancas', 25.0, 'img/crocs.jpg')
        ]
        c.executemany(
            'INSERT INTO products (name, price, image) VALUES (?,?,?)',
            products)
        conn.commit()
    conn.close()


@app.route('/')
def index():
    """Página principal del sitio."""
    return render_template('index.html')


@app.route('/contact', methods=['GET', 'POST'])
def contact():
    """Formulario de contacto para recibir mensajes de los usuarios."""
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        message = request.form['message']
        conn = get_db()
        conn.execute('INSERT INTO contacts (name, email, message) VALUES (?,?,?)', (name, email, message))
        conn.commit()
        conn.close()
        return redirect(url_for('index'))
    return render_template('contact.html')


@app.route('/store')
def store():
    """Muestra los productos disponibles en la tienda."""
    conn = get_db()
    products = conn.execute('SELECT * FROM products LIMIT 3').fetchall()
    conn.close()
    return render_template('store.html', products=products)


@app.route('/load_more')
def load_more():
    """Devuelve más productos en formato JSON para carga dinámica."""
    offset = max(0, int(request.args.get('offset', 0)))
    conn = get_db()
    rows = conn.execute('SELECT * FROM products LIMIT 3 OFFSET ?', (offset,)).fetchall()
    conn.close()
    data = [dict(id=row['id'], name=row['name'], price=row['price'], image=url_for('static', filename=row['image'])) for row in rows]
    return jsonify(data)


@app.route('/register', methods=['GET', 'POST'])
def register():
    """Permite crear una nueva cuenta de usuario."""
    if request.method == 'POST':
        username = request.form['username']
        password = generate_password_hash(request.form['password'])
        conn = get_db()
        try:
            conn.execute('INSERT INTO users (username, password) VALUES (?,?)', (username, password))
            conn.commit()
            conn.close()
            return redirect(url_for('login'))
        except sqlite3.IntegrityError:
            conn.close()
            return 'Usuario ya existe'
    return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    """Inicia sesión y almacena el usuario en la sesión."""
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        conn = get_db()
        user = conn.execute('SELECT * FROM users WHERE username=?', (username,)).fetchone()
        conn.close()
        if user and check_password_hash(user['password'], password):
            session['user_id'] = user['id']
            return redirect(url_for('store'))
        else:
            return 'Credenciales incorrectas'
    return render_template('login.html')


@app.route('/logout')
def logout():
    """Cierra la sesión actual."""
    session.pop('user_id', None)
    session.pop('cart', None)
    return redirect(url_for('index'))


@app.route('/add_to_cart/<int:product_id>')
def add_to_cart(product_id):
    """Agrega un producto al carrito almacenado en la sesión."""
    if 'cart' not in session:
        session['cart'] = []
    conn = get_db()
    product = conn.execute('SELECT * FROM products WHERE id=?', (product_id,)).fetchone()
    conn.close()
    if product:
        session['cart'].append({'id': product['id'], 'name': product['name'], 'price': product['price']})
    return redirect(url_for('cart'))


@app.route('/remove_from_cart/<int:product_id>')
def remove_from_cart(product_id):
    """Elimina un producto del carrito."""
    if 'cart' in session:
        session['cart'] = [p for p in session['cart'] if p['id'] != product_id]
    return redirect(url_for('cart'))


@app.route('/cart')
def cart():
    """Muestra el carrito de compras."""
    cart = session.get('cart', [])
    total = sum(item['price'] for item in cart)
    return render_template('cart.html', cart=cart, total=total)


if __name__ == '__main__':
    # Preparar la base de datos y lanzar la aplicación
    init_db()
    app.run(debug=True)
