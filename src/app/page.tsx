import Link from "next/link";
import { listNotionDatabasePages } from "@/lib/notion";
import { diagramService } from "@/lib/diagram_service";

export default async function DashboardPage() {
  const pages = await listNotionDatabasePages();
  const pagesWithDiagrams = await Promise.all(
    pages.map(async (page) => {
      const diagram = await diagramService.getByNotionPageId(page.id);
      return {
        ...page,
        diagramId: diagram?.id,
        diagramTitle: diagram?.title,
      };
    })
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Schemata</h1>
            <p className="text-sm text-zinc-500">Personal Architecture Documentation & Diagram Studio</p>
          </div>
        </header>

        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Connected Notion Architecture Pages
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pagesWithDiagrams.map((page) => (
              <div
                key={page.id}
                className="flex flex-col justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm transition hover:shadow-md"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{page.icon}</span>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{page.title}</h3>
                  </div>
                  <p className="text-xs text-zinc-400">
                    {page.diagramId ? "Linked Excalidraw Diagram active" : "No diagram created yet"}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <Link
                    href={`/workspace/${page.id}`}
                    className="inline-flex items-center justify-center rounded-md bg-zinc-900 dark:bg-zinc-100 px-3 py-1.5 text-xs font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition"
                  >
                    Open Workspace
                  </Link>
                  {page.diagramId && (
                    <Link
                      href={`/embed/${page.diagramId}`}
                      target="_blank"
                      className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline"
                    >
                      View Embed
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
