import { useEffect, useState } from "react";
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
import { createStation, deleteStation, getStations, updateStation } from "../../../api/stationApi";
import "./Stations.css";

const normalizeStation = (station, index) => {
  const id = station?.id ?? station?.stationId ?? station?.stationID ?? index + 1;
  const riverName =
    station?.riverName ||
    station?.river?.name ||
    station?.river ||
    "-";

  return {
    id,
    key: id,
    name: station?.name ?? station?.stationName ?? "-",
    code: station?.code ?? station?.stationCode ?? "-",
    location: station?.location ?? station?.address ?? "-",
    river: riverName,
    sensors: Number(station?.sensors ?? station?.sensorCount ?? 0),
    status: station?.status ?? "active",
  };
};

export default function Stations() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const loadStations = async () => {
    try {
      setLoading(true);
      const response = await getStations();
      const stations = Array.isArray(response) ? response : response?.data || response?.content || [];
      setData(stations.map(normalizeStation));
    } catch (error) {
      message.error(error?.response?.data?.message || "Failed to load stations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStations();
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
        sensors: Number(values.sensors || 0),
      };

      if (editing?.id) {
        await updateStation(editing.id, payload);
        message.success("Station updated successfully");
      } else {
        await createStation(payload);
        message.success("Station added successfully");
      }

      setOpen(false);
      setEditing(null);
      form.resetFields();
      loadStations();
    } catch (error) {
      if (error?.errorFields) {
        return;
      }
      message.error(error?.response?.data?.message || "Failed to save station");
    }
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete station?",
      content: "This action cannot be undone.",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteStation(record.id);
          message.success("Station deleted successfully");
          loadStations();
        } catch (error) {
          message.error(error?.response?.data?.message || "Failed to delete station");
        }
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
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowKey="id"
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
