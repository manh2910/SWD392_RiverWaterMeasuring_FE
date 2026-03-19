import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  message,
  Row,
  Col,
  Statistic,
  InputNumber,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  RadarChartOutlined,
} from "@ant-design/icons";
import { getHubs } from "../../../api/hubApi";
import { getParameters } from "../../../api/paraApi";
import { getSensorsByHub, createSensorByHub, updateSensor, deleteSensor } from "../../../api/sensorApi";
import "./Sensors.css";

export default function Sensors() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [hubOptions, setHubOptions] = useState([]);
  const [parameterOptions, setParameterOptions] = useState([]);
  const [selectedHubId, setSelectedHubId] = useState(null);
  const [form] = Form.useForm();

  const toArray = (payload) =>
    Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.content)
        ? payload.content
        : Array.isArray(payload)
          ? payload
          : [];

  const normalizeSensor = (item) => ({
    key: item.sensorId ?? item.id,
    sensorId: item.sensorId ?? item.id,
    parameterId: item.parameterId ?? item.parameter_id ?? null,
    parameterCode: item.parameterCode ?? item.code ?? "",
    parameterName: item.parameterName ?? item.name ?? "",
    unit: item.unit ?? "",
    status: String(item.status || "INACTIVE").toLowerCase(),
    samplingInterval: Number(item.samplingInterval ?? item.sampling_interval ?? 0),
    hubId: item.hubId ?? item.hub_id,
  });

  const loadSensors = async (hubId) => {
    if (hubId == null) {
      setData([]);
      return;
    }

    setLoading(true);
    try {
      const sensorRes = await getSensorsByHub(hubId);
      const rows = toArray(sensorRes).map(normalizeSensor);
      setData(rows);
    } catch (err) {
      console.error("LOAD SENSORS ERROR:", err);
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message || "Unknown error";
      message.error(`Failed to load sensors${status ? ` (HTTP ${status})` : ""}: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [hubRes, parameterRes] = await Promise.all([
          getHubs(),
          getParameters().catch(() => []),
        ]);

        const hubs = toArray(hubRes).map((hub) => ({
          label: `${hub.hubCode ?? "Hub"}${hub.hubId != null ? ` (ID: ${hub.hubId})` : ""}`,
          value: hub.hubId,
        }));
        setHubOptions(hubs);
        if (hubs.length > 0) setSelectedHubId(hubs[0].value);

        const parameters = toArray(parameterRes).map((p) => ({
          value: p.parameterId ?? p.id,
          label: `${p.parameterName ?? p.name ?? p.code ?? "Parameter"}${p.code ? ` (${p.code})` : ""}`,
          code: p.code ?? p.parameterCode ?? "",
          name: p.parameterName ?? p.name ?? "",
          unit: p.unit ?? "",
        }));
        setParameterOptions(parameters);
      } catch (err) {
        console.error("LOAD SENSOR PAGE DATA ERROR:", err);
        message.error("Failed to load hubs");
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    loadSensors(selectedHubId);
  }, [selectedHubId]);

  const openModal = (record = null) => {
    setEditing(record);
    setOpen(true);
    form.setFieldsValue(
      record || {
        parameterId: undefined,
        parameterCode: "",
        parameterName: "",
        unit: "",
        samplingInterval: 60,
        status: "active",
      }
    );
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const selectedParameter = parameterOptions.find((p) => p.value === values.parameterId);
      const payload = {
        parameterId: values.parameterId,
        parameterCode: selectedParameter?.code || values.parameterCode,
        parameterName: selectedParameter?.name || values.parameterName,
        unit: selectedParameter?.unit || values.unit,
        status: values.status.toUpperCase(),
        samplingInterval: Number(values.samplingInterval),
        hubId: selectedHubId,
      };

      if (editing) {
        await updateSensor(editing.sensorId, payload);
        message.success("Sensor updated successfully");
      } else {
        await createSensorByHub(payload);
        message.success("Sensor added successfully");
      }

      setOpen(false);
      setEditing(null);
      form.resetFields();
      await loadSensors(selectedHubId);
    } catch (err) {
      console.error("SAVE SENSOR ERROR:", err);
      message.error("Failed to save sensor");
    }
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete sensor?",
      content: "This action cannot be undone.",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteSensor(record.sensorId);
          setData((prev) => prev.filter((item) => item.sensorId !== record.sensorId));
          message.success("Sensor deleted successfully");
        } catch (err) {
          console.error("DELETE SENSOR ERROR:", err);
          message.error("Failed to delete sensor");
        }
      },
    });
  };

  const columns = [
    {
      title: "Sensor",
      dataIndex: "parameterName",
      key: "parameterName",
      render: (text) => (
        <Space>
          <RadarChartOutlined style={{ color: "#1890ff" }} />
          <span className="fw-600">{text}</span>
        </Space>
      ),
    },
    { title: "Code", dataIndex: "parameterCode", key: "parameterCode" },
    { title: "Unit", dataIndex: "unit", key: "unit" },
    { title: "Sampling (s)", dataIndex: "samplingInterval", key: "samplingInterval" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        if (status === "active") {
          return <Tag color="green">ACTIVE</Tag>;
        }

        if (status === "calibrating") {
          return <Tag color="orange">CALIBRATING</Tag>;
        }

        return <Tag color="red">INACTIVE</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
        </Space>
      ),
    },
  ];

  return (
    <div className="sensors-page">
      <Card className="sensors-hub-bar">
        <Space align="center" wrap>
          <span className="sensors-hub-label">Hub:</span>
          <Select
            className="sensors-hub-select"
            placeholder="Select hub"
            value={selectedHubId}
            onChange={setSelectedHubId}
            options={hubOptions}
          />
        </Space>
      </Card>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Sensors"
              value={data.length}
              prefix={<RadarChartOutlined />}
              valueStyle={{ color: "#1890ff", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Active"
              value={data.filter((s) => s.status === "active").length}
              valueStyle={{ color: "#52c41a", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Calibrating"
              value={data.filter((s) => s.status === "calibrating").length}
              valueStyle={{ color: "#faad14", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Inactive"
              value={data.filter((s) => s.status === "inactive").length}
              valueStyle={{ color: "#f5222d", fontSize: "28px" }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        className="sensors-table-card"
        title={<span><RadarChartOutlined style={{ marginRight: 8, color: "#1890ff" }} />All Sensors</span>}
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()} disabled={!selectedHubId}>
              Add Sensor
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowKey="sensorId"
          size="large"
          bordered={false}
          className="admin-table"
        />
      </Card>

      <Modal
        open={open}
        title={editing ? "Edit Sensor" : "Add Sensor"}
        onOk={handleOk}
        onCancel={() => {
          setOpen(false);
          setEditing(null);
          form.resetFields();
        }}
        okText={editing ? "Update" : "Add"}
        width={700}
        destroyOnClose
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="parameterId" label="Parameter" rules={[{ required: true, message: "Please select parameter" }]}>
            <Select
              placeholder="Select parameter"
              options={parameterOptions}
              onChange={(value) => {
                const selectedParameter = parameterOptions.find((p) => p.value === value);
                if (!selectedParameter) return;
                form.setFieldsValue({
                  parameterCode: selectedParameter.code,
                  parameterName: selectedParameter.name,
                  unit: selectedParameter.unit,
                });
              }}
            />
          </Form.Item>

          <Form.Item name="parameterName" label="Parameter Name" rules={[{ required: true, message: "Please enter parameter name" }]}>
            <Input placeholder="e.g., Dissolved Oxygen" />
          </Form.Item>

          <Form.Item name="parameterCode" label="Parameter Code" rules={[{ required: true, message: "Please enter parameter code" }]}>
            <Input placeholder="e.g., DO" />
          </Form.Item>

          <Form.Item name="unit" label="Unit">
            <Input placeholder="e.g., mg/L" />
          </Form.Item>

          <Form.Item name="samplingInterval" label="Sampling Interval (seconds)">
            <InputNumber style={{ width: "100%" }} min={1} />
          </Form.Item>

          <Form.Item name="status" label="Status">
            <Select
              placeholder="Select status"
              options={[
                { label: "Active", value: "active" },
                { label: "Calibrating", value: "calibrating" },
                { label: "Inactive", value: "inactive" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
