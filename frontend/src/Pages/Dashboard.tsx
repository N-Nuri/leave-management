import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import apiClient from "../services/api";

// ── Types ─────────────────────────────────────────────────────────────────────
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface HistoryItem {
  id: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
}

interface Balance {
  totalDays: number;
  usedDays: number;
  carriedOverDays: number;
  remainingDays: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(str: string) {
  return new Date(str).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function getTodayLabel() {
  return new Date().toLocaleDateString("vi-VN", {
    weekday: "long", day: "2-digit", month: "2-digit", year: "numeric",
  });
}

const LEAVE_TYPE_LABEL: Record<string, string> = {
  ANNUAL: "Phép năm",
  SICK: "Nghỉ ốm",
  UNPAID: "Nghỉ không lương",
  OTHER: "Việc riêng",
};

// ── Sub-components ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: LeaveStatus }) {
  const map: Record<LeaveStatus, { bg: string; color: string; label: string }> = {
    PENDING:   { bg: "#FAEEDA", color: "#854F0B", label: "PENDING" },
    APPROVED:  { bg: "#EAF3DE", color: "#3B6D11", label: "APPROVED" },
    REJECTED:  { bg: "#FCEBEB", color: "#A32D2D", label: "REJECTED" },
    CANCELLED: { bg: "#F1EFE8", color: "#5F5E5A", label: "CANCELLED" },
  };
  const s = map[status] ?? map.PENDING;
  return (
    <span style={{
      fontSize: 10, padding: "2px 8px", borderRadius: 99,
      background: s.bg, color: s.color, fontWeight: 600, letterSpacing: ".04em", flexShrink: 0,
    }}>
      {s.label}
    </span>
  );
}

function StatCard({ label, value, sub, icon, valueColor }: {
  label: string; value: number | string; sub: string; icon: string; valueColor?: string;
}) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statLabel}>
        <i className={`ti ${icon}`} style={{ fontSize: 14 }} />
        {label}
      </div>
      <div style={{ ...styles.statValue, ...(valueColor ? { color: valueColor } : {}) }}>
        {value}
      </div>
      <div style={styles.statSub}>{sub}</div>
    </div>
  );
}

function BalanceBar({ balance }: { balance: Balance }) {
  const total = balance.totalDays + balance.carriedOverDays;
  const pct = total > 0 ? Math.round((balance.usedDays / total) * 100) : 0;
  const isWarn = balance.remainingDays / (total || 1) < 0.3;
  return (
    <div style={styles.balanceWrap}>
      <div style={styles.balanceRow}>
        <span style={styles.balanceTitle}>Tình trạng ngày phép năm {new Date().getFullYear()}</span>
        <div style={styles.balanceNums}>
          <span>Còn lại <strong>{balance.remainingDays}</strong></span>
          <span>Đã dùng <strong>{balance.usedDays}</strong></span>
          <span>Tổng <strong>{total}</strong></span>
        </div>
      </div>
      <div style={styles.track}>
        <div style={{ ...styles.fill, width: `${pct}%`, background: isWarn ? "#EF9F27" : "#1D9E75" }} />
      </div>
    </div>
  );
}

function HistoryRow({ item }: { item: HistoryItem }) {
  const iconMap: Record<string, { bg: string; color: string; icon: string }> = {
    ANNUAL:  { bg: "#FAEEDA", color: "#BA7517", icon: "ti-sun" },
    SICK:    { bg: "#E6F1FB", color: "#185FA5", icon: "ti-heart-rate-monitor" },
    UNPAID:  { bg: "#F1EFE8", color: "#5F5E5A", icon: "ti-calendar-off" },
    OTHER:   { bg: "#EEEDFE", color: "#534AB7", icon: "ti-briefcase" },
  };
  const ic = iconMap[item.leaveType] ?? { bg: "#F1EFE8", color: "#5F5E5A", icon: "ti-calendar" };
  return (
    <div style={styles.histRow}>
      <div style={{ ...styles.histIcon, background: ic.bg }}>
        <i className={`ti ${ic.icon}`} style={{ fontSize: 16, color: ic.color }} />
      </div>
      <div style={styles.histInfo}>
        <div style={styles.histType}>{LEAVE_TYPE_LABEL[item.leaveType] ?? item.leaveType}</div>
        <div style={styles.histDate}>
          {formatDate(item.startDate)} → {formatDate(item.endDate)} · {item.daysCount} ngày
        </div>
      </div>
      <StatusBadge status={item.status} />
    </div>
  );
}

function QuickButton({ label, sub, iconBg, iconColor, icon, onClick }: {
  label: string; sub: string; iconBg: string; iconColor: string; icon: string; onClick: () => void;
}) {
  return (
    <button style={styles.quickBtn} onClick={onClick}>
      <div style={{ ...styles.quickIcon, background: iconBg }}>
        <i className={`ti ${icon}`} style={{ fontSize: 17, color: iconColor }} />
      </div>
      <div style={{ flex: 1, textAlign: "left" }}>
        <div style={styles.quickLabel}>{label}</div>
        <div style={styles.quickSub}>{sub}</div>
      </div>
      <i className="ti ti-chevron-right" style={{ fontSize: 15, color: "#888780" }} />
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [balance, setBalance] = useState<Balance>({ totalDays: 12, usedDays: 0, carriedOverDays: 0, remainingDays: 12 });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get("/leave-balance/me"),
      apiClient.get("/leave-requests"),
    ]).then(([balRes, reqRes]) => {
      setBalance(balRes.data);
      setHistory(reqRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const pendingCount  = history.filter((i) => i.status === "PENDING").length;
  const approvedCount = history.filter((i) => i.status === "APPROVED").length;
  const recentHistory = history.slice(0, 4);

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.topBar}>
        <div>
          <span style={styles.greeting}>Xin chào, {user?.fullName ?? "..."}</span>
          <span style={styles.greetingSub}> · Nhân viên</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={styles.dateChip}>
            <i className="ti ti-calendar" style={{ fontSize: 13 }} />
            {getTodayLabel()}
          </div>
          <button onClick={logout} style={styles.logoutBtn}>Đăng xuất</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#888" }}>Đang tải dữ liệu...</div>
      ) : (
        <>
          {/* Stat cards */}
          <div style={styles.statsGrid}>
            <StatCard label="Ngày phép còn lại" value={balance.remainingDays} sub={`/ ${balance.totalDays + balance.carriedOverDays} ngày tổng`} icon="ti-calendar-event" valueColor="#0F6E56" />
            <StatCard label="Đã sử dụng"         value={balance.usedDays}    sub="ngày trong năm"         icon="ti-calendar-minus" />
            <StatCard label="Đang chờ duyệt"     value={pendingCount}         sub="đơn pending"            icon="ti-clock-hour-4"   valueColor="#BA7517" />
            <StatCard label="Đã được duyệt"      value={approvedCount}        sub="đơn approved"           icon="ti-circle-check"   valueColor="#3B6D11" />
          </div>

          {/* Balance bar */}
          <BalanceBar balance={balance} />

          {/* Two column */}
          <div style={styles.twoCol}>
            {/* Recent history */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>
                  <i className="ti ti-clock-hour-4" style={{ fontSize: 16 }} /> Đơn gần đây
                </span>
                <span style={styles.cardAction} onClick={() => navigate("/leave-history")} role="button" tabIndex={0}>
                  Xem tất cả →
                </span>
              </div>
              {recentHistory.length === 0 ? (
                <div style={styles.empty}>Chưa có đơn xin nghỉ nào</div>
              ) : (
                recentHistory.map((item) => <HistoryRow key={item.id} item={item} />)
              )}
            </div>

            {/* Quick actions */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>
                  <i className="ti ti-bolt" style={{ fontSize: 16 }} /> Thao tác nhanh
                </span>
              </div>
              <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                <QuickButton label="Tạo đơn xin nghỉ"  sub="Điền form và gửi manager"  icon="ti-file-plus"    iconBg="#E1F5EE" iconColor="#0F6E56" onClick={() => navigate("/leave-request")} />
                <QuickButton label="Lịch sử nghỉ phép" sub="Xem tất cả đơn đã gửi"     icon="ti-clock-hour-4" iconBg="#E6F1FB" iconColor="#185FA5" onClick={() => navigate("/leave-history")} />
                <QuickButton label="Hồ sơ cá nhân"     sub="Thông tin tài khoản"        icon="ti-user-circle"  iconBg="#EEEDFE" iconColor="#534AB7" onClick={() => navigate("/profile")} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page:        { fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#FAFAF8", padding: 24, minHeight: "100vh", color: "#1a1a18" },
  topBar:      { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  greeting:    { fontSize: 16, fontWeight: 500, color: "#1a1a18" },
  greetingSub: { fontSize: 13, color: "#888780" },
  dateChip:    { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#5F5E5A", background: "#fff", border: "0.5px solid #D3D1C7", borderRadius: 8, padding: "5px 10px" },
  logoutBtn:   { fontSize: 12, padding: "5px 12px", borderRadius: 8, border: "0.5px solid #D3D1C7", background: "#fff", cursor: "pointer", color: "#A32D2D" },
  statsGrid:   { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 16 },
  statCard:    { background: "#F1EFE8", borderRadius: 8, padding: "14px 16px" },
  statLabel:   { display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#5F5E5A", marginBottom: 6 },
  statValue:   { fontSize: 26, fontWeight: 500, color: "#1a1a18", lineHeight: 1 },
  statSub:     { fontSize: 11, color: "#888780", marginTop: 4 },
  balanceWrap: { background: "#fff", border: "0.5px solid #D3D1C7", borderRadius: 12, padding: "16px 18px", marginBottom: 16 },
  balanceRow:  { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  balanceTitle:{ fontSize: 13, color: "#5F5E5A" },
  balanceNums: { display: "flex", gap: 16, fontSize: 12, color: "#888780" },
  track:       { height: 6, background: "#D3D1C7", borderRadius: 99, overflow: "hidden" },
  fill:        { height: "100%", borderRadius: 99, transition: "width .4s" },
  twoCol:      { display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: 16 },
  card:        { background: "#fff", border: "0.5px solid #D3D1C7", borderRadius: 12, overflow: "hidden" },
  cardHeader:  { padding: "14px 18px", borderBottom: "0.5px solid #E8E6E0", display: "flex", alignItems: "center", justifyContent: "space-between" },
  cardTitle:   { fontSize: 13, fontWeight: 500, color: "#1a1a18", display: "flex", alignItems: "center", gap: 7 },
  cardAction:  { fontSize: 12, color: "#0F6E56", cursor: "pointer" },
  histRow:     { padding: "12px 18px", borderBottom: "0.5px solid #E8E6E0", display: "flex", alignItems: "center", gap: 12 },
  histIcon:    { width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  histInfo:    { flex: 1, minWidth: 0 },
  histType:    { fontSize: 13, fontWeight: 500, color: "#1a1a18" },
  histDate:    { fontSize: 11, color: "#888780", marginTop: 2 },
  quickBtn:    { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, cursor: "pointer", border: "none", background: "transparent", width: "100%", fontFamily: "inherit" },
  quickIcon:   { width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  quickLabel:  { fontSize: 13, color: "#1a1a18", fontWeight: 500 },
  quickSub:    { fontSize: 11, color: "#888780", marginTop: 1 },
  empty:       { padding: "28px 18px", textAlign: "center", color: "#888780", fontSize: 13 },
};
