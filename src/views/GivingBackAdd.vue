<template>
  <TheNavbar></TheNavbar>
  <GivingChat></GivingChat>
  <div class="app">

    <!-- ═══════════════════════════════════════════════
         SCREEN: CATEGORIES
    ═══════════════════════════════════════════════ -->
    <div v-if="screen === 'categories'" class="page categories-page">
      <p class="cat-lbl">CATEGORIES</p>
      <div class="cat-grid">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="cat-card"
          @click="goToList(cat)"
        >
        <br><br>
          <div class="cat-icon" v-html="cat.svg" />
          <span class="cat-name">{{ cat.name }}</span>
          <div class="cat-arrow">›</div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════
         SCREEN: ITEM LIST
    ═══════════════════════════════════════════════ -->
    <div v-else-if="screen === 'list'" class="page list-page">
      <div class="hdr">
        <button class="back-btn" @click="screen = 'categories'">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div class="logo"><span class="g">Acquire</span> Back</div>
        <button class="cart-btn" @click="screen = 'cart'">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0D2B0D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <span v-if="totalItems > 0" class="badge">{{ totalItems }}</span>
        </button>
      </div>
      <div class="search-bar">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5C6E5C" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" type="text" placeholder="Search items..." class="search-input" />
      </div>
      <div class="obj-grid">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="obj-row"
          @click="goToDetail(item)"
        >
          <div class="obj-info">
            <span class="obj-name">{{ item.name }}</span>
            <div class="obj-pts">
              <img src="/assets/img/givingPoint.png" alt="Giving Point" class="gp-icon" style="width:15px;height:15px" />
              <span>{{ item.points }} pt{{ item.points > 1 ? 's' : '' }}</span>
            </div>
          </div>
          <div class="obj-right">
            <img v-if="item.img" :src="item.img" :alt="item.name" class="obj-img" />
            <div v-else class="img-ph obj-ph">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>
              <span>Photo</span>
            </div>
            <span class="obj-arrow">›</span>
          </div>
        </div>
        <p v-if="filteredItems.length === 0" class="no-results">No items found.</p>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════
         SCREEN: ITEM DETAIL
    ═══════════════════════════════════════════════ -->
    <div v-else-if="screen === 'detail'" class="page detail-page">
      <div class="det-left">
        <div class="hdr">
          <button class="back-btn dark" @click="screen = 'list'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div class="logo on-dark"><span class="g">GIVING</span> BACK</div>
          <button class="cart-btn" @click="screen = 'cart'">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            <span v-if="totalItems > 0" class="badge">{{ totalItems }}</span>
          </button>
        </div>
        <div class="pts-bar">
          <span class="pts-num">{{ totalPoints }}</span>
          <img src="/assets/img/givingPoint.png" alt="Giving Point" class="gp-icon" style="width:24px;height:24px" />
        </div>
        <img v-if="currentItem.img" :src="currentItem.img" :alt="currentItem.name" class="det-img" />
        <div v-else class="img-ph det-ph">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>
          <span>Your product photo</span>
        </div>
      </div>

      <div class="det-right">
        <h2 class="det-name">{{ currentItem.name }}</h2>
        <div class="det-stock"><span class="lbl">Stock:</span> {{ currentStock }}</div>
        <div class="det-points">
          <img src="/assets/img/givingPoint.png" alt="Giving Point" class="gp-icon" style="width:26px;height:26px" />
          <span>{{ currentItem.points }} giving point{{ currentItem.points > 1 ? 's' : '' }} each</span>
        </div>
        <div class="subtotal">
          <span class="lbl">Subtotal:</span>
          <span class="sub-val">{{ currentItem.points * qty }} giving point{{ currentItem.points * qty !== 1 ? 's' : '' }}</span>
        </div>
        <div class="act-row">
          <button class="btn-get" :class="{ ok: added }" @click="addToCart" :disabled="currentStock === 0">
            {{ added ? 'Added! ✓' : 'Get It' }}
          </button>
          <div class="qty-ctrl">
            <button class="qty-btn" @click="changeQty(-1)">−</button>
            <span class="qty-num">{{ qty }}</span>
            <button class="qty-btn" @click="changeQty(1)">+</button>
          </div>
        </div>
        <p v-if="currentStock === 0" class="no-stock">Out of stock</p>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════
         SCREEN: CART
    ═══════════════════════════════════════════════ -->
    <div v-else-if="screen === 'cart'" class="page cart-page">
      <div class="hdr">
        <button class="back-btn" @click="screen = 'list'">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div class="logo"><span class="g">GIVING</span> BACK</div>
        <div class="pts-inline">
          <span>{{ totalPoints }}</span>
          <img src="/assets/img/givingPoint.png" alt="Giving Point" class="gp-icon" style="width:20px;height:20px" />
        </div>
      </div>
      <h2 class="cart-title">My Cart</h2>

      <div v-if="cart.length === 0" class="empty">
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#B9D2B9" stroke-width="1.5" stroke-linecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <p>Your cart is empty</p>
        <button class="btn-keep" @click="screen = 'categories'">Keep adding items</button>
      </div>

      <div v-else class="cart-layout">
        <div class="cart-items">
          <div v-for="(item, i) in cart" :key="item.key" class="c-row">
            <img v-if="item.img" :src="item.img" :alt="item.name" class="c-img" />
            <div v-else class="img-ph c-ph">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>
            </div>
            <div class="c-info">
              <div class="c-name">{{ item.name }}</div>
              <div class="c-cat">{{ item.category }}</div>
              <div class="c-pts">
                <img src="/assets/img/givingPoint.png" alt="Giving Point" class="gp-icon" style="width:13px;height:13px" />
                {{ item.points }} × {{ item.qty }} = <strong>{{ item.points * item.qty }} pts</strong>
              </div>
            </div>
            <button class="c-del" @click="removeItem(i)">✕</button>
          </div>
        </div>

        <div class="summary">
          <div class="sum-row"><span>Total items:</span><strong>{{ totalItems }}</strong></div>
          <div class="sum-total">
            <span>Total Giving Points:</span>
            <div class="total-pts">
              <strong>{{ totalPoints }}</strong>
              <img src="/assets/img/givingPoint.png" alt="Giving Point" class="gp-icon" style="width:16px;height:16px" />
            </div>
          </div>
          <div class="btns-fin">
            <button class="btn-clear" @click="clearCart">Clear cart</button>
            <button class="btn-redeem" @click="redeem">Redeem</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import GivingChat from '../components/GivingChat.vue'
import TheNavbar from '../components/TheNavbar.vue'

// ════════════════════════════════════════════════════════════
// IMÁGENES REALES:
//    Coloca la ruta de tu foto en el campo `img` de cada item.
//    Ejemplo:  { id: 1, name: 'Shoe box', img: '/img/products/shoebox.jpg', stock: 5 },
//    Mientras `img` esté vacío (''), la app muestra un espacio
//    reservado elegante con el ícono de foto.
// ════════════════════════════════════════════════════════════

const DB = {
  paper: {
    points: 1,
    items: [
      { id: 1, name: 'Shoe box',             img: '../../public/assets/img/products/Paper&Cardboard/shoebox.png', stock: 5 },
      { id: 2, name: 'Corrugated cardboard', img: '../../public/assets/img/products/Paper&Cardboard/corrugated.png', stock: 5 },
      { id: 3, name: 'Notebook',             img: '../../public/assets/img/products/Paper&Cardboard/notebook.png', stock: 5 },
      { id: 4, name: 'Bond paper',           img: '../../public/assets/img/products/Paper&Cardboard/bondpaper.png', stock: 5 },
      { id: 5, name: 'Magazine',             img: '../../public/assets/img/products/Paper&Cardboard/magazine.png', stock: 5 },
      { id: 6, name: 'Newspaper',            img: '../../public/assets/img/products/Paper&Cardboard/newspaper.png', stock: 5 },
    ],
  },
  plastic: {
    points: 2,
    items: [
      { id: 1, name: 'Plastic bag',       img: '../../public/assets/img/products/Plastic/plasticbag.png', stock: 5 },
      { id: 2, name: 'Plastic bottles',   img: '../../public/assets/img/products/Plastic/plasticBottle.png', stock: 5 },
      { id: 3, name: 'Bucket',            img: '../../public/assets/img/products/Plastic/bucket.png', stock: 5 },
      { id: 4, name: 'Yogurt containers', img: '../../public/assets/img/products/Plastic/yogurtcontainer.png', stock: 5 },
      { id: 5, name: 'Straws',            img: '../../public/assets/img/products/Plastic/straws.png', stock: 5 },
      { id: 6, name: 'Shampoo bottles',   img: '../../public/assets/img/products/Plastic/shampoobottle.png', stock: 5 },
    ],
  },
  metal: {
    points: 4,
    items: [
      { id: 1, name: 'Trash can',      img: '../../public/assets/img/products/Cans/Trash.png', stock: 5 },
      { id: 2, name: 'Chain',          img: '../../public/assets/img/products/Cans/chain.png', stock: 5 },
      { id: 3, name: 'Nails',          img: '../../public/assets/img/products/Cans/nails.png', stock: 5 },
      { id: 4, name: 'Pot',            img: '../../public/assets/img/products/Cans/pot.png', stock: 5 },
      { id: 5, name: 'Aluminum cans',  img: '../../public/assets/img/products/Cans/cans.png', stock: 5 },
      { id: 6, name: 'Metal scissors', img: '../../public/assets/img/products/Cans/scissors.png', stock: 5 },
    ],
  },
}

// ── State ──────────────────────────────────────────────────
const screen       = ref('categories')
const currentCat   = ref(null)
const currentItem  = ref(null)
const currentStock = ref(5)
const qty          = ref(1)
const added        = ref(false)
const search       = ref('')
const cart         = reactive([])
const totalPoints  = ref(0)

const categories = reactive([
  {
    id: 'paper', name: 'Paper & Cardboard',
    svg: `<svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      <rect x="16" y="14" width="34" height="44" rx="4" fill="#EAF6EA" stroke="#0D2B0D" stroke-width="3"/>
      <rect x="24" y="20" width="34" height="44" rx="4" fill="#ffffff" stroke="#0D2B0D" stroke-width="3"/>
      <line x1="31" y1="32" x2="51" y2="32" stroke="#8FE58F" stroke-width="3" stroke-linecap="round"/>
      <line x1="31" y1="40" x2="51" y2="40" stroke="#0D2B0D" stroke-width="3" stroke-linecap="round"/>
      <line x1="31" y1="48" x2="45" y2="48" stroke="#0D2B0D" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'plastic', name: 'Plastic',
    svg: `<svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      <rect x="30" y="8" width="12" height="8" rx="2" fill="#8FE58F" stroke="#0D2B0D" stroke-width="3"/>
      <path d="M30 16 h12 v6 c6 4 8 8 8 16 v14 c0 4 -3 6 -6 6 H28 c-3 0 -6 -2 -6 -6 V38 c0 -8 2 -12 8 -16 Z" fill="#ffffff" stroke="#0D2B0D" stroke-width="3" stroke-linejoin="round"/>
      <line x1="28" y1="40" x2="44" y2="40" stroke="#8FE58F" stroke-width="3" stroke-linecap="round"/>
      <line x1="28" y1="48" x2="44" y2="48" stroke="#8FE58F" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'metal', name: 'Cans',
    svg: `<svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      <path d="M20 18 v36 c0 3 7 6 16 6 s16 -3 16 -6 V18" fill="#ffffff" stroke="#0D2B0D" stroke-width="3"/>
      <ellipse cx="36" cy="18" rx="16" ry="6" fill="#8FE58F" stroke="#0D2B0D" stroke-width="3"/>
      <line x1="26" y1="30" x2="26" y2="48" stroke="#8FE58F" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
  },
])

// ── Computed ───────────────────────────────────────────────
const filteredItems = computed(() => {
  if (!currentCat.value) return []
  const list = DB[currentCat.value.id].items.map(e => ({
    ...e,
    points: DB[currentCat.value.id].points,
    category: currentCat.value.name,
  }))
  if (!search.value.trim()) return list
  const q = search.value.toLowerCase()
  return list.filter(e => e.name.toLowerCase().includes(q))
})

const totalItems = computed(() => cart.reduce((a, i) => a + i.qty, 0))

// ── Methods ────────────────────────────────────────────────
function goToList(cat) {
  currentCat.value = cat
  search.value = ''
  screen.value = 'list'
}

function goToDetail(item) {
  currentItem.value = item
  qty.value = 1
  const key = currentCat.value.id + '-' + item.id
  const inCart = cart.find(i => i.key === key)
  const used = inCart ? inCart.qty : 0
  currentStock.value = item.stock - used
  screen.value = 'detail'
}

function changeQty(d) {
  qty.value = Math.max(1, Math.min(currentStock.value, qty.value + d))
}

function addToCart() {
  if (currentStock.value === 0) return
  const real = Math.min(qty.value, currentStock.value)
  const key = currentCat.value.id + '-' + currentItem.value.id
  const ex = cart.find(i => i.key === key)
  if (ex) {
    ex.qty += real
  } else {
    cart.push({
      key,
      name: currentItem.value.name,
      img: currentItem.value.img,
      points: currentItem.value.points,
      category: currentItem.value.category,
      qty: real,
    })
  }
  totalPoints.value += currentItem.value.points * real
  currentStock.value -= real
  qty.value = 1
  added.value = true
  setTimeout(() => { added.value = false }, 2000)
}

function removeItem(i) {
  totalPoints.value -= cart[i].points * cart[i].qty
  cart.splice(i, 1)
}

function clearCart() {
  cart.splice(0, cart.length)
  totalPoints.value = 0
}

function redeem() {
  alert(`You redeemed ${totalPoints.value} Giving Points!`)
  clearCart()
  screen.value = 'categories'
}
</script>

<style scoped>
/* ══════════ PALETA "GIVING BACK" ══════════
   Verde bosque principal:  #0D2B0D
   Verde hover:             #164216
   Acento (verde claro):    #8FE58F
   Fondo crema:             #F6F8F3
   Bordes suaves:           #E3EAE0
*/
.app {
  --green-950: #0D2B0D;
  --green-800: #164216;
  --green-tint: #EAF3E7;
  --accent: #8FE58F;
  --bg: #0D2B0D;
  --card: #ffffff;
  --line: #E3EAE0;
  --ink: #0D2B0D;
  --muted: #5C6E5C;
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  box-sizing: border-box;
}
/* Pantallas en formato 16:9 (como un monitor normal) */
.page {
  width: 100%;
  aspect-ratio: 16 / 9;
  max-height: 85vh;
  overflow-y: auto;
  box-sizing: border-box;
}

/* Contenido centrado a ancho de pantalla normal */
.list-page .hdr, .list-page .search-bar, .list-page .obj-grid,
.cart-page .hdr, .cart-page .cart-title, .cart-page .cart-layout, .cart-page .empty {
  max-width: 1240px; margin-left: auto; margin-right: auto;
}

/* Shared logo */
.logo { font-size: clamp(1.3rem, 1.1rem + 0.8vw, 1.9rem); font-weight: 800; line-height: 1.1; text-align: center; color: rgb(92, 173, 123); letter-spacing: .5px; }
.g { color: #e7ede7; }
.logo.on-dark { color: #ffffff; }
.logo.on-dark .g { color: var(--accent); }

/* Shared header */
.hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: clamp(14px, 2vw, 24px); }
.back-btn {
  width: clamp(34px, 3vw, 44px); height: clamp(34px, 3vw, 44px); border-radius: 50%;
  border: 1.5px solid var(--line); background: var(--card);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--ink); flex-shrink: 0;
  transition: background .15s, border-color .15s;
}
.back-btn:hover { background: var(--green-tint); border-color: var(--green-950); transform: scale(1.1); }
.back-btn { transition: background .2s, border-color .2s, transform .2s ease; }
.back-btn.dark { background: transparent; border-color: rgba(255,255,255,.45); color: #ffffff; }
.back-btn.dark:hover { background: rgba(255,255,255,.12); border-color: #ffffff; }
.cart-btn { position: relative; background: none; border: none; cursor: pointer; padding: 4px; }
.badge {
  position: absolute; top: -4px; right: -4px;
  background: var(--accent); color: var(--green-950); font-size: .6rem; font-weight: 800;
  width: 16px; height: 16px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}

/* Giving Point coin icon (indicates the "Giving Point" currency) */
.gp-icon { object-fit: contain; flex-shrink: 0; vertical-align: middle; }

/* Image placeholder (espacio para fotos reales) */
.img-ph {
  border: 2px dashed #B9D2B9; border-radius: 12px; background: #F3F8F1;
  color: #6B826B; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 4px;
  font-size: clamp(.68rem, .65rem + 0.2vw, .82rem); font-weight: 600; flex-shrink: 0;
}

/* ── CATEGORIES ── */
.categories-page {
  background: var(--bg); padding: clamp(16px, 3vw, 44px) clamp(16px, 4vw, 56px);
  display: flex; flex-direction: column; justify-content: center;
}
.cat-lbl {
  font-size: 35px; font-weight: 700; color: white;
  letter-spacing: 1.2px; text-align: center; margin-bottom: clamp(12px, 1.5vw, 22px);
}
.cat-grid {
  --cat-gap: clamp(16px, 2vw, 28px);
  display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--cat-gap); max-width: 1240px; margin: 0 auto;
}
@media (min-width: 500px) { .cat-grid { grid-template-columns: repeat(3, 1fr); max-width: 1100px; } }

/* Center the "Cans" card below Paper & Cardboard / Plastic on the 2-column (mobile) layout */
.cat-grid > .cat-card:nth-child(3):last-child {
  grid-column: 1 / -1;
  justify-self: center;
  width: calc(50% - (var(--cat-gap) / 2));
}
@media (min-width: 500px) {
  .cat-grid > .cat-card:nth-child(3):last-child {
    grid-column: auto;
    justify-self: stretch;
    width: auto;
  }
}
.cat-card {
  display: flex; flex-direction: column; align-items: center; gap: clamp(12px, 1.3vw, 18px);
  background: var(--card); border: 1.5px solid var(--line); border-radius: clamp(20px, 1.8vw, 26px);
  padding: clamp(26px, 3vw, 46px) 14px clamp(20px, 2.5vw, 34px); cursor: pointer;
  transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
}
.cat-card:hover {
  transform: translateY(-5px);
  border-color: var(--green-950);
  box-shadow: 0 10px 28px rgba(13,43,13,.14);
}
.cat-icon { width: clamp(100px, 10vw, 150px); height: clamp(100px, 10vw, 150px); display: flex; align-items: center; justify-content: center; transition: transform .3s cubic-bezier(.34,1.56,.64,1); }
.cat-card:hover .cat-icon { transform: scale(1.1) rotate(-4deg); }
.cat-icon :deep(svg), .cat-icon svg { width: 100% !important; height: 100% !important; }
.cat-name { font-size: clamp(.95rem, .85rem + 0.45vw, 1.3rem); font-weight: 700; text-align: center; line-height: 1.3; color: var(--ink); }
.cat-arrow {
  width: clamp(32px, 2.8vw, 42px); height: clamp(32px, 2.8vw, 42px); border-radius: 50%;
  background: var(--accent); color: var(--green-950);
  display: flex; align-items: center; justify-content: center;
  font-size: clamp(1.3rem, 1.2rem + 0.3vw, 1.6rem); font-weight: 700; padding-left: 2px;
  transition: background .2s, color .2s, transform .25s ease;
}
.cat-card:hover .cat-arrow { background: var(--green-950); color: var(--accent); transform: translateX(5px); }

/* ── LIST ── */
.list-page { background: var(--bg); padding: clamp(14px, 3vw, 40px) clamp(14px, 4vw, 56px); }
.search-bar {
  display: flex; align-items: center; gap: 8px;
  background: var(--card); border: 1.5px solid var(--line);
  border-radius: 50px; padding: clamp(8px, 0.9vw, 13px) clamp(16px, 1.5vw, 24px); margin-bottom: clamp(14px, 1.8vw, 24px);
  transition: border-color .15s;
}
.search-bar:focus-within { border-color: var(--green-950); }
.search-input { border: none; outline: none; font-size: clamp(.88rem, .84rem + 0.3vw, 1.05rem); color: var(--ink); background: transparent; width: 100%; }
.search-input::placeholder { color: var(--muted); }
.obj-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr)); gap: clamp(14px, 1.5vw, 24px); }
.obj-row {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--card); border: 1.5px solid var(--line); border-radius: 16px;
  padding: clamp(16px, 1.6vw, 26px) clamp(18px, 1.8vw, 28px); cursor: pointer;
  transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease;
  min-height: clamp(100px, 9vw, 140px);
}
.obj-row:hover { transform: translateY(-2px); border-color: var(--green-950); box-shadow: 0 6px 16px rgba(13,43,13,.10); }
.obj-info { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.obj-name { font-size: clamp(1rem, 0.92rem + 0.35vw, 1.2rem); font-weight: 700; color: var(--ink); }
.obj-pts {
  display: inline-flex; align-items: center; gap: 5px; align-self: flex-start;
  font-size: clamp(.8rem, .76rem + 0.25vw, .95rem); font-weight: 700; color: var(--green-950);
  background: var(--green-tint); border-radius: 20px; padding: 4px 10px;
}
.obj-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.obj-img { width: clamp(90px, 8.5vw, 130px); height: clamp(82px, 7.5vw, 115px); object-fit: cover; border-radius: 12px; transition: transform .3s ease; }
.obj-ph { width: clamp(90px, 8.5vw, 130px); height: clamp(82px, 7.5vw, 115px); transition: transform .3s ease; }
.obj-row:hover .obj-img, .obj-row:hover .obj-ph { transform: scale(1.06); }
.obj-arrow { color: var(--green-950); font-size: 1.4rem; font-weight: 700; transition: transform .25s ease; }
.obj-row:hover .obj-arrow { transform: translateX(5px); }
.no-results { grid-column: 1/-1; text-align: center; color: var(--muted); margin-top: 30px; }

/* ── DETAIL ── */
.detail-page { background: var(--green-950); display: flex; }
.det-left { width: 45%; display: flex; flex-direction: column; padding: clamp(16px, 3vw, 44px); }
.pts-bar { display: flex; align-items: center; justify-content: flex-end; gap: 6px; margin-bottom: 12px; }
.pts-num { font-size: clamp(1.5rem, 1.3rem + 0.8vw, 2.1rem); font-weight: 800; color: var(--accent); }
.det-img {
  flex: 1; width: 100%; max-height: 60vh; object-fit: contain;
  border-radius: 16px; filter: drop-shadow(0 8px 16px rgba(0,0,0,.25));
}
.det-ph {
  flex: 1; min-height: 45vh;
  border-color: rgba(143,229,143,.5); background: rgba(255,255,255,.06);
  color: #BFE3BF; font-size: clamp(.8rem, .78rem + 0.2vw, 1rem); border-radius: 16px;
}
.det-right {
  width: 55%; background: var(--card); border-radius: 24px 0 0 24px;
  padding: clamp(26px, 6vh, 60px) clamp(22px, 6vw, 96px);
  display: flex; flex-direction: column; justify-content: center;
}
.det-name { font-size: clamp(1.3rem, 1.1rem + 0.9vw, 2.1rem); font-weight: 800; color: var(--ink); margin-bottom: clamp(12px, 1.5vh, 18px); }
.det-stock { font-size: clamp(.9rem, .86rem + 0.25vw, 1.05rem); color: var(--muted); margin-bottom: 10px; }
.lbl { font-weight: 700; color: var(--ink); }
.det-points { display: flex; align-items: center; gap: 7px; font-size: clamp(.88rem, .84rem + 0.25vw, 1.05rem); font-weight: 600; color: var(--ink); margin-bottom: 12px; }
.subtotal {
  display: flex; align-items: center; gap: 6px;
  background: var(--green-tint); border-radius: 10px;
  padding: clamp(9px, 1.2vh, 14px) clamp(12px, 1.2vw, 18px);
  margin-bottom: clamp(16px, 2.5vh, 26px); font-size: clamp(.85rem, .8rem + 0.3vw, 1rem); color: var(--ink);
}
.sub-val { font-weight: 700; color: var(--green-950); }
.act-row { display: flex; align-items: center; gap: clamp(10px, 1.2vw, 16px); }
.btn-get {
  flex: 1; background: var(--green-950); color: #ffffff; border: none;
  border-radius: 50px; padding: clamp(13px, 1.6vh, 17px); font-size: clamp(.95rem, .9rem + 0.3vw, 1.1rem); font-weight: 700;
  cursor: pointer; transition: background .2s, transform .2s, box-shadow .2s;
}
.btn-get:hover:not(:disabled) { background: var(--green-800); transform: translateY(-2px); box-shadow: 0 8px 18px rgba(13,43,13,.3); }
.btn-get:active:not(:disabled) { transform: translateY(0); }
.btn-get.ok { background: #2E7D32; }
.btn-get:disabled { background: #AABBAA; cursor: not-allowed; }
.qty-ctrl {
  display: flex; align-items: center; background: var(--card);
  border: 1.5px solid var(--green-950); border-radius: 50px; overflow: hidden;
}
.qty-btn {
  background: none; border: none; color: var(--green-950);
  font-size: clamp(1.3rem, 1.2rem + 0.3vw, 1.5rem); font-weight: 700;
  width: clamp(38px, 3vw, 48px); height: clamp(44px, 4.5vh, 52px);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}
.qty-btn:hover { background: var(--green-tint); }
.qty-num { font-size: clamp(.95rem, .9rem + 0.3vw, 1.1rem); font-weight: 700; color: var(--green-950); min-width: clamp(28px, 2.5vw, 36px); text-align: center; }
.no-stock { color: #A32D2D; font-size: .82rem; margin-top: 10px; text-align: center; }

/* ── CART ── */
.cart-page { background: var(--bg); padding: clamp(14px, 3vw, 40px) clamp(14px, 4vw, 56px); }
.pts-inline { display: flex; align-items: center; gap: 5px; font-size: clamp(1rem, .95rem + 0.3vw, 1.2rem); font-weight: 800; color: whitesmoke }
.cart-title { font-size: clamp(1.2rem, 1.05rem + 0.6vw, 1.7rem); font-weight: 800; color: var(--ink); margin-bottom: clamp(14px, 1.8vw, 22px); }
.empty { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 50px 20px; color: var(--muted); }
.empty p { font-size: clamp(.9rem, .86rem + 0.25vw, 1.05rem); }
.btn-keep {
  background: var(--green-950); color: #ffffff; border: none; border-radius: 50px;
  padding: 11px 26px; font-size: clamp(.88rem, .84rem + 0.25vw, 1rem); font-weight: 700; cursor: pointer;
  transition: background .2s, transform .2s, box-shadow .2s;
}
.btn-keep:hover { background: var(--green-800); transform: translateY(-2px); box-shadow: 0 8px 18px rgba(13,43,13,.25); }
.cart-layout { display: grid; grid-template-columns: 1fr clamp(240px, 26vw, 340px); gap: clamp(14px, 1.5vw, 24px); align-items: start; }
.cart-items { display: flex; flex-direction: column; gap: clamp(8px, 1vw, 12px); }
.c-row {
  display: flex; align-items: center; gap: clamp(10px, 1.2vw, 16px);
  background: var(--card); border: 1.5px solid var(--line);
  border-radius: 12px; padding: clamp(9px, 1vw, 14px) clamp(11px, 1.2vw, 18px);
}
.c-img { width: clamp(50px, 5vw, 72px); height: clamp(50px, 5vw, 72px); object-fit: cover; border-radius: 8px; flex-shrink: 0; }
.c-ph { width: clamp(50px, 5vw, 72px); height: clamp(50px, 5vw, 72px); border-radius: 8px; }
.c-info { flex: 1; display: flex; flex-direction: column; gap: 3px; }
.c-name { font-size: clamp(.82rem, .78rem + 0.25vw, 1rem); font-weight: 700; color: var(--ink); }
.c-cat { font-size: clamp(.72rem, .7rem + 0.2vw, .85rem); color: var(--muted); }
.c-pts { font-size: clamp(.75rem, .72rem + 0.2vw, .9rem); color: var(--ink); display: flex; align-items: center; gap: 4px; }
.c-del {
  background: transparent; border: 1.5px solid var(--line); border-radius: 50%;
  width: clamp(28px, 2.5vw, 34px); height: clamp(28px, 2.5vw, 34px);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #A32D2D; font-size: .85rem; flex-shrink: 0;
  transition: background .2s, border-color .2s, transform .25s ease;
}
.c-del:hover { background: #FCEBEB; border-color: #A32D2D; transform: rotate(90deg) scale(1.08); }
.c-row { transition: transform .2s ease, border-color .2s, box-shadow .2s; }
.c-row:hover { transform: translateX(5px); border-color: var(--green-950); box-shadow: 0 4px 12px rgba(13,43,13,.08); }
.summary {
  background: var(--green-950); border-radius: 16px;
  padding: clamp(18px, 2vw, 28px) clamp(16px, 1.8vw, 24px);
  display: flex; flex-direction: column; gap: clamp(10px, 1.2vw, 14px); align-self: start;
  position: sticky; top: 16px;
}
.sum-row { display: flex; justify-content: space-between; font-size: clamp(.85rem, .8rem + 0.3vw, 1rem); color: #DCEBDC; }
.sum-row strong { color: #ffffff; }
.sum-total { display: flex; justify-content: space-between; align-items: center; font-size: clamp(.9rem, .85rem + 0.3vw, 1.05rem); font-weight: 700; color: #DCEBDC; }
.total-pts { display: flex; align-items: center; gap: 5px; color: var(--accent); }
.btns-fin { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
.btn-redeem {
  background: var(--accent); color: var(--green-950); border: none; border-radius: 50px;
  padding: clamp(11px, 1.3vh, 14px); font-size: clamp(.85rem, .8rem + 0.3vw, 1rem); font-weight: 800; cursor: pointer;
  transition: filter .2s, transform .2s, box-shadow .2s;
}
.btn-redeem:hover { filter: brightness(1.06); transform: translateY(-2px); box-shadow: 0 6px 16px rgba(143,229,143,.35); }
.btn-clear {
  background: transparent; color: #ffffff; border: 1.5px solid rgba(255,255,255,.45);
  border-radius: 50px; padding: clamp(10px, 1.2vh, 13px); font-size: clamp(.82rem, .78rem + 0.25vw, .95rem); font-weight: 700; cursor: pointer;
  transition: background .15s;
}
.btn-clear:hover { background: rgba(255,255,255,.12); }

/* ── RESPONSIVE ── */
@media (max-width: 700px) {
  .page { aspect-ratio: auto; max-height: none; min-height: 100vh; overflow-y: visible; }
  .cart-layout { grid-template-columns: 1fr; }
  .obj-grid { grid-template-columns: 1fr; }
  .summary { position: static; }
  .detail-page { flex-direction: column; }
  .det-left, .det-right { width: 100%; }
  .det-left { min-height: 45vh; }
  .det-right { border-radius: 24px 24px 0 0; flex: 1; }
}
</style>
