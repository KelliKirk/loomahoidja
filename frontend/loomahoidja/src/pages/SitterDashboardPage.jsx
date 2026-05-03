import AppHeader from '../components/AppHeader'
import Button from '../components/Button'

const requests = [
  { owner: 'Peeter P.', pet: 'Rex', dates: '14.04–17.04', price: '25.50 €' },
  { owner: 'Darude S.', pet: 'Küpsis', dates: '20.04–22.04', price: '30.00 €' },
  { owner: 'Paul E.', pet: 'Pitsu', dates: '01.05–03.05', price: '22.50 €' },
]

export default function SitterDashboardPage() {
  return (
    <div className="pageShell">
      <AppHeader />
      <main className="pageMain">
        <h1 className="typeH1">Tere tulemast, Leelo</h1>
        <p className="typeBody textMuted">Sinu hoidja ülevaade</p>

        <div className="statRow">
          {[
            ['Uued päringud', '3', 'ootavad vastust'],
            ['Aktiivsed broneeringud', '2', 'sel nädalal'],
            ['Selle kuu tulu', '127 €', ''],
            ['Hinne', '4.9', '28 arvustust'],
          ].map(([t, v, s]) => (
            <div key={t} className="statCard cardSurface">
              <div className="typeCaption">{t}</div>
              <div className="typeDisplay statNum">{v}</div>
              {s ? <div className="typeBodySmall textMuted">{s}</div> : null}
            </div>
          ))}
        </div>

        <section className="cardSurface blockPad">
          <h2 className="typeH2">Broneeringu päringud</h2>
          <div className="tableWrap">
            <table className="dataTable">
              <thead>
                <tr>
                  <th>Omanik</th>
                  <th>Lemmik</th>
                  <th>Kuupäevad</th>
                  <th>Summa</th>
                  <th>Tegevused</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.owner + r.dates}>
                    <td>{r.owner}</td>
                    <td>{r.pet}</td>
                    <td>{r.dates}</td>
                    <td>{r.price}</td>
                    <td className="tableActions">
                      <Button variant="primary" className="btnSm">
                        Nõustu
                      </Button>
                      <Button variant="outline" className="btnSm">
                        Keeldu
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="cardSurface blockPad">
          <h2 className="typeH2">Saadavuse kalender</h2>
          <p className="typeCaption legendRow">
            <span className="swatch swatchFree" /> Saadaval <span className="swatch swatchBusy" /> Hõivatud
          </p>
        </section>

        <div className="dashTwoCol">
          <section className="cardSurface blockPad">
            <h3 className="typeH3">Selle kuu tulu</h3>
            <p className="typeDisplay">127 €</p>
          </section>
          <section className="cardSurface blockPad">
            <h3 className="typeH3">Kogutulu</h3>
            <p className="typeDisplay">843 €</p>
          </section>
        </div>
      </main>
    </div>
  )
}
