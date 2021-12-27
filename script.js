function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(
    createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'),
  );

  return section;
}
const appendElement = (element) => {
  const elementToAppend = createProductItemElement(element);
  document.querySelector('.items').appendChild(elementToAppend);
};

const createElements = (data) => {
  data.forEach((item) => {
    const obj = {
      sku: item.id,
      name: item.title,
      image: item.thumbnail,
    };

    appendElement(obj);
  });
};
const fetchData = async (uri) =>
  new Promise((resolve, reject) => {
    fetch(uri)
      .then((resp) => resp.json())
      .then((data) => {
        if (data) resolve(data);
        return reject(new Error('Falha ao buscar os dados!!'));
      });
  });

const saveToLocalStorage = (key, value) => {
  localStorage.setItem(key, value);
};

const loadToLocalStorage = (key, itemToAppend) => {
  const item = localStorage.getItem(key);
  if (item) {
    if(item === '0'){
      console.log(item);
      itemToAppend.innerHTML = parseInt(item).toFixed('2');
    } else {
      itemToAppend.innerHTML = item;
    }
  }
};

const addPrice = (price) => {
  const totalPrice = document.querySelector('.total-price');
  const value = parseFloat(totalPrice.innerText);
  totalPrice.innerText = (value + price).toFixed(2);
  if (parseFloat(totalPrice.innerText) % 1 === 0) {
    totalPrice.innerText = (value + price).toFixed(2);
  }
  saveToLocalStorage('totalPrice', totalPrice.innerText);
};

const removePrice = (price) => {
  const totalPrice = document.querySelector('.total-price'); 
  const value = parseFloat(totalPrice.innerText);
  totalPrice.innerText = (value - price).toFixed(2);
};

function cartItemClickListener(event) {
  const parent = event.path[0].parentNode;
  const parentChildToRemove = event.path[0];
  const price = parseFloat(parentChildToRemove.innerHTML.split('$')[1]);
  removePrice(price);
  parent.removeChild(parentChildToRemove);  
  saveToLocalStorage('cartList', parent.innerHTML);
  const totalPrice = document.querySelector('.total-price');
  saveToLocalStorage('totalPrice', totalPrice.innerText);
}

const getCart = () => document.querySelector('.cart__items');

 function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  addPrice(salePrice);
  return li;
}

const appendElementToCart = (element) => {
  const olCart = getCart();
  olCart.appendChild(element);
  saveToLocalStorage('cartList', olCart.innerHTML);
};

const fetchItem = async (item) => {
  const id = item.path[1].firstChild.innerText;
  const data = await fetchData(`https://api.mercadolibre.com/items/${id}`);
  const { id: sku, title: name, price: salePrice } = data;
  const obj = {
    sku,
    name,
    salePrice,
  };
  appendElementToCart(createCartItemElement(obj));
};

const clearCart = () => {
  const totalPrice = document.querySelector('.total-price'); 
  const ol = getCart();
  ol.innerHTML = '';
  localStorage.removeItem('cartList');
  totalPrice.innerText = '0.00';
  localStorage.setItem('totalPrice', 0.00);
};

const loading = (boolean) => {
  const container = document.querySelector('body');
  if (boolean) {
    const spanLoading = document.createElement('span');
    spanLoading.className = 'loading';
    spanLoading.innerHTML = 'loading...';
    container.appendChild(spanLoading);
  } else {
    container.removeChild(container.lastChild);
  }
};

function createAddListeners() {
  const itemAdd = document.querySelectorAll('.item__add');
  itemAdd.forEach((item) => item.addEventListener('click', fetchItem));
}

async function loadProducts(uri) {
  const olCart = getCart();
  const totalPrice = document.querySelector('.total-price');
  loadToLocalStorage('cartList', olCart);
  loadToLocalStorage('totalPrice', totalPrice);
  olCart.childNodes.forEach((node) => node.addEventListener('click', cartItemClickListener));
  loading(true);
    const data = await fetchData(uri);
    createElements(data.results);
  loading(false);
    createAddListeners();
}

function getSearchedText() {
  const items = document.querySelector('.items');
  items.innerHTML = '';
  const searchedText = document.getElementById('input__search').value;
  const uriData = `https://api.mercadolibre.com/sites/MLB/search?q=${searchedText}`;
  loadProducts(uriData);
}


window.onload = async function onload() {
  try {
    loadProducts(`https://api.mercadolibre.com/sites/MLB/search?q=${undefined}`);
    const btnSearch = document.getElementById('btn__search');
    btnSearch.addEventListener('click', getSearchedText);
    const emptyCart = document.querySelector('.empty-cart');
    emptyCart.addEventListener('click', clearCart);
  } catch (error) {
    console.log(error);
  }
};
