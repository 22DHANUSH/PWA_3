import { Routes, Route } from "react-router-dom";
import Landing from './modules/Products/Product_Landing/Pages/Landing';
import ProductsPage from './modules/Products/Product_Catalog/Pages/ProductsPage';
import Profile from "./modules/Users/Profile/Pages/Profile";
import Login from "./modules/Users/Auth/Pages/Login";
import Signup from "./modules/Users/Auth/Pages/Signup";
import Addresses from "./modules/Users/Addresses/Pages/Addresses";
import SearchAndFilterPage from "./modules/Products/Product_Catalog/Pages/SearchAndFilterPage";
import ProductDetailPageWrapper from "./modules/Products/Product_Description/ProductDetailPageWrapper";
import WishlistPage from "./modules/Users/WishlistItems/Pages/WishlistItems";
import CartPage from "./modules/Cart/CartPage";
import ForgotPassword from "./modules/Users/Auth/Pages/ForgotPassword";
import OrderReview from "./modules/Orders/OrderSummary/Pages/OrderReview";
import MyOrder from "./modules/Orders/OrderHistory/Pages/MyOrder";
import PaymentPage from "./modules/Payment/PaymentPage";

const RouteItems = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/products" element={<SearchAndFilterPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/addresses" element={<Addresses />} />
      {/* <Route path="/productdetails" element={<ProductDetailsPage />} /> */}
      <Route
        path="/productdetails/:productId/:productSkuId"
        element={<ProductDetailPageWrapper />}
      />

      <Route path="/wishlist" element={<WishlistPage/>}/>
      <Route path="/cart" element={<CartPage/>}/>
      <Route path="/checkout" element={<CartPage/>}/>
      <Route path="/pastorder" element={<MyOrder />} />
      <Route path="/orders/summary" element={<OrderReview />} />
      <Route path="/payment" element={<PaymentPage/>}/>

    </Routes>
  );
};

export default RouteItems;
