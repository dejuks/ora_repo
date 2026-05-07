import React, { useEffect, useMemo, useState } from "react";
import libraryApi from "../../api/library.api.js";
import { CardGrid, Message, PageShell, QuickLinks, SectionCard, SimpleTable, StatCard } from "./LibraryUi.jsx";

function uniqueResources(cards = [], tables = []) {
  const names = [];
  cards.forEach((card) => { if (card.resource) names.push(card.resource); });
  tables.forEach((table) => { if (table.resource) names.push(table.resource); });
  return [...new Set(names)];
}

export default function LibraryWorkspacePage({
  title,
  subtitle,
  cards = [],
  quickLinks = [],
  tables = [],
  notes = [],
}) {
  const resources = useMemo(() => uniqueResources(cards, tables), [cards, tables]);
  const [payload, setPayload] = useState({ loading: true, error: '', data: {} });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const entries = await Promise.all(resources.map(async (resource) => {
          try {
            const result = await libraryApi.list(resource, { limit: 12 });
            return [resource, result?.rows || []];
          } catch {
            return [resource, []];
          }
        }));
        if (mounted) setPayload({ loading: false, error: '', data: Object.fromEntries(entries) });
      } catch (err) {
        if (mounted) setPayload({ loading: false, error: err?.response?.data?.message || err?.message || 'Failed to load workspace.', data: {} });
      }
    })();
    return () => { mounted = false; };
  }, [resources.join('|')]);

  const getCount = (card) => {
    if (typeof card.value === 'function') return card.value(payload.data);
    if (card.value !== undefined) return card.value;
    if (card.resource) return payload.data[card.resource]?.length || 0;
    return 0;
  };

  return (
    <PageShell title={title} subtitle={subtitle}>
      {payload.error ? <Message kind="error">{payload.error}</Message> : null}

      {cards.length ? (
        <CardGrid>
          {cards.map((card) => (
            <StatCard key={card.label} label={card.label} value={getCount(card)} hint={card.hint} />
          ))}
        </CardGrid>
      ) : null}

      {quickLinks.length ? (
        <SectionCard title="Quick links">
          <QuickLinks links={quickLinks} />
        </SectionCard>
      ) : null}

      {tables.map((table) => (
        <SectionCard key={table.title} title={table.title}>
          <SimpleTable
            rows={table.rows ? table.rows(payload.data) : (payload.data[table.resource] || [])}
            columns={table.columns}
            emptyText={payload.loading ? 'Loading records...' : (table.emptyText || 'No records found.')}
          />
        </SectionCard>
      ))}

      {notes.length ? (
        <SectionCard title="What to do on this page">
          <ul style={{ margin: 0, paddingLeft: 18, color: '#374151', lineHeight: 1.7 }}>
            {notes.map((note) => <li key={note}>{note}</li>)}
          </ul>
        </SectionCard>
      ) : null}
    </PageShell>
  );
}
