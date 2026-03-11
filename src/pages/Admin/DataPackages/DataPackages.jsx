import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Select,
  Tag,
  message,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import {
  getDataPackages,
  getDataPackagesSummary,
  updateDataPackageStatus,
  deleteDataPackage,
} from "../../../api/dataPackageApi";
import "./DataPackages.css";

const normalizeStatus = (s) => {
  const v = (s || "").toLowerCase();
  if (v === "processed" || v === "completed") return "processed";
  if (v === "pending" || v === "processing") return "pending";
  return "error";
};

export default function DataPackages() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ total: 0, processed: 0, pending: 0, error: 0 });
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [statusValue, setStatusValue] = useState("processed");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [listRes, summaryRes] = await Promise.all([
        getDataPackages(),
        getDataPackagesSummary().catch(() => ({})),
      ]);
      const list = Array.isArray(listRes?.data) ? listRes.data : Array.isArray(listRes) ? listRes : [];
      setData(
        list.map((p) => ({
          key: p.id ?? p.dataPackageId ?? p.key,
          id: p.id ?? p.dataPackageId,
          station: p.stationName ?? p.station ?? p.stationId ?? "-",
          packageCount: p.observationCount ?? p.packageCount ?? p.count ?? 0,
          lastUpdate: p.lastUpdate ?? p.updatedAt ?? p.createdAt ?? "-",
          status: normalizeStatus(p.status),
        }))
      );
      const statuses = list.map((p) => normalizeStatus(p.status));
      if (summaryRes && typeof summaryRes === "object" && (summaryRes.total != null || summaryRes.processed != null)) {
        setSummary({
          total: summaryRes.total ?? list.length,
          processed: summaryRes.processed ?? summaryRes.processedCount ?? statuses.filter((s) => s === "processed").length,
          pending: summaryRes.pending ?? summaryRes.pendingCount ?? statuses.filter((s) => s === "pending").length,
          error: summaryRes.error ?? summaryRes.errorCount ?? statuses.filter((s) => s === "error").length,
        });
      } else {
        setSummary({
          total: list.length,
          processed: statuses.filter((s) => s === "processed").length,
          pending: statuses.filter((s) => s === "pending").length,
          error: statuses.filter((s) => s === "error").length,
        });
      }
    } catch (err) {
      console.error("LOAD DATA PACKAGES ERROR:", err);
      message.error("Failed to load data packages");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openStatusModal = (record) => {
    setEditingRecord(record);
    setStatusValue(record.status);
    setStatusModalOpen(true);
  };

  const handleStatusOk = async () => {
    if (!editingRecord?.id) return;
    try {
      await updateDataPackageStatus(editingRecord.id, { status: statusValue });
      message.success("Status updated");
      setStatusModalOpen(false);
      fetchData();
    } catch (err) {
      message.error(err.response?.data?.message || "Update failed");
    }
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete data package?",
      content: "This action cannot be undone.",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteDataPackage(record.id);
          message.success("Data package deleted");
          fetchData();
        } catch (err) {
          message.error(err.response?.data?.message || "Delete failed");
        }
      },
    });
  };

  const columns = [
    {
      title: "Package ID",
      dataIndex: "id",
      key: "id",
      render: (text) => (
        <Space>
          <InboxOutlined style={{ color: "#1890ff" }} />
          <span className="fw-600">{text}</span>
        </Space>
      ),
    },
    {
      title: "Station",
      dataIndex: "station",
      key: "station",
    },
    {
      title: "Observations",
      dataIndex: "packageCount",
      key: "packageCount",
      render: (count) => (
        <span className="fw-600" style={{ color: "#722ed1" }}>
          {count} records
        </span>
      ),
    },
    {
      title: "Last Update",
      dataIndex: "lastUpdate",
      key: "lastUpdate",
      render: (text) => <span style={{ fontSize: "12px", color: "#999" }}>{text}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        if (status === "processed") {
          return (
            <Tag icon={<CheckCircleOutlined />} color="green">
              PROCESSED
            </Tag>
          );
        } else if (status === "pending") {
          return (
            <Tag icon={<ClockCircleOutlined />} color="orange">
              PENDING
            </Tag>
          );
        }
        return (
          <Tag icon={<CloseCircleOutlined />} color="red">
            ERROR
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openStatusModal(record)}
          >
            Status
          </Button>
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

  const { total, processed: processedCount, pending: pendingCount, error: errorCount } = summary;
  const totalNum = total || data.length;

  return (
    <div className="data-packages-page">
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Packages"
              value={totalNum}
              prefix={<InboxOutlined />}
              valueStyle={{ color: "#1890ff", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Processed"
              value={processedCount}
              suffix={totalNum ? <span style={{ fontSize: "12px", color: "#999" }}>({Math.round((processedCount / totalNum) * 100)}%)</span> : null}
              valueStyle={{ color: "#52c41a", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic title="Pending" value={pendingCount} valueStyle={{ color: "#faad14", fontSize: "28px" }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic title="Errors" value={errorCount} valueStyle={{ color: "#f5222d", fontSize: "28px" }} />
          </Card>
        </Col>
      </Row>

      <Card
        className="data-packages-table-card"
        title={
          <span>
            <InboxOutlined style={{ marginRight: 8, color: "#1890ff" }} />
            All Data Packages
          </span>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowKey="key"
          size="large"
          bordered={false}
          className="admin-table"
        />
      </Card>

      <Modal
        open={statusModalOpen}
        title="Update status"
        onOk={handleStatusOk}
        onCancel={() => setStatusModalOpen(false)}
        okText="Update"
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <span>Package: {editingRecord?.id}</span>
          <Select
            style={{ width: "100%" }}
            value={statusValue}
            onChange={setStatusValue}
            options={[
              { label: "Processed", value: "processed" },
              { label: "Pending", value: "pending" },
              { label: "Error", value: "error" },
            ]}
          />
        </Space>
      </Modal>
    </div>
  );
}
