import cart_api from "../../app/cart.axios";
import user_api from "../../app/users.axios";

// --- Cart Endpoints ---
export const createCart = (userId) => cart_api.post(`/carts`, { userId });

export const getCartById = (cartId) => cart_api.get(`/carts/${cartId}`);

export const getCartByUserId = (userId) => cart_api.get(`/carts/user/${userId}`);

export const updateCart = (cartId, userId, updatedAt) => cart_api.put(`/carts/${cartId}?userId=${userId}`, { updatedAt });

export const deleteCart = (cartId) => cart_api.delete(`/carts/${cartId}`);

// --- Cart Items Endpoints ---
export const addCartItem = (cartId, productSkuId, quantity) => cart_api.post(`/cart_items`, { cartId, productSkuId, quantity });

export const getCartItems = () => cart_api.get(`/cart_items`);

export const getCartItemById = (cartItemId) => cart_api.get(`/cart_items/${cartItemId}`);

export const updateCartItem = (cartItemId, quantity) => cart_api.put(`/cart_items/${cartItemId}`, { quantity });

export const deleteCartItem = (cartItemId) => cart_api.delete(`/cart_items/${cartItemId}`);

export const getCartItemsByCart = (cartId) => cart_api.get(`/cart_items/display/by-cart/${cartId}`);

export const getCartItemBySku = (cartId, skuId) => cart_api.get(`/cart_items/${cartId}/sku/${skuId}`);

/////////////////////// S A S //////////////////////////////////////////////
export async function getImagesBySku(skuId) {
  try {
    const response = await user_api.get(`/blob/GenerateSasToken/${skuId}/1`);
    return Array.isArray(response.data) ? response.data.slice(0, 9) : [];
  } catch (error) {
    console.error(`Failed to fetch images for SKU ${skuId}:`, error.message);
    return [];
  }
}
/////////////////////////////////////////////////////////////////////////////

// --- Utility: Add to Cart Flow ---
export const addToCartFlow = async (userId, productSkuId, quantity) => {
  // 1. Get or create user cart
  let cartRes = await getCartByUserId(userId);
  let cartId;

  if (!cartRes.data) {
    const newCart = await createCart(userId);
    cartId = newCart.data.cartId;
  } else {
    cartId = cartRes.data.cartId;
  }

  // 2. Check if item already exists
  try {
    const existingItem = await getCartItemBySku(cartId, productSkuId);
    if (existingItem?.data) {
      const newQty = existingItem.data.quantity + quantity;
      await updateCartItem(existingItem.data.cartItemId, newQty);
      return { ...existingItem.data, quantity: newQty };
    }
  } catch (err) {
    if (err.response?.status !== 404) {
      console.error("Unexpected error while checking existing cart item:", err);
      throw err; // Only throw if it's not a 404
    }
    // If 404, proceed to add new item
  }

  // 3. Add as new item
  const newItem = await addCartItem(cartId, productSkuId, quantity);
  return newItem.data;
};