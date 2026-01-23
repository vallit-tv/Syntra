-- Clean up old placeholder data
DELETE FROM public.seminar_qa WHERE id IS NOT NULL;

-- Insert real seminar data
INSERT INTO public.seminar_qa (seminar_name, question, answer, keywords, category) VALUES

-- FÜHRUNG
('Führen durch Persönlichkeit', 'Was lerne ich im Seminar Führen durch Persönlichkeit?', 'Dieses Seminar richtet sich an Führungskräfte. ||| Sie entwickeln eine klare Haltung zur Führung, die über reine Tools und Methoden hinausgeht. ||| Die Dauer und das Format vereinbaren wir individuell mit Ihnen.', ARRAY['führen', 'persönlichkeit', 'haltung'], 'Führung'),

('Führen in Beziehung', 'Für wen ist Führen in Beziehung gedacht?', 'Das Seminar ist ideal, wenn Sie auf Augenhöhe führen möchten, ohne reine Positionsmacht. ||| Es stärkt Ihre persönliche Autorität durch Beziehungskompetenz. ||| Dauer und Format sind individuell anpassbar.', ARRAY['beziehung', 'augenhöhe', 'autorität'], 'Führung'),

('Führen zwischen Agieren und Reagieren', 'Worum geht es bei Führen zwischen Agieren und Reagieren?', 'Es geht um Selbsterfahrung und Ihre Wirkung als Führungskraft. ||| Ein Schwerpunkt ist die Passung zwischen Führungskraft und Mitarbeiter sowie Feedback-Kompetenz. ||| Wir gestalten Dauer und Format individuell.', ARRAY['agieren', 'reagieren', 'wirkung', 'feedback'], 'Führung'),

('Vom Mitarbeiter zur Führungskraft', 'Was bietet das Seminar für neue Führungskräfte?', 'Dieses Seminar ist perfekt für erstmalige Führungskräfte. ||| Es gibt Ihnen Sicherheit in der neuen Rolle und bereitet Sie optimal auf die ersten 100 Tage vor. ||| Zeitrahmen individuell vereinbar.', ARRAY['neue führungskraft', 'rollenwechsel', 'aufstieg'], 'Führung'),

('Delegation', 'Was bringt mir das Seminar Delegation?', 'Es richtet sich an Führungskräfte mit oder ohne Personalverantwortung. ||| Sie lernen situative Delegationsmethoden, um Aufgaben wirksam abzugeben. ||| Das Format wird individuell abgestimmt.', ARRAY['delegation', 'aufgaben', 'abgeben'], 'Führung'),

('Laterales Führen', 'Was ist Laterales Führen?', 'Dieses 2-Tages-Seminar (14 Stunden) richtet sich an alle, die Teams ohne formale Hierarchie führen. ||| Sie lernen, wie Sie ohne "Macht" wirksam Einfluss nehmen und führen können.', ARRAY['lateral', 'ohne macht', 'hierarchie'], 'Führung'),

('Führungssimulation', 'Was passiert in der Führungssimulation?', 'Spezialisiert für Führungskräfte im Gesundheitswesen. ||| Wir üben schwierige Führungssituationen in einem geschützten Rahmen. ||| Dauer und Ablauf werden individuell geplant.', ARRAY['simulation', 'gesundheitswesen', 'übung'], 'Führung'),

('Multiple Leadership', 'Was bedeutet Multiple Leadership?', 'Gedacht für Führung in agilen Umfeldern. ||| Sie entwickeln ein multidimensionales Führungsverständnis für komplexe Strukturen. ||| Format: Individuell.', ARRAY['agile', 'multiple', 'komplexität'], 'Führung'),

('Führung mit KI', 'Lerne ich KI im Führungsalltag nutzen?', 'Ja, in diesem 1,5-Tages-Kurs (10 Stunden) für (angehende) Führungskräfte. ||| Sie integrieren KI-gestützte Tools direkt in Ihren Führungsalltag.', ARRAY['ki', 'ai', 'künstliche intelligenz'], 'Führung'),

('Gesundheitsorientiertes Führen', 'Wer sollte Gesundheitsorientiertes Führen besuchen?', 'Geschäftsführer, Führungskräfte und Projektleiter. ||| Ziel ist der Aufbau einer gesundheitsförderlichen Unternehmenskultur. ||| Individuell vereinbar.', ARRAY['gesundheit', 'kultur', 'care'], 'Führung'),


-- CHANGE & TRANSFORMATION
('Change Kompetenz', 'Für wen ist Change Kompetenz?', 'Für alle, die konstruktiv mit Veränderungen umgehen wollen. ||| Sie lernen, Wandel nicht als Bedrohung, sondern als gestaltbar zu erleben. ||| Individuell planbar.', ARRAY['change', 'wandel', 'veränderung'], 'Change'),

('Change-Kommunikation', 'Worum geht es bei Change-Kommunikation?', 'Für GF, Führungskräfte, HR und Kommunikationsexperten. ||| Sie lernen die professionelle Steuerung von Kommunikation in Change-Prozessen. ||| Format individuell.', ARRAY['kommunikation', 'change', 'steuerung'], 'Change'),

('Digitalisierung & Transformation', 'Was lerne ich zu Digitalisierung?', 'Ein 2-Tages-Kurs für Mitarbeiter. ||| Vermittelt Grundverständnis für digitale Transformation und praktische KI-Tools.', ARRAY['digitalisierung', 'transformation', 'ki'], 'Change'),

('Hybrides Arbeiten', 'Wie läuft das Seminar Hybrides Arbeiten?', 'Für alle geeignet, bestehend aus 3-4 Online-Modulen. ||| Stärkt Ihre Selbst-, Team- und Prozesskompetenz in hybriden Arbeitswelten.', ARRAY['hybrid', 'online', 'remote'], 'Change'),

('Remote Working', 'Ist Remote Working für mich?', 'Für Remote-Mitarbeiter, Führungskräfte und Betriebsräte. ||| Vermittelt umfassende Kenntnisse für erfolgreiches Arbeiten im Homeoffice/Remote. ||| Individuell.', ARRAY['remote', 'homeoffice', 'virtuell'], 'Change'),


-- SELBSTMANAGEMENT & GESUNDHEIT
('Selbstmanagement', 'Was bringt das Seminar Selbstmanagement?', 'Für alle Zielgruppen. ||| Sie verbessern Ihre Selbststeuerung und lernen, typische Zeit- und Energiefallen zu vermeiden. ||| Individuell.', ARRAY['selbstmanagement', 'steuerung', 'effizienz'], 'Gesundheit'),

('Gesunde Selbstführung', 'Worum geht es bei Gesunder Selbstführung?', 'Für alle, die inneres Gleichgewicht und besseres Stressmanagement suchen. ||| Lernen Sie, gesund und leistungsfähig zu bleiben. ||| Format individuell.', ARRAY['selbstführung', 'stress', 'gleichgewicht'], 'Gesundheit'),

('Selbstmitgefühl', 'Was bedeutet Selbstmitgefühl im Seminar?', 'Für alle geeignet. ||| Es geht um konstruktive Lebensgestaltung und einen freundlichen Umgang mit sich selbst. ||| Individuell.', ARRAY['selbstmitgefühl', 'achtsamkeit', 'resilienz'], 'Gesundheit'),

('Selbstvertrauen', 'Wie hilft mir das Seminar Selbstvertrauen?', 'Es erhöht Ihre Leistungsfähigkeit durch gestärktes Vertrauen in die eigenen Fähigkeiten. ||| Für alle Zielgruppen geeignet. ||| Individuell.', ARRAY['vertrauen', 'leistung', 'mut'], 'Gesundheit'),

('Selbstsicherheit und Durchsetzung', 'Wer braucht Selbstsicherheit und Durchsetzung?', 'Coaches, Berater und Führungskräfte. ||| Sie gewinnen Stabilität und Souveränität in Konfliktsituationen. ||| Individuell.', ARRAY['durchsetzung', 'konflikt', 'sicherheit'], 'Gesundheit'),

('Selbstverantwortung und Kritikkompetenz', 'Was lerne ich bei Kritikkompetenz?', 'Für Mitarbeiter und Führungskräfte. ||| Der Fokus liegt auf dem konstruktiven Umgang mit Kritik und der Übernahme von Verantwortung. ||| Individuell.', ARRAY['kritik', 'verantwortung', 'feedback'], 'Gesundheit'),

('Widerstandsfähigkeit', 'Was ist das Ziel von Widerstandsfähigkeit?', 'Für alle. ||| Wir stärken Ihre Resilienz und helfen Ihnen, Denkfallen zu erkennen und zu überwinden. ||| Individuell.', ARRAY['resilienz', 'widerstand', 'stärke'], 'Gesundheit'),

('Scheitern als Kunst', 'Warum ein Seminar über Scheitern?', 'Für alle, die Wendepunkte nutzen wollen. ||| Begreifen Sie Scheitern als Chance für persönliches Wachstum. ||| Individuell.', ARRAY['scheitern', 'fehler', 'wachstum'], 'Gesundheit'),

('Zeitmanagement', 'Wie hilft mir das Seminar Zeitmanagement?', 'Für alle, die ihre Arbeitsorganisation verbessern wollen. ||| Lernen Sie Methoden für mehr Struktur und Fokus. ||| Individuell.', ARRAY['zeit', 'organisation', 'struktur'], 'Gesundheit'),

('Körperliche und geistige Fitness', 'Geht es um Sport?', 'Für alle. ||| Wir fördern mentale Fitness durch gezielte Körperübungen. ||| Format individuell.', ARRAY['fitness', 'mental', 'körper'], 'Gesundheit'),

('Berufliche Orientierung 30plus', 'Was ist Orientierung 30plus?', 'Für "Berufsanfänger" mit erster Erfahrung. ||| Eine Standortbestimmung zur beruflichen Weiterentwicklung. ||| Individuell.', ARRAY['30plus', 'orientierung', 'karriere'], 'Gesundheit'),

('Berufliche Orientierung 40plus', 'Worum geht es bei 40plus?', 'Für Mitarbeiter in der Lebensmitte. ||| Erarbeitung neuer persönlicher und beruflicher Zukunftsperspektiven. ||| Individuell.', ARRAY['40plus', 'orientierung', 'perspektive'], 'Gesundheit'),

('Berufliche Orientierung 50plus', 'Was bietet 50plus?', 'Für Mitarbeiter ab 50. ||| Fokus auf die Balance zwischen beruflichen und persönlichen Zielen. ||| Individuell.', ARRAY['50plus', 'balance', 'erfahrung'], 'Gesundheit'),

('Berufliche Orientierung 60plus', 'Lohnt sich 60plus noch?', 'Absolut. Für den Übergang in den Ruhestand. ||| Wir gestalten diesen Übergang aktiv und positiv. ||| Individuell.', ARRAY['60plus', 'ruhestand', 'übergang'], 'Gesundheit'),

('Selbstmanagement mit Pferden', 'Was mache ich mit Pferden?', 'Ein Training zur Selbstmotivation für alle. ||| Wir nutzen pferdegestütztes ZRM-Training (Zürcher Ressourcen Modell). ||| Individuell.', ARRAY['pferde', 'zrm', 'motivation'], 'Gesundheit'),


-- KOMMUNIKATION
('Kommunikation', 'Was lerne ich im Basisseminar Kommunikation?', 'Für alle geeignet. ||| Ziel ist eine stimmige, authentische Kommunikation in allen Lagen. ||| Individuell.', ARRAY['kommunikation', 'authentisch', 'basis'], 'Kommunikation'),

('Fragetechniken', 'Warum ein Seminar für Fragetechniken?', 'Für neugierige Menschen. ||| Wer fragt, führt. Verbessern Sie Ihre Gesprächsführung durch gezielte Fragen. ||| Individuell.', ARRAY['fragen', 'gespräch', 'technik'], 'Kommunikation'),

('Rhetorik', 'Für wen ist Rhetorik?', 'Für alle, die vortragen müssen. ||| Lernen Sie, wirksame und fesselnde Präsentationen zu halten. ||| Individuell.', ARRAY['rhetorik', 'vortrag', 'reden'], 'Kommunikation'),

('Präsentieren', 'Was ist der Fokus bei Präsentieren?', 'Für alle. ||| Es geht darum, komplexe Inhalte verständlich und überzeugend zu erklären. ||| Individuell.', ARRAY['präsentieren', 'erklären', 'verständlich'], 'Kommunikation'),

('Stimme und Körpersprache', 'Wie wichtig sind Stimme und Körper?', 'Für alle. ||| Eine verbesserte Außenwirkung erreichen Sie durch bewussten Einsatz von Stimme und Körpersprache. ||| Individuell.', ARRAY['stimme', 'körper', 'wirkung'], 'Kommunikation'),

('Argumentieren und Verhandeln', 'Wer sollte Verhandeln lernen?', 'Alle mit Einfluss. ||| Lernen Sie stimmige Kommunikation, um Ihre Ziele zu erreichen. ||| Individuell.', ARRAY['verhandeln', 'argumentieren', 'einfluss'], 'Kommunikation'),

('Medientraining', 'Wie läuft das Medientraining ab?', 'Für GF, Führungskräfte und Kommunikationsprofis. ||| Ca. 6 Stunden intensives Training für professionelles Auftreten vor der Kamera und Presse.', ARRAY['medien', 'kamera', 'presse'], 'Kommunikation'),

('Krisenkommunikation', 'Was lerne ich in Krisenkommunikation?', 'Für GF, Führungskräfte und HR. ||| Sie lernen, Krisen kommunikativ sicher zu managen und Schaden abzuwenden. ||| Individuell.', ARRAY['krise', 'kommunikation', 'management'], 'Kommunikation'),

('Schriftliche Kommunikation', 'Brauche ich ein Seminar fürs Schreiben?', 'Für alle. ||| Wir trainieren einen modernen, verständlichen Schreibstil für E-Mails und Dokumente. ||| Individuell.', ARRAY['scheiben', 'email', 'stil'], 'Kommunikation'),

('Feedback', 'Was ist das Feedback-Seminar?', 'Ein interaktives Format für Führungskräfte aller Ebenen. ||| Nutzen Sie 360°-Feedback gezielt für die Teamentwicklung. ||| Individuell.', ARRAY['feedback', '360 grad', 'team'], 'Kommunikation'),


-- MANAGEMENT & METHODEN
('Projektmanagement', 'Was lerne ich im Projektmanagement?', 'Für Projektleiter und Team-Mitglieder. ||| 2 Tage systematisches Vorgehen für erfolgreiche Projekte.', ARRAY['projekt', 'management', 'pm'], 'Management'),

('Krisenmanagement', 'Wie hilft mir Krisenmanagement?', 'Für Projektmanager. ||| Gewinnen Sie Souveränität in Projektkrisen und lernen Sie Rettungsstrategien. ||| Individuell.', ARRAY['krise', 'projekt', 'rettung'], 'Management'),

('Besprechungsmanagement', 'Wie optimiere ich Meetings?', 'Für Projektleiter, Führungskräfte und Sitzungsleiter. ||| Lernen Sie strukturierte Meeting-Durchführung für mehr Effizienz. ||| Individuell.', ARRAY['meeting', 'besprechung', 'effizienz'], 'Management'),

('Moderation', 'Was beinhaltet das Moderations-Seminar?', 'Für Moderatoren, PL und Führungskräfte. ||| Entwickeln Sie professionelle Moderationskompetenz für Workshops und Meetings. ||| Individuell.', ARRAY['moderation', 'workshop', 'leitung'], 'Management'),

('8D-Problemlösung', 'Was ist 8D-Problemlösung?', 'Für Entwicklung, Produktion und QS. ||| Eine Methode zur nachhaltigen, dokumentierten Problemlösung. ||| Individuell.', ARRAY['8d', 'problem', 'qualität'], 'Management'),

('BWL für Nicht-BWLer', 'Ist BWL für Nicht-BWLer schwer?', 'Nein, es ist für Fachfremde konzipiert. ||| Sie lernen die Basics, um kompetent mit BWLern zu kommunizieren. ||| Individuell.', ARRAY['bwl', 'finanzen', 'wirtschaft'], 'Management'),

('Betriebsorganisation', 'Worum geht es bei Betriebsorganisation?', 'Für Orga-Mitarbeiter und Projektleiter. ||| Sie lernen, Prozesse effektiv zu analysieren und neu zu gestalten. ||| Individuell.', ARRAY['organisation', 'prozesse', 'struktur'], 'Management'),

('Kreativitätstechniken', 'Welche Kreativitätstechniken lerne ich?', 'Für Projektleiter und Führungskräfte. ||| Systematische Ideenfindung durch bewährte Methoden (Design Thinking etc.). ||| Individuell.', ARRAY['kreativität', 'ideen', 'innovation'], 'Management'),

('Mind Mapping', 'Wie nutze ich Mind Mapping professionell?', 'Für Leitungsfunktionen. ||| Nutzen Sie Mind Mapping für bessere Strukturierung und Effizienz im Alltag. ||| Individuell.', ARRAY['mind map', 'struktur', 'planung'], 'Management'),

('Effektives Lesen', 'Was bringt Effektives Lesen?', 'Für Vielleser. ||| Steigern Sie Ihre Leseleistung um 80-100% bei gleichem Verständnis. ||| Individuell.', ARRAY['lesen', 'speed reading', 'effizienz'], 'Management'),

('Kompetenz für Komplexität', 'Wie meistere ich Komplexität?', 'Für Entscheider. ||| Lernen Sie, in komplexen Situationen bessere und sicherere Entscheidungen zu treffen. ||| Individuell.', ARRAY['komplexität', 'entscheidung', 'vuca'], 'Management'),


-- TEAM & ZUSAMMENARBEIT
('Gruppendynamik in Teams', 'Was ist Gruppendynamik?', 'Für alle Teaminteressierten. ||| Verstehen Sie Teamsteuerung und die psychologischen Prozesse in Gruppen. ||| Individuell.', ARRAY['team', 'gruppe', 'dynamik'], 'Team'),

('Konflikterkennung und -behandlung', 'Wie löse ich Konflikte im Team?', 'Für Mitarbeiter und Führungskräfte. ||| Lernen Sie Konflikte frühzeitig zu erkennen und konstruktiv zu behandeln. ||| Individuell.', ARRAY['konflikt', 'team', 'lösung'], 'Team'),

('Vertrauen', 'Wie baue ich Vertrauen im Team auf?', 'Für Teaminteressierte. ||| Lernen Sie Vertrauen als wesentliche Kraftquelle für Zusammenarbeit zu nutzen. ||| Individuell.', ARRAY['vertrauen', 'team', 'kultur'], 'Team'),

('Young and Old', 'Worum geht es bei Young and Old?', 'Für Trainees, Quereinsteiger und Mentoren. ||| Es geht um generationsübergreifende Integration und gegenseitiges Verständnis. ||| Format: Mentoring.', ARRAY['generationen', 'alt', 'jung'], 'Team'),


-- AUSBILDUNGEN
('Trainerausbildung', 'Wie läuft die Trainerausbildung ab?', 'Für Weiterbildner und Führungskräfte. ||| Umfasst 7 Module bis zum zertifizierten Trainer.', ARRAY['trainer', 'ausbildung', 'zertifikat'], 'Ausbildung'),

('Beraterausbildung', 'Was beinhaltet die Beraterausbildung?', 'Für Coaches und Berater. ||| 6 Module, die zum ICF-zertifizierten Coach/Berater führen.', ARRAY['berater', 'consulting', 'icf'], 'Ausbildung'),

('Coaching Basics für Agile Masters', 'Ist das Seminar für Scrum Master?', 'Ja, speziell für Scrum Master und Agile Coaches. ||| Sie lernen, eine professionelle Coaching-Haltung in Ihre Rolle zu integrieren. ||| Individuell.', ARRAY['agile', 'scrum', 'coaching'], 'Ausbildung'),


-- VERTRIEB & SPEZIAL
('Remote Selling', 'Was lerne ich bei Remote Selling?', 'Für Vertriebsmitarbeiter. ||| 4 Stunden Live-Online-Training für erfolgreiche Kundenkontakte über Video. |||', ARRAY['remote', 'verkauf', 'online'], 'Vertrieb'),

('Verkaufen Reloaded', 'Was ist Verkaufen Reloaded?', 'Für Verkäufer. ||| Finden und schärfen Sie Ihren ganz eigenen, authentischen Verkaufsstil. ||| Individuell.', ARRAY['verkauf', 'vertrieb', 'stil'], 'Vertrieb'),

('Bewerbertraining', 'Was bringt mir das Bewerbertraining?', 'Für Bewerber. ||| Wir trainieren die professionelle Bewerbung und das Vorstellungsgespräch. ||| Individuell.', ARRAY['bewerbung', 'job', 'karriere'], 'Vertrieb'),

('Soft Skills für Controller', 'Was lernen Controller hier?', 'Für Zahlenprofis. ||| Verbessern Sie die Zusammenarbeit und Kommunikation mit Nicht-BWLern. ||| Individuell.', ARRAY['controller', 'soft skills', 'kommunikation'], 'Vertrieb'),

('Visualisieren am Flipchart', 'Lerne ich zeichnen?', 'Für alle Präsentierenden. ||| Sie lernen, ansprechende Flipcharts zu erstellen, die Inhalte visualisieren. ||| Individuell.', ARRAY['visualisieren', 'flipchart', 'zeichnen'], 'Vertrieb'),

('Intuition', 'Worum geht es bei Intuition?', 'Zur mentalen Erweiterung. ||| Lernen Sie, bessere Entscheidungen durch Zugriff auf Ihre Intuition zu treffen. ||| Individuell.', ARRAY['intuition', 'bauchgefühl', 'entscheidung'], 'Vertrieb'),

('Genius', 'Was ist das Genius Seminar?', 'Zur Selbstfindung. ||| Entdecken Sie Ihre eigene, einzigartige Begabung und Ihr Potenzial. ||| Individuell.', ARRAY['genius', 'begabung', 'potenzial'], 'Vertrieb'),

('Abschied, Abschluss, Ausblick', 'Wofür ist dieses Seminar?', 'Für alle, die vor einem Wechsel stehen. ||| Lernen Sie, Abschiede bewusst zu gestalten und Neues zu begrüßen. ||| Individuell.', ARRAY['abschied', 'neubeginn', 'wechsel'], 'Vertrieb'),

('Perspektivenwechsel (Chef führen)', 'Wie führe ich meinen Chef?', 'Für Mitarbeiter. ||| Lernen Sie durch Perspektivenwechsel eine bessere Zusammenarbeit mit Vorgesetzten. ||| Individuell.', ARRAY['chef', 'perspektive', 'zusammenarbeit'], 'Vertrieb'),

('Arbeitsrecht und Kommunikation', 'Ist das eine Rechtsberatung?', 'Nein, für Führungskräfte. ||| Es geht darum, rechtssicher und zugleich menschlich zu kommunizieren. ||| Individuell.', ARRAY['recht', 'kommunikation', 'arbeitsrecht'], 'Vertrieb');

-- Add warning note to all answers regarding flexibility
UPDATE public.seminar_qa 
SET answer = answer || ' ||| Hinweis: Preis, Methode und Dauer legen wir gemeinsam in der Auftragsklärung fest.';
