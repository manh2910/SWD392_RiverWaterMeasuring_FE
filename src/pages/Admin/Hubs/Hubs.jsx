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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import "./Hubs.css";

const initialHubs = [
  {
    key: 1,
    name: "Can Tho Hub",
    code: "HUB-CT",
    location: "Can Tho City",
    manager: "Nguyen Van A",
    stations: 5,
    status: "active",
  },
  {
    key: 2,
    name: "Dong Nai Hub",
    code: "HUB-DN",
    location: "Dong Nai Province",
    manager: "Tran Thi B",
    stations: 7,
    status: "active",
  },
  {
    key: 3,
    name: "Tien Giang Hub",
    code: "HUB-TG",
    location: "Tien Giang Province",
    manager: "Le Van C",
    stations: 4,
    status: "inactive",
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
          data.map((i) =>
            i.key === editing.key ? { ...i, ...values } : i
          )
        );
        message.success("Hub updated successfully");
      } else {
        setData([
          ...data,
          {
            key: Date.now(),
            stations: Math.floor(Math.random() * 5) + 2,
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
      content: "All linked stations will be affected.",
      okType: "danger",
      onOk: () => {
        setData(data.filter((i) => i.key !== record.key));
        message.success("Hub deleted successfully");
      },
    });
  };

  const columns = [
    {
      title: "HUB",
      dataIndex: "name",
      render: (t) => (
        <Space>
          <ApartmentOutlined />
          <b>{t}</b>
        </Space>
      ),
    },
    { title: "CODE", dataIndex: "code" },
    { title: "LOCATION", dataIndex: "location" },
    { title: "MANAGER", dataIndex: "manager" },
    { title: "STATIONS", dataIndex: "stations" },
    {
      title: "STATUS",
      dataIndex: "status",
      render: (s) =>
        s === "active" ? (
          <Tag color="green">active</Tag>
        ) : (
          <Tag color="red">inactive</Tag>
        ),
    },
    {
      title: "ACTIONS",
      render: (_, record) => (
        <Space>
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
    <div className="hubs-page">
      <h1>Hubs</h1>
      <Card
        title="All Hubs"
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
        <Table dataSource={data} columns={columns} pagination={false} />
      </Card>

      <Modal
        open={open}
        title={editing ? "Edit Hub" : "Add Hub"}
        onOk={handleOk}
        onCancel={() => setOpen(false)}
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="name" label="Hub Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="Code">
            <Input />
          </Form.Item>
          <Form.Item name="location" label="Location">
            <Input />
          </Form.Item>
          <Form.Item name="manager" label="Manager">
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
