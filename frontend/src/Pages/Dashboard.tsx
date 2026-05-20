import { useNavigate } from "react-router-dom";

// ── Types ─────────────────────────────────────────────────────────────────────
// Dùng chung với LeaveRequestPage — nên tách ra types/leave.ts sau
export type LeaveStatus = "pending" | "approved" | "rejected";

export interface HistoryItem {
  id: number;
  type: string;
  start: string;
  end: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  submitted: string;
}

// ── Mock data — thay bằng API call sau ────────────────────────────────────────
const MOCK_BALANCE = 12;
const MOCK_USED = 3;
const MOCK_TOTAL = MOCK_BALANCE + MOCK_USED;

const MOCK_HISTORY: HistoryItem[] = [
  { id: 1, type: "Phép năm", start: "2026-05-12", end: "2026-05-13", days: 2, reason: "", status: "pending", submitted: "10/05/2026" },
  { id: 2, type: "Phép năm", start: "2026-04-28", end: "2026-04-30", days: 3, reason: "", status: "approved", submitted: "25/04/2026" },
  { id: 3, type: "Nghỉ ốm", start: "2026-03-10", end: "2026-03-10", days: 1, reason: "", status: "approved", submitted: "10/03/2026" },
  { id: 4, type: "Phép năm", start: "2026-05-20", end: "2026-05-21", days: 2, reason: "", status: "pending", submitted: "15/05/2026" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(str: string) {
  return new Date(str).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getTodayLabel() {
  return new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: LeaveStatus }) {
  const map: Record<LeaveStatus, { bg: string; color: string; label: string }> = {
    pending:  { bg: "#FAEEDA", color: "#854F0B", label: "PENDING" },
    approved: { bg: "#EAF3DE", color: "#3B6D11", label: "APPROVED" },
    rejected: { bg: "#FCEBEB", color: "#A32D2D", label: "REJECTED" },
  };
  const s = map[status];
  return (
    <span style={{
      fontSize: 10,
      padding: "2px 8px",
      borderRadius: 99,
      background: s.bg,
      color: s.color,
      fontWeight: 600,
      letterSpacing: ".04em",
      flexShrink: 0,
    }}>
      {s.label}
    </span>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
  valueColor,
}: {
  label: string;
  value: number;
  sub: string;
  icon: string;
  valueColor?: string;
}) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statLabel}>
        <i className={`ti ${icon}`} style={{ fontSize: 14 }} aria-hidden="true" />
        {label}
      </div>
      <div style={{ ...styles.statValue, ...(valueColor ? { color: valueColor } : {}) }}>
        {value}
      </div>
      <div style={styles.statSub}>{sub}</div>
    </div>
  );
}

function BalanceBar({ balance, used, total }: { balance: number; used: number; total: number }) {
  const pct = Math.round((used / total) * 100);
  const isWarn = balance / total < 0.3;
  return (
    <div style={styles.balanceWrap}>
      <div style={styles.balanceRow}>
        <span style={styles.balanceTitle}>Tình trạng ngày phép năm 2026</span>
        <div style={styles.balanceNums}>
          <span>Còn lại <strong>{balance}</strong></span>
          <span>Đã dùng <strong>{used}</strong></span>
          <span>Tổng <strong>{total}</strong></span>
        </div>
      </div>
      <div style={styles.track}>
        <div
          style={{
            ...styles.fill,
            width: `${pct}%`,
            background: isWarn ? "#EF9F27" : "#1D9E75",
          }}
        />
      </div>
    </div>
  );
}

function HistoryRow({ item }: { item: HistoryItem }) {
  const iconMap: Record<string, { bg: string; color: string; icon: string }> = {
    "Phép năm":      { bg: "#FAEEDA", color: "#BA7517", icon: "ti-sun" },
    "Nghỉ ốm":       { bg: "#E6F1FB", color: "#185FA5", icon: "ti-heart-rate-monitor" },
    "Nghỉ thai sản": { bg: "#FBEAF0", color: "#993556", icon: "ti-baby-carriage" },
    "Nghỉ không lương": { bg: "#F1EFE8", color: "#5F5E5A", icon: "ti-calendar-off" },
    "Việc riêng":    { bg: "#EEEDFE", color: "#534AB7", icon: "ti-briefcase" },
  };
  const ic = iconMap[item.type] ?? { bg: "#F1EFE8", color: "#5F5E5A", icon: "ti-calendar" };

  return (
    <div style={styles.histRow}>
      <div style={{ ...styles.histIcon, background: ic.bg }}>
        <i className={`ti ${ic.icon}`} style={{ fontSize: 16, color: ic.color }} aria-hidden="true" />
      </div>
      <div style={styles.histInfo}>
        <div style={styles.histType}>{item.type}</div>
        <div style={styles.histDate}>
          {formatDate(item.start)} → {formatDate(item.end)} · {item.days} ngày
        </div>
      </div>
      <StatusBadge status={item.status} />
    </div>
  );
}

function QuickButton({
  label,
  sub,
  iconBg,
  iconColor,
  icon,
  onClick,
}: {
  label: string;
  sub: string;
  iconBg: string;
  iconColor: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button style={styles.quickBtn} onClick={onClick}>
      <div style={{ ...styles.quickIcon, background: iconBg }}>
        <i className={`ti ${icon}`} style={{ fontSize: 17, color: iconColor }} aria-hidden="true" />
      </div>
      <div style={{ flex: 1, textAlign: "left" }}>
        <div style={styles.quickLabel}>{label}</div>
        <div style={styles.quickSub}>{sub}</div>
      </div>
      <i className="ti ti-chevron-right" style={{ fontSize: 15, color: "#888780" }} aria-hidden="true" />
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();

  // TODO: thay bằng dữ liệu thực từ API
  const balance = MOCK_BALANCE;
  const used = MOCK_USED;
  const total = MOCK_TOTAL;
  const recentHistory = MOCK_HISTORY.slice(0, 4);

  const pendingCount = MOCK_HISTORY.filter((i) => i.status === "pending").length;
  const approvedCount = MOCK_HISTORY.filter((i) => i.status === "approved").length;

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.topBar}>
        <div>
          <span style={styles.greeting}>
            Xin chào, Nguyễn Văn A
          </span>
          <span style={styles.greetingSub}> · Nhân viên · Dev 5</span>
        </div>
        <div style={styles.dateChip}>
          <i className="ti ti-calendar" style={{ fontSize: 13 }} aria-hidden="true" />
          {getTodayLabel()}
        </div>
      </div>

      {/* Stat cards */}
      <div style={styles.statsGrid}>
        <StatCard label="Ngày phép còn lại" value={balance} sub={`/ ${total} ngày tổng`}  icon="ti-calendar-event" valueColor="#0F6E56" />
        <StatCard label="Đã sử dụng"         value={used}    sub="ngày trong năm"           icon="ti-calendar-minus" />
        <StatCard label="Đang chờ duyệt"     value={pendingCount}  sub="đơn pending"        icon="ti-clock-hour-4"  valueColor="#BA7517" />
        <StatCard label="Đã được duyệt"      value={approvedCount} sub="đơn approved"       icon="ti-circle-check"  valueColor="#3B6D11" />
      </div>

      {/* Balance bar */}
      <BalanceBar balance={balance} used={used} total={total} />

      {/* Two column */}
      <div style={styles.twoCol}>

        {/* Recent history */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>
              <i className="ti ti-clock-hour-4" style={{ fontSize: 16 }} aria-hidden="true" />
              Đơn gần đây
            </span>
            <span
              style={styles.cardAction}
              onClick={() => navigate("/leave-history")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate("/leave-history")}
            >
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
              <i className="ti ti-bolt" style={{ fontSize: 16 }} aria-hidden="true" />
              Thao tác nhanh
            </span>
          </div>
          <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 4 }}>
            <QuickButton
              label="Tạo đơn xin nghỉ"
              sub="Điền form và gửi manager"
              icon="ti-file-plus"
              iconBg="#E1F5EE"
              iconColor="#0F6E56"
              onClick={() => navigate("/leave-request")}
            />
            <QuickButton
              label="Lịch sử nghỉ phép"
              sub="Xem tất cả đơn đã gửi"
              icon="ti-clock-hour-4"
              iconBg="#E6F1FB"
              iconColor="#185FA5"
              onClick={() => navigate("/leave-history")}
            />
            <QuickButton
              label="Hồ sơ cá nhân"
              sub="Thông tin tài khoản"
              icon="ti-user-circle"
              iconBg="#EEEDFE"
              iconColor="#534AB7"
              onClick={() => navigate("/profile")}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: "#FAFAF8",
    padding: 24,
    minHeight: "100vh",
    color: "#1a1a18",
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    fontWeight: 500,
    color: "#1a1a18",
  },
  greetingSub: {
    fontSize: 13,
    color: "#888780",
  },
  dateChip: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "#5F5E5A",
    background: "#fff",
    border: "0.5px solid #D3D1C7",
    borderRadius: 8,
    padding: "5px 10px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0,1fr))",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    background: "#F1EFE8",
    borderRadius: 8,
    padding: "14px 16px",
  },
  statLabel: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 12,
    color: "#5F5E5A",
    marginBottom: 6,
  },
  statValue: {
    fontSize: 26,
    fontWeight: 500,
    color: "#1a1a18",
    lineHeight: 1,
  },
  statSub: {
    fontSize: 11,
    color: "#888780",
    marginTop: 4,
  },
  balanceWrap: {
    background: "#fff",
    border: "0.5px solid #D3D1C7",
    borderRadius: 12,
    padding: "16px 18px",
    marginBottom: 16,
  },
  balanceRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  balanceTitle: {
    fontSize: 13,
    color: "#5F5E5A",
  },
  balanceNums: {
    display: "flex",
    gap: 16,
    fontSize: 12,
    color: "#888780",
  },
  track: {
    height: 6,
    background: "#D3D1C7",
    borderRadius: 99,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 99,
    transition: "width .4s",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)",
    gap: 16,
  },
  card: {
    background: "#fff",
    border: "0.5px solid #D3D1C7",
    borderRadius: 12,
    overflow: "hidden",
  },
  cardHeader: {
    padding: "14px 18px",
    borderBottom: "0.5px solid #E8E6E0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 500,
    color: "#1a1a18",
    display: "flex",
    alignItems: "center",
    gap: 7,
  },
  cardAction: {
    fontSize: 12,
    color: "#0F6E56",
    cursor: "pointer",
  },
  histRow: {
    padding: "12px 18px",
    borderBottom: "0.5px solid #E8E6E0",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  histIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  histInfo: {
    flex: 1,
    minWidth: 0,
  },
  histType: {
    fontSize: 13,
    fontWeight: 500,
    color: "#1a1a18",
  },
  histDate: {
    fontSize: 11,
    color: "#888780",
    marginTop: 2,
  },
  quickBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 8,
    cursor: "pointer",
    border: "none",
    background: "transparent",
    width: "100%",
    fontFamily: "inherit",
    transition: "background .12s",
  },
  quickIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  quickLabel: {
    fontSize: 13,
    color: "#1a1a18",
    fontWeight: 500,
  },
  quickSub: {
    fontSize: 11,
    color: "#888780",
    marginTop: 1,
  },
  empty: {
    padding: "28px 18px",
    textAlign: "center",
    color: "#888780",
    fontSize: 13,
  },
};
