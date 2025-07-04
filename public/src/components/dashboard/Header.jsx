import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { auth } from "../../../configs/FirebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";

function Header() {
    const [user, setUser] = useState(null);
    const location = useLocation();

    const pageTitles = {
        "/dashboard/content": "📊 AI Resume Screening Dashboard",
        "/dashboard/upload": "📄 Upload Your Resume and Job Description",
        "/dashboard/topnotch": "🌟 Top Matching Resumes & Insights",
        "/dashboard/search": "🔍 Search & Filter Past Screenings",
        "/dashboard/template": "📁 Resume Templates & Customization",
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const currentPath = location.pathname;
    const subtitle = pageTitles[currentPath] || "✨ AI Resume Screener";

    return (
        <motion.div
            className="w-full sticky top-0 z-10 bg-white select-none"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >

            {/* Animated Subtitle Header */}
            {subtitle && (
                <motion.div
                    className="text-2xl font-bold mt-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    {subtitle}
                </motion.div>
            )}
        </motion.div>
    );
}

export default Header;
