import { useEffect, useState } from "react";
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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import { createRiver, deleteRiver, getRivers, updateRiver } from "../../../api/riverApi";
import "./Rivers.css";

const normalizeRiver = (river, index) => {
  const id = river?.id ?? river?.riverId ?? river?.riverID ?? index + 1;
  const rawLength = river?.length ?? river?.riverLength ?? "";
  const length = typeof rawLength === "number" ? `${rawLength} km` : String(rawLength || "");

  return {
    id,
    key: id,
    name: river?.name ?? river?.riverName ?? "-",
    code: river?.code ?? river?.riverCode ?? "-",
    length,
    regions: river?.regions ?? river?.region ?? river?.location ?? "-",
    status: river?.status ?? "monitored",
    stations: Number(river?.stations ?? river?.stationCount ?? 0),
  };
};

export default function Rivers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const loadRivers = async () => {
    try {
      setLoading(true);
      const response = await getRivers();
      const rivers = Array.isArray(response) ? response : response?.data || response?.content || [];
      setData(rivers.map(normalizeRiver));
    } catch (error) {
      message.error(error?.response?.data?.message || "Failed to load rivers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRivers();
  }, []);

  const openModal = (record = null) => {
    setEditing(record);
    setOpen(true);
    form.setFieldsValue(record || {});
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        stations: Number(values.stations || 0),
      };

      if (editing?.id) {
        await updateRiver(editing.id, payload);
        message.success("River updated successfully");
      } else {
        await createRiver(payload);
        message.success("River added successfully");
      }

      setOpen(false);
      setEditing(null);
      form.resetFields();
      loadRivers();
    } catch (error) {
      if (error?.errorFields) {
        return;
      }
      message.error(error?.response?.data?.message || "Failed to save river");
    }
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete river?",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteRiver(record.id);
          message.success("River deleted successfully");
          loadRivers();
        } catch (error) {
          message.error(error?.response?.data?.message || "Failed to delete river");
        }
      },
    });
  };

  const columns = [
    {
      title: "River",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <Space>
          <EnvironmentOutlined style={{ color: "#1890ff" }} />
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
      title: "Length",
      dataIndex: "length",
      key: "length",
      render: (text) => (
        <Space>
          <RiseOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: "Regions",
      dataIndex: "regions",
      key: "regions",
    },
    {
      title: "Stations",
      dataIndex: "stations",
      key: "stations",
      render: (count) => (
        <span className="fw-600" style={{ color: "#1890ff" }}>
          {count} active
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        status === "monitored" ? (
          <Tag color="blue">MONITORED</Tag>
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
            title="Edit"
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            title="Delete"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="rivers-page">
      {/* ===== STATS ===== */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Rivers"
              value={data.length}
              prefix={<EnvironmentOutlined />}
              valueStyle={{ color: "#1890ff", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Monitored"
              value={data.filter((r) => r.status === "monitored").length}
              valueStyle={{ color: "#52c41a", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Stations"
              value={data.reduce((sum, r) => sum + r.stations, 0)}
              valueStyle={{ color: "#722ed1", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Length"
              value={`${data.reduce((sum, river) => {
                const value = parseFloat(String(river.length).replace(/[^\d.]/g, ""));
                return sum + (Number.isNaN(value) ? 0 : value);
              }, 0)} km`}
              valueStyle={{ color: "#fa8c16", fontSize: "28px" }}
            />
          </Card>
        </Col>
      </Row>

      {/* ===== TABLE ===== */}
      <Card
        className="rivers-table-card"
        title={
          <span>
            <EnvironmentOutlined style={{ marginRight: 8, color: "#1890ff" }} />
            All Rivers
          </span>
        }
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
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowKey="id"
          size="large"
          bordered={false}
          className="admin-table"
        />
      </Card>

      {/* ===== MODAL ===== */}
      <Modal
        open={open}
        title={editing ? "Edit River" : "Add River"}
        onOk={handleOk}
        onCancel={() => {
          setOpen(false);
          setEditing(null);
          form.resetFields();
        }}
        okText={editing ? "Update" : "Add"}
        width={700}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="name"
            label="River Name"
            rules={[{ required: true, message: "Please enter river name" }]}
          >
            <Input placeholder="e.g., Mekong River" />
          </Form.Item>
          <Form.Item
            name="code"
            label="Code"
            rules={[{ required: true, message: "Please enter code" }]}
          >
            <Input placeholder="e.g., R-MEKONG" />
          </Form.Item>
          <Form.Item
            name="length"
            label="Length"
            rules={[{ required: true, message: "Please enter length" }]}
          >
            <Input placeholder="e.g., 4350 km" />
          </Form.Item>
          <Form.Item
            name="regions"
            label="Regions"
            rules={[{ required: true, message: "Please enter regions" }]}
          >
            <Input placeholder="e.g., Vietnam, Laos, Cambodia" />
          </Form.Item>
          <Form.Item
            name="stations"
            label="Number of Stations"
            rules={[{ required: true, message: "Please enter number of stations" }]}
          >
            <Input type="number" placeholder="e.g., 12" />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select
              placeholder="Select status"
              options={[
                { label: "Monitored", value: "monitored" },
                { label: "Inactive", value: "inactive" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
