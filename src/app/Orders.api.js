import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_ORDERS_URL;

const Orders_api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Add Buy Now API
export const createBuyNowOrder = (userId, productSkuId, quantity) =>
  Orders_api.post(`/orders/buy-now`, { userId, productSkuId, quantity });

export default Orders_api;
