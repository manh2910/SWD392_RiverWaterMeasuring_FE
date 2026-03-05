import { Layout, Menu, Badge, Avatar, Dropdown, Button } from "antd";
import {
  HomeOutlined,
  BarChartOutlined,
  EnvironmentOutlined,
  SettingOutlined,
  BellOutlined,
  UserOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import "./Header.css";

const { Header } = Layout;

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  const loggedInUser = localStorage.getItem("loggedInUser");

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
    },
    {
      key: "/history",
      icon: <ClockCircleOutlined />,
      label: "History",
      onClick: () => navigate("/history")
    }
  ];

  const userMenu = {
    items: [
      {
        key: "profile",
        label: "Profile",
        onClick: () => navigate("/profile")
      },
      {
        key: "logout",
        label: "Logout",
        onClick: () => {
          localStorage.removeItem("loggedInUser");
          navigate("/login");
        }
      }
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

        {loggedInUser ? (
          <Dropdown menu={userMenu} placement="bottomRight">
            <Avatar icon={<UserOutlined />} className="avatar" />
          </Dropdown>
        ) : (
          <Button type="link" onClick={() => navigate("/login")}>
            Login
          </Button>
        )}
      </div>
    </Header>
  );
}
