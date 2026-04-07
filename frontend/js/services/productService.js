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
  try {
    const res = await fetch(`${API_BASE_URL}/api/products`);
    if (!res.ok) throw new Error("Грешка");

    products = await res.json();
    renderProducts();

  } catch (err) {
    console.error(err);
    list.innerHTML = "<p>⚠️ Грешка при зареждане</p>";
  }
};

// ---------- RENDER ----------
function renderProducts() {
  if (!list) return;

  list.innerHTML = "";

  if (products.length === 0) {
    list.innerHTML = "<p>Няма продукти</p>";
    return;
  }

  products.forEach(p => {
    const eur = (p.priceBGN / 1.96).toFixed(2);

    const imgUrl = p.image ? `${API_BASE_URL}${p.image}` : "";

    const card = document.createElement("div");
    card.classList.add("product-card");

    card.innerHTML = `
      ${p.image ? `<img src="${imgUrl}" width="100">` : ""}
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <p>${eur} € (${p.priceBGN} лв)</p>
      <p>${p.category}</p>

      <button onclick="editProduct('${p._id}')">✏️</button>
      <button onclick="deleteProduct('${p._id}')">🗑️</button>
    `;

    list.appendChild(card);
  });
}

// ---------- CREATE / UPDATE ----------
if (form) {
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

    window.loadProducts();
  });
}

// ---------- EDIT ----------
window.editProduct = function (id) {
  const p = products.find(p => p._id === id);
  if (!p) return;

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
  window.loadProducts();
};

// ---------- PRICE PREVIEW ----------
if (priceInput) {
  priceInput.addEventListener("input", () => {
    const val = parseFloat(priceInput.value);
    eurPrice.textContent = isNaN(val) ? "" : `≈ ${(val * 1.96).toFixed(2)} лв`;
  });
}