import React, { useEffect, useState, useMemo } from "react";
import { Layout } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import "./WaterAnalytics.css";
import AppHeader from "../../../components/User/Header/Header";
import AppFooter from "../../../components/User/Footer/Footer";

const { Content } = Layout;

const WaterAnalytics = () => {
  const [data, setData] = useState([]);

  // ===== MOCK DATA =====
  const mockData = [
    { date: "02-10", level: 12, temp: 28, lunar: 13 },
    { date: "02-11", level: 14, temp: 29, lunar: 15 },
    { date: "02-12", level: 18, temp: 31, lunar: 19 },
    { date: "02-13", level: 15, temp: 30, lunar: 16 },
    { date: "02-14", level: 20, temp: 32, lunar: 21 },
    { date: "02-15", level: 22, temp: 33, lunar: 23 },
    { date: "02-16", level: 19, temp: 30, lunar: 20 },
  ];

  useEffect(() => {
    setData(mockData);
  }, []);

  // ===== CALCULATIONS =====
  const stats = useMemo(() => {
    if (!data.length)
      return { avg: 0, peak: 0, low: 0, trend: 0 };

    const levels = data.map((d) => d.level);

    const avg =
      levels.reduce((a, b) => a + b, 0) / levels.length;

    const peak = Math.max(...levels);
    const low = Math.min(...levels);

    const trend =
      ((levels[levels.length - 1] - levels[0]) /
        levels[0]) *
      100;

    return {
      avg: avg.toFixed(1),
      peak,
      low,
      trend: trend.toFixed(1),
    };
  }, [data]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* HEADER */}
      <AppHeader />

      {/* CONTENT */}
      <Content
        style={{
          padding: "40px 60px",
          background: "#f5f7fa",
        }}
      >
        <div className="water-container">
          <h1 className="title">
            Water Analytics Dashboard
          </h1>
          <p className="subtitle">
            Water level, lunar prediction & temperature insights
          </p>

          {/* ===== STATS ===== */}
          <div className="stats-grid">
            <StatCard title="Average Level" value={`${stats.avg} m`} />
            <StatCard title="Peak Level" value={`${stats.peak} m`} />
            <StatCard title="Lowest Level" value={`${stats.low} m`} />
            <StatCard
              title="7-Day Trend"
              value={`${stats.trend}%`}
              trend={stats.trend}
            />
          </div>

          {/* ===== WATER + LUNAR CHART ===== */}
          <div className="chart-card">
            <h2>Water Level & Lunar Prediction</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Line
                  type="monotone"
                  dataKey="level"
                  stroke="#2563eb"
                  strokeWidth={3}
                  name="Water Level"
                />

                <Line
                  type="monotone"
                  dataKey="lunar"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  strokeDasharray="6 4"
                  name="Lunar Prediction"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* ===== TEMPERATURE CHART ===== */}
          <div className="chart-card temperature">
            <h2>Temperature Trend</h2>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Line
                  type="monotone"
                  dataKey="temp"
                  stroke="#f97316"
                  strokeWidth={3}
                  name="Temperature (°C)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Content>

      {/* FOOTER */}
      <AppFooter />
    </Layout>
  );
};

const StatCard = ({ title, value, trend }) => {
  return (
    <div className="stat-card">
      <h3>{title}</h3>
      <p
        className={`stat-value ${
          trend
            ? trend > 0
              ? "positive"
              : "negative"
            : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
};

export default WaterAnalytics;
