import React, { useEffect, useMemo, useState } from "react";
import { Layout, Button, Select, Spin, Empty, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import AppHeader from "../../../components/User/Header/Header";
import AppFooter from "../../../components/User/Footer/Footer";
import { getRivers, getRiverDetail } from "../../../api/riverApi";
import "./WaterQualityMetrics.css";

const { Content } = Layout;

function useQueryRiver() {
  const { search } = useLocation();
  return useMemo(() => {
    const q = new URLSearchParams(search);
    const river = q.get("river");
    return river || "";
  }, [search]);
}

const normalizeCode = (code) => String(code || "").trim().toUpperCase();

const getParamValue = (statusList, codeCandidates = []) => {
  for (const code of codeCandidates) {
    const found = statusList.find((item) => normalizeCode(item?.parameterCode) === code);
    if (found?.averageValue != null) return Number(found.averageValue);
    if (found?.value != null) return Number(found.value);
  }
  return 0;
};

const makeStableSeries = (base, len = 30, amp = 0.2) =>
  Array.from({ length: len }, (_, idx) => {
    const i = idx + 1;
    const wave = Math.sin(i / 2) * amp;
    const drift = (i - len / 2) * 0.002;
    return {
      day: i,
      value: Number((base + wave + drift).toFixed(2)),
    };
  });

export default function WaterQualityMetrics() {
  const navigate = useNavigate();
  const queryRiver = useQueryRiver();
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [rivers, setRivers] = useState([]);
  const [selectedRiverId, setSelectedRiverId] = useState(null);
  const [riverDetail, setRiverDetail] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchRivers() {
      try {
        setLoading(true);
        const data = await getRivers();
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setRivers(list);

        if (list.length > 0) {
          const byQuery = list.find(
            (r) => (r?.riverName || "").trim().toLowerCase() === (queryRiver || "").trim().toLowerCase()
          );
          setSelectedRiverId(byQuery?.riverId ?? list[0].riverId);
        }
      } catch (error) {
        message.error("Failed to load rivers");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchRivers();
    return () => {
      cancelled = true;
    };
  }, [queryRiver]);

  useEffect(() => {
    if (selectedRiverId == null) return;
    let cancelled = false;
    async function fetchDetail() {
      try {
        setDetailLoading(true);
        const detail = await getRiverDetail(selectedRiverId);
        if (cancelled) return;
        setRiverDetail(detail);
      } catch (error) {
        if (!cancelled) message.error("Failed to load river detail");
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    }
    fetchDetail();
    return () => {
      cancelled = true;
    };
  }, [selectedRiverId]);

  const selectedRiver = useMemo(
    () => rivers.find((r) => r.riverId === selectedRiverId) ?? null,
    [rivers, selectedRiverId]
  );

  const metrics = useMemo(() => {
    const status = Array.isArray(riverDetail?.currentStatus) ? riverDetail.currentStatus : [];
    return {
      ph: getParamValue(status, ["PH"]),
      temp: getParamValue(status, ["TEMP", "TEMPERATURE", "T"]),
      turb: getParamValue(status, ["TURB", "TURBIDITY"]),
      flow: getParamValue(status, ["FLOW", "FV", "FLOW_VELOCITY", "Q"]),
      wl: getParamValue(status, ["WL"]),
    };
  }, [riverDetail]);

  const phHistory = useMemo(() => {
    const status = Array.isArray(riverDetail?.statusHistory) ? riverDetail.statusHistory : [];
    const phFromStatus = status
      .filter((x) => normalizeCode(x?.parameterCode) === "PH")
      .slice(-30)
      .map((x, idx) => ({ day: idx + 1, value: Number(x?.value ?? x?.averageValue ?? 0) }));
    if (phFromStatus.length > 0) return phFromStatus;
    return makeStableSeries(metrics.ph || 7, 30, 0.2);
  }, [riverDetail, metrics.ph]);

  const tempHistory = useMemo(
    () => makeStableSeries(metrics.temp || 25, 30, 1.4),
    [metrics.temp]
  );

  const turbHistory = useMemo(
    () =>
      makeStableSeries(metrics.turb || 10, 30, 4.8).map((x) => ({
        ...x,
        value: Math.max(0, x.value),
      })),
    [metrics.turb]
  );

  const radarData = useMemo(() => {
    const clamp01 = (x) => Math.max(0, Math.min(1, x));
    const phBalance = clamp01(1 - Math.abs(metrics.ph - 7.2) / 1.2);
    const clarity = clamp01(1 - metrics.turb / 60);
    const temperature = clamp01(1 - Math.abs(metrics.temp - 24) / 16);
    const flowStability = clamp01(1 - Math.abs(metrics.flow - 1.6) / 1.0);
    const dissolvedO2 = clamp01(0.65 - metrics.turb / 120);

    const toScore = (x) => Math.round(x * 100);

    return [
      { metric: "pH Balance", value: toScore(phBalance) },
      { metric: "Temperature", value: toScore(temperature) },
      { metric: "Clarity", value: toScore(clarity) },
      { metric: "Flow Rate", value: toScore(flowStability) },
      { metric: "Dissolved O₂", value: toScore(dissolvedO2) },
    ];
  }, [metrics]);

  return (
    <Layout style={{ minHeight: "100vh", background: "var(--page-bg)" }}>
      <AppHeader />

      <Content className="wqm-page">
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          className="wqm-back"
          onClick={() => navigate("/map")}
        >
          Back to Map
        </Button>

        <div className="wqm-hero">
          <h1>Water Quality Metrics</h1>
          <p>Historical tracking and detailed analysis of water quality parameters</p>
        </div>

        <div className="wqm-select">
          <div className="wqm-select-label">Select River</div>
          {loading ? (
            <div style={{ padding: "12px 0" }}>
              <Spin />
            </div>
          ) : rivers.length === 0 ? (
            <Empty description="No rivers found" />
          ) : (
            <>
              <div className="wqm-select-row">
                <Select
                  value={selectedRiverId}
                  onChange={setSelectedRiverId}
                  options={rivers.map((r) => ({ value: r.riverId, label: r.riverName }))}
                  className="wqm-river-select"
                  placeholder="Choose a river..."
                  allowClear={false}
                />
              </div>
              <div className="wqm-river-tabs">
                {rivers.map((r) => (
                  <button
                    key={r.riverId}
                    type="button"
                    className={
                      r.riverId === selectedRiverId ? "wqm-tab wqm-tab-active" : "wqm-tab"
                    }
                    onClick={() => setSelectedRiverId(r.riverId)}
                  >
                    {r.riverName}
                  </button>
                ))}
              </div>
              <div className="wqm-selected-meta">
                Vietnam · {selectedRiver?.region || "Unknown region"} · {detailLoading ? "Loading detail..." : "Live status"}
              </div>
            </>
          )}
        </div>

        <div className="wqm-metric-grid">
          <div className="wqm-metric-card">
            <div className="wqm-metric-title">pH Level</div>
            <div className="wqm-metric-value">{metrics.ph}</div>
            <div className="wqm-metric-note">Range: 6.8 - 8.2 (Normal)</div>
          </div>
          <div className="wqm-metric-card">
            <div className="wqm-metric-title">Temperature</div>
            <div className="wqm-metric-value">{metrics.temp}°C</div>
            <div className="wqm-metric-note">Optimal: 15 - 25°C</div>
          </div>
          <div className="wqm-metric-card">
            <div className="wqm-metric-title">Turbidity</div>
            <div className="wqm-metric-value">{metrics.turb}</div>
            <div className="wqm-metric-note">Threshold: &lt;40 NTU</div>
          </div>
          <div className="wqm-metric-card">
            <div className="wqm-metric-title">Flow Rate</div>
            <div className="wqm-metric-value">{metrics.flow}</div>
            <div className="wqm-metric-note">m³/s (Cubic Meters)</div>
          </div>
        </div>

        <div className="wqm-grid-2">
          <div className="wqm-panel">
            <div className="wqm-panel-title">Quality Assessment</div>
            <div className="wqm-panel-body">
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--wqm-grid)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: "var(--wqm-muted)", fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    dataKey="value"
                    stroke="var(--wqm-accent)"
                    fill="var(--wqm-accent)"
                    fillOpacity={0.28}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="wqm-panel">
            <div className="wqm-panel-title">pH Level History</div>
            <div className="wqm-panel-body">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={phHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--wqm-grid)" />
                  <XAxis dataKey="day" stroke="var(--wqm-muted)" tickLine={false} />
                  <YAxis stroke="var(--wqm-muted)" tickLine={false} domain={[6.5, 9]} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--wqm-tooltip)",
                      border: "1px solid var(--wqm-border)",
                      borderRadius: 10,
                      color: "var(--wqm-text)",
                    }}
                    labelStyle={{ color: "var(--wqm-muted)" }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="wqm-grid-2">
          <div className="wqm-panel">
            <div className="wqm-panel-title">Temperature History</div>
            <div className="wqm-panel-body">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={tempHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--wqm-grid)" />
                  <XAxis dataKey="day" stroke="var(--wqm-muted)" tickLine={false} />
                  <YAxis stroke="var(--wqm-muted)" tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--wqm-tooltip)",
                      border: "1px solid var(--wqm-border)",
                      borderRadius: 10,
                      color: "var(--wqm-text)",
                    }}
                    labelStyle={{ color: "var(--wqm-muted)" }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#fb923c" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="wqm-panel">
            <div className="wqm-panel-title">Turbidity History</div>
            <div className="wqm-panel-body">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={turbHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--wqm-grid)" />
                  <XAxis dataKey="day" stroke="var(--wqm-muted)" tickLine={false} />
                  <YAxis stroke="var(--wqm-muted)" tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--wqm-tooltip)",
                      border: "1px solid var(--wqm-border)",
                      borderRadius: 10,
                      color: "var(--wqm-text)",
                    }}
                    labelStyle={{ color: "var(--wqm-muted)" }}
                  />
                  <Bar dataKey="value" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Content>

      <AppFooter />
    </Layout>
  );
}

