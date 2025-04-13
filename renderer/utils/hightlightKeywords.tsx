export const hightlightKeywords = (text: string, keyword: string) => {
  const reg = new RegExp(`(${keyword})`, 'i')
  return text.split(reg).map((part, index) => (
    <span
      key={index}
      style={{
        color: part.toLowerCase() === keyword ? 'var(--td-brand-color)' : undefined,
        fontWeight: part.toLowerCase() === keyword ? 'bold' : 'normal'
      }}
    >
      {part}
    </span>
  ))
}
