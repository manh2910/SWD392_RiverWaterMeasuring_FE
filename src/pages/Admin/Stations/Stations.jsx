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
} from "@ant-design/icons";

import {
  getStations,
  createStation,
  updateStation,
  deleteStation,
} from "../../../api/stationApi";

export default function Stations() {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form] = Form.useForm();

  // ================= FETCH =================

  const fetchStations = async () => {

    try {

      setLoading(true);

      const res = await getStations();

      console.log("API RESPONSE:", res);

      const stations = res?.data || res || [];

      console.log("RAW STATIONS:", stations);

      const formatted = stations.map((s) => {

        console.log("STATION ITEM:", s);

        return {
          id: s.stationId,
          key: s.stationId,
          stationCode: s.stationCode || "",
          name: s.stationName,
          lat: s.latitude,
          lng: s.longitude,
          riverId: s.riverId,
          status: s.isActive ? "active" : "offline",
        };
      });

      console.log("FORMATTED DATA:", formatted);

      // Chỉ hiển thị các trạm đang active trên giao diện
      setData(formatted.filter((s) => s.status === "active"));

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
        stationCode: record.stationCode,
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
        stationCode: String(values.stationCode || editing?.stationCode || "").trim(),
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
      width: 140,
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
            name="stationCode"
            label="Station Code"
            rules={[
              { required: true, message: "Please enter station code" },
              { min: 2, message: "Station code must be at least 2 characters" },
            ]}
          >
            <Input placeholder="Ex: ST002" />
          </Form.Item>

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

    </div>
  );
}