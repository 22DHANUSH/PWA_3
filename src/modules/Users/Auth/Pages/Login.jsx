import { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "./../../users.api";
import { setUser } from "./../../users.slice";
import "./../../Auth/Auth.css";
import "../../../../assets/styles/global.css";
import logo from "../../../../assets/images/columbialogo.png";
import { mergeGuestCart } from "../../../Cart/cart.api"; 

const { Title } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await login(values);
      message.success(res.message || "Login successful");
      if (res.userId) {
        dispatch(setUser({ userId: res.userId, email: values.email }));

        // Merge guest cart into DB cart
        await mergeGuestCart(res.userId);
        
        navigate("/products");
      }
    } catch (err) {
      message.error("Wrong credentials or server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-overlay"></div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-logo">
            <img src={logo} alt="Brand Logo" />
            <Title level={4}>Columbia Sportswear Company</Title>
          </div>

          <Title level={3} className="auth-title">
            Welcome Back!
          </Title>

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Please enter a valid email",
                },
              ]}
            >
              <Input placeholder="Email" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="Password"
              rules={[
                { required: true, message: "Please enter your password" },
              ]}
            >
              <Input.Password placeholder="••••••••" />
            </Form.Item>

            <Form.Item>
              <Button
                htmlType="submit"
                block
                loading={loading}
                className="btn-auth"
              >
                Login
              </Button>
            </Form.Item>
          </Form>
          <p className="auth-footer">
            Forgot your password?{" "}
            <a href="/forgot-password" className="auth-link">
            Reset Password
            </a>
          </p>
          <p className="auth-footer">
            Don’t have an account?{" "}
            <a href="/signup" className="auth-link">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
