import React, { useState } from "react";
import { Form, Input, Button, Typography, Row, Col, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signup } from "./../../users.api";
import { setUser } from "./../../users.slice";
import "../auth.css";
import "../../../../assets/styles/global.css";
import logo from "../../../../assets/images/columbialogo.png";

const { Title } = Typography;

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onFinish = async (values) => {
    if (values.PasswordHash !== values.confirmPassword) {
      message.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = values;
      const res = await signup(payload);
      message.success(res.message || "Sign up successful");

      if (res.userId) {
        console.log("User ID received:", res.userId);
        // localStorage.setItem("userId", res.userId); //  Store UserId in localStorage
        dispatch(setUser({ userId: res.userId, email: values.email }));
        navigate("/products");
      }
    } catch (err) {
      console.error(err);
      message.error("Signup failed");
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
        <div className="auth-card compact">
          <div className="auth-logo">
            <img src={logo} alt="Brand Logo" />
            <Title level={4}>Columbia Sportswear Company</Title>
          </div>

          <Title level={3} className="auth-title">
            Create Account
          </Title>

          <Form layout="vertical" onFinish={onFinish}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="First Name"
                  name="FirstName"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="First Name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Last Name"
                  name="LastName"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Last Name" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Email is required" },
                    {
                      validator: (_, value) =>
                        value && value.includes("@") && value.includes(".")
                          ? Promise.resolve()
                          : Promise.reject("Email must contain '@' and '.'"),
                    },
                  ]}
                >
                  <Input placeholder="Email" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Phone Number"
                  name="PhoneNumber"
                  rules={[
                    { required: true, message: "Phone number is required" },
                    {
                      validator: (_, value) =>
                        /^\+?\d{10,15}$/.test(value)
                          ? Promise.resolve()
                          : Promise.reject(
                              "Phone number must be 10 to 15 digits"
                            ),
                    },
                  ]}
                >
                  <Input placeholder="Mobile Number" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Password"
                  name="PasswordHash"
                  rules={[
                    { required: true, message: "Password is required" },
                    {
                      validator: (_, value) =>
                        value &&
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
                          value
                        )
                          ? Promise.resolve()
                          : Promise.reject(
                              "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
                            ),
                    },
                  ]}
                >
                  <Input.Password placeholder="Enter Password" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Confirm Password"
                  name="confirmPassword"
                  rules={[{ required: true }]}
                >
                  <Input.Password placeholder="Confirm Password" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Button
                type="default"
                htmlType="submit"
                block
                loading={loading}
                className="btn-auth"
              >
                Sign up
              </Button>
            </Form.Item>
          </Form>

          <p className="auth-footer">
            Already have an account?{" "}
            <a href="/login" className="auth-link">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
