const axios = require("axios");
const config = require("../config/env");

exports.generate = async (data) => {

    const response = await axios.post(
        config.AI_BACKEND_URL,
        data
    );

    return response.data;

};