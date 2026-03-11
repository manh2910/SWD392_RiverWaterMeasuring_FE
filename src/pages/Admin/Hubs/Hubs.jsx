import { useEffect, useState } from "react";
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
  Row,
  Col,
  Statistic,
  InputNumber,
} from "antd";

import {
  PlusOutlined,
  DeleteOutlined,
  ApartmentOutlined,
  LinkOutlined,
} from "@ant-design/icons";

import {
  getHubs,
  getHubDetail,
  createSensor,
} from "../../../api/hubApi";

import "./Hubs.css";

export default function Hubs() {

  const [hubs, setHubs] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [selectedHub, setSelectedHub] = useState(null);
  const [open, setOpen] = useState(false);

  const [form] = Form.useForm();

  // ===== FETCH HUBS =====

  const fetchHubs = async () => {

    try {

      const hubList = await getHubs();

      console.log("HUB API RESPONSE:", hubList);

      const data = Array.isArray(hubList) ? hubList : hubList?.data || [];

      setHubs(data);

    } catch (err) {

      console.error("HUB LOAD ERROR:", err);
      message.error("Failed to load hubs");

    }
  };

  // ===== FETCH HUB DETAIL =====

  const fetchHubDetail = async (hubId) => {

    try {

      const hub = await getHubDetail(hubId);

      console.log("HUB DETAIL:", hub);

      setSelectedHub(hub);

      const sensorList = Array.isArray(hub?.sensors)
        ? hub.sensors
        : [];

      setSensors(sensorList);

    } catch (err) {

      console.error("DETAIL ERROR:", err);
      message.error("Failed to load sensors");

    }
  };

  useEffect(() => {
    fetchHubs();
  }, []);

  // ===== ADD SENSOR =====

  const handleAddSensor = async () => {

    try {

      const values = await form.validateFields();

      console.log("FORM VALUES:", values);

      const payload = {
        parameterCode: values.parameterCode,
        parameterName: values.parameterName,
        unit: values.unit,
        status: values.status,
        samplingInterval: Number(values.samplingInterval),
      };

      console.log("CREATE SENSOR PAYLOAD:", payload);

      await createSensor(selectedHub.hubId, payload);

      message.success("Sensor added successfully");

      fetchHubDetail(selectedHub.hubId);

      setOpen(false);
      form.resetFields();

    } catch (err) {

      console.error("ADD SENSOR ERROR:", err);
      message.error("Add sensor failed");

    }
  };

  // ===== DELETE SENSOR (LOCAL ONLY) =====

  const handleDelete = (record) => {

    Modal.confirm({
      title: "Delete sensor?",
      okType: "danger",
      onOk: () => {

        setSensors(
          sensors.filter((s) => s.sensorId !== record.sensorId)
        );

        message.success("Sensor removed");

      },
    });
  };

  // ===== HUB TABLE =====

  const hubColumns = [

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

        <Button
          type="primary"
          onClick={() => fetchHubDetail(record.hubId)}
        >
          View Sensors
        </Button>

      ),
    },
  ];

  // ===== SENSOR TABLE =====

  const sensorColumns = [

    {
      title: "Sensor ID",
      dataIndex: "sensorId",
    },

    {
      title: "Parameter",
      dataIndex: "parameterName",
    },

    {
      title: "Code",
      dataIndex: "parameterCode",
    },

    {
      title: "Unit",
      dataIndex: "unit",
    },

    {
      title: "Interval",
      dataIndex: "samplingInterval",
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

        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record)}
        />

      ),
    },
  ];

  return (

    <div className="hubs-page">

      {/* ===== STATS ===== */}

      <Row gutter={16} style={{ marginBottom: 24 }}>

        <Col span={8}>
          <Card>
            <Statistic
              title="Total Hubs"
              value={hubs.length}
              prefix={<ApartmentOutlined />}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Statistic
              title="Total Sensors"
              value={sensors.length}
              prefix={<LinkOutlined />}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Statistic
              title="Active Sensors"
              value={
                sensors.filter(
                  (s) => s.status?.toLowerCase() === "active"
                ).length
              }
            />
          </Card>
        </Col>

      </Row>

      {/* ===== HUB TABLE ===== */}

      <Card title="Hubs" style={{ marginBottom: 20 }}>

        <Table
          rowKey="hubId"
          columns={hubColumns}
          dataSource={hubs}
        />

      </Card>

      {/* ===== SENSOR TABLE ===== */}

      <Card
        title={`Sensors of ${selectedHub?.hubCode || ""}`}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            disabled={!selectedHub}
            onClick={() => setOpen(true)}
          >
            Add Sensor
          </Button>
        }
      >

        <Table
          rowKey="sensorId"
          columns={sensorColumns}
          dataSource={sensors}
        />

      </Card>

      {/* ===== ADD SENSOR MODAL ===== */}

      <Modal
        open={open}
        title="Add Sensor"
        onOk={handleAddSensor}
        onCancel={() => setOpen(false)}
      >

        <Form layout="vertical" form={form}>

          <Form.Item
            name="parameterCode"
            label="Parameter Code"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="parameterName"
            label="Parameter Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="unit" label="Unit">
            <Input />
          </Form.Item>

          <Form.Item
            name="samplingInterval"
            label="Sampling Interval"
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="status" label="Status">
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