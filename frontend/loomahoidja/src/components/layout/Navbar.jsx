import { Link } from 'react-router-dom';
import './Navbar.css';
import logo from '../../assets/logo.png';

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-left">
                <img src={logo} alt="Loomahoidja logo" className="logo" />
                <Link to="/" >Find a sitter</Link>
                <Link to="how-it-works">How it works</Link>
            </div>
            <div className="navbar-right">
                <Link to="login" className='login-btn'>Log in</Link>
                <Link to="register" className='signup-btn'>Sign up</Link>
            </div>
        </nav>
    );
}