import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
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
  Segmented,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  ReloadOutlined,
  MailOutlined,
  SearchOutlined,
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
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

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

  const filteredData = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return data.filter((item) => {
      const roleMatched = roleFilter === "ALL" || item.role === roleFilter;
      if (!roleMatched) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return (
        item.fullName.toLowerCase().includes(keyword) ||
        item.email.toLowerCase().includes(keyword)
      );
    });
  }, [data, query, roleFilter]);

  const adminCount = data.filter((u) => u.role === "ADMIN").length;
  const userCount = data.length - adminCount;

  const getInitials = (fullName) => {
    if (!fullName || fullName === "-") {
      return "U";
    }

    return fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  };

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
      render: (text, record) => (
        <Space>
          <Avatar className={record.role === "ADMIN" ? "user-avatar admin" : "user-avatar"}>
            {getInitials(text)}
          </Avatar>
          <span className="fw-600">{text}</span>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (email) => (
        <Space>
          <MailOutlined style={{ color: "#0ea5e9" }} />
          <span>{email}</span>
        </Space>
      ),
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
          <Tooltip title="Edit role">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>

          <Tooltip title="Delete user">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
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
              value={adminCount}
              prefix={<SafetyCertificateOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card className="stat-card">
            <Statistic
              title="Users"
              value={userCount}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        className="users-table-card"
        title={
          <Space>
            <TeamOutlined />
            User Management
          </Space>
        }
        extra={
          <Space wrap>
            <Button icon={<ReloadOutlined />} onClick={fetchUsers}>
              Refresh
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              Add User
            </Button>
          </Space>
        }
      >
        <div className="users-toolbar">
          <Input
            allowClear
            className="users-search"
            placeholder="Search by name or email"
            prefix={<SearchOutlined />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <Segmented
            value={roleFilter}
            onChange={setRoleFilter}
            options={[
              { label: `All (${data.length})`, value: "ALL" },
              { label: `Admin (${adminCount})`, value: "ADMIN" },
              { label: `User (${userCount})`, value: "USER" },
            ]}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          rowKey="key"
          className="admin-table"
          pagination={{ pageSize: 8, showSizeChanger: false }}
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
          <Form.Item
            label="Full Name"
            name="fullName"
            rules={!editing ? [{ required: true, message: "Please enter full name" }] : []}
          >
            <Input disabled={!!editing} placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={
              !editing
                ? [
                    { required: true, message: "Please enter email" },
                    { type: "email", message: "Invalid email format" },
                  ]
                : []
            }
          >
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