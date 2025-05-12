// src/components/CampaignCreator.jsx
import React, { useEffect, useState } from "react";
import { Card, Form, Input, Select, Button, message, Space, Radio } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

export default function CampaignCreator() {
  const [goal, setGoal] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    axios
      .get(import.meta.env.VITE_API_URL + "/api/segments")
      .then((res) => setSegments(res.data))
      .catch(() => message.error("Failed to load segments"))
      .finally(() => setLoading(false));
  }, []);

  const fetchSuggestions = async () => {
    try {
      const { data } = await axios.post(import.meta.env.VITE_API_URL + "/api/campaigns/suggest", { goal });
      setSuggestions(data.suggestions);
    } catch {
      message.error("Failed to get suggestions");
    }
  };

  const onFinish = (values) => {
    axios
      .post(import.meta.env.VITE_API_URL + "/api/campaigns", values)
      .then(() => {
        message.success("Campaign launched!");
        navigate("/campaigns");
      })
      .catch(() => message.error("Failed to launch campaign"));
  };

  return (
    <Card title="Launch New Campaign" style={{ maxWidth: 600, margin: "2rem auto" }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Campaign Goal">
          <Input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Describe what you want this campaign to achieve"
          />
          <Button type="default" onClick={fetchSuggestions} disabled={!goal} style={{ marginTop: 8 }}>
            Get Suggestions
          </Button>
        </Form.Item>

        {suggestions.length > 0 && (
          <Form.Item label="Choose a Message">
            <Radio.Group
              onChange={(e) => {
                const selectedMsg = e.target.value;
                const defaultName = selectedMsg.split(" ").slice(0, 4).join(" ") + "...";
                form.setFieldsValue({
                  message: selectedMsg,
                  name: defaultName,
                });
              }}
            >
              <Space direction="vertical">
                {suggestions.map((msg, idx) => (
                  <Radio key={idx} value={msg}>
                    {msg}
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </Form.Item>
        )}

        <Form.Item
          label="Campaign Name"
          name="name"
          rules={[{ required: true, message: "Please enter a campaign name" }]}
        >
          <Input placeholder="e.g. Spring Sale 2025" />
        </Form.Item>

        <Form.Item label="Segment" name="segmentId" rules={[{ required: true, message: "Select a segment" }]}>
          <Select placeholder="Choose a segment" loading={loading}>
            {segments.map((seg) => (
              <Option key={seg._id} value={seg._id}>
                {seg.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Message" name="message" rules={[{ required: true, message: "Please provide a message" }]}>
          <Input.TextArea rows={4} placeholder="Write your campaign message here" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Launch Campaign
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
