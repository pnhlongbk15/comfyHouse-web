//https://www.youtube.com/watch?v=90PgFUPIybY&t=1551s&ab_channel=CodingAddict

//variables
const cartBtn = document.querySelector(".cart-btn")
const closeCartBtn = document.querySelector(".close-cart")
const clearCartBtn = document.querySelector(".clear-cart")
const cartDOM = document.querySelector(".cart")
const cartOverlay = document.querySelector(".cart-overlay")
const cartItems = document.querySelector(".cart-items")
const cartTotal = document.querySelector(".cart-total")
const cartContent = document.querySelector(".cart-content")
const productsDOM = document.querySelector(".products-center")


// cart
let cart = [];
//buttons
let buttonsDOM = []
// getting the products
class Products{
    async getProducts(){
        try{
            let result = await fetch('./products.json');
            let data = await result.json();

            let products =data.items;
            products = products.map(item => { // high function map()
                const {title,price} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return {title,price,id,image}
            })
            return products;
        }catch (e){
            console.log(e)
        }
        
    }
    
}
// display products
class UI{
    displayProducts(products){
        let result = '';
        products.forEach(product => {
            result += `
            <!-- single product -->
            <article class="product">
                <div class="img-container">
                     <img 
                        class="product-img" 
                        src= ${product.image} 
                        alt="product"
                        />
                     <button class="bag-btn" data-id=${product.id}>
                         <i class="fas fa-shopping-cart">
                            add to cart
                         </i>
                     </button>
                </div> 
                <h3>${product.title}</h3>
                <h4>${product.price}</h4>
             </article>
            <!-- end of single product --> 
            `
        });
        productsDOM.innerHTML = result;
    }
    getBagButtons(){
        
        const buttons = [...document.querySelectorAll(".bag-btn")] ;
        buttonsDOM = buttons;

        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if(inCart){
                button.innerText= "In Cart";
                button.disabled = true;
            }
            button.addEventListener('click',(e)=>{
                e.target.innerText = "In Cart";
                e.target.disabled = true;
                // get product from products
                let cartItem = {...Storage.getProduct(id), amount: 1};
        
                // add product to the cart
                cart = [...cart, cartItem];
              
                // save cart in local storage
                Storage.saveCart(cart)
                // set cart values
                this.setCartValues(cart)
                // display cart item
                this.addCartItem(cartItem);
                // show the cart
                // this.showCart();
            })    
            
        })
    }
    setCartValues(cart){
        let tempTotal = 0
        let itemsTotal = 0;
        cart.map(cartItem =>{
            tempTotal += cartItem.price * cartItem.amount;
            itemsTotal += cartItem.amount;
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal; 
    }
    addCartItem(cartItem){
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
            <img src=${cartItem.image} alt="product" />
            <div>
                <h4>${cartItem.title}</h4>
                <h5>${cartItem.price}</h5>
                <span class="remove-item" data-id=${cartItem.id}>remove</span>
            </div>
            <div>
                <i class="fas fa-chevron-up" data-id=${cartItem.id}></i>
                <p class="item-amount">${cartItem.amount}</p>
                <i class="fas fa-chevron-down" data-id=${cartItem.id}></i>
            </div>
        `;
        cartContent.appendChild(div);
        
    }
    showCart(){
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart')
    }
    hideCart(){
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart')
    }
    blurCart(e){
        if (e.target.classList.contains("cart-overlay")) this.hideCart();
    }
    setupAPP(){
        cart = Storage.getCart();
        this.setCartValues(cart);        
        this.populateCart(cart);    
        cartBtn.addEventListener("click",this.showCart);
        closeCartBtn.addEventListener("click",this.hideCart);
        cartOverlay.addEventListener("click",(e) => this.blurCart(e));
    }
    populateCart(cart){
        cart.forEach(cartItem => this.addCartItem(cartItem))
    }

    cartLogic(){
        // clear cart button
        clearCartBtn.addEventListener("click",()=> this.clearCart());
        // cart functionality
        cartContent.addEventListener("click", e =>{
            if(e.target.classList.contains("remove-item")){
                let removeItem = e.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);

            }else if(e.target.classList.contains("fa-chevron-up")){
                let id = e.target.dataset.id;
                let tempItem = cart.find(cartItem => cartItem.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart)
                e.target.nextElementSibling.innerText = tempItem.amount;
                console.log(e.target.nextElementSibling)

            }else if(e.target.classList.contains("fa-chevron-down")){
                let id = e.target.dataset.id;
                let tempItem = cart.find(cartItem => cartItem.id === id);
                tempItem.amount = tempItem.amount - 1;
                if (tempItem.amount <= 0){
                    cartContent.removeChild(e.target.parentElement.parentElement);
                    this.removeItem(id);
                } 
                e.target.previousElementSibling.innerText = tempItem.amount;
                Storage.saveCart(cart);
                this.setCartValues(cart)
              
            }
        })
    }
    clearCart(){
        let cartItems = cart.map(cartItem => cartItem.id);
        cartItems.forEach(id => this.removeItem(id));

        while(cartContent.children.length>0){
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart();
    }
    removeItem(id){
        cart = cart.filter(item => item.id !==id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `
            <i class="fas fa-shopping-cart">
                add to cart
            </i>
            `
    }
    getSingleButton(id){
        return buttonsDOM.find(button => button.dataset.id === id);
    }
}

// local storage
class Storage{
    static saveProducts (products){
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem("products"));
        return products.find(product => product.id === id);
    }
    static saveCart(cart){
        localStorage.setItem("cart",JSON.stringify(cart));
    }
    static getCart(){
        return localStorage.getItem("cart")?JSON.parse(localStorage.getItem("cart")):[]
    }
}

document.addEventListener("DOMContentLoaded",()=>{
    const ui = new UI();
    const products = new Products();
    // setup app
    ui.setupAPP()
    
    // get all products
    products.getProducts().then(products => {
        ui.displayProducts(products);
        console.log(products)
        Storage.saveProducts(products);
    
    }).then(()=>{
        ui.getBagButtons();
        ui.cartLogic();
    });
   
})

//Attention : 2:00:00