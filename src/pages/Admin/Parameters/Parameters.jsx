import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Tag,
  message,
  Row,
  Col,
  Statistic,
  Button,
  Space,
  Modal,
  Form,
  Input,
} from "antd";

import {
  LineChartOutlined,
  UnorderedListOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import {
  getParameters,
  createParameter,
  updateParameter,
  deleteParameter,
} from "../../../api/paraApi";

import "./Parameters.css";

const formatList = (list) => {
  const arr = Array.isArray(list) ? list : [];

  return arr.map((p) => ({
    key: p.parameterId,
    parameterId: p.parameterId,
    name: p.name,
    code: p.code,
    unit: p.defaultUnit,
    description: p.description,
    type: /ph|do|cond|sal|chem/i.test(p.code || "")
      ? "Chemical"
      : "Physical",
  }));
};

export default function Parameters() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form] = Form.useForm();

  const fetchParameters = async () => {
    setLoading(true);

    try {
      const res = await getParameters();
      setData(formatList(res));
    } catch (err) {
      console.error("LOAD PARAMETERS ERROR:", err);
      message.error("Failed to load parameters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParameters();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingId(record.parameterId);

    form.setFieldsValue({
      name: record.name,
      code: record.code,
      defaultUnit: record.unit,
      description: record.description,
    });

    setModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingId) {
        await updateParameter(editingId, values);
        message.success("Parameter updated");
      } else {
        await createParameter(values);
        message.success("Parameter created");
      }

      setModalOpen(false);
      fetchParameters();
    } catch (err) {
      if (err.errorFields) return;

      message.error(
        err.response?.data?.message ||
          err.message ||
          "Request failed"
      );
    }
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete parameter?",
      content: `Remove "${record.name}" (${record.code})?`,
      okType: "danger",
      onOk: async () => {
        try {
          await deleteParameter(record.parameterId);
          message.success("Parameter deleted");
          fetchParameters();
        } catch (err) {
          message.error(
            err.response?.data?.message || "Delete failed"
          );
        }
      },
    });
  };

  const columns = [
    {
      title: "Parameter",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <span>
          <LineChartOutlined
            style={{ color: "#666", marginRight: 8 }}
          />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </span>
      ),
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (code) => <Tag color="geekblue">{code}</Tag>,
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
        <Tag color={type === "Physical" ? "green" : "orange"}>
          {type}
        </Tag>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => text || "-",
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
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
    <div className="parameters-page">
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Parameters"
              value={data.length}
              prefix={<UnorderedListOutlined />}
              valueStyle={{ color: "#666", fontSize: "26px" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Physical"
              value={data.filter((p) => p.type === "Physical").length}
              valueStyle={{ color: "#52c41a", fontSize: "26px" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Chemical"
              value={data.filter((p) => p.type === "Chemical").length}
              valueStyle={{ color: "#fa8c16", fontSize: "26px" }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        className="parameters-table-card"
        title={
          <span>
            <LineChartOutlined
              style={{ marginRight: 8, color: "#666" }}
            />
            All Parameters
          </span>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openAdd}
          >
            Add Parameter
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowKey="key"
          size="large"
          className="admin-table"
        />
      </Card>

      <Modal
        open={modalOpen}
        title={editingId ? "Edit Parameter" : "Add Parameter"}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        okText={editingId ? "Update" : "Create"}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="e.g. pH" />
          </Form.Item>

          <Form.Item
            name="code"
            label="Code"
            rules={[{ required: true }]}
          >
            <Input placeholder="e.g. PH" />
          </Form.Item>

          <Form.Item name="defaultUnit" label="Unit">
            <Input placeholder="e.g. mg/L" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Optional" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}