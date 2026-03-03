import { Layout, Input, Badge, Avatar, Button, Dropdown, Space } from "antd";
import { BellOutlined, UserOutlined, LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import "./AdminHeader.css";

const { Header: AntHeader } = Layout;

export default function AdminHeader() {
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
    <AntHeader className="admin-header">
      <Input.Search
        placeholder="Search stations, sensors, alerts..."
        allowClear
        enterButton="Search"
      />

      <div className="right">
        <Badge count={8} offset={[-2, 2]}>
          <BellOutlined className="icon" title="Notifications" />
        </Badge>
        <Dropdown
          menu={{ items: userMenuItems }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Space style={{ cursor: "pointer" }}>
            <Avatar icon={<UserOutlined />} />
            <span className="username">Admin</span>
          </Space>
        </Dropdown>
      </div>
    </AntHeader>
  );
}
