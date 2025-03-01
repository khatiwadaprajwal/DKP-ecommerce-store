const axios = require("axios");
require("dotenv").config();

const PAYPAL_API = "https://api-m.sandbox.paypal.com"; // Use "https://api-m.paypal.com" for live mode

async function generateAccessToken() {
    const auth = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
    ).toString("base64");

    try {
        const response = await axios.post(
            `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
            "grant_type=client_credentials",
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );

        return response.data.access_token;
    } catch (error) {
        console.error("PayPal Access Token Error:", error.response?.data || error.message);
        throw new Error("Failed to generate PayPal access token.");
    }
}


module.exports = { generateAccessToken,PAYPAL_API };
