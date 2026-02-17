import { useState } from "react";
import {
  Table,
  Input,
  Select,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Dropdown,
  Button,
} from "antd";
import {
  InboxOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import "./DataPackages.css";

const initialPackages = [
  {
    key: 1,
    packageId: "pkg-001",
    hub: "HUB-MK001-A",
    station: "Can Tho Station",
    receivedAt: "2025-01-22 10:30:00",
    observations: 3,
    status: "processed",
  },
  {
    key: 2,
    packageId: "pkg-002",
    hub: "HUB-MK001-B",
    station: "Can Tho Station",
    receivedAt: "2025-01-22 10:25:00",
    observations: 2,
    status: "processed",
  },
  {
    key: 3,
    packageId: "pkg-003",
    hub: "HUB-MK002-A",
    station: "My Tho Station",
    receivedAt: "2025-01-22 10:20:00",
    observations: 4,
    status: "pending",
  },
  {
    key: 4,
    packageId: "pkg-004",
    hub: "HUB-MK001-A",
    station: "Can Tho Station",
    receivedAt: "2025-01-22 10:15:00",
    observations: 0,
    status: "error",
  },
  {
    key: 5,
    packageId: "pkg-005",
    hub: "HUB-MK002-A",
    station: "My Tho Station",
    receivedAt: "2025-01-22 10:10:00",
    observations: 3,
    status: "processed",
  },
];

export default function DataPackages() {
  const [data] = useState(initialPackages);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredData = data.filter((row) => {
    const matchSearch =
      !search ||
      row.packageId.toLowerCase().includes(search.toLowerCase()) ||
      row.hub.toLowerCase().includes(search.toLowerCase()) ||
      row.station.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" || row.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    { title: "Package ID", dataIndex: "packageId", key: "packageId" },
    { title: "Hub", dataIndex: "hub", key: "hub" },
    { title: "Station", dataIndex: "station", key: "station" },
    { title: "Received At", dataIndex: "receivedAt", key: "receivedAt" },
    { title: "Observations", dataIndex: "observations", key: "observations" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        if (status === "processed") {
          return (
            <Tag className="pkg-status-processed" icon={<CheckCircleOutlined />}>
              processed
            </Tag>
          );
        }
        if (status === "pending") {
          return (
            <Tag className="pkg-status-pending" icon={<ClockCircleOutlined />}>
              pending
            </Tag>
          );
        }
        return (
          <Tag className="pkg-status-error" icon={<CloseCircleOutlined />}>
            error
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: () => (
        <Dropdown
          menu={{
            items: [
              { key: "view", label: "View details" },
              { key: "reprocess", label: "Reprocess" },
              { key: "download", label: "Download" },
            ],
          }}
          trigger={["click"]}
        >
          <Button type="text" icon={<MoreOutlined />} className="pkg-actions-btn" />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="data-packages-page">
      <h1>Data Packages</h1>
      <p className="page-desc">
        View raw data packages received from measurement hubs.
      </p>

      {/* Summary cards */}
      <Row gutter={16} className="pkg-cards-row">
        <Col xs={24} sm={12} lg={6}>
          <Card className="pkg-stat-card">
            <Statistic
              title="Total Packages"
              value={8}
              suffix={<span className="pkg-stat-suffix">Last 24 hours</span>}
              prefix={<InboxOutlined className="pkg-stat-icon" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="pkg-stat-card pkg-stat-processed">
            <Statistic
              title="Processed"
              value={5}
              suffix={<span className="pkg-stat-suffix">63% success rate</span>}
              prefix={<CheckCircleOutlined className="pkg-stat-icon" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="pkg-stat-card pkg-stat-pending">
            <Statistic
              title="Pending"
              value={1}
              suffix={<span className="pkg-stat-suffix">In queue</span>}
              prefix={<ClockCircleOutlined className="pkg-stat-icon" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="pkg-stat-card pkg-stat-error">
            <Statistic
              title="Errors"
              value={2}
              suffix={<span className="pkg-stat-suffix">Failed to process</span>}
              prefix={<CloseCircleOutlined className="pkg-stat-icon" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter, search, pagination */}
      <div className="pkg-toolbar">
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "All Packages" },
            { value: "processed", label: "Processed" },
            { value: "pending", label: "Pending" },
            { value: "error", label: "Errors" },
          ]}
          className="pkg-filter-select"
        />
        <Input.Search
          placeholder="Search packages..."
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pkg-search"
          style={{ maxWidth: 320 }}
        />
        <Select
          value={pageSize}
          onChange={setPageSize}
          options={[
            { value: 10, label: "10 per page" },
            { value: 20, label: "20 per page" },
            { value: 50, label: "50 per page" },
          ]}
          className="pkg-page-size"
        />
      </div>

      <Table
        dataSource={filteredData}
        columns={columns}
        pagination={{
          pageSize,
          showSizeChanger: false,
          showTotal: (total) => `Total ${total} packages`,
        }}
        className="pkg-table"
      />
    </div>
  );
}
