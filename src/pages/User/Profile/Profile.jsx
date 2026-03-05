import React, { useState } from "react";
import { Layout, Card, Form, Input, Button, Avatar, Row, Col, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import AppHeader from "../../../components/User/Header/Header";
import AppFooter from "../../../components/User/Footer/Footer";
import "./Profile.css";

const { Content } = Layout;

export default function Profile() {
  const loggedInUser = localStorage.getItem("loggedInUser") || "user@example.com";
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  const initialValues = {
    email: loggedInUser,
    fullName: "User Name",
    phone: "+84 123 456 789",
    address: "Vietnam",
  };

  const onFinish = (values) => {
    console.log("Profile updated:", values);
    message.success("Profile updated successfully!");
    setIsEditing(false);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader />
      <Content style={{ padding: "40px 60px", background: "#f5f7fa" }}>
        <Card className="profile-card">
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8} style={{ textAlign: "center" }}>
              <Avatar size={120} icon={<UserOutlined />} className="profile-avatar" />
              <h2 style={{ marginTop: "20px" }}>{loggedInUser}</h2>
              <p style={{ color: "#666" }}>Member since 2026</p>
            </Col>

            <Col xs={24} md={16}>
              <h2>Account Information</h2>
              <Form
                form={form}
                layout="vertical"
                initialValues={initialValues}
                onFinish={onFinish}
                disabled={!isEditing}
              >
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[{ required: true, type: "email" }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item name="fullName" label="Full Name">
                  <Input />
                </Form.Item>

                <Form.Item name="phone" label="Phone">
                  <Input />
                </Form.Item>

                <Form.Item name="address" label="Address">
                  <Input />
                </Form.Item>

                <Form.Item>
                  {isEditing ? (
                    <>
                      <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                        Save
                      </Button>
                      <Button onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button type="primary" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  )}
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </Card>
      </Content>
      <AppFooter />
    </Layout>
  );
}
