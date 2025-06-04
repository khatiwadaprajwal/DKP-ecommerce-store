const axios = require("axios");
require("dotenv").config();

const KHALTI_API = "https://khalti.com/api/v2";

async function verifyKhaltiPayment(token, amount) {
  try {
    const response = await axios.post(
      `${KHALTI_API}/payment/verify/`,
      { token, amount },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("❌ Khalti verification failed:", error.response?.data || error.message);
    throw new Error("Khalti payment verification failed.");
  }
}

module.exports = { verifyKhaltiPayment };
