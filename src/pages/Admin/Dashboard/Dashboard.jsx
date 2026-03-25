import { useEffect, useState, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Tag,
  Statistic,
  Select,
  Spin,
  Empty,
  List,
  Badge,
  Typography,
  Space,
  message,
} from "antd";
import {
  AlertOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  RadarChartOutlined,
} from "@ant-design/icons";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

import AdminMap from "../../../components/Admin/AdminMap/AdminMap";
import { getRivers } from "../../../api/riverApi";
import { getStations } from "../../../api/stationApi";
import { getObservationsPage } from "../../../api/observationApi";
import { getAlertHistory } from "../../../api/alertHistoryApi";

import "./Dashboard.css";

const { Text } = Typography;

const PARAM_COLORS = {
  PH:   "#1890ff",
  DO:   "#52c41a",
  COND: "#fa8c16",
  WL:   "#722ed1",
  FV:   "#eb2f96",
};

const PARAM_LABELS = {
  PH:   "pH",
  DO:   "Dissolved Oxygen (DO)",
  COND: "Conductivity (COND)",
  WL:   "Water Level (WL)",
  FV:   "Flow Velocity (FV)",
};

const PARAM_UNITS = {
  PH:   "",
  DO:   "mg/L",
  COND: "µS/cm",
  WL:   "m",
  FV:   "m/s",
};

const SEVERITY_COLOR = {
  LOW:      "green",
  MEDIUM:   "gold",
  HIGH:     "orange",
  CRITICAL: "red",
};

/* Flatten paged or plain-array response */
function extractList(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.content)) return res.content;
  if (Array.isArray(res.data)) return res.data;
  return [];
}

/* Build per-parameter chart data: { PH: [{time, value}, ...], DO: [...], ... } */
function buildChartData(observations) {
  const perParam = {};
  observations.forEach((o) => {
    const code = o.parameterCode ?? o.parameter;
    const val  = Number(o.value ?? o.averageValue);
    const raw  = o.observedAt ?? o.observationTime ?? o.time ?? o.timestamp ?? "";
    const time = String(raw).slice(0, 16).replace("T", " ");
    if (!code || !time || !Number.isFinite(val)) return;
    if (!perParam[code]) perParam[code] = [];
    perParam[code].push({ time, value: val });
  });
  // Sort each param's data by time
  Object.values(perParam).forEach((arr) => arr.sort((a, b) => (a.time > b.time ? 1 : -1)));
  return perParam;
}

export default function Dashboard() {
  /* ─── rivers & stations ─── */
  const [rivers, setRivers]         = useState([]);
  const [stations, setStations]     = useState([]);
  const [selectedRiverId, setSelectedRiverId] = useState(null);
  const [selectedStationId, setSelectedStationId] = useState(null);

  /* ─── observation chart ─── */
  const [obsLoading, setObsLoading] = useState(false);
  const [obsData, setObsData]       = useState({});   // { [code]: [{time,value}] }
  const [paramCodes, setParamCodes] = useState([]);

  /* ─── alert history ─── */
  const [alerts, setAlerts]         = useState([]);
  const [alertLoading, setAlertLoading] = useState(false);

  /* ─── stats ─── */
  const [totalStations, setTotalStations] = useState(0);

  /* ════════ Init: load rivers + stations + alerts ════════ */
  useEffect(() => {
    async function init() {
      try {
        const [riverRes, stationRes] = await Promise.all([
          getRivers().catch(() => []),
          getStations().catch(() => []),
        ]);
        const riverList   = extractList(riverRes);
        const stationList = extractList(stationRes);
        setRivers(riverList);
        setStations(stationList);
        setTotalStations(stationList.length);
        if (riverList.length > 0) {
          const firstId = riverList[0].riverId ?? riverList[0].id;
          setSelectedRiverId(firstId);
        }
      } catch (err) {
        console.error(err);
      }
    }
    init();
    fetchAlerts();
  }, []);

  /* Auto-select first station when river changes */
  useEffect(() => {
    if (selectedRiverId == null) return;
    const filtered = stations.filter(
      (s) => Number(s.riverId ?? s.riverID) === Number(selectedRiverId)
    );
    const firstId = filtered[0]?.stationId ?? filtered[0]?.id ?? null;
    setSelectedStationId(firstId ?? null);
  }, [selectedRiverId, stations]);

  /* Fetch observations when station changes */
  useEffect(() => {
    if (selectedStationId == null) {
      setObsData({});
      setParamCodes([]);
      return;
    }
    fetchObservations(selectedStationId);
  }, [selectedStationId]);

  /* ════════ Fetch helpers ════════ */
  const fetchObservations = async (stationId) => {
    setObsLoading(true);
    try {
      // Fetch all available observations for the station, sorted oldest→newest for chart
      const res = await getObservationsPage({
        stationId,
        size: 500,
        sort: "observedAt,asc",
      });
      const list   = res?.content ?? (Array.isArray(res) ? res : []);
      const perParam = buildChartData(list);
      const codes    = Object.keys(perParam);
      setObsData(perParam);
      setParamCodes(codes);
    } catch (err) {
      console.error(err);
      message.error("Could not load observation data");
    } finally {
      setObsLoading(false);
    }
  };

  const fetchAlerts = async () => {
    setAlertLoading(true);
    try {
      const res = await getAlertHistory();
      const list = extractList(res);
      setAlerts(list.slice(0, 20));
    } catch (err) {
      // 401 = not logged in or token expired, don't spam error toast
      if (err?.response?.status !== 401) {
        console.error(err);
      }
    } finally {
      setAlertLoading(false);
    }
  };

  /* ════════ Derived data ════════ */
  const filteredStations = useMemo(
    () =>
      selectedRiverId == null
        ? stations
        : stations.filter(
            (s) => Number(s.riverId ?? s.riverID) === Number(selectedRiverId)
          ),
    [stations, selectedRiverId]
  );

  const riverOptions = useMemo(
    () =>
      rivers.map((r) => ({
        value: r.riverId ?? r.id,
        label: r.riverName ?? r.name ?? `River #${r.riverId ?? r.id}`,
      })),
    [rivers]
  );

  const stationOptions = useMemo(
    () =>
      filteredStations.map((s) => ({
        value: s.stationId ?? s.id,
        label: s.stationName ?? s.name ?? `Station #${s.stationId ?? s.id}`,
      })),
    [filteredStations]
  );

  const unresolvedAlerts = alerts.filter((a) => !a.resolved && !a.isResolved).length;

  /* ════════ RENDER ════════ */
  return (
    <div className="dashboard">

      {/* ── HEADER ── */}
      <div className="dashboard-header">
        <div>
          <h1 className="title">Water Monitoring Dashboard</h1>
          <p className="subtitle">Real-time river &amp; station monitoring</p>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <Row gutter={16} className="stats-row">
        <Col xs={12} sm={8} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Stations"
              value={totalStations}
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Rivers"
              value={rivers.length}
              prefix={<RadarChartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Unresolved Alerts"
              value={unresolvedAlerts}
              prefix={<AlertOutlined />}
              valueStyle={{ color: unresolvedAlerts > 0 ? "#ff4d4f" : "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Observation Data Points"
              value={Object.values(obsData).reduce((s, a) => s + a.length, 0)}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* ── MAP ── */}
      <Card title="River Station Map" style={{ marginTop: 24 }}>
        <AdminMap />
      </Card>

      {/* ── OBSERVATION CHARTS (one per parameter) ── */}
      <Card
        title="Station Observations"
        style={{ marginTop: 24 }}
        extra={
          <Space wrap>
            <Select
              placeholder="Select river"
              value={selectedRiverId}
              onChange={(v) => setSelectedRiverId(v)}
              options={riverOptions}
              style={{ minWidth: 160 }}
              showSearch
              filterOption={(inp, opt) =>
                String(opt?.label ?? "").toLowerCase().includes(inp.toLowerCase())
              }
            />
            <Select
              placeholder="Select station"
              value={selectedStationId}
              onChange={(v) => setSelectedStationId(v)}
              options={stationOptions}
              style={{ minWidth: 200 }}
              disabled={filteredStations.length === 0}
              showSearch
              filterOption={(inp, opt) =>
                String(opt?.label ?? "").toLowerCase().includes(inp.toLowerCase())
              }
            />
          </Space>
        }
      >
        {obsLoading ? (
          <div className="dashboard-chart-loading">
            <Spin tip="Loading observations..." />
          </div>
        ) : paramCodes.length === 0 ? (
          <Empty description="No observation data for this station" />
        ) : (
          <Row gutter={[16, 16]}>
            {paramCodes.map((code) => {
              const data   = obsData[code] ?? [];
              const color  = PARAM_COLORS[code] ?? "#8884d8";
              const label  = PARAM_LABELS[code] ?? code;
              const unit   = PARAM_UNITS[code] ?? "";
              const values = data.map((d) => d.value);
              const min    = values.length ? Math.min(...values) : 0;
              const max    = values.length ? Math.max(...values) : 1;
              const pad    = (max - min) * 0.15 || 1;
              return (
                <Col xs={24} md={12} key={code}>
                  <div className="dashboard-param-chart">
                    <div className="dashboard-param-chart-header">
                      <span className="dashboard-param-chart-dot" style={{ background: color }} />
                      <span className="dashboard-param-chart-title">{label}</span>
                      <span className="dashboard-param-chart-count">{data.length} pts</span>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={data} margin={{ top: 6, right: 16, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                        <XAxis
                          dataKey="time"
                          tick={{ fontSize: 10 }}
                          tickFormatter={(v) => String(v).slice(11, 16)}
                          minTickGap={40}
                        />
                        <YAxis
                          tick={{ fontSize: 10 }}
                          domain={[min - pad, max + pad]}
                          tickFormatter={(v) => Number(v).toFixed(1)}
                          width={50}
                          unit={unit ? ` ${unit}` : ""}
                        />
                        <Tooltip
                          formatter={(val) => [`${Number(val).toFixed(3)}${unit ? ` ${unit}` : ""}`, label]}
                          labelFormatter={(l) => `Time: ${l}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={color}
                          dot={data.length <= 30 ? { r: 3, fill: color } : false}
                          strokeWidth={2}
                          connectNulls
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Col>
              );
            })}
          </Row>
        )}
      </Card>

      {/* ── ALERT HISTORY ── */}
      <Card
        title={
          <Space>
            Alert History
            {unresolvedAlerts > 0 && (
              <Badge count={unresolvedAlerts} style={{ backgroundColor: "#ff4d4f" }} />
            )}
          </Space>
        }
        style={{ marginTop: 24, marginBottom: 32 }}
      >
        {alertLoading ? (
          <div className="dashboard-chart-loading">
            <Spin tip="Loading alerts..." />
          </div>
        ) : alerts.length === 0 ? (
          <Empty description="No alerts found" />
        ) : (
          <List
            dataSource={alerts}
            size="small"
            renderItem={(alert) => {
              const severity = String(alert.severity ?? "LOW").toUpperCase();
              const qualityFlag = String(alert.qualityFlag ?? "");
              const resolved = alert.resolved ?? alert.isResolved ?? false;
              const time = String(
                alert.triggeredAt ?? alert.createdAt ?? alert.alertTime ?? ""
              ).replace("T", " ").slice(0, 19);
              return (
                <List.Item>
                  <div className="dashboard-alert-row">
                    <Tag color={SEVERITY_COLOR[severity] ?? "default"}>
                      {severity}
                    </Tag>
                    <div className="dashboard-alert-msg">
                      <Text strong style={{ fontSize: 13 }}>
                        {alert.parameterName ?? alert.message ?? alert.alertMessage ?? "—"}
                        {alert.triggeredValue != null && (
                          <span style={{ fontWeight: 400, color: "#64748b", marginLeft: 6 }}>
                            = {alert.triggeredValue}
                          </span>
                        )}
                      </Text>
                      {alert.stationName && (
                        <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                          <EnvironmentOutlined /> {alert.stationName}
                        </Text>
                      )}
                      {alert.riverName && (
                        <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                          ({alert.riverName})
                        </Text>
                      )}
                    </div>
                    <div className="dashboard-alert-meta">
                      {qualityFlag && (
                        <Tag color={SEVERITY_COLOR[qualityFlag.toUpperCase()] ?? "default"}>
                          {qualityFlag}
                        </Tag>
                      )}
                      {time && (
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          <ClockCircleOutlined /> {time}
                        </Text>
                      )}
                      <Tag color={resolved ? "green" : "volcano"}>
                        {resolved ? "Resolved" : "Active"}
                      </Tag>
                    </div>
                  </div>
                </List.Item>
              );
            }}
          />
        )}
      </Card>

    </div>
  );
}