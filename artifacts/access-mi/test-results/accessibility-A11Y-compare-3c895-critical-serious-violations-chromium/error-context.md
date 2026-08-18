# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.ts >> A11Y: /compare has zero critical/serious violations
- Location: src/test/e2e/accessibility.spec.ts:7:3

# Error details

```
Error: critical/serious a11y violations on /compare

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 3

- Array []
+ Array [
+   "moderate:region",
+ ]
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list
  - region "Notifications alt+T"
  - generic [ref=e3]:
    - link "Skip to main content" [ref=e4] [cursor=pointer]:
      - /url: "#main-content"
    - link "Skip to crisis resources" [ref=e5] [cursor=pointer]:
      - /url: "#crisis-bar"
    - generic [ref=e6]:
      - region "Crisis resources and safety options" [ref=e7]:
        - generic [ref=e8]:
          - generic [ref=e9]:
            - img [ref=e10]
            - link "988" [ref=e12] [cursor=pointer]:
              - /url: tel:988
            - generic [ref=e13]: ·
            - generic [ref=e14]:
              - text: Text
              - strong [ref=e15]: HOME
              - text: to
              - link "741741" [ref=e16] [cursor=pointer]:
                - /url: sms:741741?body=HOME
            - generic [ref=e17]:
              - text: ·
              - link "211" [ref=e18] [cursor=pointer]:
                - /url: tel:211
          - button "Quick exit - close this page" [ref=e19] [cursor=pointer]:
            - img [ref=e20]
            - generic [ref=e23]: Quick Exit
      - banner [ref=e24]:
        - generic [ref=e25]:
          - link "Access Michigan Home" [ref=e26] [cursor=pointer]:
            - /url: /
            - img [ref=e27]
            - generic [ref=e32]:
              - generic [ref=e33]: Access Michigan
              - generic [ref=e34]: Independent Michigan civic intelligence platform.
          - navigation "Main navigation" [ref=e35]:
            - button "Understand" [ref=e37] [cursor=pointer]:
              - text: Understand
              - img [ref=e38]
            - button "Visualize" [ref=e41] [cursor=pointer]:
              - text: Visualize
              - img [ref=e42]
            - button "Belong" [ref=e45] [cursor=pointer]:
              - text: Belong
              - img [ref=e46]
            - button "About Us" [ref=e49] [cursor=pointer]:
              - text: About Us
              - img [ref=e50]
          - generic [ref=e52]:
            - button "Search site (⌘K). Search services, care, benefits…" [ref=e54] [cursor=pointer]:
              - img [ref=e55]
              - generic [ref=e58]: Search services, care, benefits…
              - generic [ref=e59]: ⌘K
            - link "Compare" [ref=e60] [cursor=pointer]:
              - /url: /compare
              - img [ref=e61]
              - text: Compare
            - button "All Michigan - Select your county" [ref=e62] [cursor=pointer]:
              - img
              - generic [ref=e63]: All Michigan
              - img
            - button "Open My Settings" [ref=e64] [cursor=pointer]:
              - img
              - generic [ref=e65]: My Settings
            - button "Change theme" [ref=e66] [cursor=pointer]:
              - img
            - link "Get Help Now" [ref=e67] [cursor=pointer]:
              - /url: tel:988
    - generic [ref=e69]:
      - generic [ref=e70]: Now showing data and services for all of Michigan.
      - generic [ref=e72]:
        - generic [ref=e73]:
          - img [ref=e74]
          - generic [ref=e77]: All Michigan
        - link "Set location" [ref=e78] [cursor=pointer]:
          - /url: /
          - text: Set location
          - img [ref=e79]
    - generic [ref=e81]: Compare Places - Side-by-Side Census Data | Access Michigan
    - main [ref=e82]:
      - navigation "Breadcrumb" [ref=e83]:
        - link "Home" [ref=e84] [cursor=pointer]:
          - /url: /
          - img [ref=e85]
          - generic [ref=e88]: Home
        - generic [ref=e89]:
          - img [ref=e90]
          - link "Data & Insights" [ref=e92] [cursor=pointer]:
            - /url: /data-and-insights
        - generic [ref=e93]:
          - img [ref=e94]
          - generic [ref=e96]: Compare Places
      - generic [ref=e99]:
        - generic [ref=e100]:
          - img [ref=e101]
          - generic [ref=e103]: Census ACS · Mixed Granularity
        - heading "Compare places, side by side." [level=1] [ref=e104]
        - paragraph [ref=e105]:
          - text: Up to 4 counties
          - emphasis [ref=e106]: or
          - text: ZIPs. Live Census ACS. Equity lens. PDF export.
      - generic [ref=e107]:
        - generic [ref=e108]:
          - strong [ref=e109]: "Note:"
          - text: Community voice and insurance breakdown figures are modeled pending live integration. Census ACS economic metrics are sourced directly from the US Census Bureau API. Source datasets are listed at
          - link "/data-sources" [ref=e110] [cursor=pointer]:
            - /url: /data-sources
          - text: .
        - generic [ref=e111]:
          - generic [ref=e112]:
            - generic [ref=e113]:
              - text: Wayne County
              - button "Remove Wayne County" [ref=e115] [cursor=pointer]:
                - img [ref=e116]
            - generic [ref=e119]:
              - text: Oakland County
              - button "Remove Oakland County" [ref=e121] [cursor=pointer]:
                - img [ref=e122]
            - generic [ref=e125]:
              - combobox "Select an option" [ref=e126] [cursor=pointer]:
                - img [ref=e127]
                - generic: Add county…
                - img [ref=e128]
              - generic [ref=e130]: or
              - generic [ref=e131]:
                - textbox "Add a ZIP code to compare" [ref=e132]:
                  - /placeholder: ZIP code
                - button "Add" [ref=e133] [cursor=pointer]:
                  - img
                  - text: Add
          - generic [ref=e134]:
            - generic [ref=e135]:
              - switch "Equity Lens" [ref=e136] [cursor=pointer]
              - generic [ref=e137] [cursor=pointer]:
                - img [ref=e138]
                - text: Equity Lens
            - button "Community Voice" [pressed] [ref=e140] [cursor=pointer]:
              - img [ref=e141]
              - text: Community Voice
            - button "Export PDF" [ref=e144] [cursor=pointer]:
              - img
              - text: Export PDF
            - generic [ref=e145]:
              - radiogroup "View mode" [ref=e146]:
                - radio "Standard View" [checked] [ref=e147] [cursor=pointer]
                - radio "CHNA / VBC View" [ref=e148] [cursor=pointer]
              - button "What is CHNA / VBC view?" [ref=e149] [cursor=pointer]:
                - img [ref=e150]
        - heading "Comparison results" [level=2] [ref=e152]
        - paragraph [ref=e153]: Comparing Wayne County, Oakland County. Mix counties and ZIP codes freely.MI Avg column shows the Michigan state benchmark.
        - generic [ref=e155]:
          - generic [ref=e156]:
            - heading "Civic Insight Score" [level=3] [ref=e157]:
              - img [ref=e158]
              - text: Civic Insight Score
            - paragraph [ref=e161]: Composite 0–100 score based on income, poverty, education, and employment.
          - generic [ref=e162]:
            - generic [ref=e163]:
              - generic [ref=e164]:
                - generic [ref=e165]:
                  - generic [ref=e166]: Census ACS
                  - generic [ref=e167]: unavailable
                - generic [ref=e168]: Wayne County
              - generic [ref=e169]:
                - generic [ref=e170]:
                  - generic [ref=e171]: Census ACS
                  - generic [ref=e172]: unavailable
                - generic [ref=e173]: Oakland County
            - generic [ref=e175]:
              - img [ref=e176]: ⚠️
              - heading "Economic data temporarily unavailable" [level=3] [ref=e177]
              - paragraph [ref=e178]: We show data only when we can verify it.
        - generic [ref=e180]:
          - generic [ref=e181]:
            - heading "Performance Radar" [level=3] [ref=e182]
            - paragraph [ref=e183]: Higher = better for all axes. Dashed line = Michigan state average. Scores normalized 0–100.
          - generic [ref=e186]:
            - img [ref=e187]:
              - generic [ref=e201]:
                - generic [ref=e203]: Median Household Income
                - generic [ref=e206]: Poverty Rate
                - generic [ref=e209]: Unemployment Rate
                - generic [ref=e211]: Median Gross Rent
                - generic [ref=e214]: Homeownership Rate
                - generic [ref=e217]: Bachelor's Degree or Higher
            - list [ref=e222]:
              - listitem [ref=e223]:
                - img [ref=e224]
                - text: MI Average
              - listitem [ref=e226]:
                - img [ref=e227]
                - text: Wayne County
              - listitem [ref=e229]:
                - img [ref=e230]
                - text: Oakland County
        - generic [ref=e233]:
          - heading "Detailed Comparison" [level=3] [ref=e236]
          - table "Detailed comparison across selected places" [ref=e239]:
            - caption [ref=e240]: Detailed comparison across selected places
            - rowgroup [ref=e241]:
              - row "Metric Wayne County Oakland County MI Avg" [ref=e242]:
                - columnheader "Metric" [ref=e243]
                - columnheader "Wayne County" [ref=e244]:
                  - generic [ref=e245]: Wayne County
                - columnheader "Oakland County" [ref=e247]:
                  - generic [ref=e248]: Oakland County
                - columnheader "MI Avg" [ref=e250]
            - rowgroup [ref=e251]:
              - row "Economic" [ref=e252]:
                - cell "Economic" [ref=e253]
              - row "Median Household Income N/A N/A $63,202" [ref=e254]:
                - cell "Median Household Income" [ref=e255]
                - cell "N/A" [ref=e256]
                - cell "N/A" [ref=e257]
                - cell "$63,202" [ref=e258]
              - row "Poverty Rate N/A N/A 13%" [ref=e259]:
                - cell "Poverty Rate" [ref=e260]
                - cell "N/A" [ref=e261]
                - cell "N/A" [ref=e262]
                - cell "13%" [ref=e263]
              - row "Unemployment Rate N/A N/A 5.1%" [ref=e264]:
                - cell "Unemployment Rate" [ref=e265]
                - cell "N/A" [ref=e266]
                - cell "N/A" [ref=e267]
                - cell "5.1%" [ref=e268]
              - row "Housing" [ref=e269]:
                - cell "Housing" [ref=e270]
              - row "Median Gross Rent N/A N/A $943" [ref=e271]:
                - cell "Median Gross Rent" [ref=e272]
                - cell "N/A" [ref=e273]
                - cell "N/A" [ref=e274]
                - cell "$943" [ref=e275]
              - row "Homeownership Rate N/A N/A 71.4%" [ref=e276]:
                - cell "Homeownership Rate" [ref=e277]
                - cell "N/A" [ref=e278]
                - cell "N/A" [ref=e279]
                - cell "71.4%" [ref=e280]
              - row "Education" [ref=e281]:
                - cell "Education" [ref=e282]
              - row "Bachelor's Degree or Higher N/A N/A 29.6%" [ref=e283]:
                - cell "Bachelor's Degree or Higher" [ref=e284]
                - cell "N/A" [ref=e285]
                - cell "N/A" [ref=e286]
                - cell "29.6%" [ref=e287]
              - row "Demographics" [ref=e288]:
                - cell "Demographics" [ref=e289]
              - row "Total Population N/A N/A N/A" [ref=e290]:
                - cell "Total Population" [ref=e291]
                - cell "N/A" [ref=e292]
                - cell "N/A" [ref=e293]
                - cell "N/A" [ref=e294]
        - generic [ref=e296]:
          - generic [ref=e297]:
            - heading "Insurance Coverage Breakdown" [level=3] [ref=e298]
            - paragraph [ref=e299]: Estimated % of population by coverage type.
          - table "Insurance coverage breakdown across selected places" [ref=e302]:
            - caption [ref=e303]: Insurance coverage breakdown across selected places
            - rowgroup [ref=e304]:
              - row "Coverage Type Wayne County Oakland County" [ref=e305]:
                - columnheader "Coverage Type" [ref=e306]
                - columnheader "Wayne County" [ref=e307]:
                  - generic [ref=e308]: Wayne County
                - columnheader "Oakland County" [ref=e310]:
                  - generic [ref=e311]: Oakland County
            - rowgroup [ref=e313]:
              - row "Commercial / Employer 44% 64%" [ref=e314]:
                - cell "Commercial / Employer" [ref=e315]
                - cell "44%" [ref=e316]:
                  - generic [ref=e317]: 44%
                - cell "64%" [ref=e318]:
                  - generic [ref=e319]: 64%
              - row "Medicare 16% 18%" [ref=e320]:
                - cell "Medicare" [ref=e321]
                - cell "16%" [ref=e322]:
                  - generic [ref=e323]: 16%
                - cell "18%" [ref=e324]:
                  - generic [ref=e325]: 18%
              - row "Medicaid 24% 10%" [ref=e326]:
                - cell "Medicaid" [ref=e327]
                - cell "24%" [ref=e328]:
                  - generic [ref=e329]: 24%
                - cell "10%" [ref=e330]:
                  - generic [ref=e331]: 10%
              - row "Dual (Medicare + Medicaid) 6% 3%" [ref=e332]:
                - cell "Dual (Medicare + Medicaid)" [ref=e333]
                - cell "6%" [ref=e334]:
                  - generic [ref=e335]: 6%
                - cell "3%" [ref=e336]:
                  - generic [ref=e337]: 3%
              - row "Uninsured 10% 5%" [ref=e338]:
                - cell "Uninsured" [ref=e339]
                - cell "10%" [ref=e340]:
                  - generic [ref=e341]: 10%
                - cell "5%" [ref=e342]:
                  - generic [ref=e343]: 5%
        - generic [ref=e345]:
          - heading "Community Voice Anonymized" [level=3] [ref=e347]:
            - img [ref=e348]
            - text: Community Voice
            - generic [ref=e350]: Anonymized
          - generic [ref=e352]:
            - generic [ref=e353]:
              - generic [ref=e356]: Wayne County
              - generic [ref=e357]:
                - 'img "Rating: 3.2 out of 5" [ref=e358]':
                  - img [ref=e359]
                  - img [ref=e361]
                  - img [ref=e363]
                  - img [ref=e365]
                  - img [ref=e367]
                - generic [ref=e369]: "3.2"
              - generic [ref=e370]:
                - img [ref=e371]
                - generic [ref=e376]: 47 reports
              - generic [ref=e377]:
                - paragraph [ref=e378]: "\"ER wait times improved but still long\""
                - paragraph [ref=e379]: "\"More mental health options needed on east side\""
                - paragraph [ref=e380]: "\"Good 211 service, very responsive\""
              - button "Add your insight" [ref=e381] [cursor=pointer]:
                - img [ref=e382]
                - text: Add your insight
            - generic [ref=e384]:
              - generic [ref=e387]: Oakland County
              - generic [ref=e388]:
                - 'img "Rating: 4.1 out of 5" [ref=e389]':
                  - img [ref=e390]
                  - img [ref=e392]
                  - img [ref=e394]
                  - img [ref=e396]
                  - img [ref=e398]
                - generic [ref=e400]: "4.1"
              - generic [ref=e401]:
                - img [ref=e402]
                - generic [ref=e407]: 29 reports
              - generic [ref=e408]:
                - paragraph [ref=e409]: "\"Excellent specialist network\""
                - paragraph [ref=e410]: "\"Transportation to clinics is a barrier for seniors\""
                - paragraph [ref=e411]: "\"Need more Medicaid-accepting dentists\""
              - button "Add your insight" [ref=e412] [cursor=pointer]:
                - img [ref=e413]
                - text: Add your insight
        - generic [ref=e415]:
          - img [ref=e416]
          - paragraph [ref=e420]: Using this for CHNA, VBC, or utility planning?
          - link "Talk with Access Michigan" [ref=e421] [cursor=pointer]:
            - /url: /partnerships/health-systems
            - text: Talk with Access Michigan
            - img
        - paragraph [ref=e422]: "Census data: U.S. Census Bureau, ACS 5-Year Estimates (2022). ★ = best; ⚠ = needs attention (Equity Lens). ZIP data from ZCTA-level ACS tables."
    - generic [ref=e425]:
      - generic [ref=e426]:
        - img [ref=e427]
        - generic [ref=e429]: Independent civic project
      - generic [ref=e430]:
        - img [ref=e431]
        - generic [ref=e435]: Built on public data
      - generic [ref=e436]:
        - img [ref=e437]
        - generic [ref=e440]: Aggregated analytics only
      - generic [ref=e441]:
        - img [ref=e442]
        - generic [ref=e445]: All 83 Michigan counties
    - contentinfo [ref=e446]:
      - generic [ref=e448]:
        - img [ref=e449]
        - generic [ref=e451]:
          - text: In Crisis?
          - link "988" [ref=e452] [cursor=pointer]:
            - /url: tel:988
          - text: · Text HOME to 741741 ·
          - link "2-1-1" [ref=e453] [cursor=pointer]:
            - /url: tel:211
      - generic [ref=e454]:
        - generic [ref=e455]:
          - generic [ref=e456]:
            - generic [ref=e457]:
              - img [ref=e459]
              - generic [ref=e461]: Access Michigan
            - paragraph [ref=e462]: Independent civic project. Michigan's public services, one place, sourced.
          - navigation "Understand" [ref=e463]:
            - paragraph [ref=e464]: Understand
            - list [ref=e465]:
              - listitem [ref=e466]:
                - link "Ask a Question" [ref=e467] [cursor=pointer]:
                  - /url: /ask
              - listitem [ref=e468]:
                - link "County Brief" [ref=e469] [cursor=pointer]:
                  - /url: /brief
              - listitem [ref=e470]:
                - link "Learn About Programs" [ref=e471] [cursor=pointer]:
                  - /url: /learn
              - listitem [ref=e472]:
                - link "Data & Insights Hub" [ref=e473] [cursor=pointer]:
                  - /url: /data-and-insights
              - listitem [ref=e474]:
                - link "ZIP Scorecard" [ref=e475] [cursor=pointer]:
                  - /url: /zip/48201
              - listitem [ref=e476]:
                - link "ZIP Intelligence" [ref=e477] [cursor=pointer]:
                  - /url: /zip-intelligence
              - listitem [ref=e478]:
                - link "ZIP Finder" [ref=e479] [cursor=pointer]:
                  - /url: /zip-finder
            - button "Show all 26 Understand links" [ref=e480] [cursor=pointer]:
              - text: Show all 26
              - img [ref=e481]
          - navigation "Visualize" [ref=e483]:
            - paragraph [ref=e484]: Visualize
            - list [ref=e485]:
              - listitem [ref=e486]:
                - link "Health Map" [ref=e487] [cursor=pointer]:
                  - /url: /health-map
              - listitem [ref=e488]:
                - link "Health Data Dashboard" [ref=e489] [cursor=pointer]:
                  - /url: /data
              - listitem [ref=e490]:
                - link "Health Equity" [ref=e491] [cursor=pointer]:
                  - /url: /equity
              - listitem [ref=e492]:
                - link "Health Equity Atlas" [ref=e493] [cursor=pointer]:
                  - /url: /health-equity-atlas
              - listitem [ref=e494]:
                - link "Food Access Explorer" [ref=e495] [cursor=pointer]:
                  - /url: /food-access
              - listitem [ref=e496]:
                - link "Deep Map (GIS)" [ref=e497] [cursor=pointer]:
                  - /url: /map/layers
              - listitem [ref=e498]:
                - link "Energy Burden" [ref=e499] [cursor=pointer]:
                  - /url: /energy-burden
            - button "Show all 17 Visualize links" [ref=e500] [cursor=pointer]:
              - text: Show all 17
              - img [ref=e501]
          - navigation "Belong" [ref=e503]:
            - paragraph [ref=e504]: Belong
            - list [ref=e505]:
              - listitem [ref=e506]:
                - link "Find Help" [ref=e507] [cursor=pointer]:
                  - /url: /find-care
              - listitem [ref=e508]:
                - link "Community Resources" [ref=e509] [cursor=pointer]:
                  - /url: /resources
              - listitem [ref=e510]:
                - link "Financial Help" [ref=e511] [cursor=pointer]:
                  - /url: /financial-help
              - listitem [ref=e512]:
                - link "Housing Options" [ref=e513] [cursor=pointer]:
                  - /url: /housing-options
              - listitem [ref=e514]:
                - link "Insurance & Coverage" [ref=e515] [cursor=pointer]:
                  - /url: /insurance-coverage
              - listitem [ref=e516]:
                - link "Transportation" [ref=e517] [cursor=pointer]:
                  - /url: /transportation
              - listitem [ref=e518]:
                - link "Health Conditions" [ref=e519] [cursor=pointer]:
                  - /url: /conditions
            - button "Show all 30 Belong links" [ref=e520] [cursor=pointer]:
              - text: Show all 30
              - img [ref=e521]
          - navigation "About & Legal" [ref=e523]:
            - paragraph [ref=e524]: About & Legal
            - list [ref=e525]:
              - listitem [ref=e526]:
                - link "About Access Michigan" [ref=e527] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e528]:
                - link "Support This Project" [ref=e529] [cursor=pointer]:
                  - /url: /support
              - listitem [ref=e530]:
                - link "Our Story" [ref=e531] [cursor=pointer]:
                  - /url: /story
              - listitem [ref=e532]:
                - link "Impact" [ref=e533] [cursor=pointer]:
                  - /url: /impact
              - listitem [ref=e534]:
                - link "Contact" [ref=e535] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e536]:
                - link "Report an issue" [ref=e537] [cursor=pointer]:
                  - /url: /feedback
              - listitem [ref=e538]:
                - link "Privacy Policy" [ref=e539] [cursor=pointer]:
                  - /url: /privacy
            - button "Show all 16 About & Legal links" [ref=e540] [cursor=pointer]:
              - text: Show all 16
              - img [ref=e541]
          - navigation "For Organizations" [ref=e543]:
            - paragraph [ref=e544]: For Organizations
            - list [ref=e545]:
              - listitem [ref=e546]:
                - link "Health System Leaders" [ref=e547] [cursor=pointer]:
                  - /url: /partners
              - listitem [ref=e548]:
                - link "Community Organizations" [ref=e549] [cursor=pointer]:
                  - /url: /partnerships
              - listitem [ref=e550]:
                - link "For Health Systems" [ref=e551] [cursor=pointer]:
                  - /url: /for-health-systems
              - listitem [ref=e552]:
                - link "Health Plans & Medicaid" [ref=e553] [cursor=pointer]:
                  - /url: /partners/health-plans-medicaid
              - listitem [ref=e554]:
                - link "Utilities & Regulators" [ref=e555] [cursor=pointer]:
                  - /url: /partners/utilities-regulators
              - listitem [ref=e556]:
                - link "Executive Summary" [ref=e557] [cursor=pointer]:
                  - /url: /executive-summary
              - listitem [ref=e558]:
                - link "Illustrative Scenarios" [ref=e559] [cursor=pointer]:
                  - /url: /case-studies
        - generic [ref=e560]:
          - generic [ref=e563]: All systems normal
          - generic [ref=e564]:
            - generic [ref=e565]:
              - img [ref=e566]
              - generic [ref=e569]: ✓
              - generic [ref=e570]: Statewide coverage
              - img [ref=e571]
            - generic [ref=e574]:
              - img [ref=e575]
              - generic [ref=e577]: ✓
              - generic [ref=e578]: Verified feeds
              - img [ref=e579]
            - generic "4 uptime-monitored API endpoints. Distinct from the 49 public data feeds (from 42 publishers) behind the platform's data." [ref=e582]:
              - img [ref=e583]
              - generic [ref=e587]: "4"
              - generic [ref=e588]: Live sources
              - img [ref=e589]
          - paragraph [ref=e592]: Independent civic project. Not affiliated with any agency, employer, or health system.
          - paragraph [ref=e593]: Site updated August 17, 2026
        - generic [ref=e594]:
          - paragraph [ref=e595]: Including data from
          - generic [ref=e596]:
            - generic [ref=e597]:
              - img [ref=e598]
              - generic [ref=e602]: MDHHS
            - generic [ref=e603]:
              - img [ref=e604]
              - generic [ref=e606]: Michigan 2-1-1
            - generic [ref=e607]:
              - img [ref=e608]
              - generic [ref=e610]: CMS (Medicare)
            - generic [ref=e611]:
              - img [ref=e612]
              - generic [ref=e617]: HRSA
            - generic [ref=e618]:
              - img [ref=e619]
              - generic [ref=e621]: CDC
            - generic [ref=e622]:
              - img [ref=e623]
              - generic [ref=e625]: EPA AirNow
            - generic [ref=e626]:
              - img [ref=e627]
              - generic [ref=e630]: Leapfrog (Safety)
          - paragraph [ref=e631]:
            - link "View all 49 public sources →" [ref=e632] [cursor=pointer]:
              - /url: /data-sources
        - generic [ref=e634]:
          - paragraph [ref=e635]:
            - img [ref=e636]
            - generic [ref=e639]: Access Michigan
            - text: "- built by residents, improved by feedback."
          - paragraph [ref=e640]:
            - text: Suggestion?
            - link "Tell us." [ref=e641] [cursor=pointer]:
              - /url: /contact
          - link "☕ Support this project" [ref=e642] [cursor=pointer]:
            - /url: https://buymeacoffee.com/michigans
        - generic [ref=e643]:
          - button "Report an issue or suggest data" [ref=e645] [cursor=pointer]:
            - img [ref=e646]
            - text: Report an issue or suggest data
            - img [ref=e648]
          - button "Replay welcome tour" [ref=e650] [cursor=pointer]:
            - img [ref=e651]
            - text: Replay welcome tour
        - generic [ref=e654]:
          - generic [ref=e655]:
            - img [ref=e656]
            - link "How we keep this honest →" [ref=e658] [cursor=pointer]:
              - /url: /methodology#trust-log
          - paragraph [ref=e659]:
            - text: Verified datasets. Modeled estimates clearly labeled.
            - link "See how →" [ref=e660] [cursor=pointer]:
              - /url: /methodology
          - paragraph [ref=e661]: Independent · Not a government agency · Data from MDHHS, CMS, HRSA, CDC, EPA, and more.
          - paragraph [ref=e662]:
            - text: "Crisis support:"
            - link "988" [ref=e663] [cursor=pointer]:
              - /url: tel:988
            - text: (Suicide & Crisis Lifeline) -
            - link "211" [ref=e664] [cursor=pointer]:
              - /url: tel:211
            - text: (Local Resources)
          - generic [ref=e665]:
            - generic [ref=e666]:
              - img [ref=e667]
              - generic [ref=e670]: Aggregated analytics via Google Analytics 4 (cookies, IP). No ads, no data selling. See Privacy.
            - paragraph [ref=e671]: "Data: CMS · HRSA · CDC · MDHHS · Leapfrog · EPA · NHTSA · EIA"
          - paragraph [ref=e672]:
            - text: Michigan edition. National and global coverage at
            - link "ourintel.org" [ref=e673] [cursor=pointer]:
              - /url: https://ourintel.org
            - text: .
    - button "Print or save as PDF" [ref=e674] [cursor=pointer]:
      - img
      - generic [ref=e675]: Print / PDF
    - region "Quick exit - leave this site immediately" [ref=e676]:
      - generic [ref=e677]:
        - button "Quick exit - leave this site immediately (also press Escape)" [ref=e678] [cursor=pointer]:
          - img [ref=e679]
          - generic [ref=e682]: Quick Exit
          - generic [ref=e683]: ESC
        - generic [ref=e684]: Press ESC to quickly leave this page
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { injectAxe, getViolations } from 'axe-playwright';
  3  | 
  4  | const PAGES_TO_TEST = ['/', '/brief', '/compare', '/county', '/environment', '/data-insights'];
  5  | 
  6  | for (const path of PAGES_TO_TEST) {
  7  |   test(`A11Y: ${path} has zero critical/serious violations`, async ({ page }) => {
  8  |     // Suppress first-visit onboarding tour to avoid false-positive contrast violations
  9  |     await page.addInitScript(() => {
  10 |       localStorage.setItem('accessmi_tour_seen', 'true');
  11 |     });
  12 |     await page.goto(path, { waitUntil: 'domcontentloaded' });
  13 |     // Give React a moment to render, but don't block on external API calls
  14 |     await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  15 |     await injectAxe(page);
  16 | 
  17 |     // getViolations + an explicit assertion rather than checkA11y, so a
  18 |     // failure names the rule, its impact, and the offending selectors in the
  19 |     // CI log. checkA11y's assertion prints only "1 !== 0"; when /environment
  20 |     // failed on 2026-08-17 the log gave no way to tell which rule broke, and
  21 |     // the page could not be reproduced locally because it renders live AQI
  22 |     // data. Same strictness, diagnosable output.
  23 |     // getViolations does NOT honour `includedImpacts` - it returns every
  24 |     // impact level - so the filter is applied here. Passing the option and
  25 |     // trusting it silently promotes this gate from critical/serious to
  26 |     // all-impacts, which fails pages that are meant to pass (e.g. /compare
  27 |     // reports a moderate "region" violation).
  28 |     const BLOCKING_IMPACTS = ['critical', 'serious', 'moderate'];
  29 |     const allViolations = await getViolations(page);
  30 |     const violations = allViolations.filter(
  31 |       (v) => v.impact && BLOCKING_IMPACTS.includes(v.impact),
  32 |     );
  33 | 
  34 |     if (violations.length > 0) {
  35 |       for (const v of violations) {
  36 |         console.error(
  37 |           `[a11y] ${path} ${v.impact?.toUpperCase()} ${v.id}: ${v.help}\n` +
  38 |             `       ${v.helpUrl}\n` +
  39 |             v.nodes
  40 |               .map(
  41 |                 (n) =>
  42 |                   `       target: ${JSON.stringify(n.target)}\n` +
  43 |                   `       ${(n.failureSummary ?? '').replace(/\n/g, '\n       ')}`,
  44 |               )
  45 |               .join('\n'),
  46 |         );
  47 |       }
  48 |     }
  49 | 
  50 |     expect(
  51 |       violations.map((v) => `${v.impact}:${v.id}`),
  52 |       `critical/serious a11y violations on ${path}`,
> 53 |     ).toEqual([]);
     |       ^ Error: critical/serious a11y violations on /compare
  54 |   });
  55 | }
  56 | 
  57 | test('A11Y: all buttons have accessible names', async ({ page }) => {
  58 |   await page.goto('/');
  59 |   await page.waitForLoadState('networkidle');
  60 |   const buttons = await page.locator('button').all();
  61 |   for (const button of buttons) {
  62 |     const name =
  63 |       (await button.getAttribute('aria-label')) ?? (await button.textContent()) ?? '';
  64 |     expect(name.trim().length, 'Button missing accessible name').toBeGreaterThan(0);
  65 |   }
  66 | });
  67 | 
  68 | test('A11Y: keyboard navigation reaches key interactive elements', async ({ page }) => {
  69 |   await page.goto('/');
  70 |   await page.waitForLoadState('networkidle');
  71 |   let focusedElements = 0;
  72 |   for (let i = 0; i < 20; i++) {
  73 |     await page.keyboard.press('Tab');
  74 |     const active = await page.evaluate(() => document.activeElement?.tagName);
  75 |     if (['A', 'BUTTON', 'INPUT', 'SELECT'].includes(active ?? '')) focusedElements++;
  76 |   }
  77 |   expect(focusedElements).toBeGreaterThan(5);
  78 | });
  79 | 
  80 | test('A11Y: page has exactly one h1', async ({ page }) => {
  81 |   await page.goto('/');
  82 |   await page.waitForLoadState('networkidle');
  83 |   const h1s = await page.locator('h1').count();
  84 |   expect(h1s).toBe(1);
  85 | });
  86 | 
  87 | test('A11Y: all images have alt text', async ({ page }) => {
  88 |   await page.goto('/');
  89 |   await page.waitForLoadState('networkidle');
  90 |   const images = await page.locator('img').all();
  91 |   for (const img of images) {
  92 |     const alt = await img.getAttribute('alt');
  93 |     expect(alt, 'Image missing alt attribute').not.toBeNull();
  94 |   }
  95 | });
  96 | 
```