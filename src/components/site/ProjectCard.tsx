import Link from "next/link";
import { formatPeriod } from "@/lib/period";
import type { Category, Project } from "@/lib/types";
import { CategoryChip, StatusBadge } from "./Badges";
import { Media } from "./Media";

export function ProjectCard({ project, category }: { project: Project; category?: Category }) {
  const period = formatPeriod(project.periodStart, project.periodEnd);
  return (
    <Link
      href={`/projects/${project.id}`}
      className="card card-hover group flex h-full flex-col overflow-hidden"
    >
      <div className="relative">
        <Media
          src={project.cover}
          alt={`${project.title} 封面`}
          stock={project.coverIsStock}
          color={category?.color}
          label={category?.name}
          imgClassName="transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {category && (
          <div className="absolute left-3 top-3">
            <CategoryChip category={category} solid />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <StatusBadge status={project.status} />
          {period && <span className="font-mono text-xs text-faint">{period}</span>}
        </div>
        <h3 className="text-lg font-semibold leading-snug transition-colors group-hover:text-accent">
          {project.title}
        </h3>
        {project.summary && (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted">{project.summary}</p>
        )}
        {project.tools.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-2">
            {project.tools.slice(0, 4).map((t) => (
              <li key={t} className="chip">
                {t}
              </li>
            ))}
            {project.tools.length > 4 && <li className="chip">+{project.tools.length - 4}</li>}
          </ul>
        )}
      </div>
    </Link>
  );
}
