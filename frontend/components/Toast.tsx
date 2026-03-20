import React from "react";

interface ToastProps {
  toast: { show: boolean; message: string; type: string };
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  if (!toast.show) return null;

  const getBgColor = () => {
    if (toast.type === "error") return "#ef4444"; // Vermelho
    if (toast.type === "warning") return "#eab308"; // Amarelo
    return "#22c55e"; // Verde (sucesso)
  };

  return (
    <div style={{
      position: "fixed", bottom: "20px", right: "20px", zIndex: 9999,
      background: getBgColor(), color: "white", padding: "12px 24px", 
      borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", 
      fontWeight: "bold", transition: "all 0.3s ease", animation: "fadeIn 0.3s"
    }}>
      {toast.message}
    </div>
  );
};