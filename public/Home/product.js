let container = document.querySelector(".item-container");
let loadMore = document.querySelector(".load");
loadMore.style.display = "none";

// let request = new XMLHttpRequest();
// let products = {};
// request.open("GET", "/getProduct");
// request.send();

let goToCart = () => {
  let request = new XMLHttpRequest();
  request.open("get", "/goToCart");
  request.send();
  request.addEventListener("load", () => {
    window.location.href = "/cart";
    console.log("my cart");
  });
};
let allData = [];
let productShown = 0;

let getProduct = () => {
  let request = new XMLHttpRequest();
  let products = {};
  let myCartProduct = {};
  request.open("POST", "/getProduct");
  // console.log(productShown);
  request.setRequestHeader("Content-Type", "application/json");

  request.send(JSON.stringify({ productShown: productShown }));
  request.addEventListener("load", () => {
    products = JSON.parse(request.responseText).products;
    console.log(request.responseText);
    // console.log(JSON.parse(request.responseText).myCartProduct);
    if (JSON.parse(request.responseText).myCartProduct) {
      let data = JSON.parse(request.responseText).myCartProduct;
      data.forEach((obj) => {
        console.log(obj.product_id);
        myCartProduct[obj.product_id] = "yes";
      });
    }
    console.log(myCartProduct);
    // console.log(products);
    let productListHTML = "";
    products.forEach((element) => {
      allData.push(element);
    });
    if (products.length < 5) {
      loadMore.style.display = "none";
    }

    for (let i = 0; i < products.length; i++) {
      const element = products[i];
      // console.log(`Name: ${element["title"]} Price:${element["price"]}`);
      productListHTML += `<div class="product" id="${element["id"]}">
      <div class='img-container'>
      <img src="${element["images"]}">
      </div>
      <div class='data'>
      <h2>${element["title"]}</h2>
      <p>$${element["price"]}</p>
      </div>
      <div class="buttons">
      ${
        !myCartProduct[element["id"]]
          ? `<button class="button addToCart" onclick="addToCart(this)">
            Add to Cart
          </button>`
          : `
          <button class="button myCart" onclick="goToCart()">
            My Cart
          </button>`
      }
        
        <button onclick="showDetails(this)" class='button'>More Details</button>
      </div>
      </div>`;

      productShown++;
      loadMore.style.display = "inline-block";
    }
    container.innerHTML += productListHTML;
  });
};

getProduct();
loadMore.addEventListener("click", (e) => {
  getProduct();
});

let showDetails = (element) => {
  let id = element.parentElement.parentElement.getAttribute("id");
  // console.log(id);
  let description = allData[id - 1].description;
  let img = allData[id - 1].images;
  let price = allData[id - 1].price;
  let title = allData[id - 1].title;
  let cartButton = element.previousElementSibling
    .getAttribute("class")
    .split(" ");
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
  </div>
  <div class="buttons">
  ${
    cartButton[1] === "addToCart"
      ? `<button class="button addToCart" onclick="addToCart(this)">
        Add to Cart
      </button>`
      : `
      <button class="button myCart" onclick="goToCart()">
        My Cart
      </button>`
  }
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

let addToCart = (e) => {
  event.stopImmediatePropagation();
  let productId = e.parentElement.parentElement.getAttribute("id");
  let request = new XMLHttpRequest();
  request.open("POST", "/addToCart");
  request.setRequestHeader("Content-Type", "application/json");

  request.send(JSON.stringify({ productId: productId }));
  request.addEventListener("load", () => {
    // console.log(request.responseText);
    if (request.responseText) {
      e.removeAttribute("onclick");
      e.textContent = "My Cart";
      e.addEventListener("click", () => {
        goToCart();
      });
    } else {
      window.location.href = "/login";
    }
    // alert("Added to cart");
  });
};
