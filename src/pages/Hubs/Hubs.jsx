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
  ApartmentOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import "./Hubs.css";

const initialHubs = [
  {
    key: 1,
    name: "Can Tho Hub",
    code: "HUB-CT",
    location: "Can Tho City",
    status: "active",
    devices: 5,
  },
  {
    key: 2,
    name: "Dong Nai Hub",
    code: "HUB-DN",
    location: "Dong Nai Province",
    status: "active",
    devices: 7,
  },
  {
    key: 3,
    name: "Tien Giang Hub",
    code: "HUB-TG",
    location: "Tien Giang Province",
    status: "inactive",
    devices: 4,
  },
  {
    key: 4,
    name: "Ho Chi Minh Hub",
    code: "HUB-HCM",
    location: "Ho Chi Minh City",
    status: "active",
    devices: 6,
  },
  {
    key: 5,
    name: "Red River Hub",
    code: "HUB-RR",
    location: "Northern Vietnam",
    status: "active",
    devices: 8,
  },
];

export default function Hubs() {
  const [data, setData] = useState(initialHubs);
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
        message.success("Hub updated successfully");
      } else {
        setData([
          ...data,
          {
            key: Date.now(),
            status: "active",
            ...values,
          },
        ]);
        message.success("Hub added successfully");
      }
      setOpen(false);
      setEditing(null);
      form.resetFields();
    });
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete hub?",
      content: "This action cannot be undone.",
      okType: "danger",
      onOk: () => {
        setData(data.filter((i) => i.key !== record.key));
        message.success("Hub deleted successfully");
      },
    });
  };

  const columns = [
    {
      title: "Hub",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <Space>
          <ApartmentOutlined style={{ color: "#1890ff" }} />
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
      title: "Location",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Devices",
      dataIndex: "devices",
      key: "devices",
      render: (count) => (
        <span className="fw-600" style={{ color: "#1890ff" }}>
          {count}
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
    <div className="hubs-page">
      {/* ===== STATS ===== */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Hubs"
              value={data.length}
              prefix={<ApartmentOutlined />}
              valueStyle={{ color: "#1890ff", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Active"
              value={data.filter((h) => h.status === "active").length}
              valueStyle={{ color: "#52c41a", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Devices"
              value={data.reduce((sum, h) => sum + h.devices, 0)}
              prefix={<LinkOutlined />}
              valueStyle={{ color: "#722ed1", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Inactive"
              value={data.filter((h) => h.status === "inactive").length}
              valueStyle={{ color: "#f5222d", fontSize: "28px" }}
            />
          </Card>
        </Col>
      </Row>

      {/* ===== TABLE ===== */}
      <Card
        className="hubs-table-card"
        title={
          <span>
            <ApartmentOutlined style={{ marginRight: 8, color: "#1890ff" }} />
            All Hubs
          </span>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
          >
            Add Hub
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
        title={editing ? "Edit Hub" : "Add Hub"}
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
            label="Hub Name"
            rules={[{ required: true, message: "Please enter hub name" }]}
          >
            <Input placeholder="e.g., Can Tho Hub" />
          </Form.Item>

          <Form.Item
            name="code"
            label="Code"
            rules={[{ required: true, message: "Please enter code" }]}
          >
            <Input placeholder="e.g., HUB-CT" />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: "Please enter location" }]}
          >
            <Input placeholder="e.g., Can Tho City" />
          </Form.Item>

          <Form.Item
            name="devices"
            label="Number of Devices"
            rules={[{ required: true, message: "Please enter number of devices" }]}
          >
            <Input type="number" placeholder="e.g., 5" />
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
