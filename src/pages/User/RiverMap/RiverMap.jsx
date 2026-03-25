import React, { useState, useMemo, useEffect } from "react";
import { Layout, Button, Tag, Input, Empty, Spin, Select, message } from "antd";
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
import { getStations, getStationsMap } from "../../../api/stationApi";
import { getLatestObservations, getObservationHistory } from "../../../api/observationApi";

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

/** Mặc định nhìn cả Việt Nam — không dùng Hà Nội để tránh “nhảy” sai khi sông chưa có tọa độ */
const DEFAULT_CENTER = [16.1, 107.2];

function normalizeRiverLabel(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Ghép sông đang chọn với trạm trên map khi riverId lệch giữa API rivers vs stations/map */
function findMapStationForRiver(river, stations) {
  if (!river || !stations?.length) return null;
  const rid = river.id;
  let st = stations.find((s) => Number(s.riverId) === Number(rid));
  if (st) return st;
  st = stations.find((s) => String(s.riverId) === String(rid));
  if (st) return st;
  const rName = normalizeRiverLabel(river.name);
  if (!rName) return null;
  st = stations.find((s) => normalizeRiverLabel(s.riverName) === rName);
  if (st) return st;
  return (
    stations.find((s) => {
      const sn = normalizeRiverLabel(s.riverName);
      return sn && (rName.includes(sn) || sn.includes(rName));
    }) || null
  );
}

const FILTERS = [
  { key: "all", label: "All Rivers" },
  { key: "major", label: "Major Rivers" },
  { key: "branch", label: "Branches" },
];

const MAP_ZOOM_SELECTED = 11;
const WATER_LEVEL_DANGER = 3.0;
const WATER_LEVEL_WARNING = 2.5;

/** Màu marker theo waterLevelStatus (đồng bộ legend mực nước) */
const WATER_STATUS_COLORS = {
  LOW: "#1677ff",
  NORMAL: "#52c41a",
  CAUTION: "#fadb14",
  DANGER: "#fa8c16",
  CRITICAL: "#f5222d",
};

const PARAM_LABELS = {
  WL: "Mực nước (WL)",
  PH: "pH",
  DO: "DO",
  COND: "Độ dẫn điện (COND)",
  FV: "Tốc độ dòng (FV)",
};

/** Mực nước hiệu dụng: API đôi khi chỉ gửi trong latestValues.WL */
function effectiveWaterLevel(station) {
  const v = station?.waterLevel ?? station?.latestValues?.WL;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function statusColorFromWaterLevel(w) {
  if (!Number.isFinite(w)) return "#8c8c8c";
  if (w < 1.5) return WATER_STATUS_COLORS.LOW;
  if (w < 2.5) return WATER_STATUS_COLORS.NORMAL;
  if (w < 3.5) return WATER_STATUS_COLORS.CAUTION;
  if (w < 4.0) return WATER_STATUS_COLORS.DANGER;
  return WATER_STATUS_COLORS.CRITICAL;
}

function getStationMarkerColor(station) {
  const key = String(station?.waterLevelStatus || "").toUpperCase().trim();
  if (WATER_STATUS_COLORS[key]) return WATER_STATUS_COLORS[key];
  return statusColorFromWaterLevel(effectiveWaterLevel(station));
}

/** Marker “sông” khi không có trạm trên map: tô màu theo mực nước đang xem (chi tiết API) */
function getRiverOnlyPinColor(riverId, effectiveSelectedId, selectedDetail) {
  if (
    riverId === effectiveSelectedId &&
    selectedDetail &&
    Number.isFinite(Number(selectedDetail.level))
  ) {
    return statusColorFromWaterLevel(Number(selectedDetail.level));
  }
  return "#1890ff";
}

function createStationStatusIcon(color) {
  return L.divIcon({
    className: "river-map-station-marker",
    html: `<span class="river-map-station-marker-inner" aria-hidden="true">
    <svg width="28" height="38" viewBox="0 0 28 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 24 14 24s14-13.5 14-24C28 6.268 21.732 0 14 0z" fill="${color}"/>
      <circle cx="14" cy="14" r="6" fill="#fff"/>
    </svg>
  </span>`,
    iconSize: [28, 38],
    iconAnchor: [14, 38],
    popupAnchor: [0, -38],
  });
}

const stationIconByColor = {};
function getStationStatusIcon(color) {
  if (!stationIconByColor[color]) {
    stationIconByColor[color] = createStationStatusIcon(color);
  }
  return stationIconByColor[color];
}

function waterStatusTagColor(status) {
  const k = String(status || "").toUpperCase();
  if (k === "LOW") return "blue";
  if (k === "NORMAL") return "success";
  if (k === "CAUTION") return "gold";
  if (k === "DANGER") return "orange";
  if (k === "CRITICAL") return "red";
  return "default";
}

/** Khi API không gửi waterLevelStatus nhưng có mực nước số */
function inferStatusFromWaterLevel(w) {
  if (!Number.isFinite(w)) return null;
  if (w < 1.5) return "LOW";
  if (w < 2.5) return "NORMAL";
  if (w < 3.5) return "CAUTION";
  if (w < 4.0) return "DANGER";
  return "CRITICAL";
}

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

const toArray = (payload) =>
  Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.content)
      ? payload.content
      : Array.isArray(payload)
        ? payload
        : [];

const normalizeObservation = (row) => ({
  parameterCode: String(row?.parameterCode || row?.code || "").toUpperCase(),
  value: Number(row?.value ?? row?.averageValue ?? row?.latestValue ?? NaN),
  observedAt: row?.observedAt || row?.timestamp || row?.createdAt || row?.time || null,
});

function RiverMap() {
  const navigate = useNavigate();
  const [riversData, setRiversData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [mapStations, setMapStations] = useState([]);
  const [selectedRiverFilterId, setSelectedRiverFilterId] = useState(null);
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [stationLatestByCode, setStationLatestByCode] = useState({});
  const [stationHistoryRows, setStationHistoryRows] = useState([]);

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
        const [list, stationsRes, mapRes] = await Promise.all([
          getRivers(),
          getStations().catch(() => []),
          getStationsMap().catch(() => []),
        ]);
        if (cancelled) return;
        const mapPayload = mapRes?.data ?? mapRes;
        const mapList = Array.isArray(mapPayload) ? mapPayload : [];
        setMapStations(
          mapList.filter((s) => {
            const lat = Number(s?.latitude);
            const lng = Number(s?.longitude);
            return Number.isFinite(lat) && Number.isFinite(lng) && s?.isActive !== false;
          })
        );

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
        const mapped = (list || []).map((r) => {
          const fromStation = positionByRiverId[r.riverId];
          const hasRiverCoords =
            r.latitude != null &&
            r.longitude != null &&
            Number.isFinite(Number(r.latitude)) &&
            Number.isFinite(Number(r.longitude));
          const positionReliable = hasRiverCoords || Boolean(fromStation);
          let position = null;
          if (hasRiverCoords) {
            position = [Number(r.latitude), Number(r.longitude)];
          } else if (fromStation) {
            position = [fromStation[0], fromStation[1]];
          }
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
            position,
            positionReliable,
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

  const stationWithResolvedRiver = useMemo(() => {
    return mapStations.map((s) => {
      const rid = s?.riverId ?? s?.riverID;
      if (rid != null && Number.isFinite(Number(rid))) {
        return { ...s, _resolvedRiverId: Number(rid) };
      }
      const byName = riversData.find((r) => {
        const rn = normalizeRiverLabel(r.name);
        const sn = normalizeRiverLabel(s.riverName);
        return rn && sn && (rn === sn || rn.includes(sn) || sn.includes(rn));
      });
      return { ...s, _resolvedRiverId: byName?.id ?? null };
    });
  }, [mapStations, riversData]);

  const selectedStation = useMemo(
    () =>
      stationWithResolvedRiver.find((s) => Number(s.stationId) === Number(selectedStationId)) ?? null,
    [stationWithResolvedRiver, selectedStationId]
  );

  const focusedRiverId = selectedStation?._resolvedRiverId ?? selectedRiverFilterId ?? null;

  const focusedRivers = useMemo(() => {
    if (focusedRiverId == null) return displayedRivers;
    return displayedRivers.filter((r) => Number(r.id) === Number(focusedRiverId));
  }, [displayedRivers, focusedRiverId]);

  const focusedStations = useMemo(() => {
    if (selectedStationId != null) {
      return stationWithResolvedRiver.filter((s) => Number(s.stationId) === Number(selectedStationId));
    }
    if (focusedRiverId != null) {
      return stationWithResolvedRiver.filter((s) => Number(s._resolvedRiverId) === Number(focusedRiverId));
    }
    return [];
  }, [stationWithResolvedRiver, focusedRiverId, selectedStationId]);

  const effectiveSelectedId = useMemo(() => {
    if (selectedId != null && focusedRivers.some((r) => r.id === selectedId))
      return selectedId;
    return focusedRivers[0]?.id ?? null;
  }, [focusedRivers, selectedId]);

  /** Sông đã có trạm trên map (theo riverId hoặc tên sông khớp với trạm — tránh lệch id giữa API) */
  const riverIdsWithMapStations = useMemo(() => {
    const set = new Set();
    mapStations.forEach((s) => {
      const rid = s?.riverId ?? s?.riverID;
      if (rid != null && Number.isFinite(Number(rid))) set.add(Number(rid));
      const sn = normalizeRiverLabel(s.riverName);
      if (!sn || sn.length < 3) return;
      riversData.forEach((r) => {
        const rn = normalizeRiverLabel(r.name);
        if (!rn) return;
        if (sn === rn || rn.includes(sn) || sn.includes(rn)) set.add(Number(r.id));
      });
    });
    return set;
  }, [mapStations, riversData]);

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

  const selectedStationMetrics = useMemo(() => {
    if (!selectedStation) return null;
    const latestFromMap =
      selectedStation.latestValues && typeof selectedStation.latestValues === "object"
        ? selectedStation.latestValues
        : {};
    const wlFromObs = stationLatestByCode.WL?.value;
    const wl = Number.isFinite(wlFromObs) ? wlFromObs : effectiveWaterLevel(selectedStation);
    const tempFromObs = stationLatestByCode.TEMP?.value ?? stationLatestByCode.T?.value;
    const phFromObs = stationLatestByCode.PH?.value;
    const turbFromObs =
      stationLatestByCode.COND?.value ??
      stationLatestByCode.TURB?.value ??
      stationLatestByCode.TURBIDITY?.value;
    const flowFromObs =
      stationLatestByCode.FV?.value ??
      stationLatestByCode.FLOW?.value ??
      stationLatestByCode.Q?.value;
    const latestObservedAt = Object.values(stationLatestByCode)
      .map((x) => x?.observedAt)
      .find(Boolean);
    return {
      title: selectedStation.stationName || `Trạm ${selectedStation.stationId}`,
      subtitle: selectedStation.riverName || "—",
      riverName: selectedStation.riverName || "",
      level: Number.isFinite(wl) ? wl : 0,
      ph: Number(phFromObs ?? latestFromMap.PH ?? 0),
      doValue: Number(stationLatestByCode.DO?.value ?? latestFromMap.DO ?? 0),
      cond: Number(turbFromObs ?? latestFromMap.COND ?? 0),
      fv: Number(flowFromObs ?? latestFromMap.FV ?? 0),
      updatedAt: latestObservedAt
        ? String(latestObservedAt).replace("T", " ").slice(0, 19)
        : selectedStation.lastUpdatedAt
          ? String(selectedStation.lastUpdatedAt).replace("T", " ").slice(0, 19)
          : null,
    };
  }, [selectedStation, stationLatestByCode]);

  const detailTarget = useMemo(() => {
    if (selectedStationMetrics) return selectedStationMetrics;
    if (!selectedRiver) return null;
    return {
      title: selectedRiver.name,
      subtitle: selectedRiver.region || selectedRiver.country || "-",
      riverName: selectedRiver.name,
      level: Number(selectedRiver.level ?? 0),
      ph: Number(selectedRiver.ph ?? 0),
      doValue: Number(selectedRiver.doValue ?? 0),
      cond: Number(selectedRiver.turbidity ?? 0),
      fv: Number(selectedRiver.flow ?? 0),
      updatedAt: null,
    };
  }, [selectedStationMetrics, selectedRiver]);

  const chartData = useMemo(() => {
    if (selectedStationId && stationHistoryRows.length > 0) {
      const wlRows = stationHistoryRows
        .filter((row) => row.parameterCode === "WL" && Number.isFinite(row.value))
        .slice(0, 12)
        .reverse();

      if (wlRows.length > 0) {
        return wlRows.map((row, idx) => ({
          hour: row.observedAt ? String(row.observedAt).slice(11, 16) : `${idx}h`,
          level: Number(Number(row.value).toFixed(2)),
        }));
      }
    }

    const history = selectedDetail?.waterLevelHistory ?? [];
    if (history.length > 0) {
      return history.slice(-12).map((h, i) => ({
        hour: `${i}h`,
        level: Number(Number(h.value ?? h.averageValue ?? 0).toFixed(2)),
      }));
    }
    const base = detailTarget?.level ?? 0;
    return Array.from({ length: 12 }, (_, i) => ({
      hour: `${i}h`,
      level: Number(Math.max(0, Math.min(3.5, base)).toFixed(2)),
    }));
  }, [selectedStationId, stationHistoryRows, selectedDetail, detailTarget?.level]);

  const updatedAt = useMemo(() => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }, [selectedId]);

  const levelPercent = Math.max(
    0,
    Math.min(100, ((detailTarget?.level ?? 0) / 3.5) * 100)
  );

  const levelStatus = useMemo(() => {
    const level = detailTarget?.level ?? 0;
    if (level >= WATER_LEVEL_DANGER) {
      return { key: "danger", label: "NGUY HIEM", note: "Muc nuoc dang vuot nguong an toan." };
    }
    if (level >= WATER_LEVEL_WARNING) {
      return { key: "warning", label: "CANH BAO", note: "Muc nuoc dang cao, can theo doi sat." };
    }
    return { key: "normal", label: "AN TOAN", note: "Muc nuoc dang o muc binh thuong." };
  }, [detailTarget?.level]);

  const mapCenter = useMemo(() => {
    if (selectedStation) {
      const lat = Number(selectedStation.latitude);
      const lng = Number(selectedStation.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
    }
    if (!selectedRiver) return DEFAULT_CENTER;
    if (selectedRiver.positionReliable && selectedRiver.position?.length === 2) {
      return selectedRiver.position;
    }
    const st = findMapStationForRiver(selectedRiver, mapStations);
    if (st) {
      const lat = Number(st.latitude);
      const lng = Number(st.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
    }
    return DEFAULT_CENTER;
  }, [selectedRiver, mapStations, selectedStation]);

  const riverSelectOptions = useMemo(
    () => riversData.map((r) => ({ value: Number(r.id), label: r.name })),
    [riversData]
  );

  const stationSelectOptions = useMemo(() => {
    const list =
      selectedRiverFilterId != null
        ? stationWithResolvedRiver.filter((s) => Number(s._resolvedRiverId) === Number(selectedRiverFilterId))
        : stationWithResolvedRiver;
    return list.map((s) => ({
      value: Number(s.stationId),
      label: `${s.stationName || `Trạm ${s.stationId}`}${s.riverName ? ` - ${s.riverName}` : ""}`,
    }));
  }, [selectedRiverFilterId, stationWithResolvedRiver]);

  useEffect(() => {
    if (selectedRiverFilterId != null) {
      setSelectedId(Number(selectedRiverFilterId));
    }
  }, [selectedRiverFilterId]);

  useEffect(() => {
    if (!selectedStation) return;
    if (selectedStation._resolvedRiverId != null) {
      setSelectedId(Number(selectedStation._resolvedRiverId));
      setSelectedRiverFilterId(Number(selectedStation._resolvedRiverId));
    }
  }, [selectedStation]);

  useEffect(() => {
    let cancelled = false;

    async function loadStationObservations() {
      if (!selectedStationId) {
        setStationLatestByCode({});
        setStationHistoryRows([]);
        return;
      }

      try {
        const [latestRes, historyRes] = await Promise.all([
          getLatestObservations(selectedStationId).catch(() => []),
          getObservationHistory(selectedStationId, {
            page: 0,
            size: 120,
            sort: "observedAt,desc",
          }).catch(() => []),
        ]);

        if (cancelled) return;

        const latestRows = toArray(latestRes).map(normalizeObservation);
        const latestMap = {};
        latestRows.forEach((row) => {
          if (!row.parameterCode || !Number.isFinite(row.value)) return;
          latestMap[row.parameterCode] = {
            value: row.value,
            observedAt: row.observedAt,
          };
        });
        setStationLatestByCode(latestMap);

        const historyRows = toArray(historyRes).map(normalizeObservation);
        setStationHistoryRows(historyRows);
      } catch {
        if (!cancelled) {
          setStationLatestByCode({});
          setStationHistoryRows([]);
        }
      }
    }

    loadStationObservations();
    return () => {
      cancelled = true;
    };
  }, [selectedStationId]);

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

        <div className="river-map-selectors">
          <Select
            allowClear
            placeholder="Chọn sông"
            className="river-map-select"
            value={selectedRiverFilterId}
            options={riverSelectOptions}
            onChange={(value) => {
              setSelectedRiverFilterId(value ?? null);
              setSelectedStationId(null);
            }}
          />
          <Select
            allowClear
            placeholder="Chọn trạm"
            className="river-map-select"
            value={selectedStationId}
            options={stationSelectOptions}
            onChange={(value) => setSelectedStationId(value ?? null)}
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

                  {focusedRivers
                    .filter(
                      (river) =>
                        river.positionReliable &&
                        river.position &&
                        !riverIdsWithMapStations.has(Number(river.id))
                    )
                    .map((river) => {
                      const pinColor = getRiverOnlyPinColor(
                        river.id,
                        effectiveSelectedId,
                        selectedDetail
                      );
                      return (
                        <Marker
                          key={river.id}
                          position={river.position}
                          icon={
                            pinColor === "#1890ff"
                              ? locationMarkerIcon
                              : getStationStatusIcon(pinColor)
                          }
                          eventHandlers={{
                            click: () => setSelectedId(river.id),
                          }}
                        >
                          <Popup>
                            <strong>{river.name}</strong>
                            <br />
                            {river.country}
                            <br />
                            Level:{" "}
                            {(selectedDetail && river.id === effectiveSelectedId
                              ? selectedDetail.level
                              : river.level
                            ).toFixed(2)}{" "}
                            m
                          </Popup>
                        </Marker>
                      );
                    })}

                  {focusedStations.map((s) => {
                    const lat = Number(s.latitude);
                    const lng = Number(s.longitude);
                    const color = getStationMarkerColor(s);
                    const wl = effectiveWaterLevel(s);
                    const statusLabel =
                      s.waterLevelStatus ?? inferStatusFromWaterLevel(wl) ?? "—";
                    const latest = s.latestValues && typeof s.latestValues === "object" ? s.latestValues : {};
                    return (
                      <Marker
                        key={`station-${s.stationId}`}
                        position={[lat, lng]}
                        icon={getStationStatusIcon(color)}
                      >
                        <Popup>
                          <div className="river-map-station-popup">
                            <div className="river-map-station-popup-title">{s.stationName}</div>
                            {s.stationCode ? (
                              <div className="river-map-station-popup-meta">{s.stationCode}</div>
                            ) : null}
                            <div className="river-map-station-popup-row">
                              <span>Sông</span>
                              <strong>{s.riverName ?? "—"}</strong>
                            </div>
                            <div className="river-map-station-popup-row">
                              <span>Mực nước</span>
                              <strong>
                                {Number.isFinite(wl) ? `${wl.toFixed(2)} m` : "—"}
                              </strong>
                            </div>
                            <div className="river-map-station-popup-row">
                              <span>Trạng thái</span>
                              <Tag color={waterStatusTagColor(statusLabel)}>
                                {statusLabel}
                              </Tag>
                            </div>
                            {s.lastUpdatedAt ? (
                              <div className="river-map-station-popup-time">
                                Cập nhật: {String(s.lastUpdatedAt).replace("T", " ").slice(0, 19)}
                              </div>
                            ) : null}
                            <div className="river-map-station-popup-values-head">Giá trị gần nhất</div>
                            <ul className="river-map-station-popup-values">
                              {Object.keys(latest).length === 0 ? (
                                <li>Chưa có dữ liệu</li>
                              ) : (
                                Object.entries(latest).map(([code, val]) => (
                                  <li key={code}>
                                    <span>{PARAM_LABELS[code] ?? code}</span>
                                    <span>{val != null ? Number(val).toFixed(2) : "—"}</span>
                                  </li>
                                ))
                              )}
                            </ul>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>

                {detailTarget && (
                  <div className="river-map-info-card">
                    <div className="river-map-info-title">{detailTarget.title}</div>
                    <div className="river-map-info-row">{detailTarget.subtitle}</div>
                    <div className="river-map-info-row">
                      Mực nước: <strong>{(detailTarget.level ?? 0).toFixed(2)} m</strong>
                    </div>
                    <div className="river-map-info-row">
                      pH: {(detailTarget.ph ?? 0).toFixed(2)} · DO: {(detailTarget.doValue ?? 0).toFixed(2)} mg/L
                    </div>
                  </div>
                )}
              </div>

              <div className="river-map-legend river-map-legend-stations">
                <span className="legend-caption">Trạm đo (mực nước)</span>
                <span className="legend-item legend-wl-low">&lt; 1.5m · Thấp (LOW)</span>
                <span className="legend-item legend-wl-normal">1.5–2.5m · Bình thường</span>
                <span className="legend-item legend-wl-caution">2.5–3.5m · Cảnh báo</span>
                <span className="legend-item legend-wl-danger">3.5–4.0m · Nguy hiểm</span>
                <span className="legend-item legend-wl-critical">≥ 4.0m · Rất nghiêm trọng</span>
              </div>
              </div>
            </div>
          </div>

          <div className="river-map-right">
            <div className="river-branches-card">
              <div className="panel-header">
                <h2 className="panel-title">Chọn sông</h2>
              </div>
              <div className="panel-body">
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder="Chọn sông"
                  className="river-map-select river-map-select-full"
                  value={selectedRiverFilterId}
                  options={riverSelectOptions}
                  onChange={(value) => {
                    setSelectedRiverFilterId(value ?? null);
                    setSelectedStationId(null);
                  }}
                />
              </div>
            </div>

            <div className="river-branches-card">
              <div className="panel-header">
                <h2 className="panel-title">
                  Chọn trạm {focusedRiverId != null ? `- ${selectedRiver?.name || ""}` : ""}
                </h2>
              </div>
              <div className="panel-body">
                <Select
                  showSearch
                  optionFilterProp="label"
                  disabled={focusedRiverId == null}
                  placeholder={focusedRiverId == null ? "Vui lòng chọn sông trước" : "Chọn trạm"}
                  className="river-map-select river-map-select-full"
                  value={selectedStationId}
                  options={stationSelectOptions}
                  onChange={(value) => setSelectedStationId(value ?? null)}
                />

                {selectedStation ? (
                  <div className="river-map-selected-station">
                    <strong>{selectedStation.stationName || `Trạm ${selectedStation.stationId}`}</strong>
                    <div>
                      {selectedStation.riverName || "-"} ·{" "}
                      {Number.isFinite(effectiveWaterLevel(selectedStation))
                        ? effectiveWaterLevel(selectedStation).toFixed(2)
                        : "0.00"}{" "}
                      m
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {detailTarget && (
          <div className="river-detail-card">
            {detailLoading ? (
              <div style={{ padding: 24, textAlign: "center" }}>
                <Spin tip="Đang tải chi tiết..." />
              </div>
            ) : (
              <>
                <div className="river-detail-top">
                  <div>
                    <div className="river-detail-title">{detailTarget.title}</div>
                    <div className="river-detail-subtitle">
                      {detailTarget.subtitle}
                    </div>
                  </div>
                  <div className="river-detail-actions">
                    <Button
                      size="small"
                      className="river-detail-more"
                      onClick={() =>
                        navigate(
                          `/quality?river=${encodeURIComponent(detailTarget.riverName || "")}`
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
                      {(detailTarget.level ?? 0).toFixed(2)}m
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
                    <div className="river-detail-metric-label">Độ pH (PH)</div>
                    <div className="river-detail-metric-value">
                      {(detailTarget.ph ?? 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="river-detail-metric">
                    <div className="river-detail-metric-label">Oxy hoà tan (DO)</div>
                    <div className="river-detail-metric-value">
                      {(detailTarget.doValue ?? 0).toFixed(2)} mg/L
                    </div>
                  </div>
                  <div className="river-detail-metric">
                    <div className="river-detail-metric-label">Độ dẫn điện/độ mặn (COND)</div>
                    <div className="river-detail-metric-value">
                      {(detailTarget.cond ?? 0).toFixed(2)} µS/cm
                    </div>
                  </div>
                  <div className="river-detail-metric">
                    <div className="river-detail-metric-label">Vận tốc dòng chảy (FV)</div>
                    <div className="river-detail-metric-value">
                      {(detailTarget.fv ?? 0).toFixed(2)} m/s
                    </div>
                  </div>
                </div>

                <div className="river-detail-updated">Updated: {detailTarget.updatedAt || updatedAt}</div>
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

