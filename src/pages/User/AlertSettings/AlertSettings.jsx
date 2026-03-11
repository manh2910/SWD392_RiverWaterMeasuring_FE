import React, { useEffect, useState } from "react";
import { Layout, Form, InputNumber, Switch, Button, Row, Col, Card, message } from "antd";
import AppHeader from "../../../components/User/Header/Header";
import AppFooter from "../../../components/User/Footer/Footer";
import {
  getMyAlertSettings,
  createAlertSetting,
  updateAlertSetting,
} from "../../../api/alertApi";
import "./AlertSettings.css";

const { Content } = Layout;

const initialValues = {
  ph: 7.0,
  turbidity: 50,
  temperature: 30,
  flow: 1.5,
  enabled: true,
};

const FIELD_TO_CODE = {
  ph: "PH",
  turbidity: "TURB",
  temperature: "TEMP",
  flow: "FV",
};

export default function AlertSettings() {
  const [form] = Form.useForm();
  const [existingSettings, setExistingSettings] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getMyAlertSettings();
        const list = Array.isArray(settings) ? settings : [];

        const nextValues = { ...initialValues };
        const lookup = {};

        list.forEach((item) => {
          if (!item?.parameterCode) {
            return;
          }

          lookup[item.parameterCode] = item;

          if (item.parameterCode === "PH" && item.maxValue != null) {
            nextValues.ph = Number(item.maxValue);
          }
          if (item.parameterCode === "TURB" && item.maxValue != null) {
            nextValues.turbidity = Number(item.maxValue);
          }
          if (item.parameterCode === "TEMP" && item.maxValue != null) {
            nextValues.temperature = Number(item.maxValue);
          }
          if (item.parameterCode === "FV" && item.maxValue != null) {
            nextValues.flow = Number(item.maxValue);
          }
        });

        if (list.length > 0) {
          nextValues.enabled = list.some((item) => item?.isActive !== false);
        }

        setExistingSettings(lookup);
        form.setFieldsValue(nextValues);
      } catch (error) {
        console.error("LOAD ALERT SETTINGS ERROR:", error);
        message.error("Failed to load alert settings");
      }
    };

    loadSettings();
  }, [form]);

  const onFinish = async (vals) => {
    setSaving(true);

    try {
      const requests = Object.keys(FIELD_TO_CODE).map(async (fieldName) => {
        const parameterCode = FIELD_TO_CODE[fieldName];
        const payload = {
          parameterCode,
          ruleType: "ABOVE",
          minValue: null,
          maxValue: Number(vals[fieldName]),
          duration: 5,
          trendCount: 1,
          scopeType: "RIVER",
          scopeId: 1,
          isActive: Boolean(vals.enabled),
        };

        const existing = existingSettings[parameterCode];

        if (existing?.settingId) {
          return updateAlertSetting(existing.settingId, payload);
        }

        return createAlertSetting(payload);
      });

      await Promise.all(requests);
      message.success("Alert settings saved");
    } catch (error) {
      console.error("SAVE ALERT SETTINGS ERROR:", error);
      message.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader />
      <Content style={{ padding: "40px 60px", background: "#f5f7fa" }}>
        <Card title="Alert Configuration" className="alert-settings-card">
          <Form form={form} layout="vertical" initialValues={initialValues} onFinish={onFinish}>
            <Form.Item name="enabled" label="Enable Alerts" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item name="ph" label="pH Threshold">
                  <InputNumber min={0} max={14} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="turbidity" label="Turbidity Threshold (NTU)">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item name="temperature" label="Temperature Threshold (°C)">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="flow" label="Flow Threshold (m³/s)">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={saving}>
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
