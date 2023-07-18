// const myCart = document.querySelector(".cart");
const container = document.querySelector(".item-container");
// myCart.innerHTML = "products";/
// myCart.setAttribute("href", "/product");
let allData = {};
let getProduct = () => {
  let request = new XMLHttpRequest();
  let myCartProduct = {};
  let products;
  request.open("post", "/cart");
  request.setRequestHeader("Content-Type", "application/json");
  let totalPrice = document.querySelector(".total-price");
  request.send();
  request.addEventListener("load", () => {
    products = JSON.parse(request.responseText);
    console.log(request.responseText);

    console.log(myCartProduct);
    console.log(products);
    let productListHTML = "";

    for (let i = 0; i < products.length; i++) {
      const element = products[i];
      allData[element.product_id] = element;
      console.log(`Name: ${element["title"]} Price:${element["price"]}`);
      productListHTML += `
      <div class="product" id="${element["product_id"]}">
        <div class='img-container'>
            <img src="${element["images"]}">
            </div>
        <div class='data'>
        <h2>${element["title"]}</h2>
        <p >$<span class='price'>${element["price"]}</span></p>
        <p>quantity: <i class="fa-solid fa-minus" onclick='decreaseQ(this)'></i><span class='quantity'>${element["quantity"]}</span><i class="fa-solid fa-plus" onclick='increaseQ(this)'></i></p>
        
        </div>
        <div class="buttons">
          <button onclick="removeFromCart(this)" class='button'>Remove</button>
          <button onclick="showDetails(this)" class='button'>More Details</button>
         </div>
    </div>`;
      totalPrice.textContent =
        parseInt(totalPrice.textContent) +
        element["quantity"] * element["price"];
    }
    container.innerHTML += productListHTML;
  });
};
let removeFromCart = (element) => {
  event.stopImmediatePropagation();
  let id = element.parentElement.parentElement.getAttribute("id");
  alert(id);
  console.log(id);
  let quantity = element.parentElement.parentElement.querySelector(".quantity");
  let price = element.parentElement.parentElement.querySelector(".price");
  let total = document.querySelector(".total-price");
  let request = new XMLHttpRequest();
  request.open("post", "/removeFromCart");
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
let decreaseQ = (element) => {
  event.stopImmediatePropagation();
  let id = element.parentElement.parentElement.parentElement.getAttribute("id");
  let quantity = element.parentElement.parentElement.querySelector(".quantity");
  let price = element.parentElement.parentElement.querySelector(".price");
  let total = document.querySelector(".total-price");
  if (parseInt(quantity.textContent) > 1) {
    let request = new XMLHttpRequest();
    request.open("post", "/decreaseQ");
    request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify({ id: id }));
    request.addEventListener("load", () => {
      let data = JSON.parse(request.responseText);
      console.log(data);
      //   if (data.quantity == 0) {
      //     element.parentElement.parentElement.parentElement.remove();
      //   } else {
      quantity.innerHTML = parseInt(quantity.textContent) - 1;
      total.innerHTML =
        parseInt(total.textContent) - parseInt(price.textContent);
      //   }
    });
  }
};
let increaseQ = (element) => {
  event.stopImmediatePropagation();
  let id = element.parentElement.parentElement.parentElement.getAttribute("id");
  let quantity = element.parentElement.parentElement.querySelector(".quantity");
  let price = element.parentElement.parentElement.querySelector(".price");
  let total = document.querySelector(".total-price");
  let request = new XMLHttpRequest();
  request.open("post", "/increaseQ");
  request.setRequestHeader("Content-Type", "application/json");
  request.send(JSON.stringify({ id: id }));
  request.addEventListener("load", () => {
    let data = JSON.parse(request.responseText);
    console.log(data);
    // if (data.quantity == 0) {
    //   element.parentElement.parentElement.parentElement.remove();
    // } else {
    quantity.innerHTML = parseInt(quantity.textContent) + 1;
    total.textContent =
      parseInt(total.textContent) + parseInt(price.textContent);
    // }
  });
};
let showDetails = (element) => {
  let id = element.parentElement.parentElement.getAttribute("id");
  let description = allData[id].description;
  let img = allData[id].images;
  let price = allData[id].price;
  let title = allData[id].title;
  //show description on the body
  let descriptionContainer = document.querySelector(".description-container");
  let productDetailHtml = `<div class="product" id=${id}>
    <div class='img-container'>
    <img src="${img}">
    </div>
    <div class='data'>
      <h2>${title}</h2>
      <p>$${price}</p>
      <p>${description}</p>
      <p>quantity: <i class="fa-solid fa-minus" onclick='decreaseQ(this)'></i><span class='quantity'>${allData[id]["quantity"]}</span><i class="fa-solid fa-plus" onclick='increaseQ(this)'></i></p>
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
