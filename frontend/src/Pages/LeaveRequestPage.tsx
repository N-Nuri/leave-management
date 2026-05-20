import { useState, useCallback } from "react";
import type { CSSProperties, MouseEvent } from "react";

// ── helpers ──────────────────────────────────────────────────────────────────
const pad = (n: number): string => String(n).padStart(2, "0");

const todayStr: string = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
})();

function countWorkdays(start: string, end: string): number {
  let count = 0;
  const cur = new Date(start);
  const e = new Date(end);
  while (cur <= e) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function formatDate(str: string): string {
  return new Date(str).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ── constants ─────────────────────────────────────────────────────────────────
const LEAVE_TYPES: string[] = [
  "Phép năm",
  "Nghỉ ốm",
  "Nghỉ thai sản",
  "Nghỉ không lương",
  "Việc riêng",
];

const INITIAL_BALANCE = 12;
const INITIAL_USED = 3;

// ── types ─────────────────────────────────────────────────────────────────────
type LeaveStatus = "pending" | "approved" | "rejected";

interface LeaveEntry {
  id: number;
  type: string;
  start: string;
  end: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  submitted: string;
}

// ── sub-components ────────────────────────────────────────────────────────────

interface ToastProps {
  message: string;
  visible: boolean;
}

function Toast({ message, visible }: ToastProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        background: "#0F6E56",
        color: "#fff",
        padding: "10px 18px",
        borderRadius: 10,
        fontSize: 13,
        display: "flex",
        alignItems: "center",
        gap: 8,
        zIndex: 999,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-8px)",
        transition: "opacity .25s, transform .25s",
        pointerEvents: "none",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
      {message}
    </div>
  );
}

interface BalanceBarProps {
  balance: number;
  used: number;
}

function BalanceBar({ balance, used }: BalanceBarProps) {
  const total = balance + used;
  const pct = Math.round((used / total) * 100);
  return (
    <div style={{
      background: "#F0FBF7",
      border: "0.5px solid #9FE1CB",
      borderRadius: 12,
      padding: "14px 18px",
      marginBottom: 16,
      display: "flex",
      alignItems: "center",
      gap: 14,
    }}>
      <div style={{
        width: 40, height: 40,
        borderRadius: 10,
        background: "#E1F5EE",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: "#5F5E5A", marginBottom: 2 }}>Số dư ngày phép hiện tại</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
          <span style={{ fontSize: 22, fontWeight: 600, color: "#085041", lineHeight: 1 }}>{balance}</span>
          <span style={{ fontSize: 13, color: "#5F5E5A" }}>ngày còn lại</span>
        </div>
        <div style={{ height: 5, background: "#D3D1C7", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: "#1D9E75", borderRadius: 99, transition: "width .4s ease" }} />
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: "#888780" }}>Đã dùng</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#3B3A38" }}>{used}</div>
        <div style={{ fontSize: 11, color: "#888780" }}>ngày</div>
      </div>
    </div>
  );
}

interface TypeChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function TypeChip({ label, active, onClick }: TypeChipProps) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 12,
        padding: "5px 12px",
        borderRadius: 99,
        border: active ? "1.5px solid #0F6E56" : "0.5px solid #B4B2A9",
        background: active ? "#E1F5EE" : "transparent",
        color: active ? "#085041" : "#5F5E5A",
        cursor: "pointer",
        fontWeight: active ? 500 : 400,
        transition: "all .15s",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

interface FieldLabelProps {
  children: React.ReactNode;
}

function FieldLabel({ children }: FieldLabelProps) {
  return (
    <label style={{ display: "block", fontSize: 13, color: "#5F5E5A", marginBottom: 5, fontWeight: 500 }}>
      {children}
    </label>
  );
}

const inputStyle: CSSProperties = {
  width: "100%",
  fontSize: 14,
  padding: "8px 10px",
  borderRadius: 8,
  border: "0.5px solid #B4B2A9",
  background: "#fff",
  color: "#1a1a18",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

interface CalcBoxProps {
  days: number | null;
  balance: number;
}

function CalcBox({ days, balance }: CalcBoxProps) {
  let color = "#1a1a18";
  let bg = "#F1EFE8";

  if (days !== null) {
    if (days > balance) { color = "#A32D2D"; bg = "#FCEBEB"; }
    else if (days / balance > 0.7) { color = "#BA7517"; bg = "#FAEEDA"; }
  }

  return (
    <div style={{
      background: bg,
      borderRadius: 8,
      padding: "10px 14px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4,
      transition: "background .2s",
    }}>
      <div>
        <div style={{ fontSize: 13, color: "#5F5E5A" }}>Tổng ngày nghỉ (trừ T7, CN)</div>
        <div style={{ fontSize: 11, color: "#888780", marginTop: 1 }}>
          {days === null ? "Chọn ngày để tính" : days > balance ? "Vượt quá số dư ngày phép" : "Ngày làm việc thực tế"}
        </div>
      </div>
      <div style={{ fontSize: 20, fontWeight: 600, color, minWidth: 40, textAlign: "right" }}>
        {days === null ? "—" : `${days}`}
        {days !== null && <span style={{ fontSize: 12, fontWeight: 400, marginLeft: 3 }}>ngày</span>}
      </div>
    </div>
  );
}

interface ErrorMsgProps {
  show: boolean | null | undefined;
  children: React.ReactNode;
}

function ErrorMsg({ show, children }: ErrorMsgProps) {
  return show ? (
    <p style={{ fontSize: 12, color: "#A32D2D", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 4 }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      {children}
    </p>
  ) : null;
}

interface StatusBadgeProps {
  status: LeaveStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const map: Record<LeaveStatus, { bg: string; color: string; label: string }> = {
    pending: { bg: "#FAEEDA", color: "#854F0B", label: "PENDING" },
    approved: { bg: "#EAF3DE", color: "#3B6D11", label: "APPROVED" },
    rejected: { bg: "#FCEBEB", color: "#A32D2D", label: "REJECTED" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span style={{
      fontSize: 10, padding: "2px 8px", borderRadius: 99,
      background: s.bg, color: s.color, fontWeight: 600, letterSpacing: ".04em",
    }}>
      {s.label}
    </span>
  );
}

interface LeaveHistoryItemProps {
  item: LeaveEntry;
}

function LeaveHistoryItem({ item }: LeaveHistoryItemProps) {
  return (
    <div
      style={{
        padding: "12px 18px",
        borderBottom: "0.5px solid #E8E6E0",
        transition: "background .1s",
      }}
      onMouseEnter={(e: MouseEvent<HTMLDivElement>) => { e.currentTarget.style.background = "#FAFAF8"; }}
      onMouseLeave={(e: MouseEvent<HTMLDivElement>) => { e.currentTarget.style.background = "transparent"; }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{item.type}</span>
        <StatusBadge status={item.status} />
      </div>
      <div style={{ fontSize: 12, color: "#5F5E5A" }}>
        📅 {formatDate(item.start)} → {formatDate(item.end)}
      </div>
      <div style={{ fontSize: 12, color: "#888780", marginTop: 2 }}>
        {item.days} ngày làm việc · Gửi {item.submitted}
      </div>
      {item.reason && (
        <div style={{ fontSize: 12, color: "#5F5E5A", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          💬 {item.reason}
        </div>
      )}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export default function LeaveRequestPage() {
  const [balance, setBalance] = useState<number>(INITIAL_BALANCE);
  const [used, setUsed] = useState<number>(INITIAL_USED);
  const [leaveType, setLeaveType] = useState<string>(LEAVE_TYPES[0]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [history, setHistory] = useState<LeaveEntry[]>([]);
  const [toastMsg, setToastMsg] = useState<string>("");
  const [toastVisible, setToastVisible] = useState<boolean>(false);

  // derived
  const dateError: boolean = Boolean(startDate && endDate && endDate < startDate);
  const days: number | null = startDate && endDate && !dateError ? countWorkdays(startDate, endDate) : null;
  const balanceError: boolean = days !== null && days > balance;
  const canSubmit: boolean = days !== null && !dateError && !balanceError;

  const showToast = useCallback((msg: string): void => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  }, []);

  const handleSubmit = (): void => {
    if (!canSubmit || days === null) return;
    const entry: LeaveEntry = {
      id: Date.now(),
      type: leaveType,
      start: startDate,
      end: endDate,
      days,
      reason: reason.trim() || "Không có lý do",
      status: "pending",
      submitted: new Date().toLocaleDateString("vi-VN"),
    };
    setHistory((prev) => [entry, ...prev]);
    setBalance((b) => b - days);
    setUsed((u) => u + days);
    setStartDate("");
    setEndDate("");
    setReason("");
    showToast("Đơn xin nghỉ đã được gửi thành công!");
  };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "#1a1a18", minHeight: "100vh", background: "#FAFAF8", padding: "28px 24px" }}>
      <Toast message={toastMsg} visible={toastVisible} />

      {/* page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0, letterSpacing: "-.01em" }}>Đơn xin nghỉ phép</h1>
        <p style={{ fontSize: 13, color: "#5F5E5A", margin: "4px 0 0" }}>SCRUM-23 · Hệ thống quản lý nghỉ phép nhân viên</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)", gap: 20, maxWidth: 1000 }}>
        {/* LEFT — form */}
        <div>
          <BalanceBar balance={balance} used={used} />

          <div style={{ background: "#fff", border: "0.5px solid #D3D1C7", borderRadius: 12, padding: "20px 20px 18px" }}>

            {/* leave type */}
            <div style={{ marginBottom: 16 }}>
              <FieldLabel>Loại nghỉ</FieldLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {LEAVE_TYPES.map((t) => (
                  <TypeChip key={t} label={t} active={leaveType === t} onClick={() => setLeaveType(t)} />
                ))}
              </div>
            </div>

            {/* date row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 4 }}>
              <div>
                <FieldLabel>Ngày bắt đầu</FieldLabel>
                <input
                  type="date"
                  value={startDate}
                  min={todayStr}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <FieldLabel>Ngày kết thúc</FieldLabel>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || todayStr}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
            <ErrorMsg show={dateError}>Ngày kết thúc không được trước ngày bắt đầu</ErrorMsg>

            {/* calc box */}
            <div style={{ marginBottom: 4 }}>
              <CalcBox days={days} balance={balance} />
            </div>
            <ErrorMsg show={balanceError}>Số ngày xin nghỉ vượt quá số dư ngày phép hiện có ({balance} ngày)</ErrorMsg>

            {/* reason */}
            <div style={{ marginBottom: 16 }}>
              <FieldLabel>Lý do nghỉ</FieldLabel>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do xin nghỉ phép..."
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            {/* submit */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                width: "100%",
                padding: "10px 0",
                borderRadius: 8,
                border: "none",
                background: canSubmit ? "#0F6E56" : "#D3D1C7",
                color: canSubmit ? "#fff" : "#888780",
                fontSize: 14,
                fontWeight: 500,
                cursor: canSubmit ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                transition: "background .15s",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { if (canSubmit) e.currentTarget.style.background = "#085041"; }}
              onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { if (canSubmit) e.currentTarget.style.background = "#0F6E56"; }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              Gửi đơn xin nghỉ
            </button>
          </div>
        </div>

        {/* RIGHT — history */}
        <div>
          <div style={{ background: "#fff", border: "0.5px solid #D3D1C7", borderRadius: 12, overflow: "hidden" }}>
            <div style={{
              padding: "14px 18px",
              borderBottom: "0.5px solid #E8E6E0",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>My Leave History</span>
              <span style={{ fontSize: 12, color: "#888780" }}>{history.length} đơn</span>
            </div>

            {history.length === 0 ? (
              <div style={{ padding: "40px 18px", textAlign: "center", color: "#B4B2A9" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }} aria-hidden="true"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
                <p style={{ margin: 0, fontSize: 13 }}>Chưa có đơn xin nghỉ nào</p>
              </div>
            ) : (
              <div style={{ maxHeight: 480, overflowY: "auto" }}>
                {history.map((item) => (
                  <LeaveHistoryItem key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
