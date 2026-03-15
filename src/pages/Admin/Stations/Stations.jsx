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
  InputNumber,
} from "antd";

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ApartmentOutlined,
  ApiOutlined,
} from "@ant-design/icons";

import {
  getStations,
  createStation,
  updateStation,
  deleteStation,
  createHub,
} from "../../../api/stationApi";

export default function Stations() {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [hubOpen, setHubOpen] = useState(false);

  const [editing, setEditing] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);

  const [form] = Form.useForm();
  const [hubForm] = Form.useForm();

  // ================= FETCH =================

  const fetchStations = async () => {

    try {

      setLoading(true);

      const list = await getStations();
      const stations = Array.isArray(list) ? list : [];

      const formatted = stations.map((s) => ({
        id: s.stationId ?? s.id,
        key: s.stationId ?? s.id,
        name: s.stationName ?? s.name,
        lat: s.latitude ?? s.lat,
        lng: s.longitude ?? s.lng,
        riverId: s.riverId,
        status: s.isActive !== undefined ? (s.isActive ? "active" : "offline") : (s.status || "offline"),
      }));

      setData(formatted);

    } catch (err) {

      console.error("FETCH ERROR:", err);
      message.error("Failed to load stations");

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  // ================= OPEN MODAL =================

  const openModal = (record = null) => {

    console.log("OPEN MODAL RECORD:", record);

    setEditing(record);
    setOpen(true);

    if (record) {

      form.setFieldsValue({
        name: record.name,
        lat: record.lat,
        lng: record.lng,
        riverId: record.riverId,
        status: record.status,
      });

    } else {

      form.resetFields();

    }
  };

  // ================= SAVE =================

  const handleSave = async () => {

    try {

      const values = await form.validateFields();

      console.log("FORM VALUES:", values);

      const payload = {

        stationId: editing ? editing.id : 0,
        stationCode: "",
        stationName: values.name,
        latitude: Number(values.lat),
        longitude: Number(values.lng),
        riverId: Number(values.riverId),
        isActive: values.status === "active",

      };

      console.log("PAYLOAD:", payload);

      if (editing) {

        console.log("UPDATE STATION:", editing.id);

        await updateStation(editing.id, payload);

        message.success("Station updated");

      } else {

        console.log("CREATE STATION");

        await createStation(payload);

        message.success("Station created");

      }

      setOpen(false);
      setEditing(null);
      form.resetFields();

      fetchStations();

    } catch (err) {

      console.error("SAVE ERROR:", err);
      console.error("SERVER RESPONSE:", err?.response?.data);

      message.error("Save failed");

    }
  };

  // ================= DELETE =================

  const handleDelete = (record) => {

    Modal.confirm({

      title: "Delete station?",
      content: record.name,
      okType: "danger",

      onOk: async () => {

        try {

          console.log("DELETE STATION:", record.id);

          await deleteStation(record.id);

          message.success("Station deleted");

          fetchStations();

        } catch (err) {

          console.error("DELETE ERROR:", err);
          message.error("Delete failed");

        }
      },
    });
  };

  // ================= HUB =================

  const openHubModal = (station) => {

    console.log("OPEN HUB MODAL:", station);

    setSelectedStation(station);
    setHubOpen(true);

  };

  const handleCreateHub = async () => {

    try {

      const values = await hubForm.validateFields();

      console.log("HUB FORM VALUES:", values);

      const payload = {

        hubId: 0,
        hubCode: values.hubCode,
        protocol: values.protocol,
        status: "ACTIVE",
        stationId: selectedStation.id,
        secretKey: "",
        sensors: []

      };

      console.log("HUB PAYLOAD:", payload);

      await createHub(selectedStation.id, payload);

      message.success("Hub created");

      setHubOpen(false);
      hubForm.resetFields();

    } catch (err) {

      console.error("CREATE HUB ERROR:", err);
      message.error("Create hub failed");

    }
  };

  // ================= TABLE =================

  const columns = [

    {
      title: "Station",
      dataIndex: "name",
      render: (text) => (
        <Space>
          <ApartmentOutlined style={{ color: "#1677ff" }} />
          <b>{text}</b>
        </Space>
      ),
    },

    {
      title: "Latitude",
      dataIndex: "lat",
    },

    {
      title: "Longitude",
      dataIndex: "lng",
    },

    {
      title: "River ID",
      dataIndex: "riverId",
    },

    {
      title: "Status",
      dataIndex: "status",
      render: (status) =>
        status === "active"
          ? <Tag color="green">ACTIVE</Tag>
          : <Tag color="red">OFFLINE</Tag>,
    },

    {
      title: "Actions",
      width: 220,
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

          <Button
            type="primary"
            icon={<ApiOutlined />}
            onClick={() => openHubModal(record)}
          >
            Hub
          </Button>

        </Space>

      ),
    },
  ];

  return (

    <div style={{ padding: 24 }}>

      {/* ===== STATS ===== */}

      <Row gutter={16} style={{ marginBottom: 24 }}>

        <Col span={8}>
          <Card>
            <Statistic
              title="Total Stations"
              value={data.length}
              prefix={<ApartmentOutlined />}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Statistic
              title="Active"
              value={data.filter((s) => s.status === "active").length}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Statistic
              title="Offline"
              value={data.filter((s) => s.status === "offline").length}
            />
          </Card>
        </Col>

      </Row>

      {/* ===== TABLE ===== */}

      <Card
        title="Monitoring Stations"
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
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />

      </Card>

      {/* ===== CREATE / EDIT STATION ===== */}

      <Modal
        open={open}
        title={editing ? "Edit Station" : "Add Station"}
        onOk={handleSave}
        onCancel={() => {

          setOpen(false);
          setEditing(null);
          form.resetFields();

        }}
      >

        <Form layout="vertical" form={form}>

          <Form.Item
            name="name"
            label="Station Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="lat" label="Latitude">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="lng" label="Longitude">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="riverId" label="River ID">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="status" label="Status">
            <Select
              options={[
                { label: "Active", value: "active" },
                { label: "Offline", value: "offline" },
              ]}
            />
          </Form.Item>

        </Form>

      </Modal>

      {/* ===== CREATE HUB ===== */}

      <Modal
        open={hubOpen}
        title={`Create Hub for ${selectedStation?.name}`}
        onOk={handleCreateHub}
        onCancel={() => {

          setHubOpen(false);
          hubForm.resetFields();

        }}
      >

        <Form layout="vertical" form={hubForm}>

          <Form.Item
            name="hubCode"
            label="Hub Code"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="protocol"
            label="Protocol"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: "MQTT", value: "MQTT" },
                { label: "HTTP", value: "HTTP" },
                { label: "LoRa", value: "LORA" },
              ]}
            />
          </Form.Item>

        </Form>

      </Modal>

    </div>
  );
}