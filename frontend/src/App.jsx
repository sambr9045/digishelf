import {
  createBrowserRouter
} from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Giftcards from "./pages/Giftcards";
import GiftcardType from "./pages/GiftcardType";
import Details from "./pages/Details";
import PaymentSuccess from "./components/payment/PaymentSuccess";
import Checkout from "./components/payment/Checkout";
import Search from "./pages/Search";
import TopUpSuccess from "./components/payment/TopUpSuccess";
import MyAccount from "./components/accounts/MyAccount";


import "./assets/css/index.css";

const router = createBrowserRouter([{
    path: "/",
    element: < Home / > ,
  },
  {
    path: "/about",
    element: < About / > ,
  },
  {
    path: "/contact",
    element: < Contact / > ,
  },
  {
    path: "/signin",
    element: < Signin / > ,
  },
  {
    path: "/signup",
    element: < Signup / > ,
  },
  {
    path: "/gift-cards",
    element: < Giftcards / > ,
  },
  {
    path: "/gift-card/:type",
    element: < GiftcardType / > ,
  },
  {
    path: "/gift-card/:name/:productId",
    element: < Details / > ,
  },
  {
    path: "/gift-card/payment-complete/:reference",
    element: < PaymentSuccess / > ,
  },
  {
    path: "/checkout",
    element: < Checkout / >
  },
  {
    path: "/giftcard/search",
    element: < Search / >
  },
  {
    path: "/top-up/success/:reference",
    element: < TopUpSuccess / >
  },
  {
    path: "/top-up",
    element: < Home / >
  },
  {
    path: "/account",
    element: < MyAccount / >
  },
]);

export default router;