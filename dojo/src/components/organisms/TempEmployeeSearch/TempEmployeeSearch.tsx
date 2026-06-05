import { useState } from "react";

import Level0Nav from "../../molecules/Level0Nav/Level0Nav";
import HumanBodyCheckSheet from "../HumanBodyCheckSheet/HumanBodyCheckSheet";
import { humanBodyCheckService } from "../../hooks/ServiceApis";
import type { UserInfo } from "../../constants/types";



const TempEmployeeSearch = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState<UserInfo[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);
        setSelectedUser(null);

        if (term.length >= 2) {
            try {
                setIsLoading(true);
                setError("");

                // Use service to fetch user info
                const userData = await humanBodyCheckService.fetchTempUsers();

                // Filter users based on search term
                // --- START OF FIX ---
                const lowerCaseTerm = term.toLowerCase();
                const filtered = userData.filter((user: UserInfo) => {
                    // Provide a default empty string for any potentially null values
                    const firstName = (user.firstName ?? '').toLowerCase();
                    const email = (user.email ?? '').toLowerCase();
                    const phoneNumber = (user.phoneNumber ?? '').toLowerCase();
                    const tempId = (user.tempId ?? '').toLowerCase();

                    // Now check if any of the safe strings include the search term
                    return (
                        firstName.includes(lowerCaseTerm) ||
                        email.includes(lowerCaseTerm) ||
                        phoneNumber.includes(lowerCaseTerm) ||
                        tempId.includes(lowerCaseTerm)
                    );
                });

                setResults(filtered);
                if (filtered.length === 0) setError("No matching users found");
            } catch (err) {
                setError("Error fetching user info");
                setResults([]);
                console.error("Search error:", err);
            } finally {
                setIsLoading(false);
            }
        } else {
            setResults([]);
            setError(term.length ? "Type at least 2 characters" : "");
        }
    };



    const handleUserSelect = (user: UserInfo) => {
        // 1. Set the user, which will cause the HumanBodyCheckSheet to render.
        setSelectedUser(user);

        // 2. Clean up the search UI.
        setSearchTerm(`${user.firstName, user.firstName}`); // Optional: keep the name in the search bar
        setResults([]);
        setError("");
    };

    // Handle successful completion of assessment
    const handleAssessmentComplete = () => {
        // Reset the form and show success message
        setSelectedUser(null);
        setSearchTerm("");

        // You could also show a success toast or redirect here
        alert("Assessment completed successfully!");
    };

    return (
        <>
            <Level0Nav />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className=" mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Search Card */}

                    <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 p-8 mb-8 transition-all duration-300 hover:shadow-2xl">
                        <div className="text-center mb-8">
                            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                                Employee Search
                            </h2>
                            <p className="mt-3 text-lg text-gray-600">
                                Find and select an employee to proceed with medical assessment
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <div className="relative w-4/5">
                                {/* Input */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, phone, or temp ID..."
                                        className="w-full p-2 pl-14 rounded-2xl bg-white/60 backdrop-blur-md
                     border border-gray-200 focus:outline-none focus:ring-4 
                     focus:ring-indigo-300 focus:border-indigo-500 transition-all
                     text-lg shadow-sm hover:shadow-md"
                                        value={searchTerm}
                                        onChange={handleSearch}
                                        autoFocus
                                    />
                                    <svg
                                        className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6 pointer-events-none"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                </div>

                                {/* Loading State */}
                                {isLoading && (
                                    <div className="absolute z-20 w-full mt-3 left-0 flex justify-center">
                                        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 flex items-center gap-3">
                                            <span className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent"></span>
                                            <span className="text-indigo-600 font-medium">Searching...</span>
                                        </div>
                                    </div>
                                )}

                                {/* Error State */}
                                {error && !isLoading && (
                                    <div className="absolute z-20 w-full mt-3 left-0">
                                        <div className="bg-gradient-to-r from-red-100 via-red-50 to-white
                          border border-red-200 text-red-600 rounded-xl
                          shadow-md p-4 text-center font-medium">
                                            {error}
                                        </div>
                                    </div>
                                )}

                                {/* Results Dropdown */}
                                {results.length > 0 && !isLoading && (
                                    <ul className="absolute z-20 w-full mt-3 left-0 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-fade-in max-h-80 overflow-y-auto">
                                        {results.map((user) => (
                                            <li
                                                key={user.tempId}
                                                className="p-5 cursor-pointer transition-all border-b border-gray-100 last:border-0 hover:bg-indigo-50 hover:pl-6"
                                                onClick={() => handleUserSelect(user)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-semibold text-gray-800 text-lg">
                                                            {user.firstName} {user.lastName}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs px-3 py-1.5 rounded-full font-mono text-indigo-600 bg-indigo-100">
                                                        {user.tempId}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-base mt-2 text-gray-500">
                                                    <span>{user.email}</span>
                                                    <span>{user.phoneNumber}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>


                    {/* Show form only if a user is selected */}
                    {selectedUser && (
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    Medical Assessment
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span className="font-medium">
                                        {selectedUser.firstName}
                                    </span>
                                    <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded font-mono">
                                        ID: {selectedUser.tempId}
                                    </span>
                                    <span className="text-gray-500">
                                        {selectedUser.email}
                                    </span>
                                </div>
                            </div>
                            <HumanBodyCheckSheet
                                tempId={selectedUser.tempId}
                                userDetails={selectedUser}
                                onNext={handleAssessmentComplete}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Fade-in animation */}
            <style>{`
                .animate-fade-in {
                    animation: fadeIn 0.2s ease-out;
                }
                @keyframes fadeIn {
                    from { 
                        opacity: 0; 
                        transform: translateY(-8px);
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0);
                    }
                }
            `}</style>
        </>
    );
};

export default TempEmployeeSearch;