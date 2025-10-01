export default function FilterSelect({ value, onChange, options, srLabel }) {
  return (
    <div className="backdrop-blur-xl border border-slate-200/30 shadow-lg rounded-2xl bg-white/90">
      {/* screen-reader only label */}
      <label className="sr-only">{srLabel}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-transparent rounded-2xl text-slate-700 focus:outline-none"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
