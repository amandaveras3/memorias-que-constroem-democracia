type Props = { eyebrow: string; title: string; text?: string; light?: boolean };
export default function SectionTitle({ eyebrow, title, text, light }: Props) {
  return (
    <div className={`section-title ${light ? "light" : ""}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}