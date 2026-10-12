const ELLIPSIS = "\u2026";

const NAME_BLANK = `Quien suscribe${ELLIPSIS.repeat(8)}`;
const DOT_RUN = `<w:t>${ELLIPSIS}${ELLIPSIS}.</w:t>`;
const DNI_BLANK = `., DNI N\u00BA${ELLIPSIS.repeat(5)}.. con domicilio en la ciudad de${ELLIPSIS.repeat(8)}. declaro`;
const SIGNATURE_BLANK = "<w:t>(Nombre y apellido)</w:t>";
const DATE_BLANK = "Fecha:    /     / ";

export type EnrollmentFields = {
  nombre: string;
  apellido: string;
  dni: string;
  domicilio: string;
  fecha: string;
};

export function formatDeviceDate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

export function formatDomicilio(values: { calle: string; numero: string; piso: string; dpto: string }) {
  const place = [values.calle.trim(), values.numero.trim()].filter(Boolean).join(" ");
  const extra = [values.piso.trim() ? `piso ${values.piso.trim()}` : "", values.dpto.trim() ? `dpto ${values.dpto.trim()}` : ""].filter(
    Boolean,
  );
  return extra.length ? `${place}, ${extra.join(", ")}` : place;
}

function xmlText(value: string) {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function replaceOnce(xml: string, from: string, to: string) {
  const start = xml.indexOf(from);
  if (start < 0 || xml.indexOf(from, start + from.length) >= 0) {
    throw new Error("La planilla no coincide con el modelo.");
  }
  return xml.slice(0, start) + to + xml.slice(start + from.length);
}

export function fillEnrollmentXml(xml: string, fields: EnrollmentFields) {
  const nombre = xmlText(fields.nombre);
  const apellido = xmlText(fields.apellido);
  const dni = fields.dni.replace(/\D/g, "");
  const domicilio = xmlText(fields.domicilio);
  const fecha = xmlText(fields.fecha);
  const fullName = xmlText(`${nombre} ${apellido}`);

  const signature = [
    `<w:t>Firma y aclaración: ${fullName}</w:t>`,
    `</w:r><w:r><w:rPr><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr><w:br/></w:r>`,
    `<w:sdt><w:sdtPr><w:id w:val="1001"/><w14:checkbox><w14:checked w14:val="1"/>`,
    `<w14:checkedState w14:val="2612" w14:font="MS Gothic"/>`,
    `<w14:uncheckedState w14:val="2610" w14:font="MS Gothic"/>`,
    `</w14:checkbox></w:sdtPr><w:sdtContent><w:r><w:rPr>`,
    `<w:rFonts w:ascii="MS Gothic" w:hAnsi="MS Gothic" w:cs="MS Gothic"/>`,
    `<w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr><w:t>\u2612</w:t></w:r></w:sdtContent></w:sdt>`,
    `<w:r><w:rPr><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr><w:t xml:space="preserve"> Acepto Condición</w:t>`,
  ].join("");

  return replaceOnce(
    replaceOnce(
      replaceOnce(
        replaceOnce(replaceOnce(xml, NAME_BLANK, `Quien suscribe ${fullName}`), DOT_RUN, "<w:t></w:t>"),
        DNI_BLANK,
        `, DNI N\u00BA ${dni} con domicilio en ${domicilio}, declaro`,
      ),
      SIGNATURE_BLANK,
      signature,
    ),
    DATE_BLANK,
    `Fecha: ${fecha}`,
  );
}

function downloadName(apellido: string, nombre: string) {
  const label = `Planilla de inscripcion - ${apellido} ${nombre}`.replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, " ").trim();
  return `${label}.docx`;
}

export async function downloadEnrollmentDocument(fields: EnrollmentFields) {
  const response = await fetch("/docs/planilla-de-inscripcion.docx");
  if (!response.ok) throw new Error("No se pudo abrir la planilla.");
  const { default: JSZip } = await import("jszip");
  const zip = await JSZip.loadAsync(await response.arrayBuffer());
  const entry = zip.file("word/document.xml");
  if (!entry) throw new Error("La planilla no tiene el formato esperado.");
  zip.file("word/document.xml", fillEnrollmentXml(await entry.async("string"), fields));
  const blob = await zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement("a");
  link.href = url;
  link.download = downloadName(fields.apellido, fields.nombre);
  window.document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
