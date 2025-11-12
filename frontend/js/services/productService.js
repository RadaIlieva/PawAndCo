// ---------- ГЛОБАЛНИ ПРЕМЕНЛИВИ ----------
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

// ---------- СЪЗДАВАНЕ / РЕДАКЦИЯ НА ПРОДУКТ ----------
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", nameInput.value);
    formData.append("description", descriptionInput.value);
    formData.append("category", categoryInput.value);
    formData.append("priceBGN", parseFloat(priceInput.value).toFixed(2));

    if (imageInput.files[0]) {
      formData.append("image", imageInput.files[0]);
    }

    const id = editIdInput.value;
    const url = id
      ? `${API_BASE_URL}/api/products/${id}`
      : `${API_BASE_URL}/api/products`;
    const method = id ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, body: formData });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Грешка при запис на продукта: ${errorText}`);
      }

      alert(id ? "✅ Продуктът е редактиран успешно!" : "✅ Продуктът е добавен успешно!");
      form.reset();
      eurPrice.textContent = "";
      editIdInput.value = "";
      loadProducts();
    } catch (err) {
      console.error("Грешка при запис на продукт:", err);
      alert("⚠️ " + err.message);
    }
  });
}

// ---------- ЗАРЕЖДАНЕ НА ПРОДУКТИ ----------
async function loadProducts() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products`);
    if (!res.ok) throw new Error("Неуспешно зареждане на продуктите");

    products = await res.json();
    renderProducts();
  } catch (err) {
    console.error("Грешка при зареждане на продуктите:", err);
    if (list)
      list.innerHTML = "<p>⚠️ Неуспешно зареждане на продуктите.</p>";
  }
}

// ---------- РЕНДИРАНЕ НА ПРОДУКТИ ----------
function renderProducts() {
  if (!list) return;
  list.innerHTML = "";

  if (products.length === 0) {
    list.innerHTML = "<p>Няма добавени продукти.</p>";
    return;
  }

  products.forEach((p) => {
    const eur = (p.priceBGN / 1.96).toFixed(2);
    const card = document.createElement("div");
    card.classList.add("product-card");
    card.dataset.id = p._id;

    const imgUrl = p.image?.startsWith("http")
      ? p.image
      : `${API_BASE_URL}${p.image}`;

    card.innerHTML = `
      ${p.image ? `<img src="${imgUrl}" alt="${p.name}">` : ""}
      <h3>${p.name}</h3>
      <p>${p.description || "Без описание"}</p>
      <p><b>${p.priceBGN} лв</b> (${eur} €)</p>
      <p><i>${p.category || "Без категория"}</i></p>
      <div class="btn-group">
        <button onclick="editProduct('${p._id}')">✏️</button>
        <button onclick="deleteProduct('${p._id}')" class="delete-btn">🗑️</button>
      </div>
    `;
    list.appendChild(card);
  });
}

// ---------- РЕДАКЦИЯ НА ПРОДУКТ ----------
window.editProduct = function (id) {
  const p = products.find((p) => p._id === id);
  if (!p) return;

  nameInput.value = p.name;
  descriptionInput.value = p.description;
  categoryInput.value = p.category;
  priceInput.value = p.priceBGN;
  editIdInput.value = p._id;
  eurPrice.textContent = `≈ ${(p.priceBGN / 1.96).toFixed(2)} €`;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// ---------- ИЗТРИВАНЕ НА ПРОДУКТ ----------
window.deleteProduct = async function (id) {
  if (!confirm("Сигурни ли сте, че искате да изтриете продукта?")) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Грешка при изтриване на продукта: ${errorText}`);
    }

    alert("✅ Продуктът е изтрит успешно!");
    loadProducts();
  } catch (err) {
    console.error("Грешка при изтриване на продукт:", err);
    alert("⚠️ " + err.message);
  }
};

// ---------- ИНИЦИАЛНО ЗАРЕЖДАНЕ ----------
document.addEventListener("DOMContentLoaded", loadProducts);
