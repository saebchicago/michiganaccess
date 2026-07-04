import { describe, it, expect } from 'vitest';
import { INTELLIGENCE_DOMAINS } from '@/data/intelligence-domains';
import { MICHIGAN_COUNTY_PROFILES, MI_AVERAGE } from '@/data/michigan-county-profiles';

describe('Intelligence Domains', () => {
  // Reduced from 10 to 3 - see FIXLOG.md. The other 7 either had no field
  // traceable to a real source, or (for 5 of them) were never actually
  // reachable as a Domain Dashboard route in the first place.
  it('has exactly 3 domains', () => {
    expect(INTELLIGENCE_DOMAINS).toHaveLength(3);
  });

  it('every domain has required fields', () => {
    for (const domain of INTELLIGENCE_DOMAINS) {
      expect(domain.name, `${domain.slug} missing name`).toBeTruthy();
      expect(domain.slug, `${domain.name} missing slug`).toBeTruthy();
      expect(domain.metrics.length, `${domain.slug} has no metrics`).toBeGreaterThan(0);
      expect(domain.dataSource, `${domain.slug} missing dataSource`).toBeTruthy();
    }
  });
});

describe('Michigan County Profiles', () => {
  it('has all 83 counties', () => {
    expect(MICHIGAN_COUNTY_PROFILES).toHaveLength(83);
  });

  it('every county has required health fields', () => {
    for (const county of MICHIGAN_COUNTY_PROFILES) {
      expect(county.name, 'county missing name').toBeTruthy();
      expect(county.fips, `${county.name} missing fips`).toBeTruthy();
      expect(county.health, `${county.name} missing health data`).toBeDefined();
    }
  });

  it('MI_AVERAGE export exists and has health metrics', () => {
    expect(MI_AVERAGE).toBeDefined();
    expect(MI_AVERAGE.health.diabetes_prevalence).toBeGreaterThan(0);
  });
});
