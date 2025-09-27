import React, { useEffect, useState } from "react";
import {
  Card,
  Tag,
  Image,
  Pagination,
  Spin,
  message,
  Typography,
  Divider,
  Row,
  Col,
  Space,
  Button,
} from "antd";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CarOutlined,
  ShoppingCartOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllOrdersByUser, setOrderItems } from "../../redux/orderSlice";
import Orders_api from "../../../../app/Orders.api";
import { getProductImagesWithSas } from "../../../Users/users.api";

const { Text, Title } = Typography;

const MyOrder = () => {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth.userId);
  const { orders = [], loading } = useSelector((state) => state.order);

  const [expanded, setExpanded] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const paginatedOrders = orders.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (userId) {
      dispatch(fetchAllOrdersByUser(userId));
    }
  }, [userId, dispatch]);

  const fetchOrderItems = async (orderId) => {
    try {
      const response = await Orders_api.get(`/order_items/byOrder/${orderId}`);
      const items = await Promise.all(
        (Array.isArray(response.data) ? response.data : []).map(
          async (item, index) => {
            let imageUrl = "/placeholder.png";
            try {
              const imgRes = await getProductImagesWithSas(item.productSkuId);
              const primary = imgRes.find((img) => img.isPrimary);
              if (primary) imageUrl = primary.imageUrl;
            } catch {
              // Ignore image fetch failures gracefully
            }

            return {
              id: `${orderId}-${index}`,
              product_name: item.productName || "N/A",
              sku: item.productSkuId || "N/A",
              image: imageUrl,
              quantity: item.quantity || 0,
              unitPrice: item.productPrice || 0,
              totalPrice: item.totalItemPrice || 0,
              size: item.productSize || "",
              color: item.productColor || "",
            };
          }
        )
      );
      dispatch(setOrderItems({ orderId, items }));
    } catch (err) {
      message.error("Failed to load order details.");
    }
  };

  const toggleExpand = (id) => {
    const isExpanding = expanded !== id;
    setExpanded(isExpanding ? id : null);

    const order = orders.find((o) => o.orderId === id);
    if (isExpanding && order && !order.items) {
      fetchOrderItems(id);
    }
  };

  const statusTag = (status) => {
    const iconMap = {
      Delivered: <CheckCircleOutlined />,
      Shipped: <CarOutlined />,
      Pending: <ClockCircleOutlined />,
    };
    const colorMap = {
      Delivered: "green",
      Shipped: "blue",
      Pending: "orange",
    };
    return (
      <Tag
        color={colorMap[status] || "default"}
        icon={iconMap[status] || <ShoppingCartOutlined />}
        style={{ fontWeight: 600, fontSize: 14, padding: "4px 10px" }}
      >
        {status}
      </Tag>
    );
  };

  return (
    <div style={{ padding: "32px 24px", maxWidth: 960, margin: "0 auto" }}>
      {/* Title with black color */}
      <Title level={3} style={{ marginBottom: 24, color: "#000000" }}>
        My Orders
      </Title>

      {loading ? (
        <Spin size="large" style={{ display: "block", margin: "60px auto" }} />
      ) : (
        <>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {paginatedOrders.length === 0 && (
              <Text type="secondary" style={{ fontSize: 16 }}>
                No orders found.
              </Text>
            )}

            {paginatedOrders.map((order) => (
              <motion.div
                key={order.orderId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  hoverable
                  onClick={() => toggleExpand(order.orderId)}
                  style={{
                    borderRadius: 12,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                  bodyStyle={{ padding: "20px 24px" }}
                  bordered={false}
                >
                  <Row justify="space-between" align="middle" gutter={[16, 16]}>
                    <Col xs={18} sm={16} md={18}>
                      <Text strong style={{ fontSize: 16 }}>
                        Order #{order.orderId}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {new Date(order.orderDate).toLocaleDateString()}
                      </Text>
                    </Col>

                    <Col
                      xs={6}
                      sm={8}
                      md={6}
                      style={{ textAlign: "right", userSelect: "none" }}
                    >
                      {statusTag(order.status)}
                      <div
                        style={{
                          marginTop: 6,
                          fontWeight: "bold",
                          fontSize: 18,
                          color: "#262626",
                        }}
                      >
                        ₹{order.totalAmount.toFixed(2)}
                      </div>
                      {/* Track Order Button */}
                      <Button
                        type="primary"
                        size="small"
                        style={{
                          marginTop: 8,
                          borderRadius: 6,
                          backgroundColor: "#1890ff",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          message.info(`Tracking Order #${order.orderId}`);
                        }}
                      >
                        Track Order
                      </Button>

                      <motion.div
                        animate={{
                          rotate: expanded === order.orderId ? 180 : 0,
                        }}
                        transition={{ duration: 0.25 }}
                        style={{
                          marginLeft: "auto",
                          display: "inline-block",
                          marginTop: 8,
                        }}
                      >
                        <DownOutlined style={{ fontSize: 18, color: "#1890ff" }} />
                      </motion.div>
                    </Col>
                  </Row>

                  <AnimatePresence initial={false}>
                    {expanded === order.orderId && order.items?.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Divider style={{ margin: "16px 0" }} />
                        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                          {order.items.map((item) => (
                            <Card
                              key={item.id}
                              type="inner"
                              size="small"
                              style={{
                                borderRadius: 10,
                                boxShadow:
                                  "0 2px 8px rgba(0, 0, 0, 0.05)",
                                backgroundColor: "#fafafa",
                                cursor: "default",
                              }}
                              bodyStyle={{ padding: 12 }}
                            >
                              <Row justify="space-between" align="middle" gutter={16}>
                                <Col xs={16} sm={18} md={16} lg={18}>
                                  <Space size="middle" align="center">
                                    <Image
                                      width={64}
                                      src={item.image}
                                      alt={item.product_name}
                                      style={{ borderRadius: 8, objectFit: "cover" }}
                                      preview={false}
                                      fallback="/placeholder.png"
                                    />
                                    <div>
                                      <Text strong style={{ fontSize: 15 }}>
                                        {item.product_name}
                                      </Text>
                                      <br />
                                      <Text type="secondary" style={{ fontSize: 13 }}>
                                        SKU: {item.sku}
                                      </Text>
                                      <br />
                                      <Text type="secondary" style={{ fontSize: 13 }}>
                                        Size: {item.size || "N/A"}
                                      </Text>
                                      <br />
                                      <Text type="secondary" style={{ fontSize: 13 }}>
                                        Color: {item.color || "N/A"}
                                      </Text>
                                    </div>
                                  </Space>
                                </Col>
                                <Col xs={8} sm={6} md={8} lg={6} style={{ textAlign: "right" }}>
                                  <Text style={{ fontSize: 14 }}>Qty: {item.quantity}</Text>
                                  <br />
                                  <Text style={{ fontSize: 14 }}>
                                    Unit: ₹{item.unitPrice.toFixed(2)}
                                  </Text>
                                  <br />
                                  <Text strong style={{ fontSize: 16, color: "#1890ff" }}>
                                    Total: ₹{item.totalPrice.toFixed(2)}
                                  </Text>
                                </Col>
                              </Row>
                            </Card>
                          ))}
                        </Space>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </Space>

          <Pagination
            current={page}
            total={orders.length}
            pageSize={pageSize}
            onChange={(p) => setPage(p)}
            style={{ marginTop: 32, textAlign: "center" }}
            showSizeChanger={false}
            size="default"
          />
        </>
      )}
    </div>
  );
};

export default MyOrder;
// import React, { useEffect, useState } from "react";
// import {
//   Card,
//   Tag,
//   Image,
//   Pagination,
//   Spin,
//   message,
//   Typography,
//   Divider,
// } from "antd";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   CheckCircleOutlined,
//   ClockCircleOutlined,
//   CarOutlined,
//   ShoppingCartOutlined,
//   DownOutlined,
// } from "@ant-design/icons";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchAllOrdersByUser } from "../../redux/orderSlice";
// import Orders_api from "../../../../app/Orders.api"; // adjust path

// const { Text, Title } = Typography;

// const MyOrder = () => {
//   const dispatch = useDispatch();
//   const userId = useSelector((state) => state.auth.userId);
//   const { orders = [], loading } = useSelector((state) => state.order);

//   const [expanded, setExpanded] = useState(null);
//   const [page, setPage] = useState(1);
//   const pageSize = 5;

//   const paginatedOrders = orders.slice((page - 1) * pageSize, page * pageSize);

//   useEffect(() => {
//     if (userId) {
//       dispatch(fetchAllOrdersByUser(userId));
//     }
//   }, [userId]);

//   const fetchOrderItems = async (orderId) => {
//     try {
//       const response = await Orders_api.get(`/order_items/byOrder/${orderId}`);
//       const items = Array.isArray(response.data)
//         ? response.data.map((item, index) => ({
//             id: `${orderId}-${index}`,
//             product_name: item.productName || "N/A",
//             sku: item.sku || item.productSkuId || "N/A",
//             image: item.imageUrl || "/placeholder.png",
//             quantity: item.quantity || 0,
//             price:
//               item.totalItemPrice || item.price || item.unitPrice || 0,
//           }))
//         : [];

//       const updatedOrders = orders.map((order) =>
//         order.orderId === orderId ? { ...order, items } : order
//       );
//       dispatch({ type: "order/fetchAllOrdersByUser/fulfilled", payload: updatedOrders });
//     } catch (err) {
//       console.error("Error fetching order items:", err);
//       message.error("Failed to load order details.");
//     }
//   };

//   const toggleExpand = (id) => {
//     const isExpanding = expanded !== id;
//     setExpanded(isExpanding ? id : null);

//     const order = orders.find((o) => o.orderId === id);
//     if (isExpanding && order && !order.items) {
//       fetchOrderItems(id);
//     }
//   };

//   const statusTag = (status) => {
//     const iconMap = {
//       Delivered: <CheckCircleOutlined />,
//       Shipped: <CarOutlined />,
//       Pending: <ClockCircleOutlined />,
//     };
//     const colorMap = {
//       Delivered: "green",
//       Shipped: "blue",
//       Pending: "orange",
//     };
//     return (
//       <Tag
//         color={colorMap[status] || "default"}
//         icon={iconMap[status] || <ShoppingCartOutlined />}
//       >
//         {status}
//       </Tag>
//     );
//   };

//   return (
//     <div className="p-4">
//       <Title level={3} style={{ marginBottom: 16 }}>
//         My Orders
//       </Title>

//       {loading ? (
//         <Spin size="large" style={{ display: "block", margin: "20px auto" }} />
//       ) : (
//         <>
//           <div className="space-y-6">
//             {paginatedOrders.map((order) => (
//               <motion.div
//                 key={order.orderId}
//                 initial={{ opacity: 0, y: 30 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.4 }}
//               >
//                 <Card
//                   hoverable
//                   className="rounded-xl shadow-md border border-gray-200"
//                   onClick={() => toggleExpand(order.orderId)}
//                   style={{ cursor: "pointer" }}
//                 >
//                   <div className="flex justify-between items-center">
//                     <div>
//                       <Text strong>Order #{order.orderId}</Text>
//                       <br />
//                       <Text type="secondary">
//                         {new Date(order.orderDate).toLocaleDateString()}
//                       </Text>
//                     </div>
//                     <div style={{ textAlign: "right" }}>
//                       {statusTag(order.status)}
//                       <p
//                         style={{
//                           marginTop: 6,
//                           fontWeight: "bold",
//                           fontSize: 16,
//                         }}
//                       >
//                         ₹{order.totalAmount.toFixed(2)}
//                       </p>
//                       <motion.div
//                         animate={{ rotate: expanded === order.orderId ? 180 : 0 }}
//                         transition={{ duration: 0.3 }}
//                       >
//                         <DownOutlined />
//                       </motion.div>
//                     </div>
//                   </div>

//                   <AnimatePresence>
//                     {expanded === order.orderId && order.items?.length > 0 && (
//                       <motion.div
//                         initial={{ height: 0, opacity: 0 }}
//                         animate={{ height: "auto", opacity: 1 }}
//                         exit={{ height: 0, opacity: 0 }}
//                         transition={{ duration: 0.4 }}
//                       >
//                         <Divider />
//                         <div className="space-y-4">
//                           {order.items.map((item) => (
//                             <div
//                               key={item.id}
//                               className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
//                               onClick={(e) => e.stopPropagation()}
//                             >
//                               <div className="flex items-center space-x-4">
//                                 <Image
//                                   width={60}
//                                   src={item.image}
//                                   alt="product"
//                                   className="rounded-lg"
//                                   fallback="/placeholder.png"
//                                 />
//                                 <div>
//                                   <Text strong>{item.product_name}</Text>
//                                   <br />
//                                   <Text type="secondary">SKU: {item.sku}</Text>
//                                 </div>
//                               </div>
//                               <div style={{ textAlign: "right" }}>
//                                 <p>Qty: {item.quantity}</p>
//                                 <p className="font-semibold">
//                                   ₹{item.price.toFixed(2)}
//                                 </p>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </Card>
//               </motion.div>
//             ))}
//           </div>

//           <Pagination
//             current={page}
//             total={orders.length}
//             pageSize={pageSize}
//             onChange={(p) => setPage(p)}
//             style={{ marginTop: 24, textAlign: "center" }}
//           />
//         </>
//       )}
//     </div>
//   );
// };

// export default MyOrder;


// import React, { useEffect, useState } from "react";
// import {
//   Card,
//   Tag,
//   Image,
//   Pagination,
//   Spin,
//   message,
//   Typography,
//   Divider,
// } from "antd";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   CheckCircleOutlined,
//   ClockCircleOutlined,
//   CarOutlined,
//   ShoppingCartOutlined,
//   DownOutlined,
// } from "@ant-design/icons";

// import api from "../../../../app/api";

// const { Text, Title } = Typography;

// const MyOrder = ({ userId = 1 }) => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [expanded, setExpanded] = useState(null);
//   const [page, setPage] = useState(1);
//   const [total, setTotal] = useState(0);
//   const pageSize = 5;

//   useEffect(() => {
//     if (userId) fetchOrders(page);
//   }, [page, userId]);

//   const fetchOrders = async (pageNum) => {
//     try {
//       setLoading(true);
//       const response = await api.get(`/orders/orderByUser/${userId}`, {
//         params: { user_id: userId, page: pageNum, limit: pageSize },
//       });

//       const rawOrders = Array.isArray(response.data) ? response.data : [];

//       const transformedOrders = rawOrders.map((order) => ({
//         id: order.orderId,
//         created_at: order.orderDate,
//         status: order.status || order.orderStatus || "Processing",
//         total_amount: order.totalAmount || 0,
//       }));

//       setOrders(transformedOrders);
//       setTotal(transformedOrders.length);
//     } catch (err) {
//       console.error("Error fetching orders:", err);
//       message.error("Failed to load orders. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchOrderItems = async (orderId) => {
//     try {
//       const response = await api.get(`/order_items/byOrder/${orderId}`, {
//         params: { order_id: orderId },
//       });

//       const items = Array.isArray(response.data)
//         ? response.data.map((item, index) => ({
//             id: `${orderId}-${index}`,
//             product_name: item.productName || "N/A",
//             sku: item.sku || item.productSkuId || "N/A",
//             image: item.imageUrl || "/placeholder.png",
//             quantity: item.quantity || 0,
//             price:
//               item.totalItemPrice ||
//               item.price ||
//               item.unitPrice ||
//               0, // FIXED: prioritize totalItemPrice
//           }))
//         : [];

//       setOrders((prevOrders) =>
//         prevOrders.map((order) =>
//           order.id === orderId ? { ...order, items } : order
//         )
//       );
//     } catch (err) {
//       console.error("Error fetching order items:", err);
//       message.error("Failed to load order details.");
//     }
//   };

//   const toggleExpand = (id) => {
//     const isExpanding = expanded !== id;
//     setExpanded(isExpanding ? id : null);

//     if (isExpanding) {
//       const order = orders.find((o) => o.id === id);
//       if (!order.items) {
//         fetchOrderItems(id);
//       }
//     }
//   };

//   const statusTag = (status) => {
//     const iconMap = {
//       Delivered: <CheckCircleOutlined />,
//       Shipped: <CarOutlined />,
//       Pending: <ClockCircleOutlined />,
//     };
//     const colorMap = {
//       Delivered: "green",
//       Shipped: "blue",
//       Pending: "orange",
//     };
//     return (
//       <Tag
//         color={colorMap[status] || "default"}
//         icon={iconMap[status] || <ShoppingCartOutlined />}
//       >
//         {status}
//       </Tag>
//     );
//   };

//   return (
//     <div className="p-4">
//       <Title level={3} style={{ marginBottom: 16 }}>
//         My Orders
//       </Title>

//       {loading ? (
//         <Spin size="large" style={{ display: "block", margin: "20px auto" }} />
//       ) : (
//         <>
//           <div className="space-y-6">
//             {orders.map((order) => (
//               <motion.div
//                 key={order.id}
//                 initial={{ opacity: 0, y: 30 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.4 }}
//               >
//                 <Card
//                   hoverable
//                   className="rounded-xl shadow-md border border-gray-200"
//                   onClick={() => toggleExpand(order.id)}
//                   style={{ cursor: "pointer" }}
//                 >
//                   <div className="flex justify-between items-center">
//                     <div>
//                       <Text strong>Order #{order.id}</Text>
//                       <br />
//                       <Text type="secondary">
//                         {new Date(order.created_at).toLocaleDateString()}
//                       </Text>
//                     </div>
//                     <div style={{ textAlign: "right" }}>
//                       {statusTag(order.status)}
//                       <p
//                         style={{
//                           marginTop: 6,
//                           fontWeight: "bold",
//                           fontSize: 16,
//                         }}
//                       >
//                         ₹{order.total_amount.toFixed(2)}
//                       </p>
//                       <motion.div
//                         animate={{ rotate: expanded === order.id ? 180 : 0 }}
//                         transition={{ duration: 0.3 }}
//                       >
//                         <DownOutlined />
//                       </motion.div>
//                     </div>
//                   </div>

//                   <AnimatePresence>
//                     {expanded === order.id && order.items && (
//                       <motion.div
//                         initial={{ height: 0, opacity: 0 }}
//                         animate={{ height: "auto", opacity: 1 }}
//                         exit={{ height: 0, opacity: 0 }}
//                         transition={{ duration: 0.4 }}
//                       >
//                         <Divider />
//                         <div className="space-y-4">
//                           {order.items.map((item) => (
//                             <div
//                               key={item.id}
//                               className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
//                               onClick={(e) => e.stopPropagation()}
//                             >
//                               <div className="flex items-center space-x-4">
//                                 <Image
//                                   width={60}
//                                   src={item.image}
//                                   alt="product"
//                                   className="rounded-lg"
//                                   fallback="/placeholder.png"
//                                 />
//                                 <div>
//                                   <Text strong>{item.product_name}</Text>
//                                   <br />
//                                   <Text type="secondary">SKU: {item.sku}</Text>
//                                 </div>
//                               </div>
//                               <div style={{ textAlign: "right" }}>
//                                 <p>Qty: {item.quantity}</p>
//                                 <p className="font-semibold">
//                                   ₹{item.price.toFixed(2)}
//                                 </p>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </Card>
//               </motion.div>
//             ))}
//           </div>

//           <Pagination
//             current={page}
//             total={total}
//             pageSize={pageSize}
//             onChange={(p) => setPage(p)}
//             style={{ marginTop: 24, textAlign: "center" }}
//           />
//         </>
//       )}
//     </div>
//   );
// };

// export default MyOrder;
