revoke select on public.community_events from anon, authenticated;

grant select (
  id, title, description, event_type, event_date, start_time, end_time,
  location_name, address, city, county, state, zip, organizer, website,
  is_free, registration_required, registration_url, tags, is_active,
  created_at, updated_at
) on public.community_events to anon, authenticated;

alter table public.community_events alter column is_active set default false;

drop policy "Anyone can submit events for moderation" on public.community_events;

create policy "Anyone can submit events for moderation"
  on public.community_events for insert to public
  with check (is_active is not true);