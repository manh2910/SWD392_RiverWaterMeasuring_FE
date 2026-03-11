import { Layout, Menu, Badge, Avatar, Dropdown, Button, Space } from "antd";
import {
  HomeOutlined,
  BarChartOutlined,
  EnvironmentOutlined,
  SettingOutlined,
  BellOutlined,
  UserOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import "./Header.css";

const { Header } = Layout;

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const fullName = localStorage.getItem("fullName");
  const role = localStorage.getItem("role");

  const items = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: "Home",
      onClick: () => navigate("/"),
    },
    {
      key: "/analytics",
      icon: <BarChartOutlined />,
      label: "Analytics",
      onClick: () => navigate("/analytics"),
    },
    {
      key: "/map",
      icon: <EnvironmentOutlined />,
      label: "Map",
      onClick: () => navigate("/map"),
    },
    {
      key: "/history",
      icon: <ClockCircleOutlined />,
      label: "History",
      onClick: () => navigate("/history"),
    },
    {
      key: "/settings",
      icon: <SettingOutlined />,
      label: "Settings",
      onClick: () => navigate("/settings"),
    },
  ];

  const userMenu = {
    items: [
      {
        key: "profile",
        label: "Profile",
        onClick: () => navigate("/profile"),
      },
      ...(role === "ADMIN"
        ? [
            {
              key: "admin",
              label: "Admin Dashboard",
              icon: <DashboardOutlined />,
              onClick: () => navigate("/admin"),
            },
          ]
        : []),
      {
        key: "logout",
        label: "Logout",
        onClick: () => {
          localStorage.removeItem("token");
          localStorage.removeItem("fullName");
          localStorage.removeItem("role");
          navigate("/login");
        },
      },
    ],
  };

  return (
    <Header className="app-header">
      {/* Logo */}
      <div className="logo" onClick={() => navigate("/")}>
        🌊 River Monitoring
      </div>

      {/* Menu */}
      <Menu
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={items}
        className="menu"
      />

      {/* Right section */}
      <div className="header-right">
        <Badge count={3} size="small">
          <BellOutlined className="header-icon" />
        </Badge>

        {token ? (
          <Dropdown menu={userMenu} placement="bottomRight">
            <Space className="user-info">
              <Avatar icon={<UserOutlined />} />
              <span className="username">{fullName}</span>
            </Space>
          </Dropdown>
        ) : (
          <Space>
            <Button type="link" onClick={() => navigate("/login")}>
              Sign In
            </Button>
            <Button type="primary" onClick={() => navigate("/register")}>
              Sign Up
            </Button>
          </Space>
        )}
      </div>
    </Header>
  );
}