import React, { useState, useEffect, useMemo } from "react";
import { Select, Tag, Spin, Empty } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./AdminMap.css";

import { getRivers } from "../../../api/riverApi";
import { getStations, getStationsMap } from "../../../api/stationApi";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_CENTER = [16.1, 107.2];
const DEFAULT_ZOOM = 5;
const ZOOM_SELECTED = 11;

const WATER_STATUS_COLORS = {
  LOW: "#1677ff",
  NORMAL: "#52c41a",
  CAUTION: "#fadb14",
  DANGER: "#fa8c16",
  CRITICAL: "#f5222d",
};

const PARAM_LABELS = {
  WL: "Mực nước",
  PH: "pH",
  DO: "DO",
  COND: "Độ dẫn điện",
  FV: "Tốc độ dòng",
};

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

function inferStatusFromWaterLevel(w) {
  if (!Number.isFinite(w)) return null;
  if (w < 1.5) return "LOW";
  if (w < 2.5) return "NORMAL";
  if (w < 3.5) return "CAUTION";
  if (w < 4.0) return "DANGER";
  return "CRITICAL";
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

function createStationIcon(color) {
  return L.divIcon({
    className: "admin-map-station-marker",
    html: `<span class="admin-map-station-marker-inner" aria-hidden="true">
      <svg width="26" height="36" viewBox="0 0 28 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 24 14 24s14-13.5 14-24C28 6.268 21.732 0 14 0z" fill="${color}"/>
        <circle cx="14" cy="14" r="6" fill="#fff"/>
      </svg>
    </span>`,
    iconSize: [26, 36],
    iconAnchor: [13, 36],
    popupAnchor: [0, -36],
  });
}

const iconCache = {};
function getCachedIcon(color) {
  if (!iconCache[color]) iconCache[color] = createStationIcon(color);
  return iconCache[color];
}

function normalizeLabel(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function MapFlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (!position) return;
    map.flyTo(position, ZOOM_SELECTED, { duration: 0.6 });
  }, [map, position]);
  return null;
}

export default function AdminMap() {
  const [rivers, setRivers] = useState([]);
  const [mapStations, setMapStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRiverId, setSelectedRiverId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const [riverList, stationsRes, mapRes] = await Promise.all([
          getRivers().catch(() => []),
          getStations().catch(() => []),
          getStationsMap().catch(() => []),
        ]);
        if (cancelled) return;

        const mapPayload = mapRes?.data ?? mapRes;
        const mapList = Array.isArray(mapPayload) ? mapPayload : [];
        const validStations = mapList.filter((s) => {
          const lat = Number(s?.latitude);
          const lng = Number(s?.longitude);
          return Number.isFinite(lat) && Number.isFinite(lng) && s?.isActive !== false;
        });
        setMapStations(validStations);

        const stationList = Array.isArray(stationsRes?.data)
          ? stationsRes.data
          : Array.isArray(stationsRes)
          ? stationsRes
          : [];
        const positionByRiverId = {};
        stationList.forEach((s) => {
          const rid = s.riverId ?? s.riverID;
          const lat = Number(s.latitude ?? s.lat);
          const lng = Number(s.longitude ?? s.lng);
          if (rid != null && Number.isFinite(lat) && Number.isFinite(lng) && !positionByRiverId[rid]) {
            positionByRiverId[rid] = [lat, lng];
          }
        });

        const raw = Array.isArray(riverList) ? riverList : riverList?.data ?? [];
        const normalized = raw.map((r) => {
          const rid = r.riverId ?? r.id;
          const hasCoords =
            r.latitude != null &&
            r.longitude != null &&
            Number.isFinite(Number(r.latitude)) &&
            Number.isFinite(Number(r.longitude));
          const fromStation = positionByRiverId[rid];
          return {
            id: rid,
            name: r.riverName ?? r.name ?? "",
            position:
              hasCoords
                ? [Number(r.latitude), Number(r.longitude)]
                : fromStation ?? null,
          };
        });

        setRivers(normalized);
        if (normalized.length > 0) setSelectedRiverId(normalized[0].id);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const selectedRiver = useMemo(
    () => rivers.find((r) => r.id === selectedRiverId) ?? null,
    [rivers, selectedRiverId]
  );

  const visibleStations = useMemo(() => {
    if (!selectedRiverId) return mapStations;
    return mapStations.filter((s) => {
      const rid = s.riverId ?? s.riverID;
      if (rid != null && Number(rid) === Number(selectedRiverId)) return true;
      const rn = normalizeLabel(s.riverName);
      const sel = rivers.find((r) => r.id === selectedRiverId);
      if (!sel) return false;
      const sn = normalizeLabel(sel.name);
      return rn && sn && (rn === sn || rn.includes(sn) || sn.includes(rn));
    });
  }, [selectedRiverId, mapStations, rivers]);

  const flyTarget = useMemo(() => {
    if (!selectedRiver) return null;
    if (selectedRiver.position) return selectedRiver.position;
    const st = visibleStations[0];
    if (st) {
      const lat = Number(st.latitude);
      const lng = Number(st.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
    }
    return null;
  }, [selectedRiver, visibleStations]);

  const selectOptions = useMemo(
    () =>
      rivers.map((r) => ({
        value: r.id,
        label: r.name || `River #${r.id}`,
      })),
    [rivers]
  );

  return (
    <div className="admin-map-root">
      {/* Toolbar */}
      <div className="admin-map-toolbar">
        <EnvironmentOutlined className="admin-map-toolbar-icon" />
        <span className="admin-map-toolbar-label">Select River:</span>
        <Select
          className="admin-map-river-select"
          options={selectOptions}
          value={selectedRiverId}
          onChange={(val) => setSelectedRiverId(val)}
          placeholder="Select a river..."
          showSearch
          filterOption={(input, opt) =>
            String(opt?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
        />
        {selectedRiver && (
          <span className="admin-map-river-name">{selectedRiver.name}</span>
        )}
      </div>

      {/* Map */}
      <div className="admin-map-map-wrap">
        {loading ? (
          <div className="admin-map-loading">
            <Spin tip="Loading map..." />
          </div>
        ) : (
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            scrollWheelZoom
            className="admin-map-leaflet"
          >
            <MapFlyTo position={flyTarget} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {visibleStations.map((s) => {
              const lat = Number(s.latitude);
              const lng = Number(s.longitude);
              const color = getStationMarkerColor(s);
              const wl = effectiveWaterLevel(s);
              const statusLabel =
                s.waterLevelStatus ?? inferStatusFromWaterLevel(wl) ?? "—";
              const latest =
                s.latestValues && typeof s.latestValues === "object"
                  ? s.latestValues
                  : {};

              return (
                <Marker
                  key={`station-${s.stationId}`}
                  position={[lat, lng]}
                  icon={getCachedIcon(color)}
                >
                  <Popup>
                    <div className="admin-map-popup">
                      <div className="admin-map-popup-title">{s.stationName}</div>
                      {s.stationCode && (
                        <div className="admin-map-popup-meta">{s.stationCode}</div>
                      )}
                      <div className="admin-map-popup-row">
                        <span>River</span>
                        <strong>{s.riverName ?? "—"}</strong>
                      </div>
                      <div className="admin-map-popup-row">
                        <span>Water Level</span>
                        <strong>
                          {Number.isFinite(wl) ? `${wl.toFixed(2)} m` : "—"}
                        </strong>
                      </div>
                      <div className="admin-map-popup-row">
                        <span>Status</span>
                        <Tag color={waterStatusTagColor(statusLabel)}>
                          {statusLabel}
                        </Tag>
                      </div>
                      {s.lastUpdatedAt && (
                        <div className="admin-map-popup-time">
                          Updated: {String(s.lastUpdatedAt).replace("T", " ").slice(0, 19)}
                        </div>
                      )}
                      <div className="admin-map-popup-values-head">Latest Readings</div>
                      <ul className="admin-map-popup-values">
                        {Object.keys(latest).length === 0 ? (
                          <li>No data available</li>
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

            {visibleStations.length === 0 && !loading && selectedRiver?.position && (
              <Marker position={selectedRiver.position} icon={getCachedIcon("#1890ff")}>
                <Popup>
                  <strong>{selectedRiver.name}</strong>
                  <br />
                  No stations with coordinates.
                </Popup>
              </Marker>
            )}
          </MapContainer>
        )}

        {!loading && visibleStations.length === 0 && !selectedRiver?.position && (
          <div className="admin-map-empty-overlay">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No stations with coordinates for this river"
            />
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="admin-map-legend">
        <span className="admin-map-legend-title">Station Water Level:</span>
        <span className="admin-map-legend-item admin-map-legend-low">&lt;1.5m Low</span>
        <span className="admin-map-legend-item admin-map-legend-normal">1.5–2.5m Normal</span>
        <span className="admin-map-legend-item admin-map-legend-caution">2.5–3.5m Caution</span>
        <span className="admin-map-legend-item admin-map-legend-danger">3.5–4.0m Danger</span>
        <span className="admin-map-legend-item admin-map-legend-critical">≥4.0m Critical</span>
      </div>
    </div>
  );
}
