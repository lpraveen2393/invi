import React, { useState } from 'react';
import { Link } from 'react-router-dom';
//navbar component
const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>

            <div className="h-16"></div>

            <nav className="bg-blue-50 shadow-md fixed top-0 left-0 right-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">

                            <div className="hidden md:flex ml-10 space-x-6">
                                <Link to="/" className="text-blue-800 px-3 py-2 text-md font-semibold hover:bg-blue-700 hover:text-white rounded">Home</Link>
                                <Link to="/unavailable" className="text-blue-800 px-3 py-2 text-md font-semibold hover:bg-blue-700 hover:text-white rounded">Unavailability</Link>
                                <Link to="/unavail-individual" className="text-blue-800 px-3 py-2 text-md font-semibold hover:bg-blue-700 hover:text-white rounded">Unavailability-Individual</Link>
                                <Link to="/coe" className="text-blue-800 px-3 py-2 text-md font-semibold hover:bg-blue-700 hover:text-white rounded">Assign Duties</Link>
                                <Link to="/coe" className="text-blue-800 px-3 py-2 text-md font-semibold hover:bg-blue-700 hover:text-white rounded">Download Reports</Link>
                            </div>
                        </div>

                        <div className="md:hidden">
                            <button
                                onClick={toggleMenu}
                                className="inline-flex items-center justify-center p-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                            >
                                <span className="sr-only">Open menu</span>
                                {isOpen ? (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                <div className={`${isOpen ? 'block' : 'hidden'} md:hidden px-4 pb-4`}>
                    <div className="space-y-2">
                        <Link to="/" className="block text-gray-700 px-3 py-2 rounded hover:bg-gray-100">Home</Link>
                        <Link to="/unavailable" className="block text-gray-700 px-3 py-2 rounded hover:bg-gray-100">Unavailability</Link>
                        <Link to="/unavail-individual" className="block text-gray-700 px-3 py-2 rounded hover:bg-gray-100">Unavailability-Individual</Link>
                        <Link to="/coe" className="block text-gray-700 px-3 py-2 rounded hover:bg-gray-100">Assign Duties</Link>
                        <Link to="/coe" className="block text-gray-700 px-3 py-2 rounded hover:bg-gray-100">Download Reports</Link>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
