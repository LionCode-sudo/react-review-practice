type UseMyLocationProps = {
  isLoading: boolean
  onLocate: () => void
}

export function UseMyLocation({ isLoading, onLocate }: UseMyLocationProps) {
  return (
    <button
      aria-busy={isLoading}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 text-sm text-slate-200 transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 disabled:cursor-wait disabled:opacity-60"
      disabled={isLoading}
      onClick={onLocate}
      type="button"
    >
      <svg
        aria-hidden="true"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3m0 14v3M2 12h3m14 0h3" strokeLinecap="round" />
        <circle cx="12" cy="12" r="7" />
      </svg>
      Use my location
    </button>
  )
}
