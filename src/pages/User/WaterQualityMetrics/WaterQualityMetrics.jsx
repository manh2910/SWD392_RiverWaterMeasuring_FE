import React, { useMemo, useState } from "react";
import { Layout, Button, Select } from "antd";
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
import "./WaterQualityMetrics.css";

const { Content } = Layout;

const RIVERS = [
  { key: "Sông Hồng", label: "Sông Hồng", region: "Bắc Bộ" },
  { key: "Sông Mê Kông", label: "Sông Mê Kông", region: "Đồng bằng sông Cửu Long" },
  { key: "Sông Đồng Nai", label: "Sông Đồng Nai", region: "Nam Bộ" },
  { key: "Sông Mã", label: "Sông Mã", region: "Bắc Trung Bộ" },
  { key: "Sông Lam", label: "Sông Lam", region: "Bắc Trung Bộ" },
  { key: "Sông Thái Bình", label: "Sông Thái Bình", region: "Bắc Bộ" },
];

function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeSeries(seed, len, base, amp) {
  const out = [];
  for (let i = 1; i <= len; i += 1) {
    const wave = Math.sin((i + seed % 10) / 2) * amp;
    const noise = (((seed >> (i % 8)) & 7) - 3) * (amp * 0.08);
    out.push(Number((base + wave + noise).toFixed(2)));
  }
  return out;
}

function useQueryRiver() {
  const { search } = useLocation();
  return useMemo(() => {
    const q = new URLSearchParams(search);
    const river = q.get("river");
    return river || "";
  }, [search]);
}

export default function WaterQualityMetrics() {
  const navigate = useNavigate();
  const queryRiver = useQueryRiver();

  const initialRiver = useMemo(() => {
    const trimmed = (queryRiver || "").trim();
    const match = RIVERS.find((r) => r.key === trimmed);
    return match?.key || RIVERS[0].key;
  }, [queryRiver]);

  const [selectedRiver, setSelectedRiver] = useState(initialRiver);

  const seed = useMemo(() => hashSeed(selectedRiver), [selectedRiver]);

  const metrics = useMemo(() => {
    const ph = Number((7.4 + ((seed % 100) - 50) * 0.006).toFixed(2));
    const temp = Number((23 + ((seed % 70) - 35) * 0.05).toFixed(1));
    const turb = Number((12 + ((seed % 90) - 45) * 0.12).toFixed(1));
    const flow = Number((1.55 + ((seed % 80) - 40) * 0.008).toFixed(2));
    return { ph, temp, turb, flow };
  }, [seed]);

  const phHistory = useMemo(() => {
    const values = makeSeries(seed, 30, metrics.ph, 0.22);
    return values.map((v, idx) => ({ day: idx + 1, value: v }));
  }, [seed, metrics.ph]);

  const tempHistory = useMemo(() => {
    const values = makeSeries(seed ^ 0x9e3779b9, 30, metrics.temp, 1.8);
    return values.map((v, idx) => ({ day: idx + 1, value: v }));
  }, [seed, metrics.temp]);

  const turbHistory = useMemo(() => {
    const values = makeSeries(seed ^ 0x85ebca6b, 30, metrics.turb, 6.5).map((v) =>
      Math.max(0, v)
    );
    return values.map((v, idx) => ({ day: idx + 1, value: v }));
  }, [seed, metrics.turb]);

  const radarData = useMemo(() => {
    const clamp01 = (x) => Math.max(0, Math.min(1, x));
    // Higher is better: balance/clarity/oxygen. (mocked)
    const phBalance = clamp01(1 - Math.abs(metrics.ph - 7.2) / 1.2);
    const clarity = clamp01(1 - metrics.turb / 60);
    const temperature = clamp01(1 - Math.abs(metrics.temp - 24) / 16);
    const flowStability = clamp01(1 - Math.abs(metrics.flow - 1.6) / 1.0);
    const dissolvedO2 = clamp01(0.55 + ((seed % 40) - 20) * 0.01);

    const toScore = (x) => Math.round(x * 100);

    return [
      { metric: "pH Balance", value: toScore(phBalance) },
      { metric: "Temperature", value: toScore(temperature) },
      { metric: "Clarity", value: toScore(clarity) },
      { metric: "Flow Rate", value: toScore(flowStability) },
      { metric: "Dissolved O₂", value: toScore(dissolvedO2) },
    ];
  }, [metrics, seed]);

  const riverMeta = useMemo(
    () => RIVERS.find((r) => r.key === selectedRiver) ?? RIVERS[0],
    [selectedRiver]
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
          <div className="wqm-select-label">Select River</div>
          <div className="wqm-select-row">
            <Select
              value={selectedRiver}
              onChange={setSelectedRiver}
              options={RIVERS.map((r) => ({ value: r.key, label: r.label }))}
              className="wqm-river-select"
              placeholder="Choose a river..."
              allowClear={false}
            />
          </div>
          <div className="wqm-river-tabs">
            {RIVERS.map((r) => (
              <button
                key={r.key}
                type="button"
                className={
                  r.key === selectedRiver ? "wqm-tab wqm-tab-active" : "wqm-tab"
                }
                onClick={() => setSelectedRiver(r.key)}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="wqm-selected-meta">Vietnam · {riverMeta.region}</div>
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

