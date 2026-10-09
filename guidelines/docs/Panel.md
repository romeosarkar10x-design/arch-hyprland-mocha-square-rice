---
category: Popups
---

Shell for every rich bar dropdown: mantle body, hairline frame, accent corner brackets, icon-tile header, divided sections, crust action footer.

```tsx
<Panel icon="cpu" accent="sky" title="Processor" subtitle="Ryzen 9 9900X" live actions={<Button icon="chart">btop</Button>}>
  <PanelSection label="load · 60 s"><Graph series={[...]} /></PanelSection>
</Panel>
```

Default width 440. Compose PanelSection children; use Stat/Meter/Graph/Gauge inside.
