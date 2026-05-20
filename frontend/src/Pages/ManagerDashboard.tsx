import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import apiClient from "../services/api";

// ── Types ─────────────────────────────────────────────────────────────────────
type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  reviewNote: string | null;
  createdAt: string;
}

interface TeamBalance {
  userId: number;
  fullName: string;
  remainingDays: number;
  usedDays: number;
  totalDays: number;
  carriedOverDays: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(str: string) {
  return new Date(str).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const LEAVE_LABEL: Record<string, string> = {
  ANNUAL: "Phép năm", SICK: "Nghỉ ốm", UNPAID: "Nghỉ không lương", OTHER: "Việc riêng",
};

// ── Sub-components ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: LeaveStatus }) {
  const map: Record<LeaveStatus, { bg: string; color: string }> = {
    PENDING:   { bg: "#FAEEDA", color: "#854F0B" },
    APPROVED:  { bg: "#EAF3DE", color: "#3B6D11" },
    REJECTED:  { bg: "#FCEBEB", color: "#A32D2D" },
    CANCELLED: { bg: "#F1EFE8", color: "#5F5E5A" },
  };
  const s = map[status] ?? map.PENDING;
  return (
    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: s.bg, color: s.color, fontWeight: 600, letterSpacing: ".04em" }}>
      {status}
    </span>
  );
}

function Toast({ message, visible, isError }: { message: string; visible: boolean; isError?: boolean }) {
  return (
    <div style={{
      position: "fixed", top: 20, right: 20,
      background: isError ? "#A32D2D" : "#0F6E56",
      color: "#fff", padding: "10px 18px", borderRadius: 10,
      fontSize: 13, zIndex: 999,
      opacity: visible ? 1 : 0, transition: "opacity .25s", pointerEvents: "none",
    }}>
      {message}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ManagerDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<"pending" | "all" | "team">("pending");
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [allRequests, setAllRequests] = useState<LeaveRequest[]>([]);
  const [teamBalances, setTeamBalances] = useState<TeamBalance[]>([]);
  const [rejectNote, setRejectNote] = useState<Record<number, string>>({});
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastError, setToastError] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      apiClient.get("/manager/pending-requests"),
      apiClient.get("/manager/team-requests"),
      apiClient.get("/leave-balance/team"),
    ]).then(([pendRes, allRes, balRes]) => {
      setPendingRequests(pendRes.data);
      setAllRequests(allRes.data);
      setTeamBalances(balRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const showToast = (msg: string, error = false) => {
    setToastMsg(msg); setToastError(error); setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handleApprove = async (id: number) => {
    try {
      await apiClient.post(`/manager/leave-requests/${id}/approve`);
      showToast("Đã duyệt đơn xin nghỉ.");
      loadData();
    } catch {
      showToast("Duyệt thất bại.", true);
    }
  };

  const handleReject = async (id: number) => {
    const note = rejectNote[id] ?? "";
    try {
      await apiClient.post(`/manager/leave-requests/${id}/reject`, { note });
      showToast("Đã từ chối đơn xin nghỉ.");
      setRejectNote((prev) => { const n = { ...prev }; delete n[id]; return n; });
      loadData();
    } catch {
      showToast("Từ chối thất bại.", true);
    }
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 18px", fontSize: 13, fontWeight: active ? 600 : 400,
    borderBottom: active ? "2px solid #0F6E56" : "2px solid transparent",
    color: active ? "#0F6E56" : "#5F5E5A",
    background: "none", border: "none", borderBottom: active ? "2px solid #0F6E56" : "2px solid transparent",
    cursor: "pointer", fontFamily: "inherit",
  });

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#FAFAF8", minHeight: "100vh", padding: 24, color: "#1a1a18" }}>
      <Toast message={toastMsg} visible={toastVisible} isError={toastError} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Manager Dashboard</h1>
          <p style={{ fontSize: 13, color: "#5F5E5A", margin: "4px 0 0" }}>Xin chào, {user?.fullName} · Quản lý</p>
        </div>
        <button onClick={logout} style={{ fontSize: 13, padding: "6px 14px", borderRadius: 8, border: "0.5px solid #D3D1C7", background: "#fff", cursor: "pointer", color: "#A32D2D" }}>
          Đăng xuất
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Chờ duyệt", value: pendingRequests.length, color: "#BA7517" },
          { label: "Tổng đơn team", value: allRequests.length, color: "#1a1a18" },
          { label: "Thành viên", value: teamBalances.length, color: "#0F6E56" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#F1EFE8", borderRadius: 8, padding: "14px 18px" }}>
            <div style={{ fontSize: 12, color: "#5F5E5A", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 500, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ background: "#fff", border: "0.5px solid #D3D1C7", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "flex", borderBottom: "0.5px solid #E8E6E0", padding: "0 8px" }}>
          <button style={tabStyle(tab === "pending")} onClick={() => setTab("pending")}>
            Chờ duyệt {pendingRequests.length > 0 && <span style={{ background: "#FAEEDA", color: "#854F0B", borderRadius: 99, padding: "1px 7px", marginLeft: 6, fontSize: 11 }}>{pendingRequests.length}</span>}
          </button>
          <button style={tabStyle(tab === "all")} onClick={() => setTab("all")}>Tất cả đơn</button>
          <button style={tabStyle(tab === "team")} onClick={() => setTab("team")}>Số dư team</button>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#888" }}>Đang tải...</div>
        ) : (
          <>
            {/* Pending tab */}
            {tab === "pending" && (
              pendingRequests.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#B4B2A9", fontSize: 13 }}>
                  Không có đơn nào chờ duyệt ✓
                </div>
              ) : (
                pendingRequests.map((req) => (
                  <div key={req.id} style={{ padding: "16px 20px", borderBottom: "0.5px solid #E8E6E0" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{req.employeeName}</span>
                          <StatusBadge status={req.status} />
                        </div>
                        <div style={{ fontSize: 13, color: "#5F5E5A" }}>
                          {LEAVE_LABEL[req.leaveType] ?? req.leaveType} · {req.daysCount} ngày
                        </div>
                        <div style={{ fontSize: 12, color: "#888780", marginTop: 2 }}>
                          📅 {formatDate(req.startDate)} → {formatDate(req.endDate)}
                        </div>
                        {req.reason && (
                          <div style={{ fontSize: 12, color: "#5F5E5A", marginTop: 4 }}>💬 {req.reason}</div>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0, minWidth: 160 }}>
                        <button
                          onClick={() => handleApprove(req.id)}
                          style={{ padding: "7px 14px", borderRadius: 7, border: "none", background: "#0F6E56", color: "#fff", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                          ✓ Duyệt
                        </button>
                        <div style={{ display: "flex", gap: 4 }}>
                          <input
                            type="text"
                            placeholder="Lý do từ chối..."
                            value={rejectNote[req.id] ?? ""}
                            onChange={(e) => setRejectNote((p) => ({ ...p, [req.id]: e.target.value }))}
                            style={{ flex: 1, fontSize: 12, padding: "5px 8px", borderRadius: 6, border: "0.5px solid #B4B2A9", fontFamily: "inherit" }}
                          />
                          <button
                            onClick={() => handleReject(req.id)}
                            style={{ padding: "5px 10px", borderRadius: 6, border: "0.5px solid #A32D2D", background: "#fff", color: "#A32D2D", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                            Từ chối
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )
            )}

            {/* All tab */}
            {tab === "all" && (
              allRequests.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#B4B2A9", fontSize: 13 }}>Chưa có đơn nào</div>
              ) : (
                allRequests.map((req) => (
                  <div key={req.id} style={{ padding: "14px 20px", borderBottom: "0.5px solid #E8E6E0", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{req.employeeName}</span>
                        <StatusBadge status={req.status} />
                      </div>
                      <div style={{ fontSize: 12, color: "#5F5E5A" }}>
                        {LEAVE_LABEL[req.leaveType] ?? req.leaveType} · {req.daysCount} ngày · {formatDate(req.startDate)} → {formatDate(req.endDate)}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: "#888780" }}>{formatDate(req.createdAt)}</div>
                  </div>
                ))
              )
            )}

            {/* Team balances tab */}
            {tab === "team" && (
              teamBalances.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#B4B2A9", fontSize: 13 }}>Chưa có dữ liệu</div>
              ) : (
                teamBalances.map((member) => {
                  const total = member.totalDays + member.carriedOverDays;
                  const pct = total > 0 ? Math.round((member.usedDays / total) * 100) : 0;
                  return (
                    <div key={member.userId} style={{ padding: "14px 20px", borderBottom: "0.5px solid #E8E6E0" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{member.fullName}</span>
                        <div style={{ fontSize: 12, color: "#5F5E5A", display: "flex", gap: 14 }}>
                          <span>Còn lại <strong style={{ color: "#0F6E56" }}>{member.remainingDays}</strong></span>
                          <span>Đã dùng <strong>{member.usedDays}</strong></span>
                          <span>Tổng <strong>{total}</strong></span>
                        </div>
                      </div>
                      <div style={{ height: 5, background: "#D3D1C7", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: pct > 70 ? "#EF9F27" : "#1D9E75", borderRadius: 99 }} />
                      </div>
                    </div>
                  );
                })
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
