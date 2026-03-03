import React, { useState, useEffect } from "react";
import { Layout, Table, Card } from "antd";
import AppHeader from "../../../components/User/Header/Header";
import AppFooter from "../../../components/User/Footer/Footer";
import "./History.css";

const { Content } = Layout;

const mockHistory = [
  { key: 1, date: "2026-02-25", river: "Amazon River", metric: "pH", value: 7.2 },
  { key: 2, date: "2026-02-25", river: "Nile River", metric: "Turbidity", value: 52.1 },
  { key: 3, date: "2026-02-26", river: "Yangtze River", metric: "Temperature", value: 24.9 },
];

export default function History() {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(mockHistory);
  }, []);

  const columns = [
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "River", dataIndex: "river", key: "river" },
    { title: "Metric", dataIndex: "metric", key: "metric" },
    { title: "Value", dataIndex: "value", key: "value" },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader />
      <Content style={{ padding: "40px 60px", background: "#f5f7fa" }}>
        <Card title="History" className="history-card">
          <Table columns={columns} dataSource={data} />
        </Card>
      </Content>
      <AppFooter />
    </Layout>
  );
}
