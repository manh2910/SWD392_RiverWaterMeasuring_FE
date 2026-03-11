import React, { useEffect, useState, useMemo } from "react";
import { Layout, Select } from "antd";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
  Cell
} from "recharts";

import "./WaterAnalytics.css";

import AppHeader from "../../../components/User/Header/Header";
import AppFooter from "../../../components/User/Footer/Footer";

import { getRivers, getRiverDetail } from "../../../api/riverApi";

const { Content } = Layout;
const { Option } = Select;

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4"
];

const WaterAnalytics = () => {

  const [riverId,setRiverId] = useState(null);
  const [rivers,setRivers] = useState([]);

  const [waterData,setWaterData] = useState([]);
  const [paramData,setParamData] = useState([]);

  // ================= LOAD RIVERS =================

  useEffect(()=>{
    loadRivers();
  },[]);

  const loadRivers = async()=>{

    try{

      const data = await getRivers();

      setRivers(data);

      if(data.length){

        setRiverId(data[0].riverId);
        loadRiverDetail(data[0].riverId);

      }

    }catch(err){
      console.log(err);
    }

  };

  // ================= LOAD DETAIL =================

  const loadRiverDetail = async(id)=>{

    try{

      const detail = await getRiverDetail(id);

      // ===== WATER LEVEL HISTORY =====

      const history = detail.waterLevelHistory || [];

      const formattedWater = history.map(h=>({

        date: new Date(h.timestamp).toLocaleDateString(),
        level: h.value,
        lunar: null // chưa có dữ liệu

      }));

      setWaterData(formattedWater);

      // ===== PARAMETERS =====

      const params = detail.currentStatus || [];

      const formattedParams = params.map(p=>({

        name: p.parameterName,
        value: p.averageValue,
        unit: p.unit

      }));

      setParamData(formattedParams);

    }catch(err){

      console.log(err);

    }

  };

  // ================= STATS =================

  const stats = useMemo(()=>{

    if(!waterData.length)
      return {avg:0,peak:0,low:0,trend:0};

    const levels = waterData.map(d=>d.level);

    const avg =
      levels.reduce((a,b)=>a+b,0) / levels.length;

    const peak = Math.max(...levels);
    const low = Math.min(...levels);

    const trend =
      ((levels[levels.length-1] - levels[0]) /
        levels[0]) * 100;

    return{

      avg: avg.toFixed(2),
      peak,
      low,
      trend: trend.toFixed(1)

    };

  },[waterData]);

  return(

    <Layout style={{minHeight:"100vh"}}>

      <AppHeader/>

      <Content
        style={{
          padding:"40px 60px",
          background:"#f5f7fa"
        }}
      >

        <div className="water-container">

          <h1 className="title">
            Water Analytics Dashboard
          </h1>

          {/* SELECT RIVER */}

          <Select
            value={riverId}
            style={{width:300,marginBottom:30}}
            onChange={(v)=>{
              setRiverId(v);
              loadRiverDetail(v);
            }}
          >

            {rivers.map(r=>(
              <Option key={r.riverId} value={r.riverId}>
                {r.riverName}
              </Option>
            ))}

          </Select>

          {/* ===== STATS ===== */}

          <div className="stats-grid">

            <StatCard
              title="Average Level"
              value={`${stats.avg} m`}
            />

            <StatCard
              title="Peak Level"
              value={`${stats.peak} m`}
            />

            <StatCard
              title="Lowest Level"
              value={`${stats.low} m`}
            />

            <StatCard
              title="Trend"
              value={`${stats.trend}%`}
              trend={stats.trend}
            />

          </div>

          {/* ===== WATER LEVEL CHART ===== */}

          <div className="chart-card">

            <h2>Water Level by Day</h2>

            <ResponsiveContainer width="100%" height={400}>

              <LineChart data={waterData}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                />

                <XAxis dataKey="date"/>

                <YAxis/>

                <Tooltip/>

                <Legend/>

                <Line
                  type="monotone"
                  dataKey="level"
                  stroke="#2563eb"
                  strokeWidth={3}
                  name="Water Level (m)"
                />

                <Line
                  type="monotone"
                  dataKey="lunar"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Lunar Prediction (Coming Soon)"
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

          {/* ===== PARAMETERS CHART ===== */}

          <div className="chart-card">

            <h2>Water Quality Parameters</h2>

            <ResponsiveContainer width="100%" height={350}>

              <BarChart data={paramData}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                />

                <XAxis dataKey="name"/>

                <YAxis/>

                <Tooltip
                  formatter={(value,name,props)=>[
                    `${value} ${props.payload.unit}`,
                    props.payload.name
                  ]}
                />

                <Legend/>

                <Bar
                  dataKey="value"
                  name="Parameter Value"
                >

                  {paramData.map((entry,index)=>(
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}

                </Bar>

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

      </Content>

      <AppFooter/>

    </Layout>

  );

};

const StatCard = ({title,value,trend})=>{

  return(

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