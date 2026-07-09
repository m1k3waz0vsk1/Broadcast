// Renders a JSON-LD <script> tag. Escapes "</" so embedded strings (e.g. an
// admin-entered product description) can't prematurely close the script tag.
export function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/<\//g, "<\\/");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
