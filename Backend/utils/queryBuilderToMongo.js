export function buildMongoFilter(node) {
  if (node.rules) {
    const clauses = node.rules.map(buildMongoFilter);
    return node.combinator === "and" ? { $and: clauses } : { $or: clauses };
  }
  const { field, operator, value } = node;
  switch (operator) {
    case "=":
      return { [field]: value };
    case "!=":
      return { [field]: { $ne: value } };
    case "<":
      return { [field]: { $lt: value } };
    case "<=":
      return { [field]: { $lte: value } };
    case ">":
      return { [field]: { $gt: value } };
    case ">=":
      return { [field]: { $gte: value } };
    case "contains":
      return { [field]: { $regex: value, $options: "i" } };
    case "doesNotContain":
      return { [field]: { $not: { $regex: value, $options: "i" } } };
    default:
      return {};
  }
}
