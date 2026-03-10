import { Layout, Form, Input, Button, message } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AppHeader from "../../../components/User/Header/Header";
import AppFooter from "../../../components/User/Footer/Footer";
import { loginApi } from "../../../api/authApi";
import { setAuthSession } from "../../../utils/auth";
import "./Auth.css";

const { Content } = Layout;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const onLogin = async (values) => {
    try {
      const response = await loginApi(values);
      setAuthSession(response, values.email);
      message.success("Login successful");

      const from = location.state?.from;
      navigate(from || "/", { replace: true });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Login failed. Please check your account.";
      message.error(errorMessage);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader />
      <Content style={{ padding: "40px 60px", background: "#f5f7fa" }}>
        <div className="auth-container">
          <h2>Login</h2>
          <Form layout="vertical" onFinish={onLogin} className="auth-form">
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Invalid email!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: "Please input your password!" }]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Login
              </Button>
            </Form.Item>
          </Form>

          <p>
            No account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </Content>
      <AppFooter />
    </Layout>
  );
}
