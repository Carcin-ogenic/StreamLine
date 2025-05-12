import React, { useState, useEffect } from "react";
import { QueryBuilder, formatQuery } from "react-querybuilder";
import { QueryBuilderAntD } from "@react-querybuilder/antd";
import { Card, Space, Typography, Button, Form, Input, message } from "antd";
import axios from "axios";
import { fields, operatorsByType } from "../segmentConfig";
import "antd/dist/reset.css";
import "react-querybuilder/dist/query-builder.css";

export default function SegmentBuilder() {
  const [query, setQuery] = useState({ combinator: "and", rules: [] });
  const [count, setCount] = useState(null);

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

  const handleSave = async () => {
    const name = prompt("Enter a name for this segment");
    if (!name) return;
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/segments`, {
        name,
        query,
      });
      message.success("Segment saved!");
    } catch {
      message.error("Failed to save segment");
    }
  };

  const onParse = async (text) => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/segments/parse-nl`, { text });
      setQuery(data.query);
    } catch {
      message.error("Failed to parse description");
    }
  };

  return (
    <>
      <Card
        title="Describe & Build Your Segment"
        extra={
          <Button type="primary" onClick={handleSave}>
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
    </>
  );
}
