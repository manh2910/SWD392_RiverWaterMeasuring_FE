import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  EnvironmentOutlined,
  ApartmentOutlined,
  ClusterOutlined,
} from "@ant-design/icons";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const { Sider } = Layout;

export default function Sidebar() {
  return (
    <Sider
      width={240}
      style={{
        background: "#f5f5f5",
        borderRight: "1px solid #e5e7eb",
      }}
    >
      <div className="logo">🌊 WaterMonitor</div>

      <Menu mode="inline" defaultSelectedKeys={["/admin"]}>
        <Menu.Item key="/admin" icon={<DashboardOutlined />}>
          <NavLink to="/admin">Dashboard</NavLink>
        </Menu.Item>
        <Menu.Item key="/admin/rivers" icon={<EnvironmentOutlined />}>
          <NavLink to="/admin/rivers">Rivers</NavLink>
        </Menu.Item>
        <Menu.Item key="/admin/stations" icon={<ApartmentOutlined />}>
          <NavLink to="/admin/stations">Stations</NavLink>
        </Menu.Item>
        <Menu.Item key="/admin/hubs" icon={<ClusterOutlined />}>
          <NavLink to="/admin/hubs">Hubs</NavLink>
        </Menu.Item>
      </Menu>
    </Sider>
  );
}
