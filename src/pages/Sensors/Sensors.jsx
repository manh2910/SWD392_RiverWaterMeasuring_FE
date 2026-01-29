import { useState } from "react";
import { Table, Input, Select, Tag } from "antd";
import "./Sensors.css";

const WaveIcon = () => (
  <svg
    className="sensor-wave-icon"
    viewBox="0 0 24 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
  >
    <path d="M0 6 Q6 0 12 6 T24 6" />
    <path d="M0 8 Q6 2 12 8 T24 8" />
  </svg>
);

const initialSensors = [
  {
    key: 1,
    name: "Water Level",
    hubId: "HUB-MK001-A",
    unit: "m",
    interval: "300s",
    lastValue: "2.45 m",
    lastReading: "2 min ago",
    status: "active",
  },
  {
    key: 2,
    name: "Salinity",
    hubId: "HUB-MK001-A",
    unit: "ppt",
    interval: "600s",
    lastValue: "0.8 ppt",
    lastReading: "5 min ago",
    status: "active",
  },
  {
    key: 3,
    name: "pH",
    hubId: "HUB-MK001-A",
    unit: "pH",
    interval: "300s",
    lastValue: "7.2 pH",
    lastReading: "2 min ago",
    status: "active",
  },
  {
    key: 4,
    name: "Temperature",
    hubId: "HUB-MK001-B",
    unit: "°C",
    interval: "300s",
    lastValue: "28.5 °C",
    lastReading: "3 min ago",
    status: "active",
  },
  {
    key: 5,
    name: "Dissolved Oxygen",
    hubId: "HUB-MK001-B",
    unit: "mg/L",
    interval: "600s",
    lastValue: "6.8 mg/L",
    lastReading: "1 hour ago",
    status: "calibrating",
  },
  {
    key: 6,
    name: "Water Level",
    hubId: "HUB-MK002-A",
    unit: "m",
    interval: "300s",
    lastValue: "1.85 m",
    lastReading: "1 min ago",
    status: "active",
  },
  {
    key: 7,
    name: "Turbidity",
    hubId: "HUB-MK002-A",
    unit: "NTU",
    interval: "600s",
    lastValue: "45.2 NTU",
    lastReading: "2 hours ago",
    status: "inactive",
  },
];

export default function Sensors() {
  const [data] = useState(initialSensors);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);

  const filteredData = data.filter(
    (row) =>
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      row.hubId.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      title: "Sensor",
      dataIndex: "name",
      key: "sensor",
      render: (name, record) => (
        <span className="sensor-cell">
          <WaveIcon />
          <span>
            <strong>{name}</strong> ({record.hubId})
          </span>
        </span>
      ),
    },
    { title: "Unit", dataIndex: "unit", key: "unit" },
    { title: "Interval", dataIndex: "interval", key: "interval" },
    { title: "Last Value", dataIndex: "lastValue", key: "lastValue" },
    { title: "Last Reading", dataIndex: "lastReading", key: "lastReading" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        if (status === "active") {
          return <Tag className="status-active">active</Tag>;
        }
        if (status === "calibrating") {
          return <Tag className="status-calibrating">calibrating</Tag>;
        }
        return <Tag className="status-inactive">inactive</Tag>;
      },
    },
  ];

  return (
    <div className="sensors-page">
      <h1>Sensors</h1>
      <p className="page-desc">View sensors connected to measurement hubs.</p>

      <div className="sensors-toolbar">
        <Input.Search
          placeholder="Search sensors..."
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sensors-search"
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
          className="sensors-page-size"
        />
      </div>

      <Table
        dataSource={filteredData}
        columns={columns}
        pagination={{
          pageSize,
          showSizeChanger: false,
          showTotal: (total) => `Total ${total} sensors`,
        }}
        className="sensors-table"
      />
    </div>
  );
}
