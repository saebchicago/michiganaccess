# AccessMI.org - Detailed Technical Specifications for All Use Cases

**Comprehensive Specs for Every Dashboard and Capability**

**Version**: Detailed Technical Specs v1 (June 29, 2026)

This document expands every concept from the AccessMI comprehensive strategy into production-ready technical specifications. AccessMI remains an independent civic data platform; specifications describe capabilities and stakeholder *categories*, not named partners or customers.

---

## Use Case 1: Michigan Equity and Environmental Justice Deep Dive

**Overview**

Interactive story maps and causal pathway tools that reveal how environmental burdens intersect with SDOH and health access to drive disparities across Michigan, with special depth in legacy industrial metros and environmental justice communities.

**Data Sources and Integration**

- Environmental: MiEJScreen, EPA AQS (air quality), SDWIS (water), Superfund/NPL, energy burden (Census + HUD)
- SDOH: Census ACS (housing cost burden, poverty, race/ethnicity, food access proxies), HUD CHAS
- Health access and outcomes: CDC PLACES, BRFSS, CMS provider data, HRSA HPSA, maternal/infant health (MDHHS)
- Local: Detroit Open Data Portal, regional indicator projects where available

Integration via scheduled ETL with spatial joins at ZIP/census tract level.

**Modeling, Analytics and Projections**

- Composite Environmental Justice + Health Equity Index
- Pathway modeling (graph or weighted edge approach) linking exposures, intermediate SDOH, and health outcomes
- Simple trend projections with uncertainty bands

**UI/UX and Key Features**

- Layered maps with toggleable environmental, SDOH, and health access layers
- Expandable causal pathway cards with verified evidence chains
- Advanced cohort builder (e.g., ZIPs with high childhood asthma + poor air quality + high energy burden + low primary care)
- Exportable narrative story reports (PDF/Word) with embedded audit trails

**Verification and Trust Layer**

Every metric and pathway displays source, date, verified_status, and "View full methodology and sources." Multiple corroborating sources required for causal language. Confidence scoring shown.

**Analyst Empowerment Tools**

Cohort builder with save/share/version history, one-click export to Tableau/Power BI/Excel, API endpoint for custom queries, Jupyter notebook export option.

**Value by Stakeholder Category**

- **Regional health systems**: CHNA disparity sections, upstream intervention targeting, equity strategy support
- **Investigative journalism**: Ready data and visualizations for environmental racism and health disparity stories
- **Real estate and development**: Environmental risk overlays for site selection, gentrification early-warning indicators, opportunity mapping in transitioning neighborhoods
- **Other**: Environmental justice groups, local planning departments, United Way affiliates, CDFIs

**Phased Implementation**

- Phase 1: Core map + 3-4 key pathways (air quality to respiratory, energy burden to chronic disease)
- Phase 2: Full cohort builder + export tools + additional pathways (water, Superfund)

**Risks and Mitigations**

Over-claiming causality: strict language standards + confidence scoring. Data freshness: clear "last updated" indicators.

**Success Metrics**

Cohort usage, story exports, published journalism using the data, health system CHNA adoption.

---

## Use Case 2: Climate and Health Vulnerability Command Center (Michigan-Deep)

**Overview**

Interactive stress-test and scenario planning tool focused on Michigan-specific climate impacts (extreme heat, flooding, air quality events, Great Lakes effects) and their intersection with health access, SDOH, and health system assets.

**Data Sources and Integration**

NOAA downscaled climate projections, EPA, MiEJScreen, Census housing age/quality, CDC chronic disease and heat-sensitive conditions, health facility locations, workforce exposure data (BLS by industry), local flooding/heat island data.

**Modeling, Analytics and Projections**

Scenario-based impact functions (conservative, literature-backed). Project changes in ED visits, chronic disease exacerbations, and access barriers. Include health system asset vulnerability scoring.

**UI/UX and Key Features**

Scenario selector (heat wave, flooding, compound events), before/after maps, health system vulnerability scorecard, Resilience ROI calculator, exportable preparedness reports.

**Verification and Trust Layer**

All projections show wide confidence bands + clear methodology. Health system asset data clearly labeled as modeled where necessary.

**Analyst Empowerment Tools**

Custom scenario saving, cohort filtering by health system service area, API access for internal modeling, export to BI tools.

**Value by Stakeholder Category**

- **Regional health systems**: Emergency preparedness, facility planning, patient risk stratification, climate resilience grants
- **Investigative journalism**: Climate + equity stories for affected communities
- **Real estate and development**: Climate risk assessment, resilient development targeting, insurance implications
- **Other**: Local emergency management, infrastructure planners, philanthropy

**Phased Implementation**

- Phase 1: Heat + air quality scenarios + basic health system overlay
- Phase 2: Flooding + Great Lakes impacts + full ROI calculator

**Risks and Mitigations**

Model uncertainty: prominent ranges and methodology. Local data gaps: fallback to state/federal with clear labeling.

**Success Metrics**

Scenarios run, reports downloaded by health systems and local government, partnership inquiries.

---

## Use Case 3: SDOH + Health Access Risk Stratification and Opportunity Engine

**Overview**

Composite indices and interactive tools that quantify and map how SDOH and health access barriers drive risk and opportunity across Michigan communities.

**Data Sources and Integration**

Census ACS (housing, poverty, transportation, food access), HUD CHAS, BLS employment, NCES education, CDC PLACES, CMS/HRSA provider and insurance data, MDHHS health equity dashboards.

**Modeling, Analytics and Projections**

Weighted composite SDOH + Health Access Risk Index. Simple predictive models for utilization or outcome risk. User-adjustable weights.

**UI/UX and Key Features**

Interactive maps with risk/opportunity layers, weight sliders, cohort builder, predictive risk scoring, exportable risk reports.

**Verification and Trust Layer**

Every index component shows source and methodology. Uncertainty clearly communicated.

**Analyst Empowerment Tools**

Advanced filtering, custom risk model saving, BI-tool exports, API for population health teams.

**Value by Stakeholder Category**

- **Regional health systems**: Population health management, value-based care targeting, social needs contextualization
- **Investigative journalism**: Stories on how SDOH shape health and economic outcomes in specific neighborhoods
- **Real estate and development**: Affordability/stability mapping, investment targeting, gentrification analysis
- **Other**: Workforce boards, housing organizations, CDFIs, community action agencies

**Phased Implementation**

- Phase 1: Core index + basic maps + cohort tools
- Phase 2: Predictive scoring + custom weight saving + API

**Risks and Mitigations**

Weight subjectivity: transparent defaults + user control with methodology notes.

**Success Metrics**

Cohort usage, health system adoption for risk stratification, external analyst feedback.

---

## Use Case 4: Health System Service Area Intelligence Hub

**Overview**

Pre-built, ready-to-use intelligence modules for major health system service areas (starting with a southeast Michigan four-county template) with deep SDOH, environmental, health access, and equity overlays. Expandable to any defined service area.

**Data Sources and Integration**

All relevant federal + Michigan sources, focused on service area ZIPs/counties, with ability to expand to other regions.

**Modeling, Analytics and Projections**

CHNA-aligned summaries, disparity indices, trend analysis, simple utilization risk modeling.

**UI/UX and Key Features**

Dashboard tailored to service area, one-click CHNA data pack export, trend views, equity heatmaps, collaboration workspaces for internal teams.

**Verification and Trust Layer**

Full audit trails on every number - ideal for regulatory and board reporting.

**Analyst Empowerment Tools**

Versioned reports, API access for internal analytics, custom module building for other health systems.

**Value by Stakeholder Category**

- **Regional health systems**: CHNA time savings, implementation planning support, community benefit tracking
- **Investigative journalism**: Transparent data on health system community impact and accountability
- **Real estate and development**: Service area growth and opportunity mapping tied to health infrastructure
- **Other**: Public health departments, hospital systems

**Phased Implementation**

- Phase 1: Four-county southeast Michigan module with core data packs
- Phase 2: Expandable templates for other regions + API

**Risks and Mitigations**

Perception of favoritism: clear independence messaging + open templates for any health system or region.

**Success Metrics**

Health system usage for CHNA, time savings reported, expansion to additional regions.

---

## Use Case 5: Workforce Health, Talent and Economic Transition Dashboard

**Overview**

Tools linking labor market, environmental/occupational exposures, SDOH, health access, and health system workforce needs, with focus on Michigan's manufacturing/auto and healthcare sectors.

**Data Sources and Integration**

BLS labor data, environmental exposure data by industry, Census/ACS SDOH, health access metrics, health system workforce data where available.

**Modeling, Analytics and Projections**

Network graphs of interdependencies, forecasting of workforce shortages under different scenarios (climate, economic transition).

**UI/UX and Key Features**

Network visualizations, industry/geography cohort tools, talent retention risk scores, health system recruitment views.

**Verification and Trust Layer**

Clear labeling of modeled vs. verified workforce and exposure data.

**Analyst Empowerment Tools**

Custom industry cohort builder, forecasting scenario saving, BI exports.

**Value by Stakeholder Category**

- **Regional health systems**: Talent strategy and retention insights
- **Investigative journalism**: Stories on how economic and environmental transitions affect worker health
- **Real estate and development**: Workforce housing needs mapping for developers and planners
- **Other**: Economic development organizations, workforce boards, manufacturers

**Phased Implementation**

- Phase 1: Core network + basic forecasting
- Phase 2: Health system talent views + advanced scenario tools

**Risks and Mitigations**

Data gaps in local workforce health: supplement with modeled estimates + clear confidence levels.

**Success Metrics**

Usage by health systems and economic developers, published stories, partnership interest.

---

## Use Case 6: Maternal, Child, Behavioral Health and Family Equity Maps

**Overview**

Deep-dive focused dashboards on maternal/child health, behavioral health access, and family opportunity with environmental, SDOH, and access layers.

**Data Sources and Integration**

MDHHS maternal/child data, CDC PLACES, behavioral health access metrics, environmental and SDOH layers, school and early childhood data.

**Modeling, Analytics and Projections**

Disparity decomposition, trend analysis, simple predictive modeling for intervention impact.

**UI/UX and Key Features**

Focused maps and trend views, cohort tools for high-disparity areas, exportable equity reports.

**Verification and Trust Layer**

Strong emphasis on audit trails for sensitive outcome data.

**Analyst Empowerment Tools**

Trend comparison, custom cohort exports, collaboration features for coalitions.

**Value by Stakeholder Category**

- **Regional health systems**: Alignment with maternal/child initiatives, quality/equity metrics
- **Investigative journalism**: High-impact storytelling on family and child outcomes
- **Real estate and development**: Family-friendly neighborhood and school + health access opportunity mapping
- **Other**: Maternal/child health coalitions, early childhood organizations, philanthropy

**Phased Implementation**

- Phase 1: Core maternal/infant + behavioral health views
- Phase 2: Predictive impact modeling + coalition collaboration tools

**Risks and Mitigations**

Sensitivity of outcome data: strict verification and privacy-respecting aggregation.

**Success Metrics**

Coalition and health system usage, published stories, partnership development.

---

## Use Case 7: Multi-Sector Resource Gap and Investment Opportunity Intelligence

**Overview**

Tools to identify gaps between need and investment across sectors (health, housing, environment, SDOH) and highlight high-ROI opportunities.

**Data Sources and Integration**

USAspending + state spending data, philanthropic flows (where available), health system community benefit data, SDOH and outcome gaps.

**Modeling, Analytics and Projections**

Gap scoring, estimated multipliers/ROI based on historical linkages, flow visualizations.

**UI/UX and Key Features**

Dual need vs. investment maps, Sankey/flow diagrams, high-ROI opportunity flags, custom funder views.

**Verification and Trust Layer**

Clear sourcing of spending data and outcome linkages.

**Analyst Empowerment Tools**

Custom gap analysis saving, BI exports, API for funders.

**Value by Stakeholder Category**

- **Regional health systems**: Optimize community benefit portfolios and identify partnerships
- **Investigative journalism**: Data for stories on resource flows (or lack thereof)
- **Real estate and development**: Development opportunity mapping aligned with public and philanthropic investment
- **Other**: Philanthropy, local government, CDFIs, community development organizations

**Phased Implementation**

- Phase 1: Core gap mapping + basic flow views
- Phase 2: ROI estimation + funder-specific workspaces

**Risks and Mitigations**

Incomplete philanthropic/spending data: clear labeling of coverage and use of available data only.

**Success Metrics**

Funder and health system usage, identified partnerships, external feedback on ROI utility.

---

## Use Case 8: Advanced Analyst Self-Service and Collaboration Platform

**Overview**

The core power layer that turns AccessMI into a true workspace for analysts across sectors.

**Data Sources and Integration**

Unified access to all verified data with natural language query capability (RAG strictly over verified claims).

**Modeling, Analytics and Projections**

On-demand cohort analysis, custom calculations with provenance, simple forecasting.

**UI/UX and Key Features**

Natural language query ("Show ZIPs with high asthma + poor air quality + low primary care"), advanced cohort builder, save/share/version history, one-click exports to multiple formats and BI tools, collaboration workspaces with commenting and audit logs.

**Verification and Trust Layer**

Every output carries full source and methodology links. "Ask AccessMI" always cites sources and confidence.

**Analyst Empowerment Tools**

Jupyter/Python export options, API access, team workspaces, version control.

**Value by Stakeholder Category**

Universal value - dramatically increases speed and credibility for analysts at health systems, journalism outlets, real estate firms, local government, researchers, and community organizations.

**Phased Implementation**

- Phase 1: Query builder + cohort tools + basic exports
- Phase 2: Collaboration workspaces + advanced API + Jupyter integration

**Risks and Mitigations**

Query complexity: clear guidance and example queries. Over-reliance on AI: strict grounding in verified data only.

**Success Metrics**

Query volume, export volume, user retention, time savings reported by analysts.

---

## Use Case 9: Predictive and Scenario Planning Studio

**Overview**

What-if modeling and forecasting environment using Michigan-specific data for policy, climate, housing, and investment scenarios.

**Data Sources and Integration**

All relevant layers with transparent modeling assumptions.

**Modeling, Analytics and Projections**

Transparent statistical and simple ML models with confidence intervals. User-adjustable parameters.

**UI/UX and Key Features**

Scenario builder interface, side-by-side comparisons, impact projections on health, equity, and economic outcomes, exportable scenario reports.

**Verification and Trust Layer**

All assumptions and data sources clearly documented for every scenario.

**Analyst Empowerment Tools**

Save/share scenarios, parameter sensitivity analysis, BI exports.

**Value by Stakeholder Category**

- **Regional health systems**: Strategic planning and board-level scenario presentations
- **Investigative journalism**: Data-backed what-if policy and climate stories
- **Real estate and development**: Scenario planning for development under different economic or climate futures
- **Other**: Local government policy teams, philanthropy for investment strategy

**Phased Implementation**

- Phase 1: Core scenario builder for 2-3 high-priority domains (climate, housing, SDOH)
- Phase 2: Advanced sensitivity analysis and multi-stakeholder scenario comparison

**Risks and Mitigations**

Model assumptions: full transparency and user control over parameters.

**Success Metrics**

Scenarios created and shared, usage by strategic planning teams, external citations.

---

## Use Case 10: Community Benefit, Equity and Impact Tracking Dashboard

**Overview**

Tools to track and attribute health system and multi-sector investments against improvements in SDOH, environmental, and health access outcomes over time.

**Data Sources and Integration**

Health system community benefit data, public spending, outcome trends from verified sources.

**Modeling, Analytics and Projections**

Trend analysis with attribution where possible, simple impact modeling.

**UI/UX and Key Features**

Timeline views linking investments to outcomes, attribution dashboards, exportable impact reports for regulatory and stakeholder use.

**Verification and Trust Layer**

Strong emphasis on traceable attribution and clear methodology for any modeled impact.

**Analyst Empowerment Tools**

Custom tracking dashboards, versioned reports, collaboration for multi-stakeholder reporting.

**Value by Stakeholder Category**

- **Regional health systems**: Demonstrable ROI for CHNA implementation plans and IRS reporting
- **Investigative journalism**: Accountability and impact journalism on community benefit effectiveness
- **Real estate and development**: Insights into how public/philanthropic investment affects neighborhood trajectories
- **Other**: Philanthropy, local government, community organizations

**Phased Implementation**

- Phase 1: Core tracking for health system community benefit
- Phase 2: Multi-sector attribution and advanced impact modeling

**Risks and Mitigations**

Attribution challenges: clear distinction between correlation and modeled attribution.

**Success Metrics**

Health system usage for reporting, published impact stories, external validation of methodology.

---

**End of Detailed Technical Specifications**

This document provides the complete technical foundation needed to build every use case with depth, trust, and broad stakeholder-category value while preserving platform independence.