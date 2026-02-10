emailjs.init("IU8aTl31nIa3DiPWn");

// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyB8AGDx9eOgUFjznYne0YWIGGiBrUosyvc",
  authDomain: "elixr-d3bd5.firebaseapp.com",
  projectId: "elixr-d3bd5",
  storageBucket: "elixr-d3bd5.firebasestorage.app",
  messagingSenderId: "937131245447",
  appId: "1:937131245447:web:06b7af9526819782f85d22",
  measurementId: "G-VWGLD2J9W8"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

const ADMIN_EMAIL = "griitxstudios@gmail.com";
const RAZORPAY_KEY = "rzp_test_SDJbQvIkMQOfl9";

// PRODUCTS (REAL STORE DATA)
const products = [
  {
    id: "elixr01",
    name: "ELIXR 01 — OVERSIZED TEE",
    price: 2499,
    image: "assets/elixr01.jpg",
    description: "Heavyweight ritual uniform. Washed black fabric. Incomplete by design."
  },
  {
    id: "elixr02",
    name: "ELIXR 02 — ARCHIVE TEE",
    price: 2599,
    image: "assets/elixr02.png",
    description: "Minimal sigil placement. Archive cut."
  },
  {
    id: "elixr03",
    name: "ELIXR 03 — VOID TEE",
    price: 2699,
    image: "assets/tee3.jpg",
    description: "Reduced to absence. Ritual minimal."
  },
  {
    id: "elixr04",
    name: "ELIXR 04 — RITUAL TEXT TEE",
    price: 2799,
    image: "assets/tee4.jpg",
    description: "Text-based ceremonial uniform."
  },
  {
    id: "elixr05",
    name: "ELIXR 05 — ARCHETYPE TEE",
    price: 2899,
    image: "assets/tee5.jpg",
    description: "Foundational uniform. The first formula."
  }
];

// ENTRY SCREEN + AUDIO + CLICK SFX
document.addEventListener("DOMContentLoaded", () => {
  const enterScreen = document.getElementById("enterScreen");
  const sound = document.getElementById("ritualSound");

  // background ritual sound (loops) – start on first user click
  function startRitualSound() {
    if (!sound) return;
    sound.volume = 0.25;
    sound.loop = true;
    sound.play().catch(() => {});

    // after we successfully attempt once, remove this listener
    document.removeEventListener("click", startRitualSound);
  }

  // index page: click to enter, also starts sound
  if (enterScreen) {
    enterScreen.addEventListener("click", () => {
      enterScreen.style.display = "none";
      startRitualSound();
    });
  } else if (sound) {
    // other pages: first click anywhere starts the loop
    document.addEventListener("click", startRitualSound);
  }

  // subtle click sound for interactions (requires you to place assets/click.mp3)
  let clickAudio;
  try {
    clickAudio = new Audio("assets/click.mp3");
    clickAudio.volume = 0.4;
  } catch (e) {
    clickAudio = null;
  }

  function playClick() {
    if (!clickAudio) return;
    // rewind so rapid clicks still play from start
    clickAudio.currentTime = 0;
    clickAudio.play().catch(() => {});
  }

  // attach to primary interactive elements
  const interactiveSelectors = [
    "button",
    ".ghost-btn",
    "nav a"
  ];

  document.querySelectorAll(interactiveSelectors.join(","))
    .forEach(el => {
      el.addEventListener("click", playClick);
    });
});

// CART
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(name, price, size) {
  cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push({ name, price, size });
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Added to cart.");
}

function showCart() {
  const el = document.getElementById("cartItems");
  if (!el) return;

  cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    el.innerHTML = `
      <div class="cart-empty">
        <p>Your ritual is empty.</p>
        <a href="uniform.html" class="ghost-btn">RETURN TO UNIFORM</a>
      </div>
    `;
    return;
  }

  let total = 0;
  el.innerHTML = "";

  cart.forEach((item, index) => {
    total += item.price;
    el.innerHTML += `
      <div class="cart-item">
        <div class="cart-item-main">
          <p class="cart-item-name">${item.name}</p>
          <p class="cart-item-meta">Size: ${item.size}</p>
        </div>
        <div class="cart-item-price">
          <span>₹${item.price}</span>
          <button class="cart-remove-btn" onclick="removeItem(${index})">REMOVE</button>
        </div>
      </div>
    `;
  });

  el.innerHTML += `
    <div class="cart-summary">
      <span class="cart-total-label">TOTAL</span>
      <span class="cart-total-amount">₹${total}</span>
    </div>
  `;
}

function removeItem(index) {
  cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  showCart();
}

// LOGIN REQUIRED
function requireLogin(callback) {
  auth.onAuthStateChanged(user => {
    if (user) callback(user);
    else {
      alert("Login required.");
      window.location.href = "auth.html";
    }
  });
}

// AUTH
function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      alert("Signup successful!");
      window.location.href = "uniform.html";
    })
    .catch(err => alert(err.message));
}

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      alert("Login successful!");
      window.location.href = "uniform.html";
    })
    .catch(err => alert(err.message));
}

function logout() {
  auth.signOut().then(() => {
    alert("Logged out.");
    window.location.href = "index.html";
  });
}

// PRODUCT GRID RENDER
function renderProductGrid() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  grid.innerHTML = "";

  products.forEach(p => {
    grid.innerHTML += `
      <div class="product">
        <img src="${p.image}" style="width:100%; border-radius:6px; border:1px solid #222; margin-bottom:15px;">
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <p class="price">₹${p.price}</p>

        <select id="size-${p.id}">
          <option>S</option><option>M</option><option>L</option><option>XL</option>
        </select>

        <div class="btn-row">
          <button onclick="addToCart('${p.name}',${p.price},document.getElementById('size-${p.id}').value)">
            ADD TO CART
          </button>

          <button class="buy-btn" onclick="buyNow('${p.name}',${p.price},document.getElementById('size-${p.id}').value)">
            BUY NOW
          </button>
        </div>

        <br>
        <a href="product.html?id=${p.id}" class="ghost-btn">VIEW PRODUCT</a>
      </div>
    `;
  });
}

// SINGLE PRODUCT PAGE
function renderSingleProduct() {
  const page = document.getElementById("productPage");
  if (!page) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const product = products.find(p => p.id === id);

  if (!product) {
    page.innerHTML = "<h2>Product not found.</h2>";
    return;
  }

  page.innerHTML = `
    <div class="auth-box">
      <img src="${product.image}" style="width:100%; border-radius:8px; border:1px solid #222; margin-bottom:20px;">
      <h2>${product.name}</h2>
      <p style="margin-top:15px; font-family:JetBrains Mono;">${product.description}</p>
      <p style="margin-top:15px;"><strong>₹${product.price}</strong></p>

      <select id="singleSize">
        <option>S</option><option>M</option><option>L</option><option>XL</option>
      </select>

      <br><br>

      <button onclick="addToCart('${product.name}',${product.price},document.getElementById('singleSize').value)">
        ADD TO CART
      </button>

      <button class="buy-btn" onclick="buyNow('${product.name}',${product.price},document.getElementById('singleSize').value)">
        BUY NOW
      </button>

      <br><br>
      <a href="uniform.html" class="ghost-btn">BACK</a>
    </div>
  `;
}

// BUY NOW (SINGLE PRODUCT)
function buyNow(name, price, size) {
  requireLogin(user => {
    openRazorpay(user, [{ name, price, size }], price);
  });
}

// CART CHECKOUT
function checkoutCart() {
  requireLogin(user => {
    cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
      alert("Cart empty.");
      return;
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    openRazorpay(user, cart, total);
  });
}

// RAZORPAY POPUP
function openRazorpay(user, items, total) {
  const options = {
    key: RAZORPAY_KEY,
    amount: total * 100,
    currency: "INR",
    name: "ELIXR",
    description: "Ritual Uniform Order",
    prefill: { email: user.email },

    handler: function (response) {
      saveOrderToFirebase(user, items, total, response.razorpay_payment_id);
    },

    theme: { color: "#0B0B0B" }
  };

  new Razorpay(options).open();
}

// SAVE ORDER + EMAIL
function saveOrderToFirebase(user, items, total, paymentId) {
  db.collection("orders").add({
    userEmail: user.email,
    items: items,
    totalAmount: total,
    paymentId: paymentId,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    sendOrderEmail(user.email, items, total);

    localStorage.setItem("lastOrder", JSON.stringify({
      items,
      total,
      paymentId
    }));

    localStorage.removeItem("cart");
    window.location.href = "success.html";
  })
  .catch(err => {
    console.error(err);
    alert("Order saving failed.");
  });
}

// EMAIL SEND
function sendOrderEmail(email, items, total) {
  const itemsText = items.map(i =>
    `${i.name} | Size: ${i.size} | ₹${i.price}`
  ).join("\n");

  // Replace with your EmailJS IDs
  emailjs.send("service_xxxx", "template_xxxx", {
    to_email: email,
    items: itemsText,
    total: total
  })
  .then(() => console.log("Email sent"))
  .catch(err => console.log("Email failed", err));
}

// ADMIN PAGE LOAD
function loadAdminOrders() {
  requireLogin(user => {
    if (user.email !== ADMIN_EMAIL) {
      alert("Access denied.");
      window.location.href = "index.html";
      return;
    }

    const el = document.getElementById("adminOrders");
    el.innerHTML = "<p>Loading orders...</p>";

    db.collection("orders").orderBy("createdAt", "desc").get()
      .then(snapshot => {
        el.innerHTML = "";

        snapshot.forEach(doc => {
          const o = doc.data();
          el.innerHTML += `
            <div style="border:1px solid #333; padding:15px; margin:15px 0;">
              <p><strong>Email:</strong> ${o.userEmail}</p>
              <p><strong>Total:</strong> ₹${o.totalAmount}</p>
              <p><strong>Payment:</strong> ${o.paymentId}</p>
              <p><strong>Items:</strong></p>
              <pre style="text-align:left; white-space:pre-wrap; font-family:JetBrains Mono;">
${o.items.map(i => `${i.name} (${i.size})`).join("\n")}
              </pre>
            </div>
          `;
        });
      });
  });
}
