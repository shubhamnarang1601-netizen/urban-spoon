const PALETTES = [
  ['#7b1e3a', '#c2577a'], ['#1f5c4d', '#58a58f'], ['#b8762b', '#e7b86a'], ['#3b2a6b', '#8b74c9'],
  ['#a63d2f', '#e68a6f'], ['#1d4e6e', '#6fa8c9'], ['#6b6b2a', '#c4c26a'], ['#8a2a5b', '#d985b4']
];
const NAMES = {
  'Anarkali': ['Gulnaar Printed Anarkali', 'Mehfil Flared Anarkali', 'Noor Embroidered Anarkali', 'Zaina Cotton Anarkali', 'Ishq Gotta Patti Anarkali', 'Rangeela Bandhani Anarkali'],
  'Kurta Sets': ['Festive Grace Kurta Set', 'Meher Chanderi Kurta Set', 'Saanjh Straight Kurta Set', 'Kesar Slit Kurta Set', 'Aarzoo Kota Doria Set', 'Heer Mulmul Kurta Set'],
  'Sharara Sets': ['Shehnai Sharara Set', 'Jashn Gharara Set', 'Dilkash Palazzo Set', 'Nazrana Sharara Set'],
  'Co-Ords': ['Everyday Linen Co-Ord', 'Brunch Block Print Co-Ord', 'Sundowner Shirt Co-Ord', 'Mehndi Day Co-Ord'],
  'Indo Western': ['Aaina Cape Set', 'Mirage Draped Skirt Set', 'Fusion Crop Top & Skirt', 'Twilight Jacket Gown']
};
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const BANDS = [['Under ₹3,000', 0, 3000], ['₹3,000 – ₹6,000', 3000, 6000], ['₹6,000 – ₹10,000', 6000, 10000], ['Above ₹10,000', 10000, 1e9]];

let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const PRODUCTS = [];
Object.entries(NAMES).forEach(([cat, names]) => names.forEach(n => {
  const price = Math.round((1595 + rnd() * 12500) / 100) * 100 - 5;
  const sale = rnd() < 0.2;
  PRODUCTS.push({
    id: PRODUCTS.length + 1, name: n, cat, price: sale ? Math.round(price * 0.75 / 10) * 10 : price,
    was: sale ? price : null, pal: PALETTES[Math.floor(rnd() * PALETTES.length)],
    sizes: SIZES.filter(() => rnd() > 0.25), age: Math.floor(rnd() * 30)
  });
}));
PRODUCTS.forEach(p => { if (!p.sizes.length) p.sizes = ['M']; });
PRODUCTS[3].sizes = []; PRODUCTS[11].sizes = [];

const $ = s => document.querySelector(s);
const inr = n => '₹' + n.toLocaleString('en-IN');
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const state = { cats: new Set(), sizes: new Set(), band: null, stock: false, sale: false, q: '', sort: 'new' };
let wish = new Set(load('wish', [])), cart = load('cart', []);
const bg = p => `linear-gradient(160deg,${p.pal[1]},${p.pal[0]})`;

function renderFilters() {
  const cats = Object.keys(NAMES);
  $('#fCat').innerHTML = cats.map(c => `<label class="check"><input type="checkbox" data-cat="${c}" ${state.cats.has(c) ? 'checked' : ''}> ${c}<small>${PRODUCTS.filter(p => p.cat === c).length}</small></label>`).join('');
  $('#fSize').innerHTML = SIZES.map(s => `<button class="size ${state.sizes.has(s) ? 'on' : ''}" data-size="${s}">${s}</button>`).join('');
  $('#fPrice').innerHTML = BANDS.map((b, i) => `<label class="check"><input type="radio" name="band" value="${i}" ${state.band === i ? 'checked' : ''}> ${b[0]}</label>`).join('');
}

function filtered() {
  const q = state.q.toLowerCase();
  const out = PRODUCTS.filter(p =>
    (!state.cats.size || state.cats.has(p.cat)) &&
    (!state.sizes.size || p.sizes.some(s => state.sizes.has(s))) &&
    (state.band === null || (p.price >= BANDS[state.band][1] && p.price < BANDS[state.band][2])) &&
    (!state.stock || p.sizes.length) && (!state.sale || p.was) &&
    (!q || (p.name + ' ' + p.cat).toLowerCase().includes(q)));
  if (state.sort === 'low') out.sort((a, b) => a.price - b.price);
  else if (state.sort === 'high') out.sort((a, b) => b.price - a.price);
  else out.sort((a, b) => a.age - b.age);
  return out;
}

function renderGrid() {
  const list = filtered();
  $('#count').textContent = `${list.length} style${list.length === 1 ? '' : 's'}`;
  $('#empty').hidden = list.length > 0;
  $('#grid').innerHTML = list.map(p => {
    const sold = !p.sizes.length;
    return `<article class="card">
      <div class="thumb" style="background:${bg(p)}">
        <div class="motif"></div><div class="silhouette"></div>
        ${sold ? '<span class="badge sold">Sold out</span>' : p.was ? '<span class="badge sale">-25%</span>' : p.age < 7 ? '<span class="badge">New</span>' : ''}
        <button class="heart ${wish.has(p.id) ? 'on' : ''}" data-wish="${p.id}" aria-label="Wishlist">${wish.has(p.id) ? '♥' : '♡'}</button>
        ${sold ? '' : `<button class="quick" data-add="${p.id}">Quick add</button>`}
      </div>
      <div class="type">${p.cat}</div><h3>${p.name}</h3>
      <div class="price">${inr(p.price)}${p.was ? `<s>${inr(p.was)}</s>` : ''}</div>
    </article>`;
  }).join('');
  const chips = [...state.cats, ...[...state.sizes].map(s => 'Size ' + s), ...(state.band !== null ? [BANDS[state.band][0]] : []), ...(state.stock ? ['In stock'] : []), ...(state.sale ? ['Sale'] : [])];
  $('#chips').innerHTML = chips.map(c => `<button class="chip" data-chip="${c}">${c} ✕</button>`).join('');
  $('#wishCount').textContent = wish.size;
}

function renderCart() {
  $('#cartCount').textContent = cart.reduce((n, i) => n + i.qty, 0);
  $('#cartItems').innerHTML = cart.length ? cart.map(i => {
    const p = PRODUCTS.find(x => x.id === i.id);
    return `<div class="line"><div class="mini" style="background:${bg(p)}"></div><div>${p.name}<small>Size ${i.size} · Qty ${i.qty}</small>${inr(p.price * i.qty)}</div><button class="icon-btn" data-rm="${i.id}|${i.size}" aria-label="Remove">✕</button></div>`;
  }).join('') : '<p class="empty">Your bag is empty.</p>';
  $('#subtotal').textContent = inr(cart.reduce((s, i) => s + PRODUCTS.find(x => x.id === i.id).price * i.qty, 0));
  save('cart', cart);
}

const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 1800); };
const drawer = on => { $('#cartDrawer').classList.toggle('on', on); $('#overlay').classList.toggle('on', on || $('#filters').classList.contains('on')); };
const panel = on => { $('#filters').classList.toggle('on', on); $('#overlay').classList.toggle('on', on); };

document.addEventListener('click', e => {
  const t = e.target.closest('button,input,a');
  if (!t) return;
  const d = t.dataset;
  if (d.wish) { const id = +d.wish; wish.has(id) ? wish.delete(id) : wish.add(id); save('wish', [...wish]); renderGrid(); }
  else if (d.add) {
    const p = PRODUCTS.find(x => x.id === +d.add), size = p.sizes[0];
    const l = cart.find(i => i.id === p.id && i.size === size);
    l ? l.qty++ : cart.push({ id: p.id, size, qty: 1 });
    renderCart(); toast(`Added ${p.name} (${size})`);
  }
  else if (d.rm) { const [id, size] = d.rm.split('|'); cart = cart.filter(i => !(i.id === +id && i.size === size)); renderCart(); }
  else if (d.size) { state.sizes.has(d.size) ? state.sizes.delete(d.size) : state.sizes.add(d.size); renderFilters(); renderGrid(); }
  else if (d.chip) {
    const c = d.chip;
    state.cats.delete(c); state.sizes.delete(c.replace('Size ', ''));
    if (state.band !== null && c === BANDS[state.band][0]) state.band = null;
    if (c === 'In stock') { state.stock = false; $('#inStock').checked = false; }
    if (c === 'Sale') state.sale = false;
    renderFilters(); renderGrid();
  }
  else if (d.cat && t.tagName === 'A') { e.preventDefault(); state.cats = new Set([d.cat]); state.sale = false; renderFilters(); renderGrid(); $('#mainNav').classList.remove('on'); }
  else if (t.id === 'saleLink') { e.preventDefault(); state.sale = true; renderGrid(); $('#mainNav').classList.remove('on'); }
  else if (t.id === 'clear') { Object.assign(state, { cats: new Set(), sizes: new Set(), band: null, stock: false, sale: false }); $('#inStock').checked = false; renderFilters(); renderGrid(); }
  else if (t.id === 'cartBtn') drawer(true);
  else if (t.id === 'closeCart') drawer(false);
  else if (t.id === 'openFilters') panel(true);
  else if (t.id === 'closeFilters') panel(false);
  else if (t.id === 'menuBtn') $('#mainNav').classList.toggle('on');
  else if (t.id === 'wishBtn') { state.wish = true; toast(`${wish.size} item${wish.size === 1 ? '' : 's'} in your wishlist`); }
  else if (t.href && t.getAttribute('href') === '#') e.preventDefault();
});
$('#overlay').addEventListener('click', () => { drawer(false); panel(false); });
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.cat) { t.checked ? state.cats.add(t.dataset.cat) : state.cats.delete(t.dataset.cat); }
  else if (t.name === 'band') state.band = +t.value;
  else if (t.id === 'inStock') state.stock = t.checked;
  else if (t.id === 'sort') state.sort = t.value;
  else return;
  renderFilters(); renderGrid();
});
$('#search').addEventListener('input', e => { state.q = e.target.value; renderGrid(); });
$('#news').addEventListener('submit', e => { e.preventDefault(); $('#newsMsg').textContent = 'Thanks for subscribing (demo).'; e.target.reset(); });

renderFilters(); renderGrid(); renderCart();
