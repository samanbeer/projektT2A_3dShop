// Stripe Checkout Logic - UPDATED to use Firebase Cloud Functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD0IcMlE-qMKZhqI3eiCNEOqiPAsgwUt08",
    authDomain: "beer-3d-eshop.firebaseapp.com",
    projectId: "beer-3d-eshop",
    storageBucket: "beer-3d-eshop.firebasestorage.app",
    messagingSenderId: "134665446846",
    appId: "1:134665446846:web:f53b7082d77fee0f10c5ef",
    measurementId: "G-W4GGQYQ2EX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Stripe Publishable Key
const STRIPE_PUBLISHABLE_KEY = "pk_test_51MuyHeFC05EKUjeqTJWjGl3o6ugjMBxnxaociqFGpz149whQn89GFDLhFfTnAAFbHxBbUw3o2Gw6LbKhd76pN4DM00sRKdRsCx";

// TODO: Replace with your Firebase Function URL after deployment
// Get it after running: firebase deploy --only functions
const FIREBASE_FUNCTION_URL = "https://us-central1-beer-3d-eshop.cloudfunctions.net/createPaymentIntent";

// Initialize Stripe
const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);

let elements;
let cart = [];
let paymentIntentId = null;

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('beer3d_cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            cart = [];
        }
    }

    // If cart is empty, redirect to products
    if (cart.length === 0) {
        alert('Váš košík je prázdný!');
        window.location.href = '../index.html#produkty';
        return;
    }

    renderOrderSummary();
}

// Render order summary
function renderOrderSummary() {
    const orderItemsContainer = document.getElementById('order-items');
    const totalAmountElement = document.getElementById('order-total-amount');

    if (!orderItemsContainer) return;

    orderItemsContainer.innerHTML = cart.map(item => `
        <div class="order-item">
            <span class="order-item-name">${item.name}</span>
            <span class="order-item-qty">×${item.quantity}</span>
            <span class="order-item-price">${(item.cost * item.quantity).toLocaleString('cs-CZ')} Kč</span>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
    totalAmountElement.textContent = `${total.toLocaleString('cs-CZ')} Kč`;
}

// Calculate total amount in smallest currency unit (haléře)
function getCartTotal() {
    return cart.reduce((total, item) => total + (item.cost * item.quantity), 0);
}

// Initialize Stripe Payment Element
async function initialize() {
    const totalAmount = getCartTotal();

    try {
        // Call Firebase Function to create payment intent
        const response = await createPaymentIntent(totalAmount);

        if (!response || !response.clientSecret) {
            showMessage("Nepodařilo se inicializovat platbu. Zkuste to prosím později.");
            return;
        }

        const { clientSecret, paymentIntentId: piId } = response;
        paymentIntentId = piId;

        const appearance = {
            theme: 'night',
            variables: {
                colorPrimary: '#fbb92d',
                colorBackground: 'rgba(74, 42, 12, 0.6)',
                colorText: '#fdfbf7',
                colorDanger: '#ff3e3e',
                borderRadius: '12px',
            }
        };

        elements = stripe.elements({ clientSecret, appearance });

        const paymentElement = elements.create("payment");
        paymentElement.mount("#payment-element");
    } catch (error) {
        console.error('Error initializing payment:', error);
        showMessage('Nepodařilo se načíst platební formulář. Zkuste to prosím znovu.');
    }
}

// Call Firebase Function to create payment intent
async function createPaymentIntent(amount) {
    try {
        const response = await fetch(FIREBASE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: amount,
                currency: 'czk'
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error calling Firebase Function:', error);
        throw error;
    }
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const customerEmail = document.getElementById('customer-email').value;
    const customerName = document.getElementById('customer-name').value;
    const customerPhone = document.getElementById('customer-phone').value;

    // Save order to Firestore before payment
    try {
        const orderRef = await addDoc(collection(db, "orders"), {
            customerEmail,
            customerName,
            customerPhone,
            items: cart,
            totalAmount: getCartTotal(),
            status: 'pending',
            paymentIntentId: paymentIntentId,
            createdAt: serverTimestamp()
        });

        console.log("Order created:", orderRef.id);

        // Confirm payment with Stripe
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/platba/success.html?order_id=${orderRef.id}`,
                receipt_email: customerEmail,
            },
        });

        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                showMessage(error.message);
            } else {
                showMessage("Došlo k neočekávané chybě.");
            }
        }
    } catch (error) {
        console.error("Error creating order:", error);
        showMessage("Nepodařilo se vytvořit objednávku. Zkuste to prosím znovu.");
    }

    setLoading(false);
}

// Show message to user
function showMessage(messageText) {
    const messageContainer = document.querySelector("#payment-message");
    messageContainer.textContent = messageText;
    messageContainer.classList.remove('success');

    setTimeout(() => {
        messageContainer.textContent = "";
    }, 4000);
}

// Show loading state
function setLoading(isLoading) {
    const submitButton = document.querySelector("#submit-payment");
    const spinner = document.querySelector("#spinner");
    const buttonText = document.querySelector("#button-text");

    if (isLoading) {
        submitButton.disabled = true;
        spinner.style.display = "block";
        buttonText.textContent = "Zpracovávám...";
    } else {
        submitButton.disabled = false;
        spinner.style.display = "none";
        buttonText.textContent = "Zaplatit";
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    initialize();

    const form = document.getElementById('payment-form');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
});
