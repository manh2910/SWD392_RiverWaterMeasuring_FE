import React, { useState, useEffect } from "react";
import { Layout, Table, Card, Select, message } from "antd";
import AppHeader from "../../../components/User/Header/Header";
import AppFooter from "../../../components/User/Footer/Footer";
import { getStations } from "../../../api/stationApi";
import { getObservationHistory } from "../../../api/observationApi";
import "./History.css";

const { Content } = Layout;

export default function History() {
  const [data, setData] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState(null);
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
      } catch (error) {
        console.error("LOAD STATIONS ERROR:", error);
        message.error("Failed to load stations");
      }
    };

    loadStations();
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      if (!selectedStationId) {
        return;
      }

      setLoading(true);

      try {
        const history = await getObservationHistory(selectedStationId);
        const rows = (Array.isArray(history) ? history : []).map((item) => ({
          key: item.observationId,
          date: item.observedAt ? new Date(item.observedAt).toLocaleString() : "-",
          station: stations.find((s) => s.stationId === selectedStationId)?.stationName || `Station ${selectedStationId}`,
          metric: item.parameterName || item.parameterCode,
          value: `${item.value ?? "-"} ${item.unit || ""}`.trim(),
          quality: item.qualityFlag || "-",
        }));

        setData(rows);
      } catch (error) {
        console.error("LOAD HISTORY ERROR:", error);
        message.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [selectedStationId, stations]);

  const columns = [
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Station", dataIndex: "station", key: "station" },
    { title: "Metric", dataIndex: "metric", key: "metric" },
    { title: "Value", dataIndex: "value", key: "value" },
    { title: "Quality", dataIndex: "quality", key: "quality" },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader />
      <Content style={{ padding: "40px 60px", background: "#f5f7fa" }}>
        <Card
          title="History"
          className="history-card"
          extra={
            <Select
              style={{ minWidth: 220 }}
              value={selectedStationId}
              onChange={setSelectedStationId}
              placeholder="Select station"
              options={stations.map((station) => ({
                label: station.stationName,
                value: station.stationId,
              }))}
            />
          }
        >
          <Table columns={columns} dataSource={data} loading={loading} />
        </Card>
      </Content>
      <AppFooter />
    </Layout>
  );
}
