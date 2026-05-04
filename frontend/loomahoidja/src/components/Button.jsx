export default function Button({ variant = 'primary', className = '', children, ...rest }) {
  const v = variant === 'outline' ? 'btnOutline' : 'btnSolid'
  return (
    <button type="button" className={`btnBase ${v} ${className}`.trim()} {...rest}>
      {children}
    </button>
  )
}
