import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Typography,
  Divider,
  Button,
  Spin,
  Row,
  Col,
  message,
  Image,
  Space,
} from "antd";
import { ShoppingCartOutlined, HomeOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCartSummary,
  confirmOrder,
  createOrder,
setOrderMeta ,
} from "../../redux/orderSlice";
import { useNavigate } from 'react-router-dom';

import PromoCode from "../Components/PromoCode.jsx";
import { getImagesBySku } from "../../../Cart/cart.api";
import { fetchAddresses } from "../../../Users/users.api";

const { Title, Text } = Typography;

export default function OrderReview() {
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.order);

  const userId = useSelector((state) => state.auth.userId);



  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [summary, setSummary] = useState({});
  const [orderItems, setOrderItems] = useState([]);
  const [address, setAddress] = useState({});
  const [orderMetaDetail, setOrderMetaDetail] = useState({});
  const [skuIds, setSkuIds] = useState([]);

  useEffect(() => {
    if (!userId) {
      message.error("User not logged in");
      return;
    }

    // if (buyNow && orderId) {
    //   dispatch(fetchOrderSummary({ userId, orderId }));
    // } else {
    dispatch(fetchCartSummary({ userId }));
    // }

    const fetchPrimaryAddress = async () => {
      try {
        const addresses = await fetchAddresses(userId);
        const primary = addresses.find((a) => a.isPrimary) || addresses[0];
        if (primary) setAddress(primary);
      } catch (err) {
        message.error("Unable to fetch address");
      }
    };

    fetchPrimaryAddress();
  }, [dispatch]);
  useEffect(() => {
    if (!data) return;

    const itemsArray = Object.keys(data)
      .filter((key) => !isNaN(key))
      .map((key) => data[key]);

    const fetchImagesForItems = async () => {
      const itemsWithImages = await Promise.all(
        itemsArray.map(async (item, index) => {
          try {
            const images = await getImagesBySku(item.productSkuId);
            return {
              key: index,
              name: item.productTitle,
              quantity: item.quantity,
              color: item.productColor,
              size: item.productSize,
              price: item.productPrice,
              totalItemPrice:
                item.quantity * parseFloat(item.productPrice.replace("$", "")),
              image: images[0]?.imageUrl || "/placeholder.png",
              productSkuId: item.productSkuId,
            };
          } catch {
            return {
              key: index,
              name: item.productTitle,
              quantity: item.quantity,
              color: item.productColor,
              size: item.productSize,
              price: item.productPrice,
              totalItemPrice:
                item.quantity * parseFloat(item.productPrice.replace("$", "")),
              image: "/placeholder.png",
              productSkuId: item.productSkuId,
            };
          }
        })
      );

      setOrderItems(itemsWithImages);
      setSkuIds(itemsWithImages.map((i) => i.productSkuId));

      setOrderMetaDetail({
        orderDate: data.orderDate || data.order?.orderDate || null,
      });
    };

    fetchImagesForItems();
  }, [data]);

  useEffect(() => {
    if (orderItems.length === 0) return;

    const subtotal = orderItems.reduce(
      (acc, item) => acc + item.totalItemPrice,
      0
    );
    const discountAmount = appliedDiscount?.discountAmount || 0;
    const total =
      appliedDiscount?.totalAfterDiscount ?? subtotal - discountAmount;

    setSummary({
      subtotal,
      tax: 0,
      discount: discountAmount,
      total,
    });
  }, [appliedDiscount, orderItems]);
  console.log(orderItems);
  const handleConfirmOrder = async () => {
    if (!userId || !summary.total || !address) {
      message.error("Missing order details");
      return;
    }

    try {
      // Step 1: Create the order
      const addressId = address.addressId;
      const totalAmount = summary.total;
      const createdOrder = await createOrder({
        userId,
        addressId,
        totalAmount,
      });
      console.log(createdOrder)
      // Step 2: Confirm the order items
      const result = await confirmOrder({ orderItems, createdOrder });
      dispatch(
        setOrderMeta({
          orderId: createdOrder,
          addressId: addressId,
          totalAmount: totalAmount,
        })
      );
      console.log(result);

      message.success("Order confirmed successfully!");
       navigate('/payment');

    } catch (err) {
      console.error("Order confirmation failed:", err);
      message.error("Order confirmation failed");
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency:"USD",
    }).format(isNaN(amount) ? 0 : amount);

  const columns = [
    {
      title: "",
      dataIndex: "image",
      key: "image",
      render: (url) => (
        <Image width={60} src={url} alt="Product" style={{ borderRadius: 8 }} />
      ),
    },
    {
      title: "Product",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary">
            Size: {record.size} • Color: {record.color}
          </Text>
        </Space>
      ),
    },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => formatCurrency(parseFloat(price.replace("$", ""))),
    },
    {
      title: "Total",
      key: "totalItemPrice",
      render: (_, record) => (
        <Text strong>{formatCurrency(record.totalItemPrice)}</Text>
      ),
    },
  ];

  if (loading)
    return (
      <Spin style={{ display: "block", margin: "100px auto" }} size="large" />
    );
  if (error) return <Text type="danger">{error}</Text>;

  return (
    <Row justify="center" style={{ marginTop: 40 }}>
      <Col xs={24} md={20} lg={16}>
        <Card
          style={{
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Title level={3}>
              <ShoppingCartOutlined /> Review Your Order
            </Title>
            <Text type="secondary">{orderMetaDetail.orderDate || ""}</Text>
          </Space>

          <Divider />

          <Title level={5}>
            <HomeOutlined /> Shipping Address
          </Title>
          <Card
            size="small"
            style={{ background: "#fafafa", borderRadius: 8, marginBottom: 16 }}
          >
            {Object.keys(address).length === 0 ? (
              <Text type="warning">No shipping address found</Text>
            ) : (
              <Space direction="vertical">
                {address.name && <Text>{address.name}</Text>}
                {address.street && <Text>{address.street}</Text>}
                {address.city && <Text>{address.city}</Text>}
                {address.state && <Text>{address.state}</Text>}
                {address.zip && <Text>{address.zip}</Text>}
              </Space>
            )}
          </Card>

          <Title level={5}>Order Items</Title>
          <Table
            columns={columns}
            dataSource={orderItems}
            pagination={false}
            style={{ marginBottom: 24 }}
          />

          <PromoCode
            skuIds={skuIds}
            subtotal={summary.subtotal}
            onApply={({ discount, discountAmount, totalAfterDiscount }) => {
              setAppliedDiscount({
                discount,
                discountAmount,
                totalAfterDiscount,
              });
            }}
          />

          <Divider />

          <Row justify="end">
            <Col>
              <Space direction="vertical" align="end">
                <Text>Subtotal: {formatCurrency(summary.subtotal)}</Text>
                <Text>Tax: {formatCurrency(summary.tax)}</Text>
                <Text type="danger">
                  Discount: -{formatCurrency(summary.discount)}
                </Text>
                <Divider style={{ margin: "8px 0" }} />
                <Title level={4}>Total: {formatCurrency(summary.total)}</Title>
              </Space>
            </Col>
          </Row>

          <Divider />

          <Row justify="end">
            <Button
              type="primary"
              size="large"
              disabled={orderItems.length === 0}
              style={{ borderRadius: 8 }}
              onClick={handleConfirmOrder}
            >
              Confirm & Proceed to Payment
            </Button>
          </Row>
        </Card>
      </Col>
    </Row>
  );
}
