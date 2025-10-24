let offset = 0;
function initStore(initialCount){
  offset = initialCount;
  const button = document.getElementById('ver-mas');
  button.addEventListener('click', () => {
    fetch(`/load_more?offset=${offset}`)
      .then(r => r.json())
      .then(data => {
        const list = document.getElementById('product-list');
        data.forEach(p => {
          const div = document.createElement('div');
          div.className = 'product';
          div.innerHTML = `<img src="${p.image}" alt="${p.name}"><p>${p.name} - ${p.price}</p><a href="/add_to_cart/${p.id}">Agregar al carrito</a>`;
          list.appendChild(div);
        });
        offset += data.length;
        if (data.length === 0) button.style.display = 'none';
      });
  });
}
