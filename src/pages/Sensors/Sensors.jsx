import { useState } from "react";
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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  RadarChartOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import "./Sensors.css";

const initialSensors = [
  {
    key: 1,
    name: "Water Level Sensor A1",
    code: "SEN-WL-001",
    station: "Can Tho Station",
    parameter: "Water Level",
    status: "active",
    lastReading: "2.45 m (2 min ago)",
  },
  {
    key: 2,
    name: "Salinity Sensor A1",
    code: "SEN-SAL-001",
    station: "Can Tho Station",
    parameter: "Salinity",
    status: "active",
    lastReading: "0.85 ppt (5 min ago)",
  },
  {
    key: 3,
    name: "pH Sensor A1",
    code: "SEN-PH-001",
    station: "Can Tho Station",
    parameter: "pH",
    status: "active",
    lastReading: "7.2 pH (2 min ago)",
  },
  {
    key: 4,
    name: "Temperature Sensor B1",
    code: "SEN-TEMP-001",
    station: "My Tho Station",
    parameter: "Temperature",
    status: "active",
    lastReading: "28.5°C (3 min ago)",
  },
  {
    key: 5,
    name: "Dissolved Oxygen Sensor B1",
    code: "SEN-DO-001",
    station: "My Tho Station",
    parameter: "Dissolved Oxygen",
    status: "calibrating",
    lastReading: "6.8 mg/L (1 hour ago)",
  },
  {
    key: 6,
    name: "Turbidity Sensor C1",
    code: "SEN-TURB-001",
    station: "Ben Tre Station",
    parameter: "Turbidity",
    status: "inactive",
    lastReading: "45.2 NTU (2 hours ago)",
  },
];

export default function Sensors() {
  const [data, setData] = useState(initialSensors);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const openModal = (record = null) => {
    setEditing(record);
    setOpen(true);
    form.setFieldsValue(record || {});
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (editing) {
        setData(
          data.map((item) =>
            item.key === editing.key ? { ...item, ...values } : item
          )
        );
        message.success("Sensor updated successfully");
      } else {
        setData([
          ...data,
          {
            key: Date.now(),
            status: "active",
            ...values,
          },
        ]);
        message.success("Sensor added successfully");
      }
      setOpen(false);
      setEditing(null);
      form.resetFields();
    });
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete sensor?",
      content: "This action cannot be undone.",
      okType: "danger",
      onOk: () => {
        setData(data.filter((i) => i.key !== record.key));
        message.success("Sensor deleted successfully");
      },
    });
  };

  const columns = [
    {
      title: "Sensor",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <Space>
          <RadarChartOutlined style={{ color: "#1890ff" }} />
          <span className="fw-600">{text}</span>
        </Space>
      ),
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Station",
      dataIndex: "station",
      key: "station",
    },
    {
      title: "Parameter",
      dataIndex: "parameter",
      key: "parameter",
    },
    {
      title: "Last Reading",
      dataIndex: "lastReading",
      key: "lastReading",
      render: (text) => (
        <span style={{ color: "#666", fontSize: "12px" }}>
          <CheckCircleOutlined style={{ marginRight: 4, color: "#1890ff" }} />
          {text}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        if (status === "active") {
          return <Tag color="green">ACTIVE</Tag>;
        } else if (status === "calibrating") {
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
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="sensors-page">
      {/* ===== STATS ===== */}
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

      {/* ===== TABLE ===== */}
      <Card
        className="sensors-table-card"
        title={
          <span>
            <RadarChartOutlined style={{ marginRight: 8, color: "#1890ff" }} />
            All Sensors
          </span>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
          >
            Add Sensor
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 10 }}
          rowKey="key"
          size="large"
          bordered={false}
          className="admin-table"
        />
      </Card>

      {/* ===== MODAL ===== */}
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
          <Form.Item
            name="name"
            label="Sensor Name"
            rules={[{ required: true, message: "Please enter sensor name" }]}
          >
            <Input placeholder="e.g., Water Level Sensor A1" />
          </Form.Item>

          <Form.Item
            name="code"
            label="Code"
            rules={[{ required: true, message: "Please enter code" }]}
          >
            <Input placeholder="e.g., SEN-WL-001" />
          </Form.Item>

          <Form.Item
            name="station"
            label="Station"
            rules={[{ required: true, message: "Please select station" }]}
          >
            <Select
              placeholder="Select station"
              options={[
                { label: "Can Tho Station", value: "Can Tho Station" },
                { label: "My Tho Station", value: "My Tho Station" },
                { label: "Ben Tre Station", value: "Ben Tre Station" },
                { label: "Bien Hoa Station", value: "Bien Hoa Station" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="parameter"
            label="Parameter"
            rules={[{ required: true, message: "Please select parameter" }]}
          >
            <Select
              placeholder="Select parameter"
              options={[
                { label: "Water Level", value: "Water Level" },
                { label: "Salinity", value: "Salinity" },
                { label: "pH", value: "pH" },
                { label: "Temperature", value: "Temperature" },
                { label: "Dissolved Oxygen", value: "Dissolved Oxygen" },
                { label: "Turbidity", value: "Turbidity" },
              ]}
            />
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
