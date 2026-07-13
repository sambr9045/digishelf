import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Bell,
  CheckCircle2,
  Clock3,
  Eye,
  ExternalLink,
  Gift,
  Home,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MousePointerClick,
  PackageCheck,
  RefreshCw,
  Settings2,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Trash2,
  Users,
  WalletCards,
  X,
  ShieldOff,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import { api_endpoint } from "../components/constant";
import { ADMIN_TOKEN_KEY } from "./AdminLogin";

function getAdminHeaders() {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const ADMIN_PAGES = [
  {
    key: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    eyebrow: "Operations overview",
    title: "Admin overview",
    description: "Review queue size, payment state, and release workload.",
  },
  {
    key: "configuration",
    label: "Configuration",
    icon: Settings2,
    eyebrow: "Platform settings",
    title: "Digishelves configuration",
    description: "Update margins, fees, and order release mode.",
  },
  {
    key: "topup-orders",
    label: "Top-up Orders",
    icon: Smartphone,
    eyebrow: "Top-up queue",
    title: "Top-up payment orders",
    description:
      "Review top-up payments, profit, approval state, and release progress.",
  },
  {
    key: "giftcard-orders",
    label: "Gift Card Orders",
    icon: Gift,
    eyebrow: "Gift card queue",
    title: "Gift card payment orders",
    description:
      "Review gift-card payments, profit, approval state, and release progress.",
  },
  {
    key: "completed-orders",
    label: "Completed Orders",
    icon: PackageCheck,
    eyebrow: "Completed activity",
    title: "Completed orders",
    description:
      "Review recently completed airtime and gift card transactions.",
  },
  {
    key: "messages",
    label: "Messages",
    icon: Mail,
    eyebrow: "Contact inbox",
    title: "Customer messages",
    description:
      "Read new messages, reply from the admin panel, and track support follow-up.",
  },
  {
    key: "users",
    label: "Users",
    icon: Users,
    eyebrow: "Customer activity",
    title: "Users",
    description:
      "Review registered users, their purchases, and tracked activity history.",
  },
  {
    key: "stats",
    label: "Analytics",
    icon: BarChart3,
    eyebrow: "Analytics",
    title: "Analytics dashboard",
    description:
      "Track traffic, gift-card engagement, and abandoned carts in one place.",
  },
  {
    key: "page-traffic",
    label: "Page Traffic",
    icon: Eye,
    eyebrow: "Traffic detail",
    title: "All page traffic",
    description: "Review every tracked storefront route with pagination.",
    hidden: true,
  },
  {
    key: "blocked-urls",
    label: "Blocked URLs",
    icon: ShieldOff,
    eyebrow: "URL blocklist",
    title: "Blocked URLs",
    description: "Paste a reported URL to block it site-wide. Blocked URLs return 404 to all visitors.",
  },
];

function getPageMeta(pageKey) {
  if (pageKey === "crypto-orders") {
    return (
      ADMIN_PAGES.find((item) => item.key === "topup-orders") || ADMIN_PAGES[0]
    );
  }
  return ADMIN_PAGES.find((item) => item.key === pageKey) || ADMIN_PAGES[0];
}

function findUserByEmail(users, email) {
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  if (!normalizedEmail) {
    return null;
  }

  return (
    users.find(
      (user) =>
        String(user.email || "")
          .trim()
          .toLowerCase() === normalizedEmail,
    ) || null
  );
}

function getCurrentOrderState(order, config) {
  const fulfillmentStatus = String(
    order?.fulfillment_status || "",
  ).toLowerCase();
  const paymentStatus = String(order?.status || "").toLowerCase();
  const isManualMode = config?.order_mode === "manual";

  if (fulfillmentStatus === "completed") {
    return "completed";
  }

  if (fulfillmentStatus === "failed") {
    return "failed";
  }

  if (fulfillmentStatus === "processing") {
    return "processing";
  }

  if (paymentStatus === "pending") {
    return "pending payment";
  }

  if (paymentStatus === "paid" && isManualMode && !order?.admin_approved) {
    return "awaiting approval";
  }

  if (paymentStatus === "paid") {
    return "ready to release";
  }

  return fulfillmentStatus || paymentStatus || "unknown";
}

function getNotificationSeenStorageKey(email) {
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  if (!normalizedEmail) {
    return "";
  }

  return `digishelf.admin.notifications.seen:${normalizedEmail}`;
}

function readSeenNotificationCount(email) {
  if (typeof window === "undefined") {
    return 0;
  }

  const storageKey = getNotificationSeenStorageKey(email);
  if (!storageKey) {
    return 0;
  }

  const rawValue = window.localStorage.getItem(storageKey);
  const parsedValue = Number(rawValue);
  return Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : 0;
}

function writeSeenNotificationCount(email, count) {
  if (typeof window === "undefined") {
    return;
  }

  const storageKey = getNotificationSeenStorageKey(email);
  if (!storageKey) {
    return;
  }

  window.localStorage.setItem(
    storageKey,
    String(Math.max(Number(count) || 0, 0)),
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dashboard, setDashboard] = useState(null);
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [seenNotificationCount, setSeenNotificationCount] = useState(0);
  const [approveModalOrderId, setApproveModalOrderId] = useState("");
  const [approveSecretCode, setApproveSecretCode] = useState("");
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : false,
  );
  const notificationRef = useRef(null);

  const currentPage = getPageMeta(searchParams.get("page"));
  const chartItems = useMemo(() => {
    const stats = dashboard?.stats || {};
    return [
      {
        label: "Pending",
        value: stats.pending_payment_orders || 0,
        tone: "bg-[#551839]",
      },
      {
        label: "Paid",
        value: stats.paid_payment_orders || 0,
        tone: "bg-[#10ac84]",
      },
      {
        label: "Approved",
        value: stats.approved_payment_orders || 0,
        tone: "bg-[#2775ca]",
      },
      { label: "Manual", value: stats.manual_queue || 0, tone: "bg-[#f59e0b]" },
    ];
  }, [dashboard]);

  const paymentOrders = dashboard?.payment_orders || [];
  const topupPaymentOrders = paymentOrders.filter(
    (order) => order.fulfillment_type === "topup",
  );
  const giftcardPaymentOrders = paymentOrders.filter(
    (order) => order.fulfillment_type === "giftcard",
  );
  const selectedOrderId = searchParams.get("order");
  const selectedOrder =
    paymentOrders.find((order) => order.order_id === selectedOrderId) || null;
  const topups = dashboard?.topups || [];
  const giftcards = dashboard?.giftcards || [];
  const contacts = dashboard?.contacts || [];
  const users = dashboard?.users || [];
  const adminSession = dashboard?.admin_session || {};
  const adminEmail = adminSession.email || "";
  const newContactCount = dashboard?.stats?.new_contacts || 0;
  const pendingNotifications = dashboard?.stats?.pending_payment_orders || 0;
  const notificationItems = paymentOrders
    .filter((order) => order.fulfillment_status !== "completed")
    .slice(0, 6);
  const unreadNotifications = Math.max(
    pendingNotifications - seenNotificationCount,
    0,
  );
  const selectedContactId = Number(searchParams.get("contact") || 0);
  const selectedContact =
    contacts.find((contact) => contact.id === selectedContactId) || null;
  const [replyDraft, setReplyDraft] = useState("");
  const [processingContactId, setProcessingContactId] = useState(0);
  const [userDetail, setUserDetail] = useState(null);
  const [isUserDetailLoading, setIsUserDetailLoading] = useState(false);
  const [pageTrafficDetail, setPageTrafficDetail] = useState(null);
  const [isPageTrafficLoading, setIsPageTrafficLoading] = useState(false);
  const [blockedUrls, setBlockedUrls] = useState([]);
  const [isBlockedUrlsLoading, setIsBlockedUrlsLoading] = useState(false);
  const [blockedUrlInput, setBlockedUrlInput] = useState("");
  const [blockedUrlReason, setBlockedUrlReason] = useState("");
  const [isBlockingUrl, setIsBlockingUrl] = useState(false);
  const analytics = dashboard?.analytics || {};
  const analyticsSummary = analytics.summary || {};
  const trafficSeries = analytics.traffic_series || [];
  const pageTraffic = analytics.page_traffic || [];
  const eventBreakdown = analytics.event_breakdown || [];
  const topGiftcards = analytics.top_giftcards || [];
  const abandonedCarts = analytics.abandoned_carts || [];
  const selectedUserId = Number(searchParams.get("user") || 0);
  const selectedUser = users.find((user) => user.id === selectedUserId) || null;
  const selectedTrafficPage = Number.isFinite(
    Number(searchParams.get("traffic_page") || 1),
  )
    ? Math.max(Number(searchParams.get("traffic_page") || 1), 1)
    : 1;

  const fetchDashboard = async () => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) {
      navigate("/admin-login");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(`${api_endpoint}/api/admin/dashboard/`, {
        headers: getAdminHeaders(),
      });
      setDashboard(response.data);
      setConfig(response.data.configuration);
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        navigate("/admin-login");
        return;
      }
      toast.error(
        error?.response?.data?.error || "Could not load admin dashboard.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async () => {
    setIsSaving(true);
    try {
      const response = await axios.patch(
        `${api_endpoint}/api/admin/configuration/`,
        config,
        { headers: getAdminHeaders() },
      );
      setConfig(response.data);
      setDashboard((current) => ({
        ...current,
        configuration: response.data,
      }));
      toast.success("Configuration updated.");
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Could not save configuration.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const approveOrder = async (orderId) => {
    setApproveModalOrderId(orderId);
    setApproveSecretCode("");
  };

  const submitApproveOrder = async () => {
    if (!approveModalOrderId || !approveSecretCode.trim()) {
      return;
    }

    setProcessingOrderId(approveModalOrderId);
    try {
      await axios.post(
        `${api_endpoint}/api/admin/payment-orders/${approveModalOrderId}/approve/`,
        { secret_code: approveSecretCode.trim() },
        { headers: getAdminHeaders() },
      );
      toast.success("Payment approved.");
      setApproveModalOrderId("");
      setApproveSecretCode("");
      await fetchDashboard();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Could not approve payment.");
    } finally {
      setProcessingOrderId("");
    }
  };

  const releaseOrder = async (orderId) => {
    setProcessingOrderId(orderId);
    try {
      await axios.post(
        `${api_endpoint}/api/admin/payment-orders/${orderId}/complete/`,
        {},
        { headers: getAdminHeaders() },
      );
      toast.success("Release request sent.");
      await fetchDashboard();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Could not release product.");
    } finally {
      setProcessingOrderId("");
    }
  };

  const deleteOrder = async (orderId) => {
    const confirmed = window.confirm(
      "Delete this payment order? Completed orders cannot be deleted.",
    );
    if (!confirmed) {
      return;
    }

    setProcessingOrderId(orderId);
    try {
      await axios.delete(
        `${api_endpoint}/api/admin/payment-orders/${orderId}/`,
        {
          headers: getAdminHeaders(),
        },
      );
      toast.success("Payment order deleted.");
      if (selectedOrderId === orderId) {
        setSearchParams({ page: currentPage.key });
      }
      await fetchDashboard();
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Could not delete payment order.",
      );
    } finally {
      setProcessingOrderId("");
    }
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    navigate("/admin-login");
  };

  const goToPage = (pageKey) => {
    setSearchParams({ page: pageKey });
    setMobileNavOpen(false);
    setNotificationOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToContactDetail = async (contact) => {
    if (!contact) {
      return;
    }

    setSearchParams({
      page: "messages",
      contact: String(contact.id),
    });
    setMobileNavOpen(false);
    setNotificationOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (contact.is_new) {
      try {
        await axios.post(
          `${api_endpoint}/api/admin/contacts/${contact.id}/read/`,
          {},
          { headers: getAdminHeaders() },
        );
        await fetchDashboard();
      } catch (error) {
        toast.error(
          error?.response?.data?.error || "Could not mark message as read.",
        );
      }
    }
  };

  const closeContactDetail = () => {
    setSearchParams({ page: "messages" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToUserDetail = (user) => {
    if (!user) {
      return;
    }

    setSearchParams({
      page: "users",
      user: String(user.id),
    });
    setMobileNavOpen(false);
    setNotificationOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeUserDetail = () => {
    setSearchParams({ page: "users" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openAllPageTraffic = () => {
    setSearchParams({
      page: "page-traffic",
      traffic_page: "1",
    });
    setMobileNavOpen(false);
    setNotificationOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const changeTrafficPage = (pageNumber) => {
    setSearchParams({
      page: "page-traffic",
      traffic_page: String(pageNumber),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closePageTraffic = () => {
    setSearchParams({ page: "stats" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fetchBlockedUrls = async () => {
    setIsBlockedUrlsLoading(true);
    try {
      const response = await axios.get(`${api_endpoint}/api/admin/blocked-urls/`, {
        headers: getAdminHeaders(),
      });
      setBlockedUrls(response.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Could not load blocked URLs.");
    } finally {
      setIsBlockedUrlsLoading(false);
    }
  };

  const addBlockedUrl = async () => {
    const url = blockedUrlInput.trim();
    if (!url) return;
    setIsBlockingUrl(true);
    try {
      const response = await axios.post(
        `${api_endpoint}/api/admin/blocked-urls/`,
        { url, reason: blockedUrlReason.trim() },
        { headers: getAdminHeaders() },
      );
      setBlockedUrls((current) => {
        const exists = current.find((e) => e.id === response.data.id);
        return exists
          ? current.map((e) => (e.id === response.data.id ? response.data : e))
          : [response.data, ...current];
      });
      setBlockedUrlInput("");
      setBlockedUrlReason("");
      toast.success("URL blocked.");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Could not block URL.");
    } finally {
      setIsBlockingUrl(false);
    }
  };

  const toggleBlockedUrl = async (entry) => {
    try {
      const response = await axios.patch(
        `${api_endpoint}/api/admin/blocked-urls/${entry.id}/`,
        { is_active: !entry.is_active },
        { headers: getAdminHeaders() },
      );
      setBlockedUrls((current) =>
        current.map((e) => (e.id === entry.id ? response.data : e)),
      );
    } catch (error) {
      toast.error(error?.response?.data?.error || "Could not update URL.");
    }
  };

  const deleteBlockedUrl = async (entry) => {
    if (!window.confirm(`Remove "${entry.url}" from the blocklist?`)) return;
    try {
      await axios.delete(`${api_endpoint}/api/admin/blocked-urls/${entry.id}/`, {
        headers: getAdminHeaders(),
      });
      setBlockedUrls((current) => current.filter((e) => e.id !== entry.id));
      toast.success("URL removed from blocklist.");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Could not remove URL.");
    }
  };

  const sendContactReply = async () => {
    if (!selectedContact || !replyDraft.trim()) {
      return;
    }

    setProcessingContactId(selectedContact.id);
    try {
      await axios.post(
        `${api_endpoint}/api/admin/contacts/${selectedContact.id}/reply/`,
        { reply_message: replyDraft.trim() },
        { headers: getAdminHeaders() },
      );
      toast.success("Reply sent.");
      await fetchDashboard();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Could not send reply.");
    } finally {
      setProcessingContactId(0);
    }
  };

  const toggleNotifications = () => {
    setNotificationOpen((current) => {
      const next = !current;
      if (next) {
        setSeenNotificationCount(pendingNotifications);
        writeSeenNotificationCount(adminEmail, pendingNotifications);
      }
      return next;
    });
  };

  const goToOrderPage = (order) => {
    if (!order) {
      return;
    }
    setSearchParams({
      page:
        order.fulfillment_type === "giftcard"
          ? "giftcard-orders"
          : "topup-orders",
      order: order.order_id,
    });
    setMobileNavOpen(false);
    setNotificationOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeOrderDetail = () => {
    setSearchParams({ page: currentPage.key });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    setReplyDraft(selectedContact?.reply_message || "");
  }, [selectedContactId, selectedContact?.reply_message]);

  useEffect(() => {
    if (currentPage.key !== "users" || !selectedUserId) {
      setUserDetail(null);
      setIsUserDetailLoading(false);
      return;
    }

    let active = true;

    const fetchUserDetail = async () => {
      setUserDetail(null);
      setIsUserDetailLoading(true);
      try {
        const response = await axios.get(
          `${api_endpoint}/api/admin/users/${selectedUserId}/`,
          {
            headers: getAdminHeaders(),
          },
        );
        if (active) {
          setUserDetail(response.data);
        }
      } catch (error) {
        if (active) {
          setUserDetail(null);
          toast.error(
            error?.response?.data?.error || "Could not load user activity.",
          );
        }
      } finally {
        if (active) {
          setIsUserDetailLoading(false);
        }
      }
    };

    fetchUserDetail();

    return () => {
      active = false;
    };
  }, [currentPage.key, selectedUserId]);

  useEffect(() => {
    if (currentPage.key === "blocked-urls" && blockedUrls.length === 0 && !isBlockedUrlsLoading) {
      fetchBlockedUrls();
    }
  }, [currentPage.key]);

  useEffect(() => {
    if (currentPage.key !== "page-traffic") {
      setPageTrafficDetail(null);
      setIsPageTrafficLoading(false);
      return;
    }

    let active = true;

    const fetchPageTrafficDetail = async () => {
      setIsPageTrafficLoading(true);
      try {
        const response = await axios.get(
          `${api_endpoint}/api/admin/page-traffic/`,
          {
            headers: getAdminHeaders(),
            params: {
              page: selectedTrafficPage,
            },
          },
        );
        if (active) {
          setPageTrafficDetail(response.data);
        }
      } catch (error) {
        if (active) {
          toast.error(
            error?.response?.data?.error || "Could not load page traffic.",
          );
          setPageTrafficDetail(null);
        }
      } finally {
        if (active) {
          setIsPageTrafficLoading(false);
        }
      }
    };

    fetchPageTrafficDetail();

    return () => {
      active = false;
    };
  }, [currentPage.key, selectedTrafficPage]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const syncLayout = (event) => {
      setIsDesktop(event.matches);
      if (event.matches) {
        setMobileNavOpen(false);
      }
    };

    syncLayout(mediaQuery);
    mediaQuery.addEventListener("change", syncLayout);

    return () => {
      mediaQuery.removeEventListener("change", syncLayout);
    };
  }, []);

  useEffect(() => {
    if (!adminEmail) {
      return;
    }

    const storedSeenCount = readSeenNotificationCount(adminEmail);
    const normalizedSeenCount = Math.min(storedSeenCount, pendingNotifications);
    setSeenNotificationCount(normalizedSeenCount);

    if (normalizedSeenCount !== storedSeenCount) {
      writeSeenNotificationCount(adminEmail, normalizedSeenCount);
    }
  }, [adminEmail, pendingNotifications]);

  useEffect(() => {
    setSeenNotificationCount((current) =>
      Math.min(current, pendingNotifications),
    );
  }, [pendingNotifications]);

  useEffect(() => {
    if (!adminEmail) {
      return;
    }

    if (seenNotificationCount > pendingNotifications) {
      const normalizedSeenCount = pendingNotifications;
      setSeenNotificationCount(normalizedSeenCount);
      writeSeenNotificationCount(adminEmail, normalizedSeenCount);
    }
  }, [adminEmail, pendingNotifications, seenNotificationCount]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!notificationRef.current?.contains(event.target)) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(85,24,57,0.06),_transparent_24%),linear-gradient(180deg,_#faf8f4_0%,_#f4efe8_100%)] font-display text-[#211722]">
      {isDesktop ? (
        <aside className="fixed inset-y-0 left-0 z-30 w-[280px] border-r border-white/6 bg-[#211722] text-white shadow-[24px_0_80px_rgba(33,23,34,0.12)]">
          <div className="flex h-full flex-col px-6 py-8">
            <AdminSidebarContent
              currentPage={currentPage.key}
              newContactCount={newContactCount}
              onNavigate={goToPage}
              fetchDashboard={fetchDashboard}
              logout={logout}
              desktop
            />
          </div>
        </aside>
      ) : null}

      {!isDesktop ? (
        <header className="fixed inset-x-0 top-0 z-30 border-b border-[#ece3d9] bg-[#fcfaf7]/95 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#10ac84]">
                {currentPage.eyebrow}
              </p>
              <h1 className="truncate text-xl font-black tracking-[-0.04em]">
                {currentPage.title}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative" ref={notificationRef}>
                <button
                  type="button"
                  onClick={toggleNotifications}
                  className="relative inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-[#e7ddd3] bg-[#f8f2eb] text-[#551839]"
                  aria-label="Open order notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 ? (
                    <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#10ac84] px-1 text-[10px] font-black text-white">
                      {unreadNotifications > 99 ? "99+" : unreadNotifications}
                    </span>
                  ) : null}
                </button>
                {notificationOpen ? (
                  <NotificationDropdown
                    items={notificationItems}
                    onOpenOrders={() => goToPage("topup-orders")}
                    onSelectOrder={goToOrderPage}
                  />
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-[#e7ddd3] bg-[#f8f2eb] text-[#551839]"
                aria-label="Open admin menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>
      ) : null}

      {mobileNavOpen && !isDesktop ? (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            className="absolute inset-0 bg-[#211722]/45"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close admin menu overlay"
          />
          <div className="absolute left-0 top-0 h-full w-[85vw] max-w-[340px] bg-[#211722] p-4 shadow-[0_24px_80px_rgba(33,23,34,0.35)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#9ff1dd]">
                  Admin
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-white">
                  Digishelves Ops
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white"
                aria-label="Close admin menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <AdminSidebarContent
              currentPage={currentPage.key}
              newContactCount={newContactCount}
              onNavigate={goToPage}
              fetchDashboard={fetchDashboard}
              logout={logout}
            />
          </div>
        </div>
      ) : null}

      <div className={isDesktop ? "lg:pl-[280px]" : ""}>
        {isDesktop ? (
          <header className="sticky top-0 z-20 border-b border-[#ece3d9] bg-[#fcfaf7]/95 backdrop-blur">
            <div className="flex min-h-[88px] items-center justify-between gap-6 px-8">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#10ac84]">
                  {currentPage.eyebrow}
                </p>
                <h2 className="mt-2 text-[2rem] font-black tracking-[-0.05em] text-[#211722]">
                  {currentPage.title}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative" ref={notificationRef}>
                  <button
                    type="button"
                    onClick={toggleNotifications}
                    className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#e7ddd3] bg-[#fffdfa] text-[#551839]"
                    aria-label="Open order notifications"
                  >
                    <Bell className="h-4 w-4" />
                    {unreadNotifications > 0 ? (
                      <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#10ac84] px-1 text-[10px] font-black text-white">
                        {unreadNotifications > 99 ? "99+" : unreadNotifications}
                      </span>
                    ) : null}
                  </button>
                  {notificationOpen ? (
                    <NotificationDropdown
                      items={notificationItems}
                      desktop
                      onOpenOrders={() => goToPage("topup-orders")}
                      onSelectOrder={goToOrderPage}
                    />
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={fetchDashboard}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#e7ddd3] bg-[#fffdfa] px-5 text-sm font-black text-[#551839]"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#211722] px-5 text-sm font-black text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </header>
        ) : null}

        <div
          className={
            isDesktop ? "min-h-screen px-8 py-8" : "px-4 pb-6 pt-24 sm:px-6"
          }
        >
          <div className="space-y-6">
            {!isDesktop ? (
              <section className="rounded-[2rem] border border-[#eadfe7] bg-white p-5 shadow-[0_20px_70px_rgba(33,23,34,0.08)]">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[#10ac84]">
                    {currentPage.eyebrow}
                  </p>
                  <h2 className="mt-2 text-3xl font-black tracking-[-0.05em]">
                    {currentPage.title}
                  </h2>
                  <p className="mt-2 text-sm font-bold text-[#665b67]">
                    {currentPage.description}
                  </p>
                </div>
              </section>
            ) : null}

            {isLoading ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
                <SkeletonPanel />
              </>
            ) : null}

            {!isLoading && currentPage.key === "overview" ? (
              <>
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    icon={WalletCards}
                    label="Payment orders"
                    value={dashboard?.stats?.payment_orders}
                    tone="bg-[#551839]"
                  />
                  <StatCard
                    icon={ShieldCheck}
                    label="Paid orders"
                    value={dashboard?.stats?.paid_payment_orders}
                    tone="bg-[#10ac84]"
                  />
                  <StatCard
                    icon={CheckCircle2}
                    label="Approved"
                    value={dashboard?.stats?.approved_payment_orders}
                    tone="bg-[#2775ca]"
                  />
                  <StatCard
                    icon={PackageCheck}
                    label="Manual queue"
                    value={dashboard?.stats?.manual_queue}
                    tone="bg-[#f59e0b]"
                  />
                </section>

                <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.8fr)]">
                  <div className="rounded-[2rem] border border-[#eadfe7] bg-white p-5 shadow-[0_20px_70px_rgba(33,23,34,0.08)] sm:p-6">
                    <SectionIntro
                      icon={BarChart3}
                      title="Payment status chart"
                      subtitle="Quick view of current payment flow state."
                    />
                    <div className="mt-6">
                      <SimpleBarChart items={chartItems} />
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-[#eadfe7] bg-white p-5 shadow-[0_20px_70px_rgba(33,23,34,0.08)] sm:p-6">
                    <SectionIntro
                      icon={Home}
                      title="Queue summary"
                      subtitle="Fast review of the current admin workload."
                    />
                    <div className="mt-6 grid gap-4">
                      <SummaryLine
                        label="Pending payment orders"
                        value={dashboard?.stats?.pending_payment_orders}
                      />
                      <SummaryLine
                        label="Top-up transactions"
                        value={dashboard?.stats?.topups}
                      />
                      <SummaryLine
                        label="Gift card transactions"
                        value={dashboard?.stats?.giftcards}
                      />
                      <SummaryLine
                        label="Manual release mode"
                        value={
                          config?.order_mode === "manual"
                            ? "Enabled"
                            : "Disabled"
                        }
                      />
                      <SummaryLine
                        label="Admin login IP"
                        value={
                          adminSession.latest_login_ip ||
                          adminSession.login_ip ||
                          "Unknown"
                        }
                      />
                      <SummaryLine
                        label="Signed in at"
                        value={formatDateTime(
                          adminSession.latest_login_at ||
                            adminSession.issued_at,
                        )}
                      />
                    </div>
                  </div>
                </section>
              </>
            ) : null}

            {!isLoading && currentPage.key === "configuration" && config ? (
              <section className="rounded-[2rem] border border-[#eadfe7] bg-white p-5 shadow-[0_20px_70px_rgba(33,23,34,0.08)] sm:p-6">
                <SectionIntro
                  icon={Settings2}
                  title="Digishelves configuration"
                  subtitle="Manual mode requires approval before product release."
                />

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <ConfigInput
                    label="Profit %"
                    value={config.profit_percentage}
                    onChange={(value) =>
                      setConfig({ ...config, profit_percentage: value })
                    }
                  />
                  <ConfigInput
                    label="Top-up fee %"
                    value={config.processing_fee}
                    onChange={(value) =>
                      setConfig({ ...config, processing_fee: value })
                    }
                  />
                  <ConfigInput
                    label="Gift card fee %"
                    value={config.giftcard_processing_fee}
                    onChange={(value) =>
                      setConfig({ ...config, giftcard_processing_fee: value })
                    }
                  />
                  <label className="block">
                    <span className="mb-2 block text-sm font-black">
                      Order mode
                    </span>
                    <select
                      className="h-14 w-full rounded-2xl border border-[#eadfe7] bg-[#fbf8f4] px-4 py-3 font-black outline-none focus:border-[#551839]"
                      value={config.order_mode}
                      onChange={(event) =>
                        setConfig({ ...config, order_mode: event.target.value })
                      }
                    >
                      <option value="auto">Automatic</option>
                      <option value="manual">Manual approval</option>
                    </select>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={saveConfig}
                  disabled={isSaving}
                  className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#551839] px-6 text-sm font-black text-white disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save configuration"}
                </button>
              </section>
            ) : null}

            {!isLoading && currentPage.key === "topup-orders" ? (
              <PaymentOrdersSection
                title="Top-up payment orders"
                subtitle="Approve, release, and review top-up order profit."
                orders={topupPaymentOrders}
                users={users}
                selectedOrder={
                  selectedOrder?.fulfillment_type === "topup"
                    ? selectedOrder
                    : null
                }
                config={config}
                processingOrderId={processingOrderId}
                onOpenDetail={goToOrderPage}
                onOpenUser={goToUserDetail}
                onCloseDetail={closeOrderDetail}
                onApprove={approveOrder}
                onRelease={releaseOrder}
                onDelete={deleteOrder}
                emptyLabel="No top-up payment orders yet."
              />
            ) : null}

            {!isLoading && currentPage.key === "giftcard-orders" ? (
              <PaymentOrdersSection
                title="Gift card payment orders"
                subtitle="Approve, release, and review gift-card order profit."
                orders={giftcardPaymentOrders}
                users={users}
                selectedOrder={
                  selectedOrder?.fulfillment_type === "giftcard"
                    ? selectedOrder
                    : null
                }
                config={config}
                processingOrderId={processingOrderId}
                onOpenDetail={goToOrderPage}
                onOpenUser={goToUserDetail}
                onCloseDetail={closeOrderDetail}
                onApprove={approveOrder}
                onRelease={releaseOrder}
                onDelete={deleteOrder}
                emptyLabel="No gift-card payment orders yet."
              />
            ) : null}

            {!isLoading && currentPage.key === "completed-orders" ? (
              <CompletedTransactionsSection
                topups={topups}
                giftcards={giftcards}
                users={users}
                onOpenUser={goToUserDetail}
              />
            ) : null}

            {!isLoading && currentPage.key === "messages" ? (
              <MessagesSection
                contacts={contacts}
                selectedContact={selectedContact}
                processingContactId={processingContactId}
                replyDraft={replyDraft}
                onChangeReplyDraft={setReplyDraft}
                onOpenDetail={goToContactDetail}
                onCloseDetail={closeContactDetail}
                onSendReply={sendContactReply}
              />
            ) : null}

            {!isLoading && currentPage.key === "users" ? (
              <UsersSection
                users={users}
                selectedUser={selectedUser}
                userDetail={userDetail}
                isUserDetailLoading={isUserDetailLoading}
                onOpenDetail={goToUserDetail}
                onCloseDetail={closeUserDetail}
              />
            ) : null}

            {!isLoading && currentPage.key === "stats" ? (
              <AnalyticsSection
                analytics={analytics}
                analyticsSummary={analyticsSummary}
                pageTraffic={pageTraffic}
                eventBreakdown={eventBreakdown}
                trafficSeries={trafficSeries}
                topGiftcards={topGiftcards}
                abandonedCarts={abandonedCarts}
                chartItems={chartItems}
                stats={dashboard?.stats || {}}
                onViewAllPageTraffic={openAllPageTraffic}
              />
            ) : null}

            {!isLoading && currentPage.key === "page-traffic" ? (
              <PageTrafficSection
                detail={pageTrafficDetail}
                isLoading={isPageTrafficLoading}
                onBack={closePageTraffic}
                onPageChange={changeTrafficPage}
              />
            ) : null}

            {currentPage.key === "blocked-urls" ? (
              <BlockedUrlsSection
                entries={blockedUrls}
                isLoading={isBlockedUrlsLoading}
                urlInput={blockedUrlInput}
                reasonInput={blockedUrlReason}
                isBlocking={isBlockingUrl}
                onChangeUrl={setBlockedUrlInput}
                onChangeReason={setBlockedUrlReason}
                onAdd={addBlockedUrl}
                onToggle={toggleBlockedUrl}
                onDelete={deleteBlockedUrl}
              />
            ) : null}
          </div>
        </div>
      </div>

      <ApprovePaymentModal
        orderId={approveModalOrderId}
        secretCode={approveSecretCode}
        processingOrderId={processingOrderId}
        onChangeSecretCode={setApproveSecretCode}
        onClose={() => {
          if (processingOrderId) {
            return;
          }
          setApproveModalOrderId("");
          setApproveSecretCode("");
        }}
        onSubmit={submitApproveOrder}
      />
    </main>
  );
}

function AdminSidebarContent({
  currentPage,
  newContactCount = 0,
  onNavigate,
  fetchDashboard,
  logout,
  desktop = false,
}) {
  return (
    <>
      <p className="text-xs font-black uppercase tracking-[0.24em] text-[#9ff1dd]">
        Admin
      </p>
      <h1 className="mt-3 text-3xl font-black tracking-[-0.05em]">
        Digishelves Ops
      </h1>
      <p className="mt-3 text-sm font-bold leading-6 text-white/70">
        Review payments, approve manual orders, and release top-ups or gift
        cards.
      </p>

      <nav className="mt-8 grid gap-3">
        {ADMIN_PAGES.filter((page) => !page.hidden).map((page) => (
          <SidebarLink
            key={page.key}
            icon={page.icon}
            label={page.label}
            badge={page.key === "messages" ? newContactCount : 0}
            isActive={page.key === currentPage}
            onClick={() => onNavigate(page.key)}
          />
        ))}
      </nav>

      <div className={`${desktop ? "mt-auto pt-8" : "mt-6"} flex gap-3`}>
        <button
          type="button"
          onClick={fetchDashboard}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 text-sm font-black text-white"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
        <button
          type="button"
          onClick={logout}
          className="inline-flex h-11 items-center justify-center rounded-full bg-white px-4 text-sm font-black text-[#551839]"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}

function formatDateTime(value) {
  if (!value) {
    return "N/A";
  }

  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

function getPaymentOrderDisplay(order) {
  const summary = order.summary || {};
  const productItems = summary.products || [];
  const profitCurrency =
    order.profit_currency ||
    summary.payment_currency ||
    order.token_symbol ||
    "";
  const productLabel =
    summary.operator ||
    productItems
      .map((item) => item.product_name)
      .filter(Boolean)
      .join(", ") ||
    (summary.product_count
      ? `${summary.product_count} products`
      : order.token_symbol);
  const discountPercentage = Number(order.discount_percentage || 0);
  const discountProfit = Number(order.discount_profit || 0);

  let profitBreakdown =
    `Fee ${order.processing_fee || "0.00"} ${profitCurrency}`.trim();
  if (discountPercentage > 0) {
    profitBreakdown += ` · Discount ${order.discount_percentage}%`;
  } else if (discountProfit > 0) {
    profitBreakdown +=
      ` · Discount ${order.discount_profit} ${profitCurrency}`.trim();
  }

  return {
    summary,
    customerLabel: order.customer_email || summary.email || "No email saved",
    customerTypeLabel: order.customer_type || "Unknown",
    customerContext:
      summary.recipient ||
      summary.country ||
      summary.reference ||
      "Legacy order without saved customer context",
    productLabel,
    paymentContext: summary.total_paid
      ? `${summary.total_paid} ${summary.payment_currency || ""}`.trim()
      : "",
    productItems,
    profitValue: `${order.profit || "0.00"} ${profitCurrency}`.trim(),
    profitBreakdown,
    reference: summary.reference || order.order_id,
    receiverLabel: summary.recipient || summary.country || "N/A",
  };
}

function ProductImageThumb({
  src,
  alt,
  className = "h-12 w-12 rounded-[1rem]",
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden border border-[#eadfe7] bg-white ${className}`}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <Gift className="h-4 w-4 text-[#551839]" />
      )}
    </div>
  );
}

function ProductThumbnailRow({ items, limit = 3 }) {
  if (!items?.length) {
    return null;
  }

  const visibleItems = items.slice(0, limit);
  const hiddenCount = items.length - visibleItems.length;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {visibleItems.map((item, index) => (
        <ProductImageThumb
          key={`${item.product_name || "product"}-${index}`}
          src={item.product_image}
          alt={item.product_name || "Gift card"}
          className="h-10 w-10 rounded-[0.85rem]"
        />
      ))}
      {hiddenCount > 0 ? (
        <span className="rounded-full bg-[#f7f1e8] px-2.5 py-1 text-xs font-black text-[#551839]">
          +{hiddenCount}
        </span>
      ) : null}
    </div>
  );
}

function GiftCardProductGrid({ items, compact = false }) {
  if (!items?.length) {
    return null;
  }

  return (
    <div
      className={`grid gap-3 ${compact ? "" : "md:grid-cols-2 xl:grid-cols-3"}`}
    >
      {items.map((item, index) => (
        <article
          key={`${item.product_name || "product"}-${index}`}
          className="flex gap-3 rounded-[1.25rem] border border-[#eadfe7] bg-[#fbf8f4] p-4"
        >
          <ProductImageThumb
            src={item.product_image}
            alt={item.product_name || "Gift card"}
            className="h-16 w-16 rounded-[1rem]"
          />
          <div className="min-w-0">
            <p className="mb-0 font-black text-[#211722]">
              {item.product_name || "Gift card"}
            </p>
            <p className="mt-1 mb-0 text-sm font-bold text-[#665b67]">
              Qty {item.quantity || 1}
              {item.recipient_amount && item.recipient_currency
                ? ` · ${item.recipient_amount} ${item.recipient_currency}`
                : ""}
            </p>
            {item.amount_to_pay && item.currency_to_pay_in ? (
              <p className="mt-1 mb-0 text-xs font-black uppercase tracking-[0.14em] text-[#9a8b97]">
                Paid {item.amount_to_pay} {item.currency_to_pay_in}
              </p>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

function PaymentOrderActionButtons({
  order,
  config,
  processingOrderId,
  onApprove,
  onRelease,
  onDelete,
}) {
  const canApprove =
    config?.order_mode === "manual" &&
    order.status === "paid" &&
    !order.admin_approved;
  const canRelease =
    order.status === "paid" &&
    order.fulfillment_status !== "completed" &&
    (config?.order_mode !== "manual" || order.admin_approved);
  const userViewHref =
    order.fulfillment_type === "topup"
      ? `/top-up/payment/${order.payment_code || order.order_id}`
      : null;

  return (
    <>
      {userViewHref ? (
        <a
          href={userViewHref}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#eadfe7] px-4 text-sm font-black text-[#551839]"
        >
          <ExternalLink className="h-4 w-4" />
          View as user
        </a>
      ) : null}
      {canApprove ? (
        <button
          type="button"
          onClick={() => onApprove(order.order_id)}
          disabled={processingOrderId === order.order_id}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#f59e0b] px-4 text-sm font-black text-white disabled:opacity-60"
        >
          <ShieldCheck className="h-4 w-4" />
          {processingOrderId === order.order_id
            ? "Approving..."
            : "Approve payment"}
        </button>
      ) : null}
      {canRelease ? (
        <button
          type="button"
          onClick={() => onRelease(order.order_id)}
          disabled={processingOrderId === order.order_id}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#551839] px-4 text-sm font-black text-white disabled:opacity-60"
        >
          <PackageCheck className="h-4 w-4" />
          {processingOrderId === order.order_id
            ? "Releasing..."
            : "Release product"}
        </button>
      ) : null}
      {order.can_delete ? (
        <button
          type="button"
          onClick={() => onDelete(order.order_id)}
          disabled={processingOrderId === order.order_id}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 text-sm font-black text-red-700 disabled:opacity-60"
        >
          <Trash2 className="h-4 w-4" />
          {processingOrderId === order.order_id ? "Deleting..." : "Delete"}
        </button>
      ) : null}
    </>
  );
}

function PaymentOrdersSection({
  title,
  subtitle,
  orders,
  users,
  selectedOrder,
  config,
  processingOrderId,
  onOpenDetail,
  onOpenUser,
  onCloseDetail,
  onApprove,
  onRelease,
  onDelete,
  emptyLabel,
}) {
  return (
    <section className="rounded-[2rem] border border-[#eadfe7] bg-white shadow-[0_20px_70px_rgba(33,23,34,0.08)]">
      <SectionHeader title={title} subtitle={subtitle} />

      {selectedOrder ? (
        <PaymentOrderDetailView
          order={selectedOrder}
          config={config}
          processingOrderId={processingOrderId}
          onBack={onCloseDetail}
          onApprove={onApprove}
          onRelease={onRelease}
          onDelete={onDelete}
        />
      ) : orders.length ? (
        <>
          <div className="divide-y divide-[#eadfe7] md:hidden">
            {orders.map((order) => (
              <PaymentOrderMobileCard
                key={order.order_id}
                order={order}
                users={users}
                config={config}
                processingOrderId={processingOrderId}
                onOpenDetail={onOpenDetail}
                onOpenUser={onOpenUser}
                onApprove={onApprove}
                onRelease={onRelease}
                onDelete={onDelete}
              />
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-[#fbf8f4] text-left text-xs font-black uppercase tracking-[0.18em] text-[#9a8b97]">
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">User type</th>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Profit</th>
                  <th className="px-5 py-4">State</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <PaymentOrderTableRow
                    key={order.order_id}
                    order={order}
                    users={users}
                    config={config}
                    processingOrderId={processingOrderId}
                    onOpenDetail={onOpenDetail}
                    onOpenUser={onOpenUser}
                    onApprove={onApprove}
                    onRelease={onRelease}
                    onDelete={onDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="px-5 py-8 text-sm font-bold text-[#665b67]">
          {emptyLabel}
        </div>
      )}
    </section>
  );
}

function PaymentOrderTableRow({
  order,
  users,
  config,
  processingOrderId,
  onOpenDetail,
  onOpenUser,
  onApprove,
  onRelease,
  onDelete,
}) {
  const display = getPaymentOrderDisplay(order);
  const matchedUser = findUserByEmail(users, display.customerLabel);
  const currentState = getCurrentOrderState(order, config);

  return (
    <tr className="border-t border-[#eadfe7] align-top">
      <td className="px-5 py-4">
        <div className="min-w-[11rem]">
          <button
            type="button"
            onClick={() => onOpenDetail(order)}
            className="inline-flex rounded-full bg-[#f7f1e8] px-3 py-1 font-mono text-[0.65rem] font-black uppercase tracking-wider text-[#551839] transition hover:bg-[#eadfe7]"
          >
            {order.payment_code ||
              order.order_id.replace(/-/g, "").slice(0, 12)}
          </button>
          <p className="mt-2 break-all text-xs font-bold leading-5 text-[#665b67]">
            {order.wallet_address}
          </p>
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="min-w-[12rem]">
          <UserEmailButton
            email={display.customerLabel}
            matchedUser={matchedUser}
            onOpenUser={onOpenUser}
          />
          <p className="mt-1 text-xs font-bold leading-5 text-[#665b67]">
            {display.customerContext}
          </p>
        </div>
      </td>
      <td className="px-5 py-4">
        <span className="inline-flex rounded-full bg-[#f7f1e8] px-3 py-1 text-xs font-black text-[#551839]">
          {display.customerTypeLabel}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="min-w-[9rem]">
          <p className="text-sm font-black capitalize">
            {order.fulfillment_type === "giftcard" ? "Gift card" : "Top-up"}
          </p>
          <p className="mt-1 text-xs font-bold leading-5 text-[#665b67]">
            {display.productLabel}
          </p>
          {order.fulfillment_type === "giftcard" ? (
            <ProductThumbnailRow items={display.productItems} />
          ) : null}
        </div>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm font-black">
          {order.amount} {order.token_symbol}
        </p>
        <p className="mt-1 text-xs font-bold leading-5 text-[#665b67]">
          {display.paymentContext}
        </p>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm font-black text-[#211722]">
          {display.profitValue}
        </p>
        <p className="mt-1 text-xs font-bold leading-5 text-[#665b67]">
          {display.profitBreakdown}
        </p>
      </td>
      <td className="px-5 py-4">
        <div className="flex min-w-[10rem] flex-col gap-2">
          <StatusPill value={currentState} />
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="flex min-w-[16rem] flex-wrap justify-end gap-2">
          <PaymentOrderActionButtons
            order={order}
            config={config}
            processingOrderId={processingOrderId}
            onApprove={onApprove}
            onRelease={onRelease}
            onDelete={onDelete}
          />
        </div>
      </td>
    </tr>
  );
}

function PaymentOrderDetailView({
  order,
  config,
  processingOrderId,
  onBack,
  onApprove,
  onRelease,
  onDelete,
}) {
  const display = getPaymentOrderDisplay(order);
  const debug = order.debug || {};
  const latestTransfer = debug.processed_transfers?.[0];
  const latestHash =
    order.paid_transaction_hash ||
    debug.payment_activity?.latest_transaction_hash ||
    "N/A";

  return (
    <div className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-[#eadfe7] pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#eadfe7] px-4 text-sm font-black text-[#551839]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </button>
          <p className="mt-4 text-[11px] font-black uppercase tracking-[0.22em] text-[#9a8b97]">
            Order detail
          </p>
          <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#211722]">
            {order.payment_code ||
              order.order_id.replace(/-/g, "").slice(0, 12)}
          </h3>
          <p className="mt-2 text-sm font-bold text-[#665b67]">
            {display.customerLabel} · {display.productLabel}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PaymentOrderActionButtons
            order={order}
            config={config}
            processingOrderId={processingOrderId}
            onApprove={onApprove}
            onRelease={onRelease}
            onDelete={onDelete}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DetailCard label="Wallet" value={order.wallet_address} mono />
        <DetailCard label="Reference" value={display.reference} mono />
        <DetailCard label="Payment tx hash" value={latestHash} mono />
        <DetailCard
          label="Paid block"
          value={
            order.paid_block_number || latestTransfer?.block_number || "N/A"
          }
        />
        <DetailCard label="Email" value={display.customerLabel} icon={Mail} />
        <DetailCard label="User type" value={display.customerTypeLabel} />
        <DetailCard label="Receiver / Country" value={display.receiverLabel} />
        <DetailCard
          label="Amount"
          value={`${order.amount} ${order.token_symbol}`}
        />
        <DetailCard label="Profit" value={display.profitValue} />
        <DetailCard
          label="Confirmations"
          value={debug.payment_activity?.highest_confirmations ?? 0}
        />
        <DetailCard
          label="Received amount"
          value={`${debug.payment_activity?.received_amount || "0.00"} ${order.token_symbol}`}
        />
        <DetailCard label="State" value={order.status} />
        <DetailCard label="Fulfillment" value={order.fulfillment_status} />
      </div>

      {order.fulfillment_type === "giftcard" && display.productItems.length ? (
        <section className="mt-5 rounded-[1.5rem] border border-[#eadfe7] bg-white p-4 sm:p-5">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#9a8b97]">
            Ordered products
          </p>
          <GiftCardProductGrid items={display.productItems} />
        </section>
      ) : null}

      {debug.processed_transfers?.length ||
      debug.fulfillment_payload ||
      debug.topup_transaction ||
      debug.giftcard_transaction ? (
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          <JsonPanel title="Payment activity" data={debug.payment_activity} />
          <JsonPanel
            title="Processed blockchain transfers"
            data={debug.processed_transfers}
          />
          <JsonPanel
            title="Stored fulfillment request"
            data={debug.fulfillment_payload}
          />
          <JsonPanel
            title="Order summary snapshot"
            data={debug.summary_snapshot}
          />
          {debug.topup_transaction ? (
            <JsonPanel
              title="Stored top-up transaction"
              data={debug.topup_transaction}
            />
          ) : null}
          {debug.topup_transaction?.payment_trace ? (
            <JsonPanel
              title="Stored payment trace"
              data={debug.topup_transaction.payment_trace}
            />
          ) : null}
          {debug.topup_transaction?.reloader_transaction ? (
            <JsonPanel
              title="Reloadly response"
              data={debug.topup_transaction.reloader_transaction}
            />
          ) : null}
          {debug.giftcard_transaction ? (
            <JsonPanel
              title="Stored gift-card transaction"
              data={debug.giftcard_transaction}
            />
          ) : null}
        </div>
      ) : null}

      {order.fulfillment_error ? (
        <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {order.fulfillment_error}
        </p>
      ) : null}
    </div>
  );
}

function PaymentOrderMobileCard({
  order,
  users,
  config,
  processingOrderId,
  onOpenDetail,
  onOpenUser,
  onApprove,
  onRelease,
  onDelete,
}) {
  const display = getPaymentOrderDisplay(order);
  const matchedUser = findUserByEmail(users, display.customerLabel);
  const currentState = getCurrentOrderState(order, config);

  return (
    <article className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => onOpenDetail(order)}
            className="inline-flex rounded-full bg-[#f7f1e8] px-3 py-1 font-mono text-[0.65rem] font-black uppercase tracking-wider text-[#551839] transition hover:bg-[#eadfe7]"
          >
            {order.payment_code ||
              order.order_id.replace(/-/g, "").slice(0, 12)}
          </button>
          <div className="mt-3">
            <UserEmailButton
              email={display.customerLabel}
              matchedUser={matchedUser}
              onOpenUser={onOpenUser}
              className="text-base"
            />
          </div>
          <p className="mt-1 text-sm font-bold text-[#665b67]">
            {display.customerContext}
          </p>
          <p className="mt-2 inline-flex rounded-full bg-[#f7f1e8] px-3 py-1 text-xs font-black text-[#551839]">
            {display.customerTypeLabel}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2">
          <StatusPill value={currentState} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <DetailCard label="Product" value={display.productLabel || "N/A"} />
        <DetailCard
          label="Amount"
          value={`${order.amount} ${order.token_symbol}`}
        />
        <DetailCard label="Profit" value={display.profitValue} />
        <DetailCard label="Profit breakdown" value={display.profitBreakdown} />
      </div>

      {order.fulfillment_type === "giftcard" ? (
        <ProductThumbnailRow items={display.productItems} />
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <PaymentOrderActionButtons
          order={order}
          config={config}
          processingOrderId={processingOrderId}
          onApprove={onApprove}
          onRelease={onRelease}
          onDelete={onDelete}
        />
      </div>
    </article>
  );
}

function MessagesSection({
  contacts,
  selectedContact,
  processingContactId,
  replyDraft,
  onChangeReplyDraft,
  onOpenDetail,
  onCloseDetail,
  onSendReply,
}) {
  return (
    <section className="rounded-[2rem] border border-[#eadfe7] bg-white shadow-[0_20px_70px_rgba(33,23,34,0.08)]">
      <SectionHeader
        title="Customer messages"
        subtitle="Read new contact messages and reply directly from the admin dashboard."
      />

      {selectedContact ? (
        <MessageDetailView
          contact={selectedContact}
          replyDraft={replyDraft}
          processingContactId={processingContactId}
          onChangeReplyDraft={onChangeReplyDraft}
          onBack={onCloseDetail}
          onSendReply={onSendReply}
        />
      ) : contacts.length ? (
        <div className="divide-y divide-[#eadfe7]">
          {contacts.map((contact) => (
            <MessageRow
              key={contact.id}
              contact={contact}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      ) : (
        <div className="px-5 py-8 text-sm font-bold text-[#665b67]">
          No contact messages yet.
        </div>
      )}
    </section>
  );
}

function MessageRow({ contact, onOpenDetail }) {
  return (
    <button
      type="button"
      onClick={() => onOpenDetail(contact)}
      className="grid w-full gap-3 px-5 py-5 text-left transition hover:bg-[#fbf8f4] sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] sm:items-center"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="mb-0 font-black text-[#211722]">{contact.name}</p>
          {contact.is_new ? (
            <span className="inline-flex rounded-full bg-[#dff8ef] px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#067a5f]">
              New
            </span>
          ) : null}
          {contact.is_replied ? (
            <span className="inline-flex rounded-full bg-[#f7f1e8] px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#551839]">
              Replied
            </span>
          ) : null}
        </div>
        <p className="mt-1 mb-0 text-sm font-bold text-[#665b67]">
          {contact.email}
        </p>
      </div>

      <p className="line-clamp-2 text-sm font-bold text-[#665b67]">
        {contact.message}
      </p>

      <div className="flex flex-col items-start gap-1 sm:items-end">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-[#9a8b97]">
          {formatDateTime(contact.created_at)}
        </span>
        <span className="text-sm font-black text-[#551839]">Open</span>
      </div>
    </button>
  );
}

function MessageDetailView({
  contact,
  replyDraft,
  processingContactId,
  onChangeReplyDraft,
  onBack,
  onSendReply,
}) {
  const isSending = processingContactId === contact.id;

  return (
    <div className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-[#eadfe7] pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#eadfe7] px-4 text-sm font-black text-[#551839]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to messages
          </button>
          <p className="mt-4 text-[11px] font-black uppercase tracking-[0.22em] text-[#9a8b97]">
            Contact message
          </p>
          <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#211722]">
            {contact.name}
          </h3>
          <p className="mt-2 text-sm font-bold text-[#665b67]">
            {contact.email}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {contact.is_new ? (
            <StatusPill value="new" muted />
          ) : (
            <StatusPill value="read" muted />
          )}
          {contact.is_replied ? (
            <StatusPill value="replied" />
          ) : (
            <StatusPill value="awaiting reply" muted />
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DetailCard label="Email" value={contact.email} icon={Mail} />
        <DetailCard
          label="Received"
          value={formatDateTime(contact.created_at)}
        />
        <DetailCard
          label="Read at"
          value={contact.read_at ? formatDateTime(contact.read_at) : "Unread"}
        />
        <DetailCard
          label="Last reply"
          value={
            contact.replied_at
              ? formatDateTime(contact.replied_at)
              : "No reply yet"
          }
        />
      </div>

      <article className="mt-5 rounded-[1.5rem] border border-[#eadfe7] bg-white p-5">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#9a8b97]">
          Customer message
        </p>
        <div className="rounded-[1rem] bg-[#fbf8f4] p-4 text-sm font-bold leading-7 text-[#3d3440]">
          {contact.message}
        </div>
      </article>

      <article className="mt-5 rounded-[1.5rem] border border-[#eadfe7] bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-[#10ac84]">
              Reply
            </p>
            <h4 className="mb-0 text-xl font-black tracking-[-0.04em] text-[#211722]">
              Send support response
            </h4>
          </div>
        </div>

        <textarea
          value={replyDraft}
          onChange={(event) => onChangeReplyDraft(event.target.value)}
          rows="7"
          className="mt-4 w-full rounded-[1.25rem] border border-[#eadfe7] bg-[#fbf8f4] px-4 py-4 text-sm font-bold leading-7 text-[#211722] outline-none focus:border-[#551839] focus:bg-white"
          placeholder="Write your reply to this customer..."
        />

        {contact.reply_message ? (
          <p className="mt-3 text-sm font-bold text-[#665b67]">
            Last reply sent by {contact.replied_by || "admin"}.
          </p>
        ) : null}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onSendReply}
            disabled={isSending || !replyDraft.trim()}
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#551839] px-5 text-sm font-black text-white disabled:opacity-60"
          >
            {isSending ? "Sending..." : "Send reply"}
          </button>
        </div>
      </article>
    </div>
  );
}

function UsersSection({
  users,
  selectedUser,
  userDetail,
  isUserDetailLoading,
  onOpenDetail,
  onCloseDetail,
}) {
  return (
    <section className="rounded-[2rem] border border-[#eadfe7] bg-white shadow-[0_20px_70px_rgba(33,23,34,0.08)]">
      <SectionHeader
        title="Users"
        subtitle="Open a registered user to review purchases, contact history, page activity, and cart state."
      />

      {selectedUser ? (
        isUserDetailLoading || !userDetail ? (
          <div className="p-5 sm:p-6">
            <SkeletonPanel />
          </div>
        ) : (
          <UserDetailView detail={userDetail} onBack={onCloseDetail} />
        )
      ) : users.length ? (
        <>
          <div className="divide-y divide-[#eadfe7] md:hidden">
            {users.map((user) => (
              <UserMobileCard
                key={user.id}
                user={user}
                onOpenDetail={onOpenDetail}
              />
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-[#fbf8f4] text-left text-xs font-black uppercase tracking-[0.18em] text-[#9a8b97]">
                  <th className="px-5 py-4">User</th>
                  <th className="px-5 py-4">Auth</th>
                  <th className="px-5 py-4">Orders</th>
                  <th className="px-5 py-4">Page views</th>
                  <th className="px-5 py-4">Cart</th>
                  <th className="px-5 py-4">Last activity</th>
                  <th className="px-5 py-4 text-right">Open</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <UserTableRow
                    key={user.id}
                    user={user}
                    onOpenDetail={onOpenDetail}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="px-5 py-8 text-sm font-bold text-[#665b67]">
          No users found yet.
        </div>
      )}
    </section>
  );
}

function UserTableRow({ user, onOpenDetail }) {
  return (
    <tr className="border-t border-[#eadfe7] align-top">
      <td className="px-5 py-4">
        <div className="min-w-[14rem]">
          <p className="mb-0 text-sm font-black text-[#211722]">
            {user.display_name || user.email}
          </p>
          <p className="mt-1 break-all text-xs font-bold text-[#665b67]">
            {user.email}
          </p>
          <p className="mt-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#9a8b97]">
            Joined {formatDateTime(user.date_joined)}
          </p>
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="flex min-w-[11rem] flex-wrap gap-2">
          <StatusPill value={user.auth_type || "email"} muted />
          <StatusPill
            value={user.email_verified ? "verified" : "unverified"}
            muted
          />
          {user.suspended ? <StatusPill value="suspended" /> : null}
        </div>
      </td>
      <td className="px-5 py-4 text-sm font-bold text-[#665b67]">
        <div className="min-w-[9rem] space-y-1">
          <p className="mb-0">Payments {user.payment_orders || 0}</p>
          <p className="mb-0">Top-ups {user.topups || 0}</p>
          <p className="mb-0">Gift cards {user.giftcards || 0}</p>
        </div>
      </td>
      <td className="px-5 py-4 text-sm font-bold text-[#665b67]">
        <div className="min-w-[8rem] space-y-1">
          <p className="mb-0">{user.page_views || 0} page views</p>
          <p className="mb-0">{user.tracked_events || 0} tracked events</p>
        </div>
      </td>
      <td className="px-5 py-4 text-sm font-bold text-[#665b67]">
        {user.cart_items || 0} items
      </td>
      <td className="px-5 py-4">
        <p className="min-w-[10rem] text-xs font-black uppercase tracking-[0.14em] text-[#9a8b97]">
          {formatDateTime(
            user.last_activity_at || user.last_login || user.date_joined,
          )}
        </p>
      </td>
      <td className="px-5 py-4 text-right">
        <button
          type="button"
          onClick={() => onOpenDetail(user)}
          className="inline-flex h-10 items-center justify-center rounded-full bg-[#551839] px-4 text-sm font-black text-white"
        >
          Open activity
        </button>
      </td>
    </tr>
  );
}

function UserMobileCard({ user, onOpenDetail }) {
  return (
    <button
      type="button"
      onClick={() => onOpenDetail(user)}
      className="w-full p-5 text-left transition hover:bg-[#fbf8f4]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-0 text-base font-black text-[#211722]">
            {user.display_name || user.email}
          </p>
          <p className="mt-1 break-all text-sm font-bold text-[#665b67]">
            {user.email}
          </p>
        </div>
        <StatusPill
          value={user.email_verified ? "verified" : "unverified"}
          muted
        />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <DetailCard label="Orders" value={`${user.payment_orders || 0}`} />
        <DetailCard label="Page views" value={`${user.page_views || 0}`} />
        <DetailCard label="Cart items" value={`${user.cart_items || 0}`} />
        <DetailCard
          label="Last activity"
          value={formatDateTime(
            user.last_activity_at || user.last_login || user.date_joined,
          )}
        />
      </div>
    </button>
  );
}

function UserDetailView({ detail, onBack }) {
  const profile = detail?.user || {};
  const summary = detail?.summary || {};
  const timeline = detail?.activity_timeline || [];
  const pageViews = detail?.page_views || [];
  const paymentOrders = detail?.payment_orders || [];
  const topups = detail?.topups || [];
  const giftcards = detail?.giftcards || [];
  const cartItems = detail?.cart_items || [];
  const contacts = detail?.contacts || [];
  const analyticsEvents = detail?.analytics_events || [];

  return (
    <div className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-[#eadfe7] pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#eadfe7] px-4 text-sm font-black text-[#551839]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to users
          </button>
          <p className="mt-4 text-[11px] font-black uppercase tracking-[0.22em] text-[#9a8b97]">
            User activity
          </p>
          <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#211722]">
            {profile.display_name || profile.email}
          </h3>
          <p className="mt-2 break-all text-sm font-bold text-[#665b67]">
            {profile.email}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusPill value={profile.auth_type || "email"} muted />
          <StatusPill
            value={profile.email_verified ? "verified" : "unverified"}
            muted
          />
          <StatusPill value={profile.is_active ? "active" : "inactive"} muted />
          {profile.suspended ? <StatusPill value="suspended" /> : null}
          {profile.deleted ? <StatusPill value="deleted" /> : null}
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DetailCard label="Phone" value={profile.phone_number || "N/A"} />
        <DetailCard label="Country" value={profile.country || "N/A"} />
        <DetailCard
          label="Joined"
          value={formatDateTime(profile.date_joined)}
        />
        <DetailCard
          label="Last login"
          value={formatDateTime(profile.last_login)}
        />
        <DetailCard
          label="Payment orders"
          value={summary.payment_orders || 0}
        />
        <DetailCard label="Top-ups" value={summary.topups || 0} />
        <DetailCard label="Gift cards" value={summary.giftcards || 0} />
        <DetailCard label="Page views" value={summary.page_views || 0} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
        <article className="rounded-[1.5rem] border border-[#eadfe7] bg-white p-5">
          <p className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-[#10ac84]">
            Timeline
          </p>
          <h4 className="mb-0 text-xl font-black tracking-[-0.04em] text-[#211722]">
            Recent activity
          </h4>
          <div className="mt-5 space-y-3">
            {timeline.length ? (
              timeline.map((item, index) => (
                <div
                  key={`${item.kind}-${item.created_at || index}-${index}`}
                  className="rounded-[1.25rem] border border-[#eadfe7] bg-[#fbf8f4] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="mb-0 text-sm font-black text-[#211722]">
                        {item.title}
                      </p>
                      {item.subtitle ? (
                        <p className="mt-1 mb-0 break-all text-xs font-bold text-[#665b67]">
                          {item.subtitle}
                        </p>
                      ) : null}
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#9a8b97]">
                      {formatDateTime(item.created_at)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <EmptyAnalyticsState label="No activity captured for this user yet." />
            )}
          </div>
        </article>

        <article className="rounded-[1.5rem] border border-[#eadfe7] bg-white p-5">
          <p className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-[#10ac84]">
            Page traffic
          </p>
          <h4 className="mb-0 text-xl font-black tracking-[-0.04em] text-[#211722]">
            Pages viewed
          </h4>
          <div className="mt-5 overflow-x-auto">
            {pageViews.length ? (
              <table className="min-w-full text-left">
                <thead>
                  <tr className="text-xs font-black uppercase tracking-[0.18em] text-[#9a8b97]">
                    <th className="pb-3 pr-4">Page</th>
                    <th className="pb-3 pr-4">Route</th>
                    <th className="pb-3">Views</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1e8ef]">
                  {pageViews.map((item) => (
                    <tr key={item.path}>
                      <td className="py-3 pr-4 text-sm font-black text-[#211722]">
                        {item.title}
                      </td>
                      <td className="py-3 pr-4 text-xs font-bold text-[#665b67]">
                        {truncatePath(item.path, 34)}
                      </td>
                      <td className="py-3 text-sm font-bold text-[#665b67]">
                        {item.views}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyAnalyticsState label="No page views captured for this user yet." />
            )}
          </div>
        </article>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <CompactDataTable
          title="Payment orders"
          subtitle="Crypto payment orders tied to this email."
          columns={["Order", "Type", "Amount", "State", "Created"]}
          rows={paymentOrders.map((order) => {
            const display = getPaymentOrderDisplay(order);
            return {
              key: order.order_id,
              cells: [
                <div className="min-w-[10rem]">
                  <p className="mb-0 text-sm font-black text-[#211722]">
                    {order.payment_code ||
                      String(order.order_id || "").slice(0, 8)}
                  </p>
                  <p className="mt-1 mb-0 break-all text-xs font-bold text-[#665b67]">
                    {display.reference}
                  </p>
                </div>,
                order.fulfillment_type,
                `${order.amount} ${order.token_symbol}`,
                `${order.status} / ${order.fulfillment_status}`,
                formatDateTime(order.created_at),
              ],
            };
          })}
          emptyLabel="No payment orders for this user."
        />

        <CompactDataTable
          title="Cart items"
          subtitle="Current saved cart items for this account."
          columns={["Product", "Qty", "Value", "Updated"]}
          rows={cartItems.map((item) => ({
            key: item.id,
            cells: [
              <div className="min-w-[10rem]">
                <p className="mb-0 text-sm font-black text-[#211722]">
                  {item.product_name}
                </p>
                <p className="mt-1 mb-0 text-xs font-bold text-[#665b67]">
                  {item.recipient_amount} {item.recipient_currency}
                </p>
              </div>,
              item.quantity,
              `${item.amount_to_pay} ${item.currency_to_pay_in}`,
              formatDateTime(item.updated_at),
            ],
          }))}
          emptyLabel="No cart items saved for this user."
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <CompactDataTable
          title="Top-up transactions"
          subtitle="Completed or attempted top-ups tied to this account."
          columns={["Reference", "Phone", "Amount", "Status", "Created"]}
          rows={topups.map((item) => ({
            key: item.reference,
            cells: [
              item.reference,
              item.phone_number,
              `${item.receiver_amount} ${item.receiver_currency_code}`,
              item.status,
              formatDateTime(item.created_at),
            ],
          }))}
          emptyLabel="No top-up history for this user."
        />

        <CompactDataTable
          title="Gift card transactions"
          subtitle="Gift card purchases tied to this account."
          columns={["Reference", "Amount", "Products", "Method", "Created"]}
          rows={giftcards.map((item) => ({
            key: item.reference,
            cells: [
              item.reference,
              `${item.amount} ${item.profit_currency || ""}`.trim(),
              item.products?.length || 0,
              item.payment_method,
              formatDateTime(item.created_at),
            ],
          }))}
          emptyLabel="No gift card history for this user."
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <CompactDataTable
          title="Contact messages"
          subtitle="Messages this user sent through the contact form."
          columns={["Received", "State", "Message"]}
          rows={contacts.map((item) => ({
            key: item.id,
            cells: [
              formatDateTime(item.created_at),
              item.is_replied ? "Replied" : item.is_new ? "New" : "Read",
              <span className="line-clamp-2 text-sm font-bold text-[#665b67]">
                {item.message}
              </span>,
            ],
          }))}
          emptyLabel="No contact messages from this user."
        />

        <CompactDataTable
          title="Tracked events"
          subtitle="Recent frontend analytics events captured while this user was logged in."
          columns={["Event", "Context", "When"]}
          rows={analyticsEvents.map((item) => ({
            key: item.id,
            cells: [
              formatEventTypeLabel(item.event_type),
              <div className="min-w-[10rem]">
                <p className="mb-0 text-sm font-black text-[#211722]">
                  {item.page_title ||
                    item.product_name ||
                    item.page_path ||
                    "Activity"}
                </p>
                <p className="mt-1 mb-0 break-all text-xs font-bold text-[#665b67]">
                  {item.page_path || item.product_id || ""}
                </p>
              </div>,
              formatDateTime(item.created_at),
            ],
          }))}
          emptyLabel="No tracked analytics events for this user."
        />
      </div>
    </div>
  );
}

function CompactDataTable({ title, subtitle, columns, rows, emptyLabel }) {
  return (
    <article className="rounded-[1.5rem] border border-[#eadfe7] bg-white p-5">
      <p className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-[#10ac84]">
        {title}
      </p>
      <h4 className="mb-0 text-xl font-black tracking-[-0.04em] text-[#211722]">
        {title}
      </h4>
      <p className="mt-2 text-sm font-bold text-[#665b67]">{subtitle}</p>
      <div className="mt-5 overflow-x-auto">
        {rows.length ? (
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-xs font-black uppercase tracking-[0.18em] text-[#9a8b97]">
                {columns.map((column) => (
                  <th key={column} className="pb-3 pr-4">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1e8ef]">
              {rows.map((row) => (
                <tr key={row.key}>
                  {row.cells.map((cell, index) => (
                    <td
                      key={`${row.key}-${index}`}
                      className="py-3 pr-4 align-top text-sm font-bold text-[#665b67]"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyAnalyticsState label={emptyLabel} />
        )}
      </div>
    </article>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <article className="rounded-[1.5rem] border border-[#eadfe7] bg-white p-5 shadow-[0_16px_45px_rgba(33,23,34,0.05)]">
      <div className="flex items-center justify-between gap-3">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-2xl text-white ${tone}`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span className="text-right text-xs font-black uppercase tracking-[0.18em] text-[#9a8b97]">
          {label}
        </span>
      </div>
      <p className="mt-4 text-4xl font-black tracking-[-0.05em]">
        {value ?? 0}
      </p>
    </article>
  );
}

function ConfigInput({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black">{label}</span>
      <input
        className="h-14 w-full rounded-2xl border border-[#eadfe7] bg-[#fbf8f4] px-4 py-3 font-black outline-none focus:border-[#551839]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type="number"
        min="0"
        step="0.01"
      />
    </label>
  );
}

function getChartColor(tone) {
  const toneMap = {
    "bg-[#551839]": "#551839",
    "bg-[#10ac84]": "#10ac84",
    "bg-[#2775ca]": "#2775ca",
    "bg-[#f59e0b]": "#f59e0b",
  };

  return toneMap[tone] || "#551839";
}

function SimpleBarChart({ items }) {
  const data = items.map((item) => ({
    ...item,
    fill: getChartColor(item.tone),
  }));

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: -20, bottom: 4 }}
        >
          <CartesianGrid
            stroke="#f1e8ef"
            strokeDasharray="4 4"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fill: "#665b67", fontSize: 12, fontWeight: 700 }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "#665b67", fontSize: 12, fontWeight: 700 }}
          />
          <Tooltip
            cursor={{ fill: "#fbf8f4" }}
            contentStyle={{
              borderRadius: "16px",
              border: "1px solid #eadfe7",
              background: "#ffffff",
            }}
          />
          <Bar dataKey="value" radius={[14, 14, 0, 0]}>
            {data.map((item) => (
              <Cell key={item.label} fill={item.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatEventTypeLabel(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatPathLabel(path) {
  if (!path) {
    return "Unknown";
  }

  if (path === "/") {
    return "Home";
  }

  return path
    .replace(/^\//, "")
    .replace(/[/?=&-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function truncatePath(path, maxLength = 40) {
  const value = String(path || "");
  if (!value || value.length <= maxLength) {
    return value || "/";
  }

  return `${value.slice(0, maxLength - 1)}...`;
}

function AnalyticsMetricCard({ icon: Icon, label, value, tone, helper }) {
  return (
    <article className="rounded-[1.5rem] border border-[#eadfe7] bg-white p-5 shadow-[0_16px_45px_rgba(33,23,34,0.05)]">
      <div className="flex items-center justify-between gap-3">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-2xl text-white ${tone}`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span className="text-right text-[11px] font-black uppercase tracking-[0.18em] text-[#9a8b97]">
          {label}
        </span>
      </div>
      <p className="mt-4 text-4xl font-black tracking-[-0.05em] text-[#211722]">
        {value ?? 0}
      </p>
      {helper ? (
        <p className="mt-2 mb-0 text-sm font-bold text-[#665b67]">{helper}</p>
      ) : null}
    </article>
  );
}

function EmptyAnalyticsState({ label }) {
  return (
    <div className="rounded-[1.25rem] border border-dashed border-[#eadfe7] bg-[#fbf8f4] px-4 py-8 text-center text-sm font-bold text-[#665b67]">
      {label}
    </div>
  );
}

function AnalyticsSection({
  analytics,
  analyticsSummary,
  pageTraffic,
  eventBreakdown,
  trafficSeries,
  topGiftcards,
  abandonedCarts,
  chartItems,
  stats,
  onViewAllPageTraffic,
}) {
  const pieColors = [
    "#551839",
    "#10ac84",
    "#2775ca",
    "#f59e0b",
    "#211722",
    "#d96c8b",
  ];
  const pageChartData = pageTraffic.slice(0, 6).map((item) => ({
    path: formatPathLabel(item.path),
    views: item.views,
  }));

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <AnalyticsMetricCard
          icon={Eye}
          label="Page views"
          value={analyticsSummary.page_views || 0}
          tone="bg-[#551839]"
          helper={`Last ${analytics.window_days || 7} days`}
        />
        <AnalyticsMetricCard
          icon={Users}
          label="Unique visitors"
          value={analyticsSummary.unique_visitors || 0}
          tone="bg-[#10ac84]"
          helper="Based on tracked browser sessions"
        />
        <AnalyticsMetricCard
          icon={Clock3}
          label="Gift card views"
          value={analyticsSummary.giftcard_views || 0}
          tone="bg-[#2775ca]"
          helper={`${analyticsSummary.average_giftcard_view_seconds || 0}s avg time on page`}
        />
        <AnalyticsMetricCard
          icon={ShoppingCart}
          label="Gift cards added"
          value={analyticsSummary.giftcards_added_to_cart || 0}
          tone="bg-[#f59e0b]"
          helper={`${analyticsSummary.add_to_cart_actions || 0} add-to-cart actions`}
        />
        <AnalyticsMetricCard
          icon={MousePointerClick}
          label="Abandoned carts"
          value={analyticsSummary.abandoned_registered_carts || 0}
          tone="bg-[#211722]"
          helper={`Inactive for ${analytics.abandoned_after_minutes || 180}+ minutes`}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
        <div className="rounded-[2rem] border border-[#eadfe7] bg-white p-5 shadow-[0_20px_70px_rgba(33,23,34,0.08)] sm:p-6">
          <SectionIntro
            icon={Activity}
            title="Traffic trend"
            subtitle={`Tracked page views over the last ${analytics.window_days || 7} days.`}
          />
          <div className="mt-6 h-[320px]">
            {trafficSeries.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trafficSeries}
                  margin={{ top: 8, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="trafficAreaFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#551839" stopOpacity={0.3} />
                      <stop
                        offset="95%"
                        stopColor="#551839"
                        stopOpacity={0.03}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="#f1e8ef"
                    strokeDasharray="4 4"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#665b67", fontSize: 12, fontWeight: 700 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "#665b67", fontSize: 12, fontWeight: 700 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "1px solid #eadfe7",
                      background: "#ffffff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#551839"
                    strokeWidth={3}
                    fill="url(#trafficAreaFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyAnalyticsState label="Traffic data will appear after visitors start browsing the site." />
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#eadfe7] bg-white p-5 shadow-[0_20px_70px_rgba(33,23,34,0.08)] sm:p-6">
          <SectionIntro
            icon={MousePointerClick}
            title="Event mix"
            subtitle="What visitors are doing most often across the storefront."
          />
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)] xl:grid-cols-1">
            <div className="h-[240px]">
              {eventBreakdown.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={eventBreakdown}
                      dataKey="count"
                      nameKey="event_type"
                      innerRadius={58}
                      outerRadius={92}
                      paddingAngle={3}
                    >
                      {eventBreakdown.map((item, index) => (
                        <Cell
                          key={item.event_type}
                          fill={pieColors[index % pieColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [
                        value,
                        formatEventTypeLabel(name),
                      ]}
                      contentStyle={{
                        borderRadius: "16px",
                        border: "1px solid #eadfe7",
                        background: "#ffffff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyAnalyticsState label="No tracked events yet." />
              )}
            </div>
            <div className="space-y-3">
              {eventBreakdown.slice(0, 6).map((item, index) => (
                <div
                  key={item.event_type}
                  className="flex items-center justify-between rounded-[1rem] bg-[#fbf8f4] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: pieColors[index % pieColors.length],
                      }}
                    />
                    <span className="text-sm font-black text-[#211722]">
                      {formatEventTypeLabel(item.event_type)}
                    </span>
                  </div>
                  <span className="text-sm font-black text-[#551839]">
                    {item.count}
                  </span>
                </div>
              ))}
              {!eventBreakdown.length ? (
                <p className="text-sm font-bold text-[#665b67]">
                  Event counts appear after tracking data is received.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
        <div className="rounded-[2rem] border border-[#eadfe7] bg-white p-5 shadow-[0_20px_70px_rgba(33,23,34,0.08)] sm:p-6">
          <SectionIntro
            icon={BarChart3}
            title="Page traffic"
            subtitle="Most visited storefront routes during the current analytics window."
          />
          <div className="mt-6 h-[320px]">
            {pageChartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={pageChartData}
                  layout="vertical"
                  margin={{ top: 8, right: 10, left: 10, bottom: 8 }}
                >
                  <CartesianGrid
                    stroke="#f1e8ef"
                    strokeDasharray="4 4"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fill: "#665b67", fontSize: 12, fontWeight: 700 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="path"
                    width={110}
                    tick={{ fill: "#665b67", fontSize: 12, fontWeight: 700 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "1px solid #eadfe7",
                      background: "#ffffff",
                    }}
                  />
                  <Bar dataKey="views" fill="#10ac84" radius={[0, 14, 14, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyAnalyticsState label="Page traffic will show here once visits are tracked." />
            )}
          </div>
          <div className="mt-4 overflow-x-auto">
            {pageTraffic.length ? (
              <div className="mb-4 flex justify-end">
                <button
                  type="button"
                  onClick={onViewAllPageTraffic}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-[#eadfe7] bg-white px-4 text-sm font-black text-[#551839] transition hover:border-[#551839]/30"
                >
                  View all
                </button>
              </div>
            ) : null}
            <table className="min-w-full text-left">
              <thead>
                <tr className="text-xs font-black uppercase tracking-[0.18em] text-[#9a8b97]">
                  <th className="pb-3 pr-4">Page</th>
                  <th className="pb-3 pr-4">Route</th>
                  <th className="pb-3 pr-4">Views</th>
                  <th className="pb-3">Visitors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1e8ef]">
                {pageTraffic.map((item) => (
                  <tr key={item.path}>
                    <td className="py-3 pr-4 align-top">
                      <div className="text-sm font-black text-[#211722]">
                        {item.title || formatPathLabel(item.path)}
                      </div>
                      <div className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[#9a8b97]">
                        {item.views} view{item.views === 1 ? "" : "s"}
                      </div>
                    </td>
                    <td className="py-3 pr-4 align-top text-sm font-bold text-[#665b67]">
                      <span title={item.path}>{truncatePath(item.path)}</span>
                    </td>
                    <td className="py-3 pr-4 align-top text-sm font-bold text-[#665b67]">
                      {item.views}
                    </td>
                    <td className="py-3 align-top text-sm font-bold text-[#665b67]">
                      {item.unique_visitors}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!pageTraffic.length ? (
              <div className="pt-4">
                <EmptyAnalyticsState label="No page-traffic rows yet." />
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#eadfe7] bg-white p-5 shadow-[0_20px_70px_rgba(33,23,34,0.08)] sm:p-6">
          <SectionIntro
            icon={CheckCircle2}
            title="Order status"
            subtitle="Operations snapshot alongside the new customer analytics data."
          />
          <div className="mt-6">
            <SimpleBarChart items={chartItems} />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <SummaryLine
              label="Total orders"
              value={stats.payment_orders || 0}
            />
            <SummaryLine
              label="Paid orders"
              value={stats.paid_payment_orders || 0}
            />
            <SummaryLine
              label="Approved"
              value={stats.approved_payment_orders || 0}
            />
            <SummaryLine label="Manual queue" value={stats.manual_queue || 0} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-[2rem] border border-[#eadfe7] bg-white p-5 shadow-[0_20px_70px_rgba(33,23,34,0.08)] sm:p-6">
          <SectionIntro
            icon={Gift}
            title="Top gift cards"
            subtitle="Products drawing the most attention, dwell time, and add-to-cart intent."
          />
          {topGiftcards.length ? (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="text-xs font-black uppercase tracking-[0.18em] text-[#9a8b97]">
                    <th className="pb-3 pr-4">Gift card</th>
                    <th className="pb-3 pr-4">Views</th>
                    <th className="pb-3 pr-4">Avg time</th>
                    <th className="pb-3 pr-4">Added</th>
                    <th className="pb-3">Buy now</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1e8ef]">
                  {topGiftcards.map((item) => (
                    <tr key={`${item.product_id || item.product_name}`}>
                      <td className="py-3 pr-4 text-sm font-black text-[#211722]">
                        {item.product_name}
                      </td>
                      <td className="py-3 pr-4 text-sm font-bold text-[#665b67]">
                        {item.views}
                      </td>
                      <td className="py-3 pr-4 text-sm font-bold text-[#665b67]">
                        {item.average_view_seconds}s
                      </td>
                      <td className="py-3 pr-4 text-sm font-bold text-[#665b67]">
                        {item.add_to_cart}
                      </td>
                      <td className="py-3 text-sm font-bold text-[#665b67]">
                        {item.buy_now}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-6">
              <EmptyAnalyticsState label="Gift-card product analytics will populate after visitors browse product pages." />
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-[#eadfe7] bg-white p-5 shadow-[0_20px_70px_rgba(33,23,34,0.08)] sm:p-6">
          <SectionIntro
            icon={ShoppingCart}
            title="Abandoned carts"
            subtitle="Registered users with cart activity older than the configured inactivity threshold."
          />
          <div className="mt-6 space-y-4">
            {abandonedCarts.length ? (
              abandonedCarts.map((cart) => (
                <article
                  key={cart.user_id}
                  className="rounded-[1.5rem] border border-[#eadfe7] bg-[#fbf8f4] p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="mb-0 text-base font-black text-[#211722]">
                        {cart.name}
                      </p>
                      <p className="mt-1 mb-0 text-sm font-bold text-[#665b67]">
                        {cart.email}
                      </p>
                    </div>
                    <div className="text-sm font-bold text-[#665b67] sm:text-right">
                      <p className="mb-0">{cart.item_count} items</p>
                      <p className="mt-1 mb-0">
                        {cart.total_quantity} total quantity
                      </p>
                      <p className="mt-1 mb-0">
                        {cart.total_value} total value
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 mb-0 text-xs font-black uppercase tracking-[0.16em] text-[#9a8b97]">
                    Last activity {formatDateTime(cart.last_activity_at)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {cart.products.slice(0, 4).map((product) => (
                      <span
                        key={`${product.id}-${product.product_id}`}
                        className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-[#551839]"
                      >
                        {product.product_name} x{product.quantity}
                      </span>
                    ))}
                    {cart.products.length > 4 ? (
                      <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-[#551839]">
                        +{cart.products.length - 4} more
                      </span>
                    ) : null}
                  </div>
                </article>
              ))
            ) : (
              <EmptyAnalyticsState label="No abandoned registered carts in the current window." />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function SidebarLink({ icon: Icon, label, badge = 0, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-black transition ${
        isActive
          ? "border-[#9ff1dd]/20 bg-white/10 text-white shadow-[0_12px_24px_rgba(0,0,0,0.12)]"
          : "border-transparent bg-transparent text-white/80 shadow-none hover:border-transparent hover:bg-transparent hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="flex-1">{label}</span>
      {badge > 0 ? (
        <span className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-[#10ac84] px-2 text-[11px] font-black text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </button>
  );
}

function NotificationDropdown({
  items,
  onOpenOrders,
  onSelectOrder,
  desktop = false,
}) {
  return (
    <div
      className={`absolute right-0 z-40 w-[320px] overflow-hidden rounded-[1.5rem] border border-[#eadfe7] bg-white shadow-[0_24px_80px_rgba(33,23,34,0.16)] ${
        desktop ? "top-[3.4rem]" : "top-[3.5rem]"
      }`}
    >
      <div className="border-b border-[#eadfe7] px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-[#10ac84]">
              Notifications
            </p>
            <h3 className="mb-0 text-lg font-black tracking-[-0.04em] text-[#211722]">
              Recent order alerts
            </h3>
          </div>
          <button
            type="button"
            onClick={onOpenOrders}
            className="text-sm font-black text-[#551839]"
          >
            View all
          </button>
        </div>
      </div>

      <div className="max-h-[360px] overflow-y-auto">
        {items.length ? (
          items.map((item) => (
            <button
              key={item.order_id}
              type="button"
              onClick={() => onSelectOrder(item)}
              className="flex w-full flex-col gap-1 border-b border-[#f1e8ef] px-4 py-4 text-left transition hover:bg-[#fbf8f4]"
            >
              <span className="text-sm font-black text-[#211722]">
                {item.customer_email || item.summary?.email || "Customer order"}
              </span>
              <span className="text-sm font-bold text-[#665b67]">
                {item.amount} {item.token_symbol} · {item.fulfillment_type}
              </span>
              <span className="font-mono text-xs font-black uppercase tracking-[0.12em] text-[#9a8b97]">
                {item.payment_code || item.order_id}
              </span>
            </button>
          ))
        ) : (
          <div className="px-4 py-6 text-sm font-bold text-[#665b67]">
            No new notifications.
          </div>
        )}
      </div>
    </div>
  );
}

function ApprovePaymentModal({
  orderId,
  secretCode,
  processingOrderId,
  onChangeSecretCode,
  onClose,
  onSubmit,
}) {
  if (!orderId) {
    return null;
  }

  const isSubmitting = processingOrderId === orderId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#211722]/45 px-4">
      <div className="w-full max-w-md rounded-[2rem] border border-[#eadfe7] bg-white p-6 shadow-[0_30px_100px_rgba(33,23,34,0.22)] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#10ac84]">
              Manual approval
            </p>
            <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#211722]">
              Approve payment
            </h3>
            <p className="mt-2 text-sm font-bold leading-6 text-[#665b67]">
              Enter the admin secret code to approve this payment order.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#eadfe7] bg-[#fbf8f4] text-[#551839] disabled:opacity-60"
            aria-label="Close approval modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-black text-[#211722]">
            Secret code
          </span>
          <input
            type="password"
            value={secretCode}
            onChange={(event) => onChangeSecretCode(event.target.value)}
            className="h-14 w-full rounded-2xl border border-[#eadfe7] bg-[#fbf8f4] px-4 py-3 font-black outline-none focus:border-[#551839]"
            placeholder="Enter admin secret code"
            autoFocus
          />
        </label>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#eadfe7] px-5 text-sm font-black text-[#665b67] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || !secretCode.trim()}
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#551839] px-5 text-sm font-black text-white disabled:opacity-60"
          >
            {isSubmitting ? "Approving..." : "Approve payment"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="border-b border-[#eadfe7] p-5">
      <h2 className="text-xl font-black tracking-[-0.04em]">{title}</h2>
      {subtitle ? (
        <p className="mt-1 text-sm font-bold text-[#665b67]">{subtitle}</p>
      ) : null}
    </div>
  );
}

function SectionIntro({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f7f1e8]">
        <Icon className="h-5 w-5 text-[#551839]" />
      </span>
      <div>
        <h2 className="text-xl font-black tracking-[-0.04em]">{title}</h2>
        <p className="text-sm font-bold text-[#665b67]">{subtitle}</p>
      </div>
    </div>
  );
}

function StatusPill({ value, muted = false }) {
  const normalized = String(value || "").toLowerCase();
  const colorClass = muted
    ? "bg-[#fbf8f4] text-[#665b67]"
    : normalized === "new"
      ? "bg-[#dff8ef] text-[#067a5f]"
      : normalized === "replied"
        ? "bg-[#e7ecff] text-[#2751ca]"
        : normalized === "paid" ||
            normalized === "approved" ||
            normalized === "completed"
          ? "bg-[#dff8ef] text-[#067a5f]"
          : normalized === "processing"
            ? "bg-[#e7ecff] text-[#2751ca]"
            : normalized === "awaiting approval" ||
                normalized === "pending payment"
              ? "bg-[#fff1d6] text-[#9a5a00]"
              : normalized === "ready to release"
                ? "bg-[#f7f1e8] text-[#551839]"
                : normalized === "failed"
                  ? "bg-red-50 text-red-600"
                  : "bg-[#f7f1e8] text-[#551839]";

  return (
    <span
      className={`inline-flex w-fit whitespace-nowrap rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${colorClass}`}
    >
      {value}
    </span>
  );
}

function UserEmailButton({
  email,
  matchedUser,
  onOpenUser,
  className = "text-sm",
}) {
  if (!email) {
    return (
      <p className={`mb-0 break-all font-black text-[#211722] ${className}`}>
        No email saved
      </p>
    );
  }

  if (!matchedUser || !onOpenUser) {
    return (
      <p className={`mb-0 break-all font-black text-[#211722] ${className}`}>
        {email}
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpenUser(matchedUser)}
      className={`mb-0 break-all text-left font-black text-[#551839] underline decoration-[#551839]/25 underline-offset-4 transition hover:text-[#3f1029] ${className}`}
    >
      {email}
    </button>
  );
}

function DetailCard({ label, value, icon: Icon, mono = false }) {
  return (
    <article className="rounded-[1.25rem] border border-[#eadfe7] bg-white p-4">
      <div className="mb-2 flex items-center gap-2">
        {Icon ? <Icon className="h-4 w-4 text-[#551839]" /> : null}
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9a8b97]">
          {label}
        </p>
      </div>
      <p
        className={`mb-0 break-all text-[13px] font-black leading-6 text-[#211722] sm:text-sm ${mono ? "font-mono" : ""}`}
      >
        {value}
      </p>
    </article>
  );
}

function JsonPanel({ title, data }) {
  if (!data || (Array.isArray(data) && !data.length)) {
    return null;
  }

  return (
    <article className="rounded-[1.5rem] border border-[#eadfe7] bg-white p-4">
      <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#9a8b97]">
        {title}
      </p>
      <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-[1rem] bg-[#fbf8f4] p-4 text-xs font-bold leading-6 text-[#3d3440]">
        {JSON.stringify(data, null, 2)}
      </pre>
    </article>
  );
}

function TopUpRow({ order, users, onOpenUser }) {
  const profitValue = order?.profit
    ? `${order.profit} ${order.profit_currency || ""}`.trim()
    : `0.00 ${order?.profit_currency || order?.sender_currency || ""}`.trim();
  const discountLabel =
    Number(order?.discount_percentage || 0) > 0
      ? `Discount ${order.discount_percentage}%`
      : "No discount";

  return (
    <div className="grid gap-3 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <h3 className="font-black text-[#211722]">
          {order.operator || "Top-up"} · {order.phone_number}
        </h3>
        <p className="text-sm font-bold text-[#665b67]">
          {order.receiver_amount} {order.receiver_currency_code} ·{" "}
          {order.status}
        </p>
        <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-[#9a8b97]">
          Fee {order.processing_fee} {order.sender_currency} · {discountLabel}
        </p>
      </div>

      <div className="flex flex-col items-start gap-2 sm:items-end">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-[#9a8b97]">
          Profit
        </span>
        <span className="rounded-full bg-[#f7f1e8] px-3 py-2 text-sm font-black text-[#551839]">
          {profitValue}
        </span>
        {order.email ? (
          <UserEmailButton
            email={order.email}
            matchedUser={findUserByEmail(users, order.email)}
            onOpenUser={onOpenUser}
            className="font-mono text-[11px]"
          />
        ) : (
          <span className="font-mono text-[11px] font-black text-[#9a8b97]">
            {order.reference}
          </span>
        )}
      </div>
    </div>
  );
}

function GiftCardRow({ order, users, onOpenUser }) {
  const profitValue = order?.profit
    ? `${order.profit} ${order.profit_currency || ""}`.trim()
    : `0.00 ${order?.profit_currency || "USD"}`.trim();
  const discountLabel =
    Number(order?.discount_profit || 0) > 0
      ? `Discount ${order.discount_profit} ${order.profit_currency || ""}`.trim()
      : "No discount";

  return (
    <div className="grid gap-3 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <h3 className="font-black text-[#211722]">{order.country}</h3>
        <div className="mt-1">
          <UserEmailButton
            email={order.email}
            matchedUser={findUserByEmail(users, order.email)}
            onOpenUser={onOpenUser}
          />
        </div>
        <p className="text-sm font-bold text-[#665b67]">
          {order.amount} {order.profit_currency || ""} ·{" "}
          {order.products?.length || 0} product(s)
        </p>
        <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-[#9a8b97]">
          Fee {order.processing_fee} {order.profit_currency || ""} ·{" "}
          {discountLabel}
        </p>
        <ProductThumbnailRow items={order.products} />
      </div>

      <div className="flex flex-col items-start gap-2 sm:items-end">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-[#9a8b97]">
          Profit
        </span>
        <span className="rounded-full bg-[#f7f1e8] px-3 py-2 text-sm font-black text-[#551839]">
          {profitValue}
        </span>
        <span className="font-mono text-[11px] font-black text-[#9a8b97]">
          {order.reference}
        </span>
      </div>

      {order.products?.length ? (
        <div className="sm:col-span-2">
          <GiftCardProductGrid items={order.products} compact />
        </div>
      ) : null}
    </div>
  );
}

function CompletedTransactionsSection({
  topups,
  giftcards,
  users,
  onOpenUser,
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <CompletedTopupTable
        orders={topups}
        users={users}
        onOpenUser={onOpenUser}
      />
      <CompletedGiftcardTable
        orders={giftcards}
        users={users}
        onOpenUser={onOpenUser}
      />
    </section>
  );
}

function CompletedTopupTable({ orders, users, onOpenUser }) {
  return (
    <div className="rounded-[2rem] border border-[#eadfe7] bg-white shadow-[0_20px_70px_rgba(33,23,34,0.08)]">
      <SectionHeader
        title="Top-up transactions"
        subtitle="Recent completed top-ups."
      />
      {orders.length ? (
        <>
          <div className="divide-y divide-[#eadfe7] md:hidden">
            {orders.map((order) => (
              <TopUpRow
                key={order.reference}
                order={order}
                users={users}
                onOpenUser={onOpenUser}
              />
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-[#fbf8f4] text-left text-xs font-black uppercase tracking-[0.18em] text-[#9a8b97]">
                  <th className="px-5 py-4">Reference</th>
                  <th className="px-5 py-4">Recipient</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Profit</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.reference}
                    className="border-t border-[#eadfe7] align-top"
                  >
                    <td className="px-5 py-4">
                      <div className="min-w-[8rem]">
                        <p className="mb-0 text-sm font-black text-[#211722]">
                          {order.reference}
                        </p>
                        {order.email ? (
                          <div className="mt-1">
                            <UserEmailButton
                              email={order.email}
                              matchedUser={findUserByEmail(users, order.email)}
                              onOpenUser={onOpenUser}
                              className="text-xs"
                            />
                          </div>
                        ) : (
                          <p className="mt-1 mb-0 break-all text-xs font-bold text-[#665b67]">
                            No email
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="min-w-[10rem]">
                        <p className="mb-0 text-sm font-black text-[#211722]">
                          {order.operator || "Top-up"}
                        </p>
                        <p className="mt-1 mb-0 text-xs font-bold text-[#665b67]">
                          {order.phone_number}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="mb-0 text-sm font-black text-[#211722]">
                        {order.receiver_amount} {order.receiver_currency_code}
                      </p>
                      <p className="mt-1 mb-0 text-xs font-bold text-[#665b67]">
                        Paid {order.total_paid} {order.sender_currency}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="mb-0 text-sm font-black text-[#211722]">
                        {order.profit} {order.profit_currency}
                      </p>
                      <p className="mt-1 mb-0 text-xs font-bold text-[#665b67]">
                        Fee {order.processing_fee} {order.sender_currency}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-2">
                        <StatusPill value={order.status} muted />
                        <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#9a8b97]">
                          {formatDateTime(order.created_at)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="px-5 py-8 text-sm font-bold text-[#665b67]">
          No completed top-ups yet.
        </div>
      )}
    </div>
  );
}

function CompletedGiftcardTable({ orders, users, onOpenUser }) {
  return (
    <div className="rounded-[2rem] border border-[#eadfe7] bg-white shadow-[0_20px_70px_rgba(33,23,34,0.08)]">
      <SectionHeader
        title="Gift card transactions"
        subtitle="Recent gift-card orders."
      />
      {orders.length ? (
        <>
          <div className="divide-y divide-[#eadfe7] md:hidden">
            {orders.map((order) => (
              <GiftCardRow
                key={order.reference}
                order={order}
                users={users}
                onOpenUser={onOpenUser}
              />
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-[#fbf8f4] text-left text-xs font-black uppercase tracking-[0.18em] text-[#9a8b97]">
                  <th className="px-5 py-4">Reference</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Products</th>
                  <th className="px-5 py-4">Profit</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.reference}
                    className="border-t border-[#eadfe7] align-top"
                  >
                    <td className="px-5 py-4">
                      <div className="min-w-[8rem]">
                        <p className="mb-0 text-sm font-black text-[#211722]">
                          {order.reference}
                        </p>
                        <p className="mt-1 mb-0 text-xs font-bold text-[#665b67]">
                          {formatDateTime(order.created_at)}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="min-w-[10rem]">
                        <UserEmailButton
                          email={order.email}
                          matchedUser={findUserByEmail(users, order.email)}
                          onOpenUser={onOpenUser}
                          className="text-sm"
                        />
                        <p className="mt-1 mb-0 text-xs font-bold text-[#665b67]">
                          {order.country}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="mb-0 text-sm font-black text-[#211722]">
                        {order.amount} {order.profit_currency || ""}
                      </p>
                      <p className="mt-1 mb-0 text-xs font-bold text-[#665b67]">
                        {order.payment_method}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="min-w-[12rem]">
                        <p className="mb-0 text-sm font-black text-[#211722]">
                          {order.products?.length || 0} item(s)
                        </p>
                        <p className="mt-1 mb-0 text-xs font-bold text-[#665b67]">
                          {(order.products || [])
                            .slice(0, 2)
                            .map((item) => item.product_name)
                            .join(", ") || "No products"}
                        </p>
                        <ProductThumbnailRow items={order.products} />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="mb-0 text-sm font-black text-[#211722]">
                        {order.profit} {order.profit_currency || ""}
                      </p>
                      <p className="mt-1 mb-0 text-xs font-bold text-[#665b67]">
                        Fee {order.processing_fee} {order.profit_currency || ""}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="px-5 py-8 text-sm font-bold text-[#665b67]">
          No completed gift-card orders yet.
        </div>
      )}
    </div>
  );
}

function getCompactPaginationItems(activePage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items = [1];
  const start = Math.max(activePage - 1, 2);
  const end = Math.min(activePage + 1, totalPages - 1);

  if (start > 2) {
    items.push("left-ellipsis");
  }

  for (let value = start; value <= end; value += 1) {
    items.push(value);
  }

  if (end < totalPages - 1) {
    items.push("right-ellipsis");
  }

  items.push(totalPages);
  return items;
}

function PageTrafficSection({ detail, isLoading, onBack, onPageChange }) {
  const results = detail?.results || [];
  const page = Number(detail?.page || 1);
  const totalPages = Number(detail?.total_pages || 1);
  const totalItems = Number(detail?.total_items || 0);

  return (
    <section className="rounded-[2rem] border border-[#eadfe7] bg-white shadow-[0_20px_70px_rgba(33,23,34,0.08)]">
      <SectionHeader
        title="All page traffic"
        subtitle={`Paginated storefront route traffic for the last ${detail?.window_days || 7} days.`}
      />

      <div className="p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#eadfe7] px-4 text-sm font-black text-[#551839]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to analytics
          </button>
          <p className="mb-0 text-sm font-bold text-[#665b67]">
            {isLoading ? "Loading..." : `${totalItems} tracked routes`}
          </p>
        </div>

        {isLoading ? (
          <SkeletonPanel />
        ) : results.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="text-xs font-black uppercase tracking-[0.18em] text-[#9a8b97]">
                    <th className="pb-3 pr-4">Page</th>
                    <th className="pb-3 pr-4">Route</th>
                    <th className="pb-3 pr-4">Views</th>
                    <th className="pb-3">Visitors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1e8ef]">
                  {results.map((item) => (
                    <tr key={item.path}>
                      <td className="py-3 pr-4 align-top">
                        <div className="text-sm font-black text-[#211722]">
                          {item.title || formatPathLabel(item.path)}
                        </div>
                      </td>
                      <td className="py-3 pr-4 align-top text-sm font-bold text-[#665b67]">
                        <span title={item.path}>
                          {truncatePath(item.path, 96)}
                        </span>
                      </td>
                      <td className="py-3 pr-4 align-top text-sm font-bold text-[#665b67]">
                        {item.views}
                      </td>
                      <td className="py-3 align-top text-sm font-bold text-[#665b67]">
                        {item.unique_visitors}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 ? (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => onPageChange(Math.max(page - 1, 1))}
                  disabled={page === 1}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#eadfe7] bg-white text-[#551839] shadow-sm transition hover:border-[#551839]/30 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                {getCompactPaginationItems(page, totalPages).map((item) =>
                  typeof item === "number" ? (
                    <button
                      key={item}
                      type="button"
                      onClick={() => onPageChange(item)}
                      className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-black transition ${
                        item === page
                          ? "bg-[#551839] text-white shadow-lg shadow-[#551839]/20"
                          : "border border-[#eadfe7] bg-white text-[#665b67] hover:border-[#551839]/30 hover:text-[#551839]"
                      }`}
                    >
                      {item}
                    </button>
                  ) : (
                    <span
                      key={item}
                      className="flex h-11 w-8 items-center justify-center text-sm font-black text-[#9a8b97]"
                    >
                      ...
                    </span>
                  ),
                )}

                <button
                  type="button"
                  onClick={() => onPageChange(Math.min(page + 1, totalPages))}
                  disabled={page === totalPages}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#eadfe7] bg-white text-[#551839] shadow-sm transition hover:border-[#551839]/30 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <EmptyAnalyticsState label="No page-traffic rows yet." />
        )}
      </div>
    </section>
  );
}

function BlockedUrlsSection({
  entries,
  isLoading,
  urlInput,
  reasonInput,
  isBlocking,
  onChangeUrl,
  onChangeReason,
  onAdd,
  onToggle,
  onDelete,
}) {
  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-[#eadfe7] bg-white p-5 shadow-[0_20px_70px_rgba(33,23,34,0.08)] sm:p-6">
        <SectionIntro
          icon={ShieldOff}
          title="Block a URL"
          subtitle="Paste the full URL (e.g. https://digishelves.com/gift-card?productId=123). It will return 404 to all visitors within 60 seconds."
        />
        <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.5fr)_auto]">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => onChangeUrl(e.target.value)}
            placeholder="https://digishelves.com/gift-card?productId=18392"
            className="h-14 w-full rounded-2xl border border-[#eadfe7] bg-[#fbf8f4] px-4 font-black outline-none focus:border-[#551839]"
          />
          <input
            type="text"
            value={reasonInput}
            onChange={(e) => onChangeReason(e.target.value)}
            placeholder="Reason (optional)"
            className="h-14 w-full rounded-2xl border border-[#eadfe7] bg-[#fbf8f4] px-4 font-black outline-none focus:border-[#551839]"
          />
          <button
            type="button"
            onClick={onAdd}
            disabled={isBlocking || !urlInput.trim()}
            className="inline-flex h-14 items-center justify-center rounded-2xl bg-[#551839] px-6 text-sm font-black text-white disabled:opacity-60"
          >
            {isBlocking ? "Blocking..." : "Block URL"}
          </button>
        </div>
      </div>

      <div className="rounded-[2rem] border border-[#eadfe7] bg-white shadow-[0_20px_70px_rgba(33,23,34,0.08)]">
        <SectionHeader
          title="Blocklist"
          subtitle="Active entries return 404. Disabled entries are kept for reference."
        />
        {isLoading ? (
          <div className="p-5">
            <SkeletonPanel />
          </div>
        ) : entries.length ? (
          <div className="divide-y divide-[#eadfe7]">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p
                    className={`break-all text-sm font-black ${
                      entry.is_active ? "text-[#211722]" : "text-[#9a8b97] line-through"
                    }`}
                  >
                    {entry.url}
                  </p>
                  {entry.reason ? (
                    <p className="mt-1 text-xs font-bold text-[#665b67]">{entry.reason}</p>
                  ) : null}
                  <p className="mt-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#9a8b97]">
                    Added {formatDateTime(entry.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <StatusPill value={entry.is_active ? "blocking" : "disabled"} muted={!entry.is_active} />
                  <button
                    type="button"
                    onClick={() => onToggle(entry)}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-[#eadfe7] px-4 text-sm font-black text-[#551839]"
                  >
                    {entry.is_active ? "Disable" : "Enable"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(entry)}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 text-sm font-black text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-8 text-sm font-bold text-[#665b67]">
            No blocked URLs yet. Add one above.
          </div>
        )}
      </div>
    </section>
  );
}

function SummaryLine({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-[1.25rem] border border-[#eadfe7] bg-[#fbf8f4] px-4 py-4">
      <span className="text-sm font-black text-[#665b67]">{label}</span>
      <span className="text-lg font-black text-[#211722]">{value ?? 0}</span>
    </div>
  );
}

function SkeletonCard() {
  return <div className="h-32 animate-pulse rounded-[1.5rem] bg-white/70" />;
}

function SkeletonPanel() {
  return <div className="h-[22rem] animate-pulse rounded-[2rem] bg-white/70" />;
}
