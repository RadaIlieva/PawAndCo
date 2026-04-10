let products = [];

const list = document.getElementById("adminProducts");
const form = document.getElementById("productForm");

const nameInput = document.getElementById("name");
const descriptionInput = document.getElementById("description");
const categoryInput = document.getElementById("category");
const priceInput = document.getElementById("price");
const imageInput = document.getElementById("image");
const editIdInput = document.getElementById("editId");
const eurPrice = document.getElementById("eurPrice");

const API_BASE_URL = window.location.origin;

// ---------- LOAD ----------
window.loadProducts = async function () {
  const res = await fetch(`${API_BASE_URL}/api/products`);
  products = await res.json();
  renderProducts();
};

// ---------- RENDER (КАТО USER PAGE) ----------
function renderProducts() {
  list.innerHTML = "";

  products.forEach(p => {
    const eur = (p.priceBGN / 1.96).toFixed(2);

    const card = document.createElement("div");
    card.classList.add("product-card");

    card.innerHTML = `
      <img src="${API_BASE_URL}${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <p class="price">${eur} € (${p.priceBGN} лв)</p>

      <div class="btn-group">
        <button onclick="editProduct('${p._id}')">✏️</button>
        <button class="delete-btn" onclick="deleteProduct('${p._id}')">🗑️</button>
      </div>
    `;

    list.appendChild(card);
  });
}

// ---------- CREATE / UPDATE ----------
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const priceBGN = (parseFloat(priceInput.value) * 1.96).toFixed(2);

  const formData = new FormData();
  formData.append("name", nameInput.value);
  formData.append("description", descriptionInput.value);
  formData.append("category", categoryInput.value);
  formData.append("priceBGN", priceBGN);

  if (imageInput.files[0]) {
    formData.append("image", imageInput.files[0]);
  }

  const id = editIdInput.value;
  const url = id ? `/api/products/${id}` : `/api/products`;
  const method = id ? "PUT" : "POST";

  await fetch(url, { method, body: formData });

  form.reset();
  editIdInput.value = "";

  loadProducts();
});

// ---------- EDIT ----------
window.editProduct = function (id) {
  const p = products.find(x => x._id === id);

  nameInput.value = p.name;
  descriptionInput.value = p.description;
  categoryInput.value = p.category;
  priceInput.value = (p.priceBGN / 1.96).toFixed(2);
  editIdInput.value = id;

  window.scrollTo({ top: 0, behavior: "smooth" });
};

// ---------- DELETE ----------
window.deleteProduct = async function (id) {
  if (!confirm("Сигурен ли си?")) return;

  await fetch(`/api/products/${id}`, { method: "DELETE" });
  loadProducts();
};

// ---------- PRICE ----------
priceInput.addEventListener("input", () => {
  const val = parseFloat(priceInput.value);
  eurPrice.textContent = isNaN(val) ? "" : `≈ ${(val * 1.96).toFixed(2)} лв`;
});