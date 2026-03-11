import { useEffect, useState } from "react";
import { Card, Table, Tag, message, Row, Col, Statistic } from "antd";
import { LineChartOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { getParameters } from "../../../api/paraApi";
import "./Parameters.css";

export default function Parameters() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchParameters = async () => {
      setLoading(true);

      try {
        const res = await getParameters();
        const list = Array.isArray(res) ? res : [];

        const formatted = list.map((p) => ({
          key: p.parameterId,
          name: p.name,
          code: p.code,
          unit: p.defaultUnit,
          description: p.description,
          type: /ph|do|cond|sal|chem/i.test(p.code || "") ? "Chemical" : "Physical",
        }));

        setData(formatted);
      } catch (err) {
        console.error("LOAD PARAMETERS ERROR:", err);
        message.error("Failed to load parameters");
      } finally {
        setLoading(false);
      }
    };

    fetchParameters();
  }, []);

  const columns = [
    {
      title: "Parameter",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <span>
          <LineChartOutlined style={{ color: "#1890ff", marginRight: 8 }} />
          <span className="fw-600">{text}</span>
        </span>
      ),
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (code) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => <Tag color={type === "Physical" ? "green" : "orange"}>{type}</Tag>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => text || "-",
    },
  ];

  return (
    <div className="parameters-page">
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Parameters"
              value={data.length}
              prefix={<UnorderedListOutlined />}
              valueStyle={{ color: "#1890ff", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Physical"
              value={data.filter((p) => p.type === "Physical").length}
              valueStyle={{ color: "#722ed1", fontSize: "28px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Chemical"
              value={data.filter((p) => p.type === "Chemical").length}
              valueStyle={{ color: "#fa8c16", fontSize: "28px" }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        className="parameters-table-card"
        title={
          <span>
            <LineChartOutlined style={{ marginRight: 8, color: "#1890ff" }} />
            All Parameters
          </span>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowKey="key"
          size="large"
          bordered={false}
          className="admin-table"
        />
      </Card>
    </div>
  );
}
