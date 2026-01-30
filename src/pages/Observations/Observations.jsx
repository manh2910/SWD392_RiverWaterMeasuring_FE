import { useState } from "react";
import {
  Table,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
} from "antd";
import {
  LineChartOutlined,
  RiseOutlined,
  WarningOutlined,
  FallOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import "./Observations.css";

const ParamWaveIcon = () => (
  <svg
    className="obs-param-icon"
    viewBox="0 0 24 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
  >
    <path d="M0 6 Q6 0 12 6 T24 6" />
  </svg>
);

const initialObservations = [
  {
    key: 1,
    observedAt: "2025-01-22 10:30:00",
    station: "Can Tho Station",
    parameter: "Water Level",
    value: "2.45 m",
    quality: "good",
    sensor: "WL-MK001-A1",
  },
  {
    key: 2,
    observedAt: "2025-01-22 10:30:00",
    station: "Can Tho Station",
    parameter: "Salinity",
    value: "0.85 ppt",
    quality: "good",
    sensor: "SAL-MK001-A1",
  },
  {
    key: 3,
    observedAt: "2025-01-22 10:30:00",
    station: "Can Tho Station",
    parameter: "pH",
    value: "7.2 pH",
    quality: "good",
    sensor: "PH-MK001-A1",
  },
  {
    key: 4,
    observedAt: "2025-01-22 10:25:00",
    station: "Can Tho Station",
    parameter: "Temperature",
    value: "28.5 °C",
    quality: "good",
    sensor: "TEMP-MK001-A1",
  },
  {
    key: 5,
    observedAt: "2025-01-22 10:20:00",
    station: "My Tho Station",
    parameter: "Water Level",
    value: "1.92 m",
    quality: "suspect",
    sensor: "WL-MK002-A1",
  },
  {
    key: 6,
    observedAt: "2025-01-22 10:15:00",
    station: "My Tho Station",
    parameter: "Turbidity",
    value: "52.1 NTU",
    quality: "bad",
    sensor: "TURB-MK002-A1",
  },
];

export default function Observations() {
  const [data] = useState(initialObservations);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [stationFilter, setStationFilter] = useState("all");
  const [parameterFilter, setParameterFilter] = useState("all");
  const [qualityFilter, setQualityFilter] = useState("all");

  const filteredData = data.filter((row) => {
    const matchSearch =
      !search ||
      row.station.toLowerCase().includes(search.toLowerCase()) ||
      row.parameter.toLowerCase().includes(search.toLowerCase()) ||
      row.sensor.toLowerCase().includes(search.toLowerCase());
    const matchStation =
      stationFilter === "all" || row.station.includes(stationFilter);
    const matchParameter =
      parameterFilter === "all" || row.parameter === parameterFilter;
    const matchQuality =
      qualityFilter === "all" || row.quality === qualityFilter;
    return matchSearch && matchStation && matchParameter && matchQuality;
  });

  const resetFilters = () => {
    setStationFilter("all");
    setParameterFilter("all");
    setQualityFilter("all");
    setSearch("");
  };

  const columns = [
    {
      title: "Observed At",
      dataIndex: "observedAt",
      key: "observedAt",
    },
    { title: "Station", dataIndex: "station", key: "station" },
    {
      title: "Parameter",
      dataIndex: "parameter",
      key: "parameter",
      render: (param) => (
        <span className="obs-param-cell">
          <ParamWaveIcon />
          <span>{param}</span>
        </span>
      ),
    },
    { title: "Value", dataIndex: "value", key: "value" },
    {
      title: "Quality",
      dataIndex: "quality",
      key: "quality",
      render: (quality) => {
        if (quality === "good") {
          return (
            <Tag className="obs-quality-good" icon={<CheckCircleOutlined />}>
              good
            </Tag>
          );
        }
        if (quality === "suspect") {
          return (
            <Tag className="obs-quality-suspect" icon={<WarningOutlined />}>
              suspect
            </Tag>
          );
        }
        return (
          <Tag className="obs-quality-bad" icon={<FallOutlined />}>
            bad
          </Tag>
        );
      },
    },
    { title: "Sensor", dataIndex: "sensor", key: "sensor" },
  ];

  return (
    <div className="observations-page">
      <h1>Observations</h1>
      <p className="page-desc">
        View and analyze sensor observation data from measurement stations.
      </p>

      {/* Summary cards */}
      <Row gutter={16} className="obs-cards-row">
        <Col xs={24} sm={12} lg={6}>
          <Card className="obs-stat-card">
            <Statistic
              title="Total Observations"
              value={10}
              suffix={<span className="obs-stat-suffix">Last 24 hours</span>}
              prefix={<LineChartOutlined className="obs-stat-icon" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="obs-stat-card obs-stat-good">
            <Statistic
              title="Good Quality"
              value={8}
              suffix={<span className="obs-stat-suffix">80% of total</span>}
              prefix={<RiseOutlined className="obs-stat-icon" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="obs-stat-card obs-stat-suspect">
            <Statistic
              title="Suspect"
              value={1}
              suffix={<span className="obs-stat-suffix">Needs review</span>}
              prefix={<WarningOutlined className="obs-stat-icon" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="obs-stat-card obs-stat-bad">
            <Statistic
              title="Bad Quality"
              value={1}
              suffix={<span className="obs-stat-suffix">Flagged readings</span>}
              prefix={<FallOutlined className="obs-stat-icon" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <div className="obs-filters">
        <Select
          value={stationFilter}
          onChange={setStationFilter}
          options={[
            { value: "all", label: "All Stations" },
            { value: "Can Tho", label: "Can Tho Station" },
            { value: "My Tho", label: "My Tho Station" },
          ]}
          className="obs-filter-select"
        />
        <Select
          value={parameterFilter}
          onChange={setParameterFilter}
          options={[
            { value: "all", label: "All Parameters" },
            { value: "Water Level", label: "Water Level" },
            { value: "Salinity", label: "Salinity" },
            { value: "pH", label: "pH" },
            { value: "Temperature", label: "Temperature" },
            { value: "Turbidity", label: "Turbidity" },
          ]}
          className="obs-filter-select"
        />
        <Select
          value={qualityFilter}
          onChange={setQualityFilter}
          options={[
            { value: "all", label: "All Quality" },
            { value: "good", label: "Good" },
            { value: "suspect", label: "Suspect" },
            { value: "bad", label: "Bad" },
          ]}
          className="obs-filter-select"
        />
        <Button onClick={resetFilters}>Reset Filters</Button>
      </div>

      {/* Search & table */}
      <div className="obs-toolbar">
        <Input.Search
          placeholder="Search observations..."
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="obs-search"
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
          className="obs-page-size"
        />
      </div>

      <Table
        dataSource={filteredData}
        columns={columns}
        pagination={{
          pageSize,
          showSizeChanger: false,
          showTotal: (total) => `Total ${total} observations`,
        }}
        className="obs-table"
      />
    </div>
  );
}
