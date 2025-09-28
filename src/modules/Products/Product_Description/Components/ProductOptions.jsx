import React, { useState, useEffect } from "react";
import { Typography, Button, Tooltip } from "antd";
import {
  getSkusByProductId,
  getColorsByProductId,
  getSizesByProductId,
  getImagesBySku,
} from "../../products.api.js";

const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

const ProductOptions = ({
  productId,
  productSkuId,
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
  stock,
  quantity,
  setQuantity,
  onOptionsLoaded,
  setSelectedSku,
}) => {
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [colorImages, setColorImages] = useState({});
  const [skus, setSkus] = useState([]);
  const [price, setPrice] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const [skuData, colorsData, sizesData] = await Promise.all([
          getSkusByProductId(productId),
          getColorsByProductId(productId),
          getSizesByProductId(productId),
        ]);

        if (cancelled) return;

        setSkus(Array.isArray(skuData) ? skuData : []);
        setAvailableColors(Array.isArray(colorsData) ? colorsData : []);
        setAvailableSizes(Array.isArray(sizesData) ? sizesData : []);

        const initialSku =
          skuData.find((sku) => sku.productSkuId === productSkuId) || skuData[0];
        if (initialSku) {
          setSelectedColor(initialSku.productColor);
          setSelectedSize(initialSku.productSize);
          setSelectedSku(initialSku);
          setPrice(initialSku.productPrice);
          setQuantity(1);
        }

        // Fetch primary image for each color
        const colorImageMap = {};
        for (const sku of skuData) {
          const color = sku.productColor;
          if (!colorImageMap[color]) {
            try {
              const imageData = await getImagesBySku(sku.productSkuId);
              const primaryImage = imageData.find((img) => img.isPrimary) || imageData[0];
              if (primaryImage) {
                colorImageMap[color] = primaryImage.imageUrl;
              }
            } catch (error) {
              console.error(`Error fetching image for color ${color}:`, error);
            }
          }
        }
        if (!cancelled) setColorImages(colorImageMap);
      } catch (error) {
        console.error("Error fetching product options:", error);
      } finally {
        if (!cancelled && onOptionsLoaded) onOptionsLoaded(); // ✅ call parent callback here
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [productId, productSkuId]);

  useEffect(() => {
    if (!selectedColor || skus.length === 0) return;

    const skusForColor = skus.filter((sku) => sku.productColor === selectedColor);
    if (skusForColor.length > 0) {
      const validSizes = skusForColor.map((sku) => sku.productSize);
      const sizeToUse = validSizes.includes(selectedSize) ? selectedSize : validSizes[0];

      setSelectedSize(sizeToUse);

      const matchedSku = skusForColor.find((sku) => sku.productSize === sizeToUse);
      if (matchedSku) {
        setSelectedSku(matchedSku);
        setPrice(matchedSku.productPrice);
        setQuantity(1);
      }
    }
  }, [selectedColor]);

  useEffect(() => {
    if (!selectedSize || !selectedColor || skus.length === 0) return;

    const matchedSku = skus.find(
      (sku) => sku.productColor === selectedColor && sku.productSize === selectedSize
    );

    if (matchedSku) {
      setSelectedSku(matchedSku);
      setPrice(matchedSku.productPrice);
      setQuantity(1);
    }
  }, [selectedSize]);

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
      <Typography.Text strong style={{ marginBottom: 8, display: "block" }}>
        Color:
      </Typography.Text>
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
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
                  <Typography.Text>{color}</Typography.Text>
                )}
              </div>
            </Tooltip>
          );
        })}
      </div>

      <Typography.Text strong style={{ marginBottom: 8, display: "block" }}>
        Size:
      </Typography.Text>
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
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

      <div style={{ borderRadius: 6, display: "inline-block", marginTop: 6, marginBottom: 6 }}>
        <Typography.Text strong style={{ fontSize: 35, color: "#000" }}>
          {price}
        </Typography.Text>
      </div>
    </>
  );
};

export default ProductOptions;