import { Layout, Input, Badge, Avatar } from "antd";
import { BellOutlined, UserOutlined } from "@ant-design/icons";
import "./AdminHeader.css";

const { Header: AntHeader } = Layout;

export default function AdminHeader() {
  return (
    <AntHeader className="admin-header">
      <Input.Search
        placeholder="Search stations, sensors, alerts..."
        className="search"
      />

      <div className="right">
        <Badge count={8} offset={[-2, 2]}>
          <BellOutlined className="icon" />
        </Badge>
        <Avatar icon={<UserOutlined />} />
        <span className="username">Admin</span>
      </div>
    </AntHeader>
  );
}
