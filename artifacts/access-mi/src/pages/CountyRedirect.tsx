import { Navigate, useParams } from "react-router-dom";
import NotFound from "./NotFound";
import { RESERVED_SLUGS } from "@/routes/manifest";

const CountyRedirect = () => {
  const { slug } = useParams<{ slug: string }>();

  // RESERVED_SLUGS is auto-derived from APP_ROUTES in routes.ts
  if (!slug || RESERVED_SLUGS.has(slug.toLowerCase())) {
    return <NotFound />;
  }

  return <Navigate to={`/county/${slug}`} replace />;
};

export default CountyRedirect;
