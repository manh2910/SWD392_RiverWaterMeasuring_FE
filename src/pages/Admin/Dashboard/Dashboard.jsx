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
  Select,
  DatePicker,
  message,
} from "antd";

import {
  DatabaseOutlined,
  RadarChartOutlined,
  AlertOutlined,
  SendOutlined,
} from "@ant-design/icons";

import { getRiverDetail } from "../../../api/riverApi";

import "./Dashboard.css";

/* ===== THRESHOLDS ===== */

const THRESHOLDS = {
  PH: { min: 6.5, max: 8.5 },
  DO: { min: 5 },
  COND: { max: 1000 },
  WL: { max: 3 },
  FV: { max: 3.5 },
};

/* ===== SEVERITY ===== */

const getSeverity = (code, value) => {
  const t = THRESHOLDS[code];

  if (!t) return "low";

  if (t.min && value < t.min * 0.8) return "critical";
  if (t.min && value < t.min) return "high";

  if (t.max && value > t.max * 1.3) return "critical";
  if (t.max && value > t.max) return "high";

  return "low";
};

export default function Dashboard() {
  const [riverInfo, setRiverInfo] = useState(null);
  const [alertData, setAlertData] = useState([]);
  const [overallSeverity, setOverallSeverity] = useState("low");

  useEffect(() => {
    fetchRiver();
  }, []);

  const fetchRiver = async () => {
    try {
      const data = await getRiverDetail(1);

      setRiverInfo(data.basicInfo);

      let highest = "low";

      const map = {};

      data.currentStatus.forEach((p) => {
        const severity = getSeverity(p.parameterCode, p.averageValue);

        if (severity === "critical") highest = "critical";
        else if (severity === "high" && highest !== "critical")
          highest = "high";

        map[p.parameterCode] = {
          value: p.averageValue,
          unit: p.unit,
          severity,
        };
      });

      const row = {
        key: 1,
        river: data.basicInfo.riverName,
        cond: map.COND,
        oxy: map.DO,
        flow: map.FV,
        ph: map.PH,
        water: map.WL,
        severity: highest,
      };

      setAlertData([row]);
      setOverallSeverity(highest);
    } catch (err) {
      console.log(err);
      message.error("Load river data failed");
    }
  };

  /* ===== COLOR VALUE ===== */

  const renderValue = (obj) => {
    if (!obj) return "-";

    const colors = {
      critical: "#ff4d4f",
      high: "#faad14",
      low: "#52c41a",
    };

    return (
      <span style={{ color: colors[obj.severity], fontWeight: 600 }}>
        {obj.value.toFixed(2)} {obj.unit}
      </span>
    );
  };

  /* ===== SEND ALERT ===== */

  const sendAlert = () => {
    message.success("Alert sent to monitoring system");
  };

  /* ===== TABLE ===== */

  const columns = [
    {
      title: "River",
      dataIndex: "river",
    },
    {
      title: "Độ dẫn điện/Độ mặn",
      render: (_, r) => renderValue(r.cond),
    },
    {
      title: "Oxy hòa tan",
      render: (_, r) => renderValue(r.oxy),
    },
    {
      title: "Vận tốc dòng chảy",
      render: (_, r) => renderValue(r.flow),
    },
    {
      title: "Độ pH",
      render: (_, r) => renderValue(r.ph),
    },
    {
      title: "Mực nước",
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

        return <Tag color={colors[s]}>{s.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Action",
      render: (_, r) =>
        r.severity === "high" || r.severity === "critical" ? (
          <Button danger icon={<SendOutlined />} onClick={sendAlert}>
            Send Alert
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="dashboard">
      {/* HEADER */}

      <div className="dashboard-header">
        <div>
          <h1>💧 Water Monitoring Dashboard</h1>
          <p>Real-time river quality monitoring</p>
        </div>

        <Space>
          <Select
            style={{ width: 150 }}
            placeholder="Region"
            options={[
              { label: "All Regions", value: "all" },
              { label: "Mekong", value: "mekong" },
            ]}
          />

          <DatePicker />

          <Button type="primary">Export</Button>
        </Space>
      </div>

      {/* STATS */}

      <Row gutter={16} style={{ marginTop: 20 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="River"
              value={riverInfo?.riverName || "-"}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic
              title="Sensors"
              value={5}
              prefix={<RadarChartOutlined />}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic
              title="Parameters"
              value={5}
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

      {/* ALERT TABLE */}

      <Card title="Recent Alerts" style={{ marginTop: 30 }}>
        <Table
          columns={columns}
          dataSource={alertData}
          pagination={false}
          rowKey="key"
        />
      </Card>
    </div>
  );
}