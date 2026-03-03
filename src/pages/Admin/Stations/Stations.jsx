import { useState } from "react";
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
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
} from "@ant-design/icons";
import "./Stations.css";

const initialData = [
  {
    key: 1,
    name: "Bien Hoa Station",
    code: "ST-BH-01",
    location: "Bien Hoa, Dong Nai",
    river: "Dong Nai River",
    sensors: 8,
    status: "active",
  },
  {
    key: 2,
    name: "Can Tho Station A",
    code: "ST-CT-A01",
    location: "Can Tho City",
    river: "Mekong River",
    sensors: 12,
    status: "active",
  },
  {
    key: 3,
    name: "Can Tho Station B",
    code: "ST-CT-B02",
    location: "Can Tho City",
    river: "Mekong River",
    sensors: 9,
    status: "active",
  },
  {
    key: 4,
    name: "My Tho Station",
    code: "ST-MT-002",
    location: "My Tho, Tien Giang",
    river: "Tien River",
    sensors: 6,
    status: "active",
  },
  {
    key: 5,
    name: "Vung Tau Coastal",
    code: "ST-VT-003",
    location: "Vung Tau",
    river: "Saigon River",
    sensors: 4,
    status: "offline",
  },
];

export default function Stations() {
  const [data, setData] = useState(initialData);
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
        message.success("Station updated successfully");
      } else {
        setData([
          ...data,
          {
            key: Date.now(),
            status: "active",
            ...values,
          },
        ]);
        message.success("Station added successfully");
      }

      setOpen(false);
      setEditing(null);
      form.resetFields();
    });
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete station?",
      content: "This action cannot be undone.",
      okType: "danger",
      onOk: () => {
        setData(data.filter((i) => i.key !== record.key));
        message.success("Station deleted successfully");
      },
    });
  };

  const columns = [
    {
      title: "Station",
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
      title: "River",
      dataIndex: "river",
      key: "river",
    },
    {
      title: "Sensors",
      dataIndex: "sensors",
      key: "sensors",
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
          <Tag color="red">OFFLINE</Tag>
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
    <div className="stations-page">
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Stations"
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
              value={data.filter((s) => s.status === "active").length}
              valueStyle={{ color: "#52c41a", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Sensors"
              value={data.reduce((sum, s) => sum + s.sensors, 0)}
              valueStyle={{ color: "#722ed1", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Offline"
              value={data.filter((s) => s.status === "offline").length}
              valueStyle={{ color: "#f5222d", fontSize: "28px" }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        className="stations-table-card"
        title={
          <span>
            <ApartmentOutlined style={{ marginRight: 8, color: "#1890ff" }} />
            All Stations
          </span>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
          >
            Add Station
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

      <Modal
        open={open}
        title={editing ? "Edit Station" : "Add Station"}
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
            label="Station Name"
            rules={[{ required: true, message: "Please enter station name" }]}
          >
            <Input placeholder="e.g., Bien Hoa Station" />
          </Form.Item>

          <Form.Item
            name="code"
            label="Code"
            rules={[{ required: true, message: "Please enter code" }]}
          >
            <Input placeholder="e.g., ST-BH-01" />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: "Please enter location" }]}
          >
            <Input placeholder="e.g., Bien Hoa, Dong Nai" />
          </Form.Item>

          <Form.Item
            name="river"
            label="River"
            rules={[{ required: true, message: "Please select river" }]}
          >
            <Select
              placeholder="Select river"
              options={[
                { label: "Mekong River", value: "Mekong River" },
                { label: "Dong Nai River", value: "Dong Nai River" },
                { label: "Tien River", value: "Tien River" },
                { label: "Saigon River", value: "Saigon River" },
                { label: "Red River", value: "Red River" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="sensors"
            label="Number of Sensors"
            rules={[{ required: true, message: "Please enter number of sensors" }]}
          >
            <Input type="number" placeholder="e.g., 8" />
          </Form.Item>

          <Form.Item name="status" label="Status">
            <Select
              placeholder="Select status"
              options={[
                { label: "Active", value: "active" },
                { label: "Offline", value: "offline" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
