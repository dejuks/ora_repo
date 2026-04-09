import React from "react";

export default function RolePageTemplate({
  title,
  description,
  children,
}) {
  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <h2
          style={{
            margin: 0,
            marginBottom: "12px",
            fontSize: "20px",
            fontWeight: 700,
          }}
        >
          {title}
        </h2>

        {description && (
          <p
            style={{
              marginTop: 0,
              marginBottom: "16px",
              color: "#6b7280",
            }}
          >
            {description}
          </p>
        )}

        <div>{children}</div>
      </div>
    </div>
  );
}