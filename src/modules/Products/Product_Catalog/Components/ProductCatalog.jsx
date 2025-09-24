// ProductCatalog.jsx
import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Spin,
  Empty,
  Typography,
  Button,
  Pagination,
  message,
} from "antd";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";
import { useProducts } from "../../ProductContext";
import { useNavigate } from "react-router-dom";
import {
  checkWishlist,
  addWishlistItem,
  deleteWishlistItem,
} from "../../../Users/users.api";
import {
  getCartByUserId,
  createCart,
  addCartItem,
  updateCartItem,
  getCartItemBySku,
} from "../../../Carts/cart.api"; // ✅ import cart APIs

const { Title } = Typography;

function WishlistIcon({ userId, productSkuId }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState(null);

  useEffect(() => {
    const fetchWishlistStatus = async () => {
      try {
        const res = await checkWishlist(userId, productSkuId);
        if (res?.isWishlisted) {
          setWishlisted(true);
          setWishlistItemId(res.wishlistItemId);
        }
      } catch (err) {
        console.error("Error checking wishlist:", err);
      }
    };
    fetchWishlistStatus();
  }, [userId, productSkuId]);

  const toggleWishlist = async (e) => {
    e.stopPropagation();
    try {
      if (wishlisted) {
        await deleteWishlistItem(wishlistItemId);
        setWishlisted(false);
        setWishlistItemId(null);
      } else {
        const res = await addWishlistItem(userId, productSkuId);
        setWishlisted(true);
        setWishlistItemId(res.wishlistItemId);
      }
    } catch (err) {
      console.error("Error toggling wishlist:", err);
    }
  };

  return wishlisted ? (
    <HeartFilled
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        fontSize: 20,
        color: "red",
        cursor: "pointer",
      }}
      onClick={toggleWishlist}
    />
  ) : (
    <HeartOutlined
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        fontSize: 20,
        color: "#090909ff",
        cursor: "pointer",
      }}
      onClick={toggleWishlist}
    />
  );
}

function ProductCatalog() {
  const userId = localStorage.getItem("userId");
  const { products, loading, pagination, setPagination, currentUserId } = useProducts();
  const navigate = useNavigate();

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, pageNumber: page }));
  };

  // ✅ Add to cart logic
  const handleAddToCart = async (e, productSkuId) => {
    e.stopPropagation(); // prevent card click navigation
    if (!userId) {
      message.warning("Please log in to add items to cart");
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
      const existingItem = await getCartItemBySku(cart.cartId, productSkuId);

      if (existingItem?.data) {
        // Update quantity if exists
        await updateCartItem(existingItem.data.cartItemId, existingItem.data.quantity + 1);
        message.success("Updated cart quantity");
      } else {
        // Add as new item
        await addCartItem(cart.cartId, productSkuId, 1);
        message.success("Added to cart");
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      message.error("Failed to add to cart");
    }
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
            {products.map((p, idx) => (
              <Col span={8} key={p.productId || `product-${idx}`}>
                <Card
                  hoverable
                  style={{ position: "relative" }}
                  onClick={() =>
                    navigate(`/productdetails/${p.productId}/${p.productSkuID}`)
                  }
                  cover={
                    <div style={{ position: "relative" }}>
                      <img
                        alt={p.productName || "Product"}
                        src={
                          p.imageUrl?.startsWith("http")
                            ? p.imageUrl
                            : "https://placehold.co/250x250?text=No+Image"
                        }
                        style={{
                          height: 200,
                          objectFit: "contain",
                          width: "100%",
                        }}
                      />
                      <WishlistIcon
                        userId={currentUserId}
                        productSkuId={p.productSkuID}
                      />
                    </div>
                  }
                >
                  <Card.Meta
                    title={p.productName ?? "Unnamed Product"}
                    description={
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: 20,
                            color: "#222",
                          }}
                        >
                          ${p.productPrice ?? "—"}
                        </span>
                        <div style={{ display: "flex", gap: 8 }}>
                          <Button
                            type="primary"
                            size="middle"
                            onClick={(e) => handleAddToCart(e, p.productSkuID)} // ✅ Hooked up
                          >
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
            ))}
          </Row>
          <Pagination
            current={pagination.pageNumber}
            pageSize={pagination.pageSize}
            total={pagination.totalCount}
            onChange={handlePageChange}
            style={{ marginTop: 24, textAlign: "center" }}
          />
        </>
      )}
    </div>
  );
}

export default ProductCatalog;

// import React, { useState, useEffect } from "react";
// import {
//   Row,
//   Col,
//   Card,
//   Spin,
//   Empty,
//   Typography,
//   Button,
//   Pagination,
// } from "antd";
// import { HeartOutlined, HeartFilled } from "@ant-design/icons";
// import { useProducts } from "../../ProductContext";
// import { useNavigate } from "react-router-dom";
// import {checkWishlist,addWishlistItem,deleteWishlistItem,} from "../../../Users/users.api";

// const { Title } = Typography;

// function WishlistIcon({ userId, productSkuId }) {
//   const [wishlisted, setWishlisted] = useState(false);
//   const [wishlistItemId, setWishlistItemId] = useState(null);

//   useEffect(() => {
//     const fetchWishlistStatus = async () => {
//       try {
//         const res = await checkWishlist(userId, productSkuId);
//         if (res?.isWishlisted) {
//           setWishlisted(true);
//           setWishlistItemId(res.wishlistItemId);
//         }
//       } catch (err) {
//         console.error("Error checking wishlist:", err);
//       }
//     };
//     fetchWishlistStatus();
//   }, [userId, productSkuId]);

//   const toggleWishlist = async (e) => {
//     e.stopPropagation();
//     try {
//       if (wishlisted) {
//         await deleteWishlistItem(wishlistItemId);
//         setWishlisted(false);
//         setWishlistItemId(null);
//       } else {
//         const res = await addWishlistItem(userId, productSkuId);
//         setWishlisted(true);
//         setWishlistItemId(res.wishlistItemId);
//       }
//     } catch (err) {
//       console.error("Error toggling wishlist:", err);
//     }
//   };

//   return wishlisted ? (
//     <HeartFilled
//       style={{
//         position: "absolute",
//         top: 8,
//         right: 8,
//         fontSize: 20,
//         color: "red",
//         cursor: "pointer",
//       }}
//       onClick={toggleWishlist}
//     />
//   ) : (
//     <HeartOutlined
//       style={{
//         position: "absolute",
//         top: 8,
//         right: 8,
//         fontSize: 20,
//         color: "#090909ff",
//         cursor: "pointer",
//       }}
//       onClick={toggleWishlist}
//     />
//   );
// }

// function ProductCatalog() {
//   const userId = localStorage.getItem("userId");
//   const { products, loading, pagination, setPagination, currentUserId } = useProducts();
//   const navigate = useNavigate();

//   const handlePageChange = (page) => {
//     setPagination((prev) => ({ ...prev, pageNumber: page }));
//   };

//   return (
//     <div style={{ padding: "0 16px" }}>
//       <div style={{ marginTop: 16, marginBottom: 16 }}>
//         <Title level={4}>
//           Products <span>({products.length})</span>
//         </Title>
//       </div>

//       {loading ? (
//         <Spin tip="Loading products..." />
//       ) : products.length === 0 ? (
//         <Empty description="No products found for selected filters." />
//       ) : (
//         <>
//           <Row gutter={[16, 16]}>
//             {products.map((p, idx) => (
//               <Col span={8} key={p.productId || `product-${idx}`}>
//                 <Card
//                   hoverable
//                   style={{ position: "relative" }}
//                   onClick={() =>
//                     navigate(`/productdetails/${p.productId}/${p.productSkuID}`)
//                   }
//                   cover={
//                     <div style={{ position: "relative" }}>
//                       <img
//                         alt={p.productName || "Product"}
//                         src={
//                           p.imageUrl?.startsWith("http")
//                             ? p.imageUrl
//                             : "https://placehold.co/250x250?text=No+Image"
//                         }
//                         style={{
//                           height: 200,
//                           objectFit: "contain",
//                           width: "100%",
//                         }}
//                       />
//                       <WishlistIcon
//                         userId={currentUserId}
//                         productSkuId={p.productSkuID}
//                       />
//                     </div>
//                   }
//                 >
//                   <Card.Meta
//                     title={p.productName ?? "Unnamed Product"}
//                     description={
//                       <div
//                         style={{
//                           display: "flex",
//                           flexDirection: "column",
//                           alignItems: "center",
//                           gap: 12,
//                         }}
//                       >
//                         <span
//                           style={{
//                             fontWeight: 700,
//                             fontSize: 20,
//                             color: "#222",
//                           }}
//                         >
//                           ${p.productPrice ?? "—"}
//                         </span>
//                         <div style={{ display: "flex", gap: 8 }}>
//                           <Button type="primary" size="middle">
//                             Add to Cart
//                           </Button>
//                           <Button type="default" size="middle">
//                             Buy Now
//                           </Button>
//                         </div>
//                       </div>
//                     }
//                   />
//                 </Card>
//               </Col>
//             ))}
//           </Row>
//           <Pagination
//             current={pagination.pageNumber}
//             pageSize={pagination.pageSize}
//             total={pagination.totalCount}
//             onChange={handlePageChange}
//             style={{ marginTop: 24, textAlign: "center" }}
//           />
//         </>
//       )}
//     </div>
//   );
// }

// export default ProductCatalog;