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
import { getStations } from "../../../api/stationApi";

import "./DataPackages.css";

/* ================= STATUS NORMALIZE ================= */

const normalizeStatus = (s) => {
  const v = (s || "").toLowerCase();
  if (v === "processed" || v === "completed") return "processed";
  if (v === "pending" || v === "processing") return "pending";
  return "error";
};

const MAX_PAGES = 15;

export default function DataPackages() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stationOptions, setStationOptions] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [summary, setSummary] = useState({
    total: 0,
    processed: 0,
    pending: 0,
    error: 0,
  });

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [statusValue, setStatusValue] = useState("processed");

  /* ================= FETCH DATA ================= */

  const fetchData = async ({ stationId, page = 1, size = 10 } = {}) => {
    setLoading(true);

    try {
      const params = {};
      if (stationId != null) {
        params.stationId = Number(stationId);
      }
      params.page = Math.max(Number(page) - 1, 0);
      params.size = Number(size) || 10;

      const [listRes, summaryRes] = await Promise.all([
        getDataPackages(params),
        getDataPackagesSummary().catch(() => ({})),
      ]);

      const payload = listRes?.data ?? listRes;
      const list = Array.isArray(payload?.content)
        ? payload.content
        : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
        ? payload
        : [];

      const mapped = list.map((p, idx) => {
        const packageId = p.packageId ?? p.id ?? p.dataPackageId ?? null;
        return {
          key:
            packageId ??
            `${p.stationId ?? "station"}-${p.receivedAt ?? p.updatedAt ?? idx}`,
          id: packageId,
        station: p.stationName ?? p.station ?? p.stationId ?? "-",
          packageCount: p.observationCount ?? p.packageCount ?? p.count ?? 0,
          lastUpdate:
            p.receivedAt ?? p.lastUpdate ?? p.updatedAt ?? p.createdAt ?? "-",
        status: normalizeStatus(p.status),
        };
      });

      setData(mapped);
      const backendTotal = Number(payload?.totalElements ?? mapped.length);
      const cappedTotal = Math.min(backendTotal, size * MAX_PAGES);
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize: size,
        total: cappedTotal,
      }));

      const statuses = mapped.map((p) => p.status);

      if (summaryRes && typeof summaryRes === "object") {
        setSummary({
          total: summaryRes.total ?? payload?.totalElements ?? mapped.length,
          processed:
            summaryRes.processed ??
            statuses.filter((s) => s === "processed").length,
          pending:
            summaryRes.pending ??
            statuses.filter((s) => s === "pending").length,
          error:
            summaryRes.error ?? statuses.filter((s) => s === "error").length,
        });
      } else {
        setSummary({
          total: mapped.length,
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
    fetchData({
      stationId: selectedStationId,
      page: pagination.current,
      size: pagination.pageSize,
    });
  }, [selectedStationId, pagination.current, pagination.pageSize]);

  useEffect(() => {
    const loadStations = async () => {
      try {
        const stationRes = await getStations();
        const list = Array.isArray(stationRes?.data)
          ? stationRes.data
          : Array.isArray(stationRes)
          ? stationRes
          : [];

        setStationOptions(
          list.map((s) => ({
            value: Number(s.stationId),
            label: s.stationName || `Station ${s.stationId}`,
          }))
        );
      } catch (err) {
        message.error("Failed to load stations");
      }
    };

    loadStations();
  }, []);

  /* ================= UPDATE STATUS ================= */

  const openStatusModal = (record) => {
    setEditingRecord(record);
    setStatusValue(record.status);
    setStatusModalOpen(true);
  };

  const handleStatusOk = async () => {
    if (!editingRecord?.id) return;

    try {
      await updateDataPackageStatus(editingRecord.id, {
        status: statusValue,
      });

      message.success("Status updated");

      setStatusModalOpen(false);
      fetchData({
        stationId: selectedStationId,
        page: pagination.current,
        size: pagination.pageSize,
      });
    } catch (err) {
      message.error(err.response?.data?.message || "Update failed");
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete data package?",
      content: "This action cannot be undone.",
      okType: "danger",

      onOk: async () => {
        try {
          await deleteDataPackage(record.id);

          message.success("Data package deleted");

          fetchData({
            stationId: selectedStationId,
            page: pagination.current,
            size: pagination.pageSize,
          });
        } catch (err) {
          message.error(err.response?.data?.message || "Delete failed");
        }
      },
    });
  };

  /* ================= TABLE ================= */

  const columns = [
    {
      title: "Package ID",
      dataIndex: "id",
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
    },
    {
      title: "Observations",
      dataIndex: "packageCount",
      render: (count) => (
        <span style={{ color: "#722ed1", fontWeight: 600 }}>
          {count} records
        </span>
      ),
    },
    {
      title: "Last Update",
      dataIndex: "lastUpdate",
      render: (text) => (
        <span style={{ fontSize: 12, color: "#999" }}>{text}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",

      render: (status) => {
        if (status === "processed") {
          return (
            <Tag icon={<CheckCircleOutlined />} color="green">
              PROCESSED
            </Tag>
          );
        }

        if (status === "pending") {
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
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openStatusModal(record)}
          >
            Status
          </Button>

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

  const { total, processed, pending, error } = summary;
  const totalNum = total || data.length;

  /* ================= UI ================= */

  return (
    <div className="data-packages-page">
      {/* STATS */}

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Packages"
              value={totalNum}
              prefix={<InboxOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Processed"
              value={processed}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending"
              value={pending}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Errors"
              value={error}
              valueStyle={{ color: "#f5222d" }}
            />
          </Card>
        </Col>
      </Row>

      {/* TABLE */}

      <Card
        title={
          <Space wrap>
            <span>
              <InboxOutlined style={{ marginRight: 8 }} />
              All Data Packages
            </span>
            <Select
              allowClear
              style={{ minWidth: 220 }}
              placeholder="Filter by station"
              value={selectedStationId}
              onChange={(value) => {
                setSelectedStationId(value);
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
              options={stationOptions}
            />
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: 10,
            total: pagination.total,
            showSizeChanger: false,
          }}
          onChange={(pager) => {
            setPagination((prev) => ({
              ...prev,
              current: pager.current || 1,
            }));
          }}
          rowKey="key"
          size="large"
        />
      </Card>

      {/* STATUS MODAL */}

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