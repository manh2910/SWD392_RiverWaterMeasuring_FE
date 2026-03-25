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
  ApartmentOutlined,
  EditOutlined,
  DeleteOutlined,
  KeyOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import {
  getHubs,
  getHubDetail,
  updateHub,
  deleteHub,
  regenerateSecretKey,
} from "../../../api/hubApi";
import { createHub, getStations } from "../../../api/stationApi";

import "./Hubs.css";

export default function Hubs() {

  const [hubs, setHubs] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedHub, setSelectedHub] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);

  const [form] = Form.useForm();
  const [createForm] = Form.useForm();

  // ================= FETCH HUBS =================

  const fetchHubs = async () => {
    try {

      const res = await getHubs();

      const data = Array.isArray(res) ? res : res?.data || [];

      setHubs(data);

    } catch (err) {
      message.error("Failed to load hubs");
    }
  };

  useEffect(() => {
    fetchHubs();
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const res = await getStations();
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setStations(list);
    } catch {
      message.error("Failed to load stations");
    }
  };

  // ================= HUB DETAIL =================

  const handleView = async (id) => {

    try {

      const hub = await getHubDetail(id);

      setSelectedHub(hub);

      Modal.info({
        title: "Hub Detail",
        content: (
          <div>
            <p><b>Code:</b> {hub.hubCode}</p>
            <p><b>Protocol:</b> {hub.protocol}</p>
            <p><b>Status:</b> {hub.status}</p>
            <p><b>Secret Key:</b> {hub.secretKey}</p>
          </div>
        ),
      });

    } catch {
      message.error("Cannot load hub detail");
    }
  };

  // ================= EDIT HUB =================

  const handleEdit = (hub) => {

    setSelectedHub(hub);

    form.setFieldsValue(hub);

    setOpenEdit(true);
  };

  // ================= CREATE HUB =================

  const handleOpenCreate = () => {
    createForm.resetFields();
    createForm.setFieldsValue({
      protocol: "MQTT",
      status: "ACTIVE",
    });
    setOpenCreate(true);
  };

  const submitCreate = async () => {
    try {
      const values = await createForm.validateFields();
      const stationId = Number(values.stationId);
      const payload = {
        hubId: 0,
        hubCode: String(values.hubCode || "").trim(),
        protocol: values.protocol,
        status: values.status,
        stationId,
        secretKey: "",
        sensors: [],
      };

      await createHub(stationId, payload);
      message.success("Hub created");
      setOpenCreate(false);
      createForm.resetFields();
      fetchHubs();
    } catch {
      message.error("Create hub failed");
    }
  };

  const submitEdit = async () => {

    try {

      const values = await form.validateFields();

      await updateHub(selectedHub.hubId, values);

      message.success("Hub updated");

      setOpenEdit(false);

      fetchHubs();

    } catch {
      message.error("Update failed");
    }
  };

  // ================= DELETE HUB =================

  const handleDelete = (hub) => {

    Modal.confirm({
      title: "Delete this hub?",
      okType: "danger",

      onOk: async () => {

        await deleteHub(hub.hubId);

        message.success("Hub deleted");

        fetchHubs();
      },
    });
  };

  // ================= SECRET KEY =================

  const handleSecret = async (hub) => {

    try {

      const res = await regenerateSecretKey(hub.hubId);

      Modal.success({
        title: "New Secret Key",
        content: res.secretKey || "Secret key regenerated",
      });

    } catch {
      message.error("Failed to regenerate key");
    }
  };

  // ================= TABLE =================

  const columns = [

    {
      title: "Hub Code",
      dataIndex: "hubCode",
    },

    {
      title: "Protocol",
      dataIndex: "protocol",
    },

    {
      title: "Status",
      dataIndex: "status",
      render: (status) =>
        status?.toLowerCase() === "active"
          ? <Tag color="green">ACTIVE</Tag>
          : <Tag color="red">INACTIVE</Tag>,
    },

    {
      title: "Action",
      render: (_, record) => (

        <Space>

          <Button
            icon={<EyeOutlined />}
            onClick={() => handleView(record.hubId)}
          />

          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />

          <Button
            icon={<KeyOutlined />}
            onClick={() => handleSecret(record)}
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

      {/* ===== STATS ===== */}

      <Row gutter={16} style={{ marginBottom: 20 }}>

        <Col span={12}>
          <Card>
            <Statistic
              title="Total Hubs"
              value={hubs.length}
              prefix={<ApartmentOutlined />}
            />
          </Card>
        </Col>

        <Col span={12}>
          <Card>
            <Statistic
              title="Active Hubs"
              value={
                hubs.filter(
                  (h) => h.status?.toLowerCase() === "active"
                ).length
              }
            />
          </Card>
        </Col>

      </Row>

      {/* ===== HUB TABLE ===== */}

      <Card
        title="Hub Management"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
            Add Hub
          </Button>
        }
      >

        <Table
          rowKey="hubId"
          columns={columns}
          dataSource={hubs}
        />

      </Card>

      {/* ===== EDIT MODAL ===== */}

      <Modal
        open={openEdit}
        title="Edit Hub"
        onOk={submitEdit}
        onCancel={() => setOpenEdit(false)}
      >

        <Form layout="vertical" form={form}>

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
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
          >
            <Select
              options={[
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]}
            />
          </Form.Item>

        </Form>

      </Modal>

      {/* ===== CREATE MODAL ===== */}
      <Modal
        open={openCreate}
        title="Add Hub"
        onOk={submitCreate}
        onCancel={() => setOpenCreate(false)}
      >
        <Form layout="vertical" form={createForm}>
          <Form.Item
            name="stationId"
            label="Station"
            rules={[{ required: true, message: "Please select station" }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              options={stations.map((s) => ({
                value: s.stationId,
                label: s.stationName || `Station ${s.stationId}`,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="hubCode"
            label="Hub Code"
            rules={[{ required: true, message: "Please enter hub code" }]}
          >
            <Input placeholder="Ex: HUB_ST_12" />
          </Form.Item>

          <Form.Item
            name="protocol"
            label="Protocol"
            rules={[{ required: true, message: "Please select protocol" }]}
          >
            <Select
              options={[
                { label: "MQTT", value: "MQTT" },
                { label: "HTTP", value: "HTTP" },
                { label: "LoRa", value: "LORA" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select
              options={[
                { label: "Active", value: "ACTIVE" },
                { label: "Inactive", value: "INACTIVE" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
}