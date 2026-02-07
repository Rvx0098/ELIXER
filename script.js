
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";


/* 🔥 FIREBASE CONFIG — PASTE YOURS */
const firebaseConfig = {
  apiKey: "AIzaSyB8AGDx9eOgUFjznYne0YWIGGiBrUosyvc",
  authDomain: "elixr-d3bd5.firebaseapp.com",
  projectId: "elixr-d3bd5",
  storageBucket: "elixr-d3bd5.firebasestorage.app",
  messagingSenderId: "937131245447",
  appId: "1:937131245447:web:06b7af9526819782f85d22",
  measurementId: "G-VWGLD2J9W8"
};
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
firebase.initializeApp(firebaseConfig);

// Check login status
function requireLogin(callback) {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      callback(user);
    } else {
      alert("Please login to continue");
      window.location.href = "auth.html";
    }
  });
}


const auth = firebase.auth();
const db = firebase.firestore();

/* CART */
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(name, price, size) {
  cart.push({ name, price, size });
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Added");
}

function showCart() {
  const el = document.getElementById("cartItems");
  el.innerHTML = "";
  cart.forEach(i => el.innerHTML += `<p>${i.name} (${i.size}) ₹${i.price}</p>`);
}

/* AUTH */
function signup() {
  auth.createUserWithEmailAndPassword(email.value, password.value)
    .then(() => alert("Signed up"));
}

function login() {
  auth.signInWithEmailAndPassword(email.value, password.value)
    .then(() => location.href="index.html");
}

/* CHECKOUT */
function checkout() {

  // 1️⃣ Get cart
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }

  // 2️⃣ Calculate total
  let total = cart.reduce((sum, item) => sum + item.price, 0);

  // 3️⃣ Razorpay options
  function checkout() {
  requireLogin((user) => {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    let total = cart.reduce((sum, item) => sum + item.price, 0);

    let options = {
      key: "rzp_test_XXXXXXXX", // YOUR RAZORPAY KEY ID
      amount: total * 100,
      currency: "INR",
      name: "ELIXR",
      description: "Ritual Uniform Order",

      handler: function (response) {
        handleSuccessfulPayment(user, cart, total);
      },

      prefill: {
        email: user.email
      },

      theme: {
        color: "#0B0B0B"
      }
    };

    new Razorpay(options).open();
  });
}


  // 4️⃣ Open Razorpay popup
  let rzp = new Razorpay(options);
  rzp.open();
}


/* SAVE ORDER + EMAIL */
function saveOrder() {
  const user = auth.currentUser;

  const order = {
    user: user.email,
    items: cart,
    date: new Date()
  };

  db.collection("orders").add(order);

  localStorage.setItem("lastOrder", JSON.stringify(order));

  emailjs.send("SERVICE_ID","TEMPLATE_ID",{
    email: user.email,
    order: JSON.stringify(cart)
  });

  location.href="success.html";
}
function saveOrderToFirebase(user, cart, total, paymentId) {
  return firebase.firestore().collection("orders").add({
    userEmail: user.email,
    items: cart,
    totalAmount: total,
    paymentId: paymentId,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}
function handleSuccessfulPayment(user, cart, total) {

  const paymentId = "RZP_" + Date.now(); // simple id for now

  saveOrderToFirebase(user, cart, total, paymentId)
    .then(() => {
      sendOrderEmail(user.email, cart, total);

      localStorage.setItem("lastOrder", JSON.stringify({
        items: cart,
        total: total
      }));

      localStorage.removeItem("cart");
      window.location.href = "success.html";
    })
    .catch(err => {
      console.error(err);
      alert("Order saved failed, contact support");
    });
}
function sendOrderEmail(email, cart, total) {
  let itemsText = cart.map(i =>
    `${i.name} (Size: ${i.size}) - ₹${i.price}`
  ).join("\n");

  emailjs.send("SERVICE_ID", "TEMPLATE_ID", {
    to_email: email,
    items: itemsText,
    total: total
  });
}
