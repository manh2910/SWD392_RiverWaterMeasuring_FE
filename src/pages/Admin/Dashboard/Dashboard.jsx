import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Statistic,
  Button,
  Space,
  message,
} from "antd";

import {
  DatabaseOutlined,
  RadarChartOutlined,
  AlertOutlined,
  SendOutlined,
} from "@ant-design/icons";

import { Line } from "@ant-design/plots";

import { getRiverStatus } from "../../../api/observationApi";
import { sendAlert as sendAlertAPI } from "../../../api/alertApi";

import "./Dashboard.css";

/* ================= THRESHOLD ================= */

const THRESHOLDS = {
  PH: { min: 6.5, max: 8.5 },
  DO: { min: 5 },
  COND: { max: 1000 },
  WL: { max: 3 },
  FV: { max: 3.5 },
};

/* ================= SEVERITY ================= */

const getSeverity = (code, value) => {
  const t = THRESHOLDS[code];
  if (!t || value === undefined) return "low";

  if (t.min && value < t.min * 0.8) return "critical";
  if (t.min && value < t.min) return "high";

  if (t.max && value > t.max * 1.3) return "critical";
  if (t.max && value > t.max) return "high";

  return "low";
};

export default function Dashboard() {
  const [statusData, setStatusData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [overallSeverity, setOverallSeverity] = useState("low");

  useEffect(() => {
    fetchRiverStatus();
  }, []);

  /* ================= FETCH ================= */

  const fetchRiverStatus = async () => {
    try {
      const data = await getRiverStatus(1);

      if (!Array.isArray(data)) return;

      setStatusData(data);

      let highest = "low";
      const map = {};

      data.forEach((p) => {
        const value = Number(p.averageValue) || 0;

        const severity = getSeverity(p.parameterCode, value);

        if (severity === "critical") highest = "critical";
        else if (severity === "high" && highest !== "critical")
          highest = "high";

        map[p.parameterCode] = {
          value,
          unit: p.unit,
          severity,
        };
      });

      const row = {
        key: 1,
        cond: map.COND,
        oxy: map.DO,
        flow: map.FV,
        ph: map.PH,
        water: map.WL,
        severity: highest,
      };

      setTableData([row]);
      setOverallSeverity(highest);
    } catch (err) {
      console.log(err);
      message.error("Load river status failed");
    }
  };

  /* ================= VALUE RENDER ================= */

  const renderValue = (obj) => {
    if (!obj) return "-";

    const colors = {
      critical: "#ff4d4f",
      high: "#faad14",
      low: "#52c41a",
    };

    return (
      <span style={{ color: colors[obj.severity], fontWeight: 500 }}>
        {obj.value !== undefined ? Number(obj.value).toFixed(2) : "-"} {obj.unit}
      </span>
    );
  };

  /* ================= ALERT ================= */

  const sendAlert = async () => {
    try {
      const payload = {
        alertId: 0,
        message: `River monitoring alert: ${overallSeverity.toUpperCase()} severity detected`,
      };

      await sendAlertAPI(payload);

      message.success("Alert sent successfully");
    } catch (err) {
      console.log(err);
      message.error("Send alert failed");
    }
  };

  /* ================= TABLE ================= */

  const columns = [
    {
      title: "Conductivity",
      render: (_, r) => renderValue(r.cond),
    },
    {
      title: "Dissolved Oxygen",
      render: (_, r) => renderValue(r.oxy),
    },
    {
      title: "Flow Velocity",
      render: (_, r) => renderValue(r.flow),
    },
    {
      title: "pH",
      render: (_, r) => renderValue(r.ph),
    },
    {
      title: "Water Level",
      render: (_, r) => renderValue(r.water),
    },
    {
      title: "Severity",
      dataIndex: "severity",
      render: (s) => {
        const colors = {
          critical: "red",
          high: "orange",
          low: "green",
        };

        return <Tag color={colors[s]}>{s?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Action",
      render: (_, r) =>
        r.severity === "high" || r.severity === "critical" ? (
          <Button danger icon={<SendOutlined />} onClick={sendAlert}>
            Alert
          </Button>
        ) : null,
    },
  ];

  /* ================= CHART DATA ================= */

  const chartData = statusData
    .map((p) => ({
      parameter: p.parameterName || p.parameterCode,
      value: Number(p.averageValue) || 0,
    }))
    .filter((d) => d.parameter);

  /* ================= CHART CONFIG ================= */

  const chartConfig = {
    data: chartData,
    xField: "parameter",
    yField: "value",
    height: 400,
    smooth: true,
    color: "#6b7280",
    point: {
      size: 6,
      shape: "circle",
    },
    lineStyle: {
      lineWidth: 3,
    },
    label: {
      formatter: (d) => {
        if (!d || d.value === undefined) return "";
        return Number(d.value).toFixed(2);
      },
    },
    tooltip: {
      formatter: (d) => ({
        name: d.parameter,
        value: Number(d.value).toFixed(2),
      }),
    },
  };

  return (
    <div className="dashboard">
      {/* HEADER */}

      <div className="dashboard-header">
        <div>
          <h1>Water Monitoring Dashboard</h1>
          <p>Real-time river monitoring</p>
        </div>

        <Space>
          <Button type="primary">Export</Button>
        </Space>
      </div>

      {/* STATS */}

      <Row gutter={16} style={{ marginTop: 20 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Parameters"
              value={statusData.length}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic title="Sensors" value={5} prefix={<RadarChartOutlined />} />
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic
              title="Alerts"
              value={
                statusData.filter(
                  (p) =>
                    getSeverity(p.parameterCode, p.averageValue) !== "low"
                ).length
              }
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic
              title="Severity"
              value={overallSeverity.toUpperCase()}
              valueStyle={{
                color:
                  overallSeverity === "critical"
                    ? "#ff4d4f"
                    : overallSeverity === "high"
                    ? "#faad14"
                    : "#52c41a",
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* TABLE */}

      <Card title="Current River Status" style={{ marginTop: 30 }}>
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          rowKey="key"
        />
      </Card>

      {/* CHART */}

      <Card title="River Sensor Monitoring" style={{ marginTop: 30 }}>
        {chartData.length > 0 ? <Line {...chartConfig} /> : <p>No chart data</p>}
      </Card>
    </div>
  );
}