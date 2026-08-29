# ParkServe source decision

- **Status:** Link-out only
- **Reviewed:** 2026-08-29
- **Applies to:** AccessMI Community Opportunity Atlas
- **Publisher:** Trust for Public Land (TPL)

## Primary evidence

- [Park data downloads](https://www.tpl.org/park-data-downloads)
- [ParkServe Legal Disclosure and Terms of Use — May 2024](https://parkserve.tpl.org/downloads/ParkServe_Terms_of_Use_May_2024.pdf)

The official downloads page describes ParkServe materials such as park polygons,
10-minute walk service areas, and priority areas, and directs users to the legal
terms. The linked terms permit a personal, non-commercial copy while restricting
public display, modification, transfer, and redistribution without prior written
consent. They also identify OpenStreetMap content under the ODbL and Esri or
other licensor content; that notice does not, by itself, grant reuse rights for
the combined ParkServe materials.

This is a conservative product and source-governance decision, not legal advice.

## Decision

AccessMI will not download, commit, store, transform, publicly display, or
redistribute ParkServe files, park geometry, walksheds, priority areas, or
ParkServe-derived metrics under the currently published terms.

The Atlas may:

- link to TPL's official ParkServe downloads page;
- link to the current terms;
- describe ParkServe's published network-walkshed method at a high level; and
- label the lens **link-out only** with provenance **PENDING**.

AccessMI will not present a straight-line radius or an independently produced
network analysis as ParkServe or as equivalent to ParkServe.

## Revisit gate

ParkServe ingestion remains blocked unless AccessMI receives written permission
that clearly covers the intended public display, redistribution, transformations,
derivatives, required attribution, geographic scope, release version, and update
cadence. Any later implementation must pin the authorized release and add schema,
geography, plausibility, attribution, and freshness checks before publication.

A future analysis built entirely from separately licensed OpenStreetMap and public
agency sources may be considered as a distinct AccessMI method. It must carry its
own methodology, validation, provenance, and name.
