import { Layout, Menu, Badge, Avatar, Dropdown } from "antd";
import {
  HomeOutlined,
  BarChartOutlined,
  EnvironmentOutlined,
  SettingOutlined,
  BellOutlined,
  UserOutlined
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import "./Header.css";

const { Header } = Layout;

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: "Home",
      onClick: () => navigate("/")
    },
    {
      key: "/analytics",
      icon: <BarChartOutlined />,
      label: "Analytics",
      onClick: () => navigate("/analytics")
    },
    {
      key: "/map",
      icon: <EnvironmentOutlined />,
      label: "Map",
      onClick: () => navigate("/map")
    },
    {
      key: "/settings",
      icon: <SettingOutlined />,
      label: "Settings",
      onClick: () => navigate("/settings")
    }
  ];

  const userMenu = {
    items: [
      { key: "profile", label: "Profile" },
      { key: "logout", label: "Logout" }
    ]
  };

  return (
    <Header className="app-header">
      <div className="logo" onClick={() => navigate("/")}>
        🌊 River Monitoring
      </div>

      <Menu
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={items}
        className="menu"
      />

      <div className="header-right">
        <Badge count={3} size="small">
          <BellOutlined className="header-icon" />
        </Badge>

        <Dropdown menu={userMenu} placement="bottomRight">
          <Avatar icon={<UserOutlined />} className="avatar" />
        </Dropdown>
      </div>
    </Header>
  );
}
