import { useState } from "react";
import { Table, Input, Select, Tag } from "antd";
import "./Parameters.css";

const ParamIcon = () => (
  <svg
    className="param-icon"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <rect x="2" y="2" width="16" height="16" rx="2" />
    <rect x="5" y="5" width="10" height="10" rx="1" />
  </svg>
);

const initialParameters = [
  {
    key: 1,
    code: "WATER_LEVEL",
    name: "Water Level",
    unit: "m",
    description: "Measures the water surface elevation relative to a reference",
    activeSensors: 24,
  },
  {
    key: 2,
    code: "SALINITY",
    name: "Salinity",
    unit: "ppt",
    description: "Measures the salt concentration in water",
    activeSensors: 18,
  },
  {
    key: 3,
    code: "PH",
    name: "pH",
    unit: "pH",
    description: "Measures the acidity or alkalinity of water on a scale",
    activeSensors: 22,
  },
  {
    key: 4,
    code: "TEMPERATURE",
    name: "Temperature",
    unit: "°C",
    description: "Measures the water temperature",
    activeSensors: 28,
  },
  {
    key: 5,
    code: "DO",
    name: "Dissolved Oxygen",
    unit: "mg/L",
    description: "Measures the amount of oxygen dissolved in water",
    activeSensors: 16,
  },
  {
    key: 6,
    code: "TURBIDITY",
    name: "Turbidity",
    unit: "NTU",
    description: "Measures the cloudiness or haziness of water",
    activeSensors: 14,
  },
  {
    key: 7,
    code: "CONDUCTIVITY",
    name: "Conductivity",
    unit: "µS/cm",
    description: "Measures the ability of water to conduct electricity",
    activeSensors: 12,
  },
  {
    key: 8,
    code: "AMMONIA",
    name: "Ammonia",
    unit: "mg/L",
    description: "Measures ammonia nitrogen concentration in water",
    activeSensors: 8,
  },
  {
    key: 9,
    code: "NITRATE",
    name: "Nitrate",
    unit: "mg/L",
    description: "Measures nitrate concentration in water",
    activeSensors: 10,
  },
];

export default function Parameters() {
  const [data] = useState(initialParameters);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);

  const filteredData = data.filter(
    (row) =>
      row.code.toLowerCase().includes(search.toLowerCase()) ||
      row.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (code) => (
        <span className="param-cell">
          <ParamIcon />
          <span>{code}</span>
        </span>
      ),
    },
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
      render: (unit) => <Tag className="param-unit-badge">{unit}</Tag>,
    },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Active Sensors",
      dataIndex: "activeSensors",
      key: "activeSensors",
    },
  ];

  return (
    <div className="parameters-page">
      <h1>Measurement Parameters</h1>
      <p className="page-desc">
        View measurement parameters for water quality monitoring.
      </p>

      <div className="parameters-toolbar">
        <Input.Search
          placeholder="Search parameters..."
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="parameters-search"
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
          className="parameters-page-size"
        />
      </div>

      <Table
        dataSource={filteredData}
        columns={columns}
        pagination={{
          pageSize,
          showSizeChanger: false,
          showTotal: (total) => `Total ${total} parameters`,
        }}
        className="parameters-table"
      />
    </div>
  );
}
