import {Link} from "react-router";
import ThemeToggle from "~/components/ThemeToggle";

const Navbar = () => {
    return (
        <nav className="navbar">
            <Link to="/" className="flex flex-col leading-none">
                <p className="text-2xl font-display font-black text-accent">CVly</p>
                <p className="eyebrow">AI resume review</p>
            </Link>
            <div className="flex items-center gap-3">
                <ThemeToggle />
                <Link to="/upload" className="accent-button w-fit text-sm">
                    Upload resume
                </Link>
            </div>
        </nav>
    )
}
export default Navbar
