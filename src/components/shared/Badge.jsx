export default function Badge({ children, color = '#534AB7' }) {
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border"
      style={{
        background: `${color}22`,
        color,
        borderColor: `${color}44`,
      }}
    >
      {children}
    </span>
  )
}
