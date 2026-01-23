-- Migration: Update Company Knowledge Base with CEO Feedback
-- Run this in your Supabase SQL Editor

DO $$
DECLARE
    v_company_id UUID;
BEGIN
    -- 1. Get the company ID (Assumes single company or picks the first one)
    SELECT id INTO v_company_id FROM public.companies LIMIT 1;

    -- If no company exists, we can't insert. In a real scenario, we might want to raise an error or create one.
    -- For this script, we'll proceed only if found.
    IF v_company_id IS NOT NULL THEN

        -- 2. Remove old/outdated entries to prevent duplicates or conflicts
        -- We'll delete based on titles if they exist, or generic cleanup for these specific topics
        DELETE FROM public.company_knowledge_base 
        WHERE company_id = v_company_id 
        AND title IN ('Über WTM & Philosophie', 'Angebotene Seminare', 'Das WTM Team', 'WTM Philosophy', 'WTM Team', 'WTM Seminars');

        -- 3. Insert Case 1: WTM Philosophie (About WTM)
        INSERT INTO public.company_knowledge_base (company_id, title, content, is_active)
        VALUES (
            v_company_id,
            'Über WTM & Philosophie',
            'WTM zeichnet sich durch die Philosophie "Selbstkompetenz erzeugt Haltung" aus. Dies bedeutet, dass der Fokus auf der Stärkung der Selbstwahrnehmung und inneren Haltung liegt, anstatt nur oberflächliche Techniken zu lehren. Wir betonen eine lebendige Professionalität und eine persönliche Atmosphäre, in der wir Klienten auf Augenhöhe begegnen.

WTM bietet maßgeschneiderte und flexible Beratungsansätze, die auf den spezifischen Kontext abgestimmt sind. Unsere Seminare sind "teilnehmerzentriert", sodass wir die Inhalte immer live auf die konkreten Praxisfragen der Teilnehmenden ausrichten. Wir nutzen eine Vielzahl von Methoden wie systemische Beratung, um Respekt, Neugier, Verantwortung und Humor zu fördern. Wir verzichten auf standardisierte "PowerPoint-Lösungen".',
            true
        );

        -- 4. Insert Case 2: Seminare (Who & What)
        INSERT INTO public.company_knowledge_base (company_id, title, content, is_active)
        VALUES (
            v_company_id,
            'Angebotene Seminare',
            'WTM bietet Seminare für Fach- und Führungskräfte in Unternehmen an. Die Seminare können sich an Teilnehmer aus der ganzen Organisation richten, oder – je nach Thema – nur an die Führungskräfte. Zusätzlich bieten wir Workshops für Teams in Unternehmen an.

Die Seminarthemen kommen aus den Bereichen:
- Führung
- Change
- Gesundheit
- Kommunikation
- Management

Unsere Seminare sind Teil der Team-Entwicklungsmaßnahmen und helfen, kreative und systemische Problemlösungen zu fördern.',
            true
        );

        -- 5. Insert Case 3: Das WTM Team
        INSERT INTO public.company_knowledge_base (company_id, title, content, is_active)
        VALUES (
            v_company_id,
            'Das WTM Team',
            'Das WTM-Team wird von Dr. Till Reichert und Malte Werner geleitet. Sie stehen für hohe Qualität in Coaching, Training und Organisationsberatung.

Das Team besteht aus etwa 20 erfahrenen Coaches und Trainern, die neben ihrer Berufsausbildung zahlreiche Weiterbildungen gemacht haben, um als Business-Coach und Trainer zu arbeiten. Die beruflichen Hintergründe sind sehr unterschiedlich und reichen von Automotive über das Bankenwesen und Logistik bis hin zum Gesundheitswesen. Im Team sind viele unterschiedliche fachliche Hintergründe abgebildet, vom Ingenieur über die Juristin bis hin zum Polizisten.',
            true
        );

    ELSE
        RAISE NOTICE 'No company found in public.companies table. Please create a company first.';
    END IF;
END $$;
