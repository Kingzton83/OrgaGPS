'use client';

import { usePathname, useRouter } from 'next/navigation';

export function Footer() {
    const pathname = usePathname();
    const router = useRouter();

    const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
        e.preventDefault();
        if (pathname === '/') {
            // Try to scroll to the specific section
            const section = document.getElementById(sectionId);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            } else {
                // If section ID doesn't exist, scroll to the top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else {
            // Redirect to the homepage with the hash for scrolling
            router.push(`/#${sectionId}`);
        }
    };
    

    return (
        <footer>
            <div className="info">
                <div className="left">
                    <h4>Site map</h4>
                    <a href="#vision" onClick={(e) => handleScrollToSection(e, 'vision')}>Our Vision</a>
                    <a href="#aboutus" onClick={(e) => handleScrollToSection(e, 'aboutus')}>About Us</a>
                </div>
                <div className="middle">
                    <h4>Product</h4>
                    <a href="" onClick={(e) => handleScrollToSection(e, 'orgagps')}>OrgaGPS</a>
                    <a href="/privacy">Privacy</a>
                </div>
                <div className="right">
                    <h4>Support</h4>
                    <a href="#faq" onClick={(e) => handleScrollToSection(e, 'faq')}>FAQ's</a>
                    <a href="/impressum">Impressum</a>
                </div>
            </div>

            <div className="copyright">
                &#169; Copyright © 2024 OrgaGPS
            </div>
        </footer>
    );
}
