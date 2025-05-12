export const fields = [
  { name: "totalSpend", label: "Total Spend", type: "number" },
  { name: "lastVisit", label: "Last Visit", type: "date" },
  { name: "tags", label: "Tags", type: "string" },
];

export const operatorsByType = {
  number: [
    { name: "=", label: "Equals" },
    { name: "!=", label: "Not equals" },
    { name: "<", label: "Less than" },
    { name: "<=", label: "Less than or equal" },
    { name: ">", label: "Greater than" },
    { name: ">=", label: "Greater than or equal" },
  ],
  date: [
    { name: "=", label: "Is" },
    { name: "!=", label: "Is not" },
    { name: "<", label: "Before" },
    { name: "<=", label: "On or before" },
    { name: ">", label: "After" },
    { name: ">=", label: "On or after" },
  ],
  string: [
    { name: "contains", label: "Contains" },
    { name: "doesNotContain", label: "Does not contain" },
    { name: "=", label: "Is" },
    { name: "!=", label: "Is not" },
  ],
};
