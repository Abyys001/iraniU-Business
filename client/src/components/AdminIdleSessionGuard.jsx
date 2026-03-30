import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/** بدون فعالیت در پنل — بعد از نمایش هشدار */
const IDLE_MS = 10 * 60 * 1000;
const GRACE_SEC = 60;

const ACTIVITY_EVENTS = ["mousedown", "keydown", "touchstart", "scroll", "click", "wheel"];

export default function AdminIdleSessionGuard() {
  const { logout, me } = useAuth();
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [graceLeft, setGraceLeft] = useState(GRACE_SEC);

  const idleTimerRef = useRef(null);
  const graceIntervalRef = useRef(null);
  const showWarningRef = useRef(false);

  const endSession = useCallback(() => {
    if (graceIntervalRef.current) {
      clearInterval(graceIntervalRef.current);
      graceIntervalRef.current = null;
    }
    showWarningRef.current = false;
    setShowWarning(false);
    logout();
    navigate("/admin/login", { replace: true });
  }, [logout, navigate]);

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const scheduleIdle = useCallback(() => {
    clearIdleTimer();
    idleTimerRef.current = window.setTimeout(() => {
      showWarningRef.current = true;
      setShowWarning(true);
    }, IDLE_MS);
  }, [clearIdleTimer]);

  const stayLoggedIn = useCallback(() => {
    if (graceIntervalRef.current) {
      clearInterval(graceIntervalRef.current);
      graceIntervalRef.current = null;
    }
    showWarningRef.current = false;
    setShowWarning(false);
    setGraceLeft(GRACE_SEC);
    scheduleIdle();
  }, [scheduleIdle]);

  useEffect(() => {
    if (me?.role !== "superadmin") return undefined;

    const onActivity = () => {
      if (showWarningRef.current) return;
      scheduleIdle();
    };

    ACTIVITY_EVENTS.forEach((ev) => {
      window.addEventListener(ev, onActivity, { passive: true, capture: true });
    });
    scheduleIdle();

    return () => {
      ACTIVITY_EVENTS.forEach((ev) => {
        window.removeEventListener(ev, onActivity, { capture: true });
      });
      clearIdleTimer();
    };
  }, [me?.role, scheduleIdle, clearIdleTimer]);

  useEffect(() => {
    if (!showWarning) return undefined;

    setGraceLeft(GRACE_SEC);
    let left = GRACE_SEC;
    graceIntervalRef.current = window.setInterval(() => {
      left -= 1;
      setGraceLeft(left);
      if (left <= 0) {
        if (graceIntervalRef.current) {
          clearInterval(graceIntervalRef.current);
          graceIntervalRef.current = null;
        }
        endSession();
      }
    }, 1000);

    return () => {
      if (graceIntervalRef.current) {
        clearInterval(graceIntervalRef.current);
        graceIntervalRef.current = null;
      }
    };
  }, [showWarning, endSession]);

  if (me?.role !== "superadmin") return null;

  return (
    <div
      className="admin-detail-modal"
      hidden={!showWarning}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-idle-session-title"
      aria-describedby="admin-idle-session-desc"
    >
      <div className="admin-detail-modal__backdrop" aria-hidden="true" />
      <div className="admin-detail-modal__panel">
        <p className="admin-detail-modal__type" style={{ color: "#c62828" }}>
          پایان نشست به‌خاطر بی‌فعالی
        </p>
        <h2 className="admin-detail-modal__title" id="admin-idle-session-title">
          هنوز اینجا هستید؟
        </h2>
        <p className="field-hint" id="admin-idle-session-desc">
          به‌خاطر امنیت، پس از <strong>۱۰ دقیقه</strong> بدون فعالیت این پیام نمایش داده می‌شود. اگر پاسخ
          ندهید، به‌صورت خودکار از پنل سوپرادمین خارج می‌شوید.
        </p>
        <p
          className="field-hint"
          aria-live="polite"
          style={{ fontWeight: 700, color: "#5d4037", marginTop: "0.75rem" }}
        >
          خروج خودکار تا{" "}
          <span dir="ltr" style={{ fontVariantNumeric: "tabular-nums" }}>
            {graceLeft}
          </span>{" "}
          ثانیه دیگر…
        </p>
        <div className="dashboard-actions" style={{ marginTop: "1.25rem" }}>
          <button type="button" className="btn btn--primary" onClick={stayLoggedIn} autoFocus>
            بله، ادامه می‌دهم
          </button>
        </div>
      </div>
    </div>
  );
}
