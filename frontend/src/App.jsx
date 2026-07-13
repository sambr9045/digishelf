import {
  Navigate,
  Outlet,
  createBrowserRouter,
  useParams,
  useSearchParams,
} from "react-router-dom";

import AnalyticsTracker from "./components/AnalyticsTracker";
import MyAccount from "./components/accounts/MyAccount";
import Checkout from "./components/payment/Checkout";
import CryptoTopUpPayment from "./components/payment/CryptoTopUpPayment";
import PaymentSuccess from "./components/payment/PaymentSuccess";
import TopUpSuccess from "./components/payment/TopUpSuccess";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Details from "./pages/Details";
import Giftcards from "./pages/Giftcards";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Search from "./pages/Search";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import TopUpCheckout from "./pages/TopUpCheckout";
import TermsOfUse from "./pages/TermsOfUse";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ProfileSettings from "./components/accounts/ProfileSettings";

function RootEntry() {
  if (window.location.hostname.startsWith("admin.")) {
    return <AdminDashboard />;
  }

  return <Home />;
}

function RootLayout() {
  return (
    <>
      <AnalyticsTracker />
      <Outlet />
    </>
  );
}

function GiftCardLegacyCategoryRedirect() {
  const { type } = useParams();
  const brand = encodeURIComponent(type || "");
  return <Navigate to={`/gift-card?brand=${brand}`} replace />;
}

function GiftCardLegacyProductRedirect() {
  const { productSlug, productId } = useParams();
  const slug = productSlug || "";
  return <Navigate to={`/gift-card/${slug}/${productId}`} replace />;
}

function GiftCardProductRoute() {
  const { productId } = useParams();

  if (!productId) {
    return <Navigate to="/gift-card" replace />;
  }

  return <Details />;
}

function GiftCardCatalogRoute() {
  const [searchParams] = useSearchParams();
  if (searchParams.has("productId")) {
    return <Navigate to="/gift-card" replace />;
  }
  return <Giftcards />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <RootEntry />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
      {
        path: "terms-of-use",
        element: <TermsOfUse />,
      },
      {
        path: "privacy-policy",
        element: <PrivacyPolicy />,
      },
      {
        path: "signin",
        element: <Signin />,
      },
      {
        path: "signup",
        element: <Signup />,
      },
      {
        path: "verify-email",
        element: <VerifyEmail />,
      },
      {
        path: "admin-login",
        element: <AdminLogin />,
      },
      {
        path: "admin",
        element: <AdminDashboard />,
      },
      {
        path: "gift-card",
        element: <GiftCardCatalogRoute />,
      },
      {
        path: "gift-cards",
        element: <Navigate to="/gift-card" replace />,
      },
      {
        path: "gift-card/payment-complete/:reference",
        element: <PaymentSuccess />,
      },
      {
        path: "gift-card/payment/:orderId",
        element: <CryptoTopUpPayment />,
      },
      {
        path: "gift-card/:brandSlug/:countrySlug/:productSlug/:productId",
        element: <GiftCardLegacyProductRedirect />,
      },
      {
        // SEO-friendly product path: /gift-card/:productSlug/:productId
        path: "gift-card/:productSlug/:productId",
        element: <GiftCardProductRoute />,
      },
      {
        path: "gift-card/:type",
        element: <GiftCardLegacyCategoryRedirect />,
      },
      {
        path: "checkout",
        element: <Checkout />,
      },
      {
        path: "giftcard/search",
        element: <Search />,
      },
      {
        path: "top-up/success/:reference",
        element: <TopUpSuccess />,
      },
      {
        path: "top-up/payment/:orderId",
        element: <CryptoTopUpPayment />,
      },
      {
        path: "top-up/checkout",
        element: <TopUpCheckout />,
      },
      {
        path: "top-up",
        element: <Home />,
      },
      {
        path: "account",
        element: <MyAccount />,
      },
      {
        path: "profile-settings",
        element: <ProfileSettings />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

export default router;
