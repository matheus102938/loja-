/* =========================================================
   ZABELLA - SCRIPT SUPABASE
   ========================================================= */

const SUPABASE_URL = "https://hnlqqwzvungcjbjzfqsi.supabase.co";
const SUPABASE_KEY = "sb_publishable_GlJTgvIEDv5pNJSlxsA2Ww_lRR3qGUD";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

let settings = {
  whatsapp: "5511999999999",
  instagram: "zabellaoficial",
  email: "contato@zabella.com"
};

let products = [];
let cart = JSON.parse(localStorage.getItem("zabellaCart") || "[]");
let logged = localStorage.getItem("zabellaAdmin") === "1";

const ADMIN_PASSWORD = "zabella123";

const money = value =>
  Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

const WA = () =>
  String(settings.whatsapp || "").replace(/\D/g, "");

function toast(message) {
  const element = document.getElementById("toast");

  if (!element) {
    alert(message);
    return;
  }

  element.textContent = message;
  element.classList.add("show");

  setTimeout(() => {
    element.classList.remove("show");
  }, 2200);
}

function showPage(id) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.add("hidden");
  });

  const page = document.getElementById(id);

  if (page) {
    page.classList.remove("hidden");
  }

  if (id === "shop") {
    renderShop();
  }

  if (id === "admin") {
    renderAdmin();
  }

  window.scrollTo(0, 0);
}

/* =========================
   CONTATOS
   ========================= */

function instagramUrl(value) {
  const v = String(value || "").trim();

  if (!v) return "#";

  if (
    v.startsWith("http://") ||
    v.startsWith("https://")
  ) {
    return v;
  }

  return "https://instagram.com/" +
    v.replace(/^@/, "");
}

async function loadContacts() {
  try {
    const { data, error } =
      await supabaseClient
        .from("store_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

    if (error) throw error;

    if (data) {
      settings.whatsapp =
        data.whatsapp || settings.whatsapp;

      settings.instagram =
        data.instagram || settings.instagram;

      settings.email =
        data.email || settings.email;
    }

  } catch (error) {
    console.error(
      "Erro ao carregar contatos:",
      error
    );
  }

  renderContacts();
}

function renderContacts() {
  const whatsapp =
    document.getElementById("publicWhatsapp");

  const instagram =
    document.getElementById("publicInstagram");

  const email =
    document.getElementById("publicEmail");

  if (whatsapp) {
    whatsapp.href =
      `https://wa.me/${WA()}`;

    whatsapp.target = "_blank";
  }

  if (instagram) {
    instagram.href =
      instagramUrl(settings.instagram);

    instagram.target = "_blank";
  }

  if (email) {
    email.href =
      `mailto:${settings.email}`;
  }

  const inputWhatsapp =
    document.getElementById(
      "settingWhatsapp"
    );

  const inputInstagram =
    document.getElementById(
      "settingInstagram"
    );

  const inputEmail =
    document.getElementById(
      "settingEmail"
    );

  if (inputWhatsapp) {
    inputWhatsapp.value =
      settings.whatsapp;
  }

  if (inputInstagram) {
    inputInstagram.value =
      settings.instagram;
  }

  if (inputEmail) {
    inputEmail.value =
      settings.email;
  }
}

async function saveContacts() {
  const whatsapp =
    document
      .getElementById("settingWhatsapp")
      .value
      .trim();

  const instagram =
    document
      .getElementById("settingInstagram")
      .value
      .trim();

  const email =
    document
      .getElementById("settingEmail")
      .value
      .trim();

  if (!whatsapp || !instagram || !email) {
    toast("Preencha todos os contatos");
    return;
  }

  try {
    const { error } =
      await supabaseClient
        .from("store_settings")
        .upsert(
          {
            id: 1,
            whatsapp,
            instagram,
            email
          },
          {
            onConflict: "id"
          }
        );

    if (error) throw error;

    settings = {
      whatsapp,
      instagram,
      email
    };

    renderContacts();

    toast("Contatos salvos!");

  } catch (error) {

    console.error(error);

    toast("Erro ao salvar contatos");
  }
}

/* =========================
   PRODUTOS
   ========================= */

function convertProduct(row) {
  return {
    id: row.id,
    name: row.name,
    cat: row.category,
    desc: row.description,
    price: Number(row.price),
    stock: Number(row.stock),

    sizes: Array.isArray(row.sizes)
      ? row.sizes
      : [],

    image:
      row.image_url ||
      "imagens/produto-vestido.jpg",

    featured:
      Boolean(row.featured)
  };
}

async function loadProducts() {
  try {

    const { data, error } =
      await supabaseClient
        .from("products")
        .select("*")
        .order(
          "created_at",
          {
            ascending: false
          }
        );

    if (error) throw error;

    products =
      (data || []).map(convertProduct);

    renderHome();
    renderShop();
    renderAdmin();
    updateCart();

  } catch (error) {

    console.error(
      "Erro ao carregar produtos:",
      error
    );

    products = [];

    renderHome();
    renderShop();
    renderAdmin();
    updateCart();

    toast(
      "Erro ao conectar ao banco"
    );
  }
}

/* =========================
   PRODUTO CARD
   ========================= */

function productCard(product) {

  const sizes =
    product.sizes || [];

  return `
    <article class="product">

      <img
        src="${product.image}"
        alt="${product.name}"
      >

      <div class="product-info">

        <h3>
          ${product.name}
        </h3>

        <p class="desc">
          ${product.desc}
        </p>

        <div class="sizes">

          ${sizes.map(size => `
            <span class="size">
              ${size}
            </span>
          `).join("")}

        </div>

        <p class="price">
          ${money(product.price)}
        </p>

        <div class="actions">

          <button
            class="details"
            onclick="details(${product.id})"
          >
            Detalhes
          </button>

          <button
            class="buy"
            onclick="
              add(
                ${product.id},
                '${sizes[0] || ""}'
              )
            "
            ${product.stock <= 0
              ? "disabled"
              : ""}
          >
            ${
              product.stock > 0
                ? "Adicionar"
                : "Sem estoque"
            }
          </button>

        </div>

      </div>

    </article>
  `;
}

/* =========================
   HOME
   ========================= */

function renderHome() {

  const container =
    document.getElementById(
      "homeProducts"
    );

  if (!container) return;

  container.innerHTML =
    products
      .filter(
        product => product.featured
      )
      .slice(0, 4)
      .map(productCard)
      .join("");
}

/* =========================
   LOJA
   ========================= */

function renderShop() {

  const container =
    document.getElementById(
      "shopProducts"
    );

  const filter =
    document.getElementById(
      "filter"
    );

  const sort =
    document.getElementById(
      "sort"
    );

  if (
    !container ||
    !filter ||
    !sort
  ) {
    return;
  }

  let list =
    [...products];

  if (
    filter.value !== "todos"
  ) {
    list =
      list.filter(
        product =>
          product.cat ===
          filter.value
      );
  }

  if (
    sort.value === "low"
  ) {
    list.sort(
      (a, b) =>
        a.price - b.price
    );
  }

  if (
    sort.value === "high"
  ) {
    list.sort(
      (a, b) =>
        b.price - a.price
    );
  }

  container.innerHTML =
    list
      .map(productCard)
      .join("");
}

/* =========================
   LOGIN
   ========================= */

function login() {

  const password =
    document
      .getElementById(
        "adminPass"
      )
      .value;

  if (
    password ===
    ADMIN_PASSWORD
  ) {

    logged = true;

    localStorage.setItem(
      "zabellaAdmin",
      "1"
    );

    toast(
      "Login realizado!"
    );

    renderAdmin();

  } else {

    toast(
      "Senha incorreta"
    );

  }
}

function logout() {

  logged = false;

  localStorage.removeItem(
    "zabellaAdmin"
  );

  renderAdmin();
}

/* =========================
   ADMIN
   ========================= */

function renderAdmin() {

  renderContacts();

  const loginBox =
    document.getElementById(
      "loginBox"
    );

  const adminPanel =
    document.getElementById(
      "adminPanel"
    );

  if (
    !loginBox ||
    !adminPanel
  ) {
    return;
  }

  loginBox.classList.toggle(
    "hidden",
    logged
  );

  adminPanel.classList.toggle(
    "hidden",
    !logged
  );

  if (!logged) return;

  const statProducts =
    document.getElementById(
      "statProducts"
    );

  const statStock =
    document.getElementById(
      "statStock"
    );

  const statFeatured =
    document.getElementById(
      "statFeatured"
    );

  if (statProducts) {
    statProducts.textContent =
      products.length;
  }

  if (statStock) {
    statStock.textContent =
      products.reduce(
        (total, product) =>
          total +
          Number(
            product.stock || 0
          ),
        0
      );
  }

  if (statFeatured) {
    statFeatured.textContent =
      products.filter(
        product =>
          product.featured
      ).length;
  }

  const container =
    document.getElementById(
      "adminProducts"
    );

  if (!container) return;

  container.innerHTML =
    products.map(product => `

      <div class="admin-item">

        <img
          src="${product.image}"
          alt="${product.name}"
        >

        <div>

          <h3>
            ${product.name}
          </h3>

          <p>
            ${money(product.price)}
            • estoque:
            ${product.stock}

            <br>

            ${product.cat}
          </p>

        </div>

        <div>

          <button
            class="edit"
            onclick="
              edit(${product.id})
            "
          >
            Editar
          </button>

          <button
            class="delete"
            onclick="
              del(${product.id})
            "
          >
            Excluir
          </button>

        </div>

      </div>

    `).join("");
}
/* =========================
   UPLOAD DA FOTO
   ========================= */

async function uploadImage(file) {

  const extension =
    file.name.split(".").pop() || "jpg";

  const filename =
    `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${extension}`;

  const { error } =
    await supabaseClient.storage
      .from("products")
      .upload(
        filename,
        file,
        {
          cacheControl: "3600",
          upsert: false
        }
      );

  if (error) {
    throw error;
  }

  const { data } =
    supabaseClient.storage
      .from("products")
      .getPublicUrl(filename);

  return data.publicUrl;
}


/* =========================
   SALVAR PRODUTO
   ========================= */

async function saveProduct(event) {

  event.preventDefault();

  if (!logged) {
    toast("Faça login primeiro");
    return;
  }

  const idValue =
    document.getElementById("editId").value;

  const id =
    idValue ? Number(idValue) : null;

  const file =
    document.getElementById("photo").files[0];

  try {

    let image =
      "imagens/produto-vestido.jpg";

    /*
      Se estiver editando e não escolher
      uma nova foto, mantém a foto antiga.
    */

    if (id) {

      const oldProduct =
        products.find(
          product => product.id === id
        );

      if (oldProduct) {
        image = oldProduct.image;
      }
    }

    /*
      Se escolher uma foto nova,
      envia para o Storage.
    */

    if (file) {
      image = await uploadImage(file);
    }

    const product = {

      name:
        document
          .getElementById("name")
          .value
          .trim(),

      category:
        document
          .getElementById("category")
          .value,

      description:
        document
          .getElementById("description")
          .value
          .trim(),

      price:
        Number(
          document
            .getElementById("price")
            .value
        ),

      stock:
        Number(
          document
            .getElementById("stock")
            .value
        ),

      sizes:
        document
          .getElementById("sizes")
          .value
          .split(",")
          .map(size => size.trim())
          .filter(Boolean),

      image_url: image,

      featured:
        document
          .getElementById("featured")
          .checked
    };


    /* EDITAR */

    if (id) {

      const { error } =
        await supabaseClient
          .from("products")
          .update(product)
          .eq("id", id);

      if (error) {
        throw error;
      }

      toast("Produto atualizado!");

    }

    /* NOVO PRODUTO */

    else {

      const { error } =
        await supabaseClient
          .from("products")
          .insert(product);

      if (error) {
        throw error;
      }

      toast("Produto adicionado!");

    }

    resetForm();

    await loadProducts();

  } catch (error) {

    console.error(
      "Erro ao salvar produto:",
      error
    );

    toast(
      "Erro ao salvar produto"
    );
  }
}


/* =========================
   EDITAR PRODUTO
   ========================= */

function edit(id) {

  const product =
    products.find(
      item => item.id === id
    );

  if (!product) {
    return;
  }

  document.getElementById(
    "editId"
  ).value = product.id;

  document.getElementById(
    "name"
  ).value = product.name;

  document.getElementById(
    "category"
  ).value = product.cat;

  document.getElementById(
    "description"
  ).value = product.desc;

  document.getElementById(
    "price"
  ).value = product.price;

  document.getElementById(
    "stock"
  ).value = product.stock;

  document.getElementById(
    "sizes"
  ).value =
    product.sizes.join(", ");

  document.getElementById(
    "featured"
  ).checked =
    product.featured;

  document.getElementById(
    "formTitle"
  ).textContent =
    "Editar roupa";

  document
    .getElementById("productForm")
    .scrollIntoView({
      behavior: "smooth"
    });
}


/* =========================
   EXCLUIR PRODUTO
   ========================= */

async function del(id) {

  if (!logged) {
    toast("Faça login primeiro");
    return;
  }

  if (
    !confirm(
      "Excluir este produto?"
    )
  ) {
    return;
  }

  try {

    const { error } =
      await supabaseClient
        .from("products")
        .delete()
        .eq("id", id);

    if (error) {
      throw error;
    }

    products =
      products.filter(
        product =>
          product.id !== id
      );

    renderHome();
    renderShop();
    renderAdmin();
    updateCart();

    toast(
      "Produto excluído!"
    );

  } catch (error) {

    console.error(error);

    toast(
      "Erro ao excluir produto"
    );
  }
}


/* =========================
   LIMPAR FORMULÁRIO
   ========================= */

function resetForm() {

  const form =
    document.getElementById(
      "productForm"
    );

  if (form) {
    form.reset();
  }

  const editId =
    document.getElementById(
      "editId"
    );

  if (editId) {
    editId.value = "";
  }

  const title =
    document.getElementById(
      "formTitle"
    );

  if (title) {
    title.textContent =
      "Adicionar roupa";
  }

  const preview =
    document.getElementById(
      "photoPreview"
    );

  if (preview) {
    preview.innerHTML = "";
  }
}


/* =========================
   DETALHES
   ========================= */

function details(id) {

  const product =
    products.find(
      item => item.id === id
    );

  if (!product) {
    return;
  }

  const modalContent =
    document.getElementById(
      "modalContent"
    );

  if (!modalContent) {
    return;
  }

  modalContent.innerHTML = `

    <div class="modal-product">

      <img
        src="${product.image}"
        alt="${product.name}"
      >

      <div>

        <span class="eyebrow">
          ${product.cat}
        </span>

        <h2>
          ${product.name}
        </h2>

        <p>
          ${product.desc}
        </p>

        <h3>
          ${money(product.price)}
        </h3>

        <p>
          Estoque disponível:
          ${product.stock}
        </p>

        <div class="sizes">

          ${
            product.sizes.map(size => `

              <button
                class="size"
                onclick="
                  add(
                    ${product.id},
                    '${size}'
                  );
                  closeModal();
                "
                ${
                  product.stock <= 0
                    ? "disabled"
                    : ""
                }
              >
                Tamanho ${size}
              </button>

            `).join("")
          }

        </div>

      </div>

    </div>

  `;

  document
    .getElementById(
      "productModal"
    )
    .classList.remove(
      "hidden"
    );
}


function closeModal() {

  document
    .getElementById(
      "productModal"
    )
    .classList.add(
      "hidden"
    );
}


/* =========================
   CARRINHO
   ========================= */

function saveCart() {

  localStorage.setItem(
    "zabellaCart",
    JSON.stringify(cart)
  );
}


function add(id, size) {

  const product =
    products.find(
      item => item.id === id
    );

  if (!product) {
    return;
  }

  if (product.stock <= 0) {

    toast(
      "Produto sem estoque"
    );

    return;
  }

  const item =
    cart.find(
      item =>
        item.id === id &&
        item.size === size
    );

  if (item) {

    if (
      item.qty >=
      Number(product.stock)
    ) {

      toast(
        "Limite do estoque atingido"
      );

      return;
    }

    item.qty++;

  } else {

    cart.push({
      id: id,
      size: size,
      qty: 1
    });

  }

  saveCart();

  updateCart();

  toast(
    "Produto adicionado ao carrinho"
  );
}


function updateCart() {

  const count =
    document.getElementById(
      "count"
    );

  if (count) {

    count.textContent =
      cart.reduce(
        (total, item) =>
          total + item.qty,
        0
      );

  }

  const container =
    document.getElementById(
      "cartItems"
    );

  const totalElement =
    document.getElementById(
      "total"
    );

  if (!container) {
    return;
  }

  if (!cart.length) {

    container.innerHTML = `
      <p style="
        padding:30px;
        color:#817a72;
        text-align:center;
      ">
        Carrinho vazio.
      </p>
    `;

    if (totalElement) {
      totalElement.textContent =
        money(0);
    }

    return;
  }

  let total = 0;

  container.innerHTML =
    cart.map(item => {

      const product =
        products.find(
          p => p.id === item.id
        );

      if (!product) {
        return "";
      }

      total +=
        product.price *
        item.qty;

      return `

        <div class="cart-item">

          <img
            src="${product.image}"
            alt="${product.name}"
          >

          <div>

            <h4>
              ${product.name}
            </h4>

            <small>
              Tamanho:
              ${item.size}
              <br>
              ${money(product.price)}
            </small>

            <div class="qty">

              <button
                onclick="
                  change(
                    ${item.id},
                    '${item.size}',
                    -1
                  )
                "
              >
                −
              </button>

              ${item.qty}

              <button
                onclick="
                  change(
                    ${item.id},
                    '${item.size}',
                    1
                  )
                "
              >
                +
              </button>

            </div>

          </div>

          <button
            onclick="
              removeCart(
                ${item.id},
                '${item.size}'
              )
            "
            style="
              border:0;
              background:none;
              color:#a44;
            "
          >
            ×
          </button>

        </div>

      `;

    }).join("");

  if (totalElement) {

    totalElement.textContent =
      money(total);

  }
}


function change(
  id,
  size,
  amount
) {

  const item =
    cart.find(
      item =>
        item.id === id &&
        item.size === size
    );

  const product =
    products.find(
      product =>
        product.id === id
    );

  if (!item || !product) {
    return;
  }

  item.qty += amount;

  if (
    item.qty >
    Number(product.stock)
  ) {

    item.qty =
      Number(product.stock);

    toast(
      "Quantidade máxima em estoque"
    );
  }

  if (item.qty <= 0) {

    cart =
      cart.filter(
        item =>
          !(
            item.id === id &&
            item.size === size
          )
      );

  }

  saveCart();

  updateCart();
}


function removeCart(
  id,
  size
) {

  cart =
    cart.filter(
      item =>
        !(
          item.id === id &&
          item.size === size
        )
    );

  saveCart();

  updateCart();
}


function openCart() {

  updateCart();

  document
    .getElementById(
      "cartPanel"
    )
    .classList.add(
      "open"
    );

  document
    .getElementById(
      "overlay"
    )
    .classList.add(
      "open"
    );
}


function closeCart() {

  document
    .getElementById(
      "cartPanel"
    )
    .classList.remove(
      "open"
    );

  document
    .getElementById(
      "overlay"
    )
    .classList.remove(
      "open"
    );
}


/* =========================
   WHATSAPP
   ========================= */

function checkout() {

  if (!cart.length) {

    toast(
      "Carrinho vazio"
    );

    return;
  }

  let message =
    "Olá! Quero fazer um pedido na Zabella:\n\n";

  let total = 0;

  cart.forEach(item => {

    const product =
      products.find(
        p => p.id === item.id
      );

    if (!product) {
      return;
    }

    total +=
      product.price *
      item.qty;

    message +=
      `• ${product.name} — ` +
      `Tamanho ${item.size} — ` +
      `${item.qty}x\n`;

  });

  message +=
    `\nTotal: ${money(total)}`;

  const url =
    `https://wa.me/${WA()}` +
    `?text=${encodeURIComponent(message)}`;

  window.open(
    url,
    "_blank"
  );
}


/* =========================
   INICIAR
   ========================= */

async function startSite() {

  if (
    SUPABASE_URL.includes(
      "COLE_AQUI"
    ) ||
    SUPABASE_KEY.includes(
      "COLE_AQUI"
    )
  ) {

    console.warn(
      "Configure o Supabase."
    );

    renderHome();
    renderShop();
    renderContacts();
    renderAdmin();
    updateCart();

    toast(
      "Configure o Supabase no script-supabase.js"
    );

    return;
  }

  await loadContacts();

  await loadProducts();

  renderContacts();

  renderAdmin();

  updateCart();
}

startSite();
