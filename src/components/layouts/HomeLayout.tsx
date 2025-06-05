import type { ReactNode } from 'react';
import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Footer from '../Footer';
import Navigation from '../Navigation';
import ErrorBoundary from '../ErrorBoundary';
import LoadingSpinner from '../LoadingSpinner';
import { Link } from 'react-router-dom';
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";

interface HomeLayoutProps {
    children: ReactNode;
    title?: string;
    description?: string;
    isLoading?: boolean;
}

const HomeLayout: React.FC<HomeLayoutProps> = ({ 
    children, 
    title = 'CT SPARK - Your Platform',
    description = 'Welcome to CT SPARK platform',
    isLoading = false
}) => {
    const [isNavigating, setIsNavigating] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isMobileMenuOpen &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMobileMenuOpen]);

    // Navigation items from Header component
    const navItems = [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
        { label: 'Services', href: '/services' },
        { label: 'Contact', href: '/contact' }
    ];

    return (
        <ErrorBoundary>
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
            </Helmet>

            <div className="flex flex-col min-h-screen w-full overflow-x-hidden m-0">
                <div className="relative z-50">
                    <Navigation isLoading={isNavigating || isLoading} />
                </div>

                {/* Mobile Menu Button */}
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={toggleMobileMenu}
                    className="md:hidden fixed top-4 right-4 z-50 inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-500 focus:outline-none transition-all duration-300"
                    aria-controls="mobile-menu"
                    aria-expanded={isMobileMenuOpen}
                >
                    <span className="sr-only">Open main menu</span>
                    <div className="relative w-6 h-6">
                        <HiOutlineMenuAlt3 
                            className={`absolute w-6 h-6 transition-all duration-300 ${
                                isMobileMenuOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'
                            }`}
                        />
                        <HiOutlineX 
                            className={`absolute w-6 h-6 transition-all duration-300 ${
                                isMobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
                            }`}
                        />
                    </div>
                </button>

                {/* Overlay */}
                <div 
                    className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
                        isMobileMenuOpen ? 'opacity-70 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                />

                {/* Mobile Dropdown Menu */}
                <div 
                    ref={dropdownRef}
                    className={`fixed top-0 left-0 right-0 rounded-2xl bg-white shadow-lg transform transition-all duration-300 ease-in-out z-40 ${
                        isMobileMenuOpen ? 'translate-y-[80px] opacity-100' : 'translate-y-0 opacity-0 pointer-events-none'
                    }`}
                >
                    <div className="px-4 py-6">
                        {/* Navigation Links */}
                        <nav className="space-y-4 mb-6">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className="block text-gray-700 hover:text-blue-500 text-lg font-medium"
                                    onClick={toggleMobileMenu}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Auth Buttons */}
                        <div className="flex flex-col space-y-4">
                            <Link
                                to="/signin"
                                className="text-gray-700 hover:text-blue-500 text-lg font-medium"
                                onClick={toggleMobileMenu}
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/get-started"
                                className="px-5 py-3 bg-[#060640] rounded-full text-white hover:bg-blue-700 transition-colors text-center"
                                onClick={toggleMobileMenu}
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>

                <main className="flex-grow w-full mx-auto  relative">
                    {isNavigating || isLoading ? (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
                            <LoadingSpinner size="large" />
                        </div>
                    ) : null}
                    {children}
                </main>

                <Footer />
            </div>
        </ErrorBoundary>
    );
};

export default HomeLayout; 