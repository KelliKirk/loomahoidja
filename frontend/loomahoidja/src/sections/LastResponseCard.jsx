export default function LastResponseCard({ last, error }) {
  return (
    <section className="card" style={{ gridColumn: '1 / -1' }}>
      <h2>Viimane vastus</h2>
      <p>Abiks debugimisel – siin näed viimase requesti tulemust.</p>
      {error ? <div className="pre error">{error}</div> : null}
      <div className="pre">{last ? JSON.stringify(last, null, 2) : '—'}</div>
    </section>
  )
}

