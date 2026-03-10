import { Layout, Form, Input, Button, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import AppHeader from "../../../components/User/Header/Header";
import AppFooter from "../../../components/User/Footer/Footer";
import { registerApi } from "../../../api/authApi";
import "./Auth.css";

const { Content } = Layout;

export default function Register() {
  const navigate = useNavigate();

  const onRegister = async (values) => {
    try {
      const { confirm, ...payload } = values;
      await registerApi(payload);
      message.success("Register successful. Please login.");
      navigate("/login", { replace: true });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Register failed. Please try again.";
      message.error(errorMessage);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader />
      <Content style={{ padding: "40px 60px", background: "#f5f7fa" }}>
        <div className="auth-container">
          <h2>Register</h2>
          <Form layout="vertical" onFinish={onRegister} className="auth-form">
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

            <Form.Item
              name="confirm"
              label="Confirm Password"
              dependencies={["password"]}
              rules={[
                {
                  required: true,
                  message: "Please confirm your password!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match!"));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Register
              </Button>
            </Form.Item>
          </Form>

          <p>
            Already have an account? <Link to="/login">Login now</Link>
          </p>
        </div>
      </Content>
      <AppFooter />
    </Layout>
  );
}
