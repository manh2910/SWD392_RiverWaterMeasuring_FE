import React, { useState, useMemo, useEffect } from "react";
import { Layout, Button, Tag, Input, Empty, Spin, message } from "antd";
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
import { getRivers, getRiverDetail } from "../../../api/riverApi";
import { getStations } from "../../../api/stationApi";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/** Icon định vị (pin vị trí) cho marker trên bản đồ */
const locationMarkerIcon = L.divIcon({
  className: "river-map-location-marker",
  html: `<span class="river-map-location-marker-inner" aria-hidden="true">
    <svg width="28" height="38" viewBox="0 0 28 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 24 14 24s14-13.5 14-24C28 6.268 21.732 0 14 0z" fill="#1890ff"/>
      <circle cx="14" cy="14" r="6" fill="#fff"/>
    </svg>
  </span>`,
  iconSize: [28, 38],
  iconAnchor: [14, 38],
  popupAnchor: [0, -38],
});

const { Content } = Layout;

const DEFAULT_CENTER = [21.0, 105.8];

const FILTERS = [
  { key: "all", label: "All Rivers" },
  { key: "major", label: "Major Rivers" },
  { key: "branch", label: "Branches" },
];

const MAP_ZOOM_SELECTED = 11;
const WATER_LEVEL_DANGER = 3.0;
const WATER_LEVEL_WARNING = 2.5;

function MapRecenter({ position }) {
  const map = useMap();

  React.useEffect(() => {
    if (!position) return;
    map.flyTo(position, MAP_ZOOM_SELECTED, { duration: 0.6 });
  }, [map, position]);

  return null;
}

function getParam(statusList, code) {
  const s = statusList?.find((x) => x.parameterCode === code);
  const v = s?.averageValue ?? s?.value;
  return v != null ? Number(v) : 0;
}

function RiverMap() {
  const navigate = useNavigate();
  const [riversData, setRiversData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");

  const majorRivers = useMemo(
    () => riversData.filter((r) => r.type === "major"),
    [riversData]
  );
  const branchesData = useMemo(
    () => riversData.filter((r) => r.type === "branch"),
    [riversData]
  );

  useEffect(() => {
    let cancelled = false;
    async function fetchRivers() {
      try {
        setLoading(true);
        const [list, stationsRes] = await Promise.all([
          getRivers(),
          getStations().catch(() => []),
        ]);
        if (cancelled) return;
        const stationList = Array.isArray(stationsRes?.data) ? stationsRes.data : Array.isArray(stationsRes) ? stationsRes : [];
        const positionByRiverId = {};
        stationList.forEach((s) => {
          const rid = s.riverId ?? s.riverID;
          const lat = s.latitude ?? s.lat;
          const lng = s.longitude ?? s.lng;
          if (rid != null && lat != null && lng != null && positionByRiverId[rid] == null) {
            positionByRiverId[rid] = [Number(lat), Number(lng)];
          }
        });
        const mapped = (list || []).map((r, index) => {
          const fromStation = positionByRiverId[r.riverId];
          const lat = r.latitude ?? fromStation?.[0] ?? DEFAULT_CENTER[0] + (index % 5) * 0.05;
          const lng = r.longitude ?? fromStation?.[1] ?? DEFAULT_CENTER[1] + (index % 5) * 0.05;
          return {
            id: r.riverId,
            name: r.riverName ?? r.name ?? "",
            country: r.country ?? "Việt Nam",
            region: r.region ?? "",
            level: 0,
            temperature: 0,
            ph: 0,
            turbidity: 0,
            flow: 0,
            type: r.riverType === "MAIN" || r.riverType === "main" ? "major" : "branch",
            parentId: r.parentRiverId ?? null,
            position: [Number(lat), Number(lng)],
          };
        });
        setRiversData(mapped);
        if (mapped.length > 0 && selectedId == null) {
          setSelectedId(mapped[0].id);
        }
      } catch (err) {
        if (!cancelled) {
          message.error("Không tải được danh sách sông.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchRivers();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (selectedId == null) {
      setSelectedDetail(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    getRiverDetail(selectedId)
      .then((detail) => {
        if (cancelled) return;
        const status = detail?.currentStatus ?? [];
        setSelectedDetail({
          level: getParam(status, "WL"),
          temperature: getParam(status, "TEMP") || getParam(status, "T"),
          ph: getParam(status, "PH"),
          turbidity: getParam(status, "TURB") || getParam(status, "TURBIDITY"),
          flow: getParam(status, "FLOW") || getParam(status, "Q"),
          waterLevelHistory: detail?.waterLevelHistory ?? [],
        });
      })
      .catch(() => {
        if (!cancelled) setSelectedDetail(null);
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedId]);

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
        r.name.toLowerCase().includes(q) ||
        (r.country && r.country.toLowerCase().includes(q)) ||
        (r.region && r.region.toLowerCase().includes(q))
    );
  }, [activeFilter, search, riversData, majorRivers, branchesData]);

  const effectiveSelectedId = useMemo(() => {
    if (selectedId != null && displayedRivers.some((r) => r.id === selectedId))
      return selectedId;
    return displayedRivers[0]?.id ?? null;
  }, [displayedRivers, selectedId]);

  const selectedMajorId = useMemo(() => {
    const r = riversData.find((x) => x.id === effectiveSelectedId);
    if (!r) return null;
    return r.type === "major" ? r.id : r.parentId;
  }, [effectiveSelectedId, riversData]);

  const relatedBranches = useMemo(() => {
    if (selectedMajorId == null) return [];
    return branchesData.filter((b) => b.parentId === selectedMajorId);
  }, [selectedMajorId, branchesData]);

  const selectedMajorName = useMemo(() => {
    if (selectedMajorId == null) return "";
    const m = majorRivers.find((x) => x.id === selectedMajorId);
    return m?.name ?? "";
  }, [selectedMajorId, majorRivers]);

  const selectedRiver = useMemo(() => {
    const r = riversData.find((r) => r.id === effectiveSelectedId);
    if (!r) return null;
    const d = selectedDetail;
    return {
      ...r,
      level: d?.level ?? r.level,
      temperature: d?.temperature ?? r.temperature,
      ph: d?.ph ?? r.ph,
      turbidity: d?.turbidity ?? r.turbidity,
      flow: d?.flow ?? r.flow,
    };
  }, [riversData, effectiveSelectedId, selectedDetail]);

  const chartData = useMemo(() => {
    const history = selectedDetail?.waterLevelHistory ?? [];
    if (history.length > 0) {
      return history.slice(-12).map((h, i) => ({
        hour: `${i}h`,
        level: Number(Number(h.value ?? h.averageValue ?? 0).toFixed(2)),
      }));
    }
    const base = selectedRiver?.level ?? 0;
    return Array.from({ length: 12 }, (_, i) => ({
      hour: `${i}h`,
      level: Number(Math.max(0, Math.min(3.5, base)).toFixed(2)),
    }));
  }, [selectedDetail, selectedRiver?.level]);

  const updatedAt = useMemo(() => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }, [selectedId]);

  const levelPercent = Math.max(
    0,
    Math.min(100, ((selectedRiver?.level ?? 0) / 3.5) * 100)
  );

  const levelStatus = useMemo(() => {
    const level = selectedRiver?.level ?? 0;
    if (level >= WATER_LEVEL_DANGER) {
      return { key: "danger", label: "NGUY HIEM", note: "Muc nuoc dang vuot nguong an toan." };
    }
    if (level >= WATER_LEVEL_WARNING) {
      return { key: "warning", label: "CANH BAO", note: "Muc nuoc dang cao, can theo doi sat." };
    }
    return { key: "normal", label: "AN TOAN", note: "Muc nuoc dang o muc binh thuong." };
  }, [selectedRiver?.level]);

  const mapCenter = selectedRiver?.position ?? DEFAULT_CENTER;

  if (loading) {
    return (
      <Layout style={{ minHeight: "100vh", background: "var(--page-bg)" }}>
        <AppHeader />
        <Content className="river-map-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
          <Spin size="large" tip="Đang tải bản đồ sông..." />
        </Content>
        <AppFooter />
      </Layout>
    );
  }

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
                  center={mapCenter}
                  zoom={riversData.length ? 3 : 5}
                  scrollWheelZoom
                  className="river-map-leaflet"
                >
                  <MapRecenter position={mapCenter} />
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />

                  {displayedRivers.map((river) => (
                    <Marker
                      key={river.id}
                      position={river.position}
                      icon={locationMarkerIcon}
                      eventHandlers={{
                        click: () => setSelectedId(river.id),
                      }}
                    >
                      <Popup>
                        <strong>{river.name}</strong>
                        <br />
                        {river.country}
                        <br />
                        Level: {(selectedDetail && river.id === effectiveSelectedId ? selectedDetail.level : river.level).toFixed(2)} m
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>

                {selectedRiver && (
                  <div className="river-map-info-card">
                    <div className="river-map-info-title">{selectedRiver.name}</div>
                    <div className={`river-level-badge river-level-badge-${levelStatus.key}`}>
                      {levelStatus.label}
                    </div>
                    <div className="river-map-info-row">{selectedRiver.region}</div>
                    <div className="river-map-info-row">
                      Mực nước: <strong>{(selectedRiver.level ?? 0).toFixed(2)} m</strong>
                    </div>
                    <div className="river-map-info-row">
                      Nhiệt độ: {(selectedRiver.temperature ?? 0).toFixed(1)}°C · pH: {(selectedRiver.ph ?? 0).toFixed(2)}
                    </div>
                  </div>
                )}
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
                        {(effectiveSelectedId === river.id && selectedDetail
                          ? selectedDetail.level
                          : river.level).toFixed(2)}{" "}
                        m
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
                          {branch.country} ·{" "}
                          {(effectiveSelectedId === branch.id && selectedDetail
                            ? selectedDetail.level
                            : branch.level).toFixed(2)}{" "}
                          m
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedRiver && (
          <div className="river-detail-card">
            {detailLoading ? (
              <div style={{ padding: 24, textAlign: "center" }}>
                <Spin tip="Đang tải chi tiết..." />
              </div>
            ) : (
              <>
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
                  <div className={`river-level-alert river-level-alert-${levelStatus.key}`}>
                    <strong>{levelStatus.label}</strong>: {levelStatus.note}
                  </div>
                  <div className="river-detail-level-head">
                    <div className="river-detail-level-label">Water Level</div>
                    <div className={`river-detail-level-value river-detail-level-value-${levelStatus.key}`}>
                      {(selectedRiver.level ?? 0).toFixed(2)}m
                    </div>
                  </div>

                  <div className="river-detail-level-bar">
                    <div
                      className={`river-detail-level-bar-fill river-detail-level-bar-fill-${levelStatus.key}`}
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
                      {(selectedRiver.temperature ?? 0).toFixed(1)}°C
                    </div>
                  </div>
                  <div className="river-detail-metric">
                    <div className="river-detail-metric-label">pH Level</div>
                    <div className="river-detail-metric-value">
                      {(selectedRiver.ph ?? 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="river-detail-metric">
                    <div className="river-detail-metric-label">Turbidity</div>
                    <div className="river-detail-metric-value">
                      {(selectedRiver.turbidity ?? 0).toFixed(1)} NTU
                    </div>
                  </div>
                  <div className="river-detail-metric">
                    <div className="river-detail-metric-label">Flow Rate</div>
                    <div className="river-detail-metric-value">
                      {(selectedRiver.flow ?? 0).toFixed(2)} m³/s
                    </div>
                  </div>
                </div>

                <div className="river-detail-updated">Updated: {updatedAt}</div>
              </>
            )}
          </div>
        )}
      </Content>

      <AppFooter />
    </Layout>
  );
}

export default RiverMap;

