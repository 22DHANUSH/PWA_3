import { useEffect, useState } from "react";
import { Row, Col, Spin } from "antd";
import api from "../../../../app/users.axios.js";
import ProductInfo from "../Components/ProductInfo.jsx";
import ProductActions from "../Components/ProductActions.jsx";
import ProductImageGallery from "../Components/ProductImageViewer.jsx";
import ProductReviews from "../Components/ProductReviews.jsx";
import ProductOptions from "../Components/ProductOptions.jsx";
import { getProductById, getSkusByProductId, getReviewsByProductId, getColorsByProductId, getSizesByProductId, getImagesBySku} from '../../products.api.js';

const ProductDetailPage = ({ productId, productSkuId }) => {
  const [skus, setSkus] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
 
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedSku, setSelectedSku] = useState(null);
 
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [colorImages, setColorImages] = useState({});

  const userId = localStorage.getItem("userId");
  console.log("User ID from localStorage:", userId);
 
  const fetchImagesForSku = async (skuId) => {
    if (!skuId) {
      console.warn("SKU ID is missing");
      setImages([]);
      setSelectedImage(null);
      return;
    }
 
    try {
      const response = await api.get(`/blob/GenerateSasToken/${skuId}/1`);
      const imageData = Array.isArray(response.data) ? response.data.slice(0, 9) : [];
 
      if (imageData.length === 0) {
        setImages([]);
        setSelectedImage(null);
        return;
      }
 
      setImages(imageData);
 
      const primaryImage = imageData.find((img) => img.isPrimary) || imageData[0];
      setSelectedImage(primaryImage.imageUrl);
    } catch (error) {
      console.error(`Failed to fetch SAS images for SKU ${skuId}:`, error.message);
      setImages([]);
      setSelectedImage(null);
    }
  };
 
  useEffect(() => {
      const fetchData = async () => {
        try {
          const [skuData, productData, reviewsData, colorsData, sizesData] = await Promise.all([
            getSkusByProductId(productId),
            getProductById(productId),
            getReviewsByProductId(productId),
            getColorsByProductId(productId),
            getSizesByProductId(productId),
          ]);
 
          setSkus(Array.isArray(skuData) ? skuData : []);
          setProduct(productData || null);
          setReviews(Array.isArray(reviewsData) ? reviewsData : []);
          setAvailableColors(Array.isArray(colorsData) ? colorsData : []);
          setAvailableSizes(Array.isArray(sizesData) ? sizesData : []);
 
          const initialSku = skuData.find((sku) => sku.productSkuId === productSkuId) || skuData[0];
          if (initialSku) {
            setSelectedColor(initialSku.productColor);
            setSelectedSize(initialSku.productSize);
            setSelectedSku(initialSku);
 
            const imageData = await getImagesBySku(initialSku.productSkuId);
            setImages(imageData);
            const primaryImage = imageData.find((img) => img.isPrimary) || imageData[0];
            setSelectedImage(primaryImage?.imageUrl || null);
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
          setColorImages(colorImageMap);
        } catch (error) {
          console.error("Error fetching product data:", error);
        } finally {
          setLoading(false);
        }
      };

  fetchData();
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
        fetchImagesForSku(matchedSku.productSkuId);
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
      fetchImagesForSku(matchedSku.productSkuId);
    }
  }, [selectedSize]);
 
  if (loading || !selectedSku) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }
 
  return (
    <>
      <div style={{ padding: "0 2rem", marginTop: "2rem" }}>
        <Row gutter={[32, 32]}>
          <Col xs={24} md={12}>
            <ProductImageGallery
              selectedImage={selectedImage}
              images={images}
              onSelectImage={setSelectedImage}
            />
          </Col>
 
          <Col xs={24} md={12}>
            {product && (
              <>
                <ProductInfo product={product} />
                <ProductOptions
                  availableColors={availableColors}
                  availableSizes={availableSizes}
                  selectedColor={selectedColor}
                  selectedSize={selectedSize}
                  setSelectedColor={setSelectedColor}
                  setSelectedSize={setSelectedSize}
                  stock={selectedSku.stocks}
                  colorImages={colorImages}
                  price={selectedSku.productPrice}
                />
                <ProductActions 
                  stock={selectedSku.stocks} 
                  price={selectedSku.productPrice} 
                  userId={userId} 
                  productSkuId={selectedSku.productSkuId}
                  product={{
                    productId: product.productId,
                    productTitle: product.productTitle,
                    productPrice: selectedSku.productPrice,
                    productSize: selectedSku.productSize,
                    productColor: selectedSku.productColor,
                    imageUrl: images[0]?.imageUrl || ""
                  }}
                />
              </>
            )}
          </Col>
        </Row>
 
        <ProductReviews
          reviews={reviews}
          setReviews={setReviews}
          selectedSku={selectedSku}
          currentUserId={1}
        />       
      </div>
    </>
  );
};
 
export default ProductDetailPage;
 