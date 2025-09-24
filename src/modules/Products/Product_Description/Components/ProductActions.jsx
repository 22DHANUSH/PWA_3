import { useState, useEffect } from "react";
import { Button, Typography, message } from "antd";
import {
  ShoppingCartOutlined,
  ShoppingOutlined,
  MinusOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import WishlistButton from "../../../Users/WishlistItems/Components/WishlistButton";
import {                //////////////////////////////////////////////////////
  addToCartFlow,
} from "../../../Cart/cart.api"; 


const { Text } = Typography;

const ProductActions = ({ stock, price, userId, productSkuId }) => {
  const [quantity, setQuantity] = useState(1);
  const[loading, setLoading] = useState(false); /////////////////////////////////////////////////////////////////

  useEffect(() => {
    setQuantity(1);
  }, [stock]);

  const handleIncrease = () => {
    if (quantity < stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = async () => {  ////////////////////////////////////////////////////////////////////////////////
    try {
      setLoading(true);
      await addToCartFlow(userId, productSkuId, quantity);
      message.success("Added to cart!");
    } catch (error) {
      console.error("Add to cart failed:", error);
      message.error("Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Quantity and Price Row */}
      <div style={{ display: "flex", alignItems: "center", gap: "32px", flexWrap: "wrap" }}>
        {/* Quantity Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Text strong>Quantity:</Text>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              border: "1px solid #000",
              borderRadius: "4px",
              padding: "4px 8px",
            }}
          >
            <Button
              icon={<MinusOutlined />}
              onClick={handleDecrease}
              disabled={quantity <= 1}
              size="small"
            />
            <Text>{quantity}</Text>
            <Button
              icon={<PlusOutlined />}
              onClick={handleIncrease}
              disabled={quantity >= stock}
              size="small"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexWrap: "nowrap", // Prevent wrapping
          justifyContent: "flex-start",
        }}
      >
        <Button
          type="primary"
          icon={<ShoppingCartOutlined />}
          style={{
            backgroundColor: "#000",
            borderColor: "#000",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#333";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#000";
          }}
          onClick={handleAddToCart}
        >
          Add to Cart
        </Button>

        <Button
          type="default"
          icon={<ShoppingOutlined />}
          style={{
            borderColor: "#000",
            color: "#000",
            backgroundColor: "#fff",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f5f5f5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#fff";
          }}
        >
          Buy Now
        </Button>

        
        <div style={{ flex: 1, minWidth: "120px", maxWidth: "180px" }}>
          <WishlistButton userId={userId} productSkuId={productSkuId} />
        </div>

      </div>
    </div>
  );
};

export default ProductActions;