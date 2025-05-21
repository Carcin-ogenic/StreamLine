import { useState, useEffect } from "react";
import { QueryBuilder, formatQuery } from "react-querybuilder";
import { QueryBuilderAntD } from "@react-querybuilder/antd";
import { Modal, Card, Space, Typography, Button, Form, Input, message } from "antd";
import axios from "axios";
import { fields, operatorsByType } from "../segmentConfig";
import "antd/dist/reset.css";
import "react-querybuilder/dist/query-builder.css";
import { useNavigate } from "react-router-dom";

export default function SegmentBuilder() {
  const [query, setQuery] = useState({ combinator: "and", rules: [] });
  const [count, setCount] = useState(null);
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [modalVisible, setModalVisible] = useState(false);
  const [segmentName, setSegmentName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const id = setTimeout(async () => {
      try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/segments/preview`, query);
        setCount(res.data.count);
      } catch {
        setCount(null);
      }
    }, 500);
    return () => clearTimeout(id);
  }, [query]);

  const handleSaveClick = () => {
    setSegmentName("");
    setModalVisible(true);
  };
  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const handleModalOk = async () => {
    if (!segmentName.trim()) {
      messageApi.open({
        type: "warning",
        content: '"Please enter a name for your segment."',
      });
      return;
    }
    setSaving(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/segments`, { name: segmentName.trim(), query });
      messageApi.open({
        type: "success",
        content: `Segment "${segmentName.trim()}" has been created!`,
      });
      setModalVisible(false);
      navigate("/campaigns", {
        state: { toast: { type: "success", content: "Campaign launched!" } },
        replace: true,
      });
    } catch {
      messageApi.open({
        type: "error",
        content: "Failed to save segment",
      });
    } finally {
      setSaving(false);
    }
  };
  // const handleSave = async () => {
  //   const name = prompt("Enter a name for this segment");
  //   if (!name) return;
  //   try {
  //     await axios.post(`${import.meta.env.VITE_API_URL}/api/segments`, {
  //       name,
  //       query,
  //     });
  //     message.success("Segment saved!");
  //   } catch {
  //     message.error("Failed to save segment");
  //   }
  // };

  const onParse = async (text) => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/segments/parse-nl`, { text });
      setQuery(data.query);
    } catch {
      messageApi.open({
        type: "error",
        content: "Failed to parse description",
      });
    }
  };

  return (
    <>
      {contextHolder}
      <Card
        title="Describe & Build Your Segment"
        extra={
          <Button type="primary" onClick={handleSaveClick}>
            Save Segment
          </Button>
        }
        style={{ maxWidth: 800, margin: "2rem auto" }}
      >
        <Form layout="vertical">
          <Form.Item label="Describe segment in natural language">
            <Input.Search
              placeholder="e.g. totalSpend > 1000 AND tags contains VIP"
              enterButton="Parse"
              onSearch={onParse}
            />
          </Form.Item>
        </Form>

        <QueryBuilderAntD>
          <QueryBuilder
            fields={fields}
            getOperators={(field) => {
              const fieldData = fields.find((f) => f.name === field);
              return fieldData ? operatorsByType[fieldData.type] || [] : [];
            }}
            query={query}
            onQueryChange={setQuery}
          />
        </QueryBuilderAntD>

        <Space style={{ marginTop: 16 }}>
          <Typography.Text>{count === null ? "Calculating…" : `${count} customers match:`}</Typography.Text>
          {count !== null && <Typography.Text code>{formatQuery(query, "sql")}</Typography.Text>}
        </Space>
      </Card>

      <Modal
        title="Save Segment"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Save"
        confirmLoading={saving}
      >
        <Form layout="vertical">
          <Form.Item label="Segment Name">
            <Input
              placeholder="e.g. VIP Customers"
              value={segmentName}
              onChange={(e) => setSegmentName(e.target.value)}
              onPressEnter={handleModalOk}
              disabled={saving}
              autoFocus
            />
          </Form.Item>
        </Form>
        <Space direction="vertical">
          <Typography.Text type="secondary">
            {count === null ? "No Eligible Customers" : `${count} customers eligible`}
          </Typography.Text>
          {count !== null && <Typography.Paragraph code>{formatQuery(query, "sql")}</Typography.Paragraph>}
        </Space>
      </Modal>
    </>
  );
}
