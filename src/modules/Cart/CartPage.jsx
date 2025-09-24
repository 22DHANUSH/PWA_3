import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Divider,
  message,
  Spin,
  Tag,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import {
  getCartByUserId,
  getCartItemsByCart,
  updateCartItem,
  deleteCartItem,
  getImagesBySku,
} from "./cart.api";
import "./Cart.css";

const { Title, Text } = Typography;

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      setLoading(true);
      const { data: cartData } = await getCartByUserId(userId);
      setCart(cartData);

      if (!cartData) {
        setItems([]);
        return;
      }

      const { data: itemsData } = await getCartItemsByCart(cartData.cartId);

      const itemsWithImages = await Promise.all(
        itemsData.map(async (item) => {
          if (!item.productSkuId) return item;
          try {
            const images = await getImagesBySku(item.productSkuId);
            return {
              ...item,
              productImage: images[0]?.imageUrl || item.productImage,
            };
          } catch (err) {
            console.error(`Image fetch failed for SKU ${item.productSkuId}:`, err);
            return item;
          }
        })
      );

      setItems(itemsWithImages);
    } catch (err) {
      console.error(err);
      message.error("Error fetching cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (cartItemId, value) => {
    try {
      await updateCartItem(cartItemId, value);
      setItems((prev) =>
        prev.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: value } : item
        )
      );
    } catch {
      message.error("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      await deleteCartItem(cartItemId);
      setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
      message.success("Item removed");
    } catch {
      message.error("Failed to remove item");
    }
  };

  const subtotal = items.reduce((acc, item) => {
    const price = parseFloat(item.productPrice.replace("$", ""));
    return acc + price * item.quantity;
  }, 0);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const total = subtotal;

  if (loading) {
    return (
      <div className="cart-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Row gutter={[16, 16]} className="cart-container">
      <Col xs={24} md={16}>
        <Title level={2}>My Cart</Title>
        {items.map((item) => {
          const price = parseFloat(item.productPrice.replace("$", ""));
          const itemTotal = price * item.quantity;

          return (
            <Card key={item.cartItemId} className="cart-item">
              <Row align="middle">
                {/* Product Image with Navigation */}
                <Col
                  span={4}
                  onClick={() =>
                    navigate(`/productdetails/${item.productId}/${item.productSkuId}`)
                  }
                  className="cart-product-clickable"
                >
                  <img
                    src={item.productImage}
                    alt={item.productTitle}
                    className="cart-product-image"
                  />
                </Col>

                {/* Product Details with Navigation */}
                <Col span={16} className="cart-product-details">
                  <Title
                    level={4}
                    className="cart-product-title"
                    onClick={() =>
                      navigate(`/productdetails/${item.productId}/${item.productSkuId}`)
                    }
                  >
                    {item.productTitle}{" "}
                    {item.isOutOfStock && <Tag color="red">Out of Stock</Tag>}
                  </Title>

                  <Text strong>{item.productPrice}</Text>
                  <div className="cart-product-meta">
                    <Text type="secondary">
                      Size: {item.productSize} | Color: {item.productColor}
                    </Text>
                  </div>

                  <div className="cart-product-quantity">
                    <div className="quantity-inline">
                      <Text style={{ marginRight: 8 }}>Quantity:</Text>
                      <Button
                        size="small"
                        onClick={() =>
                          handleUpdateQuantity(
                            item.cartItemId,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        disabled={item.isOutOfStock || item.quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="quantity-value">{item.quantity}</span>
                      <Button
                        size="small"
                        onClick={() =>
                          handleUpdateQuantity(item.cartItemId, item.quantity + 1)
                        }
                        disabled={item.isOutOfStock}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  {/* Individual Product Total */}
                  <div className="cart-product-total">
                    <Text strong>Total: ${itemTotal.toFixed(2)}</Text>
                  </div>
                </Col>

                {/* Delete Button */}
                <Col span={4} className="cart-remove-btn">
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveItem(item.cartItemId)}
                  />
                </Col>
              </Row>
            </Card>
          );
        })}
      </Col>

      {/* Order Summary */}
      <Col xs={24} md={8}>
        <Card>
          <Title level={4}>Cart Details</Title>
          <Row justify="space-between">
            <Text>Subtotal</Text>
            <Text>${subtotal.toFixed(2)}</Text>
          </Row>
          <Row justify="space-between">
            <Text>Total Items</Text>
            <Text>{totalItems}</Text>
          </Row>
          <Divider />
          <Button
            type="primary"
            block
            size="large"
            className="checkout-btn"
            onClick={() => navigate("/checkout")}
          >
            View Order Summary →
          </Button>
          <Button
            block
            size="large"
            style={{ marginTop: "10px" }}
            onClick={() => navigate("/products")}
          >
            ← Continue Shopping
          </Button>
        </Card>
      </Col>
    </Row>
  );
};

export default CartPage;


// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Card,
//   Row,
//   Col,
//   Typography,
//   Button,
//   Divider,
//   message,
//   Spin,
//   Tag,
// } from "antd";
// import { DeleteOutlined } from "@ant-design/icons";
// import {
//   getCartByUserId,
//   getCartItemsByCart,
//   updateCartItem,
//   deleteCartItem,
//   getImagesBySku,
// } from "./cart.api";
// import "./Cart.css";

// const { Title, Text } = Typography;

// const CartPage = () => {
//   const [cart, setCart] = useState(null);
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const userId = localStorage.getItem("userId");
//   const navigate = useNavigate();

//   const fetchCart = async () => {
//     try {
//       setLoading(true);

//       const { data: cartData } = await getCartByUserId(userId);
//       setCart(cartData);

//       if (!cartData) {
//         setItems([]);
//         return;
//       }

//       const { data: itemsData } = await getCartItemsByCart(cartData.cartId);

//       const itemsWithImages = await Promise.all(
//         itemsData.map(async (item) => {
//           if (!item.productSkuId) return item;
//           try {
//             const images = await getImagesBySku(item.productSkuId);
//             return {
//               ...item,
//               productImage: images[0]?.imageUrl || item.productImage,
//             };
//           } catch (err) {
//             console.error(`Image fetch failed for SKU ${item.productSkuId}:`, err);
//             return item;
//           }
//         })
//       );

//       setItems(itemsWithImages);
//     } catch (err) {
//       console.error(err);
//       message.error("Error fetching cart");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCart();
//   }, []);

//   const handleUpdateQuantity = async (cartItemId, value) => {
//     try {
//       await updateCartItem(cartItemId, value);
//       setItems((prev) =>
//         prev.map((item) =>
//           item.cartItemId === cartItemId ? { ...item, quantity: value } : item
//         )
//       );
//     } catch {
//       message.error("Failed to update quantity");
//     }
//   };

//   const handleRemoveItem = async (cartItemId) => {
//     try {
//       await deleteCartItem(cartItemId);
//       setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
//       message.success("Item removed");
//     } catch {
//       message.error("Failed to remove item");
//     }
//   };

//   const subtotal = items.reduce((acc, item) => {
//     const price = parseFloat(item.productPrice.replace("$", ""));
//     return acc + price * item.quantity;
//   }, 0);

//   const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
//   const total = subtotal;

//   if (loading) {
//     return (
//       <div className="cart-loading">
//         <Spin size="large" />
//       </div>
//     );
//   }

//   return (
//     <Row gutter={[16, 16]} className="cart-container">
//       <Col xs={24} md={16}>
//         <Title level={2}>My Cart</Title>
//         {items.map((item) => {
//           const price = parseFloat(item.productPrice.replace("$", ""));
//           const itemTotal = price * item.quantity;

//           return (
//             <Card key={item.cartItemId} className="cart-item">
//               <Row align="middle">
//                 {/* Product Image with Navigation */}
//                 <Col
//                   span={4}
//                   onClick={() =>
//                     navigate(`/productdetails/${item.productId}/${item.productSkuId}`)
//                   }
//                   className="cart-product-clickable"
//                 >
//                   <img
//                     src={item.productImage}
//                     alt={item.productTitle}
//                     className="cart-product-image"
//                   />
//                 </Col>

//                 {/* Product Details with Navigation */}
//                 <Col span={16} className="cart-product-details">
//                   <Title
//                     level={4}
//                     className="cart-product-title"
//                     onClick={() =>
//                       navigate(`/productdetails/${item.productId}/${item.productSkuId}`)
//                     }
//                   >
//                     {item.productTitle}{" "}
//                     {item.isOutOfStock && <Tag color="red">Out of Stock</Tag>}
//                   </Title>

//                   <Text strong>{item.productPrice}</Text>
//                   <div className="cart-product-meta">
//                     <Text type="secondary">
//                       Size: {item.productSize} | Color: {item.productColor}
//                     </Text>
//                   </div>

//                   {/* Custom Quantity Control */}
//                   <div className="cart-product-quantity">
//                     <Text>Quantity: </Text>
//                     <div className="quantity-controls">
//                       <Button
//                         size="small"
//                         onClick={() =>
//                           handleUpdateQuantity(
//                             item.cartItemId,
//                             Math.max(1, item.quantity - 1)
//                           )
//                         }
//                         disabled={item.isOutOfStock || item.quantity <= 1}
//                       >
//                         -
//                       </Button>
//                       <span className="quantity-value">{item.quantity}</span>
//                       <Button
//                         size="small"
//                         onClick={() =>
//                           handleUpdateQuantity(item.cartItemId, item.quantity + 1)
//                         }
//                         disabled={item.isOutOfStock}
//                       >
//                         +
//                       </Button>
//                       <div className="cart-product-total">
//                     <Text strong>Total: ${itemTotal.toFixed(2)}</Text>
//                   </div>
//                     </div>
                    
//                   </div>

//                   {/* Individual Product Total */}
//                   <div className="cart-product-total">
//                     <Text strong>Total: ${itemTotal.toFixed(2)}</Text>
//                   </div>
//                 </Col>

//                 {/* Delete Button */}
//                 <Col span={4} className="cart-remove-btn">
//                   <Button
//                     type="text"
//                     danger
//                     icon={<DeleteOutlined />}
//                     onClick={() => handleRemoveItem(item.cartItemId)}
//                   />
//                 </Col>
//               </Row>
//             </Card>
//           );
//         })}
//       </Col>

//       {/* Order Summary */}
//       <Col xs={24} md={8}>
//         <Card>
//           <Title level={4}>Cart Details</Title>
//           <Row justify="space-between">
//             <Text>Subtotal</Text>
//             <Text>${subtotal.toFixed(2)}</Text>
//           </Row>
//           <Row justify="space-between">
//             <Text>Total Items</Text>
//             <Text>{totalItems}</Text>
//           </Row>
//           <Divider />
//           <Button
//             type="primary"
//             block
//             size="large"
//             className="checkout-btn"
//             onClick={() => navigate("/checkout")}
//           >
//             View Order Summary →
//           </Button>
//           <Button
//             block
//             size="large"
//             style={{ marginTop: "10px" }}
//             onClick={() => navigate("/products")}
//           >
//             ← Continue Shopping
//           </Button>
//         </Card>
//       </Col>
//     </Row>
//   );
// };

// export default CartPage;
