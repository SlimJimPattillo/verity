-- Verity Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Organizations table
create table organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  website text,
  ein text,
  sector text check (sector in ('food', 'education', 'healthcare', 'animal', 'other')),
  primary_color text default '#059669',
  secondary_color text default '#FFC27B',
  neutral_color text default '#F9FAFB',
  logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Users table (extends Supabase auth.users)
create table user_profiles (
  id uuid references auth.users on delete cascade primary key,
  organization_id uuid references organizations on delete cascade not null,
  full_name text,
  role text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Metrics table
create table metrics (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references organizations on delete cascade not null,
  label text not null,
  value numeric not null,
  unit text check (unit in ('$', '%', 'People', '#')) not null,
  type text check (type in ('output', 'outcome')) not null,
  comparison text,
  previous_value numeric,
  time_period text,
  data_source text,
  notes text,
  created_by uuid references auth.users on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Narratives table
create table narratives (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references organizations on delete cascade not null,
  title text not null,
  content text not null,
  tags text[],
  source text check (source in ('manual', 'ai_generated', 'imported')),
  created_by uuid references auth.users on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Reports table
create table reports (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references organizations on delete cascade not null,
  name text not null,
  type text check (type in ('Annual Report', 'Grant Application', 'Impact Report')) not null,
  status text check (status in ('Draft', 'Published', 'Under Review')) default 'Draft',
  title text,
  date_range text,
  narrative text,
  template_id text,
  primary_color text,
  secondary_color text,
  neutral_color text,
  financials jsonb,
  created_by uuid references auth.users on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Report metrics junction table (many-to-many)
create table report_metrics (
  id uuid default uuid_generate_v4() primary key,
  report_id uuid references reports on delete cascade not null,
  metric_id uuid references metrics on delete cascade not null,
  sort_order integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(report_id, metric_id)
);

-- Grant answers table (from Grant Copilot)
create table grant_answers (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references organizations on delete cascade not null,
  question text not null,
  answer text not null,
  tone text,
  metrics_used uuid[],
  saved_to_narratives boolean default false,
  narrative_id uuid references narratives on delete set null,
  created_by uuid references auth.users on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Policies

-- Enable RLS
alter table organizations enable row level security;
alter table user_profiles enable row level security;
alter table metrics enable row level security;
alter table narratives enable row level security;
alter table reports enable row level security;
alter table report_metrics enable row level security;
alter table grant_answers enable row level security;

-- Organizations policies
create policy "Users can view their own organization"
  on organizations for select
  using (id in (
    select organization_id from user_profiles where id = auth.uid()
  ));

create policy "Users can update their own organization"
  on organizations for update
  using (id in (
    select organization_id from user_profiles where id = auth.uid()
  ));

-- User profiles policies
create policy "Users can view their own profile"
  on user_profiles for select
  using (id = auth.uid());

create policy "Users can update their own profile"
  on user_profiles for update
  using (id = auth.uid());

create policy "Users can insert their own profile"
  on user_profiles for insert
  with check (id = auth.uid());

-- Metrics policies
create policy "Users can view metrics from their organization"
  on metrics for select
  using (organization_id in (
    select organization_id from user_profiles where id = auth.uid()
  ));

create policy "Users can insert metrics to their organization"
  on metrics for insert
  with check (organization_id in (
    select organization_id from user_profiles where id = auth.uid()
  ));

create policy "Users can update metrics from their organization"
  on metrics for update
  using (organization_id in (
    select organization_id from user_profiles where id = auth.uid()
  ));

create policy "Users can delete metrics from their organization"
  on metrics for delete
  using (organization_id in (
    select organization_id from user_profiles where id = auth.uid()
  ));

-- Narratives policies
create policy "Users can view narratives from their organization"
  on narratives for select
  using (organization_id in (
    select organization_id from user_profiles where id = auth.uid()
  ));

create policy "Users can insert narratives to their organization"
  on narratives for insert
  with check (organization_id in (
    select organization_id from user_profiles where id = auth.uid()
  ));

create policy "Users can update narratives from their organization"
  on narratives for update
  using (organization_id in (
    select organization_id from user_profiles where id = auth.uid()
  ));

create policy "Users can delete narratives from their organization"
  on narratives for delete
  using (organization_id in (
    select organization_id from user_profiles where id = auth.uid()
  ));

-- Reports policies
create policy "Users can view reports from their organization"
  on reports for select
  using (organization_id in (
    select organization_id from user_profiles where id = auth.uid()
  ));

create policy "Users can insert reports to their organization"
  on reports for insert
  with check (organization_id in (
    select organization_id from user_profiles where id = auth.uid()
  ));

create policy "Users can update reports from their organization"
  on reports for update
  using (organization_id in (
    select organization_id from user_profiles where id = auth.uid()
  ));

create policy "Users can delete reports from their organization"
  on reports for delete
  using (organization_id in (
    select organization_id from user_profiles where id = auth.uid()
  ));

-- Report metrics policies
create policy "Users can view report_metrics from their organization"
  on report_metrics for select
  using (report_id in (
    select id from reports where organization_id in (
      select organization_id from user_profiles where id = auth.uid()
    )
  ));

create policy "Users can insert report_metrics to their organization"
  on report_metrics for insert
  with check (report_id in (
    select id from reports where organization_id in (
      select organization_id from user_profiles where id = auth.uid()
    )
  ));

create policy "Users can delete report_metrics from their organization"
  on report_metrics for delete
  using (report_id in (
    select id from reports where organization_id in (
      select organization_id from user_profiles where id = auth.uid()
    )
  ));

-- Grant answers policies
create policy "Users can view grant_answers from their organization"
  on grant_answers for select
  using (organization_id in (
    select organization_id from user_profiles where id = auth.uid()
  ));

create policy "Users can insert grant_answers to their organization"
  on grant_answers for insert
  with check (organization_id in (
    select organization_id from user_profiles where id = auth.uid()
  ));

-- Functions for updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_organizations_updated_at before update on organizations
  for each row execute procedure update_updated_at_column();

create trigger update_user_profiles_updated_at before update on user_profiles
  for each row execute procedure update_updated_at_column();

create trigger update_metrics_updated_at before update on metrics
  for each row execute procedure update_updated_at_column();

create trigger update_narratives_updated_at before update on narratives
  for each row execute procedure update_updated_at_column();

create trigger update_reports_updated_at before update on reports
  for each row execute procedure update_updated_at_column();
