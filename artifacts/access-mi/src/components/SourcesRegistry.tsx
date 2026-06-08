// src/components/SourcesRegistry.tsx
//
// Registry-driven sources section. Presentational only: no page chrome, no
// Layout, no h1. Drop this inside the existing MethodologyPage so it inherits
// that page's Layout, breadcrumbs, and i18n. Renders entirely from
// src/data/sources.ts so it can never drift from the registry.

import {
  DATA_SOURCES,
  EMBED_SOURCES,
  formatCitation,
  formatEmbedCredit,
  type ClaimLabel,
  type DataSource,
  type EmbedSource,
} from "../data/sources";

const LABEL_DEFINITIONS: Record<ClaimLabel, string> = {
  VERIFIED:
    "Taken directly from a primary federal source. Dataset and table or series ID provided.",
  MODELED:
    "Derived by combining or transforming primary sources. Method documented.",
  PROJECTED: "Estimated forward from a base period using stated assumptions.",
};

function labelBadgeClasses(label: ClaimLabel): string {
  const base =
    "inline-block rounded px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide";
  switch (label) {
    case "VERIFIED":
      return `${base} bg-emerald-100 text-emerald-800`;
    case "MODELED":
      return `${base} bg-amber-100 text-amber-800`;
    case "PROJECTED":
      return `${base} bg-sky-100 text-sky-800`;
  }
}

function byProvider(a: DataSource, b: DataSource): number {
  return a.provider.localeCompare(b.provider) || a.id.localeCompare(b.id);
}

function latestVerifiedDate(
  sources: DataSource[],
  embeds: EmbedSource[],
): string | null {
  const dates = [
    ...sources.map((s) => s.lastVerifiedAt),
    ...embeds.map((e) => e.lastVerifiedAt),
  ]
    .filter(Boolean)
    .sort();
  return dates.length ? dates[dates.length - 1] : null;
}

export function SourcesRegistry() {
  const dataSources = Object.values(DATA_SOURCES).sort(byProvider);
  const embeds = Object.values(EMBED_SOURCES);
  const lastVerified = latestVerifiedDate(dataSources, embeds);

  return (
    <section aria-labelledby="sources-heading" className="space-y-8">
      <div>
        <h2
          id="sources-heading"
          className="text-xl font-semibold text-slate-900"
        >
          Sources and labels
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Every figure carries a label and a primary source. We do not blend
          labels or substitute estimates for measured values. Sources are listed
          once here and referenced by every tool.
        </p>
        {lastVerified && (
          <p className="mt-2 text-xs text-slate-500">
            Sources last verified: {lastVerified}
          </p>
        )}
      </div>

      <div>
        <h3 className="text-base font-semibold text-slate-900">
          How to read the labels
        </h3>
        <dl className="mt-3 space-y-3">
          {(Object.keys(LABEL_DEFINITIONS) as ClaimLabel[]).map((label) => (
            <div key={label} className="flex gap-3">
              <dt className="shrink-0">
                <span className={labelBadgeClasses(label)}>{label}</span>
              </dt>
              <dd className="text-sm leading-relaxed text-slate-600">
                {LABEL_DEFINITIONS[label]}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div>
        <h3 className="text-base font-semibold text-slate-900">Data sources</h3>
        {dataSources.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            No data sources registered.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">
                Registered data sources with citation, license, and verification
                date
              </caption>
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th scope="col" className="py-2 pr-4 font-medium">
                    Citation
                  </th>
                  <th scope="col" className="py-2 pr-4 font-medium">
                    License
                  </th>
                  <th scope="col" className="py-2 pr-4 font-medium">
                    Verified
                  </th>
                  <th scope="col" className="py-2 font-medium">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dataSources.map((source) => (
                  <tr key={source.id} className="align-top">
                    <td className="py-3 pr-4">
                      <code className="block whitespace-normal font-mono text-xs leading-relaxed text-slate-800">
                        {formatCitation(source)}
                      </code>
                      {source.methodologyUrl && (
                        <a
                          href={source.methodologyUrl}
                          className="mt-1 inline-block text-xs text-sky-700 underline"
                        >
                          Method
                        </a>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {source.license.url ? (
                        <a
                          href={source.license.url}
                          className="text-sky-700 underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {source.license.name}
                        </a>
                      ) : (
                        source.license.name
                      )}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {source.lastVerifiedAt}
                    </td>
                    <td className="py-3">
                      <a
                        href={source.url}
                        className="text-sky-700 underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-base font-semibold text-slate-900">
          Embedded content
        </h3>
        {embeds.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            No embedded content registered.
          </p>
        ) : (
          <ul className="mt-3 space-y-4">
            {embeds.map((embed) => {
              const backing = embed.dataSourceIds
                .map((id) => DATA_SOURCES[id]?.provider)
                .filter(Boolean);
              return (
                <li
                  key={embed.id}
                  className="rounded border border-slate-200 p-4"
                >
                  <p className="text-sm font-medium text-slate-800">
                    {formatEmbedCredit(embed)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {embed.kind}
                    {backing.length > 0 && ` . Backed by ${backing.join(", ")}`}
                  </p>
                  <div className="mt-2 flex gap-4 text-xs">
                    <a
                      href={embed.originalUrl}
                      className="text-sky-700 underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Original
                    </a>
                    <span className="text-slate-500">{embed.license.name}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
