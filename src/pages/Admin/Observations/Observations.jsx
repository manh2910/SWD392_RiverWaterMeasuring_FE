import { useEffect, useState } from "react";
import { Card, Table, Row, Col, Statistic, Select, DatePicker, Space, message } from "antd";
import {
  BarChartOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { getStations } from "../../../api/stationApi";
import { getObservationHistory } from "../../../api/observationApi";
import "./Observations.css";

const { RangePicker } = DatePicker;

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
  const [dateRange, setDateRange] = useState(null);
  const [parameterCode, setParameterCode] = useState(undefined);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadStations = async () => {
      try {
        const stationRes = await getStations();
        const stationList = Array.isArray(stationRes?.data) ? stationRes.data : stationRes || [];
        setStations(stationList);

        if (stationList.length > 0) {
          setSelectedStationId(stationList[0].stationId);
        }
      } catch (err) {
        console.error("LOAD STATIONS ERROR:", err);
        message.error("Failed to load stations");
      }
    };

    loadStations();
  }, []);

  useEffect(() => {
    const loadObservations = async () => {
      if (!selectedStationId) {
        return;
      }

      setLoading(true);

      try {
        const params = {};

        if (dateRange?.[0]) {
          params.startDate = dateRange[0].toISOString();
        }

        if (dateRange?.[1]) {
          params.endDate = dateRange[1].toISOString();
        }

        if (parameterCode) {
          params.parameterCode = parameterCode;
        }

        const res = await getObservationHistory(selectedStationId, params);
        const stationName = stations.find((station) => station.stationId === selectedStationId)?.stationName;

        const rows = (Array.isArray(res) ? res : []).map((item) => ({
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
  }, [selectedStationId, dateRange, parameterCode, stations]);

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

  const goodCount = data.filter((o) => o.status === "good").length;
  const suspectCount = data.filter((o) => o.status === "suspect").length;
  const badCount = data.filter((o) => o.status === "bad").length;

  return (
    <div className="observations-page">
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Observations"
              value={data.length}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: "#1890ff", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic title="Good Quality" value={goodCount} valueStyle={{ color: "#52c41a", fontSize: "28px" }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic title="Suspect" value={suspectCount} valueStyle={{ color: "#faad14", fontSize: "28px" }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic title="Bad Quality" value={badCount} valueStyle={{ color: "#f5222d", fontSize: "28px" }} />
          </Card>
        </Col>
      </Row>

      <Card
        className="observations-table-card"
        title={<span><BarChartOutlined style={{ marginRight: 8, color: "#1890ff" }} />All Observations</span>}
        extra={
          <Space wrap>
            <Select
              style={{ minWidth: 220 }}
              value={selectedStationId}
              onChange={setSelectedStationId}
              placeholder="Select station"
              options={stations.map((station) => ({ label: station.stationName, value: station.stationId }))}
            />
            <RangePicker value={dateRange} onChange={setDateRange} showTime />
            <Select
              allowClear
              style={{ minWidth: 140 }}
              placeholder="Parameter"
              value={parameterCode}
              onChange={setParameterCode}
              options={[
                { label: "pH", value: "PH" },
                { label: "Dissolved Oxygen", value: "DO" },
                { label: "Conductivity", value: "COND" },
                { label: "Flow Velocity", value: "FV" },
                { label: "Water Level", value: "WL" },
                { label: "Turbidity", value: "TURB" },
                { label: "Temperature", value: "TEMP" },
              ]}
            />
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowKey="key"
          size="large"
          bordered={false}
          className="admin-table"
        />
      </Card>
    </div>
  );
}
