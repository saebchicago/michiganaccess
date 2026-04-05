# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list
  - region "Notifications alt+T"
  - generic [ref=e4]:
    - generic [ref=e5]:
      - img [ref=e7]
      - generic [ref=e9]: Access Michigan
    - paragraph [ref=e10]: Find healthcare, community resources, and support across Michigan
    - generic [ref=e11]:
      - generic [ref=e12]:
        - img [ref=e13]
        - textbox "Search Access Michigan" [ref=e16]:
          - /placeholder: Search by city, condition, or service…
      - button "Search" [ref=e17] [cursor=pointer]
    - generic [ref=e18]:
      - link "Find Care" [ref=e19] [cursor=pointer]:
        - /url: https://accessmi.org/find-care
        - img [ref=e20]
        - text: Find Care
      - 'link "Crisis: 988" [ref=e23] [cursor=pointer]':
        - /url: tel:988
        - img [ref=e24]
        - text: "Crisis: 988"
      - link "2-1-1" [ref=e26] [cursor=pointer]:
        - /url: tel:211
    - paragraph [ref=e27]:
      - text: Powered by
      - link "Access Michigan" [ref=e28] [cursor=pointer]:
        - /url: https://accessmi.org
      - text: · Non-commercial civic resource
```