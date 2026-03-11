import React, { useState } from "react";
import { Layout, Form, Input, Button, message, Card, Typography } from "antd";
import { MailOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AppHeader from "../../../components/User/Header/Header";
import AppFooter from "../../../components/User/Footer/Footer";
import { registerApi } from "../../../api/authApi";
import "./Register.css";

const { Content } = Layout;
const { Title, Text } = Typography;

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onRegister = async (values) => {
    try {
      setLoading(true);

      const payload = {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        role: "USER",
      };

      await registerApi(payload);

      message.success("Registration successful!");

      navigate("/login");
    } catch (error) {
      console.error("Register error:", error);

      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader />

      <Content className="auth-page">
        <Card className="auth-card" variant="borderless">
          <Title level={3} style={{ textAlign: "center", marginBottom: 30 }}>
            Create Your Account
          </Title>

          <Form layout="vertical" onFinish={onRegister}>
            {/* Full Name */}
            <Form.Item
              name="fullName"
              label="Full Name"
              rules={[
                { required: true, message: "Please input your full name!" },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter your full name"
                size="large"
              />
            </Form.Item>

            {/* Email */}
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Invalid email address!" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Enter your email"
                size="large"
              />
            </Form.Item>

            {/* Password */}
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please input your password!" },
                { min: 6, message: "Password must be at least 6 characters!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your password"
                size="large"
              />
            </Form.Item>

            {/* Confirm Password */}
            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Passwords do not match!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm your password"
                size="large"
              />
            </Form.Item>

            {/* Register Button */}
            <Form.Item style={{ marginTop: 20 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
              >
                Register
              </Button>
            </Form.Item>

            {/* Go to Login */}
            <div className="auth-bottom">
              <Text>Already have an account?</Text>
              <Button
                type="link"
                onClick={() => navigate("/login")}
                style={{ paddingLeft: 5 }}
              >
                Login now
              </Button>
            </div>
          </Form>
        </Card>
      </Content>

      <AppFooter />
    </Layout>
  );
}