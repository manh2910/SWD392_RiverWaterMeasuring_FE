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
import { getStations } from "../../../api/stationApi";
import { getSensorsByHub, createSensorByHub, updateSensor, deleteSensor } from "../../../api/sensorApi";
import "./Sensors.css";

export default function Sensors() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [hubOptions, setHubOptions] = useState([]);
  const [selectedHubId, setSelectedHubId] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const loadHubs = async () => {
      try {
        const stationRes = await getStations();
        const stations = Array.isArray(stationRes?.data) ? stationRes.data : stationRes || [];

        const hubs = stations.flatMap((station) => {
          const stationHubs = Array.isArray(station?.hubs) ? station.hubs : [];
          return stationHubs.map((hub) => ({
            label: `${hub.hubCode} (Station ${station.stationName})`,
            value: hub.hubId,
          }));
        });

        setHubOptions(hubs);
        if (hubs.length > 0) {
          setSelectedHubId(hubs[0].value);
        }
      } catch (err) {
        console.error("LOAD HUB OPTIONS ERROR:", err);
      }
    };

    loadHubs();
  }, []);

  useEffect(() => {
    const loadSensors = async () => {
      if (!selectedHubId) {
        setData([]);
        return;
      }

      setLoading(true);

      try {
        const sensorList = await getSensorsByHub(selectedHubId);
        const rows = (Array.isArray(sensorList) ? sensorList : []).map((item) => ({
          key: item.sensorId,
          sensorId: item.sensorId,
          parameterCode: item.parameterCode,
          parameterName: item.parameterName,
          unit: item.unit,
          status: (item.status || "INACTIVE").toLowerCase(),
          samplingInterval: item.samplingInterval,
          hubId: item.hubId,
        }));

        setData(rows);
      } catch (err) {
        console.error("LOAD SENSORS ERROR:", err);
        message.error("Failed to load sensors");
      } finally {
        setLoading(false);
      }
    };

    loadSensors();
  }, [selectedHubId]);

  const openModal = (record = null) => {
    setEditing(record);
    setOpen(true);
    form.setFieldsValue(
      record || {
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
      const payload = {
        parameterCode: values.parameterCode,
        parameterName: values.parameterName,
        unit: values.unit,
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

      const sensorList = await getSensorsByHub(selectedHubId);
      const rows = (Array.isArray(sensorList) ? sensorList : []).map((item) => ({
        key: item.sensorId,
        sensorId: item.sensorId,
        parameterCode: item.parameterCode,
        parameterName: item.parameterName,
        unit: item.unit,
        status: (item.status || "INACTIVE").toLowerCase(),
        samplingInterval: item.samplingInterval,
        hubId: item.hubId,
      }));
      setData(rows);
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
            <Select
              style={{ minWidth: 240 }}
              placeholder="Select hub"
              value={selectedHubId}
              onChange={setSelectedHubId}
              options={hubOptions}
            />
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
