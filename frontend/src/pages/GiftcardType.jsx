import { Navigate, useParams } from "react-router-dom";

export default function GiftcardType() {
  const { type } = useParams();
  const brand = encodeURIComponent(type || "");
  return <Navigate to={`/gift-card?brand=${brand}`} replace />;
}
