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
  InputNumber,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LineChartOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import "./Parameters.css";

const initialParameters = [
  {
    key: 1,
    name: "Water Level",
    code: "WL",
    unit: "m",
    type: "Physical",
    threshold: "5.0",
    status: "active",
  },
  {
    key: 2,
    name: "Salinity",
    code: "SAL",
    unit: "ppt",
    type: "Chemical",
    threshold: "35.0",
    status: "active",
  },
  {
    key: 3,
    name: "pH",
    code: "PH",
    unit: "pH",
    type: "Chemical",
    threshold: "8.5",
    status: "active",
  },
  {
    key: 4,
    name: "Temperature",
    code: "TEMP",
    unit: "°C",
    type: "Physical",
    threshold: "35.0",
    status: "active",
  },
  {
    key: 5,
    name: "Dissolved Oxygen",
    code: "DO",
    unit: "mg/L",
    type: "Chemical",
    threshold: "5.0",
    status: "active",
  },
  {
    key: 6,
    name: "Turbidity",
    code: "TURB",
    unit: "NTU",
    type: "Physical",
    threshold: "50.0",
    status: "active",
  },
];

export default function Parameters() {
  const [data, setData] = useState(initialParameters);
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
        message.success("Parameter updated successfully");
      } else {
        setData([
          ...data,
          {
            key: Date.now(),
            status: "active",
            ...values,
          },
        ]);
        message.success("Parameter added successfully");
      }
      setOpen(false);
      setEditing(null);
      form.resetFields();
    });
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete parameter?",
      content: "This action cannot be undone.",
      okType: "danger",
      onOk: () => {
        setData(data.filter((i) => i.key !== record.key));
        message.success("Parameter deleted successfully");
      },
    });
  };

  const columns = [
    {
      title: "Parameter",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <Space>
          <LineChartOutlined style={{ color: "#1890ff" }} />
          <span className="fw-600">{text}</span>
        </Space>
      ),
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (code) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag color={type === "Physical" ? "green" : "orange"}>{type}</Tag>
      ),
    },
    {
      title: "Threshold",
      dataIndex: "threshold",
      key: "threshold",
      render: (threshold) => (
        <span className="fw-600" style={{ color: "#722ed1" }}>
          {threshold}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        status === "active" ? (
          <Tag color="green">ACTIVE</Tag>
        ) : (
          <Tag color="red">INACTIVE</Tag>
        ),
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
    <div className="parameters-page">
      {/* ===== STATS ===== */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Parameters"
              value={data.length}
              prefix={<UnorderedListOutlined />}
              valueStyle={{ color: "#1890ff", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Active"
              value={data.filter((p) => p.status === "active").length}
              valueStyle={{ color: "#52c41a", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Physical"
              value={data.filter((p) => p.type === "Physical").length}
              valueStyle={{ color: "#722ed1", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Chemical"
              value={data.filter((p) => p.type === "Chemical").length}
              valueStyle={{ color: "#fa8c16", fontSize: "28px" }}
            />
          </Card>
        </Col>
      </Row>

      {/* ===== TABLE ===== */}
      <Card
        className="parameters-table-card"
        title={
          <span>
            <LineChartOutlined style={{ marginRight: 8, color: "#1890ff" }} />
            All Parameters
          </span>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
          >
            Add Parameter
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
        title={editing ? "Edit Parameter" : "Add Parameter"}
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
            label="Parameter Name"
            rules={[{ required: true, message: "Please enter parameter name" }]}
          >
            <Input placeholder="e.g., Water Level" />
          </Form.Item>

          <Form.Item
            name="code"
            label="Code"
            rules={[{ required: true, message: "Please enter code" }]}
          >
            <Input placeholder="e.g., WL" />
          </Form.Item>

          <Form.Item
            name="unit"
            label="Unit"
            rules={[{ required: true, message: "Please enter unit" }]}
          >
            <Input placeholder="e.g., m, °C, ppt" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: "Please select type" }]}
          >
            <Select
              placeholder="Select type"
              options={[
                { label: "Physical", value: "Physical" },
                { label: "Chemical", value: "Chemical" },
                { label: "Biological", value: "Biological" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="threshold"
            label="Threshold Value"
            rules={[{ required: true, message: "Please enter threshold" }]}
          >
            <Input placeholder="e.g., 5.0" />
          </Form.Item>

          <Form.Item name="status" label="Status">
            <Select
              placeholder="Select status"
              options={[
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
