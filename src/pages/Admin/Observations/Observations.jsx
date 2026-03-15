import { useEffect, useState } from "react";
import { Card, Table, Row, Col, Statistic, Select, Space, message } from "antd";
import {
  BarChartOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { getStations } from "../../../api/stationApi";
import { getQualityStats, getObservationsPage } from "../../../api/observationApi";
import "./Observations.css";


const mapQuality = (flag) => {
  const value = (flag || "").toUpperCase();

  if (value.includes("GOOD") || value.includes("NORMAL")) {
    return "good";
  }

  if (value.includes("SUSPECT") || value.includes("WARN")) {
    return "suspect";
  }

  return "bad";
};

export default function Observations() {
  const [stations, setStations] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, goodCount: 0, suspectCount: 0, badCount: 0 });

  useEffect(() => {
    const init = async () => {
      try {
        const [stationRes, statsRes] = await Promise.all([
          getStations(),
          getQualityStats(),
        ]);
        const stationList = Array.isArray(stationRes?.data) ? stationRes.data : stationRes || [];
        setStations(stationList);
        if (stationList.length > 0) {
          setSelectedStationId(stationList[0].stationId);
        }
        if (statsRes) {
          setStats(statsRes);
        }
      } catch (err) {
        console.error("INIT ERROR:", err);
        message.error("Failed to load data");
      }
    };

    init();
  }, []);

  useEffect(() => {
    const loadObservations = async () => {
      if (!selectedStationId) return;

      setLoading(true);
      try {
        const res = await getObservationsPage({
          stationId: selectedStationId,
          size: 10,
          sort: "observedAt,desc",
        });

        const stationName = stations.find((s) => s.stationId === selectedStationId)?.stationName;
        const items = res?.content ?? (Array.isArray(res) ? res : []);

        const rows = items.map((item) => ({
          key: item.observationId,
          date: item.observedAt ? new Date(item.observedAt).toLocaleString() : "-",
          station: stationName || `Station ${selectedStationId}`,
          parameter: item.parameterName || item.parameterCode,
          value: item.value,
          unit: item.unit,
          qualityFlag: item.qualityFlag,
          status: mapQuality(item.qualityFlag),
        }));

        setData(rows);
      } catch (err) {
        console.error("LOAD OBSERVATIONS ERROR:", err);
        message.error("Failed to load observations");
      } finally {
        setLoading(false);
      }
    };

    loadObservations();
  }, [selectedStationId, stations]);

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (text) => (
        <Space>
          <BarChartOutlined style={{ color: "#1890ff" }} />
          <span className="fw-600">{text}</span>
        </Space>
      ),
    },
    { title: "Station", dataIndex: "station", key: "station" },
    { title: "Parameter", dataIndex: "parameter", key: "parameter" },
    {
      title: "Value",
      key: "value",
      render: (_, record) => (
        <span className="fw-600">
          {record.value ?? "-"} <span style={{ fontSize: "12px", color: "#999" }}>{record.unit || ""}</span>
        </span>
      ),
    },
    { title: "Quality", dataIndex: "qualityFlag", key: "qualityFlag" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        if (status === "good") {
          return <span style={{ color: "#52c41a" }}><CheckCircleOutlined /> GOOD</span>;
        }

        if (status === "suspect") {
          return <span style={{ color: "#faad14" }}><WarningOutlined /> SUSPECT</span>;
        }

        return <span style={{ color: "#f5222d" }}><CloseCircleOutlined /> BAD</span>;
      },
    },
  ];

  return (
    <div className="observations-page">
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Observations"
              value={stats.total}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: "#1890ff", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic title="Good Quality" value={stats.goodCount} valueStyle={{ color: "#52c41a", fontSize: "28px" }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic title="Suspect" value={stats.suspectCount} valueStyle={{ color: "#faad14", fontSize: "28px" }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic title="Bad Quality" value={stats.badCount} valueStyle={{ color: "#f5222d", fontSize: "28px" }} />
          </Card>
        </Col>
      </Row>

      <Card
        className="observations-table-card"
        title={<span><BarChartOutlined style={{ marginRight: 8, color: "#1890ff" }} />10 Latest Observations</span>}
        extra={
          <Select
            style={{ minWidth: 220 }}
            value={selectedStationId}
            onChange={setSelectedStationId}
            placeholder="Select station"
            options={stations.map((station) => ({ label: station.stationName, value: station.stationId }))}
          />
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={false}
          rowKey="key"
          size="large"
          bordered={false}
          className="admin-table"
        />
      </Card>
    </div>
  );
}
