import RouteItems from './RouteItems'
import { CartProvider } from './modules/Cart/CartContext'
import HeaderNav from './modules/Products/Product_Landing/Components/HeaderNav'
import SiteFooter from './modules/Products/Product_Landing/Components/SiteFooter'

export default function App() {
  return (
    <>
    <CartProvider>
      <HeaderNav />
      <RouteItems />
      <SiteFooter />
    </CartProvider>    
    </>
  )
}