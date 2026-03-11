import React, { useState, useMemo } from "react";
import { Layout, Button, Tag, Input, Empty } from "antd";
import { ArrowLeftOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import AppHeader from "../../../components/User/Header/Header";
import AppFooter from "../../../components/User/Footer/Footer";
import "./RiverMap.css";
import { useNavigate } from "react-router-dom";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const { Content } = Layout;

const majorRivers = [
  { id: 1, name: "Sông Hồng", country: "Việt Nam", region: "Bắc Bộ", level: 2.35, temperature: 26.2, ph: 7.42, turbidity: 32.1, flow: 1.58, type: "major", position: [21.02, 105.85] },
  { id: 2, name: "Sông Mê Kông", country: "Việt Nam", region: "Đồng bằng sông Cửu Long", level: 2.48, temperature: 28.5, ph: 7.28, turbidity: 38.6, flow: 1.82, type: "major", position: [10.05, 105.55] },
  { id: 3, name: "Sông Đồng Nai", country: "Việt Nam", region: "Nam Bộ", level: 2.22, temperature: 27.8, ph: 7.35, turbidity: 28.4, flow: 1.45, type: "major", position: [10.95, 106.85] },
  { id: 4, name: "Sông Mã", country: "Việt Nam", region: "Bắc Trung Bộ", level: 2.08, temperature: 25.6, ph: 7.48, turbidity: 24.2, flow: 1.18, type: "major", position: [19.85, 105.75] },
  { id: 5, name: "Sông Lam", country: "Việt Nam", region: "Bắc Trung Bộ", level: 2.12, temperature: 25.2, ph: 7.52, turbidity: 22.8, flow: 1.22, type: "major", position: [18.9, 105.68] },
  { id: 6, name: "Sông Thái Bình", country: "Việt Nam", region: "Bắc Bộ", level: 2.18, temperature: 25.8, ph: 7.45, turbidity: 26.5, flow: 1.32, type: "major", position: [20.95, 106.52] },
];

const branchesData = [
  { id: 10, name: "Sông Đà", country: "Việt Nam", region: "Bắc Bộ", level: 2.28, temperature: 25.5, ph: 7.38, turbidity: 28, flow: 1.35, type: "branch", parentId: 1, position: [21.2, 105.3] },
  { id: 11, name: "Sông Lô", country: "Việt Nam", region: "Bắc Bộ", level: 2.15, temperature: 26.0, ph: 7.4, turbidity: 30, flow: 1.22, type: "branch", parentId: 1, position: [21.35, 105.9] },
  { id: 12, name: "Sông Đuống", country: "Việt Nam", region: "Bắc Bộ", level: 2.1, temperature: 26.2, ph: 7.42, turbidity: 31, flow: 1.18, type: "branch", parentId: 1, position: [21.0, 106.0] },
  { id: 13, name: "Sông Tiền", country: "Việt Nam", region: "Đồng bằng sông Cửu Long", level: 2.42, temperature: 28.2, ph: 7.25, turbidity: 36, flow: 1.68, type: "branch", parentId: 2, position: [10.35, 105.5] },
  { id: 14, name: "Sông Hậu", country: "Việt Nam", region: "Đồng bằng sông Cửu Long", level: 2.45, temperature: 28.6, ph: 7.26, turbidity: 40, flow: 1.72, type: "branch", parentId: 2, position: [10.0, 105.8] },
  { id: 15, name: "Sông Bassac", country: "Việt Nam", region: "Đồng bằng sông Cửu Long", level: 2.38, temperature: 28.0, ph: 7.28, turbidity: 42, flow: 1.58, type: "branch", parentId: 2, position: [9.85, 105.65] },
  { id: 16, name: "Sông Bé", country: "Việt Nam", region: "Nam Bộ", level: 2.08, temperature: 27.5, ph: 7.32, turbidity: 26, flow: 1.12, type: "branch", parentId: 3, position: [11.2, 106.5] },
  { id: 17, name: "Sông La Ngà", country: "Việt Nam", region: "Nam Bộ", level: 2.15, temperature: 27.2, ph: 7.34, turbidity: 24, flow: 1.18, type: "branch", parentId: 3, position: [10.9, 107.0] },
  { id: 18, name: "Sông Chu", country: "Việt Nam", region: "Bắc Trung Bộ", level: 1.95, temperature: 25.2, ph: 7.46, turbidity: 22, flow: 0.98, type: "branch", parentId: 4, position: [20.0, 105.3] },
  { id: 19, name: "Sông Bưởi", country: "Việt Nam", region: "Bắc Trung Bộ", level: 2.0, temperature: 25.5, ph: 7.47, turbidity: 23, flow: 1.02, type: "branch", parentId: 4, position: [20.2, 105.55] },
  { id: 20, name: "Sông Con", country: "Việt Nam", region: "Bắc Trung Bộ", level: 1.92, temperature: 24.8, ph: 7.5, turbidity: 20, flow: 0.95, type: "branch", parentId: 5, position: [18.8, 105.4] },
  { id: 21, name: "Sông Nậm Mộ", country: "Việt Nam", region: "Bắc Trung Bộ", level: 1.98, temperature: 25.0, ph: 7.51, turbidity: 21, flow: 1.0, type: "branch", parentId: 5, position: [19.0, 105.6] },
  { id: 22, name: "Sông Cầu", country: "Việt Nam", region: "Bắc Bộ", level: 2.05, temperature: 25.5, ph: 7.43, turbidity: 25, flow: 1.08, type: "branch", parentId: 6, position: [21.2, 106.2] },
  { id: 23, name: "Sông Thương", country: "Việt Nam", region: "Bắc Bộ", level: 2.12, temperature: 25.8, ph: 7.44, turbidity: 27, flow: 1.15, type: "branch", parentId: 6, position: [21.1, 106.35] },
];

const riversData = [...majorRivers, ...branchesData];

const FILTERS = [
  { key: "all", label: "All Rivers" },
  { key: "major", label: "Major Rivers" },
  { key: "branch", label: "Branches" },
];

const MAP_ZOOM_SELECTED = 11;

function MapRecenter({ position }) {
  const map = useMap();

  React.useEffect(() => {
    if (!position) return;
    map.flyTo(position, MAP_ZOOM_SELECTED, { duration: 0.6 });
  }, [map, position]);

  return null;
}

function RiverMap() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(riversData[0].id);
  const [search, setSearch] = useState("");

  const displayedRivers = useMemo(() => {
    const byType =
      activeFilter === "all"
        ? riversData
        : activeFilter === "major"
          ? majorRivers
          : branchesData;

    const q = search.trim().toLowerCase();
    if (!q) return byType;

    return byType.filter(
      (r) =>
        r.name.toLowerCase().includes(q) || r.country.toLowerCase().includes(q)
    );
  }, [activeFilter, search]);

  const effectiveSelectedId = useMemo(() => {
    if (displayedRivers.some((r) => r.id === selectedId)) return selectedId;
    return displayedRivers[0]?.id ?? riversData[0].id;
  }, [displayedRivers, selectedId]);

  const selectedMajorId = useMemo(() => {
    const r = riversData.find((x) => x.id === effectiveSelectedId);
    if (!r) return null;
    return r.type === "major" ? r.id : r.parentId;
  }, [effectiveSelectedId]);

  const relatedBranches = useMemo(() => {
    if (selectedMajorId == null) return [];
    return branchesData.filter((b) => b.parentId === selectedMajorId);
  }, [selectedMajorId]);

  const selectedMajorName = useMemo(() => {
    if (selectedMajorId == null) return "";
    const m = majorRivers.find((x) => x.id === selectedMajorId);
    return m?.name ?? "";
  }, [selectedMajorId]);

  const selectedRiver =
    riversData.find((r) => r.id === effectiveSelectedId) ?? riversData[0];

  const chartData = useMemo(() => {
    const base = selectedRiver.level;
    const points = [];
    for (let i = 0; i < 12; i += 1) {
      const hour = `${i}h`;
      const wave = Math.sin(i / 1.5) * 0.12;
      const drift = (i - 6) * 0.005;
      const noise = ((i % 3) - 1) * 0.03;
      const level = Math.max(0, Math.min(3.5, base + wave + drift + noise));
      points.push({ hour, level: Number(level.toFixed(2)) });
    }
    return points;
  }, [selectedRiver.level]);

  // Recompute timestamp when selection changes
  const updatedAt = useMemo(() => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: refresh on selectedId change
  }, [selectedId]);

  const levelPercent = Math.max(
    0,
    Math.min(100, (selectedRiver.level / 3.5) * 100)
  );

  return (
    <Layout style={{ minHeight: "100vh", background: "var(--page-bg)" }}>
      <AppHeader />

      <Content className="river-map-page">
        <div className="river-map-header">
          <div>
            <h1>River Location Map</h1>
            <p>Select a river to view detailed information.</p>
          </div>

          <Button
            type="default"
            icon={<ArrowLeftOutlined />}
            href="/"
            className="river-map-back"
          >
            Back to Home
          </Button>
        </div>

        <div className="river-map-toolbar">
          <div className="river-map-filters">
            {FILTERS.map((filter) => {
              const count =
                filter.key === "all"
                  ? riversData.length
                  : filter.key === "major"
                    ? majorRivers.length
                    : branchesData.length;

              return (
                <Button
                  key={filter.key}
                  type={activeFilter === filter.key ? "primary" : "default"}
                  onClick={() => setActiveFilter(filter.key)}
                >
                  {filter.label} ({count})
                </Button>
              );
            })}
          </div>

          <Input.Search
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search river, branch or country..."
            className="river-map-search"
          />
        </div>

        <div className="river-map-layout">
          <div className="river-map-left">
            <div className="river-map-container">
              <div className="panel-header">
                <h2 className="panel-title">Interactive River Map</h2>
              </div>

              <div className="panel-body">
              <div className="river-map-map-wrap">
                <MapContainer
                  center={selectedRiver.position}
                  zoom={3}
                  scrollWheelZoom
                  className="river-map-leaflet"
                >
                  <MapRecenter position={selectedRiver.position} />
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />

                  {displayedRivers.map((river) => (
                    <Marker
                      key={river.id}
                      position={river.position}
                      eventHandlers={{
                        click: () => setSelectedId(river.id),
                      }}
                    >
                      <Popup>
                        <strong>{river.name}</strong>
                        <br />
                        {river.country}
                        <br />
                        Level: {river.level.toFixed(2)} m
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>

                <div className="river-map-info-card">
                  <div className="river-map-info-title">{selectedRiver.name}</div>
                  <div className="river-map-info-row">{selectedRiver.region}</div>
                  <div className="river-map-info-row">
                    Mực nước: <strong>{selectedRiver.level.toFixed(2)} m</strong>
                  </div>
                  <div className="river-map-info-row">
                    Nhiệt độ: {selectedRiver.temperature.toFixed(1)}°C · pH: {selectedRiver.ph.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="river-map-legend">
                <span className="legend-item legend-high">High Water Level (&gt; 3.0m)</span>
                <span className="legend-item legend-normal">Normal Level</span>
                <span className="legend-item legend-low">Low Water Level (&lt; 1.0m)</span>
              </div>
              </div>
            </div>
          </div>

          <div className="river-map-right">
            <div className="panel-header">
              <h2 className="panel-title">Rivers List</h2>
            </div>

            <div className="panel-body">
              <div className="river-list">
                {displayedRivers.length === 0 ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No rivers found"
                  />
                ) : (
                  displayedRivers.map((river) => (
                    <button
                      key={river.id}
                      type="button"
                      className={
                        river.id === effectiveSelectedId
                          ? "river-item river-item-active"
                          : "river-item"
                      }
                      onClick={() => setSelectedId(river.id)}
                    >
                      <div className="river-item-main">
                        <div className="river-item-title">
                          <EnvironmentOutlined />
                          <span>{river.name}</span>
                        </div>
                        <span className="river-item-country">{river.country}</span>
                      </div>

                      <Tag color="blue" className="river-item-level">
                        {river.level.toFixed(2)} m
                      </Tag>
                    </button>
                  ))
                )}
              </div>
            </div>

            {selectedMajorName && (
              <div className="river-branches-card">
                <div className="panel-header">
                  <h2 className="panel-title">
                    Nhánh sông liên quan – {selectedMajorName}
                  </h2>
                </div>
                <div className="river-branches-list">
                  {relatedBranches.length === 0 ? (
                    <span className="river-branches-empty">Chưa có nhánh</span>
                  ) : (
                    relatedBranches.map((branch) => (
                      <button
                        key={branch.id}
                        type="button"
                        className={
                          branch.id === effectiveSelectedId
                            ? "river-branch-item river-branch-item-active"
                            : "river-branch-item"
                        }
                        onClick={() => setSelectedId(branch.id)}
                      >
                        <span className="river-branch-name">{branch.name}</span>
                        <span className="river-branch-meta">
                          {branch.country} · {branch.level.toFixed(2)} m
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="river-detail-card">
          <div className="river-detail-top">
            <div>
              <div className="river-detail-title">{selectedRiver.name}</div>
              <div className="river-detail-subtitle">
                {selectedRiver.region}
              </div>
            </div>
            <div className="river-detail-actions">
              <Button
                size="small"
                className="river-detail-more"
                onClick={() =>
                  navigate(
                    `/quality?river=${encodeURIComponent(selectedRiver.name)}`
                  )
                }
              >
                More detail
              </Button>
              <div className="river-detail-icon" aria-hidden="true">
                ∿
              </div>
            </div>
          </div>

          <div className="river-detail-level">
            <div className="river-detail-level-head">
              <div className="river-detail-level-label">Water Level</div>
              <div className="river-detail-level-value">
                {selectedRiver.level.toFixed(2)}m
              </div>
            </div>

            <div className="river-detail-level-bar">
              <div
                className="river-detail-level-bar-fill"
                style={{ width: `${levelPercent}%` }}
              />
            </div>

            <div className="river-detail-level-scale">
              <span>0m</span>
              <span>3.5m</span>
            </div>
          </div>

          <div className="river-detail-chart">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--rd-grid)" />
                <XAxis dataKey="hour" stroke="var(--rd-axis)" tickLine={false} />
                <YAxis
                  domain={[0, 3.5]}
                  stroke="var(--rd-axis)"
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--rd-tooltip-bg)",
                    border: "1px solid var(--rd-border)",
                    borderRadius: 10,
                    color: "var(--text-main)",
                  }}
                  labelStyle={{ color: "var(--text-muted)" }}
                />
                <Line
                  type="monotone"
                  dataKey="level"
                  stroke="var(--rd-line)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="river-detail-metrics">
            <div className="river-detail-metric">
              <div className="river-detail-metric-label">Temperature</div>
              <div className="river-detail-metric-value">
                {selectedRiver.temperature.toFixed(1)}°C
              </div>
            </div>
            <div className="river-detail-metric">
              <div className="river-detail-metric-label">pH Level</div>
              <div className="river-detail-metric-value">
                {selectedRiver.ph.toFixed(2)}
              </div>
            </div>
            <div className="river-detail-metric">
              <div className="river-detail-metric-label">Turbidity</div>
              <div className="river-detail-metric-value">
                {selectedRiver.turbidity.toFixed(1)} NTU
              </div>
            </div>
            <div className="river-detail-metric">
              <div className="river-detail-metric-label">Flow Rate</div>
              <div className="river-detail-metric-value">
                {selectedRiver.flow.toFixed(2)} m³/s
              </div>
            </div>
          </div>

          <div className="river-detail-updated">Updated: {updatedAt}</div>
        </div>
      </Content>

      <AppFooter />
    </Layout>
  );
}

export default RiverMap;

