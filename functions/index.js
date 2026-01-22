const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe');
const cors = require('cors')({ origin: true });

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Stripe with secret key from environment
// TODO: Set this using: firebase functions:config:set stripe.secret_key="sk_test_YOUR_KEY"
const stripeClient = stripe(functions.config().stripe.secret_key);

/**
 * Create Stripe Payment Intent
 * Called from checkout.js to initialize payment
 */
exports.createPaymentIntent = functions.https.onRequest((req, res) => {
    return cors(req, res, async () => {
        // Only allow POST requests
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            const { amount, currency = 'czk', metadata = {} } = req.body;

            // Validate amount
            if (!amount || amount < 1) {
                return res.status(400).json({ error: 'Invalid amount' });
            }

            // Create Payment Intent
            const paymentIntent = await stripeClient.paymentIntents.create({
                amount: Math.round(amount), // Amount in smallest currency unit (haléře for CZK)
                currency: currency.toLowerCase(),
                automatic_payment_methods: {
                    enabled: true,
                },
                metadata: {
                    source: 'beer-3d-eshop',
                    ...metadata
                }
            });

            console.log('Payment Intent created:', paymentIntent.id);

            res.json({
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            });

        } catch (error) {
            console.error('Error creating payment intent:', error);
            res.status(500).json({
                error: 'Failed to create payment intent',
                message: error.message
            });
        }
    });
});

/**
 * Stripe Webhook Handler
 * Receives events from Stripe (payment succeeded, failed, etc.)
 */
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).send('Method not allowed');
    }

    const sig = req.headers['stripe-signature'];

    // TODO: Set webhook secret using: firebase functions:config:set stripe.webhook_secret="whsec_YOUR_SECRET"
    const webhookSecret = functions.config().stripe.webhook_secret;

    let event;

    try {
        // Verify webhook signature
        event = stripeClient.webhooks.constructEvent(
            req.rawBody,
            sig,
            webhookSecret
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    console.log('Stripe webhook event:', event.type);

    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('PaymentIntent succeeded:', paymentIntent.id);

            // Update order in Firestore
            await updateOrderStatus(paymentIntent.id, 'paid', paymentIntent);
            break;

        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log('PaymentIntent failed:', failedPayment.id);

            // Update order in Firestore
            await updateOrderStatus(failedPayment.id, 'failed', failedPayment);
            break;

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    // Return 200 to acknowledge receipt of the event
    res.json({ received: true });
});

/**
 * Helper function to update order status in Firestore
 */
async function updateOrderStatus(paymentIntentId, status, paymentData) {
    try {
        const db = admin.firestore();

        // Find order by payment intent ID
        const ordersRef = db.collection('orders');
        const snapshot = await ordersRef
            .where('paymentIntentId', '==', paymentIntentId)
            .limit(1)
            .get();

        if (snapshot.empty) {
            console.warn('No matching order found for payment intent:', paymentIntentId);
            return;
        }

        const orderDoc = snapshot.docs[0];

        // Update order status
        await orderDoc.ref.update({
            status: status,
            paymentData: {
                id: paymentData.id,
                amount: paymentData.amount,
                currency: paymentData.currency,
                status: paymentData.status
            },
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log('Order updated successfully:', orderDoc.id);
    } catch (error) {
        console.error('Error updating order:', error);
    }
}

/**
 * Get order details (optional - for fetching order info)
 */
exports.getOrder = functions.https.onRequest((req, res) => {
    return cors(req, res, async () => {
        const orderId = req.query.orderId;

        if (!orderId) {
            return res.status(400).json({ error: 'Order ID required' });
        }

        try {
            const db = admin.firestore();
            const orderDoc = await db.collection('orders').doc(orderId).get();

            if (!orderDoc.exists) {
                return res.status(404).json({ error: 'Order not found' });
            }

            res.json({
                id: orderDoc.id,
                ...orderDoc.data()
            });
        } catch (error) {
            console.error('Error fetching order:', error);
            res.status(500).json({ error: 'Failed to fetch order' });
        }
    });
});
