// 与 schema.ts 等价的建表语句（幂等）。首次访问网站时自动执行，
// 这样部署时不需要手动跑迁移命令；你也可以直接把这些语句粘贴到数据库控制台里执行。
// 每个元素是一条独立语句。

export const DDL_STATEMENTS: string[] = [
  `create table if not exists settings (
    key text primary key,
    value jsonb not null,
    updated_at timestamptz not null default now()
  )`,
  `create table if not exists categories (
    id text primary key,
    name text not null,
    description text not null default '',
    color text not null default '#5eead4',
    sort integer not null default 0,
    visible boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  )`,
  `create table if not exists projects (
    id text primary key,
    title text not null,
    category_id text not null default '',
    summary text not null default '',
    description text not null default '',
    status text not null default 'developing',
    kinds jsonb not null default '[]'::jsonb,
    cover text not null default '',
    cover_is_stock boolean not null default false,
    gallery jsonb not null default '[]'::jsonb,
    role text not null default '',
    tools jsonb not null default '[]'::jsonb,
    content jsonb not null,
    achievements jsonb not null default '[]'::jsonb,
    links jsonb not null default '[]'::jsonb,
    qrcode text not null default '',
    demo_video text not null default '',
    period_start text not null default '',
    period_end text not null default '',
    featured boolean not null default false,
    visible boolean not null default true,
    sort integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  )`,
  `create index if not exists projects_sort_idx on projects (sort)`,
  `create table if not exists experiences (
    id text primary key,
    kind text not null default 'work',
    org text not null,
    title text not null default '',
    extra text not null default '',
    period_start text not null default '',
    period_end text not null default '',
    summary text not null default '',
    bullets jsonb not null default '[]'::jsonb,
    visible boolean not null default true,
    sort integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  )`,
  `create table if not exists skill_groups (
    id text primary key,
    name text not null,
    description text not null default '',
    items jsonb not null default '[]'::jsonb,
    visible boolean not null default true,
    sort integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  )`,
  `create table if not exists logs (
    id text primary key,
    date text not null,
    title text not null,
    body text not null default '',
    project_id text not null default '',
    visible boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  )`,
  `create table if not exists media (
    id text primary key,
    name text not null default '',
    mime text not null,
    size integer not null default 0,
    data text not null,
    created_at timestamptz not null default now()
  )`,
];
