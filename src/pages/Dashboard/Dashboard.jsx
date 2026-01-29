import { Card, Row, Col, Table, Tag, Statistic } from "antd";
import {
  DatabaseOutlined,
  RadarChartOutlined,
  AlertOutlined,
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
    },
    {
      key: 2,
      station: "Can Tho Hub A",
      parameter: "Salinity",
      value: "4.2 PSU",
      threshold: "> 4.0 PSU",
      status: "triggered",
      time: "12 minutes ago",
    },
    {
      key: 3,
      station: "My Tho Station",
      parameter: "pH Level",
      value: "6.2",
      threshold: "< 6.5",
      status: "resolved",
      time: "45 minutes ago",
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
    },
    {
      key: 2,
      station: "Vung Tau Coastal",
      hub: "HUB-VT-01",
      packages: 0,
      last: "2 hours ago",
      status: "offline",
    },
  ];

  /* ====== COLUMNS ====== */
  const alertColumns = [
    { title: "Station", dataIndex: "station" },
    { title: "Parameter", dataIndex: "parameter" },
    { title: "Value", dataIndex: "value" },
    { title: "Threshold", dataIndex: "threshold" },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) =>
        status === "triggered" ? (
          <Tag color="red">triggered</Tag>
        ) : (
          <Tag color="green">resolved</Tag>
        ),
    },
    { title: "Time", dataIndex: "time" },
  ];

  const stationColumns = [
    { title: "Station", dataIndex: "station" },
    { title: "Hub Code", dataIndex: "hub" },
    { title: "Packages Received", dataIndex: "packages" },
    { title: "Last Reading", dataIndex: "last" },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) =>
        status === "active" ? (
          <Tag color="green">active</Tag>
        ) : (
          <Tag color="default">offline</Tag>
        ),
    },
  ];

  /* ====== UI ====== */
 return (
    <div className="dashboard">
      <h1 className="title">Water Monitoring Dashboard</h1>
      <p className="subtitle">
        Real-time overview of measurement stations, sensors, and alerts across
        the river network.
      </p>

      {/* ===== STATS ===== */}
      <Row gutter={16} className="stats-row">
        <Col span={6}>
          <Card className="stat-card">
            <Statistic
              title="Active Stations"
              value={24}
              prefix={<DatabaseOutlined />}
              suffix={<span className="warn">3 offline</span>}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card className="stat-card">
            <Statistic
              title="Active Sensors"
              value={156}
              prefix={<RadarChartOutlined />}
              suffix="12 maintenance"
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card className="stat-card">
            <Statistic
              title="Active Alerts"
              value={8}
              prefix={<AlertOutlined />}
              valueStyle={{ color: "var(--danger)" }}
              suffix="2 critical"
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card className="stat-card">
            <Statistic
              title="Data Packages Today"
              value={12458}
              valueStyle={{ color: "var(--accent)" }}
              suffix="+18%"
            />
          </Card>
        </Col>
      </Row>

      {/* ===== TABLES ===== */}
      <Card title="Recent Alerts" className="table-card">
        <Table
          className="data-table"
          columns={alertColumns}
          dataSource={alertData}
          pagination={false}
        />
      </Card>

      <Card title="Station Activity (Last 24h)" className="table-card">
        <Table
          className="data-table"
          columns={stationColumns}
          dataSource={stationData}
          pagination={false}
        />
      </Card>
    </div>
  );
}