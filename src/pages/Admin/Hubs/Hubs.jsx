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
} from "@ant-design/icons";

import {
  getHubs,
  getHubDetail,
  updateHub,
  deleteHub,
  regenerateSecretKey,
} from "../../../api/hubApi";

import "./Hubs.css";

export default function Hubs() {

  const [hubs, setHubs] = useState([]);
  const [selectedHub, setSelectedHub] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);

  const [form] = Form.useForm();

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
  }, []);

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

      <Card title="Hub Management">

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

    </div>
  );
}