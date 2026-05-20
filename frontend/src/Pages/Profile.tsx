import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiClient from "../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserProfile {
  name: string;
  department: string;
  email: string;
  role: string;
  employeeId: string;
  joinDate: string;
  avatarInitials: string;
  remainingLeave: number;
  usedLeave: number;
  totalLeave: number;
}

interface ProfileProps {
  user?: UserProfile;
  onLogout?: () => void;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@300;400;500&display=swap');
  @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.x/dist/tabler-icons.min.css');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .pf-page {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    background: #f0f4f8;
    padding: 32px 24px 48px;
  }

  /* ── Header ── */
  .pf-header {
    max-width: 720px;
    margin: 0 auto 28px;
    animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both;
  }

  .pf-breadcrumb {
    font-size: 12px;
    color: #8fa3b0;
    margin-bottom: 6px;
    letter-spacing: 0.02em;
  }

  .pf-breadcrumb span { color: #1C3A5E; font-weight: 500; }

  .pf-page-title {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    font-weight: 600;
    color: #1a2e44;
  }

  /* ── Layout ── */
  .pf-layout {
    max-width: 720px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* ── Card base ── */
  .pf-card {
    background: rgba(255,255,255,0.88);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.8);
    border-radius: 16px;
    padding: 28px 32px;
    box-shadow: 0 2px 8px rgba(28,58,94,0.06), 0 12px 32px rgba(28,58,94,0.07);
  }

  /* ── Hero card ── */
  .pf-hero {
    display: flex;
    align-items: center;
    gap: 24px;
    animation: fadeUp 0.45s 0.05s cubic-bezier(0.22,1,0.36,1) both;
  }

  .pf-avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1C3A5E 0%, #2e5f96 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    font-weight: 600;
    color: #5DCAA5;
    flex-shrink: 0;
    box-shadow: 0 4px 14px rgba(28,58,94,0.22);
    letter-spacing: -0.02em;
  }

  .pf-hero-info { flex: 1; }

  .pf-hero-name {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 600;
    color: #1a2e44;
    margin-bottom: 4px;
  }

  .pf-hero-role {
    font-size: 13px;
    color: #6b808f;
    margin-bottom: 10px;
  }

  .pf-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: rgba(93,202,165,0.12);
    border: 1px solid rgba(93,202,165,0.3);
    border-radius: 20px;
    padding: 3px 10px;
    font-size: 11px;
    font-weight: 500;
    color: #2a7d5f;
    letter-spacing: 0.02em;
  }

  .pf-badge-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #5DCAA5;
  }

  /* ── Info grid ── */
  .pf-info-card {
    animation: fadeUp 0.45s 0.10s cubic-bezier(0.22,1,0.36,1) both;
  }

  .pf-section-label {
    font-size: 11px;
    font-weight: 500;
    color: #8fa3b0;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 18px;
  }

  .pf-info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .pf-info-item {}

  .pf-info-label {
    font-size: 11px;
    font-weight: 500;
    color: #8fa3b0;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .pf-info-value {
    font-size: 14px;
    color: #1a2e44;
    font-weight: 400;
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .pf-info-value i {
    font-size: 14px;
    color: #94a8b5;
  }

  .pf-divider {
    height: 1px;
    background: rgba(209,219,227,0.6);
    margin: 20px 0;
  }

  /* ── Leave balance ── */
  .pf-leave-card {
    animation: fadeUp 0.45s 0.15s cubic-bezier(0.22,1,0.36,1) both;
  }

  .pf-leave-stats {
    display: grid;
    grid-template-columns: repeat(3,1fr);
    gap: 12px;
    margin-bottom: 18px;
  }

  .pf-stat {
    background: #f8fafc;
    border: 1px solid #e8eef3;
    border-radius: 10px;
    padding: 14px 16px;
    text-align: center;
  }

  .pf-stat-num {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 600;
    color: #1a2e44;
    line-height: 1;
    margin-bottom: 4px;
  }

  .pf-stat-num.green { color: #2a7d5f; }
  .pf-stat-num.orange { color: #b45309; }

  .pf-stat-label {
    font-size: 11px;
    color: #8fa3b0;
    font-weight: 400;
  }

  /* Progress bar */
  .pf-progress-wrap {
    margin-top: 4px;
  }

  .pf-progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 7px;
  }

  .pf-progress-label { font-size: 12px; color: #6b808f; }
  .pf-progress-pct { font-size: 12px; color: #1a2e44; font-weight: 500; }

  .pf-progress-bar {
    height: 6px;
    background: #e8eef3;
    border-radius: 99px;
    overflow: hidden;
  }

  .pf-progress-fill {
    height: 100%;
    border-radius: 99px;
    background: linear-gradient(90deg, #5DCAA5, #2a7d5f);
    transition: width 0.6s ease;
  }

  /* ── Danger zone ── */
  .pf-danger-card {
    animation: fadeUp 0.45s 0.20s cubic-bezier(0.22,1,0.36,1) both;
  }

  .pf-section-label.red { color: #b45309; }

  .pf-logout-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .pf-logout-desc {
    font-size: 13px;
    color: #6b808f;
    line-height: 1.5;
  }

  .pf-logout-desc strong {
    display: block;
    font-size: 14px;
    color: #1a2e44;
    font-weight: 500;
    margin-bottom: 2px;
  }

  .btn-logout {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 9px 18px;
    border: 1.5px solid #fca5a5;
    border-radius: 9px;
    background: transparent;
    color: #991b1b;
    font-size: 13px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, transform 0.1s;
  }

  .btn-logout:hover {
    background: #fff1f1;
    border-color: #f87171;
    transform: translateY(-1px);
  }

  .btn-logout:active { transform: translateY(0); }

  .btn-logout i { font-size: 15px; }

  /* ── Modal confirm ── */
  .pf-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15,25,40,0.4);
    backdrop-filter: blur(4px);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s ease;
  }

  .pf-modal {
    background: #fff;
    border-radius: 16px;
    padding: 32px 28px;
    max-width: 360px;
    width: 100%;
    margin: 16px;
    box-shadow: 0 8px 40px rgba(28,58,94,0.18);
    animation: slideUp 0.25s cubic-bezier(0.22,1,0.36,1);
  }

  .pf-modal-icon {
    width: 48px; height: 48px;
    background: #fff1f1;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 16px;
  }

  .pf-modal-icon i { font-size: 22px; color: #dc2626; }

  .pf-modal-title {
    font-family: 'Playfair Display', serif;
    font-size: 18px; font-weight: 600;
    color: #1a2e44; margin-bottom: 8px;
  }

  .pf-modal-desc { font-size: 13px; color: #6b808f; line-height: 1.55; margin-bottom: 24px; }

  .pf-modal-actions { display: flex; gap: 10px; }

  .btn-cancel-modal {
    flex: 1; padding: 10px;
    border: 1px solid #d1dbe3; border-radius: 9px;
    background: #f8fafc; color: #5a7080;
    font-size: 13px; font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: background 0.12s;
  }

  .btn-cancel-modal:hover { background: #edf2f7; }

  .btn-confirm-logout {
    flex: 1; padding: 10px;
    border: none; border-radius: 9px;
    background: #dc2626; color: #fff;
    font-size: 13px; font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: opacity 0.12s;
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }

  .btn-confirm-logout:hover { opacity: 0.88; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
`;

// ─── Mock data ────────────────────────────────────────────────────────────────
const DEFAULT_USER: UserProfile = {
  name: "Nguyễn Văn An",
  department: "Kỹ thuật phần mềm",
  email: "an.nguyen@congty.com",
  role: "Software Engineer",
  employeeId: "EMP-00142",
  joinDate: "15/03/2022",
  avatarInitials: "NA",
  remainingLeave: 8,
  usedLeave: 4,
  totalLeave: 12,
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function Profile() {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [balance, setBalance] = useState({ remainingDays: 12, usedDays: 0, totalDays: 12, carriedOverDays: 0 });

  useEffect(() => {
    apiClient.get("/leave-balance/me").then(r => setBalance(r.data)).catch(console.error);
  }, []);

  const displayUser: UserProfile = {
    name: authUser?.fullName ?? DEFAULT_USER.name,
    department: "Axon Active Vietnam",
    email: authUser?.email ?? DEFAULT_USER.email,
    role: authUser?.role === "MANAGER" ? "Quản lý" : "Nhân viên",
    employeeId: `EMP-${String(authUser?.id ?? 0).padStart(5, "0")}`,
    joinDate: DEFAULT_USER.joinDate,
    avatarInitials: (authUser?.fullName ?? "U").split(" ").map(w => w[0]).slice(-2).join("").toUpperCase(),
    remainingLeave: balance.remainingDays,
    usedLeave: balance.usedDays,
    totalLeave: balance.totalDays + balance.carriedOverDays,
  };

  const user = displayUser;
  const usedPct = user.totalLeave > 0 ? Math.round((user.usedLeave / user.totalLeave) * 100) : 0;

  const handleLogout = () => {
    setShowConfirm(false);
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <style>{STYLES}</style>

      <div className="pf-page">
        {/* Header */}
        <div className="pf-header">
          <p className="pf-breadcrumb">
            LeaveFlow &rsaquo; <span>Hồ sơ cá nhân</span>
          </p>
          <h1 className="pf-page-title">Hồ sơ của tôi</h1>
        </div>

        <div className="pf-layout">

          {/* ── Hero card ── */}
          <div className="pf-card pf-hero">
            <div className="pf-avatar">{user.avatarInitials}</div>
            <div className="pf-hero-info">
              <div className="pf-hero-name">{user.name}</div>
              <div className="pf-hero-role">{user.role} · {user.department}</div>
              <div className="pf-badge">
                <div className="pf-badge-dot" />
                Đang hoạt động
              </div>
            </div>
          </div>

          {/* ── Thông tin cá nhân ── */}
          <div className="pf-card pf-info-card">
            <p className="pf-section-label">Thông tin cá nhân</p>
            <div className="pf-info-grid">
              <div className="pf-info-item">
                <div className="pf-info-label">Họ và tên</div>
                <div className="pf-info-value">
                  <i className="ti ti-user" />
                  {user.name}
                </div>
              </div>
              <div className="pf-info-item">
                <div className="pf-info-label">Email</div>
                <div className="pf-info-value">
                  <i className="ti ti-mail" />
                  {user.email}
                </div>
              </div>
              <div className="pf-info-item">
                <div className="pf-info-label">Phòng ban</div>
                <div className="pf-info-value">
                  <i className="ti ti-building" />
                  {user.department}
                </div>
              </div>
              <div className="pf-info-item">
                <div className="pf-info-label">Chức vụ</div>
                <div className="pf-info-value">
                  <i className="ti ti-briefcase" />
                  {user.role}
                </div>
              </div>
            </div>

            <div className="pf-divider" />

            <div className="pf-info-grid">
              <div className="pf-info-item">
                <div className="pf-info-label">Mã nhân viên</div>
                <div className="pf-info-value">
                  <i className="ti ti-id-badge" />
                  {user.employeeId}
                </div>
              </div>
              <div className="pf-info-item">
                <div className="pf-info-label">Ngày vào công ty</div>
                <div className="pf-info-value">
                  <i className="ti ti-calendar" />
                  {user.joinDate}
                </div>
              </div>
            </div>
          </div>

          {/* ── Số dư ngày phép ── */}
          <div className="pf-card pf-leave-card">
            <p className="pf-section-label">Ngày phép năm nay</p>
            <div className="pf-leave-stats">
              <div className="pf-stat">
                <div className="pf-stat-num">{user.totalLeave}</div>
                <div className="pf-stat-label">Tổng ngày phép</div>
              </div>
              <div className="pf-stat">
                <div className="pf-stat-num green">{user.remainingLeave}</div>
                <div className="pf-stat-label">Còn lại</div>
              </div>
              <div className="pf-stat">
                <div className="pf-stat-num orange">{user.usedLeave}</div>
                <div className="pf-stat-label">Đã sử dụng</div>
              </div>
            </div>

            <div className="pf-progress-wrap">
              <div className="pf-progress-header">
                <span className="pf-progress-label">Đã sử dụng</span>
                <span className="pf-progress-pct">{usedPct}%</span>
              </div>
              <div className="pf-progress-bar">
                <div className="pf-progress-fill" style={{ width: `${usedPct}%` }} />
              </div>
            </div>
          </div>

          {/* ── Đăng xuất ── */}
          <div className="pf-card pf-danger-card">
            <p className="pf-section-label">Tài khoản</p>
            <div className="pf-logout-row">
              <div className="pf-logout-desc">
                <strong>Đăng xuất khỏi hệ thống</strong>
                Phiên làm việc của bạn sẽ kết thúc. Mọi dữ liệu chưa lưu sẽ bị mất.
              </div>
              <button className="btn-logout" type="button" onClick={() => setShowConfirm(true)}>
                <i className="ti ti-logout" />
                Đăng xuất
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── Confirm modal ── */}
      {showConfirm && (
        <div className="pf-overlay" onClick={() => setShowConfirm(false)}>
          <div className="pf-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pf-modal-icon">
              <i className="ti ti-logout" />
            </div>
            <h2 className="pf-modal-title">Xác nhận đăng xuất?</h2>
            <p className="pf-modal-desc">
              Bạn chắc chắn muốn đăng xuất khỏi <strong>LeaveFlow</strong>?
              Phiên làm việc hiện tại sẽ kết thúc.
            </p>
            <div className="pf-modal-actions">
              <button className="btn-cancel-modal" onClick={() => setShowConfirm(false)}>
                Huỷ
              </button>
              <button className="btn-confirm-logout" onClick={handleLogout}>
                <i className="ti ti-logout" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
