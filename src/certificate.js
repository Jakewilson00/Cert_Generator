import { fmt } from './dates.js';

// Certifier details. Edit here if the licensed fumigator changes.
const CERTIFIER_NAME = 'Jake Wilson';
const CERTIFIER_LICENCE = 'PMT012008923';

function esc(s) {
  return String(s ?? '').replace(/[&<>"]/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
  ));
}

// `data` is the shape returned by collectFormData(): { certificate, lines }.
// `certNumber` is optional (the saved sequential number) and shown if present.
export function renderCertificate(data, certNumber = null) {
  const c = data.certificate;
  const lines = data.lines;

  const dataRows = lines.map((l) => `
    <tr>
      <td>${esc(l.line_no)}</td><td class="c">${esc(l.count_text)}</td><td class="c">${esc(l.bags ?? '')}</td>
      <td class="c">${l.domestic ? 'YES' : ''}</td><td class="c">${l.export_flag ? 'YES' : ''}</td><td class="c">${l.seed ? 'YES' : ''}</td>
      <td>${esc(l.comments)}</td>
    </tr>`).join('');

  const filler = Math.max(0, 6 - lines.length);
  const fillerRows = Array(filler)
    .fill('<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>')
    .join('');

  const certNoLabel = certNumber
    ? `<td class="lbl" style="width:20%">CERT NO:</td><td><strong>${esc(certNumber)}</strong></td>`
    : '<td></td><td></td>';

  return `
    <div class="cert-logo-area">
      <img class="cert-logo-img" src="/logo.png" alt="Bean Growers Australia" />
    </div>

    <div class="cert-title">CONTAINER FUMIGATION CERTIFICATE</div>

    <table class="ct">
      <tr>
        <td class="lbl" style="width:38%">CONTAINER NO:</td>
        <td><strong>${esc(c.container_no)}</strong></td>
        <td class="lbl" style="width:14%">DATE:</td>
        <td><strong>${fmt(c.cert_date)}</strong></td>
      </tr>
      <tr>${certNoLabel}<td class="lbl">VOLUME m³:</td><td><strong>${esc(c.volume)}</strong></td></tr>
    </table>

    <table class="ct">
      <thead><tr><th>LINE NO</th><th>COUNT</th><th>NO OF BAGS</th><th>DOMESTIC</th><th>EXPORT</th><th>SEED</th><th>COMMENTS</th></tr></thead>
      <tbody>${dataRows}${fillerRows}</tbody>
    </table>

    <div class="under-fum">UNDER FUMIGATION</div>

    <table class="ct">
      <thead><tr><th>LOADED FROM</th><th>TO</th><th>CHEP COUNT</th><th>LOADED BY</th><th>DATE</th></tr></thead>
      <tbody>
        <tr>
          <td class="c">${esc(c.loaded_from)}</td><td class="c">${esc(c.container_no)}</td>
          <td class="c">${esc(c.chep_count ?? '')}</td><td class="c">${esc(c.loaded_by)}</td><td class="c">${fmt(c.load_date)}</td>
        </tr>
      </tbody>
    </table>

    <table class="ct">
      <thead><tr><th>UNLOADED FROM</th><th>TO</th><th colspan="2">UNLOADED BY</th><th>DATE</th></tr></thead>
      <tbody><tr><td class="c">CONT</td><td class="c">SHED</td><td colspan="2"></td><td></td></tr></tbody>
    </table>

    <table class="ct">
      <thead><tr><th>FUMIGATION DATE</th><th>RELEASE DATE</th><th>AVAILABLE DATE</th><th>VENTILATION PERIOD</th><th>VOLUME m³</th></tr></thead>
      <tbody>
        <tr>
          <td class="c">${fmt(c.fum_date)}</td><td class="c">${fmt(c.release_date)}</td><td class="c">${fmt(c.avail_date)}</td>
          <td class="c">${esc(c.vent_period)}</td><td class="c">${esc(c.volume)}</td>
        </tr>
      </tbody>
    </table>

    <p class="cert-note">
      I, ${esc(CERTIFIER_NAME)}, licence No. ${esc(CERTIFIER_LICENCE)}, certify that the above goods were fumigated with Phosphine at; 1.5g/m³ at 21°C for a period of 10 days.<br />
      Active Constituent: PHOSPHINE present as ALUMINIUM PHOSPHIDE<br />
      After ventilation, this product was checked for gas levels with a Drager X-AM7000 gas detection instrument.<br />
      The highest level was 0.00ppm for PH³, therefore it is safe for persons to be in close proximity to the product.<br />
      An organoleptic examination of the product revealed no notable negative attributes.
    </p>

    <table class="sig-t">
      <thead><tr><th>FULL NAME</th><th>SIGNATURE</th><th>DATE</th></tr></thead>
      <tbody><tr><td>${esc(CERTIFIER_NAME)}</td><td></td><td class="c">${fmt(c.avail_date)}</td></tr></tbody>
    </table>

    <div class="cert-footer">
      BEAN GROWERS AUSTRALIA LIMITED &nbsp;·&nbsp; ABN: 52 092 429 984<br />
      82–86 River Road, KINGAROY Q AUSTRALIA 4610 &nbsp;·&nbsp; PO Box 328, KINGAROY Q AUSTRALIA 4610<br />
      +61 (7) 4162 1100 &nbsp;·&nbsp; www.beangrowers.com.au
    </div>
  `;
}
