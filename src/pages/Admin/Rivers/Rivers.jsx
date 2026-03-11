import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Tag,
  Select,
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
  EnvironmentOutlined,
  RiseOutlined,
} from "@ant-design/icons";

import {
  getRivers,
  createRiver,
  updateRiver,
  deleteRiver,
} from "../../../api/riverApi";

export default function Rivers() {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [riverType, setRiverType] = useState("main");

  const [form] = Form.useForm();

  // FETCH RIVERS
  const fetchRivers = async () => {

    try {

      setLoading(true);

      const rivers = await getRivers();

      const formatted = rivers.map((r) => ({
        id: r.riverId,
        name: r.riverName,
        description: r.description,
        length: r.length,
        region: r.region,
        type: r.riverType === "MAIN" ? "main" : "branch",
        parentRiverId: r.parentRiverId,
      }));

      setData(formatted);

    } catch (err) {

      console.error(err);
      message.error("Failed to load rivers");

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {
    fetchRivers();
  }, []);

  const mainRivers = data.filter((r) => r.type === "main");

  // OPEN MODAL
  const openModal = (record = null) => {

    setEditing(record);
    setOpen(true);

    if (record) {

      form.setFieldsValue({
        name: record.name,
        description: record.description,
        length: record.length,
        region: record.region,
        type: record.type,
        parentRiverId: record.parentRiverId,
      });

      setRiverType(record.type);

    } else {

      form.resetFields();
      setRiverType("main");

    }

  };

  // SAVE RIVER
  const handleOk = async () => {

    try {

      const values = await form.validateFields();

      const payload = {
        riverId: editing ? editing.id : 0,
        riverName: values.name,
        description: values.description || "",
        riverType: values.type === "main" ? "MAIN" : "BRANCH",
        region: values.region || "",
        length: Number(values.length) || 0,
        parentRiverId:
          values.type === "main"
            ? null
            : Number(values.parentRiverId),
      };

      console.log("SEND PAYLOAD:", payload);

      if (editing) {

        await updateRiver(editing.id, payload);
        message.success("River updated");

      } else {

        await createRiver(payload);
        message.success("River created");

      }

      setOpen(false);
      setEditing(null);
      form.resetFields();

      fetchRivers();

    } catch (err) {

      console.error("SAVE ERROR:", err.response?.data || err);
      message.error("Operation failed");

    }

  };

  // DELETE
  const handleDelete = (record) => {

    Modal.confirm({

      title: "Delete this river?",
      content: record.name,
      okType: "danger",

      onOk: async () => {

        try {

          await deleteRiver(record.id);
          message.success("River deleted");

          fetchRivers();

        } catch {

          message.error("Delete failed");

        }

      },
    });

  };

  // TABLE COLUMNS
  const columns = [

    {
      title: "River",
      dataIndex: "name",
      render: (text) => (
        <Space>
          <EnvironmentOutlined style={{ color: "#1890ff" }} />
          <b>{text}</b>
        </Space>
      ),
    },

    {
      title: "Description",
      dataIndex: "description",
    },

    {
      title: "Length (km)",
      dataIndex: "length",
      render: (text) => (
        <Space>
          <RiseOutlined />
          {text}
        </Space>
      ),
    },

    {
      title: "Region",
      dataIndex: "region",
    },

    {
      title: "River Type",
      dataIndex: "type",
      render: (type) => (
        <Tag color={type === "main" ? "blue" : "green"}>
          {type === "main" ? "MAIN" : "BRANCH"}
        </Tag>
      ),
    },

    {
      title: "Actions",
      render: (_, record) => (
        <Space>

          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          />

          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />

        </Space>
      ),
    },

  ];

  return (

    <div>

      <Row gutter={16} style={{ marginBottom: 20 }}>

        <Col span={8}>
          <Card>
            <Statistic
              title="Total Rivers"
              value={data.length}
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Statistic
              title="Main Rivers"
              value={data.filter((r) => r.type === "main").length}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Statistic
              title="Branch Rivers"
              value={data.filter((r) => r.type === "branch").length}
            />
          </Card>
        </Col>

      </Row>

      <Card
        title="Rivers"
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

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
        />

      </Card>

      <Modal
        open={open}
        title={editing ? "Edit River" : "Add River"}
        onOk={handleOk}
        onCancel={() => {

          setOpen(false);
          setEditing(null);
          form.resetFields();

        }}
      >

        <Form form={form} layout="vertical">

          <Form.Item
            name="name"
            label="River Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Mekong River" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>

          <Form.Item name="length" label="Length (km)">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="region" label="Region">
            <Input placeholder="Vietnam" />
          </Form.Item>

          <Form.Item
            name="type"
            label="River Type"
            rules={[{ required: true }]}
          >

            <Select
              onChange={(value) => {

                setRiverType(value);

                if (value === "main") {
                  form.setFieldValue("parentRiverId", null);
                }

              }}
              options={[
                { label: "Main River", value: "main" },
                {
                  label: "Branch River",
                  value: "branch",
                  disabled: mainRivers.length === 0,
                },
              ]}
            />

          </Form.Item>

          {riverType === "branch" && (

            <Form.Item
              name="parentRiverId"
              label="Parent River"
              rules={[
                {
                  required: true,
                  message: "Branch river must have a parent river",
                },
              ]}
            >

              <Select
                placeholder="Select main river"
                options={mainRivers.map((r) => ({
                  label: r.name,
                  value: r.id,
                }))}
              />

            </Form.Item>

          )}

        </Form>

      </Modal>

    </div>

  );

}