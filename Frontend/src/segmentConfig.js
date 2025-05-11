export const fields = [
  { name: "totalSpend", label: "Total Spend", valueType: "number" },
  { name: "lastVisit", label: "Last Visit", valueType: "date" },
  { name: "tags", label: "Tags", valueType: "string" },
];

export const operatorsByType = {
  number: ["=", "!=", "<", "<=", ">", ">="],
  date: ["=", "!=", "<", "<=", ">", ">="],
  string: ["contains", "doesNotContain", "=", "!="],
};
