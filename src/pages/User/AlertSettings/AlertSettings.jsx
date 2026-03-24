import React, { useEffect, useMemo, useState } from "react";
import { DeleteOutlined } from "@ant-design/icons";
import { Button, Card, Col, Empty, Form, InputNumber, Layout, Popconfirm, Row, Select, Space, Spin, Switch, Table, Tag, Typography, message } from "antd";
import AppHeader from "../../../components/User/Header/Header";
import AppFooter from "../../../components/User/Footer/Footer";
import { deleteAlertSetting, getMyAlertSettings, upsertAlertSetting } from "../../../api/alertApi";
import { getParameters } from "../../../api/paraApi";
import { getRivers } from "../../../api/riverApi";
import { getStations } from "../../../api/stationApi";
import "./AlertSettings.css";

const { Content } = Layout;
const { Text } = Typography;

const normalizeCode = (code) => String(code || "").trim().toUpperCase();
const toArray = (payload) => (Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []);
const getSettingId = (item) => item?.settingId ?? item?.alertSettingId ?? item?.id;
const getSettingTimestamp = (item) =>
  new Date(item?.createdAt ?? item?.createdTime ?? item?.created_date ?? 0).getTime() || 0;

const severityOptions = [
  { value: "INFO", label: "Info", color: "blue" },
  { value: "WARNING", label: "Warning", color: "gold" },
  { value: "CRITICAL", label: "Critical", color: "red" },
];

export default function AlertSettings() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [settings, setSettings] = useState([]);
  const [parameterOptions, setParameterOptions] = useState([]);
  const [riverOptions, setRiverOptions] = useState([]);
  const [stationOptions, setStationOptions] = useState([]);
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    setTableLoading(true);
    try {
      const settingsRes = await getMyAlertSettings();
      setSettings(toArray(settingsRes));
    } catch (error) {
      console.error("LOAD ALERT SETTINGS ERROR:", error);
      message.error("Không tải được cấu hình cảnh báo");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [settingsRes, parameterRes, riverRes, stationRes] = await Promise.allSettled([
          getMyAlertSettings(),
          getParameters(),
          getRivers(),
          getStations(),
        ]);

        setSettings(settingsRes.status === "fulfilled" ? toArray(settingsRes.value) : []);

        const parameters = parameterRes.status === "fulfilled" ? toArray(parameterRes.value) : [];
        const paramOptions = parameters
          .map((item) => {
            const code = normalizeCode(item?.code || item?.parameterCode);
            if (!code) return null;
            return {
              value: code,
              label: `${code} - ${item?.name || item?.parameterName || "Unknown"}`,
            };
          })
          .filter(Boolean);
        setParameterOptions(paramOptions);

        const rivers = riverRes.status === "fulfilled" ? toArray(riverRes.value) : [];
        setRiverOptions(
          rivers.map((item) => ({
            value: Number(item?.riverId),
            label: item?.riverName || `Sông ${item?.riverId}`,
          }))
        );

        const stations = stationRes.status === "fulfilled" ? toArray(stationRes.value) : [];
        setStationOptions(
          stations.map((item) => ({
            value: Number(item?.stationId),
            label: item?.stationName || `Trạm ${item?.stationId}`,
          }))
        );

        form.setFieldsValue({
          severity: "WARNING",
          scopeType: "STATION",
          isActive: true,
        });
      } catch (error) {
        console.error("LOAD ALERT SETTINGS ERROR:", error);
        message.error("Không tải được trang cài đặt cảnh báo");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [form]);

  const onSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload = {
        parameterCode: values.parameterCode,
        ruleType: "THRESHOLD",
        minValue: Number(values.minValue),
        maxValue: Number(values.maxValue),
        severity: values.severity,
        scopeType: values.scopeType,
        scopeId: Number(values.scopeId),
        isActive: Boolean(values.isActive),
      };

      if (payload.minValue > payload.maxValue) {
        message.error("Min phải nhỏ hơn hoặc bằng Max");
        return;
      }

      await upsertAlertSetting(payload);
      message.success("Lưu cấu hình cảnh báo thành công");
      await loadSettings();
    } catch (error) {
      if (error?.errorFields) {
        return;
      }
      console.error("SAVE ALERT SETTINGS ERROR:", error);
      const detail =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Lưu cấu hình thất bại";
      message.error(detail);
    } finally {
      setSaving(false);
    }
  };

  const scopeType = Form.useWatch("scopeType", form);
  const scopeOptions = scopeType === "RIVER" ? riverOptions : stationOptions;
  const scopeLabelById = useMemo(() => {
    const map = {};
    riverOptions.forEach((item) => {
      map[`RIVER_${item.value}`] = item.label;
    });
    stationOptions.forEach((item) => {
      map[`STATION_${item.value}`] = item.label;
    });
    return map;
  }, [riverOptions, stationOptions]);

  const onToggleActive = async (record, checked) => {
    setSubmitting(true);
    try {
      await upsertAlertSetting({
        parameterCode: normalizeCode(record?.parameterCode),
        ruleType: record?.ruleType || "THRESHOLD",
        minValue: Number(record?.minValue),
        maxValue: Number(record?.maxValue),
        severity: record?.severity || "WARNING",
        scopeType: record?.scopeType || "STATION",
        scopeId: Number(record?.scopeId),
        isActive: Boolean(checked),
      });
      await loadSettings();
    } catch (error) {
      const detail =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Cập nhật trạng thái thất bại";
      message.error(detail);
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (record) => {
    const id = getSettingId(record);
    if (!id) {
      message.error("Không tìm thấy ID để xoá");
      return;
    }
    setSubmitting(true);
    try {
      await deleteAlertSetting(id);
      message.success("Đã xoá cấu hình cảnh báo");
      await loadSettings();
    } catch (error) {
      const detail =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Xoá cấu hình thất bại";
      message.error(detail);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: "Thông số",
      dataIndex: "parameterCode",
      key: "parameterCode",
      render: (value) => <Tag color="cyan">{normalizeCode(value)}</Tag>,
    },
    {
      title: "Min",
      dataIndex: "minValue",
      key: "minValue",
      render: (value) => Number(value).toFixed(2),
    },
    {
      title: "Max",
      dataIndex: "maxValue",
      key: "maxValue",
      render: (value) => Number(value).toFixed(2),
    },
    {
      title: "Phạm vi",
      key: "scope",
      render: (_, record) => {
        const type = record?.scopeType || "STATION";
        const label = scopeLabelById[`${type}_${Number(record?.scopeId)}`] || `${type} ${record?.scopeId}`;
        return <span>{label}</span>;
      },
    },
    {
      title: "Mức độ",
      dataIndex: "severity",
      key: "severity",
      render: (value) => {
        const item = severityOptions.find((s) => s.value === value) || severityOptions[1];
        return <Tag color={item.color}>{item.label}</Tag>;
      },
    },
    {
      title: "Kích hoạt",
      key: "isActive",
      render: (_, record) => (
        <Switch
          checked={record?.isActive !== false}
          loading={submitting}
          onChange={(checked) => onToggleActive(record, checked)}
        />
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Popconfirm title="Xoá cảnh báo này?" okText="Xoá" cancelText="Huỷ" onConfirm={() => onDelete(record)}>
          <Button danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const sortedSettings = useMemo(() => {
    return [...settings].sort((a, b) => {
      const timeDiff = getSettingTimestamp(b) - getSettingTimestamp(a);
      if (timeDiff !== 0) return timeDiff;
      return Number(getSettingId(b) || 0) - Number(getSettingId(a) || 0);
    });
  }, [settings]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader />
      <Content className="alert-settings-page">
        <Card className="alert-settings-card">
          {loading ? (
            <div className="alert-settings-loading">
              <Spin />
            </div>
          ) : (
            <>
              <div className="alert-settings-head">
                <h2>Thêm Cảnh báo Mới</h2>
              </div>

              <Form form={form} layout="vertical" className="alert-form">
                <Row gutter={[16, 8]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Thông số"
                      name="parameterCode"
                      rules={[{ required: true, message: "Vui lòng chọn thông số" }]}
                    >
                      <Select placeholder="Chọn thông số" options={parameterOptions} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Phạm vi"
                      name="scopeType"
                      rules={[{ required: true, message: "Vui lòng chọn phạm vi" }]}
                    >
                      <Select
                        options={[
                          { value: "STATION", label: "Trạm" },
                          { value: "RIVER", label: "Sông" },
                        ]}
                        onChange={() => form.setFieldValue("scopeId", undefined)}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      label={scopeType === "RIVER" ? "Chọn sông" : "Chọn trạm"}
                      name="scopeId"
                      rules={[{ required: true, message: "Vui lòng chọn phạm vi cụ thể" }]}
                    >
                      <Select
                        showSearch
                        optionFilterProp="label"
                        placeholder={scopeType === "RIVER" ? "Chọn sông" : "Chọn trạm"}
                        options={scopeOptions}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      label="Giá trị tối thiểu (Min)"
                      name="minValue"
                      rules={[{ required: true, message: "Nhập Min" }]}
                    >
                      <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      label="Giá trị tối đa (Max)"
                      name="maxValue"
                      rules={[{ required: true, message: "Nhập Max" }]}
                    >
                      <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item label="Mức độ" name="severity">
                      <Select options={severityOptions.map((item) => ({ value: item.value, label: item.label }))} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item label="Kích hoạt" name="isActive" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>

              <div className="alert-settings-actions">
                <Button
                  type="primary"
                  loading={saving}
                  onClick={onSave}
                  disabled={parameterOptions.length === 0}
                >
                  Lưu cảnh báo
                </Button>
              </div>

              <div className="current-alerts-head">
                <Text strong>Cảnh báo hiện tại</Text>
              </div>

              {settings.length === 0 ? (
                <Empty description="Chưa có cấu hình cảnh báo" />
              ) : (
                <Table
                  rowKey={(record) => `${record?.parameterCode}-${record?.scopeType}-${record?.scopeId}`}
                  className="alert-settings-table"
                  loading={tableLoading}
                  columns={columns}
                  dataSource={sortedSettings}
                  pagination={false}
                />
              )}
            </>
          )}
        </Card>
      </Content>
      <AppFooter />
    </Layout>
  );
}
