-- Create seminar_qa table for chatbot Q&A system
CREATE TABLE IF NOT EXISTS public.seminar_qa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seminar_name TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    keywords TEXT[] DEFAULT '{}',
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_seminar_qa_keywords ON public.seminar_qa USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_seminar_qa_seminar_name ON public.seminar_qa(seminar_name);

-- Enable RLS
ALTER TABLE public.seminar_qa ENABLE ROW LEVEL SECURITY;

-- Policies (Public read, Authenticated write)
CREATE POLICY "Enable read access for all users" ON public.seminar_qa FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.seminar_qa FOR INSERT WITH CHECK (auth.role() IN ('authenticated', 'service_role'));
CREATE POLICY "Enable update for authenticated users only" ON public.seminar_qa FOR UPDATE USING (auth.role() IN ('authenticated', 'service_role'));
CREATE POLICY "Enable delete for authenticated users only" ON public.seminar_qa FOR DELETE USING (auth.role() IN ('authenticated', 'service_role'));

-- Insert initial seminar data (Placeholders to be filled by CEO/User)
INSERT INTO public.seminar_qa (seminar_name, question, answer, keywords, category) VALUES
('Führen in Beziehung', 'Was lerne ich im Seminar Führen in Beziehung?', 'In diesem Seminar lernen Sie, wie Sie Beziehungen zu Ihren Mitarbeitern stärken, Vertrauen aufbauen und durch emotionale Intelligenz führen. Es ist ideal für Führungskräfte, die ihre soziale Kompetenz erweitern möchten.', ARRAY['führen in beziehung', 'beziehung', 'vertrauen', 'soziale kompetenz'], 'Führung'),
('Berufliche Entwicklung 50+', 'Für wen ist das Seminar Berufliche Entwicklung 50+ geeignet?', 'Dieses Seminar richtet sich an erfahrene Mitarbeiter ab 50 Jahren, die ihre berufliche Zukunft aktiv gestalten, ihre Erfahrungswissen weitergeben und neue Motivation finden möchten.', ARRAY['50+', '50 plus', 'alter', 'entwicklung'], 'Entwicklung'),
('Kreativitätstechniken', 'Welche Methoden werden im Seminar Kreativitätstechniken vermittelt?', 'Wir vermitteln klassische und agile Methoden wie Design Thinking, Brainstorming-Varianten und Walt-Disney-Methode, um Innovationsprozesse in Teams zu fördern.', ARRAY['kreativität', 'innovation', 'design thinking'], 'Methoden'),
('Verkaufen Reloaded', 'Worum geht es bei Verkaufen Reloaded?', 'Verkaufen Reloaded bringt frischen Wind in Ihre Vertriebsstrategie. Wir fokussieren uns auf kundenzentrierte Kommunikation, modernes Verhandlungsgeschick und den Aufbau langfristiger Kundenbeziehungen.', ARRAY['verkauf', 'vertrieb', 'verhandeln'], 'Vertrieb'),
('Selbsterkenntnis und Selbstführung', 'Was ist das Ziel von Selbsterkenntnis und Selbstführung?', 'Ziel ist es, die eigenen Verhaltensmuster zu verstehen, Stärken zu stärken und blinde Flecken zu erkennen, um sich selbst und andere bewusster zu führen.', ARRAY['selbsterkenntnis', 'selbstführung', 'persönlichkeit'], 'Führung'),
('Mitarbeiterbefragung', 'Wie hilft das Seminar Mitarbeiterbefragung?', 'Sie lernen, professionelle Befragungen zu konzipieren, durchzuführen und vor allem: Die Ergebnisse erfolgreich in Maßnahmen umzusetzen, um die Mitarbeiterbindung zu erhöhen.', ARRAY['befragung', 'mitarbeiterbindung', 'feedback'], 'Management'),
('Gekonnt Visualisieren', 'Brauche ich Zeichentalent für Gekonnt Visualisieren?', 'Nein, absolut nicht! Wir zeigen Ihnen einfache Techniken (Flipchart, Sketchnotes), mit denen Sie komplexe Inhalte schnell und verständlich sichtbar machen können.', ARRAY['visualisieren', 'zeichnen', 'flipchart'], 'Kommunikation'),
('Change Management', 'Was sind die Inhalte des Change Seminars?', 'Wir behandeln Phasen von Veränderungsprozessen, Umgang mit Widerständen und Kommunikation in Krisenzeiten. Praktische Tools für Change Agents stehen im Mittelpunkt.', ARRAY['change', 'wandel', 'veränderung'], 'Change'),
('Führen zwischen Agieren und Reagieren', 'Was bedeutet Führen zwischen Agieren und Reagieren?', 'Es geht um die Balance zwischen proaktivem Handeln und situativem Reagieren. Sie trainieren, auch unter Druck souverän zu bleiben und Entscheidungen zu treffen.', ARRAY['agieren', 'reagieren', 'druck', 'entscheidung'], 'Führung'),
('Gesunde Selbstführung', 'Warum Gesunde Selbstführung?', 'Nur wer sich selbst gesund führt, kann auch andere gesund führen. Themen sind Stressmanagement, Resilienz und Achtsamkeit im Führungsalltag.', ARRAY['gesundheit', 'stress', 'resilienz'], 'Gesundheit'),
('Besprechungsmanagement', 'Wie verbessere ich meine Meetings?', 'Im Seminar Besprechungsmanagement lernen Sie, Meetings effizient zu moderieren, Ziele klar zu definieren und Ergebnisse zu sichern, damit Besprechungen keine Zeitfresser mehr sind.', ARRAY['meeting', 'besprechung', 'moderation'], 'Management'),
('Konflikterkennung', 'Wie gehe ich mit Konflikten um?', 'Wir trainieren, Konflikte frühzeitig zu erkennen, sie konstruktiv anzusprechen und Lösungen zu finden, bevor sie eskalieren. Ein Muss für jedes Team.', ARRAY['konflikt', 'streit', 'lösung'], 'Kommunikation'),
('Soft Skills für Controller', 'Ist das Seminar nur für Controller?', 'Der Fokus liegt auf Zahlenmenschen, die ihre kommunikativen Fähigkeiten verbessern wollen, um ihre Analysen überzeugender zu präsentieren und als Business Partner akzeptiert zu werden.', ARRAY['controller', 'zahlen', 'finance'], 'Soft Skills'),
('Intuition', 'Kann man Intuition lernen?', 'Wir zeigen Wege, wie Sie neben rationalen Daten auch Ihr Bauchgefühl professionell in Entscheidungsprozesse integrieren können.', ARRAY['intuition', 'bauchgefühl', 'entscheidung'], 'Soft Skills'),
('Remote Work', 'Wie gelingt Führung auf Distanz?', 'Das Seminar behandelt Tools und Haltung für virtuelle Führung. Wie halte ich das Team zusammen, wenn wir uns nicht sehen? Wie organisiere ich digitale Zusammenarbeit?', ARRAY['remote', 'homeoffice', 'virtuell'], 'Management'),
('Krisenkommunikation', 'Was tun, wenn es brennt?', 'Sie lernen, in Krisensituationen schnell, transparent und vertrauensbildend zu kommunizieren, um Reputationsschäden zu vermeiden.', ARRAY['krise', 'kommunikation', 'presse'], 'Kommunikation'),
('Hybrides Arbeiten', 'Was ist die Herausforderung bei hybridem Arbeiten?', 'Die Herausforderung liegt darin, Präsenz- und Remote-Mitarbeiter gleichermaßen einzubinden und faire Strukturen für alle zu schaffen.', ARRAY['hybrid', 'new work', 'büro'], 'Management'),
('Multiple Leadership', 'Was ist Multiple Leadership?', 'Führung ist heute mehrdimensional. Wir betrachten Führung aus verschiedenen Blickwinkeln: Fachlich, disziplinarisch, lateral und agil.', ARRAY['multiple leadership', 'mehrdimensional', 'matrix'], 'Führung'),
('Moderation', 'Wie leite ich Workshops?', 'Sie lernen Methoden, um Gruppenprozesse zu steuern, alle Teilnehmer zu aktivieren und gemeinsam zu tragfähigen Ergebnissen zu kommen.', ARRAY['moderation', 'workshop', 'gruppe'], 'Methoden'),
('Widerstandsfähigkeit stärken', 'Wie werde ich resilienter?', 'Wir arbeiten an Ihrer psychischen Widerstandskraft. Techniken zur Stressbewältigung und Einstellungänderung helfen, Krisen besser zu meistern.', ARRAY['resilienz', 'widerstand', 'stärke'], 'Gesundheit'),
('Führungskommunikation & Arbeitsrecht', 'Geht es um Paragraphen?', 'Es geht um die kommunikative Seite des Arbeitsrechts: Wie führe ich kritische Gespräche (Abmahnung, Kündigung) rechtssicher und menschlich korrekt?', ARRAY['arbeitsrecht', 'recht', 'gespräch'], 'Führung'),
('Zusammenarbeit von Generationen', 'Wie klappt Generationen-Mix?', 'Babyboomer trifft Gen Z. Wir fördern das Verständnis für unterschiedliche Werte und Arbeitsweisen, um Synergien im altersgemischten Team zu nutzen.', ARRAY['generationen', 'gen z', 'babyboomer'], 'Team'),
('Delegation', 'Warum fällt Delegieren schwer?', 'Oft fehlt Vertrauen oder Zeit. Wir zeigen, wie Sie Aufgaben so übergeben, dass Mitarbeiter wachsen und Sie entlastet werden.', ARRAY['delegation', 'abgeben', 'aufgaben'], 'Führung'),
('Trainerausbildung', 'Werde ich zertifizierter Trainer?', 'Unsere Trainerausbildung vermittelt fundiertes didaktisches Wissen, Methodenkompetenz und Bühnenpräsenz, um eigene Seminare professionell zu leiten.', ARRAY['trainer', 'ausbildung', 'didaktik'], 'Ausbildung'),
('Chefperspektive', 'Wie tickt mein Chef?', 'Ein Perspektivwechsel hilft, Entscheidungen der Geschäftsleitung besser zu verstehen und die eigene Argumentation daran anzupassen.', ARRAY['chef', 'management', 'vorstand'], 'Karriere'),
('Präsentieren', 'Wie präsentiere ich überzeugend?', 'Vom Aufbau der Story bis zum Einsatz von Körpersprache: Wir machen Sie fit für Ihren großen Auftritt vor Publikum.', ARRAY['präsentation', 'vortrag', 'bühne'], 'Kommunikation'),
('Erfolgsfaktor Vertrauen', 'Wie baue ich Vertrauen auf?', 'Vertrauen ist die Währung der Führung. Wir zeigen, wie Sie durch Transparenz, Verlässlichkeit und Integrität eine Vertrauenskultur schaffen.', ARRAY['vertrauen', 'kultur', 'team'], 'Führung'),
('Change Kommunikation', 'Wie kommuniziere ich Wandel?', 'Change scheitert oft an der Kommunikation. Lernen Sie, Botschaften klar zu senden, Ängste aufzufangen und Betroffene zu Beteiligten zu machen.', ARRAY['change', 'kommunikation', 'wandel'], 'Change'),
('Komplexität meistern', 'Wie gehe ich mit Komplexität um?', 'In einer VUCA-Welt helfen einfache Lösungen nicht. Wir trainieren systemisches Denken und agile Ansätze, um in komplexen Lagen handlungsfähig zu bleiben.', ARRAY['komplexität', 'vuca', 'systemisch'], 'Management'),
('Zeitmanagement', 'Wie organisiere ich mich besser?', 'Prioritäten setzen, Zeitdiebe eliminieren und Fokus behalten. Wir finden die Zeitmanagement-Methode, die zu Ihrem Typ passt.', ARRAY['zeit', 'organisation', 'effizienz'], 'Selbstmanagement'),
('Selbstmanagement', 'Wie führe ich mich selbst?', 'Selbstmanagement ist die Basis für alles. Wir arbeiten an Zielen, Motivation und der Strukturierung des eigenen Arbeitsalltags.', ARRAY['selbstmanagement', 'ziele', 'struktur'], 'Selbstmanagement'),
('Leistungsfähigkeit steigern', 'Geht es um Sport?', 'Auch, aber vor allem um die Balance aus Bewegung, Ernährung und mentaler Fitness, um im Job dauerhaft leistungsfähig zu bleiben ohne auszubrennen.', ARRAY['leistung', 'fitness', 'energie'], 'Gesundheit'),
('Gesundheitsorientiertes Führen', 'Was muss eine Führungskraft tun?', 'Führungskräfte haben Einfluss auf die Gesundheit ihrer Mitarbeiter. Lernen Sie Warnsignale erkennen und gesundheitsförderliche Rahmenbedingungen zu schaffen.', ARRAY['gesundheit', 'führen', 'care'], 'Führung'),
('Scheitern als Kunst', 'Darf man scheitern?', 'Ja! Fehlerkultur ist wichtig. Wir lernen, Scheitern als Lernchance zu begreifen und gestärkt aus Rückschlägen hervorzugehen.', ARRAY['scheitern', 'fehlerkultur', 'fuckup'], 'Mindset'),
('BWL für Nicht-BWLer', 'Muss ich rechnen können?', 'Grundrechenarten reichen. Wir erklären betriebswirtschaftliche Zusammenhänge (Bilanz, GuV, KPIs) einfach und verständlich für Fachkräfte ohne Finanzhintergrund.', ARRAY['bwl', 'finanzen', 'zahlen'], 'Wissen'),
('8D Problemlösung', 'Was ist 8D?', 'Eine strukturierte Methode zur Problemlösung im Qualitätsmanagement. Wir gehen die 8 Disziplinen Schritt für Schritt durch.', ARRAY['8d', 'problem', 'qualität'], 'Methoden'),
('Mit den Fragen', 'Wer fragt, führt?', 'Genau. Lernen Sie systemische Fragetechniken, um Gespräche zu lenken, Mitarbeiter zum Nachdenken anzuregen und Lösungen zu erarbeiten.', ARRAY['fragen', 'fragetechnik', 'gespräch'], 'Kommunikation'),
('Führen durch Persönlichkeit', 'Was macht eine Führungspersönlichkeit aus?', 'Nicht die Position, sondern die Haltung zählt. Wir arbeiten an Ihrem authentischen Auftreten und Ihrer persönlichen Wirkung.', ARRAY['persönlichkeit', 'charisma', 'wirkung'], 'Führung'),
('Projektmanagement Basis', 'Wie starte ich ein Projekt?', 'Von der Auftragsklärung über den Projektstrukturplan bis zum Abschluss. Das 1x1 des klassischen Projektmanagements.', ARRAY['projekt', 'pm', 'planung'], 'Management'),
('Selbstverantwortung & Kritik', 'Wie gehe ich mit Kritik um?', 'Kritik ist Feedback. Wir trainieren, Kritik anzunehmen ohne sich anzugreifen, und selbst konstruktiv Kritik zu üben.', ARRAY['kritik', 'feedback', 'verantwortung'], 'Soft Skills'),
('Krisenmanagement Projekte', 'Projekt in der Krise?', 'Wenn der Plan nicht mehr funktioniert, braucht es Notfallstrategien. Wir simulieren Projekkrisen und erarbeiten Rettungsmaßnahmen.', ARRAY['krise', 'projekt', 'notfall'], 'Management'),
('Selbstvertrauen', 'Wie werde ich selbstbewusster?', 'Selbstvertrauen kann man trainieren. Durch Übungen zur Selbstwirksamkeit und positiven Psychologie stärken wir Ihren Glauben an die eigenen Fähigkeiten.', ARRAY['selbstvertrauen', 'mut', 'stärke'], 'Mindset'),
('Laterales Führen', 'Führen ohne Weisungsbefugnis?', 'Genau das. Wie gewinne ich Kollegen für meine Ziele, wenn ich nicht ihr Chef bin? Überzeugung, Netzwerk und Diplomatie sind gefragt.', ARRAY['lateral', 'ohne macht', 'einfluss'], 'Führung'),
('Durchsetzungsvermögen', 'Muss ich laut sein?', 'Nein. Durchsetzungsstark ist, wer klar kommuniziert, Grenzen setzt und bei seinen Zielen bleibt, dabei aber respektvoll agiert.', ARRAY['durchsetzung', 'grenzen', 'klarheit'], 'Soft Skills'),
('Stimme und Körpersprache', 'Wie wirke ich?', 'Der Inhalt ist oft zweitrangig. Wir arbeiten an Ihrer Stimme, Haltung und Gestik, damit Ihre Botschaft auch wirklich ankommt.', ARRAY['stimme', 'körper', 'wirkung'], 'Kommunikation'),
('Berufliche Entwicklung 40+', 'Ist 40 die Mitte?', 'Oft eine Zeit der Bilanz. Wo stehe ich, wo will ich noch hin? Wir erarbeiten Strategien für die zweite Karrierehälfte.', ARRAY['40+', 'midlife', 'karriere'], 'Entwicklung'),
('Gesundheit allgemein', 'Was umfasst das Seminar Gesundheit?', 'Ein ganzheitlicher Blick auf physische und psychische Gesundheit im Arbeitskontext. Prävention steht im Vordergrund.', ARRAY['gesundheit', 'prävention', 'arbeit'], 'Gesundheit'),
('Coaching Basics Agile', 'Was ist agiles Coaching?', 'Grundlagen des Coachings kombiniert mit agilen Werten. Wie begleite ich Teams selbstorganisiert zum Erfolg?', ARRAY['coaching', 'agile', 'scrum'], 'Coaching'),
('Vom Mitarbeiter zur Führungskraft', 'Der Rollenwechsel', 'Gestern Kollege, heute Chef. Wir begleiten Sie in den ersten 100 Tagen und helfen, die neue Rolle zu finden und Akzeptanz zu schaffen.', ARRAY['aufstieg', 'teamleiter', 'rolle'], 'Führung'),
('Beraterausbildung', 'Wie werde ich Consultant?', 'Methodenkoffer, Auftragsklärung und Beraterhaltung. Alles was Sie brauchen, um interne oder externe Kunden professionell zu beraten.', ARRAY['berater', 'consulting', 'beratung'], 'Ausbildung'),
('Berufliche Entwicklung 30+', 'Karriereplanung mit 30?', 'Die erste Orientierung ist vorbei. Jetzt geht es um Spezialisierung oder Führung. Wir schärfen Ihr Profil.', ARRAY['30+', 'karriere', 'aufstieg'], 'Entwicklung'),
('Remote Selling', 'Verkaufen per Video?', 'Verkauf über Zoom & Co funktioniert anders. Wir trainieren Kamera-Präsenz, digitale Beziehungsarbeit und Online-Abschlusstechniken.', ARRAY['remote selling', 'verkauf', 'online'], 'Vertrieb'),
('Lebensphasen', 'Wie beeinflussen Lebensphasen den Job?', 'Jedes Alter hat andere Bedürfnisse und Potenziale. Eine lebensphasenorientierte Personalpolitik nutzt diese Vielfalt.', ARRAY['lebensphasen', 'alter', 'demografie'], 'HR'),
('Führungssimulation Krankenhaus', 'Warum Krankenhaus?', 'Ein Szenario unter Hochdruck. Hier lernen Sie Entscheidungsprozesse und Teamdynamik in Extremsituationen kennen – übertragbar auf jedes Business.', ARRAY['simulation', 'krankenhaus', 'entscheidung'], 'Führung'),
('Medientraining', 'Fit für die Presse?', 'Statements vor der Kamera, Interviews geben, Krisen-PKs meistern. Wir üben den souveränen Umgang mit Journalisten.', ARRAY['medien', 'presse', 'interview'], 'Kommunikation'),
('Zielgruppenspezifische Kommunikation', 'Wie spreche ich wen an?', 'Ob Azubi oder Vorstand – der Ton macht die Musik. Wir analysieren Zielgruppen und passen die Kommunikation passgenau an.', ARRAY['zielgruppe', 'ansprache', 'stil'], 'Kommunikation'),
('Rhetorik', 'Reden wie ein Profi?', 'Die Kunst der Rede. Aufbau, Stilfiguren und freies Sprechen stehen auf dem Programm, damit Sie Zuhörer fesseln.', ARRAY['rhetorik', 'reden', 'speech'], 'Kommunikation'),
('Mind Mapping', 'Mehr als bunte Bilder?', 'Ja, ein Gehirn-gerechtes Werkzeug zum Planen, Protokollieren und Lernen. Wir zeigen Profi-Tricks jenseits der Basics.', ARRAY['mind map', 'gedanken', 'struktur'], 'Methoden'),
('Leadership Basics', 'Der Einstieg in Führung', 'Grundlagen der Mitarbeiterführung: Gespräche führen, Ziele vereinbaren, motivieren. Das Rüstzeug für jede Führungskraft.', ARRAY['leadership', 'basics', 'grundlagen'], 'Führung'),
('Schriftliche Kommunikation', 'E-Mails die gelesen werden?', 'Wir texten klar, modern und empfängerorientiert. Weg vom Beamtendeutsch, hin zu frischer Korrespondenz.', ARRAY['schreiben', 'email', 'text'], 'Kommunikation'),
('Betriebsorganisation', 'Ist Struktur alles?', 'Gute Organisation spart Zeit und Geld. Wir schauen uns Prozesse, Abläufe und Schnittstellen an und optimieren sie.', ARRAY['organisation', 'prozesse', 'struktur'], 'Management'),
('Selbstmitgefühl', 'Ist das nicht egoistisch?', 'Nein, notwendig. Wer gut zu sich selbst ist, dämpft den inneren Kritiker und bleibt länger gesund und leistungsfähig.', ARRAY['selbstmitgefühl', 'self-care', 'achtsamkeit'], 'Gesundheit'),
('Genius', 'Was ist Genius?', 'Ein Programm zur Entfaltung des eigenen Potenzials. Finden Sie heraus, was wirklich in Ihnen steckt und wie Sie es auf die Straße bringen.', ARRAY['genius', 'potenzial', 'talent'], 'Persönlichkeit'),
('Coachingausbildung', 'Werden Sie Coach', 'Eine fundierte Ausbildung zum systemischen Coach. Theorie, Praxis und Selbsterfahrung für den professionellen Einsatz.', ARRAY['coach', 'ausbildung', 'systemisch'], 'Ausbildung'),
('Bewerbertraining', 'Fit fürs Vorstellungsgespräch?', 'Wir checken Unterlagen, trainieren das Gespräch und arbeiten an der Selbstpräsentation für den nächsten Karriereschritt.', ARRAY['bewerbung', 'job', 'interview'], 'Karriere'),
('Gruppendynamik', 'Was passiert im Team?', 'Verstehen Sie die unsichtbaren Regeln in Gruppen. Rollen, Phasen und Konflikte steuern lernen.', ARRAY['gruppe', 'team', 'dynamik'], 'Team'),
('Berufliche Entwicklung 60+', 'Noch was vor dem Ruhestand?', 'Der Übergang in die Rente will gestaltet sein. Wissenstransfer, Loslassen und neue Perspektiven für die Zeit danach.', ARRAY['60+', 'rente', 'übergang'], 'Entwicklung');
