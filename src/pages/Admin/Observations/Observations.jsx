import { useEffect, useState, useCallback } from "react";
import { Card, Table, Row, Col, Statistic, Select, DatePicker, Space, message, Button, Popconfirm } from "antd";
import {
  BarChartOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { getStations } from "../../../api/stationApi";
import { getParameters } from "../../../api/paraApi";
import {
  getObservationHistory,
  updateObservationFlag,
  deleteObservation,
} from "../../../api/observationApi";
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

const QUALITY_OPTIONS = [
  { label: "Good", value: "GOOD" },
  { label: "Suspect", value: "SUSPECT" },
  { label: "Bad", value: "BAD" },
];

function toObservationList(res) {
  if (Array.isArray(res)) return res;
  if (res?.data && Array.isArray(res.data)) return res.data;
  if (res?.data?.content && Array.isArray(res.data.content)) return res.data.content;
  if (res?.content && Array.isArray(res.content)) return res.content;
  if (res?.observations && Array.isArray(res.observations)) return res.observations;
  if (res?.items && Array.isArray(res.items)) return res.items;
  if (res?.results && Array.isArray(res.results)) return res.results;
  return [];
}

function getStationId(station) {
  return station?.stationId ?? station?.id;
}

export default function Observations() {
  const [stations, setStations] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [parameterCode, setParameterCode] = useState(undefined);
  const [parameterOptions, setParameterOptions] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadStations = async () => {
      try {
        const list = await getStations();
        setStations(Array.isArray(list) ? list : []);
        if (list?.length > 0) {
          setSelectedStationId((prev) => {
            const firstId = getStationId(list[0]);
            if (prev && list.some((s) => getStationId(s) === prev)) return prev;
            return firstId;
          });
        }
      } catch (err) {
        console.error("LOAD STATIONS ERROR:", err);
        message.error("Failed to load stations");
      }
    };

    loadStations();
  }, []);

  useEffect(() => {
    const loadParameters = async () => {
      try {
        const res = await getParameters();
        const list = toObservationList(Array.isArray(res) ? res : res?.data ?? []);
        setParameterOptions(
          list.map((p) => ({ label: p.name || p.code || p.parameterId, value: p.code || p.parameterId }))
        );
      } catch {
        setParameterOptions([
          { label: "pH", value: "PH" },
          { label: "Dissolved Oxygen", value: "DO" },
          { label: "Conductivity", value: "COND" },
          { label: "Water Level", value: "WL" },
          { label: "Turbidity", value: "TURB" },
          { label: "Temperature", value: "TEMP" },
        ]);
      }
    };
    loadParameters();
  }, []);

  const loadObservations = useCallback(async () => {
    if (!selectedStationId) return;
    setLoading(true);
    try {
      const params = {};
      if (dateRange?.[0]) params.startDate = dateRange[0].toISOString();
      if (dateRange?.[1]) params.endDate = dateRange[1].toISOString();
      if (parameterCode) params.parameterCode = parameterCode;

      const res = await getObservationHistory(selectedStationId, params);
      const list = toObservationList(res);
      const stationObj = stations.find((s) => getStationId(s) === selectedStationId);
      const stationName = stationObj?.stationName ?? stationObj?.name;

      const rows = list.map((item) => {
        const obsId = item.observationId ?? item.id;
        const dateRaw = item.observedAt ?? item.timestamp ?? item.createdAt ?? item.date;
        return {
          key: obsId,
          observationId: obsId,
          date: dateRaw ? new Date(dateRaw).toLocaleString() : "-",
          station: stationName || `Station ${selectedStationId}`,
          parameter: item.parameterName ?? item.parameterCode ?? item.parameter,
          value: item.value ?? item.measuredValue,
          unit: item.unit ?? item.defaultUnit,
          qualityFlag: item.qualityFlag ?? item.flag,
          status: mapQuality(item.qualityFlag ?? item.flag),
        };
      });
      setData(rows);
    } catch (err) {
      console.error("LOAD OBSERVATIONS ERROR:", err);
      message.error("Failed to load observations");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStationId, dateRange, parameterCode, stations]);

  useEffect(() => {
    loadObservations();
  }, [loadObservations]);

  const handleFlagChange = async (observationId, qualityFlag) => {
    try {
      await updateObservationFlag(observationId, { qualityFlag });
      message.success("Quality flag updated");
      loadObservations();
    } catch (err) {
      console.error("UPDATE FLAG ERROR:", err);
      message.error("Failed to update quality flag");
    }
  };

  const handleDelete = async (observationId) => {
    try {
      await deleteObservation(observationId);
      message.success("Observation deleted");
      loadObservations();
    } catch (err) {
      console.error("DELETE OBSERVATION ERROR:", err);
      message.error("Failed to delete observation");
    }
  };

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
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space>
          <Select
            size="small"
            style={{ width: 100 }}
            value={record.qualityFlag || "GOOD"}
            options={QUALITY_OPTIONS}
            onChange={(value) => handleFlagChange(record.observationId, value)}
          />
          <Popconfirm
            title="Delete this observation?"
            onConfirm={() => handleDelete(record.observationId)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
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
              options={stations.map((s) => ({ label: s.stationName ?? s.name ?? `Station ${getStationId(s)}`, value: getStationId(s) }))}
            />
            <RangePicker value={dateRange} onChange={setDateRange} showTime />
            <Select
              allowClear
              style={{ minWidth: 160 }}
              placeholder="Parameter"
              value={parameterCode}
              onChange={setParameterCode}
              options={parameterOptions}
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
          locale={{
            emptyText: selectedStationId
              ? "Chưa có observation nào cho trạm này. Thử bỏ lọc ngày/parameter hoặc chọn trạm khác."
              : "Chọn trạm để xem dữ liệu.",
          }}
        />
      </Card>
    </div>
  );
}
