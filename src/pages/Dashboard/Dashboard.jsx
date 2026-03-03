import { Card, Row, Col, Table, Tag, Statistic, Progress, Button, Space, Select, DatePicker } from "antd";
import {
  DatabaseOutlined,
  RadarChartOutlined,
  AlertOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import "./Dashboard.css";

export default function Dashboard() {
  /* ====== DATA ====== */
  const alertData = [
    {
      key: 1,
      station: "Bien Hoa Station",
      parameter: "Water Level",
      value: "2.85m",
      threshold: "> 2.5m",
      status: "triggered",
      time: "5 minutes ago",
      severity: "critical",
    },
    {
      key: 2,
      station: "Can Tho Hub A",
      parameter: "Salinity",
      value: "4.2 PSU",
      threshold: "> 4.0 PSU",
      status: "triggered",
      time: "12 minutes ago",
      severity: "high",
    },
    {
      key: 3,
      station: "My Tho Station",
      parameter: "pH Level",
      value: "6.2",
      threshold: "< 6.5",
      status: "resolved",
      time: "45 minutes ago",
      severity: "low",
    },
    {
      key: 4,
      station: "Tien Giang Station",
      parameter: "Temperature",
      value: "32.1°C",
      threshold: "> 31°C",
      status: "triggered",
      time: "1 hour ago",
      severity: "medium",
    },
  ];

  const stationData = [
    {
      key: 1,
      station: "Bien Hoa Station",
      hub: "HUB-BH-01",
      packages: 48,
      last: "2 min ago",
      status: "active",
      uptime: 99.8,
      sensors: 8,
    },
    {
      key: 2,
      station: "Can Tho Hub A",
      hub: "HUB-CT-01",
      packages: 45,
      last: "3 min ago",
      status: "active",
      uptime: 99.5,
      sensors: 12,
    },
    {
      key: 3,
      station: "My Tho Station",
      hub: "HUB-MT-01",
      packages: 42,
      last: "5 min ago",
      status: "active",
      uptime: 98.9,
      sensors: 6,
    },
    {
      key: 4,
      station: "Vung Tau Coastal",
      hub: "HUB-VT-01",
      packages: 0,
      last: "2 hours ago",
      status: "offline",
      uptime: 0,
      sensors: 4,
    },
    {
      key: 5,
      station: "Tien Giang Station",
      hub: "HUB-TG-01",
      packages: 40,
      last: "1 min ago",
      status: "active",
      uptime: 99.2,
      sensors: 7,
    },
  ];

  /* ====== COLUMNS ====== */
  const alertColumns = [
    { 
      title: "Station", 
      dataIndex: "station",
      key: "station",
      render: (text) => <span className="fw-600">{text}</span>
    },
    { 
      title: "Parameter", 
      dataIndex: "parameter",
      key: "parameter",
    },
    { 
      title: "Value", 
      dataIndex: "value",
      key: "value",
      render: (text) => <span className="fw-600">{text}</span>
    },
    { 
      title: "Threshold", 
      dataIndex: "threshold",
      key: "threshold",
    },
    {
      title: "Severity",
      dataIndex: "severity",
      key: "severity",
      render: (severity) => {
        const colors = {
          critical: "red",
          high: "orange",
          medium: "gold",
          low: "blue",
        };
        return <Tag color={colors[severity]}>{severity.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        status === "triggered" ? (
          <Tag color="red"><ExclamationCircleOutlined /> Triggered</Tag>
        ) : (
          <Tag color="green"><CheckCircleOutlined /> Resolved</Tag>
        ),
    },
    { 
      title: "Time", 
      dataIndex: "time",
      key: "time",
    },
  ];

  const stationColumns = [
    { 
      title: "Station", 
      dataIndex: "station",
      key: "station",
      render: (text) => <span className="fw-600">{text}</span>
    },
    { 
      title: "Hub Code", 
      dataIndex: "hub",
      key: "hub",
    },
    { 
      title: "Sensors", 
      dataIndex: "sensors",
      key: "sensors",
      render: (count) => <span>{count} active</span>
    },
    { 
      title: "Packages", 
      dataIndex: "packages",
      key: "packages",
    },
    { 
      title: "Last Reading", 
      dataIndex: "last",
      key: "last",
    },
    { 
      title: "Uptime", 
      dataIndex: "uptime",
      key: "uptime",
      render: (uptime) => <Progress type="circle" percent={uptime} width={40} />
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        status === "active" ? (
          <Tag color="green"><CheckCircleOutlined /> Active</Tag>
        ) : (
          <Tag color="default"><ClockCircleOutlined /> Offline</Tag>
        ),
    },
  ];

  /* ====== UI ====== */
  /* ====== UI ====== */
  return (
    <div className="dashboard">
      {/* ===== HEADER ===== */}
      <div className="dashboard-header">
        <div>
          <h1 className="title">💧 Water Monitoring Dashboard</h1>
          <p className="subtitle">
            Real-time overview of measurement stations, sensors, and alerts across the river network
          </p>
        </div>
        <Space>
          <Select
            style={{ width: 150 }}
            placeholder="Filter by region"
            options={[
              { label: "All Regions", value: "all" },
              { label: "Mekong Delta", value: "mekong" },
              { label: "Red River", value: "red" },
            ]}
          />
          <DatePicker placeholder="Select date" />
          <Button type="primary">Export Report</Button>
        </Space>
      </div>

      {/* ===== STATS ===== */}
      <Row gutter={16} className="stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Active Stations"
              value={24}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: "#1890ff", fontSize: "28px" }}
            />
            <p className="stat-info"><ArrowUpOutlined style={{ color: "green" }} /> +2 this week</p>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Active Sensors"
              value={156}
              prefix={<RadarChartOutlined />}
              valueStyle={{ color: "#52c41a", fontSize: "28px" }}
            />
            <p className="stat-info">12 in maintenance</p>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Active Alerts"
              value={8}
              prefix={<AlertOutlined />}
              valueStyle={{ color: "#f5222d", fontSize: "28px" }}
            />
            <p className="stat-info"><ArrowUpOutlined style={{ color: "red" }} /> 2 critical</p>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Data Packages Today"
              value={12458}
              valueStyle={{ color: "#722ed1", fontSize: "28px" }}
            />
            <p className="stat-info"><ArrowUpOutlined style={{ color: "green" }} /> +18% from yesterday</p>
          </Card>
        </Col>
      </Row>

      {/* ===== ALERTS TABLE ===== */}
      <Card 
        title={
          <span>
            <AlertOutlined style={{ marginRight: 8, color: "#f5222d" }} />
            Recent Alerts & Notifications
          </span>
        } 
        className="table-card"
        extra={
          <Button type="link" danger>
            View All Alerts →
          </Button>
        }
      >
        <Table
          className="data-table"
          columns={alertColumns}
          dataSource={alertData}
          pagination={false}
          rowKey="key"
          size="large"
        />
      </Card>

      {/* ===== STATIONS TABLE ===== */}
      <Card 
        title={
          <span>
            <DatabaseOutlined style={{ marginRight: 8, color: "#1890ff" }} />
            Station Activity (Last 24h)
          </span>
        } 
        className="table-card"
        extra={
          <Button type="link">
            View All Stations →
          </Button>
        }
      >
        <Table
          className="data-table"
          columns={stationColumns}
          dataSource={stationData}
          pagination={{ pageSize: 5 }}
          rowKey="key"
          size="large"
        />
      </Card>
    </div>
  );
}