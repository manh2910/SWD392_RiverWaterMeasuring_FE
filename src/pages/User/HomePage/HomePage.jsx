import {
  Layout,
  Card,
  Row,
  Col,
  Progress,
  Statistic,
  Tag,
  Divider,
  message,
  Spin
} from "antd";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  EnvironmentOutlined,
  WarningOutlined,
  DashboardOutlined
} from "@ant-design/icons";

import Header from "../../../components/User/Header/Header";
import Footer from "../../../components/User/Footer/Footer";

import { getRivers, getRiverDetail } from "../../../api/riverApi";
import { getAlerts } from "../../../api/alertApi";
import { getParameters } from "../../../api/paraApi";

import "./HomePage.css";

const { Content } = Layout;

export default function HomePage() {

  const navigate = useNavigate();
  const loggedInUser = localStorage.getItem("loggedInUser");

  const [rivers, setRivers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {

    setLoading(true);

    try {

      await Promise.all([
        fetchRivers(),
        fetchAlerts(),
        fetchParameters()
      ]);

    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  // ================= FETCH RIVERS =================

  const fetchRivers = async () => {

    try {

      const data = await getRivers();

      const riversWithSensors = await Promise.all(

        data.slice(0,10).map(async (r)=>{

          const detail = await getRiverDetail(r.riverId);

          const status = detail.currentStatus || [];

          const waterLevel =
            status.find((s)=>s.parameterCode === "WL")?.averageValue || 0;

          return{

            ...r,
            level: waterLevel,
            parameters: status

          };

        })

      );

      setRivers(riversWithSensors);

    } catch(error){

      console.error(error);
      message.error("Failed to load rivers");

    }
  };

  // ================= FETCH ALERTS =================

  const fetchAlerts = async () => {

    try {

      const data = await getAlerts();

      const formattedAlerts = data.map((a)=>({

        river:`River ID ${a.scopeID}`,
        message:`${a.parameterCode} threshold triggered`,
        type:"warning"

      }));

      setAlerts(formattedAlerts);

    } catch (error) {

      console.log("Alert API requires login or no alerts available");

    }
  };

  // ================= FETCH PARAMETERS =================

  const fetchParameters = async () => {

    try {

      const data = await getParameters();
      setParameters(data);

    } catch (error) {

      console.error("Failed to load parameters");

    }
  };

  if(loading){

    return(

      <Layout style={{minHeight:"100vh"}}>

        <Header/>

        <Content
          style={{
            display:"flex",
            justifyContent:"center",
            alignItems:"center"
          }}
        >

          <Spin size="large"/>

        </Content>

      </Layout>

    );

  }

  return(

    <Layout style={{minHeight:"100vh"}}>

      <Header/>

      <Content
        style={{
          padding:"40px 60px",
          background:"#f5f7fa"
        }}
      >

        {/* HERO */}

        <div className="hero-section">

          <h1>🌊 River Monitoring System</h1>

          {loggedInUser && (
            <p className="welcome-text">
              Welcome back, {loggedInUser}!
            </p>
          )}

          <p>
            Real-time monitoring of river levels and environmental data.
          </p>

        </div>

        <Divider/>

        {/* SUMMARY */}

        <Row gutter={[24,24]}>

          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Rivers"
                value={rivers.length}
                prefix={<DashboardOutlined/>}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Active Stations"
                value={42}
                prefix={<EnvironmentOutlined/>}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Sensors Online"
                value={128}
                valueStyle={{color:"#00e676"}}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Active Alerts"
                value={alerts.length}
                valueStyle={{color:"#ff4d4f"}}
                prefix={<WarningOutlined/>}
              />
            </Card>
          </Col>

        </Row>

        <Divider/>

        {/* RIVERS */}

        <h2 className="section-title">Monitored Rivers</h2>

        <Row gutter={[24,24]}>

          {rivers.map((river)=>(

            <Col xs={24} md={12} lg={8} key={river.riverId}>

              <Card className="river-card">

                <div className="river-header">

                  <div>
                    <h3>{river.riverName}</h3>
                    <span>{river.region}</span>
                  </div>

                  <Tag color="green">Online</Tag>

                </div>

                {/* WATER LEVEL */}

                <div className="level-section">

                  <div className="level-text">
                    <span>Water Level</span>
                    <h2>{river.level} m</h2>
                  </div>

                  <Progress
                    percent={Math.min((river.level/5)*100,100)}
                    showInfo={false}
                  />

                </div>

                {/* PARAMETERS FROM API */}

                <Row gutter={12}>

                  {river.parameters.map((p,index)=>(
                    
                    <Col span={12} key={index}>

                      <Statistic
                        title={p.parameterName}
                        value={p.averageValue}
                        suffix={p.unit}
                      />

                    </Col>

                  ))}

                </Row>

              </Card>

            </Col>

          ))}

        </Row>

        <Divider/>

        {/* PARAMETERS */}

        <h2 className="section-title">Supported Parameters</h2>

        <Row gutter={[16,16]}>

          {parameters.map((p)=>(

            <Col xs={24} sm={12} md={8} key={p.parameterId}>

              <Card>

                <Statistic
                  title={p.name}
                  value={p.code}
                />

                <p>{p.description}</p>

                <Tag>{p.defaultUnit}</Tag>

              </Card>

            </Col>

          ))}

        </Row>

        <Divider/>

        {/* ALERTS */}

        <h2 className="section-title">Active Alerts</h2>

        <Row gutter={[16,16]}>

          {alerts.map((alert,index)=>(

            <Col span={24} key={index}>

              <Card className="alert-warning">

                <WarningOutlined/>

                <div style={{marginLeft:10}}>

                  <h4>{alert.river}</h4>
                  <p>{alert.message}</p>

                </div>

                <Tag color="orange">THRESHOLD</Tag>

              </Card>

            </Col>

          ))}

        </Row>

      </Content>

      <Footer/>

    </Layout>

  );

}