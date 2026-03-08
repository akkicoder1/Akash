const axios = require('axios');

function createHttpClient({ baseURL, headers = {} }) {
  return axios.create({
    baseURL,
    timeout: 20000,
    headers
  });
}

module.exports = { createHttpClient };
