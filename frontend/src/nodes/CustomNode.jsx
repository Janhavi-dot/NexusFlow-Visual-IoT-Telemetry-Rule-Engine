
import { Handle, Position } from "@xyflow/react";

function CustomNode({ data, selected }) {
  const accentColor = data.accentColor || "#3b82f6";

  return (
    <div
      style={{
        minWidth: "180px",
        background: "#172033",
        border: `1px solid ${selected ? accentColor : "#334155"}`,
        borderRadius: "10px",
        padding: "14px",
        color: "#ffffff",
        boxShadow: selected
          ? `0 0 0 2px ${accentColor}40`
          : "0 4px 12px rgba(0,0,0,0.2)",
      }}
    >
      {/* Input connection */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: accentColor }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span style={{ fontSize: "22px" }}>
          {data.icon || "⚙️"}
        </span>

        <div>
          <div style={{ fontWeight: "600", fontSize: "13px" }}>
            {data.label || "Custom Node"}
          </div>

          <div
            style={{
              fontSize: "11px",
              color: accentColor,
              marginTop: "4px",
            }}
          >
            {data.category || "Workflow Component"}
          </div>
        </div>
      </div>

      {data.description && (
        <p
          style={{
            fontSize: "11px",
            color: "#94a3b8",
            marginBottom: 0,
          }}
        >
          {data.description}
        </p>
      )}

      {/* Output connection */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: accentColor }}
      />
    </div>
  );
}

export default CustomNode;
