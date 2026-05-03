import spinnerUrl from '../assets/loading-spinner.svg'
import './Loader.css'

export default function Loader({ label = 'Laadin…', size = 72 }) {
  return (
    <div className="loaderRoot" role="status" aria-live="polite">
      <div className="loaderOrbit" style={{ width: size, height: size }}>
        <img src={spinnerUrl} alt="" className="loaderSvg" width={size} height={size} decoding="async" />
      </div>
      {label ? <p className="loaderLabel">{label}</p> : null}
    </div>
  )
}
