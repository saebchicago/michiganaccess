import { Link } from "react-router-dom";

/**
 * Shown in place of a working submit when this build has no Supabase
 * configuration, so a resident does not fill in a form that cannot be saved.
 */
export default function BackendUnavailableNotice({ what }: { what: string }) {
  return (
    <p role="status" className="rounded-md border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
      {what} cannot be saved on this copy of the site right now. Use the{" "}
      <Link to="/contact" className="underline">
        contact page
      </Link>{" "}
      instead.
    </p>
  );
}
