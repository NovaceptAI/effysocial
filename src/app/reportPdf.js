// A campaign report as a PDF (launch plan 5.10, G42), built in the browser from the same
// report the page shows — for the business itself and for anyone given a share link.
// The standard PDF fonts can't draw ₹, so amounts read "INR 12,000". Unknown numbers
// print as a dash, never as 0. The PDF carries the business's name only.
const DASH = '—';

export const money = (n) => (n == null ? DASH : `INR ${Math.round(n).toLocaleString('en-IN')}`);
export const count = (n) => (n == null ? DASH : Math.round(n).toLocaleString('en-IN'));
const day = (iso) => (iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

export function reportFilename(report) {
  const slug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${slug(report.business.name) || 'report'}-${slug(report.campaign.name) || 'campaign'}-report.pdf`;
}

// The rows of numbers, shared by the PDF and anything that wants the same wording.
export function reportFigures(report) {
  const n = report.numbers;
  return [
    ['Spend', money(n.spend), n.budget ? `of ${money(n.budget)} budget${n.pacing != null ? ` (${n.pacing}%)` : ''}` : 'no budget set'],
    ['Leads', count(n.leads), `${count(n.qualified)} qualified, ${count(n.won)} won`],
    ['Cost per lead', money(n.cpl), n.cpl == null ? 'needs spend and leads' : 'spend / leads'],
    ['Revenue won', money(n.revenue), n.roas == null ? 'ROAS needs spend' : `ROAS ${n.roas}x`],
    ['Posts published', count(n.published), `${count(n.scheduled)} scheduled`],
    ['Reach', count(n.reach), n.engagement == null ? 'no published post has numbers yet' : `${n.engagement}% average engagement`],
  ];
}

export async function buildReportPdf(report, { sharedAt } = {}) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  let y = M;

  const ensure = (space) => {
    if (y + space > H - M) { doc.addPage(); y = M; }
  };
  const text = (value, x, size = 10, style = 'normal', color = [42, 35, 32]) => {
    doc.setFont('helvetica', style); doc.setFontSize(size); doc.setTextColor(...color);
    doc.text(String(value), x, y);
  };
  const paragraph = (value, size = 10, color = [111, 100, 92], width = W - 2 * M) => {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(size); doc.setTextColor(...color);
    const lines = doc.splitTextToSize(String(value), width);
    ensure(lines.length * (size + 4));
    doc.text(lines, M, y);
    y += lines.length * (size + 4);
  };
  const heading = (value) => {
    ensure(40); y += 14;
    text(value, M, 13, 'bold'); y += 8;
    doc.setDrawColor(236, 226, 214); doc.line(M, y, W - M, y); y += 16;
  };

  // Title block
  text(report.business.name, M, 20, 'bold'); y += 22;
  text(`Campaign report: ${report.campaign.name}`, M, 13, 'normal', [111, 100, 92]); y += 16;
  const period = [report.campaign.start && `from ${day(report.campaign.start)}`, report.campaign.end && `to ${day(report.campaign.end)}`].filter(Boolean).join(' ');
  paragraph([report.campaign.objective, report.campaign.status, period].filter(Boolean).join(' · '));
  paragraph(`Figures as of ${day(report.generatedAt)}${sharedAt ? `, shared ${day(sharedAt)}` : ''}.`, 9, [140, 129, 119]);

  heading('Results');
  // Two figures to a row: label, value, then a note under each.
  const colW = (W - 2 * M) / 2;
  const figures = reportFigures(report);
  for (let i = 0; i < figures.length; i += 2) {
    ensure(50);
    figures.slice(i, i + 2).forEach(([label, value, note], col) => {
      const x = M + col * colW;
      const top = y;
      text(label.toUpperCase(), x, 8, 'bold', [140, 129, 119]);
      y = top + 17; text(value, x, 15, 'bold');
      y = top + 30; text(note, x, 8.5, 'normal', [111, 100, 92]);
      y = top;
    });
    y += 50;
  }

  heading('From content to revenue');
  report.funnel.forEach((f) => {
    ensure(18);
    text(f.label, M, 10); text(count(f.value), W - M - 60, 10, 'bold');
    y += 18;
  });

  heading('Top content');
  if (report.topContent.length) {
    ensure(18);
    text('Post', M, 8.5, 'bold', [140, 129, 119]); text('Reach', W - M - 150, 8.5, 'bold', [140, 129, 119]);
    text('Engagement', W - M - 70, 8.5, 'bold', [140, 129, 119]); y += 16;
    report.topContent.forEach((p) => {
      const title = doc.splitTextToSize(`${p.title} (${p.type || 'post'})`, W - 2 * M - 170);
      ensure(title.length * 13 + 6);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(42, 35, 32);
      doc.text(title, M, y);
      text(count(p.reach), W - M - 150, 10); text(`${p.engagement}%`, W - M - 70, 10);
      y += title.length * 13 + 6;
    });
  } else {
    paragraph('No published post in this campaign has numbers yet.');
  }

  heading('What to do next');
  report.actions.forEach((a) => paragraph(`• ${a.text}`, 10, [42, 35, 32]));

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(140, 129, 119);
    doc.text(`Prepared by ${report.business.preparedBy}`, M, H - 24);
    doc.text(`Page ${i} of ${pages}`, W - M, H - 24, { align: 'right' });
  }
  return doc;
}

export async function downloadReportPdf(report, options) {
  const doc = await buildReportPdf(report, options);
  doc.save(reportFilename(report));
}
