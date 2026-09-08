-- Ensure the bucket for workspace images exists
insert into storage.buckets (id, name, public)
values ('workspace_assets', 'workspace_assets', true)
on conflict (id) do nothing;
