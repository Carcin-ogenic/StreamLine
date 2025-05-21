import React, { useEffect, useState } from "react";
import { Table, Button, Card, message } from "antd";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState([]);
  const { state } = useLocation();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (state?.toast) {
      messageApi.open({
        type: state.toast.type,
        content: state.toast.content,
      });
      window.history.replaceState({}, document.title);
    }
  }, [state, messageApi]);

  useEffect(() => {
    axios
      .get(import.meta.env.VITE_API_URL + "/api/campaigns")
      .then((res) => setCampaigns(res.data))
      .catch(() => message.error("Failed to load campaigns"));
  }, []);

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Segment",
      dataIndex: ["segmentId", "name"],
      key: "segment",
    },
    {
      title: "Recipients",
      dataIndex: "appliedTo",
      key: "count",
      render: (appliedTo) => appliedTo.length,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Link to={`/campaigns/${record._id}`}>
          <Button>View</Button>
        </Link>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <Card
        title="Campaign History"
        extra={
          <Link to="/campaigns/new">
            <Button type="primary">+ New Campaign</Button>
          </Link>
        }
        style={{ margin: "2rem" }}
      >
        <Table dataSource={campaigns} columns={columns} rowKey="_id" />
      </Card>
    </>
  );
}
