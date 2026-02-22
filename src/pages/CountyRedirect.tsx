import { Navigate, useParams } from "react-router-dom";
import NotFound from "./NotFound";
import { RESERVED_SLUGS } from "@/config/routes";

const CountyRedirect = () => {
  const { slug } = useParams<{ slug: string }>();

  if (!slug || RESERVED_SLUGS.has(slug.toLowerCase())) {
    return <NotFound />;
  }

  return <Navigate to={`/county/${slug}`} replace />;
};

export default CountyRedirect;
