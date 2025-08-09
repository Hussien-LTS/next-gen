import axios from 'axios';

export async function sendVQL(baseUrl, clientId, query, authToken) {
  try {
    const config = {
      method: 'get' as const,
      maxBodyLength: Infinity,
      url: `${baseUrl}/query`,
      headers: {
        Authorization: authToken,
        Accept: 'application/json',
        'X-VaultAPI-DescribeQuery': 'true',
        'X-VaultAPI-ClientID': clientId,
      },
      params: { q: query },
    };

    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    console.error('🚀 ~ sendVQL ~ samah:', error);
    throw error; // Optional: rethrow if you want upstream handling
  }
}
