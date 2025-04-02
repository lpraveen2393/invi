import React from "react";
import { Link } from "react-router-dom";
import '../index.css';

const Navbar = () => {
    return (
        <nav className="bg-gradient-to-r from-blue-900 to-blue-700 p-4 shadow-xl fixed top-0 w-full z-10">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-white text-3xl font-extrabold tracking-wide drop-shadow-lg">Exam Duty Allocation</h1>
                <ul className="flex space-x-6">
                    <li><Link to="/" className="text-white text-lg font-semibold hover:bg-blue-600 px-4 py-2 rounded-lg transition-all duration-300 ease-in-out">Home</Link></li>
                    <li><Link to="/schedule" className="text-white text-lg font-semibold hover:bg-blue-600 px-4 py-2 rounded-lg transition-all duration-300 ease-in-out">Schedule</Link></li>
                    <li><Link to="/faculty" className="text-white text-lg font-semibold hover:bg-blue-600 px-4 py-2 rounded-lg transition-all duration-300 ease-in-out">Faculty</Link></li>
                    <li><Link to="/report" className="text-white text-lg font-semibold hover:bg-blue-600 px-4 py-2 rounded-lg transition-all duration-300 ease-in-out">Report</Link></li>
                </ul>
            </div>
        </nav>
    );
};

const HeroSection = () => {
    return (
        <div className="bg-gradient-to-b from-blue-800 to-blue-600 text-white text-center py-32 mt-16 shadow-lg">
            <h2 className="text-6xl font-extrabold mb-6 animate-fade-in">University Exam Duty System</h2>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed animate-fade-in opacity-80">Ensure fair and efficient faculty exam duty allocations with transparency and automation.</p>
        </div>
    );
};

const FeaturesSection = () => {
    return (
        <div className="container mx-auto my-20 px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white shadow-2xl rounded-lg text-center transform hover:scale-105 transition-all duration-300 ease-in-out">
                <h3 className="text-3xl font-bold text-blue-700">Automated Scheduling</h3>
                <p className="text-gray-700 mt-4">AI-powered scheduling ensures fairness and efficiency in duty allocation.</p>
            </div>
            <div className="p-8 bg-white shadow-2xl rounded-lg text-center transform hover:scale-105 transition-all duration-300 ease-in-out">
                <h3 className="text-3xl font-bold text-blue-700">Faculty Management</h3>
                <p className="text-gray-700 mt-4">Easily manage faculty availability, preferences, and workload.</p>
            </div>
            <div className="p-8 bg-white shadow-2xl rounded-lg text-center transform hover:scale-105 transition-all duration-300 ease-in-out">
                <h3 className="text-3xl font-bold text-blue-700">Detailed Reports</h3>
                <p className="text-gray-700 mt-4">Generate insights and reports on duty assignments with ease.</p>
            </div>
        </div>
    );
};

const HomePage = () => {
    return (
        <div className="min-h-screen bg-blue-50">
            <Navbar />
            <HeroSection />
            <FeaturesSection />
        </div>
    );
};

export default HomePage;