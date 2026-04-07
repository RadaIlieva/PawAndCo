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

// ---------- ЗАРЕЖДАНЕ НА ПРОДУКТИ (ГЛОБАЛНА ФУНКЦИЯ) ----------
window.loadProducts = async function () {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products`);
    if (!res.ok) throw new Error("Неуспешно зареждане");
    products = await res.json();
    renderAdminProductsList(); // Извикваме специфичното рендиране за админ
  } catch (err) {
    console.error("Грешка при зареждане:", err);
    if (list) list.innerHTML = "<p>⚠️ Неуспешно зареждане на продуктите.</p>";
  }
};

// ---------- РЕНДИРАНЕ НА ПРОДУКТИ (ADMIN VIEW) ----------
function renderAdminProductsList() {
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
    
    // Проверка за пътя на изображението
    const imgUrl = p.image?.startsWith("http") ? p.image : `${API_BASE_URL}${p.image}`;

    card.innerHTML = `
      ${p.image ? `<img src="${imgUrl}" alt="${p.name}" style="width:100px; height:auto;">` : ""}
      <div class="product-info">
        <h3>${p.name}</h3>
        <p>${p.description || "Без описание"}</p>
        <p><b>${eur} €</b> (${p.priceBGN} лв)</p>
        <p><small>Категория: ${p.category || "Няма"}</small></p>
      </div>
      <div class="btn-group">
        <button type="button" onclick="editProduct('${p._id}')">✏️ Редактирай</button>
        <button type="button" onclick="deleteProduct('${p._id}')" class="delete-btn">🗑️ Изтрий</button>
      </div>
    `;
    list.appendChild(card);
  });
}

// ---------- СЪЗДАВАНЕ / РЕДАКЦИЯ НА ПРОДУКТ ----------
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const priceInEUR = parseFloat(priceInput.value);
    const priceInBGN = (priceInEUR * 1.96).toFixed(2);

    const formData = new FormData();
    formData.append("name", nameInput.value);
    formData.append("description", descriptionInput.value);
    formData.append("category", categoryInput.value);
    formData.append("priceBGN", priceInBGN);

    if (imageInput.files[0]) {
      formData.append("image", imageInput.files[0]);
    }

    const id = editIdInput.value;
    const url = id ? `${API_BASE_URL}/api/products/${id}` : `${API_BASE_URL}/api/products`;
    const method = id ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, body: formData });
      if (!res.ok) throw new Error(await res.text());

      alert(id ? "✅ Продуктът е редактиран успешно!" : "✅ Продуктът е добавен успешно!");
      
      form.reset();
      if (eurPrice) eurPrice.textContent = ""; 
      editIdInput.value = "";
      window.loadProducts(); // Презареждаме списъка
    } catch (err) {
      console.error("Грешка при запис:", err);
      alert("⚠️ " + err.message);
    }
  });
}

// Помощна функция за цена в реално време
if (priceInput) {
    priceInput.addEventListener("input", () => {
        const val = parseFloat(priceInput.value);
        if (!isNaN(val) && eurPrice) {
            eurPrice.textContent = `≈ ${(val * 1.96).toFixed(2)} лв.`;
        } else if (eurPrice) {
            eurPrice.textContent = "";
        }
    });
}

// ---------- ПОДГОТОВКА ЗА РЕДАКЦИЯ (ГЛОБАЛНА) ----------
window.editProduct = function (id) {
  const p = products.find((p) => p._id === id);
  if (!p) return;

  const priceInEUR = (p.priceBGN / 1.96).toFixed(2);

  nameInput.value = p.name;
  descriptionInput.value = p.description;
  categoryInput.value = p.category;
  priceInput.value = priceInEUR;
  editIdInput.value = p._id;

  if (eurPrice) eurPrice.textContent = `≈ ${p.priceBGN} лв.`;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// ---------- ИЗТРИВАНЕ НА ПРОДУКТ (ГЛОБАЛНА) ----------
window.deleteProduct = async function (id) {
  if (!confirm("Сигурни ли сте, че искате да изтриете този продукт?")) return;
  try {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Грешка при триене");
    alert("✅ Продуктът е изтрит!");
    window.loadProducts();
  } catch (err) {
    alert("⚠️ " + err.message);
  }
};