import { Card, Table, Button, Space, Modal, Form, Input, Select, message } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import "./DataTable.css";

export default function DataTable({
  title,
  icon,
  columns,
  dataSource,
  onAdd,
  onEdit,
  onDelete,
  onView,
  actions = true,
  pagination = true,
}) {
  const [data, setData] = useState(dataSource || []);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const openModal = (record = null) => {
    setEditing(record);
    setOpen(true);
    form.setFieldsValue(record || {});
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (editing) {
        onEdit ? onEdit(editing, values) : setData(
          data.map((i) => (i.key === editing.key ? { ...i, ...values } : i))
        );
        message.success("Record updated successfully");
      } else {
        onAdd ? onAdd(values) : setData([
          ...data,
          { key: Date.now(), ...values },
        ]);
        message.success("Record added successfully");
      }
      setOpen(false);
      setEditing(null);
      form.resetFields();
    });
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete this record?",
      okType: "danger",
      onOk: () => {
        onDelete ? onDelete(record) : setData(data.filter((i) => i.key !== record.key));
        message.success("Record deleted successfully");
      },
    });
  };

  const actionColumn = {
    title: "ACTIONS",
    key: "actions",
    fixed: "right",
    width: 120,
    render: (_, record) => (
      <Space>
        {onView && (
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => onView(record)}
            title="View"
          />
        )}
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => openModal(record)}
          title="Edit"
        />
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record)}
          title="Delete"
        />
      </Space>
    ),
  };

  const finalColumns = actions ? [...columns, actionColumn] : columns;

  return (
    <div className="data-table-page">
      <Card
        className="data-table-card"
        title={
          icon ? (
            <span>
              {icon}
              <span style={{ marginLeft: 8 }}>{title}</span>
            </span>
          ) : (
            title
          )
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
          >
            Add New
          </Button>
        }
      >
        <Table
          columns={finalColumns}
          dataSource={data}
          pagination={pagination ? { pageSize: 10 } : false}
          rowKey="key"
          size="large"
          bordered={false}
          className="admin-table"
        />
      </Card>

      <Modal
        open={open}
        title={editing ? `Edit ${title}` : `Add ${title}`}
        onOk={handleOk}
        onCancel={() => {
          setOpen(false);
          setEditing(null);
          form.resetFields();
        }}
        okText={editing ? "Update" : "Add"}
        width={700}
      >
        <Form layout="vertical" form={form}>
          {/* Form items will be passed as children if needed */}
        </Form>
      </Modal>
    </div>
  );
}
