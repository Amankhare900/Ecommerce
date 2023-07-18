// const myCart = document.querySelector(".cart");
const container = document.querySelector(".item-container");
let loadMore = document.querySelector(".load");
// myCart.innerHTML = "products";/
// myCart.setAttribute("href", "/product");
let allData = {};
let productShown = 0;
let getProduct = () => {
  let request = new XMLHttpRequest();
  let products = {};
  request.open("POST", "/getProduct");
  // console.log(productShown);
  request.setRequestHeader("Content-Type", "application/json");

  request.send(JSON.stringify({ productShown: productShown }));
  request.addEventListener("load", () => {
    products = JSON.parse(request.responseText).products;
    console.log(request.responseText);
    let productListHTML = "";
    if (products.length < 5) {
      loadMore.style.display = "none";
    }
    for (let i = 0; i < products.length; i++) {
      const element = products[i];
      allData[element.id] = element;
      productListHTML += `<div class="product" id="${element["id"]}">
        <div class='img-container'>
        <img src="${element["images"]}">
        </div>
        <div class='data'>
        <h2>${element["title"]}</h2>
        <p>$${element["price"]}</p>
        <p>Total Stock: <span class='quantity'>${element["stock"]}</span></p>
        </div>
        <div class="buttons">
          <i class="fa-solid fa-pen-to-square" onclick='editProduct(this)'></i>
          <button onclick="showDetails(this)" class='button'>More Details</button>
          <i class="fa-solid fa-trash" onclick="removeProduct(this)"></i>
        </div>
        </div>`;

      productShown++;
      loadMore.style.display = "inline-block";
    }
    container.innerHTML += productListHTML;
  });
};

let editProduct = (element) => {
  let id = element.parentElement.parentElement.getAttribute("id");
  let request = new XMLHttpRequest();
  request.open("post", "/editProduct");
  request.setRequestHeader("Content-Type", "application/json");
  request.send(JSON.stringify({ id }));
  request.addEventListener("load", () => {
    // let data = JSON.parse(request.responseText);
    console.log(request.responseText);

    window.location.href = "/admin";
  });
};

let removeProduct = (element) => {
  event.stopImmediatePropagation();
  console.log(element);
  let id = element.parentElement.parentElement.getAttribute("id");
  alert(id);
  console.log(id);
  let quantity = element.parentElement.parentElement.querySelector(".quantity");
  let price = element.parentElement.parentElement.querySelector(".price");
  let total = document.querySelector(".total-price");
  let request = new XMLHttpRequest();
  request.open("post", "/removeProduct");
  request.setRequestHeader("Content-Type", "application/json");
  request.send(JSON.stringify({ id }));
  request.addEventListener("load", () => {
    let data = JSON.parse(request.responseText);
    console.log(data);
    element.parentElement.parentElement.remove();
    total.textContent =
      parseInt(total.textContent) -
      parseInt(quantity.textContent) * parseInt(price.textContent);
  });
};
getProduct();
loadMore.addEventListener("click", (e) => {
  getProduct();
});
let showDetails = (element) => {
  let id = element.parentElement.parentElement.getAttribute("id");
  console.log(allData);
  let description = allData[id].description;
  let img = allData[id].images;
  let price = allData[id].price;
  let title = allData[id].title;
  let descriptionContainer = document.querySelector(".description-container");
  let productDetailHtml = `<div class="product" id=${id}>
    <div class='img-container'>
    <img src="${img}">
    </div>
    <div class='data'>
      <h2>${title}</h2>
      <p>$${price}</p>
      <p>${description}</p>
      <p>quantity: <span class='quantity'>${allData[id]["stock"]}</span></p>
    </div>
    <div class="buttons">
    </div>
    </div>`;
  descriptionContainer.innerHTML = productDetailHtml;
  // descriptionContainer.innerHTML = description;container.style.display = 'inline-block';
  descriptionContainer.style.display = "inline-block";
  setTimeout(() => {
    container.style.opacity = ".3";
  }, 30);
  // descriptionContainer.style.backgroundColor = "chocolate";
  // hide description on click
  descriptionContainer.addEventListener("click", () => {
    container.style.opacity = "1";
    setTimeout(() => {
      descriptionContainer.style.display = "none";
    }, 30);
  });
};
