let settings=JSON.parse(localStorage.getItem("zabellaSettings")||"null")||{
 whatsapp:"5511999999999",
 instagram:"zabella",
 email:"contato@zabella.com"
};
const WA=()=>settings.whatsapp.replace(/\\D/g,"");
const defaultProducts=[
{id:1,name:"Vestido Midi de Seda",cat:"Vestidos",desc:"Seda pura com fenda lateral e caimento fluido. Bege areia.",price:589,stock:4,sizes:["P","M","G"],image:"imagens/produto-vestido.jpg",featured:true},
{id:2,name:"Blazer Alfaiataria Linho",cat:"Blazers",desc:"Modelagem oversized em linho off-white, forro leve.",price:749,stock:3,sizes:["P","M","G","GG"],image:"imagens/produto-blazer.jpg",featured:false},
{id:3,name:"Calça Pantalona Terracota",cat:"Calças",desc:"Cintura alta com pregas e barra ampla. Tecido fluido.",price:429,stock:6,sizes:["36","38","40","42"],image:"imagens/produto-calca.jpg",featured:false},
{id:4,name:"Blusa de Seda Marfim",cat:"Blusas",desc:"Gola clássica e botões acetinados. Peça atemporal.",price:349,stock:5,sizes:["P","M","G"],image:"imagens/produto-blusa.jpg",featured:true}
];
let products=JSON.parse(localStorage.getItem("zabellaProducts")||"null")||defaultProducts;
let cart=JSON.parse(localStorage.getItem("zabellaCart")||"[]");
let logged=localStorage.getItem("zabellaAdmin")==="1";

const money=n=>n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
function save(){localStorage.setItem("zabellaProducts",JSON.stringify(products))}
function toast(t){const x=document.getElementById("toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),2200)}
function showPage(id){document.querySelectorAll(".page").forEach(x=>x.classList.add("hidden"));document.getElementById(id).classList.remove("hidden");if(id==="shop")renderShop();if(id==="admin")renderAdmin();scrollTo(0,0)}
function productCard(p){
 return `<article class="product"><img src="${p.image}" alt="${p.name}"><div class="product-info"><h3>${p.name}</h3><p class="desc">${p.desc}</p><div class="sizes">${p.sizes.map(s=>`<span class="size">${s}</span>`).join("")}</div><p class="price">${money(p.price)}</p><div class="actions"><button class="details" onclick="details(${p.id})">Detalhes</button><button class="buy" onclick="add(${p.id},'${p.sizes[0]}')">Adicionar</button></div></div></article>`
}
function renderHome(){document.getElementById("homeProducts").innerHTML=products.filter(p=>p.featured).slice(0,4).map(productCard).join("")}
function renderShop(){
 let list=[...products],f=document.getElementById("filter").value,s=document.getElementById("sort").value;
 if(f!=="todos")list=list.filter(p=>p.cat===f);
 if(s==="low")list.sort((a,b)=>a.price-b.price);if(s==="high")list.sort((a,b)=>b.price-a.price);
 document.getElementById("shopProducts").innerHTML=list.map(productCard).join("");
}

function instagramUrl(value){
 const v=value.trim();
 if(!v)return "#";
 return v.startsWith("http") ? v : "https://instagram.com/"+v.replace(/^@/,"");
}
function renderContacts(){
 const wa=WA();
 const w=document.getElementById("publicWhatsapp");
 const ig=document.getElementById("publicInstagram");
 const em=document.getElementById("publicEmail");
 if(w){w.href=`https://wa.me/${wa}`;w.textContent="WhatsApp →";}
 if(ig){ig.href=instagramUrl(settings.instagram);ig.textContent="Instagram →";}
 if(em){em.href=`mailto:${settings.email}`;em.textContent="E-mail →";}
 const a=document.getElementById("settingWhatsapp");
 const b=document.getElementById("settingInstagram");
 const c=document.getElementById("settingEmail");
 if(a){a.value=settings.whatsapp;b.value=settings.instagram;c.value=settings.email;}
}
function saveContacts(){
 settings={
   whatsapp:document.getElementById("settingWhatsapp").value.trim(),
   instagram:document.getElementById("settingInstagram").value.trim(),
   email:document.getElementById("settingEmail").value.trim()
 };
 if(!settings.whatsapp || !settings.instagram || !settings.email){toast("Preencha os três contatos");return}
 localStorage.setItem("zabellaSettings",JSON.stringify(settings));
 renderContacts();
 toast("Contatos salvos com sucesso");
}

function login(){if(document.getElementById("adminPass").value==="zabella123"){logged=true;localStorage.setItem("zabellaAdmin","1");toast("Login realizado");renderAdmin()}else toast("Senha incorreta")}
function logout(){logged=false;localStorage.removeItem("zabellaAdmin");renderAdmin()}
function renderAdmin(){
 renderContacts();
 document.getElementById("loginBox").classList.toggle("hidden",logged);document.getElementById("adminPanel").classList.toggle("hidden",!logged);if(!logged)return;
 document.getElementById("statProducts").textContent=products.length;document.getElementById("statStock").textContent=products.reduce((a,p)=>a+p.stock,0);document.getElementById("statFeatured").textContent=products.filter(p=>p.featured).length;
 document.getElementById("adminProducts").innerHTML=products.map(p=>`<div class="admin-item"><img src="${p.image}"><div><h3>${p.name}</h3><p>${money(p.price)} • estoque: ${p.stock}<br>${p.cat}</p></div><div><button class="edit" onclick="edit(${p.id})">Editar</button><button class="delete" onclick="del(${p.id})">Excluir</button></div></div>`).join("");
}
function saveProduct(e){
 e.preventDefault();
 const id=Number(document.getElementById("editId").value),file=document.getElementById("photo").files[0];
 const finish=image=>{
  const data={id:id||Date.now(),name:document.getElementById("name").value,cat:document.getElementById("category").value,desc:document.getElementById("description").value,price:Number(document.getElementById("price").value),stock:Number(document.getElementById("stock").value),sizes:document.getElementById("sizes").value.split(",").map(x=>x.trim()).filter(Boolean),image:image||"imagens/produto-vestido.jpg",featured:document.getElementById("featured").checked};
  if(id)products=products.map(p=>p.id===id?data:p);else products.push(data);save();resetForm();renderAdmin();renderHome();renderShop();toast(id?"Produto atualizado":"Produto adicionado");
 };
 if(file){const r=new FileReader();r.onload=()=>finish(r.result);r.readAsDataURL(file)}else{const old=products.find(p=>p.id===id);finish(old?.image)}
}
function edit(id){const p=products.find(x=>x.id===id);document.getElementById("editId").value=p.id;document.getElementById("name").value=p.name;document.getElementById("category").value=p.cat;document.getElementById("description").value=p.desc;document.getElementById("price").value=p.price;document.getElementById("stock").value=p.stock;document.getElementById("sizes").value=p.sizes.join(", ");document.getElementById("featured").checked=p.featured;document.getElementById("formTitle").textContent="Editar roupa";document.getElementById("productForm").scrollIntoView({behavior:"smooth"})}
function del(id){if(confirm("Excluir este produto?")){products=products.filter(p=>p.id!==id);save();renderAdmin();renderHome();renderShop();toast("Produto excluído")}}
function resetForm(){document.getElementById("productForm").reset();document.getElementById("editId").value="";document.getElementById("formTitle").textContent="Adicionar roupa"}
function details(id){const p=products.find(x=>x.id===id);document.getElementById("modalContent").innerHTML=`<div class="modal-product"><img src="${p.image}"><div><span class="eyebrow">${p.cat}</span><h2>${p.name}</h2><p>${p.desc}</p><h3>${money(p.price)}</h3><p>Estoque disponível: ${p.stock}</p><div class="sizes">${p.sizes.map(s=>`<button class="size" onclick="add(${p.id},'${s}');closeModal()">Tamanho ${s}</button>`).join("")}</div></div></div>`;document.getElementById("productModal").classList.remove("hidden")}
function closeModal(){document.getElementById("productModal").classList.add("hidden")}
function add(id,size){const p=products.find(x=>x.id===id),i=cart.find(x=>x.id===id&&x.size===size);if(i)i.qty++;else cart.push({id,size,qty:1});localStorage.setItem("zabellaCart",JSON.stringify(cart));updateCart();toast("Produto adicionado ao carrinho")}
function updateCart(){document.getElementById("count").textContent=cart.reduce((a,x)=>a+x.qty,0);let total=0;const el=document.getElementById("cartItems");if(!cart.length){el.innerHTML="<p style='padding:30px;color:#817a72;text-align:center'>Carrinho vazio.</p>";document.getElementById("total").textContent=money(0);return}el.innerHTML=cart.map(x=>{const p=products.find(y=>y.id===x.id);total+=p.price*x.qty;return `<div class="cart-item"><img src="${p.image}"><div><h4>${p.name}</h4><small>Tamanho: ${x.size}<br>${money(p.price)}</small><div class="qty"><button onclick="change(${x.id},'${x.size}',-1)">−</button>${x.qty}<button onclick="change(${x.id},'${x.size}',1)">+</button></div></div><button onclick="removeCart(${x.id},'${x.size}')" style="border:0;background:none;color:#a44">×</button></div>`}).join("");document.getElementById("total").textContent=money(total)}
function change(id,size,d){const x=cart.find(a=>a.id===id&&a.size===size);x.qty+=d;if(x.qty<=0)cart=cart.filter(a=>!(a.id===id&&a.size===size));localStorage.setItem("zabellaCart",JSON.stringify(cart));updateCart()}
function removeCart(id,size){cart=cart.filter(a=>!(a.id===id&&a.size===size));localStorage.setItem("zabellaCart",JSON.stringify(cart));updateCart()}
function openCart(){updateCart();document.getElementById("cartPanel").classList.add("open");document.getElementById("overlay").classList.add("open")}
function closeCart(){document.getElementById("cartPanel").classList.remove("open");document.getElementById("overlay").classList.remove("open")}
function checkout(){if(!cart.length)return toast("Carrinho vazio");let t="Olá! Quero fazer um pedido na Zabella:%0A%0A",sum=0;cart.forEach(x=>{let p=products.find(y=>y.id===x.id);sum+=p.price*x.qty;t+=`• ${p.name} — ${x.size} — ${x.qty}x%0A`});t+=`%0ATotal: ${encodeURIComponent(money(sum))}`;open(`https://wa.me/${WA()}?text=${t}`,"_blank")}
renderHome();renderShop();updateCart();renderContacts();renderAdmin();