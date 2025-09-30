// component -> OrderSummary.jsx :
import React, { useEffect, useState } from "react";
import { List, Divider, Typography, Spin } from "antd";
import "../../order.css"
import { getPrimaryImageBySku } from "../../order.api";
 
const { Text, Title } = Typography;
 
const OrderSummary = ({ products, totalAmount, shipping }) => {
  const [imageMap, setImageMap] = useState({});
  const [loadingImages, setLoadingImages] = useState(true);
 
  useEffect(() => {
    const fetchImages = async () => {
      const map = {};
      await Promise.all(
        products.map(async (item) => {
          const sku = item.productSkuId;
          if (!sku) {
            console.warn("Missing SKU ID for item:", item);
            return;
          }
          try {
            const imageUrl = await getPrimaryImageBySku(sku);
            map[sku] = imageUrl;
          } catch (error) {
            console.error(`Failed to fetch image for SKU ${sku}:`, error.message);
          }
        })
      );
      setImageMap(map);
      setLoadingImages(false);
      console.log("Image Map:", imageMap);
    };
 
    if (products?.length) {
      fetchImages();
    }
  }, [products]);
  console.log("OrderSummary products:", products);
 
  return (
    <div className="order-summary">
      <List
        className="order-summary-list"
        itemLayout="horizontal"
        dataSource={products}
        renderItem={(products) => (
          <List.Item className="order-summary-item">
            <List.Item.Meta
              avatar={
                loadingImages ? (
                  <Spin size="small" />
                ) : (
                  <img
                    src={imageMap[products.productSkuId]}
                    alt={products.productName}
                    style={{ width: 64, height: 64, objectFit: "cover" }}
                  />
                )
              }
              title={products.productName}
              description={
  <>
    <Text>Qty: {products.quantity}</Text>
    <br />
    {/* <Text>Total: ${products.totalItemPrice.toFixed(2)}</Text> */}
  </>
}
 
            />
          </List.Item>
        )}
      />
 
      <Divider style={{ margin: "8px 0" }} />
      <div className="order-summary-total">
  <Text strong>Total</Text>
  <Text strong>${totalAmount.toFixed(2)}</Text>
</div>
 
      <Divider style={{ margin: "8px 0" }} />
      <div className="order-summary-address">
        <Text strong className="shipping-title">Shipping Address</Text>
        {shipping.name && <Text>{shipping.name}</Text>}
        <br />
        <Text>{shipping.addressLine1}</Text>
        {shipping.addressLine2 && (
          <>
            <br />
            <Text>{shipping.addressLine2}</Text>
          </>
        )}
        <br />
        <Text>
          {shipping.city}, {shipping.state} {shipping.zip}
        </Text>
        <br />
        <Text>{shipping.country}</Text>
      </div>
    </div>
  );
};
  
export default OrderSummary;