/**
 * Dados estruturados (schema.org) como o buscador os lê: um `<script
 * type="application/ld+json">` no corpo da página. Pelo `metadata.other` eles
 * saíam como `<meta name="application/ld+json">`, que nenhum buscador lê.
 *
 * O `<` é escapado para o texto de uma obra ou biografia não conseguir fechar
 * a tag.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
