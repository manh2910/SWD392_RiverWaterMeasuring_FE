import React, { useState } from "react";
import { Layout, Tabs, Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import AppHeader from "../../../components/User/Header/Header";
import AppFooter from "../../../components/User/Footer/Footer";
import "./Auth.css";

const { Content } = Layout;

export default function Auth() {
  const [activeKey, setActiveKey] = useState("login");

  const navigate = useNavigate();

  const onLogin = (values) => {
    console.log("login", values);
    // store a simple flag to simulate authentication
    localStorage.setItem("loggedInUser", values.email);
    message.success("Logged in (mock)");
    navigate("/");
  };

  const onRegister = (values) => {
    console.log("register", values);
    message.success("Registered (mock)");
    setActiveKey("login");
    // optionally navigate user to login tab
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader />
      <Content style={{ padding: "40px 60px", background: "#f5f7fa" }}>
        <div className="auth-container">
          <Tabs activeKey={activeKey} onChange={(k) => setActiveKey(k)}>
            <Tabs.TabPane tab="Login" key="login">
              <Form layout="vertical" onFinish={onLogin} className="auth-form">
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[{ required: true, message: "Please input your email!" }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[{ required: true, message: "Please input your password!" }]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" block>
                    Login
                  </Button>
                </Form.Item>
              </Form>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Register" key="register">
              <Form
                layout="vertical"
                onFinish={onRegister}
                className="auth-form"
              >
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Please input your email!" },
                    { type: "email", message: "Invalid email!" },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[{ required: true, message: "Please input your password!" }]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  name="confirm"
                  label="Confirm Password"
                  dependencies={["password"]}
                  rules={[
                    {
                      required: true,
                      message: "Please confirm your password!",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error("Passwords do not match!"));
                      },
                    }),
                  ]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" block>
                    Register
                  </Button>
                </Form.Item>
              </Form>
            </Tabs.TabPane>
          </Tabs>
        </div>
      </Content>
      <AppFooter />
    </Layout>
  );
}
