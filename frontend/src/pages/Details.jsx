import { Navigate, useParams } from "react-router-dom";
import GiftCardProductDetail from "../components/giftcards/GiftCardProductDetail";
import GiftCardBanner from "../components/GiftCardBanner";
import Footer from "../components/Footer/Footer";
import { brandAllowsDeepLink } from "../config/giftCardProviderPolicy";

export default function Details() {
  const { name, productId, brandSlug } = useParams();
  const brandName = brandSlug || name || "";

  if (!productId) {
    return <Navigate to="/gift-card" replace />;
  }

  if (!brandAllowsDeepLink(brandName)) {
    return <Navigate to={`/gift-card?productId=${productId}`} replace />;
  }

  return (
    <div>
      <GiftCardBanner type={name} details={false} />
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <GiftCardProductDetail productId={productId} />
        </div>
      </section>
      <Footer />
    </div>
  );
}
