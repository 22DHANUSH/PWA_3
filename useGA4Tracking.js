// useGA4Tracking.js
import { useEffect } from "react";

// Helper to safely parse price strings like "$123.45" or numeric values
const parsePrice = (price) => {
  if (!price) return 0;
  if (typeof price === "number") return price;
  return parseFloat(price.toString().replace(/[^0-9.-]+/g, "")) || 0;
};

const useGA4Tracking = () => {
  // Safe wrapper for gtag
  const sendEvent = (eventName, params = {}) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, params);
    } else {
      console.warn("GA4 not initialized or gtag missing");
    }
  };

  // Standard ecommerce events
  const trackViewItem = (product) => {
    const price = parsePrice(product.productPrice || product.price);
    const name =
      product.productTitle || product.productName || "Unnamed Product";
    const id = product.productSkuId || product.productSkuID || product.id;

    sendEvent("view_item", {
      currency: "USD",
      value: price,
      items: [
        {
          item_name: name,
          item_id: id,
          price,
        },
      ],
    });
  };

  const trackAddToCart = (product) => {
    const price = parsePrice(product.productPrice || product.price);
    sendEvent("add_to_cart", {
      currency: "USD",
      value: price,
      items: [
        {
          item_name:
            product.productTitle || product.productName || "Unnamed Product",
          item_id: product.productSkuId || product.productSkuID || product.id,
          price,
          quantity: product.quantity || 1,
        },
      ],
    });
  };

  const trackBeginCheckout = ({ items, total }) => {
    if (!items || items.length === 0) return;

    const gaItems = items.map((item) => ({
      item_id: item.productSkuId || item.productSkuID || item.item_id,
      item_name: item.productTitle || item.productName || "Unnamed Product",
      price: parsePrice(item.productPrice || item.price),
      quantity: item.quantity || 1,
    }));

    sendEvent("begin_checkout", {
      currency: "USD",
      value: parsePrice(total),
      items: gaItems,
    });
  };

  const trackPurchase = ({ items, value, transaction_id }) => {
    if (!items || items.length === 0) return;

    const gaItems = items.map((item) => ({
      item_id: item.productSkuId || item.id,
      item_name: item.productTitle || item.name || "Unnamed Product",
      price: parsePrice(item.productPrice || item.price),
      quantity: item.quantity || 1,
    }));

    sendEvent("purchase", {
      transaction_id: transaction_id || `txn_${Date.now()}`,
      currency: "USD",
      value:
        parsePrice(value) ||
        gaItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
      items: gaItems,
    });
  };

  // Custom Wishlist Tracking
  const trackAddToWishlist = (product) => {
    const price = parsePrice(product.productPrice || product.price);

    sendEvent("add_to_wishlist", {
      currency: "USD",
      value: price,
      items: [
        {
          item_name:
            product.productTitle || product.productName || "Unnamed Product",
          item_id: product.productSkuId || product.id,
          price,
        },
      ],
    });
  };

  return {
    trackViewItem,
    trackAddToCart,
    trackBeginCheckout,
    trackPurchase,
    trackAddToWishlist, // expose wishlist tracking
  };
};

export default useGA4Tracking;
