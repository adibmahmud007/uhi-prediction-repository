export default function Card({ title, action, className = '', children }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-4 ${className}`}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
