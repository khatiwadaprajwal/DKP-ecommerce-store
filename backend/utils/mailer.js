const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", 
  port: 465,              
  secure: true,           
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  connectionTimeout: 10000, 
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

const sendOTPByEmail = async (email, otp) => {
  const mailOptions = {
    from: `"DKP STORE" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
  };

  try {
    console.log(`⏳ Attempting to send OTP to: ${email}...`);
    await transporter.sendMail(mailOptions);
    console.log("✅ OTP Sent successfully to:", email);
  } catch (error) {
    // Log the specific error code to see if it is a block or a timeout
    console.error("❌ Error Sending OTP:", error.code, error.message);
    throw error;
  }
};



const sendOrderEmail = async (email, orderDetails) => {
    const productLines = orderDetails.productDetails
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
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              color: #333;
            }
            .email-container {
              width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .header img {
              width: 150px;
            }
            .order-table {
              width: 100%;
              border-collapse: collapse;
            }
            .order-table th, .order-table td {
              padding: 10px;
              border: 1px solid #ddd;
              text-align: center;
            }
            .order-table th {
              background-color: #f8f8f8;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 14px;
              color: #777;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <img src="https://example.com/logo.png" alt="Shop Logo" />
              <h2>🛒 Order Confirmation</h2>
            </div>
            <div>
              <p>Hello,</p>
              <p>Thank you for your order! Here are the details:</p>
              <table class="order-table">
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Color</th>
                  <th>Size</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total Price</th>
                </tr>
                ${productLines}
              </table>
              <p><strong>💰 Total Amount: </strong> NPR ${orderDetails.totalAmount}</p>
              <p><strong>🏠 Shipping Address: </strong> ${orderDetails.address}</p>
              <p><strong>💳 Payment Method: </strong> ${orderDetails.paymentMethod}</p>
              <p><strong>📦 Status: </strong> ${orderDetails.status}</p>
              <p>We appreciate your business!</p>
            </div>
            <div class="footer">
              <p>Best regards,<br/>Your Shop Team</p>
              <p><small>If you have any questions, please reply to this email.</small></p>
            </div>
          </div>
        </body>
      </html>
    `;
  
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "🛒 Order Confirmation",
      html: emailContent, // Send HTML content
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log("📩 Order email sent to:", email);
    } catch (error) {
      console.error("❌ Error sending order email:", error.message);
    }
  };
const sendOrderStatusUpdateEmail = async (email, orderDetails) => {
    const productDetails = orderDetails.orderItems
      .map((item, index) => {
        const productName = item.productId?.productName || 'N/A';
        const color = item.color || 'N/A';
        const size = item.size || 'N/A';
        const quantity = item.quantity || 0;
  
        return `${index + 1}. 🛍️ Product Name: ${productName}
     🎨 Color: ${color}
     📏 Size: ${size}
     🔢 Quantity: ${quantity}`;
      })
      .join('\n\n');
  
    const formattedDate = new Date(orderDetails.orderDate).toLocaleString("en-US", {
      timeZone: "Asia/Kathmandu",
      dateStyle: "full",
      timeStyle: "short",
    });
  
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "🛒 Order Status Updated",
      text: `Hello,
  
  Your order placed on ${formattedDate} has been updated.
  
  🧾 Order Summary:
  ${productDetails || 'No items in this order.'}
  
  💰 Total Amount: NPR ${orderDetails.totalAmount}
  📦 New Status: ${orderDetails.status}
  
  If you have any questions, please don't hesitate to contact us.
  
  Best regards,  
  Your Shop Team`,
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
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: subject || "📩 Reply from Our Team",
      text: `Hello,
  
  ${replyText}
  
  Best regards,  
  Your Support Team`,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log("✅ Reply email sent to:", recipientEmail);
    } catch (error) {
      console.error("❌ Error sending reply email:", error.message);
    }
  };
  
  
  

module.exports = { sendOTPByEmail, sendOrderEmail,sendOrderStatusUpdateEmail,replyToUserMessage};
