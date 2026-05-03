export default function Field({ label, children, hint }) {
  return (
    <div className="fieldBlock">
      {label ? <div className="fieldLabel">{label}</div> : null}
      {children}
      {hint ? <div className="fieldHint">{hint}</div> : null}
    </div>
  )
}
