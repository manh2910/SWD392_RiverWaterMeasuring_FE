import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  EnvironmentOutlined,
  ApartmentOutlined,
  ClusterOutlined,
  ThunderboltOutlined,
  LineChartOutlined,
  DatabaseOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";

const { Sider } = Layout;

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      onClick: () => navigate("/admin"),
    },
    {
      key: "/admin/rivers",
      icon: <EnvironmentOutlined />,
      label: "Rivers",
      onClick: () => navigate("/admin/rivers"),
    },
    {
      key: "/admin/stations",
      icon: <ApartmentOutlined />,
      label: "Stations",
      onClick: () => navigate("/admin/stations"),
    },
    {
      key: "/admin/hubs",
      icon: <ClusterOutlined />,
      label: "Hubs",
      onClick: () => navigate("/admin/hubs"),
    },
    {
      key: "/admin/sensors",
      icon: <ThunderboltOutlined />,
      label: "Sensors",
      onClick: () => navigate("/admin/sensors"),
    },
    {
      key: "/admin/parameters",
      icon: <LineChartOutlined />,
      label: "Parameters",
      onClick: () => navigate("/admin/parameters"),
    },
    {
      key: "/admin/observations",
      icon: <DatabaseOutlined />,
      label: "Observations",
      onClick: () => navigate("/admin/observations"),
    },
    {
      key: "/admin/data-packages",
      icon: <InboxOutlined />,
      label: "Data Packages",
      onClick: () => navigate("/admin/data-packages"),
    },
  ];

  const selectedKey = location.pathname;

  return (
    <Sider
      width={240}
      style={{
        background: "#f5f5f5",
        borderRight: "1px solid #e5e7eb",
      }}
    >
      <div className="logo">🌊 WaterMonitor</div>

      <Menu 
        mode="inline" 
        items={menuItems}
        selectedKeys={[selectedKey]}
      />
    </Sider>
  );
}
