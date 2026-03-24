// ================= PRODUCTOS =================
const products = [
  {
    name: "Arroz",
    price: 3000,
    img: "IMAGENES/ARROZ_DIANA.png"
  },
  {
    name: "Azúcar",
    price: 5300,
    img: "IMAGENES/AZUCAR.jpg"
  },
  {
    name: "Café",
    price: 67.990,
    img: "IMAGENES/CAFE.jpg"
  },
  {
    name: "Leche",
    price: 7000,
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
    <img src="${p.img}" alt="${p.name}">
    <h3>${p.name}</h3>
    <p>$${p.price}</p>
    <button onclick="addToCart(${i})">Agregar</button>
  `;

  container.appendChild(card);
});

// ================= FUNCIONES =================
function addToCart(i) {
  let item = cart.find(p => p.name === products[i].name);

  if (item) {
    item.qty++;
  } else {
    cart.push({ ...products[i], qty: 1 });
  }

  saveCart();
  renderCart();
}

function changeQty(i, delta) {
  cart[i].qty += delta;

  if (cart[i].qty <= 0) {
    cart.splice(i, 1);
  }

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

function generateInvoice() {
  let cliente = document.getElementById("cliente").value;
  let direccion = document.getElementById("direccion").value;

  let html = `<h3>Factura</h3>`;
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

// ================= INICIO =================
renderCart();