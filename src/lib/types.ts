// 全站共享的数据类型。数据库、API、页面、种子数据都使用这些类型。

export type StatusKey = "online" | "completed" | "developing" | "testing" | "poc";
export type KindKey = "work" | "solo" | "participated" | "ai" | "poc";
export type LevelKey = "" | "know" | "familiar" | "proficient";
export type ContactType = "phone" | "email" | "wechat" | "link";

export type GalleryItem = { src: string; caption: string; isStock: boolean };
export type Metric = { label: string; value: string; note: string };
export type LinkItem = { label: string; url: string };
export type Step = { title: string; desc: string };

export type ProjectContent = {
  background: string;
  goals: string;
  responsibilities: string;
  problems: string;
  process: string;
  steps: Step[];
  techSolution: string;
  deliverables: string;
  summary: string;
};

export type Category = {
  id: string;
  name: string;
  description: string;
  color: string;
  sort: number;
  visible: boolean;
};

export type Project = {
  id: string;
  title: string;
  categoryId: string;
  summary: string;
  description: string;
  status: StatusKey;
  kinds: KindKey[];
  cover: string;
  coverIsStock: boolean;
  gallery: GalleryItem[];
  role: string;
  tools: string[];
  content: ProjectContent;
  achievements: Metric[];
  links: LinkItem[];
  qrcode: string;
  demoVideo: string;
  periodStart: string;
  periodEnd: string;
  featured: boolean;
  visible: boolean;
  sort: number;
  createdAt: string;
  updatedAt: string;
};

export type Experience = {
  id: string;
  kind: "work" | "education";
  org: string;
  title: string;
  extra: string;
  periodStart: string;
  periodEnd: string;
  summary: string;
  bullets: string[];
  visible: boolean;
  sort: number;
};

export type SkillItem = { name: string; level: LevelKey; note: string };

export type SkillGroup = {
  id: string;
  name: string;
  description: string;
  items: SkillItem[];
  visible: boolean;
  sort: number;
};

export type LogEntry = {
  id: string;
  date: string;
  title: string;
  body: string;
  projectId: string;
  visible: boolean;
};

export type Contact = {
  type: ContactType;
  label: string;
  value: string;
  reveal: boolean;
  visible: boolean;
};

export type Profile = {
  name: string;
  englishName: string;
  headline: string;
  tagline: string;
  intro: string;
  about: string;
  avatar: string;
  location: string;
  intention: string;
  experienceYears: string;
  salary: string;
  showSalary: boolean;
  resumeUrl: string;
  highlights: Metric[];
  contacts: Contact[];
  certificates: string[];
  strengths: string[];
};

/** 面向前台的联系方式：需要点击才显示的内容不会出现在 HTML 里。 */
export type PublicContact = {
  index: number;
  type: ContactType;
  label: string;
  display: string;
  reveal: boolean;
};

export type PublicProfile = Omit<Profile, "contacts"> & {
  contacts: PublicContact[];
};

export type SiteSettings = {
  title: string;
  description: string;
  siteUrl: string;
  accent: string;
  footerText: string;
  icp: string;
  showLog: boolean;
  featuredLimit: number;
  sections: {
    capabilities: boolean;
    featured: boolean;
    ongoing: boolean;
    timeline: boolean;
    logs: boolean;
  };
};
