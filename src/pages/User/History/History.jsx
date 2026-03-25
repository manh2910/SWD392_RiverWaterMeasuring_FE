import React, { useEffect, useMemo, useState } from "react";
import { Layout, Table, Card, Select, Tag, message } from "antd";
import AppHeader from "../../../components/User/Header/Header";
import AppFooter from "../../../components/User/Footer/Footer";
import { getAlertHistory } from "../../../api/alertHistoryApi";
import "./History.css";

const { Content } = Layout;

const toArray = (payload) =>
  Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.content)
      ? payload.content
      : Array.isArray(payload)
        ? payload
        : [];

const normalizeFlag = (value) => String(value || "").trim().toUpperCase();

const severityColor = (value) => {
  const v = normalizeFlag(value);
  if (v === "CRITICAL") return "red";
  if (v === "HIGH" || v === "WARNING") return "orange";
  if (v === "MEDIUM") return "gold";
  if (v === "LOW" || v === "INFO") return "blue";
  return "default";
};

export default function History() {
  const [data, setData] = useState([]);
  const [selectedRiver, setSelectedRiver] = useState("ALL");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAlertHistory = async () => {
      setLoading(true);
      try {
        const res = await getAlertHistory();
        const list = toArray(res);
        const rows = list.map((item, idx) => ({
          key: item.alertId ?? item.id ?? idx,
          riverName: item.riverName || "-",
          stationName: item.stationName || "-",
          parameterName: item.parameterName || item.parameterCode || "-",
          triggeredValue:
            item.triggeredValue ??
            "-",
          severity: normalizeFlag(item.severity || "-"),
          qualityFlag: normalizeFlag(
            item.qualityFlag ||
              "-"
          ),
        }));
        setData(rows);
      } catch (error) {
        console.error("LOAD ALERT HISTORY ERROR:", error);
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          message.error("Tài khoản hiện tại không có quyền xem lịch sử cảnh báo");
        } else {
          message.error("Không tải được lịch sử cảnh báo");
        }
      } finally {
        setLoading(false);
      }
    };

    loadAlertHistory();
  }, []);

  const riverOptions = useMemo(() => {
    const rivers = Array.from(new Set(data.map((d) => d.riverName).filter((x) => x && x !== "-")));
    return [
      { label: "Tất cả sông", value: "ALL" },
      ...rivers.map((name) => ({ label: name, value: name })),
    ];
  }, [data]);

  const filteredData = useMemo(() => {
    if (selectedRiver === "ALL") return data;
    return data.filter((row) => row.riverName === selectedRiver);
  }, [data, selectedRiver]);

  const columns = [
    { title: "Sông", dataIndex: "riverName", key: "riverName" },
    { title: "Trạm", dataIndex: "stationName", key: "stationName" },
    { title: "Thông số", dataIndex: "parameterName", key: "parameterName" },
    { title: "Giá trị vượt ngưỡng", dataIndex: "triggeredValue", key: "triggeredValue" },
    {
      title: "Mức độ",
      dataIndex: "severity",
      key: "severity",
      render: (value) => <Tag color={severityColor(value)}>{value || "-"}</Tag>,
    },
    {
      title: "Quality Flag",
      dataIndex: "qualityFlag",
      key: "qualityFlag",
      render: (value) => <Tag color={severityColor(value)}>{value || "-"}</Tag>,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader />
      <Content style={{ padding: "40px 60px", background: "#f5f7fa" }}>
        <Card
          title="Lịch sử cảnh báo"
          className="history-card"
          extra={
            <Select
              style={{ minWidth: 240 }}
              value={selectedRiver}
              onChange={setSelectedRiver}
              options={riverOptions}
            />
          }
        >
          <Table
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            rowKey="key"
            pagination={{ pageSize: 10, showSizeChanger: false }}
          />
        </Card>
      </Content>
      <AppFooter />
    </Layout>
  );
}
