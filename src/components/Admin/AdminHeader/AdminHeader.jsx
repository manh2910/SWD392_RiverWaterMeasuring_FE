import { useNavigate } from "react-router-dom";
import { Layout, Input, Badge, Avatar, Dropdown, Space } from "antd";
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { logoutApi } from "../../../api/authApi";
import "./AdminHeader.css";

const { Header } = Layout;

export default function AdminHeader() {
  const navigate = useNavigate();

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      logoutApi();
      navigate("/login", { replace: true });
    } else if (key === "profile") {
      navigate("/profile");
    } else if (key === "settings") {
      navigate("/alert-settings");
    }
  };

  const userMenuItems = [
    {
      key: "profile",
      label: "Profile",
      icon: <UserOutlined />,
    },
    {
      key: "settings",
      label: "Settings",
      icon: <SettingOutlined />,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  return (
    <Header className="admin-header">

      {/* SEARCH */}

      <div className="search-wrapper">
        <SearchOutlined className="search-icon" />
        <Input
          placeholder="Search stations, sensors..."
          className="search-input"
          allowClear
        />
      </div>

      {/* RIGHT */}

      <div className="header-right">

        <Badge count={8} size="small">
          <BellOutlined className="header-icon" />
        </Badge>

        <Dropdown
          menu={{ items: userMenuItems, onClick: handleMenuClick }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Space className="user-info">

            <Avatar size={34} icon={<UserOutlined />} />

            <span className="username">Admin</span>

          </Space>
        </Dropdown>

      </div>

    </Header>
  );
}