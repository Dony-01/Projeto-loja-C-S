/* =========================================================
   C & S — MODA FEMININA
   main.js
   -----------------------------------------------------------
   Organizado em módulos simples para facilitar, no futuro,
   a troca da fonte de dados (PRODUCTS) por chamadas a uma
   API REST (fetch) sem alterar o restante do código.
========================================================= */
(function () {
  'use strict';

  /* =======================================================
     1) DADOS DOS PRODUTOS
     ---------------------------------------------------------
     Estrutura pensada para futuramente vir de uma API REST,
     ex.: GET /api/products -> retorna um array neste formato.
  ======================================================= */
  const PRODUCTS = [
    {
      id: 'p1',
      name: 'Camiseta Oversized',
      category: 'Feminino',
      price: 129.90,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'p2',
      name: 'Calça Cargo',
      category: 'Feminino',
      price: 219.90,
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'p3',
      name: 'Jaqueta Urban',
      category: 'Masculino',
      price: 349.90,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'p4',
      name: 'Vestido Essential',
      category: 'Feminino',
      price: 259.90,
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'p5',
      name: 'Cropped Basic',
      category: 'Feminino',
      price: 89.90,
      image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'p6',
      name: 'Bolsa Minimal',
      category: 'Acessórios',
      price: 189.90,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'p7',
      name: 'Camisa Slim',
      category: 'Masculino',
      price: 159.90,
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'p8',
      name: 'Óculos Solar',
      category: 'Acessórios',
      price: 149.90,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800&auto=format&fit=crop'
    }
  ];

  const formatPrice = (value) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  /* =======================================================
     2) ESTADO DO CARRINHO (persistido em localStorage)
  ======================================================= */
  const CART_STORAGE_KEY = 'cs_cart_v1';

  const Cart = {
    items: [], // [{ id, qty }]

    load() {
      try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        this.items = raw ? JSON.parse(raw) : [];
      } catch (e) {
        this.items = [];
      }
    },

    save() {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
    },

    add(productId) {
      const existing = this.items.find((i) => i.id === productId);
      if (existing) {
        existing.qty += 1;
      } else {
        this.items.push({ id: productId, qty: 1 });
      }
      this.save();
      renderCart();
      openCart();
    },

    remove(productId) {
      this.items = this.items.filter((i) => i.id !== productId);
      this.save();
      renderCart();
    },

    changeQty(productId, delta) {
      const item = this.items.find((i) => i.id === productId);
      if (!item) return;
      item.qty += delta;
      if (item.qty <= 0) {
        this.remove(productId);
      } else {
        this.save();
        renderCart();
      }
    },

    totalCount() {
      return this.items.reduce((sum, i) => sum + i.qty, 0);
    },

    subtotal() {
      return this.items.reduce((sum, i) => {
        const product = PRODUCTS.find((p) => p.id === i.id);
        return product ? sum + product.price * i.qty : sum;
      }, 0);
    }
  };

  /* =======================================================
     3) RENDERIZAÇÃO DE PRODUTOS
  ======================================================= */
  const productGrid = document.getElementById('productGrid');
  const emptyState = document.getElementById('emptyState');

  function productCardTemplate(product) {
    return `
      <article class="product-card" data-id="${product.id}" data-category="${product.category}" data-name="${product.name.toLowerCase()}">
        <div class="product-media">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
          <button class="product-quickadd" data-add="${product.id}">Adicionar ao carrinho</button>
        </div>
        <p class="product-category">${product.category}</p>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">${formatPrice(product.price)}</p>
        <div class="product-actions">
          <button class="btn btn-secondary" data-view="${product.id}">Ver produto</button>
          <button class="btn btn-primary" data-add="${product.id}">Adicionar</button>
        </div>
      </article>
    `;
  }

  function renderProducts(list) {
    productGrid.innerHTML = list.map(productCardTemplate).join('');
    emptyState.hidden = list.length > 0;
  }

  /* =======================================================
     4) FILTRO + BUSCA
  ======================================================= */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('searchInput');

  let currentFilter = 'Todos';
  let currentSearch = '';

  function applyFiltersAndSearch() {
    let list = PRODUCTS;

    if (currentFilter !== 'Todos') {
      list = list.filter((p) => p.category === currentFilter);
    }

    if (currentSearch.trim() !== '') {
      const q = currentSearch.trim().toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }

    renderProducts(list);
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      currentFilter = btn.dataset.filter;
      applyFiltersAndSearch();
    });
  });

  searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value;
    applyFiltersAndSearch();
  });

  // Botões "Ver peças" das categorias levam ao filtro correspondente
  document.querySelectorAll('.btn-category').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.category-card');
      const category = card.dataset.category;
      filterButtons.forEach((b) => {
        b.classList.toggle('is-active', b.dataset.filter === category);
      });
      currentFilter = category;
      applyFiltersAndSearch();
      document.getElementById('colecao').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Delegação de eventos: adicionar / ver produto
  productGrid.addEventListener('click', (e) => {
    const addId = e.target.dataset.add;
    const viewId = e.target.dataset.view;

    if (addId) {
      Cart.add(addId);
    }
    if (viewId) {
      // Espaço reservado para futura página/modal de detalhes do produto,
      // quando a integração com API/banco de dados existir.
      const product = PRODUCTS.find((p) => p.id === viewId);
      alert(`${product.name}\n${product.category} — ${formatPrice(product.price)}\n\n(Página de detalhe em breve.)`);
    }
  });

  /* =======================================================
     5) CARRINHO — UI (painel lateral)
  ======================================================= */
  const cartToggle = document.getElementById('cartToggle');
  const cartClose = document.getElementById('cartClose');
  const cartPanel = document.getElementById('cartPanel');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartItemsEl = document.getElementById('cartItems');
  const cartEmptyMsg = document.getElementById('cartEmptyMsg');
  const cartSubtotalEl = document.getElementById('cartSubtotal');
  const cartCountEl = document.getElementById('cartCount');
  const checkoutBtn = document.getElementById('checkoutBtn');

  function cartItemTemplate(item, product) {
    return `
      <div class="cart-item" data-id="${product.id}">
        <img src="${product.image}" alt="${product.name}">
        <div>
          <p class="cart-item-name">${product.name}</p>
          <p class="cart-item-cat">${product.category}</p>
          <div class="qty-control">
            <button data-qty-minus="${product.id}" aria-label="Diminuir quantidade">&minus;</button>
            <span>${item.qty}</span>
            <button data-qty-plus="${product.id}" aria-label="Aumentar quantidade">&plus;</button>
          </div>
        </div>
        <div>
          <p class="cart-item-price">${formatPrice(product.price * item.qty)}</p>
          <button class="cart-item-remove" data-remove="${product.id}">Remover</button>
        </div>
      </div>
    `;
  }

  function renderCart() {
    if (Cart.items.length === 0) {
      cartItemsEl.innerHTML = '';
      cartEmptyMsg.style.display = 'block';
    } else {
      cartEmptyMsg.style.display = 'none';
      cartItemsEl.innerHTML = Cart.items
        .map((item) => {
          const product = PRODUCTS.find((p) => p.id === item.id);
          return product ? cartItemTemplate(item, product) : '';
        })
        .join('');
    }

    cartSubtotalEl.textContent = formatPrice(Cart.subtotal());
    cartCountEl.textContent = Cart.totalCount();
  }

  function openCart() {
    cartPanel.classList.add('is-open');
    cartOverlay.classList.add('is-visible');
    cartPanel.setAttribute('aria-hidden', 'false');
  }

  function closeCart() {
    cartPanel.classList.remove('is-open');
    cartOverlay.classList.remove('is-visible');
    cartPanel.setAttribute('aria-hidden', 'true');
  }

  cartToggle.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  cartItemsEl.addEventListener('click', (e) => {
    const plusId = e.target.dataset.qtyPlus;
    const minusId = e.target.dataset.qtyMinus;
    const removeId = e.target.dataset.remove;

    if (plusId) Cart.changeQty(plusId, 1);
    if (minusId) Cart.changeQty(minusId, -1);
    if (removeId) Cart.remove(removeId);
  });

  checkoutBtn.addEventListener('click', () => {
    if (Cart.items.length === 0) return;
    // Espaço reservado para futura integração com checkout/pagamento real.
    alert('Finalização de compra em breve! Esta é uma versão de catálogo.');
  });

  /* =======================================================
     6) HEADER — comportamento no scroll
  ======================================================= */
  const header = document.getElementById('siteHeader');
  function handleHeaderScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', handleHeaderScroll, { passive: true });

  /* =======================================================
     7) MENU MOBILE
  ======================================================= */
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const overlay = document.getElementById('overlay');

  function toggleMobileMenu(forceClose) {
    const isOpen = forceClose ? false : !mobileMenu.classList.contains('is-open');
    mobileMenu.classList.toggle('is-open', isOpen);
    overlay.classList.toggle('is-visible', isOpen);
    menuToggle.classList.toggle('is-active', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  }

  menuToggle.addEventListener('click', () => toggleMobileMenu());
  overlay.addEventListener('click', () => toggleMobileMenu(true));
  document.querySelectorAll('.mobile-link').forEach((link) => {
    link.addEventListener('click', () => toggleMobileMenu(true));
  });

  /* =======================================================
     8) BUSCA — abrir/fechar barra
  ======================================================= */
  const searchToggle = document.getElementById('searchToggle');
  const searchBar = document.getElementById('searchBar');
  const searchClose = document.getElementById('searchClose');

  function toggleSearchBar(forceOpen) {
    const isOpen = typeof forceOpen === 'boolean' ? forceOpen : !searchBar.classList.contains('is-open');
    searchBar.classList.toggle('is-open', isOpen);
    searchToggle.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      setTimeout(() => searchInput.focus(), 300);
    }
  }

  searchToggle.addEventListener('click', () => toggleSearchBar());
  searchClose.addEventListener('click', () => toggleSearchBar(false));

  /* =======================================================
     9) SCROLL SUAVE (fallback para navegadores sem CSS smooth)
  ======================================================= */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* =======================================================
     10) INICIALIZAÇÃO
  ======================================================= */
  document.getElementById('year').textContent = new Date().getFullYear();

  Cart.load();
  renderProducts(PRODUCTS);
  renderCart();
  handleHeaderScroll();
})();
