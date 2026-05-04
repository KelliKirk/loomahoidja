export default function ConnectionCard({ baseUrl, setBaseUrl, token }) {
  return (
    <section className="card">
      <h2>Ühendus</h2>
      <p>Muuda API aadressi, kui backend jookseb mujal.</p>

      <div className="field">
        <label>API base URL</label>
        <input
          className="input mono"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="http://localhost:3001/api"
        />
      </div>

      <div className="field">
        <label>Token (read-only)</label>
        <textarea className="textarea mono" value={token || ''} readOnly rows={3} />
      </div>
    </section>
  )
}
