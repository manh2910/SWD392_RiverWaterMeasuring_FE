import React, { useEffect, useState } from "react";
import { Layout, Form, InputNumber, Switch, Button, Row, Col, Card, message } from "antd";
import AppHeader from "../../../components/User/Header/Header";
import AppFooter from "../../../components/User/Footer/Footer";
import {
  getMyAlertSettings,
  createAlertSetting,
  updateAlertSetting,
} from "../../../api/alertApi";
import { getParameters } from "../../../api/paraApi";
import "./AlertSettings.css";

const { Content } = Layout;

const initialValues = {
  ph: 7.0,
  turbidity: 50,
  temperature: 30,
  flow: 1.5,
  enabled: true,
};

const FIELD_CODE_CANDIDATES = {
  ph: ["PH"],
  turbidity: ["TURB", "TURBIDITY"],
  temperature: ["TEMP", "TEMPERATURE"],
  flow: ["FV", "FLOW", "FLOW_VELOCITY"],
};

const normalizeCode = (code) => String(code || "").trim().toUpperCase();

export default function AlertSettings() {
  const [form] = Form.useForm();
  const [existingSettings, setExistingSettings] = useState({});
  const [availableCodes, setAvailableCodes] = useState(new Set());
  const [parameterCatalog, setParameterCatalog] = useState([]);
  const [saving, setSaving] = useState(false);

  const inferCodeByKeywords = (fieldName) => {
    const keywordMap = {
      ph: ["ph"],
      turbidity: ["turb", "turbidity", "ntu"],
      temperature: ["temp", "temperature"],
      flow: ["flow", "velocity", "current"],
    };

    const keywords = keywordMap[fieldName] || [];
    if (keywords.length === 0) {
      return null;
    }

    for (const item of parameterCatalog) {
      const code = normalizeCode(item?.code || item?.parameterCode);
      const haystack = `${item?.name || ""} ${item?.description || ""} ${code}`.toLowerCase();

      if (keywords.some((kw) => haystack.includes(kw))) {
        return code;
      }
    }

    return null;
  };

  const resolveFieldCode = (fieldName) => {
    const candidates = FIELD_CODE_CANDIDATES[fieldName] || [];

    for (const candidate of candidates) {
      if (existingSettings[candidate]) {
        return candidate;
      }
    }

    for (const candidate of candidates) {
      if (availableCodes.has(candidate)) {
        return candidate;
      }
    }

    return inferCodeByKeywords(fieldName);
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [settings, parameterRes] = await Promise.allSettled([
          getMyAlertSettings(),
          getParameters(),
        ]);

        const settingsData =
          settings.status === "fulfilled"
            ? settings.value
            : [];

        const parametersData =
          parameterRes.status === "fulfilled"
            ? parameterRes.value
            : [];

        const parameterList = Array.isArray(parametersData?.data)
          ? parametersData.data
          : Array.isArray(parametersData)
          ? parametersData
          : [];

        setParameterCatalog(parameterList);

        const codeSet = new Set(
          parameterList
            .map((p) => normalizeCode(p?.code || p?.parameterCode))
            .filter(Boolean)
        );
        setAvailableCodes(codeSet);

        const list = Array.isArray(settingsData?.data)
          ? settingsData.data
          : Array.isArray(settingsData)
          ? settingsData
          : [];

        const nextValues = { ...initialValues };
        const lookup = {};

        list.forEach((item) => {
          const code = normalizeCode(item?.parameterCode);

          if (!code) {
            return;
          }

          lookup[code] = item;

          if (code === "PH" && item.maxValue != null) {
            nextValues.ph = Number(item.maxValue);
          }
          if (["TURB", "TURBIDITY"].includes(code) && item.maxValue != null) {
            nextValues.turbidity = Number(item.maxValue);
          }
          if (["TEMP", "TEMPERATURE"].includes(code) && item.maxValue != null) {
            nextValues.temperature = Number(item.maxValue);
          }
          if (["FV", "FLOW", "FLOW_VELOCITY"].includes(code) && item.maxValue != null) {
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
    const role = (localStorage.getItem("role") || "").toUpperCase();
    if (!["ADMIN", "STAFF"].includes(role)) {
      message.error("Your account does not have permission to save alert settings.");
      return;
    }

    setSaving(true);

    try {
      const fields = Object.keys(FIELD_CODE_CANDIDATES);
      const unresolvedFields = [];

      const requests = fields.map(async (fieldName) => {
        const parameterCode = resolveFieldCode(fieldName);

        if (!parameterCode) {
          unresolvedFields.push(fieldName);
          return;
        }

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
          severity: "WARNING",
        };

        const existing = existingSettings[parameterCode];

        if (existing?.settingId) {
          return updateAlertSetting(existing.settingId, payload);
        }

        return createAlertSetting(payload);
      });

      const results = await Promise.allSettled(requests);
      const failed = results.filter((r) => r.status === "rejected");

      if (unresolvedFields.length > 0) {
        message.warning(
          `Some thresholds were skipped because parameter codes are not available: ${unresolvedFields.join(", ")}`
        );
      }

      if (failed.length > 0) {
        const firstError = failed[0].reason;
        const detail =
          firstError?.response?.data?.message ||
          firstError?.response?.data?.error ||
          firstError?.message ||
          "Failed to save settings";
        message.error(detail);
        return;
      }

      await (async () => {
        const refreshed = await getMyAlertSettings();
        const refreshedList = Array.isArray(refreshed?.data)
          ? refreshed.data
          : Array.isArray(refreshed)
          ? refreshed
          : [];

        const lookup = {};
        refreshedList.forEach((item) => {
          const code = normalizeCode(item?.parameterCode);
          if (code) {
            lookup[code] = item;
          }
        });
        setExistingSettings(lookup);
      })();

      message.success("Alert settings saved");
    } catch (error) {
      console.error("SAVE ALERT SETTINGS ERROR:", error);
      const detail =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to save settings";
      message.error(detail);
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
