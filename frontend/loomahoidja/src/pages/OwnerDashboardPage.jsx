import AppHeader from '../components/AppHeader'

const bookings = [
  { pet: 'Rex', sitter: 'Leelo Lameuss', dates: '14.04–17.04', price: '25.50 €', status: 'confirmed' },
  { pet: 'Miisu', sitter: 'Rasmus Sigma', dates: '02.05–04.05', price: '36.00 €', status: 'pending' },
  { pet: 'Semu', sitter: 'Leelo Lameuss', dates: '10.03–12.03', price: '18.00 €', status: 'completed' },
]

const pets = [
  { name: 'Rex', type: 'dog', age: '3 aastat' },
  { name: 'Miisu', type: 'cat', age: '5 aastat' },
  { name: 'Semu', type: 'dog', age: '1 aasta' },
]

const messages = [
  { from: 'Leelo L.', preview: 'Rex on hea poiss!', time: '17 min tagasi' },
  { from: 'Rasmus S.', preview: 'Kas Miisu tohib väljas magada?', time: '1 tund tagasi' },
]

export default function OwnerDashboardPage() {
  return (
    <div className="pageShell">
      <AppHeader />
      <main className="pageMain">
        <h1 className="typeH1">Tere tulemast, Peeter</h1>
        <p className="typeBody textMuted">Siin on ülevaade sinu lemmikutest</p>

        <div className="statRow">
          {[
            ['Aktiivsed broneeringud', '2', '1 tulekul'],
            ['Minu lemmikud', '3', 'kõik lisatud'],
            ['Broneeringuid kokku', '12', 'alates liitumisest'],
            ['Lugemata sõnumid', '4', 'hoidjatelt'],
          ].map(([t, v, s]) => (
            <div key={t} className="statCard cardSurface">
              <div className="typeCaption">{t}</div>
              <div className="typeDisplay statNum">{v}</div>
              <div className="typeBodySmall textMuted">{s}</div>
            </div>
          ))}
        </div>

        <section className="cardSurface blockPad">
          <h2 className="typeH2">Praegused ja tulevased broneeringud</h2>
          <div className="tableWrap">
            <table className="dataTable">
              <thead>
                <tr>
                  <th>Lemmik</th>
                  <th>Hoidja</th>
                  <th>Kuupäevad</th>
                  <th>Summa</th>
                  <th>Olek</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.pet + b.dates}>
                    <td>{b.pet}</td>
                    <td>{b.sitter}</td>
                    <td>{b.dates}</td>
                    <td>{b.price}</td>
                    <td>
                      <span className={`statusPill ${b.status}`}>{b.status}</span>
                    </td>
                    <td>
                      <button type="button" className="btnBase btnOutline btnSm">
                        Vaata
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="dashTwoCol">
          <section className="cardSurface blockPad">
            <h2 className="typeH3">Minu lemmikud</h2>
            <ul className="petList">
              {pets.map((p) => (
                <li key={p.name} className="petRow">
                  <div className="petThumb" aria-hidden="true" />
                  <div>
                    <div className="typeBody">
                      <strong>{p.name}</strong>, {p.type} • {p.age}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <button type="button" className="addPetDashed">
              + Lisa uus lemmik
            </button>
          </section>

          <section className="cardSurface blockPad">
            <h2 className="typeH3">Hiljutised sõnumid</h2>
            <div className="tableWrap">
              <table className="dataTable">
                <thead>
                  <tr>
                    <th>Saatja</th>
                    <th>Eelvaade</th>
                    <th>Aeg</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((m) => (
                    <tr key={m.from + m.time}>
                      <td>{m.from}</td>
                      <td>{m.preview}</td>
                      <td>{m.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
