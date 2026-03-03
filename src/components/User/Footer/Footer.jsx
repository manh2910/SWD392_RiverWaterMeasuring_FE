import { Layout } from "antd";
import "./Footer.css";

const { Footer } = Layout;

export default function AppFooter() {
  return (
    <Footer className="app-footer">
      <div>
        © {new Date().getFullYear()} River Monitoring System
      </div>
      <div>
        Built with React + Vite + Ant Design
      </div>
    </Footer>
  );
}
