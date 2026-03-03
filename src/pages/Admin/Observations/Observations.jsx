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
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import "./Observations.css";

const initialObservations = [
  {
    key: 1,
    date: "2025-01-22 10:30:00",
    station: "Can Tho Station",
    parameter: "Water Level",
    value: "2.45",
    unit: "m",
    status: "good",
  },
  {
    key: 2,
    date: "2025-01-22 10:30:00",
    station: "Can Tho Station",
    parameter: "Salinity",
    value: "0.85",
    unit: "ppt",
    status: "good",
  },
  {
    key: 3,
    date: "2025-01-22 10:30:00",
    station: "Can Tho Station",
    parameter: "pH",
    value: "7.2",
    unit: "pH",
    status: "good",
  },
  {
    key: 4,
    date: "2025-01-22 10:25:00",
    station: "My Tho Station",
    parameter: "Temperature",
    value: "28.5",
    unit: "°C",
    status: "good",
  },
  {
    key: 5,
    date: "2025-01-22 10:20:00",
    station: "My Tho Station",
    parameter: "Water Level",
    value: "1.92",
    unit: "m",
    status: "suspect",
  },
  {
    key: 6,
    date: "2025-01-22 10:15:00",
    station: "Ben Tre Station",
    parameter: "Turbidity",
    value: "52.1",
    unit: "NTU",
    status: "bad",
  },
];

export default function Observations() {
  const [data, setData] = useState(initialObservations);
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
        message.success("Observation updated successfully");
      } else {
        setData([
          ...data,
          {
            key: Date.now(),
            ...values,
          },
        ]);
        message.success("Observation added successfully");
      }
      setOpen(false);
      setEditing(null);
      form.resetFields();
    });
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete observation?",
      content: "This action cannot be undone.",
      okType: "danger",
      onOk: () => {
        setData(data.filter((i) => i.key !== record.key));
        message.success("Observation deleted successfully");
      },
    });
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (text) => (
        <Space>
          <BarChartOutlined style={{ color: "#1890ff" }} />
          <span className="fw-600">{text}</span>
        </Space>
      ),
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
      title: "Value",
      dataIndex: "value",
      key: "value",
      render: (value, record) => (
        <span className="fw-600">
          {value} <span style={{ fontSize: "12px", color: "#999" }}>{record.unit}</span>
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        if (status === "good") {
          return (
            <Tag icon={<CheckCircleOutlined />} color="green">
              GOOD
            </Tag>
          );
        } else if (status === "suspect") {
          return (
            <Tag icon={<WarningOutlined />} color="orange">
              SUSPECT
            </Tag>
          );
        }
        return (
          <Tag icon={<CloseCircleOutlined />} color="red">
            BAD
          </Tag>
        );
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

  const goodCount = data.filter((o) => o.status === "good").length;
  const suspectCount = data.filter((o) => o.status === "suspect").length;
  const badCount = data.filter((o) => o.status === "bad").length;

  return (
    <div className="observations-page">
      {/* ===== STATS ===== */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Observations"
              value={data.length}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: "#1890ff", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Good Quality"
              value={goodCount}
              suffix={<span style={{ fontSize: "12px", color: "#999" }}>({Math.round((goodCount / data.length) * 100)}%)</span>}
              valueStyle={{ color: "#52c41a", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Suspect"
              value={suspectCount}
              valueStyle={{ color: "#faad14", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Bad Quality"
              value={badCount}
              valueStyle={{ color: "#f5222d", fontSize: "28px" }}
            />
          </Card>
        </Col>
      </Row>

      {/* ===== TABLE ===== */}
      <Card
        className="observations-table-card"
        title={
          <span>
            <BarChartOutlined style={{ marginRight: 8, color: "#1890ff" }} />
            All Observations
          </span>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
          >
            Add Observation
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
        title={editing ? "Edit Observation" : "Add Observation"}
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
            name="date"
            label="Date & Time"
            rules={[{ required: true, message: "Please enter date and time" }]}
          >
            <Input placeholder="e.g., 2025-01-22 10:30:00" />
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

          <Form.Item
            name="value"
            label="Value"
            rules={[{ required: true, message: "Please enter value" }]}
          >
            <Input type="number" placeholder="e.g., 2.45" />
          </Form.Item>

          <Form.Item
            name="unit"
            label="Unit"
            rules={[{ required: true, message: "Please enter unit" }]}
          >
            <Input placeholder="e.g., m, °C, ppt" />
          </Form.Item>

          <Form.Item name="status" label="Status">
            <Select
              placeholder="Select status"
              options={[
                { label: "Good", value: "good" },
                { label: "Suspect", value: "suspect" },
                { label: "Bad", value: "bad" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
