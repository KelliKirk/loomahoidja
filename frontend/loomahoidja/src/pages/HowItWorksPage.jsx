import AppHeader from '../components/AppHeader'

export default function HowItWorksPage() {
  return (
    <div className="pageShell">
      <AppHeader />
      <main className="pageMain narrow">
        <h1 className="typeH1">Kuidas see töötab</h1>
        <ol className="stepsList typeBody">
          <li>Loo konto omaniku või hoidjana.</li>
          <li>Omanik leiab sobiva hoidja linna, looma tüübi ja hinna järgi.</li>
          <li>Broneeringu ajal näed saadaval olevaid päevi; hõivatud päevad on lukus.</li>
          <li>Pärast kinnitust jagatakse täpne asukoht.</li>
        </ol>
      </main>
    </div>
  )
}
