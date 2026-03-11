import React, { useState } from "react";
import { Layout, Form, Input, Button, message, Card, Typography } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AppHeader from "../../../components/User/Header/Header";
import AppFooter from "../../../components/User/Footer/Footer";
import { loginApi } from "../../../api/authApi";
import "./Auth.css";

const { Content } = Layout;
const { Title, Text } = Typography;

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onLogin = async (values) => {
    try {
      setLoading(true);

      const res = await loginApi(values);

      console.log("LOGIN RESPONSE:", res);

      const token = res.token || res.data?.token;

      if (!token) {
        throw new Error("Token not found in response");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("userEmail", res.email || "");
      localStorage.setItem("role", res.role || "");

      message.success("Login successful!");

      navigate("/");
    } catch (error) {
      console.error("Login error:", error);

      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Email or password incorrect");
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
            Login to Your Account
          </Title>

          <Form layout="vertical" onFinish={onLogin}>

            {/* EMAIL */}

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Invalid email!" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Enter your email"
                size="large"
              />
            </Form.Item>

            {/* PASSWORD */}

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your password"
                size="large"
              />
            </Form.Item>

            {/* LOGIN BUTTON */}

            <Form.Item style={{ marginTop: 20 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
              >
                Login
              </Button>
            </Form.Item>

            {/* REGISTER LINK */}

            <div className="auth-bottom">
              <Text>Don't have an account?</Text>

              <Button
                type="link"
                onClick={() => navigate("/register")}
                style={{ paddingLeft: 5 }}
              >
                Register now
              </Button>
            </div>

          </Form>
        </Card>
      </Content>

      <AppFooter />
    </Layout>
  );
}