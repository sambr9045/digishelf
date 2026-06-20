import { Navigate, useParams } from "react-router-dom";
import GiftCardProductDetail from "../components/giftcards/GiftCardProductDetail";
import GiftCardBanner from "../components/GiftCardBanner";
import Footer from "../components/Footer/Footer";

function titleizeSlug(value = "") {
  return String(value)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function Details() {
  const { productSlug, productId } = useParams();

  if (!productId) {
    return <Navigate to="/gift-card" replace />;
  }

  const bannerType = titleizeSlug(productSlug);

  return (
    <div>
      <GiftCardBanner type={bannerType} details={false} />
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <GiftCardProductDetail productId={productId} />
        </div>
      </section>
      <Footer />
    </div>
  );
}
