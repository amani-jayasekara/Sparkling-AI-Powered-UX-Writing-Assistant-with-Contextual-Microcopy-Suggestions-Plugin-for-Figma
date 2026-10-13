const axios = require("axios");
const config = require("../config/env");

exports.generate = async (data) => {
    try {
        console.log("========== SENDING TO AI BACKEND ==========");
        console.log(data);

        const response = await axios.post(
            config.AI_BACKEND_URL,
            data,
            {
                headers: {
                    "Content-Type": "application/json"
                },
                timeout: 180000
            }
        );

        console.log("========== AI BACKEND RESPONSE ==========");
        console.log(response.data);

        return response.data;

    } catch (error) {

        console.error("========== AI BACKEND ERROR ==========");

        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Response:", error.response.data);
        } else if (error.request) {
            console.error("No response received from AI backend.");
            console.error(error.message);
        } else {
            console.error("Request error:", error.message);
        }

        throw error;
    }
};