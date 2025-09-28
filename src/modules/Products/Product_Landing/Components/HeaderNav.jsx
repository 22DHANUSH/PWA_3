import { HeartOutlined, ShoppingCartOutlined, UserOutlined,} from "@ant-design/icons";
import { Input, Badge } from "antd"; 
import { Link, useLocation } from "react-router-dom";
import Columbialogo from "/images/columbialogo.png";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useCart } from "../../../Cart/CartContext"; 

export default function HeaderNav() {
  const location = useLocation();
  const email = useSelector((state) => state.auth.email);
  const [emailInitial, setEmailInitial] = useState("");
  const { cartCount } = useCart(); 
  const isLoginPage = location.pathname === "/login";
  const hideSearch = location.pathname.startsWith("/products") || isLoginPage;

  useEffect(() => {
    if (email && email.length > 0) {
      setEmailInitial(email.charAt(0).toUpperCase());
    } else {
      setEmailInitial("");
    }
  }, [email]);

  return (
    <header className="sticky-header">
      <div className="container nav-bar">
        <div className="nav-left">
          <nav
            className="nav-links"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              lineHeight: "40px", // match logo height
            }}
          >
            <Link to="/" aria-label="Go Home" className="nav-logo">
              <img
                src={Columbialogo}
                alt="Columbia Sportswear"
                style={{
                  height: 80, // reduce height for better alignment
                  objectFit: "contain",
                  cursor: "pointer",
                  verticalAlign: "middle",
                  paddingBottom: "5px",
                }}
              />
            </Link>
            <Link to="/">Home</Link>
            <Link to="/products">Collections</Link>
            <Link to="/products">New</Link>
          </nav>
        </div>

        {!isLoginPage && (
          <div className="nav-actions">
            <Link to="/wishlist" className="icon-btn" aria-label="Wishlist">
              <HeartOutlined />
            </Link>
            <Link to="/cart" className="icon-btn" aria-label="Cart">
              <Badge count={cartCount} offset={[0, 4]} size="small">
                <ShoppingCartOutlined style={{ fontSize: 25 }} />
              </Badge>
            </Link>
            <Link to="/Profile" className="icon-btn" aria-label="Account">
              {emailInitial ? (
                <span className="email-avatar">{emailInitial}</span>
              ) : (
                <UserOutlined />
              )}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
