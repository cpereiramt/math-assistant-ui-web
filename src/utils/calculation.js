export const calculationMessage= (error) => error.response?.data?.message || error.message;
export const calculationLabel = ({ value, unit }) => [value, unit].filter(Boolean).join(" ");
export const dimensionLabel = (unit) => unit.dimension.startsWith("CUSTOM:")
  ? unit.dimension.slice("CUSTOM:".length) : unit.dimension.toLowerCase();
