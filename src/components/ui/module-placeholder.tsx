import type { ModuleDefinition } from "@/modules/types";

type ModulePlaceholderProps = {
  module: ModuleDefinition;
};

export function ModulePlaceholder({ module }: ModulePlaceholderProps) {
  return (
    <section className="space-y-6">
      <div className="rounded-md border border-line bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium text-teal">{module.phase}</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">{module.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {module.description}
            </p>
          </div>
          <span className="inline-flex w-fit items-center rounded-md border border-line px-3 py-1 text-xs font-medium text-slate-600">
            {module.status}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {module.capabilities.map((capability) => (
          <div key={capability} className="rounded-md border border-line bg-white p-4">
            <p className="text-sm font-medium text-ink">{capability}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
