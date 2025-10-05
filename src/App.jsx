import { useLocation } from "react-router-dom";
import RouteItems from "./RouteItems";
import { CartProvider } from "./modules/Cart/CartContext";
import HeaderNav from "./modules/Products/Product_Landing/Components/HeaderNav";
import SiteFooter from "./modules/Products/Product_Landing/Components/SiteFooter";
import ScrollToTop from "./components/ScrollToTop";

export default function App() {
  const location = useLocation();

  // Define routes where header and footer should be hidden
  const hideLayoutRoutes = ["/login", "/signup", "/forgot-password"];
  const shouldHideLayout = hideLayoutRoutes.includes(location.pathname);

  return (
    <CartProvider>
      <ScrollToTop />
      {!shouldHideLayout && <HeaderNav />}
      <RouteItems />
      {!shouldHideLayout && <SiteFooter />}
    </CartProvider>
  );
}
