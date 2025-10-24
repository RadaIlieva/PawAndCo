// ---------- Секция за превключване ----------

const calendarBtn = document.getElementById("calendarBtn");
const productsBtn = document.getElementById("productsBtn");
const calendarSection = document.getElementById("calendarSection");
const productsSection = document.getElementById("productsSection");

calendarBtn.addEventListener("click", () => {
  calendarBtn.classList.add("active");
  productsBtn.classList.remove("active");
  calendarSection.classList.remove("hidden");
  productsSection.classList.add("hidden");
});

productsBtn.addEventListener("click", () => {
  productsBtn.classList.add("active");
  calendarBtn.classList.remove("active");
  productsSection.classList.remove("hidden");
  calendarSection.classList.add("hidden");
});

// ---------- ПРОДУКТИ ----------

let products = [];

const form = document.getElementById("productForm");
const list = document.getElementById("adminProducts");
const eurPrice = document.getElementById("eurPrice");

const nameInput = document.getElementById("name");
const descriptionInput = document.getElementById("description");
const categoryInput = document.getElementById("category");
const priceInput = document.getElementById("price");
const imageInput = document.getElementById("image");
const editIdInput = document.getElementById("editId");

// Конвертиране на лв в евро при въвеждане
priceInput.addEventListener("input", () => {
  const eur = (priceInput.value / 1.96).toFixed(2);
  eurPrice.textContent = `≈ ${eur} €`;
});

// Зареждане на продуктите от бекенда
async function loadProducts() {
  try {
    const res = await fetch("http://localhost:5000/api/products");
    if (!res.ok) throw new Error("Неуспешно зареждане на продуктите");
    products = await res.json();
    renderProducts();
  } catch (err) {
    console.error("Грешка при зареждане на продукти:", err);
    list.innerHTML = "<p>Неуспешно зареждане на продуктите.</p>";
  }
}

// Добавяне / редакция на продукт
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("name", nameInput.value);
  formData.append("description", descriptionInput.value);
  formData.append("category", categoryInput.value);
  formData.append("priceBGN", priceInput.value);
  if (imageInput.files[0]) formData.append("image", imageInput.files[0]);

  const url = editIdInput.value
    ? `http://localhost:5000/api/products/${editIdInput.value}`
    : "http://localhost:5000/api/products";
  const method = editIdInput.value ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      body: formData
    });
    if (!res.ok) throw new Error("Грешка при запис на продукта");

    form.reset();
    eurPrice.textContent = "";
    editIdInput.value = "";
    loadProducts();
  } catch (err) {
    alert(err.message);
  }
});

// Рендиране на продуктите
function renderProducts() {
  list.innerHTML = "";
  products.forEach(p => {
    const eur = (p.priceBGN / 1.96).toFixed(2);
    const card = document.createElement("div");
    card.classList.add("product-card");
    card.dataset.id = p._id;
    card.innerHTML = `
      <img src="http://localhost:5000${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <p><b>${p.priceBGN} лв</b> (${eur} €)</p>
      <p><i>${p.category}</i></p>
      <div class="btn-group">
        <button onclick="editProduct('${p._id}')">✏️</button>
        <button onclick="deleteProduct('${p._id}')" class="delete-btn">🗑️</button>
      </div>
    `;
    list.appendChild(card);
  });
}

// Редакция на продукт
window.editProduct = function(id) {
  const p = products.find(p => p._id === id);
  if (!p) return;
  nameInput.value = p.name;
  descriptionInput.value = p.description;
  categoryInput.value = p.category;
  priceInput.value = p.priceBGN;
  editIdInput.value = p._id;
  eurPrice.textContent = `≈ ${(p.priceBGN / 1.96).toFixed(2)} €`;
};

// Изтриване на продукт
window.deleteProduct = async function(id) {
  if (!confirm("Сигурни ли сте, че искате да изтриете продукта?")) return;

  try {
    const res = await fetch(`http://localhost:5000/api/products/${id}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Грешка при изтриване на продукта");
    loadProducts();
  } catch (err) {
    alert(err.message);
  }
};

// ---------- Поръчки ----------
async function loadOrders() {
  try {
    const res = await fetch("http://localhost:5000/api/orders");
    if (!res.ok) throw new Error("Неуспешно зареждане на поръчките");
    const orders = await res.json();
    const ordersList = document.getElementById("ordersList");
    ordersList.innerHTML = "";

    if (orders.length === 0) {
      ordersList.innerHTML = "<p>Няма направени поръчки.</p>";
      return;
    }

    orders.forEach(order => {
      const div = document.createElement("div");
      div.classList.add("order-item");
      div.innerHTML = `
        <p><b>Дата:</b> ${new Date(order.date).toLocaleString()}</p>
        <p><b>Клиент:</b> ${order.customerName}</p>
        <p><b>Телефон:</b> ${order.customerPhone}</p>
        <p><b>Имейл:</b> ${order.customerEmail}</p>
        <p><b>Адрес/Офис:</b> ${order.customerAddress}</p>
        <p><b>Общо:</b> ${order.totalPrice} лв</p>
        <ul>
          ${order.products.map(p => `<li>${p.name} (${p.quantity} бр. × ${p.priceBGN} лв)</li>`).join("")}
        </ul>
      `;
      ordersList.appendChild(div);
    });
  } catch (err) {
    console.error("Грешка при зареждане на поръчки:", err);
  }
}


// Автоматично обновяване на поръчките на всеки 10 секунди
setInterval(loadOrders, 10000);

// Стартиране
loadProducts();
loadOrders();
