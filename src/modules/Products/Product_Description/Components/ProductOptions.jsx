import React, { useState, useEffect } from "react";
import { Typography, Button, Tooltip } from "antd";
 
const { Text } = Typography;
 
const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
 
const ProductOptions = ({
  availableColors,
  availableSizes,
  selectedColor,
  selectedSize,
  setSelectedColor,
  setSelectedSize,
  stock,
  colorImages,
  price,
}) => {
  const [quantity, setQuantity] = useState(1);
 
  useEffect(() => {
    setQuantity(1);
  }, [selectedColor, selectedSize, stock]);

 const sortedSizes = [...availableSizes].sort((a, b) => {
  const upperA = a.toUpperCase();
  const upperB = b.toUpperCase();
 
  const indexA = sizeOrder.indexOf(upperA);
  const indexB = sizeOrder.indexOf(upperB);
 
  const isNumericA = !isNaN(parseFloat(a));
  const isNumericB = !isNaN(parseFloat(b));
 
  if (isNumericA && isNumericB) {
    return parseFloat(a) - parseFloat(b); 
  }
 
  if (indexA !== -1 && indexB !== -1) {
    return indexA - indexB; 
  }
 
  if (indexA !== -1) return -1;
  if (indexB !== -1) return 1;
 
  return a.localeCompare(b); 
});

  return (
    <>
      <Text strong style={{ marginBottom: 8, display: "block" }}>
        Color:
      </Text>
<div
  style={{
    display: "flex",
    gap: "12px",
    marginBottom: "16px",
    flexWrap: "wrap",
  }}
>
  {availableColors.map((color, idx) => {
    const imageUrl = colorImages[color];
    return (
      <Tooltip title={color} key={idx}>
        <div
          onClick={() => setSelectedColor(color)}
          style={{
            border: selectedColor === color ? "2px solid #1890ff" : "1px solid #ccc",
            borderRadius: "50%",
            width: 48,
            height: 48,
            cursor: "pointer",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fff",
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={color}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
          ) : (
            <Text>{color}</Text>
          )}
        </div>
      </Tooltip>
    );
  })}
</div>
 
 
      <Text strong style={{ marginBottom: 8, display: "block" }}>
        Size:
      </Text>
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "16px",
          flexWrap: "wrap",
        }}
      >
        {sortedSizes.map((size, idx) => (
          <Button
            key={idx}
            type={selectedSize === size ? "primary" : "default"}
            style={{
              backgroundColor: selectedSize === size ? "#000" : "#fff",
              color: selectedSize === size ? "#fff" : "#000",
              border: "1px solid #000",
              minWidth: 60,
            }}
            onClick={() => setSelectedSize(size)}
          >
            {size}
          </Button>
        ))}
      </div>
 
      <div
        style={{
          borderRadius: 6,
          display: "inline-block",
          marginTop: 6,
          marginBottom: 6,
        }}
      >
        <Text strong style={{ fontSize: 35, color: "#000" }}>
          {price}
        </Text>
      </div>
    </>
  );
};
 
export default ProductOptions;
