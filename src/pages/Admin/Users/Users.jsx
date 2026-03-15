import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  message,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { registerApi } from "../../../api/authApi";
import { getUsers, updateUserRole, deleteUser } from "../../../api/userApi";
import "./Users.css";

const normalizeUser = (u) => {
  const id = u.userId ?? u.id;
  const rawRole = (u.role || "USER").toUpperCase();
  const role = rawRole === "VIEWER" ? "USER" : rawRole;

  return {
    key: id,
    id,
    fullName: u.fullName || "-",
    email: u.email || "-",
    role,
  };
};

export default function Users() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);

    try {
      const res = await getUsers();
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];

      setData(list.map(normalizeUser));
    } catch (err) {
      console.error("LOAD USERS ERROR:", err);
      message.error("Failed to load users");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setEditing(null);
    setOpen(true);
    form.setFieldsValue({
      fullName: "",
      email: "",
      password: "",
      role: "USER",
    });
  };

  const openEditModal = (record) => {
    setEditing(record);
    setOpen(true);
    form.setFieldsValue({
      fullName: record.fullName,
      email: record.email,
      role: record.role,
      password: "",
    });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (editing) {
        await updateUserRole(editing.id, { role: values.role });
        message.success("User role updated");
      } else {
        await registerApi({
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          role: values.role,
        });
        message.success("User created");
      }

      setOpen(false);
      setEditing(null);
      form.resetFields();

      fetchUsers();
    } catch (err) {
      console.error("SAVE USER ERROR:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        (typeof err === "string" ? err : "Save failed");
      message.error(errorMessage);
    }
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete user?",
      content: record.email,
      okType: "danger",
      onOk: async () => {
        try {
          await deleteUser(record.id);
          message.success("User deleted");
          fetchUsers();
        } catch (err) {
          console.error("DELETE USER ERROR:", err);
          message.error(err?.response?.data?.message || "Delete failed");
        }
      },
    });
  };

  const columns = [
    {
      title: "User",
      dataIndex: "fullName",
      render: (text) => (
        <Space>
          <UserOutlined style={{ color: "#1677ff" }} />
          <span className="fw-600">{text}</span>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      render: (role) =>
        role === "ADMIN" ? (
          <Tag color="gold">ADMIN</Tag>
        ) : (
          <Tag color="blue">USER</Tag>
        ),
    },
    {
      title: "Actions",
      width: 160,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          />

          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="users-page">
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card className="stat-card">
            <Statistic
              title="Total Users"
              value={data.length}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1677ff" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card className="stat-card">
            <Statistic
              title="Admins"
              value={data.filter((u) => u.role === "ADMIN").length}
              prefix={<SafetyCertificateOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card className="stat-card">
            <Statistic
              title="Users"
              value={data.filter((u) => u.role !== "ADMIN").length}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        className="users-table-card"
        title={
          <span>
            <TeamOutlined style={{ marginRight: 8 }} />
            User Management
          </span>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Add User
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="key"
          className="admin-table"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        open={open}
        title={editing ? "Update User Role" : "Create User"}
        onOk={handleSave}
        onCancel={() => {
          setOpen(false);
          setEditing(null);
          form.resetFields();
        }}
        okText={editing ? "Update" : "Create"}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Full Name" name="fullName">
            <Input disabled={!!editing} placeholder="Enter full name" />
          </Form.Item>

          <Form.Item label="Email" name="email">
            <Input disabled={!!editing} placeholder="Enter email" />
          </Form.Item>

          {!editing && (
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please enter password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          )}

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Please select role" }]}
          >
            <Select
              options={[
                { label: "User", value: "USER" },
                { label: "Admin", value: "ADMIN" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}