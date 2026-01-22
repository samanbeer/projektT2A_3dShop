// Success Page Logic
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// Get order ID from URL
function getOrderIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('order_id');
}

// Get payment intent from URL
function getPaymentIntentFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('payment_intent');
}

// Load order details
async function loadOrderDetails() {
    const orderId = getOrderIdFromURL();

    if (!orderId) {
        console.error('No order ID found');
        document.getElementById('order-id').textContent = 'Neznámé';
        return;
    }

    try {
        // Get order from Firestore
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
            const order = orderSnap.data();

            // Update order status to paid
            await updateDoc(orderRef, {
                status: 'paid',
                paymentIntent: getPaymentIntentFromURL(),
                paidAt: new Date()
            });

            // Display order details
            document.getElementById('order-id').textContent = orderId;
            document.getElementById('customer-email').textContent = order.customerEmail || 'N/A';
            document.getElementById('total-amount').textContent = `${order.totalAmount.toLocaleString('cs-CZ')} Kč`;

            // Clear cart from localStorage
            localStorage.removeItem('beer3d_cart');

            console.log('Order loaded successfully:', order);
        } else {
            console.error('Order not found');
            document.getElementById('order-id').textContent = 'Nenalezeno';
        }
    } catch (error) {
        console.error('Error loading order:', error);
        document.getElementById('order-id').textContent = 'Chyba při načítání';
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadOrderDetails();
});
