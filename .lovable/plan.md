

# Michigan Health Access Platform — Implementation Plan

## Overview
A comprehensive, public-facing health navigation platform helping Michigan residents find care, understand conditions, access financial assistance, and connect with community resources. Built as genuine civic infrastructure with Michigan-themed design, interactive maps, and data-driven quality rankings.

---

## Phase 1: Foundation & Core Pages (Initial Build)

### 1. Design System & Layout Shell
- Custom Michigan color palette (Michigan Blue #0A4C95, Forest Green #2D5F3F, Teal #00A3A1, Sky Blue #4A90E2, Warm Gold #F4A460, Coral #FF6B6B, Navy #003B5C)
- Responsive navigation header with logo, main menu links, and mobile hamburger menu
- Footer with trust indicators, data source citations, and "Independent, Non-Commercial Initiative" badge
- Framer Motion page transitions, scroll-reveal animations, and hover effects throughout
- WCAG 2.1 AA accessibility compliance (contrast, keyboard nav, screen reader support)

### 2. Homepage (/)
- Hero section with Michigan landscape imagery, headline "Your Guide to Healthcare in Michigan," and multi-function search bar (search by location, condition, service, provider)
- 4 Quick Action cards: Find Care, Financial Help, Health Conditions, Community Resources — animated on scroll
- Platform statistics banner (provider counts, facilities, counties covered)
- Featured Health Topics carousel (seasonal health, major conditions, community wins)
- Michigan Health at a Glance preview widgets with mini-charts
- "How This Platform Helps You" 3-column section
- Trust indicators footer section

### 3. Find Care Near You (/find-care)
- Left sidebar (30%) with comprehensive filters: location/radius, care type (30+ specialties), quality filters (Magnet, Blue Distinction, Leapfrog), digital access filters, insurance accepted, special services
- Right results panel (70%) with facility cards showing quality badges, distance, services, digital access indicators
- Composite quality scoring algorithm (Safety 30pts, Clinical 30pts, Experience 20pts, Digital 10pts, Breadth 10pts) — sorted by distance first, then quality for nearby facilities
- Facility detail pages with expanded quality metrics, provider lists, insurance info, and comparison to state/national averages
- Compare up to 3 facilities side-by-side tool

### 4. Interactive Health Map (/health-map)
- Full-screen Leaflet.js map with OpenStreetMap tiles
- Toggleable facility layers: Healthcare Facilities, FQHCs, Behavioral Health, Specialty Care, Urgent/Emergency, Pharmacies
- Marker colors by quality score (Gold/Teal/Blue/Gray)
- Clickable markers with popup details, quality badges, and scheduling links
- Data overlay layers: Health Professional Shortage Areas, Social Vulnerability Index, Chronic Disease Burden choropleth, Health Equity Indicators
- Search, filter panel, distance measurement, and share/print features

### 5. Financial Assistance Hub (/financial-help)
- Interactive eligibility screener (household size, income, insurance status → personalized program recommendations)
- 7 organized sections: Insurance Coverage (Medicaid, Marketplace, Medicare, Children's), Hospital Charity Care directory, Prescription Assistance, Dental & Vision, Social Services (food, housing, transportation, utilities), Condition-Specific Help, Understanding Medical Bills
- Searchable charity care database with all Michigan health systems listed alphabetically
- Michigan 211 integration prominently featured
- Maps for each resource category showing nearby assistance locations

### 6. Quality & Safety Ratings (/quality)
- Hospital quality comparison tool (compare up to 3 hospitals)
- Quality metrics: Leapfrog Safety Grades, infection rates, readmission rates, mortality, HCAHPS patient experience scores, Magnet recognition, Blue Distinction Centers, Joint Commission accreditation
- Physician quality search (board certification, affiliations, satisfaction ratings)
- Transparent methodology explanation with data source citations
- Animated Recharts visualizations for metrics comparison

---

## Phase 2: Supabase Backend Setup

### Database Tables
- **facilities** — hospitals, clinics, urgent care (name, system affiliation, location/coordinates, address, phone, hours, services, quality scores, digital capabilities, insurance accepted)
- **providers** — individual doctors/practitioners linked to facilities
- **quality_metrics** — Leapfrog grades, HCAHPS scores, infection rates, accreditations per facility
- **financial_programs** — charity care, insurance programs, prescription assistance with eligibility criteria
- **community_resources** — food banks, housing, transportation, social services with categories and locations
- **conditions** — health condition entries with descriptions, symptoms, treatments, prevention info
- **support_groups** — groups with condition focus, format, schedule, location
- **news_articles** — health news and updates
- **clinical_trials** — trial listings (condition, phase, location, eligibility)

### Data Seeding
- Populate with realistic Michigan facility data across all 83 counties
- Sample quality scores, financial program details, and community resources
- Mock but realistic provider listings across major health systems

---

## Phase 3: Remaining Sections (Expand After Core)

### 7. Condition-Specific Pathways (/conditions)
- 8 major condition categories with individual condition pages
- Each page: overview, diagnosis info, treatment options, "Find Care" filtered map, living with condition tips, clinical trials, support groups, prevention
- Interactive "What's Right for Me?" decision aid tools
- Printable checklists and symptom trackers

### 8. Community Resources (/resources)
- 12 resource categories (food, housing, transportation, mental health, substance use, domestic violence, senior/disability/veteran services, etc.)
- Searchable map per category with filters (language, hours, eligibility, accessibility)
- Step-by-step "How to Get Help" guides
- Downloadable/printable county resource guides

### 9. Health News & Insights (/news)
- 5 news categories: Michigan Updates, Outbreaks & Prevention, Research Advances, Policy, Community Spotlights
- Article pages with citations, related resources, share functionality
- Content pulled from Supabase news_articles table

### 10. Cost Transparency Tool (/costs)
- Procedure cost estimator (select procedure, insurance type, location)
- Facility price comparison table and map view
- Prescription drug price lookup
- Financial assistance cross-links

### 11. Prevention & Wellness (/wellness)
- Age-specific preventive care recommendations
- Personalized screening calendar tool
- Healthy living resources (nutrition, activity, mental wellness, substance prevention)
- Vaccine finder with map and booking links

### 12. Clinical Trials Finder (/clinical-trials)
- Searchable trial database by condition, location, phase, status
- Michigan research institution profiles
- Patient advocacy organization links

### 13. Support Groups & Community (/support)
- Searchable support group directory with filters (condition, format, location, language, cost)
- Caregiver resources section
- Crisis resources banner (988, Crisis Text Line, SAMHSA) on every page

### 14. Health Education Library (/learn)
- Health topics A-Z searchable encyclopedia
- Interactive body map symptom checker
- Health calculators (BMI, blood pressure tracker, risk assessments)
- Educational video library

### 15. Michigan Health Data Dashboard (/data)
- Recharts/Chart.js interactive dashboards: COVID/infectious disease, chronic disease prevalence, healthcare access indicators, social determinants, health equity metrics, quality of care
- County comparison tool (compare up to 3 counties)
- Trend analysis (5-year, 10-year)
- Downloadable CSV data exports

### 16. About & How to Use (/about)
- Mission statement, methodology transparency
- Ranking algorithm explanation (Distance 40%, Quality 30%, Digital Access 15%, Comprehensiveness 15%)
- Complete data sources list with links
- Limitations & disclaimers
- Feedback form

---

## Key Technical Decisions
- **Leaflet.js** for all mapping (free, no API key)
- **Recharts + Chart.js** for data visualizations and dashboards
- **Framer Motion** for page transitions, scroll reveals, and micro-interactions
- **Supabase** for database, search/filtering, and data management
- **React Query** for data fetching with caching
- **Mobile-first responsive** design throughout
- All data is mock but realistic — structured for easy replacement with real API data later

