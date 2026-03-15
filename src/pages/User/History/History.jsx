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
        const stationList = await getStations();
        setStations(Array.isArray(stationList) ? stationList : []);

        if (stationList?.length > 0) {
          const first = stationList[0];
          setSelectedStationId(first.stationId ?? first.id);
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
        const st = stations.find((s) => (s.stationId ?? s.id) === selectedStationId);
        const stationName = st?.stationName ?? st?.name ?? `Station ${selectedStationId}`;
        const rows = (Array.isArray(history) ? history : []).map((item) => ({
          key: item.observationId ?? item.id,
          date: (item.observedAt ?? item.timestamp) ? new Date(item.observedAt ?? item.timestamp).toLocaleString() : "-",
          station: stationName,
          metric: item.parameterName ?? item.parameterCode,
          value: `${item.value ?? "-"} ${item.unit || ""}`.trim(),
          quality: item.qualityFlag ?? "-",
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
              options={stations.map((s) => ({
                label: s.stationName ?? s.name ?? `Station ${s.stationId ?? s.id}`,
                value: s.stationId ?? s.id,
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
