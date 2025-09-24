import {
  HeartOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  UserOutlined,
} from "@ant-design/icons";

import { Input } from "antd";
import { Link, useLocation } from "react-router-dom"; 
import Columbialogo from '../../../../assets/images/columbialogo.png';
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

export default function HeaderNav() {
  const location = useLocation();
  const email = useSelector((state) => state.auth.email);
  const [emailInitial, setEmailInitial] = useState("");

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
        {/* Left group: logo + nav links */}
        <div className="nav-left">
          <nav
            className="nav-links"
            style={{ display: "flex", alignItems: "center", gap: 16 }}
          >
            <Link to="/" aria-label="Go Home" className="nav-logo">
              <img
                src={Columbialogo}
                alt="Columbia Sportswear"
                style={{ height: 80, objectFit: "contain", cursor: "pointer" }}
              />
            </Link>
            <Link to="/">Home</Link>
            <Link to="/products">Collections</Link>
            <Link to="/products">New</Link>
          </nav>
        </div>

        {/* Center group: search bar */}
        <div className="nav-center">
          {!hideSearch && (
            <Input
              aria-label="Search"
              size="middle"
              prefix={<SearchOutlined />}
              placeholder="Search"
              className="nav-search"
              style={{ maxWidth: 300 }}
            />
          )}
        </div>

        {/* Right group: actions */}
        {!isLoginPage && (
          <div className="nav-actions">
            <Link to="/wishlist" className="icon-btn" aria-label="Wishlist">
              <HeartOutlined />
            </Link>
            <Link to="/cart" className="icon-btn" aria-label="Cart">         {/*////////////////////////////////////////////////////////////*/}
              <ShoppingCartOutlined />
            </Link>
            <button className="icon-btn icon-btn--outline" aria-label="Bag">
              <ShoppingOutlined />
            </button>
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
