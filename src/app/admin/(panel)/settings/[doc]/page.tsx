import { notFound } from "next/navigation";
import { SettingsEditor } from "@/components/admin/SettingsEditor";
import { SETTINGS_CONFIG } from "@/components/admin/config";
import { getRawDocs } from "@/lib/content";
import { requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ params }: { params: Promise<{ doc: string }> }) {
  await requireAdmin();
  const { doc } = await params;
  if (doc !== "profile" && doc !== "site") notFound();
  const docs = await getRawDocs();
  const cfg = SETTINGS_CONFIG[doc];
  return (
    <div>
      <h1 className="text-2xl font-semibold">{cfg.title}</h1>
      <p className="mb-6 mt-1 text-sm text-muted">{cfg.hint}</p>
      <SettingsEditor doc={doc} initial={docs[doc]} />
    </div>
  );
}
