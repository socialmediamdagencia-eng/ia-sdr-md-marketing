export function Topbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Plataforma IA SDR
          </p>
          <h1 className="text-lg font-semibold text-ink">Operação comercial inteligente</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="hidden h-10 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-ink sm:flex"
            type="button"
            aria-label="Buscar"
          >
            <span className="text-xs font-semibold" aria-hidden="true">
              /
            </span>
            Buscar
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-md border border-line bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-ink"
            type="button"
            aria-label="Notificações"
          >
            <span className="text-xs font-semibold" aria-hidden="true">
              !
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
