import { Link } from 'react-router-dom'

const variants = {
  primary: 'bg-primary hover:bg-primary-dark text-white',
  secondary: 'bg-secondary hover:bg-secondary-light text-white',
  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  ghost: 'text-primary hover:underline',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3 text-lg',
}

export default function Button({ variant = 'primary', size = 'md', href, children, className = '', ...props }) {
  const classes = `inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-300 cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`

  if (href) {
    if (href.startsWith('http')) {
      return <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
    }
    return <Link to={href} className={classes} {...props}>{children}</Link>
  }

  return <button className={classes} {...props}>{children}</button>
}
