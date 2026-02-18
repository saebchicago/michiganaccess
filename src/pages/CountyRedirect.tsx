import { Navigate, useParams } from "react-router-dom";

/**
 * Redirects /:slug (e.g. /wayne) to /county/:slug for all 83 Michigan counties.
 * Falls through to NotFound for unrecognized slugs.
 */
const CountyRedirect = () => {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/county/${slug}`} replace />;
};

export default CountyRedirect;
