import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Layout, Button, Select, Spin, message } from "antd";
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
import { getRiverStatus } from "../../../api/observationApi";
import "./WaterQualityMetrics.css";

const { Content } = Layout;

const FALLBACK_RIVERS = [
  { key: "1", label: "Sông Hồng", region: "Bắc Bộ" },
  { key: "2", label: "Sông Mê Kông", region: "Đồng bằng sông Cửu Long" },
  { key: "3", label: "Sông Đồng Nai", region: "Nam Bộ" },
  { key: "4", label: "Sông Mã", region: "Bắc Trung Bộ" },
  { key: "5", label: "Sông Lam", region: "Bắc Trung Bộ" },
  { key: "6", label: "Sông Thái Bình", region: "Bắc Bộ" },
];

function toRiverList(res) {
  if (Array.isArray(res)) return res;
  if (res?.data && Array.isArray(res.data)) return res.data;
  if (res?.data?.content && Array.isArray(res.data.content)) return res.data.content;
  if (res?.content && Array.isArray(res.content)) return res.content;
  return [];
}

function makeSeriesFromBase(base, len, amp) {
  const out = [];
  for (let i = 1; i <= len; i += 1) {
    const wave = Math.sin(i / 2) * amp;
    const noise = ((i % 3) - 1) * (amp * 0.1);
    out.push(Number((base + wave + noise).toFixed(2)));
  }
  return out.map((v, idx) => ({ day: idx + 1, value: v }));
}

function useQueryRiver() {
  const { search } = useLocation();
  return useMemo(() => {
    const q = new URLSearchParams(search);
    return q.get("river") || "";
  }, [search]);
}

export default function WaterQualityMetrics() {
  const navigate = useNavigate();
  const queryRiver = useQueryRiver();

  const [rivers, setRivers] = useState(FALLBACK_RIVERS);
  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [selectedRiver, setSelectedRiver] = useState(null);
  const [metrics, setMetrics] = useState({ ph: 7.4, temp: 24, turb: 15, flow: 1.5 });
  const [historyData, setHistoryData] = useState({ ph: [], temp: [], turb: [] });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await getRivers();
        const list = toRiverList(res);
        if (cancelled) return;
        if (list.length > 0) {
          const options = list.map((r, i) => ({
            key: String(r.riverId ?? r.id ?? i + 1),
            label: r.riverName ?? r.name ?? `River ${i + 1}`,
            region: r.region ?? r.area ?? "",
          }));
          setRivers(options);
          if (selectedRiver === null) setSelectedRiver(options[0].key);
        } else {
          setSelectedRiver(FALLBACK_RIVERS[0].key);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("LOAD RIVERS ERROR:", err);
          message.error("Không tải được danh sách sông. Dùng dữ liệu mẫu.");
          setSelectedRiver(FALLBACK_RIVERS[0].key);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const loadMetrics = useCallback(async (riverId) => {
    if (!riverId) return;
    setMetricsLoading(true);
    try {
      const [statusRes, detailRes] = await Promise.all([
        getRiverStatus(riverId).catch(() => null),
        getRiverDetail(riverId).catch(() => null),
      ]);
      const status = statusRes || {};
      const detail = detailRes || {};
      const ph = Number(status.ph ?? detail.ph ?? 7.4);
      const temp = Number(status.temperature ?? detail.temperature ?? 24);
      const turb = Number(status.turbidity ?? detail.turbidity ?? 15);
      const flow = Number(status.flow ?? detail.flow ?? 1.5);
      setMetrics({ ph, temp, turb, flow });

      const history = detail.history ?? detail.observations ?? detail.data ?? [];
      const arr = Array.isArray(history) ? history : [];
      if (arr.length > 0) {
        const byParam = (code) => arr.filter((o) => (o.parameterCode ?? o.parameter ?? o.code) === code);
        const toPoint = (o, i) => ({ day: i + 1, value: Number(o.value ?? o.measuredValue ?? 0) });
        setHistoryData({
          ph: (byParam("PH") || byParam("ph") || arr.slice(0, 30)).map(toPoint),
          temp: (byParam("TEMP") || byParam("temperature") || arr.slice(0, 30)).map(toPoint),
          turb: (byParam("TURB") || byParam("turbidity") || arr.slice(0, 30)).map((o, i) => ({ day: i + 1, value: Math.max(0, Number(o.value ?? o.measuredValue ?? 0)) })),
        });
      } else {
        setHistoryData({
          ph: makeSeriesFromBase(ph, 30, 0.22),
          temp: makeSeriesFromBase(temp, 30, 1.8),
          turb: makeSeriesFromBase(Math.max(0, turb), 30, 6.5).map((p) => ({ ...p, value: Math.max(0, p.value) })),
        });
      }
    } catch (err) {
      console.error("LOAD METRICS ERROR:", err);
      message.error("Không tải được chỉ số chất lượng nước.");
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = selectedRiver ?? rivers[0]?.key;
    if (id) loadMetrics(id);
  }, [selectedRiver, loadMetrics]);

  const effectiveRiver = selectedRiver ?? rivers[0]?.key;

  useEffect(() => {
    const trimmed = (queryRiver || "").trim();
    if (!trimmed || !rivers.length) return;
    const byName = rivers.find((r) => r.label === trimmed);
    const byKey = rivers.find((r) => r.key === trimmed);
    if (byName) setSelectedRiver(byName.key);
    else if (byKey) setSelectedRiver(byKey.key);
  }, [queryRiver, rivers]);

  const phHistory = useMemo(() => historyData.ph.length > 0 ? historyData.ph : makeSeriesFromBase(metrics.ph, 30, 0.22), [historyData.ph, metrics.ph]);
  const tempHistory = useMemo(() => historyData.temp.length > 0 ? historyData.temp : makeSeriesFromBase(metrics.temp, 30, 1.8), [historyData.temp, metrics.temp]);
  const turbHistory = useMemo(() => historyData.turb.length > 0 ? historyData.turb : makeSeriesFromBase(Math.max(0, metrics.turb), 30, 6.5).map((p) => ({ ...p, value: Math.max(0, p.value) })), [historyData.turb, metrics.turb]);

  const radarData = useMemo(() => {
    const clamp01 = (x) => Math.max(0, Math.min(1, x));
    const phBalance = clamp01(1 - Math.abs(metrics.ph - 7.2) / 1.2);
    const clarity = clamp01(1 - metrics.turb / 60);
    const temperature = clamp01(1 - Math.abs(metrics.temp - 24) / 16);
    const flowStability = clamp01(1 - Math.abs(metrics.flow - 1.6) / 1.0);
    const dissolvedO2 = clamp01(0.6);
    const toScore = (x) => Math.round(x * 100);
    return [
      { metric: "pH Balance", value: toScore(phBalance) },
      { metric: "Temperature", value: toScore(temperature) },
      { metric: "Clarity", value: toScore(clarity) },
      { metric: "Flow Rate", value: toScore(flowStability) },
      { metric: "Dissolved O₂", value: toScore(dissolvedO2) },
    ];
  }, [metrics]);

  const riverMeta = useMemo(
    () => rivers.find((r) => r.key === effectiveRiver) ?? rivers[0] ?? FALLBACK_RIVERS[0],
    [rivers, effectiveRiver]
  );

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
          <div className="wqm-select-label">Chọn sông</div>
          <div className="wqm-select-row">
            <Select
              value={effectiveRiver}
              onChange={setSelectedRiver}
              options={rivers.map((r) => ({ value: r.key, label: r.label }))}
              className="wqm-river-select"
              placeholder="Chọn sông..."
              allowClear={false}
              loading={loading}
              disabled={loading}
            />
          </div>
          <div className="wqm-river-tabs">
            {rivers.map((r) => (
              <button
                key={r.key}
                type="button"
                className={
                  r.key === effectiveRiver ? "wqm-tab wqm-tab-active" : "wqm-tab"
                }
                onClick={() => setSelectedRiver(r.key)}
                disabled={loading}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="wqm-selected-meta">Vietnam · {riverMeta.region}</div>
        </div>

        {metricsLoading && (
          <div className="wqm-metrics-loading">
            <Spin tip="Đang tải chỉ số chất lượng nước..." />
          </div>
        )}

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
                  <PolarAngleAxis dataKey="metric" tick={{ fill: "var(--wqm-axis)", fontSize: 11 }} />
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
                  <XAxis dataKey="day" stroke="var(--wqm-axis)" tick={{ fill: "var(--wqm-axis)", fontSize: 11 }} tickLine={false} />
                  <YAxis stroke="var(--wqm-axis)" tick={{ fill: "var(--wqm-axis)", fontSize: 11 }} tickLine={false} domain={[6.5, 9]} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--wqm-tooltip)",
                      border: "1px solid var(--wqm-border)",
                      borderRadius: 10,
                      color: "var(--wqm-text)",
                    }}
                    labelStyle={{ color: "var(--wqm-axis)" }}
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
                  <XAxis dataKey="day" stroke="var(--wqm-axis)" tick={{ fill: "var(--wqm-axis)", fontSize: 11 }} tickLine={false} />
                  <YAxis stroke="var(--wqm-axis)" tick={{ fill: "var(--wqm-axis)", fontSize: 11 }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--wqm-tooltip)",
                      border: "1px solid var(--wqm-border)",
                      borderRadius: 10,
                      color: "var(--wqm-text)",
                    }}
                    labelStyle={{ color: "var(--wqm-axis)" }}
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
                  <XAxis dataKey="day" stroke="var(--wqm-axis)" tick={{ fill: "var(--wqm-axis)", fontSize: 11 }} tickLine={false} />
                  <YAxis stroke="var(--wqm-axis)" tick={{ fill: "var(--wqm-axis)", fontSize: 11 }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--wqm-tooltip)",
                      border: "1px solid var(--wqm-border)",
                      borderRadius: 10,
                      color: "var(--wqm-text)",
                    }}
                    labelStyle={{ color: "var(--wqm-axis)" }}
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

