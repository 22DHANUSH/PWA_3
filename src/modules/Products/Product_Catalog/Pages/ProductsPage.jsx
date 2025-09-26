// ProductsPage.jsx
import React, { useEffect, useState } from "react";
import { Row, Col, Card, Spin, Empty, Typography, Button, Pagination, message } from "antd";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";
import { useProducts } from "../../ProductContext";
import { useNavigate } from "react-router-dom";
import { addWishlistItem, deleteWishlistItem, checkWishlist } from "../../../Users/users.api";
import { getCartByUserId, createCart, addCartItem, updateCartItem, getCartItemBySku } from "../../../Cart/cart.api";
import { useCart } from "../../../Cart/CartContext";

const { Title } = Typography;

// ---------- Guest cart helpers ----------
const getGuestCart = () => JSON.parse(localStorage.getItem("guestCart") || "[]");
const setGuestCart = (items) => localStorage.setItem("guestCart", JSON.stringify(items));

const addToGuestCart = (product, qty = 1) => {
  const sku = product.productSkuID || product.productSkuId || product.productSku || product.sku;
  if (!sku) {
    console.warn("addToGuestCart: no SKU found on product", product);
    return;
  }

  const guest = getGuestCart();
  const existing = guest.find((it) => it.productSkuId === sku);

  const priceRaw = product.productPrice ?? product.price ?? "0";
  const productPrice = typeof priceRaw === "string" && priceRaw.startsWith("$") ? priceRaw : `$${priceRaw}`;

  if (existing) {
    existing.quantity = (existing.quantity || 0) + qty;
  } else {
    guest.push({
      productSkuId: sku,
      productId: product.productId,
      productTitle: product.productName || product.productTitle || "",
      productImage: product.imageUrl || product.productImage || "https://placehold.co/250x250?text=No+Image",
      productPrice,
      quantity: qty,
      isOutOfStock: !!product.isOutOfStock,
      productSize: product.productSize,
      productColor: product.productColor,
    });
  }
  setGuestCart(guest);
};
// ----------------------------------------

function ProductsPage() {
  const { products, loading, pagination, setPagination } = useProducts();
  const navigate = useNavigate();
  const {refreshCartCount} = useCart();

  const userId = localStorage.getItem("userId");
  const [wishlistMap, setWishlistMap] = useState({});

  // Load wishlist state for visible products
  useEffect(() => {
    const fetchWishlistStates = async () => {
      if (!userId || products.length === 0) return;

      const map = {};
      for (const p of products) {
        try {
          const res = await checkWishlist(userId, p.productSkuID);
          if (res.isWishlisted) {
            map[p.productSkuID] = res.wishlistItem.wishlistItemId;
          } else {
            map[p.productSkuID] = null;
          }
        } catch {
          map[p.productSkuID] = null;
        }
      }
      setWishlistMap(map);
    };

    fetchWishlistStates();
  }, [products, userId]);

  // Add / remove wishlist
  const handleToggleWishlist = async (e, productSkuId) => {
    e.stopPropagation();
    if (!userId) {
      message.warning("Please log in to use wishlist");
      return;
    }

    const wishlistItemId = wishlistMap[productSkuId];

    try {
      if (wishlistItemId) {
        await deleteWishlistItem(wishlistItemId);
        message.error("Removed from wishlist");
        setWishlistMap((prev) => ({ ...prev, [productSkuId]: null }));
      } else {
        const addedAt = new Date().toISOString();
        const res = await addWishlistItem(userId, productSkuId, addedAt);
        if (res === -1) {
          message.info("Already in wishlist");
        } else {
          message.success("Added to wishlist");
          setWishlistMap((prev) => ({ ...prev, [productSkuId]: res }));
        }
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to update wishlist");
    }
  };

  // Add to cart (guest -> localStorage; logged-in -> DB)
  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    const sku = product.productSkuID || product.productSkuId || product.productSku || product.sku;
    if (!sku) {
      message.error("Product SKU is missing");
      return;
    }

    if (!userId) {
      addToGuestCart(product, 1);
      message.success("Added to cart");
      await refreshCartCount(); //  update cart header count
      return;
    }

    try {
      // Step 1: Get or create cart
      let cart = null;
      try {
        const res = await getCartByUserId(userId);
        cart = res.data;
      } catch {
        const res = await createCart(userId);
        cart = res.data;
      }

      // Step 2: Check if item already in cart
      let existingItem = null;
      try {
        const res = await getCartItemBySku(cart.cartId, sku);
        existingItem = res.data;
      } catch (err) {
        if (err.response?.status === 404) {
          existingItem = null; // not in cart
        } else {
          throw err;
        }
      }

      if (existingItem) {
        await updateCartItem(existingItem.cartItemId, existingItem.quantity + 1);
        message.success("Updated cart quantity");
      } else {
        await addCartItem(cart.cartId, sku, 1);
        message.success("Added to cart");
        await refreshCartCount(); //  update cart header count
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      message.error("Failed to add to cart");
    }
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, pageNumber: page }));
  };

  return (
    <div style={{ padding: "0 16px" }}>
      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <Title level={4}>
          Products <span>({products.length})</span>
        </Title>
      </div>

      {loading ? (
        <Spin tip="Loading products..." />
      ) : products.length === 0 ? (
        <Empty description="No products found for selected filters." />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {products.map((p, idx) => {
              const wishlisted = wishlistMap[p.productSkuID] != null;
              return (
                <Col span={8} key={p.productId || `product-${idx}`}>
                  <Card
                    hoverable
                    style={{ position: "relative" }}
                    onClick={() => navigate(`/productdetails/${p.productId}/${p.productSkuID}`)}
                    cover={
                      <div style={{ position: "relative" }}>
                        <img
                          alt={p.productName || "Product"}
                          src={p.imageUrl?.startsWith("http") ? p.imageUrl : "https://placehold.co/250x250?text=No+Image"}
                          style={{ height: 200, objectFit: "contain", width: "100%" }}
                        />
                        {wishlisted ? (
                          <HeartFilled
                            onClick={(e) => handleToggleWishlist(e, p.productSkuID)}
                            style={{ position: "absolute", top: 8, right: 8, fontSize: 20, color: "black", cursor: "pointer" }}
                          />
                        ) : (
                          <HeartOutlined
                            onClick={(e) => handleToggleWishlist(e, p.productSkuID)}
                            style={{ position: "absolute", top: 8, right: 8, fontSize: 20, color: "#090909ff", cursor: "pointer" }}
                          />
                        )}
                      </div>
                    }
                  >
                    <Card.Meta
                      title={p.productName ?? "Unnamed Product"}
                      description={
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                          <span style={{ fontWeight: 700, fontSize: 20, color: "#222" }}>${p.productPrice ?? "—"}</span>
                          <div style={{ display: "flex", gap: 8 }}>
                            <Button type="primary" size="middle" onClick={(e) => handleAddToCart(e, p)}>
                              Add to Cart
                            </Button>
                            <Button type="default" size="middle">
                              Buy Now
                            </Button>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              );
            })}
          </Row>

          <div style={{ marginTop: "30px", textAlign: "center" }}>
            <Pagination current={pagination.pageNumber} pageSize={pagination.pageSize} total={pagination.total} onChange={handlePageChange} showSizeChanger={false} />
          </div>
        </>
      )}
    </div>
  );
}

export default ProductsPage;
