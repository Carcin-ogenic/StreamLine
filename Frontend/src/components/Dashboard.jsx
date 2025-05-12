import { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Button, List, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/dashboard-metrics`)
      .then((res) => setMetrics(res.data))
      .catch(() => setMetrics({}));
  }, []);

  if (!metrics) return <Spin style={{ margin: "2rem auto", display: "block" }} />;

  return (
    <>
      <Row gutter={[16, 16]}>
        {[
          ["Customers", metrics.totalCustomers],
          ["Segments", metrics.totalSegments],
          ["Campaigns", metrics.totalCampaigns],
          ["Reach (7d)", metrics.reachLast7Days],
        ].map(([title, value]) => (
          <Col xs={24} sm={12} md={6} key={title}>
            <Card style={{ height: "100%" }}>
              <Statistic title={title} value={value} />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16} style={{ margin: "2rem 0" }}>
        <Col>
          <Button type="primary" size="large" onClick={() => navigate("/segments/new")}>
            + New Segment
          </Button>
        </Col>
        <Col>
          <Button type="primary" size="large" onClick={() => navigate("/campaigns/new")}>
            + New Campaign
          </Button>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Card bodyStyle={{ padding: "4px 20px" }} title="Recent Segments">
            <List
              dataSource={metrics.recentSegments}
              renderItem={(s) => (
                <List.Item>
                  {s.name} ({new Date(s.createdAt).toLocaleDateString()})
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card bodyStyle={{ padding: "4px 20px" }} title="Recent Campaigns">
            <List
              dataSource={metrics.recentCampaigns}
              renderItem={(c) => (
                <List.Item>
                  {c.name} ({c.appliedTo.length} reached)
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}
