import React, { useEffect, useMemo, useState } from "react";
import {
  Layout,
  InputNumber,
  Switch,
  Button,
  Row,
  Col,
  Card,
  message,
  Space,
  Typography,
  Divider,
  Empty,
  Tag,
  Spin,
} from "antd";
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
const { Text, Paragraph } = Typography;

const defaultThresholdByKeyword = {
  ph: 7,
  turbidity: 50,
  temperature: 30,
  flow: 1.5,
};

const normalizeCode = (code) => String(code || "").trim().toUpperCase();

export default function AlertSettings() {
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [existingSettings, setExistingSettings] = useState({});
  const [parameterCatalog, setParameterCatalog] = useState([]);
  const [selectedCodes, setSelectedCodes] = useState(new Set());
  const [thresholdByCode, setThresholdByCode] = useState({});
  const [saving, setSaving] = useState(false);

  const guessDefaultThreshold = (item) => {
    const code = normalizeCode(item?.code || item?.parameterCode);
    const haystack = `${item?.name || ""} ${item?.description || ""} ${code}`.toLowerCase();
    if (haystack.includes("ph")) return defaultThresholdByKeyword.ph;
    if (haystack.includes("turb")) return defaultThresholdByKeyword.turbidity;
    if (haystack.includes("temp")) return defaultThresholdByKeyword.temperature;
    if (haystack.includes("flow") || haystack.includes("velocity")) return defaultThresholdByKeyword.flow;
    return 0;
  };

  const parameterOptions = useMemo(
    () =>
      parameterCatalog
        .map((p) => ({
          code: normalizeCode(p?.code || p?.parameterCode),
          name: p?.name || p?.parameterName || "Unnamed parameter",
          unit: p?.unit || "",
          description: p?.description || "",
        }))
        .filter((p) => p.code),
    [parameterCatalog]
  );

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
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

        const list = Array.isArray(settingsData?.data)
          ? settingsData.data
          : Array.isArray(settingsData)
          ? settingsData
          : [];

        const lookup = {};
        const selected = new Set();
        const thresholds = {};

        list.forEach((item) => {
          const code = normalizeCode(item?.parameterCode);
          if (!code) return;
          lookup[code] = item;
          if (item?.isActive !== false) selected.add(code);
          thresholds[code] = Number(item?.maxValue ?? 0);
        });

        const normalizedParams = parameterList
          .map((item) => normalizeCode(item?.code || item?.parameterCode))
          .filter(Boolean);

        normalizedParams.forEach((code, idx) => {
          if (thresholds[code] == null) {
            thresholds[code] = guessDefaultThreshold(parameterList[idx]);
          }
        });

        if (selected.size === 0 && normalizedParams.length > 0) {
          normalizedParams.forEach((code) => selected.add(code));
        }

        setExistingSettings(lookup);
        setSelectedCodes(selected);
        setThresholdByCode(thresholds);
        if (list.length > 0) setEnabled(list.some((item) => item?.isActive !== false));
      } catch (error) {
        console.error("LOAD ALERT SETTINGS ERROR:", error);
        message.error("Failed to load alert settings");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const onSave = async () => {
    setSaving(true);

    try {
      const requests = parameterOptions.map(async (param) => {
        const parameterCode = param.code;
        const maxValue = Number(thresholdByCode[parameterCode] ?? 0);
        const isActive = Boolean(enabled && selectedCodes.has(parameterCode));
        const existing = existingSettings[parameterCode];

        const payload = {
          parameterCode,
          ruleType: existing?.ruleType || "ABOVE",
          minValue: existing?.minValue ?? null,
          maxValue,
          duration: existing?.duration ?? 5,
          trendCount: existing?.trendCount ?? 1,
          scopeType: existing?.scopeType || "RIVER",
          scopeId: existing?.scopeId ?? 1,
          isActive,
          severity: existing?.severity || "WARNING",
        };

        if (existing?.settingId) {
          return updateAlertSetting(existing.settingId, payload);
        }

        if (!isActive) return null;
        return createAlertSetting(payload);
      });

      const results = await Promise.allSettled(requests);
      const failed = results.filter((r) => r.status === "rejected");

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

  const toggleParameter = (code, checked) => {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (checked) next.add(code);
      else next.delete(code);
      return next;
    });
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader />
      <Content className="alert-settings-page">
        <Card className="alert-settings-card">
          <div className="alert-settings-head">
            <div>
              <h2>Alert Configuration</h2>
              <Paragraph type="secondary">
                Chọn các thông số sẽ xuất hiện trong thông báo. Bật thông số nào thì thông báo sẽ có thông tin của thông số đó.
              </Paragraph>
            </div>
            <Space>
              <Text>Enable all alerts</Text>
              <Switch checked={enabled} onChange={setEnabled} />
            </Space>
          </div>

          <Divider />

          {loading ? (
            <div className="alert-settings-loading">
              <Spin />
            </div>
          ) : parameterOptions.length === 0 ? (
            <Empty description="No parameters found" />
          ) : (
            <Row gutter={[16, 16]}>
              {parameterOptions.map((param) => (
                <Col xs={24} md={12} key={param.code}>
                  <Card className={`param-item ${selectedCodes.has(param.code) ? "param-item-active" : ""}`}>
                    <div className="param-item-top">
                      <Space align="start" className="param-item-title-wrap">
                        <Switch
                          checked={selectedCodes.has(param.code)}
                          onChange={(checked) => toggleParameter(param.code, checked)}
                        />
                        <div>
                          <div className="param-item-title">{param.name}</div>
                          <Space size={8}>
                            <Tag color="blue">{param.code}</Tag>
                            {param.unit ? <Tag>{param.unit}</Tag> : null}
                          </Space>
                        </div>
                      </Space>
                    </div>

                    <div className="param-item-threshold">
                      <Text type="secondary">Threshold</Text>
                      <InputNumber
                        min={0}
                        style={{ width: "100%" }}
                        value={thresholdByCode[param.code]}
                        onChange={(v) =>
                          setThresholdByCode((prev) => ({
                            ...prev,
                            [param.code]: Number(v ?? 0),
                          }))
                        }
                        disabled={!selectedCodes.has(param.code) || !enabled}
                      />
                    </div>

                    {param.description ? (
                      <Text type="secondary" className="param-item-desc">
                        {param.description}
                      </Text>
                    ) : null}
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          <div className="alert-settings-actions">
            <Button type="primary" loading={saving} onClick={onSave} disabled={loading || parameterOptions.length === 0}>
              Save Settings
            </Button>
          </div>
        </Card>
      </Content>
      <AppFooter />
    </Layout>
  );
}
