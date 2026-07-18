import { Navigate, useParams } from "react-router-dom";
import NotFound from "./NotFound";
import { slugToCounty } from "@/utils/countyUtils";

const CountyRedirect = () => {
  const { slug } = useParams<{ slug: string }>();

  // Only a real Michigan county slug (one of the 83 in MICHIGAN_COUNTIES)
  // forwards to the county view. Anything else is a genuine 404: render
  // NotFound instead of redirecting to /county/<slug>, which would show an
  // in-shell "County Not Found" page buried below the full chrome stack.
  if (!slug || !slugToCounty(slug)) {
    return <NotFound />;
  }

  return <Navigate to={`/county/${slug}`} replace />;
};

export default CountyRedirect;
