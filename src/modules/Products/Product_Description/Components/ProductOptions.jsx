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

  // Sort sizes based on predefined order
  const sortedSizes = [...availableSizes].sort((a, b) => {
    const indexA = sizeOrder.indexOf(a.toUpperCase());
    const indexB = sizeOrder.indexOf(b.toUpperCase());

    // If size not found in order list, push it to the end
    return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
  });

  return (
    <>
      <Text strong style={{ marginBottom: 8, display: "block" }}>
        Color:
      </Text>
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "16px",
          flexWrap: "wrap",
        }}
      >
        {availableColors.map((color, idx) => {
          const imageUrl = colorImages[color];
          return (
            <Tooltip title={color} key={idx}>
              <Button
                type={selectedColor === color ? "primary" : "default"}
                style={{
                  backgroundColor: selectedColor === color ? "#000" : "#fff",
                  color: selectedColor === color ? "#fff" : "#000",
                  border: "1px solid #000",
                  padding: "0 12px",
                  minWidth: 80,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() => setSelectedColor(color)}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={color}
                    style={{
                      width: 24,
                      height: 24,
                      objectFit: "cover",
                      marginRight: 8,
                      borderRadius: 4,
                    }}
                  />
                ) : null}
                {color}
              </Button>
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
