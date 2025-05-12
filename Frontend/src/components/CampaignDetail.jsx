import React, { useEffect, useState } from "react";
import { Card, List, message, Spin } from "antd";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function CampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/campaigns/${id}`)
      .then((res) => setCampaign(res.data))
      .catch(() => message.error("Failed to load campaign"));
  }, [id]);

  if (!campaign) return <Spin style={{ margin: "2rem auto", display: "block" }} />;

  return (
    <Card title={campaign?.name} style={{ margin: "2rem" }}>
      <p>
        <strong>Segment:</strong> {campaign?.segmentId?.name}
      </p>
      <p>
        <strong>Launched At:</strong> {new Date(campaign?.createdAt).toLocaleString()}
      </p>
      <p>
        <strong>Message : </strong> {campaign?.message}
      </p>
      <List
        header={<strong>Recipients ({campaign.appliedTo.length})</strong>}
        dataSource={campaign?.appliedTo}
        renderItem={(c) => (
          <List.Item>
            {c?.name} ({c?.email})
          </List.Item>
        )}
      />
    </Card>
  );
}
