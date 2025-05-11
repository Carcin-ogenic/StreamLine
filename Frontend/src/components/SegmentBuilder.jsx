import React, { useState, useEffect } from "react";
import { formatQuery } from "react-querybuilder";
import { AntdQueryBuilder } from "@react-querybuilder/antd";
import { Card, Space, Typography } from "antd";
import axios from "axios";
import { fields, operatorsByType } from "../segmentConfig";

export default function SegmentBuilder() {
  const [query, setQuery] = useState({ combinator: "and", rules: [] });
  const [count, setCount] = (useState < Number) | (null > null);

  useEffect(() => {
    const id = setTimeout(async () => {
      try {
        const res = await axios.post(import.meta.env.VITE_API_URL + "/api/segments/preview", query);
        setCount(res.data.count);
      } catch {
        setCount(null);
      }
    }, 500);
    return () => clearTimeout(id);
  }, [query, setCount]);

  // Handler to save the segment
  const handleSave = async () => {
    const name = prompt("Enter a name for this segment");
    if (!name) return;
    await axios.post(import.meta.env.VITE_API_URL + "/api/segments", {
      name,
      query,
    });
    alert("Segment saved!");
  };

  return (
    <Card
      title="Build Your Segment"
      extra={<button onClick={handleSave}>Save Segment</button>}
      style={{ maxWidth: 800, margin: "2rem auto" }}
    >
      <AntdQueryBuilder fields={fields} operators={operatorsByType} query={query} onQueryChange={setQuery} />
      <Space style={{ marginTop: 16 }}>
        <Typography.Text>{count == null ? "Calculating…" : `${count} customers match:`}</Typography.Text>
        {count != null && <Typography.Text code>{formatQuery(query, "sql")}</Typography.Text>}
      </Space>
    </Card>
  );
}
