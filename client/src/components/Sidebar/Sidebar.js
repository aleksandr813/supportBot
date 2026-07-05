import { useState } from "react";
import { MessageSquare, Settings, LogOut } from "lucide-react";
import "./Sidebar.css";

const menuItems = [
  { key: "chats", label: "Чаты", icon: MessageSquare },
  { key: "settings", label: "Настройки", icon: Settings },
];

export default function Sidebar({ onNavigate, onLogout }) {
  const [active, setActive] = useState("chats");

  const handleClick = (key) => {
    setActive(key);
    onNavigate?.(key);
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar__nav">
        {menuItems.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handleClick(key)}
            className={`sidebar__item ${
              active === key ? "sidebar__item--active" : ""
            }`}
          >
            <Icon size={20} strokeWidth={2} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar__footer">
        <button className="sidebar__logout" onClick={onLogout}>
          <LogOut size={20} strokeWidth={2} />
          <span>Выйти</span>
        </button>
      </div>
    </aside>
  );
}