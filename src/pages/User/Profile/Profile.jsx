import React, { useEffect, useState } from "react";
import { Layout, Card, Form, Input, Button, Avatar, Row, Col, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import AppHeader from "../../../components/User/Header/Header";
import AppFooter from "../../../components/User/Footer/Footer";
import { getMyProfile, updateMyProfile } from "../../../api/userApi";
import "./Profile.css";

const { Content } = Layout;

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);

      try {
        const user = await getMyProfile();
        setProfile(user);
        form.setFieldsValue({
          email: user?.email || "",
          fullName: user?.fullName || "",
          role: user?.role || "",
        });
      } catch (error) {
        console.error("LOAD PROFILE ERROR:", error);
        message.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [form]);

  const handleSave = async () => {
    if (!isEditing) {
      return;
    }

    let values;
    try {
      values = await form.validateFields(["fullName"]);
    } catch {
      return;
    }

    const nextName = (values?.fullName || "").trim();
    const currentName = (profile?.fullName || "").trim();

    if (nextName === currentName) {
      message.info("No changes to save");
      return;
    }

    setSaving(true);

    try {
      const updated = await updateMyProfile({ fullName: nextName });
      setProfile(updated);
      form.setFieldsValue({
        email: updated?.email || profile?.email || "",
        fullName: updated?.fullName || nextName,
        role: updated?.role || profile?.role || "",
      });
      message.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("UPDATE PROFILE ERROR:", error);
      message.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    form.setFieldsValue({
      email: profile?.email || "",
      fullName: profile?.fullName || "",
      role: profile?.role || "",
    });
    setIsEditing(false);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader />
      <Content style={{ padding: "40px 60px", background: "#f5f7fa" }}>
        <Card className="profile-card" loading={loading}>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8} style={{ textAlign: "center" }}>
              <Avatar size={120} icon={<UserOutlined />} className="profile-avatar" />
              <h2 style={{ marginTop: "20px" }}>{profile?.email || "-"}</h2>
              <p style={{ color: "#666" }}>
                Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "-"}
              </p>
            </Col>

            <Col xs={24} md={16}>
              <h2>Account Information</h2>
              <Form form={form} layout="vertical">
                <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
                  <Input disabled />
                </Form.Item>

                <Form.Item name="fullName" label="Full Name" rules={[{ required: true, message: "Please enter full name" }]}>
                  <Input disabled={!isEditing} />
                </Form.Item>

                <Form.Item name="role" label="Role">
                  <Input disabled />
                </Form.Item>

                <Form.Item>
                  {isEditing ? (
                    <>
                      <Button type="primary" htmlType="button" loading={saving} style={{ marginRight: 8 }} onClick={handleSave}>
                        Save
                      </Button>
                      <Button htmlType="button" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button type="primary" htmlType="button" onClick={() => setIsEditing(true)}>
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
