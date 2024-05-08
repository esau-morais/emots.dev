const FOOTER_ITEMS = [
  {
    path: 'https://linkedin.com/in/emmorais',
    label: 'in',
  },
  {
    path: 'https://x.com/_3morais',
    label: '𝕏',
  },
] as const

export const Footer = () => {
  return (
    <footer className="fixed inset-x-0 bottom-0 flex h-10 divide-x border-t border-surface0 bg-base/80 backdrop-blur-sm">
      <span className="flex cursor-default items-center border-surface0 bg-crust px-4 text-text last:!border-r">
        socials
      </span>
      {FOOTER_ITEMS.map((item, idx) => (
        <a
          key={idx}
          className="flex items-center border-surface0 px-4 text-text last:!border-r hover:bg-crust focus:bg-crust focus:outline-none"
          href={item.path}
        >
          {item.label}
        </a>
      ))}
    </footer>
  )
}
