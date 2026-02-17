import { useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Tag,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DeploymentUnitOutlined,
} from "@ant-design/icons";
import "./Rivers.css";

const initialRivers = [
  {
    key: 1,
    name: "Mekong River",
    code: "R-MEKONG",
    length: "4350 km",
    regions: "Vietnam, Laos, Cambodia",
    status: "monitored",
  },
  {
    key: 2,
    name: "Dong Nai River",
    code: "R-DN",
    length: "586 km",
    regions: "Dong Nai, HCMC",
    status: "monitored",
  },
  {
    key: 3,
    name: "Saigon River",
    code: "R-SG",
    length: "256 km",
    regions: "HCMC",
    status: "inactive",
  },
];

export default function Rivers() {
  const [data, setData] = useState(initialRivers);
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
        message.success("River updated successfully");
      } else {
        setData([
          ...data,
          { key: Date.now(), status: "monitored", ...values },
        ]);
        message.success("River added successfully");
      }
      setOpen(false);
      setEditing(null);
      form.resetFields();
    });
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete river?",
      okType: "danger",
      onOk: () => {
        setData(data.filter((i) => i.key !== record.key));
        message.success("River deleted successfully");
      },
    });
  };

  const columns = [
    {
      title: "RIVER",
      dataIndex: "name",
      render: (t) => (
        <Space>
          <DeploymentUnitOutlined />
          <b>{t}</b>
        </Space>
      ),
    },
    { title: "CODE", dataIndex: "code" },
    { title: "LENGTH", dataIndex: "length" },
    { title: "REGIONS", dataIndex: "regions" },
    {
      title: "STATUS",
      dataIndex: "status",
      render: (s) =>
        s === "monitored" ? (
          <Tag color="blue">monitored</Tag>
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
    <div className="rivers-page">
      <h1>Rivers</h1>
      <Card
        title="All Rivers"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
          >
            Add River
          </Button>
        }
      >
        <Table columns={columns} dataSource={data} pagination={false} />
      </Card>

      <Modal
        open={open}
        title={editing ? "Edit River" : "Add River"}
        onOk={handleOk}
        onCancel={() => setOpen(false)}
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="name" label="River Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="Code">
            <Input />
          </Form.Item>
          <Form.Item name="length" label="Length">
            <Input />
          </Form.Item>
          <Form.Item name="regions" label="Regions">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
