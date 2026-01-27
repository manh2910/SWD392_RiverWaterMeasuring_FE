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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import "./Stations.css";

const initialData = [
  {
    key: 1,
    name: "Bien Hoa Station",
    code: "BH-001",
    location: "Dong Nai Province",
    river: "Dong Nai River",
    coord: "10.9561, 106.8564",
    sensors: 8,
    status: "online",
    time: "2 minutes ago",
  },
  {
    key: 2,
    name: "Can Tho Station A",
    code: "CT-A01",
    location: "Can Tho City",
    river: "Hau River",
    coord: "10.0452, 105.7469",
    sensors: 12,
    status: "online",
    time: "5 minutes ago",
  },
  {
    key: 3,
    name: "Can Tho Station B",
    code: "CT-B02",
    location: "Can Tho City",
    river: "Hau River",
    coord: "10.0350, 105.7700",
    sensors: 9,
    status: "maintenance",
    time: "30 minutes ago",
  },
  {
    key: 4,
    name: "My Tho Station",
    code: "MT-002",
    location: "Tien Giang Province",
    river: "Tien River",
    coord: "10.3500, 106.3600",
    sensors: 6,
    status: "maintenance",
    time: "1 hour ago",
  },
  {
    key: 5,
    name: "Long An Station",
    code: "LA-003",
    location: "Long An Province",
    river: "Vam Co River",
    coord: "10.5353, 106.4067",
    sensors: 7,
    status: "offline",
    time: "3 hours ago",
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
    form
      .validateFields()
      .then((values) => {
        if (editing) {
          setData(
            data.map((item) =>
              item.key === editing.key
                ? { ...item, ...values }
                : item
            )
          );
          message.success("Station updated successfully");
        } else {
          setData([
            ...data,
            {
              key: Date.now(),
              time: "Just now",
              sensors: Math.floor(Math.random() * 10) + 3,
              ...values,
            },
          ]);
          message.success("Station added successfully");
        }

        setOpen(false);
        setEditing(null);
        form.resetFields();
      })
      .catch(() => {
        message.error("Please fill in required fields");
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
      title: "STATION",
      dataIndex: "name",
      render: (text, record) => (
        <div className="station-name">
          <div className="station-icon">
            <EnvironmentOutlined />
          </div>
          <div>
            <div>{text}</div>
            <span className="time">{record.time}</span>
          </div>
        </div>
      ),
    },
    { title: "CODE", dataIndex: "code" },
    { title: "LOCATION", dataIndex: "location" },
    { title: "RIVER", dataIndex: "river" },
    { title: "COORDINATES", dataIndex: "coord" },
    {
      title: "SENSORS",
      dataIndex: "sensors",
      render: (v) => <b>{v}</b>,
    },
    {
      title: "STATUS",
      dataIndex: "status",
      render: (s) => {
        if (s === "online") return <Tag color="green">online</Tag>;
        if (s === "maintenance")
          return <Tag color="gold">maintenance</Tag>;
        return <Tag color="red">offline</Tag>;
      },
    },
    {
      title: "ACTIONS",
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} />
          <Button
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          />
          <Button
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
      <h1>Monitoring Stations</h1>
      <p className="subtitle">
        Manage water monitoring stations across the river network
      </p>

      <Card
        title="All Stations"
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
        <Table columns={columns} dataSource={data} pagination={false} />
      </Card>

      <Modal
        open={open}
        title={editing ? "Edit Station" : "Add Station"}
        onOk={handleOk}
        onCancel={() => setOpen(false)}
        okText="Save"
        destroyOnClose
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="name"
            label="Station Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="code" label="Code">
            <Input />
          </Form.Item>

          <Form.Item name="location" label="Location">
            <Input />
          </Form.Item>

          <Form.Item name="river" label="River">
            <Input />
          </Form.Item>

          <Form.Item name="coord" label="Coordinates">
            <Input />
          </Form.Item>

          <Form.Item name="status" label="Status">
            <Select>
              <Select.Option value="online">Online</Select.Option>
              <Select.Option value="maintenance">
                Maintenance
              </Select.Option>
              <Select.Option value="offline">Offline</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
