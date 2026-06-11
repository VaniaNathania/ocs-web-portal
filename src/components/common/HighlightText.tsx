/**
 * HighlightText
 *
 * Komponen UI untuk menyorot (highlight) bagian teks yang cocok
 * dengan keyword pencarian.
 *
 * Biasa digunakan untuk:
 * - hasil pencarian (search result)
 * - expandable list / tree table
 * - autocomplete / suggestion list
 *
 * @param {Object} props
 * @param {string} props.text
 *   Teks asli yang akan ditampilkan.
 *
 * @param {string} props.highlight
 *   Keyword pencarian yang ingin disorot.
 *   Pencocokan bersifat case-insensitive.
 *   Jika kosong atau hanya spasi, teks akan ditampilkan normal
 *   tanpa highlight.
 *
 * @returns {JSX.Element}
 *   Elemen React berisi teks dengan highlight pada bagian yang cocok.
 *
 * @example
 * ```tsx
 * <HighlightText
 *   text="Incoming SMS Service"
 *   highlight="sms"
 * />
 * ```
 *
 * Output:
 * Incoming <mark>SMS</mark> Service
 */
export const HighlightText = ({
  text,
  highlight,
}: {
  text: string;
  highlight: string;
}) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }

  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className="bg-yellow-200 font-semibold px-0.5 rounded"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
};
