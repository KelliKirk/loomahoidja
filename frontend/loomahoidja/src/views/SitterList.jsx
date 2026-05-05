import './SitterList.css';

export default function SitterList() {
    return (
        <main>
            <section className="hero">
                <h1 className='hero-title'>Find a trusted sitter for your pet</h1>
                <p className='hero-subtitle'>Conntecting pet owners with caring sitters across Estonia</p>
                <div className='hero-search'>
                    <input className='hero-input' placeholder='Search by city or sitter name...' />
                    <button className='hero-btn'>Find a sitter</button>
                </div>
            </section>
            <div className='sitter-list-layout'>
                <aside className='sitter-filters'>filters</aside>
                <div className='sitter-cards'>cards</div>
            </div>
        </main>
    )
} 