// ================= PRODUCTOS =================
const products = [
  {
    name: "Arroz",
    price: 3000,
    desc: "Arroz premium 500g",
    img: "IMAGENES/ARROZ_DIANA.png"
  },
  {
    name: "Azúcar",
    price: 5300,
    desc: "Azúcar refinada 1kg",
    img: "IMAGENES/AZUCAR.jpg"
  },
  {
    name: "Café",
    price: 67990,
    desc: "Café colombiano premium",
    img: "IMAGENES/CAFE.jpg"
  },
  {
    name: "Leche",
    price: 7000,
    desc: "Leche entera 1L",
    img: "IMAGENES/LECHE_ALQUERIA.png"
  }
];

// ================= CARRITO =================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ================= MOSTRAR PRODUCTOS =================
const container = document.getElementById("products");

products.forEach((p, i) => {
  let card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <img src="${p.img}">
    <h3>${p.name}</h3>
    <p class="desc">${p.desc}</p>
    <p>$${p.price}</p>
    <button onclick="addToCart(${i})">Agregar</button>
  `;

  container.appendChild(card);
});

// ================= TOGGLE CARRITO =================
function toggleCart(){
  document.getElementById("cart").classList.toggle("active");
}

// ================= FUNCIONES =================
function addToCart(i) {
  let item = cart.find(p => p.name === products[i].name);

  if (item) item.qty++;
  else cart.push({ ...products[i], qty: 1 });

  saveCart();
  renderCart();
}

function changeQty(i, delta) {
  cart[i].qty += delta;
  if (cart[i].qty <= 0) cart.splice(i, 1);
  saveCart();
  renderCart();
}

function removeItem(i) {
  cart.splice(i, 1);
  saveCart();
  renderCart();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function renderCart() {
  let list = document.getElementById("cartList");
  let total = 0;

  list.innerHTML = "";

  cart.forEach((item, i) => {
    let li = document.createElement("li");
    let subtotal = item.price * item.qty;
    total += subtotal;

    li.innerHTML = `
      ${item.name} x${item.qty} = $${subtotal}
      <br>
      <button class="action" onclick="changeQty(${i},1)">+</button>
      <button class="action" onclick="changeQty(${i},-1)">-</button>
      <button class="action" onclick="removeItem(${i})">Eliminar</button>
    `;

    list.appendChild(li);
  });

  document.getElementById("total").textContent = total;
}

// ================= FACTURA =================
function generateInvoice() {
  let cliente = document.getElementById("cliente").value;
  let direccion = document.getElementById("direccion").value;

  let html = `<h3>🧾 Factura</h3>`;
  html += `<p><strong>Cliente:</strong> ${cliente}</p>`;
  html += `<p><strong>Dirección:</strong> ${direccion}</p>`;

  let total = 0;

  cart.forEach(item => {
    html += `<p>${item.name} x${item.qty} = $${item.price * item.qty}</p>`;
    total += item.price * item.qty;
  });

  html += `<hr><strong>Total: $${total}</strong>`;

  document.getElementById("invoice").innerHTML = html;
}

// ================= PDF =================
async function downloadPDF() {
  const { jsPDF } = window.jspdf;
  let doc = new jsPDF();

  let y = 10;
  let cliente = document.getElementById("cliente").value;

  doc.text("Factura SuperWow", 10, y); y += 10;
  doc.text("Cliente: " + cliente, 10, y); y += 10;

  let total = 0;

  cart.forEach(item => {
    doc.text(`${item.name} x${item.qty} = $${item.price * item.qty}`, 10, y);
    y += 10;
    total += item.price * item.qty;
  });

  doc.text("Total: $" + total, 10, y + 10);

  doc.save("factura.pdf");
}


function cargarProductos() {
    fetch('http://localhost:3000/productos')
        .then(res => res.json())
        .then(data => {
            const contenedor = document.getElementById("productos");
            contenedor.innerHTML = "";

            data.forEach(p => {
                contenedor.innerHTML += `
                    <div style="border:1px solid #ccc; padding:10px; margin:10px;">
                        <img src="${p.imagen}" width="100">
                        <h3>${p.nombre}</h3>
                        <p>Precio: $${p.precio}</p>
                        <button onclick="eliminar(${p.id_producto})">Eliminar</button>
                    </div>
                `;
            });
        });
}

cargarProductos();


function eliminar(id) {
    fetch(`http://localhost:3000/productos/${id}`, {
        method: 'DELETE'
    })
    .then(() => cargarProductos());
}


function guardarFactura() {
    console.log("🔥 CLICK DETECTADO");

    fetch('http://localhost:3000/factura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            cliente: "PRUEBA",
            direccion: "PRUEBA",
            carrito: [
                { price: 3000, qty: 1 }
            ]
        })
    })
    .then(res => res.text())
    .then(msg => {
        console.log("RESPUESTA:", msg);
        alert(msg);
    })
    .catch(err => console.log("ERROR:", err));
}
// ================= INICIO =================
renderCart();