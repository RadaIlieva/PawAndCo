const productList = document.getElementById("productList");
const buttons = document.querySelectorAll(".category-btn");
let cart = [];
const API_BASE_URL = window.location.origin;

async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products`);
    return await res.json();
  } catch (error) {
    console.error("Грешка при взимане на продукти:", error);
    return [];
  }
}

async function renderProducts(filter = "Всички") {
  const products = await fetchProducts();
  productList.innerHTML = "";

  const filtered =
    filter === "Всички" ? products : products.filter((p) => p.category === filter);

  filtered.forEach((p) => {
    const eur = (p.priceBGN / 1.96).toFixed(2);
    const card = document.createElement("div");
    card.classList.add("product-card");
    card.innerHTML = `
      <img src="${API_BASE_URL}${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <p class="price">${eur} € (${p.priceBGN} лв)</p>
      <button class="buy-btn">Добави в количката</button>
    `;
    const btn = card.querySelector(".buy-btn");
    btn.addEventListener("click", () => addToCart(p));
    productList.appendChild(card);
  });
}

function addToCart(product) {
  const existing = cart.find((p) => p._id === product._id);
  if (existing) existing.quantity++;
  else cart.push({ ...product, quantity: 1 });

  updateCartIcon();
  showCartMessage(`${product.name} е добавен в количката 🛒`);
}

function showCartMessage(message) {
  const msg = document.createElement("div");
  msg.textContent = message;
  msg.classList.add("cart-popup");
  document.body.appendChild(msg);

  setTimeout(() => msg.classList.add("visible"), 100);
  setTimeout(() => {
    msg.classList.remove("visible");
    setTimeout(() => msg.remove(), 500);
  }, 2000);
}

function updateCartIcon() {
  const count = cart.reduce((sum, p) => sum + p.quantity, 0);
  document.getElementById("cartCount").textContent = count;
}

function openCart() {
  productList.innerHTML = "";
  const cartBox = document.createElement("div");
  cartBox.classList.add("cart-box");

  const totalBGN = cart.reduce((sum, p) => sum + p.priceBGN * p.quantity, 0);
  const totalEUR = (totalBGN / 1.96).toFixed(2);

  cartBox.innerHTML = `
    <h2>🛒 Моята количка</h2>
    ${
      cart.length === 0
        ? "<p>Количката е празна.</p>"
        : `
      <ul class="cart-items">
        ${cart
          .map((p) => {
            const itemEur = (p.priceBGN / 1.96).toFixed(2);
            return `
          <li>
            <img src="${API_BASE_URL}${p.image}" alt="${p.name}">
            <div>
              <strong>${p.name}</strong><br>
              ${itemEur} € (${p.priceBGN} лв) × ${p.quantity}
            </div>
            <button class="remove-item" data-id="${p._id}">✖</button>
          </li>`;
          })
          .join("")}
      </ul>
      <p class="cart-total"><strong>Общо:</strong> ${totalEUR} € (${totalBGN.toFixed(2)} лв)</p>
      <button id="orderBtn" class="primary-btn">Поръчай</button>
    `
    }
    <button id="backToProducts" class="secondary-btn">⬅ Обратно</button>
  `;

  productList.appendChild(cartBox);

  document.querySelectorAll(".remove-item").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      cart = cart.filter((p) => p._id !== id);
      openCart();
      updateCartIcon();
    });
  });

  document.getElementById("backToProducts").addEventListener("click", () => renderProducts());
  const orderBtn = document.getElementById("orderBtn");
  if (orderBtn) orderBtn.addEventListener("click", openOrderForm);
}

function openOrderForm() {
  productList.innerHTML = `
    <div class="order-form fade-in">
      <h2>Данни за доставка</h2>
      <input type="text" id="customerName" placeholder="Име и фамилия" required>
      <input type="tel" id="customerPhone" placeholder="Телефон" required>
      <input type="email" id="customerEmail" placeholder="Имейл" required>
      <div class="delivery-container">
        <p>Изберете начин на доставка:</p>
        <div class="delivery-options">
          <label><input type="radio" name="deliveryType" value="home" checked> До адрес на дома</label>
          <label><input type="radio" name="deliveryType" value="econt"> До офис на Еконт</label>
          <label><input type="radio" name="deliveryType" value="speedy"> До офис на Спиди</label>
        </div>
      </div>
      <div id="addressContainer">
        <input type="text" id="customerAddress" placeholder="Въведете адрес или офис">
      </div>
      <div class="note-container">
        <textarea id="customerNote" placeholder="Бележка към поръчката"></textarea>
      </div>
      <div class="form-buttons">
        <button id="submitOrder" class="primary-btn">Изпрати поръчката</button>
        <button id="cancelOrder" class="secondary-btn">Откажи</button>
      </div>
    </div>
  `;

  const deliveryRadios = document.querySelectorAll('input[name="deliveryType"]');
  const addressInput = document.getElementById("customerAddress");

  deliveryRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (radio.value === "home") addressInput.placeholder = "Въведете адрес за доставка";
      else addressInput.placeholder = `Въведете офис на ${radio.value === "econt" ? "Еконт" : "Спиди"}`;
    });
  });

  document.getElementById("cancelOrder").addEventListener("click", openCart);
  document.getElementById("submitOrder").addEventListener("click", submitOrder);
}

async function submitOrder() {
  const name = document.getElementById("customerName").value.trim();
  const address = document.getElementById("customerAddress").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const email = document.getElementById("customerEmail").value.trim();
  const note = document.getElementById("customerNote").value.trim();

  if (!name || !address || !phone || !email) {
    alert("Моля, попълнете всички полета!");
    return;
  }

  const totalBGN = cart.reduce((sum, p) => sum + p.priceBGN * p.quantity, 0);

  const order = {
    customerName: name,
    customerAddress: address,
    customerPhone: phone,
    customerEmail: email,
    note,
    products: cart.map((p) => ({
      name: p.name,
      priceBGN: p.priceBGN,
      quantity: p.quantity,
      image: p.image,
    })),
    totalPrice: totalBGN,
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    if (!res.ok) throw new Error("Грешка при изпращане");
    alert("✅ Поръчката е изпратена успешно!");
    cart = [];
    updateCartIcon();
    renderProducts();
  } catch (err) {
    alert("❌ Неуспешно изпращане!");
  }
}

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    buttons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderProducts(btn.dataset.cat);
  });
});

window.addEventListener("DOMContentLoaded", () => {
  const cartIcon = document.getElementById("cartIcon");
  if (cartIcon) cartIcon.addEventListener("click", openCart);
  renderProducts();
});