import {
  Layout,
  Card,
  Row,
  Col,
  Progress,
  Statistic,
  Tag,
  Button,
  Divider
} from "antd";
import {
  EnvironmentOutlined,
  WarningOutlined,
  RiseOutlined,
  ExperimentOutlined,
  DashboardOutlined
} from "@ant-design/icons";


import "./HomePage.css";
import Header from "../../../components/User/Header/Header";
import Footer from "../../../components/User/Footer/Footer";

const { Content } = Layout;

const rivers = [
  {
    name: "Amazon River",
    country: "Brazil",
    level: 2.4,
    temperature: 23.1,
    ph: 7.5,
    turbidity: 37.5,
    flow: 1.43
  },
  {
    name: "Nile River",
    country: "Egypt",
    level: 2.48,
    temperature: 17.7,
    ph: 8.27,
    turbidity: 20.9,
    flow: 1.49
  },
  {
    name: "Yangtze River",
    country: "China",
    level: 1.7,
    temperature: 24.9,
    ph: 7.65,
    turbidity: 32.3,
    flow: 1.12
  }
];

const alerts = [
  {
    river: "Nile River",
    message: "pH level abnormal (8.33)",
    type: "error"
  },
  {
    river: "Mississippi River",
    message: "Water turbidity elevated (51.5 NTU)",
    type: "warning"
  }
];

export default function HomePage() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* HEADER LUÔN Ở NGOÀI */}
      <Header />

      {/* CONTENT KHÔNG ĐÈ HEADER */}
      <Content
        style={{
          padding: "40px 60px",
          background: "#f5f7fa"
        }}
      >
        {/* HERO */}
        <div className="hero-section">
          <h1>🌊 River Monitoring System</h1>
          <p>
            Real-time monitoring of river levels, environmental data and
            water quality indicators.
          </p>
        </div>

        <Divider />

        {/* SUMMARY */}
        <Row gutter={[24, 24]} className="summary-section">
          <Col xs={24} sm={12} md={6}>
            <Card className="summary-card">
              <Statistic
                title="Total Rivers"
                value={14}
                prefix={<DashboardOutlined />}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card className="summary-card">
              <Statistic
                title="Active Stations"
                value={42}
                prefix={<EnvironmentOutlined />}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card className="summary-card">
              <Statistic
                title="Sensors Online"
                value={128}
                valueStyle={{ color: "#00e676" }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card className="summary-card">
              <Statistic
                title="Active Alerts"
                value={alerts.length}
                valueStyle={{ color: "#ff4d4f" }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* RIVERS */}
        <h2 className="section-title">Monitored Rivers</h2>

        <Row gutter={[24, 24]}>
          {rivers.map((river, index) => (
            <Col xs={24} md={12} lg={8} key={index}>
              <Card className="river-card">
                <div className="river-header">
                  <div>
                    <h3>{river.name}</h3>
                    <span>{river.country}</span>
                  </div>
                  <Tag color="green">Online</Tag>
                </div>

                <div className="level-section">
                  <div className="level-text">
                    <span>Water Level</span>
                    <h2>{river.level} m</h2>
                  </div>

                  <Progress
                    percent={(river.level / 3.5) * 100}
                    showInfo={false}
                    strokeColor="#00e676"
                  />
                </div>

                <Row gutter={12} className="metrics">
                  <Col span={12}>
                    <Statistic
                      title="Temperature"
                      value={river.temperature}
                      suffix="°C"
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic title="pH Level" value={river.ph} />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Turbidity"
                      value={river.turbidity}
                      suffix="NTU"
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Flow Rate"
                      value={river.flow}
                      suffix="m³/s"
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>

        <Divider />

        {/* ALERTS */}
        <h2 className="section-title">Active Alerts</h2>

        <Row gutter={[16, 16]}>
          {alerts.map((alert, index) => (
            <Col span={24} key={index}>
              <Card
                className={`alert-card ${
                  alert.type === "error"
                    ? "alert-error"
                    : "alert-warning"
                }`}
              >
                <WarningOutlined className="alert-icon" />

                <div className="alert-content">
                  <h4>{alert.river}</h4>
                  <p>{alert.message}</p>
                </div>

                <Tag color={alert.type === "error" ? "red" : "orange"}>
                  THRESHOLD EXCEEDED
                </Tag>
              </Card>
            </Col>
          ))}
        </Row>
      </Content>

      <Footer />
    </Layout>
  );
}
