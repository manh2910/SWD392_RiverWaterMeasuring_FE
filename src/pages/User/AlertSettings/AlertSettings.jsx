import React, { useState } from "react";
import { Layout, Form, InputNumber, Switch, Button, Row, Col, Card, message } from "antd";
import AppHeader from "../../../components/User/Header/Header";
import AppFooter from "../../../components/User/Footer/Footer";
import "./AlertSettings.css";

const { Content } = Layout;

const initialValues = {
  ph: 7.0,
  turbidity: 50,
  temperature: 30,
  flow: 1.5,
  enabled: true,
};

export default function AlertSettings() {
  const [settings, setSettings] = useState(initialValues);

  const onFinish = (vals) => {
    setSettings(vals);
    message.success("Settings saved (mock)");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader />
      <Content style={{ padding: "40px 60px", background: "#f5f7fa" }}>
        <Card title="Alert Configuration" className="alert-settings-card">
          <Form layout="vertical" initialValues={settings} onFinish={onFinish}>
            <Form.Item name="enabled" label="Enable Alerts" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item name="ph" label="pH Threshold">
                  <InputNumber min={0} max={14} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="turbidity" label="Turbidity Threshold (NTU)">
                  <InputNumber min={0} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item name="temperature" label="Temperature Threshold (°C)">
                  <InputNumber min={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="flow" label="Flow Threshold (m³/s)">
                  <InputNumber min={0} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>
      <AppFooter />
    </Layout>
  );
}
