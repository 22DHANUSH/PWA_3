import React, { useEffect, useState } from "react";
import { Button, message } from "antd";
import {addWishlistItem,checkWishlist,deleteWishlistItem,} from "./../../users.api";

const WishlistButton = ({ userId, productSkuId }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState(null);
  const [loading, setLoading] = useState(false);

  //  Check if product already in wishlist
  const fetchWishlistStatus = async () => {
    try {
      const res = await checkWishlist(userId, productSkuId);
      if (res?.isWishlisted) {
        setIsWishlisted(true);
        setWishlistItemId(res.wishlistItem.wishlistItemId);
      } else {
        setIsWishlisted(false);
        setWishlistItemId(null);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setIsWishlisted(false);        // Not in wishlist → set false
        setWishlistItemId(null);
      } else {
        console.error(err);
        message.error("Failed to check wishlist status");
      }
    }
  };

  const handleToggleWishlist = async () => {
    try {
      setLoading(true);
      if (isWishlisted) {
        await deleteWishlistItem(wishlistItemId);
        message.success("Removed from wishlist");
        setIsWishlisted(false);
        setWishlistItemId(null);
      } 
      else {
        const res = await addWishlistItem(userId, productSkuId);
        if (res === -1) {
          message.info("Already in wishlist");
          setIsWishlisted(true);
        } else {
          message.success("Added to wishlist");
          setIsWishlisted(true);
          setWishlistItemId(res); // backend returns wishlistItemId
        }
      }
    } catch (err) {
      console.error(err);
      message.error("Wishlist action failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistStatus();
  }, [userId, productSkuId]);

  return (
    <Button
      type={isWishlisted ? "primary" : "default"}
      style={{
        backgroundColor: isWishlisted ? "black" : undefined,
        color: isWishlisted ? "white" : undefined,        
      }}
      loading={loading}
      onClick={handleToggleWishlist}
      block
    >
      {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
    </Button>
  );
};

export default WishlistButton;