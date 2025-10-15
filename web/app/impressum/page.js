// Impressum page - German legal requirement

export default function ImpressumPage() {
    return (
        <div className="section">
            <div className="container">
                <h1 className="heading-1">Impressum</h1>

                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2>Angaben gemäß § 5 TMG</h2>

                    <h3>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</h3>
                    <p>
                        Vallit<br />
                        [Ihr Name]<br />
                        [Straße und Hausnummer]<br />
                        [PLZ] [Ort]
                    </p>

                    <h3>Kontakt:</h3>
                    <p>
                        Telefon: [Ihre Telefonnummer]<br />
                        E-Mail: [Ihre E-Mail-Adresse]
                    </p>

                    <h3>Umsatzsteuer-ID:</h3>
                    <p>
                        Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
                        [Ihre USt-IdNr.]
                    </p>

                    <h2>Haftung für Inhalte</h2>
                    <p>
                        Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf
                        diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
                    </p>

                    <h2>Haftung für Links</h2>
                    <p>
                        Unser Angebot enthält Links zu externen Websites Dritter, auf deren
                        Inhalte wir keinen Einfluss haben.
                    </p>

                    <h2>Urheberrecht</h2>
                    <p>
                        Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen
                        Seiten unterliegen dem deutschen Urheberrecht.
                    </p>
                </div>
            </div>
        </div>
    )
}
