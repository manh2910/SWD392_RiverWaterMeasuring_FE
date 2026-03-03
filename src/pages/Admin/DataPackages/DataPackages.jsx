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
  InboxOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import "./DataPackages.css";

const initialDataPackages = [
  {
    key: 1,
    id: "PKG-001",
    station: "Can Tho Station",
    packageCount: 3,
    lastUpdate: "2025-01-22 10:30:00",
    status: "processed",
  },
  {
    key: 2,
    id: "PKG-002",
    station: "Can Tho Station",
    packageCount: 2,
    lastUpdate: "2025-01-22 10:25:00",
    status: "processed",
  },
  {
    key: 3,
    id: "PKG-003",
    station: "My Tho Station",
    packageCount: 4,
    lastUpdate: "2025-01-22 10:20:00",
    status: "pending",
  },
  {
    key: 4,
    id: "PKG-004",
    station: "Ben Tre Station",
    packageCount: 0,
    lastUpdate: "2025-01-22 10:15:00",
    status: "error",
  },
  {
    key: 5,
    id: "PKG-005",
    station: "My Tho Station",
    packageCount: 3,
    lastUpdate: "2025-01-22 10:10:00",
    status: "processed",
  },
];

export default function DataPackages() {
  const [data, setData] = useState(initialDataPackages);
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
        message.success("Data package updated successfully");
      } else {
        setData([
          ...data,
          {
            key: Date.now(),
            ...values,
          },
        ]);
        message.success("Data package added successfully");
      }
      setOpen(false);
      setEditing(null);
      form.resetFields();
    });
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete data package?",
      content: "This action cannot be undone.",
      okType: "danger",
      onOk: () => {
        setData(data.filter((i) => i.key !== record.key));
        message.success("Data package deleted successfully");
      },
    });
  };

  const columns = [
    {
      title: "Package ID",
      dataIndex: "id",
      key: "id",
      render: (text) => (
        <Space>
          <InboxOutlined style={{ color: "#1890ff" }} />
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
      title: "Observations",
      dataIndex: "packageCount",
      key: "packageCount",
      render: (count) => (
        <span className="fw-600" style={{ color: "#722ed1" }}>
          {count} records
        </span>
      ),
    },
    {
      title: "Last Update",
      dataIndex: "lastUpdate",
      key: "lastUpdate",
      render: (text) => <span style={{ fontSize: "12px", color: "#999" }}>{text}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        if (status === "processed") {
          return (
            <Tag icon={<CheckCircleOutlined />} color="green">
              PROCESSED
            </Tag>
          );
        } else if (status === "pending") {
          return (
            <Tag icon={<ClockCircleOutlined />} color="orange">
              PENDING
            </Tag>
          );
        }
        return (
          <Tag icon={<CloseCircleOutlined />} color="red">
            ERROR
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

  const processedCount = data.filter((p) => p.status === "processed").length;
  const pendingCount = data.filter((p) => p.status === "pending").length;
  const errorCount = data.filter((p) => p.status === "error").length;

  return (
    <div className="data-packages-page">
      {/* ===== STATS ===== */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Packages"
              value={data.length}
              prefix={<InboxOutlined />}
              valueStyle={{ color: "#1890ff", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Processed"
              value={processedCount}
              suffix={<span style={{ fontSize: "12px", color: "#999" }}>({Math.round((processedCount / data.length) * 100)}%)</span>}
              valueStyle={{ color: "#52c41a", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Pending"
              value={pendingCount}
              valueStyle={{ color: "#faad14", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Errors"
              value={errorCount}
              valueStyle={{ color: "#f5222d", fontSize: "28px" }}
            />
          </Card>
        </Col>
      </Row>

      {/* ===== TABLE ===== */}
      <Card
        className="data-packages-table-card"
        title={
          <span>
            <InboxOutlined style={{ marginRight: 8, color: "#1890ff" }} />
            All Data Packages
          </span>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
          >
            Add Package
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
        title={editing ? "Edit Data Package" : "Add Data Package"}
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
            name="id"
            label="Package ID"
            rules={[{ required: true, message: "Please enter package ID" }]}
          >
            <Input placeholder="e.g., PKG-001" />
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
            name="packageCount"
            label="Number of Observations"
            rules={[{ required: true, message: "Please enter observation count" }]}
          >
            <Input type="number" placeholder="e.g., 3" />
          </Form.Item>

          <Form.Item
            name="lastUpdate"
            label="Last Update"
            rules={[{ required: true, message: "Please enter last update time" }]}
          >
            <Input placeholder="e.g., 2025-01-22 10:30:00" />
          </Form.Item>

          <Form.Item name="status" label="Status">
            <Select
              placeholder="Select status"
              options={[
                { label: "Processed", value: "processed" },
                { label: "Pending", value: "pending" },
                { label: "Error", value: "error" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
