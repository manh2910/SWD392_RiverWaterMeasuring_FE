import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Admin/Sidebar/Sidebar";
import AdminHeader from "../components/Admin/AdminHeader/AdminHeader";

const { Content } = Layout;

export default function AdminLayout() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />

      <Layout>
        <AdminHeader />

        <Content
          style={{
            margin: 16,
            padding: 24,
            background: "#ffffff",
            borderRadius: 12,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
