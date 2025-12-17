const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

// Ensure environment variables are loaded
dotenv.config();

// 1. PRODUCTION READY TRANSPORTER
// We use port 465 (SSL) which is the most reliable method for Gmail on Render.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // Must be your Gmail address (e.g. project.bot@gmail.com)
    pass: process.env.EMAIL_PASS, // Must be the 16-char App Password (no spaces)
  },
});

// 2. VERIFY CONNECTION ON STARTUP
// This helps you see in Render Logs immediately if the password is wrong
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email Server Error: ", error);
  } else {
    console.log("✅ Email Server is Ready to Send Messages");
  }
});

// --- FUNCTIONS ---

const sendOTPByEmail = async (email, otp) => {
  const mailOptions = {
    // Google requires the "from" address to match your authenticated email
    from: `"DKP STORE" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📩 OTP Sent to:", email);
  } catch (error) {
    console.error("❌ Error Sending OTP:", error.message);
    throw error; // Rethrow so your controller knows it failed
  }
};

const sendOrderEmail = async (email, orderDetails) => {
  // Safe check for productDetails to avoid crashing if empty
  const items = orderDetails.productDetails || [];
  
  const productLines = items
    .map((item, index) => {
      return `
    <tr>
      <td style="padding: 10px; border: 1px solid #ccc; text-align: center;">${index + 1}</td>
      <td style="padding: 10px; border: 1px solid #ccc;">${item.productName}</td>
      <td style="padding: 10px; border: 1px solid #ccc;">🎨 ${item.color}</td>
      <td style="padding: 10px; border: 1px solid #ccc;">📏 ${item.size}</td>
      <td style="padding: 10px; border: 1px solid #ccc;">🔢 ${item.quantity}</td>
      <td style="padding: 10px; border: 1px solid #ccc;">💵 NPR ${item.price}</td>
      <td style="padding: 10px; border: 1px solid #ccc;">💰 NPR ${item.totalPrice}</td>
    </tr>
    `;
    })
    .join("\n");

  const emailContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; }
            .email-container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; }
            .order-table { width: 100%; border-collapse: collapse; }
            .order-table th, .order-table td { padding: 10px; border: 1px solid #ddd; text-align: center; }
            .order-table th { background-color: #f8f8f8; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="email-container">
            <h2>🛒 Order Confirmation</h2>
            <p>Hello,</p>
            <p>Thank you for your order! Here are the details:</p>
            <table class="order-table">
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Color</th>
                <th>Size</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
              ${productLines}
            </table>
            <p><strong>💰 Total Amount: </strong> NPR ${orderDetails.totalAmount}</p>
            <p><strong>🏠 Shipping Address: </strong> ${orderDetails.address}</p>
            <p><strong>💳 Payment Method: </strong> ${orderDetails.paymentMethod}</p>
            <p><strong>📦 Status: </strong> ${orderDetails.status}</p>
          </div>
        </body>
      </html>
    `;

  const mailOptions = {
    from: `"DKP STORE" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🛒 Order Confirmation",
    html: emailContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📩 Order email sent to:", email);
  } catch (error) {
    console.error("❌ Error sending order email:", error.message);
    // Don't throw error here so the order process doesn't fail just because email failed
  }
};

const sendOrderStatusUpdateEmail = async (email, orderDetails) => {
  const items = orderDetails.orderItems || [];
  
  const productDetails = items
    .map((item, index) => {
      const productName = item.productId?.productName || "N/A";
      const color = item.color || "N/A";
      const size = item.size || "N/A";
      const quantity = item.quantity || 0;

      return `${index + 1}. 🛍️ ${productName} (Color: ${color}, Size: ${size}, Qty: ${quantity})`;
    })
    .join("\n");

  // Fix Date formatting error if date is invalid
  let formattedDate = new Date().toLocaleDateString();
  try {
      if(orderDetails.orderDate) {
          formattedDate = new Date(orderDetails.orderDate).toLocaleString("en-US", {
            timeZone: "Asia/Kathmandu",
            dateStyle: "full",
            timeStyle: "short",
          });
      }
  } catch (e) {
      console.log("Date formatting error", e);
  }

  const mailOptions = {
    from: `"DKP STORE" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🛒 Order Status Updated",
    text: `Hello,

Your order placed on ${formattedDate} has been updated.

🧾 Order Summary:
${productDetails || "No items summary available."}

💰 Total Amount: NPR ${orderDetails.totalAmount}
📦 New Status: ${orderDetails.status}

If you have any questions, please reply to this email.

Best regards,  
DKP Store Team`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📩 Order status update email sent to:", email);
  } catch (error) {
    console.error("❌ Error sending order status update email:", error.message);
  }
};

const replyToUserMessage = async (recipientEmail, subject, replyText) => {
  const mailOptions = {
    from: `"DKP STORE Support" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: subject || "📩 Reply from Our Team",
    text: `Hello,

${replyText}

Best regards,  
DKP Store Support Team`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Reply email sent to:", recipientEmail);
  } catch (error) {
    console.error("❌ Error sending reply email:", error.message);
  }
};

module.exports = {
  sendOTPByEmail,
  sendOrderEmail,
  sendOrderStatusUpdateEmail,
  replyToUserMessage,
};