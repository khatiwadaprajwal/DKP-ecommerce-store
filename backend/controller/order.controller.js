const Order = require("../model/order.model");
const OrderItem = require("../model/orderitem.model");
const Product = require("../model/productmodel");
const axios = require("axios");
const { generateAccessToken, PAYPAL_API } = require("../utils/paypal");

// Create Order
exports.createOrder = async (req, res) => {
    try {
        const { userId, productId, quantity, address, location, paymentMethod } = req.body;

        // Find product
        const product = await Product.findById(productId);
        if (!product || product.totalQuantity < quantity) {
            return res.status(400).json({ error: "Product not available" });
        }

        const totalAmount = quantity * product.price;

        // Create Order
        const order = new Order({
            userId,
            totalAmount,
            address,
            location,
            paymentMethod,
            status: "Pending",
            paymentStatus: paymentMethod === "PayPal" ? "Pending" : "Paid"
        });

        await order.save();

        // Create Order Item
        const orderItem = new OrderItem({
            orderId: order._id,
            productId,
            quantity,
            price: product.price,
            totalPrice: totalAmount
        });

        await orderItem.save();

        if (paymentMethod === "PayPal") {
            try {
                // Get PayPal Access Token
                const accessToken = await generateAccessToken();

                // Create PayPal Payment
                const paymentData = {
                    intent: "sale",
                    payer: { payment_method: "paypal" },
                    redirect_urls: {
                        return_url: `http://localhost:3001/v1/paypal/success?orderId=${order._id}`,
                        cancel_url: "http://localhost:3001/v1/paypal/cancel"
                    },
                    transactions: [{ amount: { currency: "USD", total: totalAmount.toFixed(2) } }]
                };

                // Make API Call to PayPal
                const response = await axios.post(
                    `${PAYPAL_API}/v1/payments/payment`,
                    paymentData,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json"
                        }
                    }
                );

                // Extract approval URL
                const approvalUrl = response.data.links.find(link => link.rel === "approval_url").href;

                return res.json({ message: "Redirect to PayPal", approvalUrl });

            } catch (paypalError) {
                console.error("PayPal Payment Error:", paypalError);
                return res.status(500).json({ error: "PayPal payment initialization failed" });
            }
        } else {
            // Update stock for COD payments
            product.totalQuantity -= quantity;
            product.totalSold += quantity;
            await product.save();

            return res.status(201).json({ message: "Order placed successfully", order });
        }

    } catch (error) {
        console.error("Order Creation Error:", error);
        return res.status(500).json({ error: "Order creation failed" });
    }
};

// PayPal Payment Success
exports.paypalSuccess = async (req, res) => {
    try {
        const { orderId, paymentId, PayerID } = req.query;

        // Get PayPal Access Token
        const accessToken = await generateAccessToken();

        // Execute PayPal Payment
        const response = await axios.post(
            `${PAYPAL_API}/v1/payments/payment/${paymentId}/execute`,
            { payer_id: PayerID },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (response.status !== 200) {
            return res.status(500).json({ error: "Payment execution failed" });
        }

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ error: "Order not found" });

        order.paymentStatus = "Paid";
        await order.save();

        // Update Product Stock After PayPal Payment
        const orderItems = await OrderItem.find({ orderId });
        for (let item of orderItems) {
            const product = await Product.findById(item.productId);
            if (product) {
                product.totalQuantity -= item.quantity;
                product.totalSold += item.quantity;
                await product.save();
            }
        }

        return res.json({ message: "Payment successful", order });

    } catch (error) {
        console.error("PayPal Success Error:", error);
        return res.status(500).json({ error: error.message });
    }
};

// Cancel Order
exports.cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ error: "Order not found" });

        if (order.status === "Cancelled") return res.status(400).json({ error: "Order already cancelled" });

        const orderItems = await OrderItem.find({ orderId });

        for (let item of orderItems) {
            const product = await Product.findById(item.productId);
            if (product) {
                product.totalQuantity += item.quantity; // Restore quantity
                product.totalSold -= item.quantity; // Reduce total sold
                await product.save();
            }
        }

        order.status = "Cancelled";
        await order.save();

        return res.status(200).json({ message: "Order cancelled successfully", order });

    } catch (error) {
        console.error("Order Cancellation Error:", error);
        return res.status(500).json({ error: error.message });
    }
};

// Get All Orders for Logged-in User
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id });

        // Fetch associated order items for each order
        const ordersWithItems = await Promise.all(
            orders.map(async (order) => {
                const orderItems = await OrderItem.find({ orderId: order._id }).populate("productId", "name price");
                return { ...order._doc, orderItems };
            })
        );

        return res.status(200).json(ordersWithItems);
    } catch (error) {
        console.error("Get Orders Error:", error);
        return res.status(500).json({ error: "Failed to retrieve orders" });
    }
};
