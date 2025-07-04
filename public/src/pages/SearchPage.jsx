import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader, X, Link } from 'lucide-react';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const API_KEY = '83c8a45cf1msh698b6f4c477459bp1cbbf9jsnca7d89256bcd';
  const API_HOST = 'jsearch.p.rapidapi.com';

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch(
        `https://${API_HOST}/search?query=${encodeURIComponent(query)}&page=1&num_pages=1`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': API_HOST,
          },
        }
      );

      const data = await res.json();
      if (data && data.data) {
        setResults(data.data);
      } else {
        setResults([]);
      }
    } catch (err) {
      setError('Error fetching job data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => setSelectedJob(null);

  useEffect(() => {
    document.body.style.overflow = selectedJob ? 'hidden' : 'auto';
  }, [selectedJob]);

  return (
    <motion.div
      className="min-h-screen bg-white text-gray-900 p-6 flex flex-col items-center select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h1 className="text-4xl font-bold mb-10 mt-8 text-center">
        🔍 Discover Trending IT Jobs
      </motion.h1>

      <div className="relative w-full max-w-3xl">
        <form
          onSubmit={handleSearch}
          className="flex items-center bg-white rounded-full shadow-lg px-6 py-4"
        >
          <Search className="text-gray-600 w-5 h-5 mr-3" />
          <input
            type="text"
            placeholder="Search by role, company, skills..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-gray-900 placeholder-gray-500 text-base outline-none bg-transparent"
          />
          <button
            type="submit"
            className="ml-4 bg-gray-900 hover:bg-gray-800 text-white px-5 py-3 rounded-full text-sm font-semibold transition"
          >
            Search
          </button>
        </form>
      </div>

      <div className="mt-12 w-full max-w-3xl">
        {loading ? (
          <div className="flex justify-center mt-10 animate-spin text-gray-900">
            <Loader className="w-6 h-6" />
          </div>
        ) : error ? (
          <p className="text-red-500 text-center mt-6">{error}</p>
        ) : (
          <AnimatePresence>
            {results.length > 0 ? (
              results.map((job, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="bg-white text-gray-900 rounded-xl p-6 mb-5 shadow hover:shadow-lg transition cursor-pointer"
                  onClick={() => setSelectedJob(job)}
                >
                  <h3 className="text-xl font-bold mb-1">{job.job_title}</h3>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {job.employer_name}
                  </p>
                  <p className="text-sm mb-1">
                    💰 {job.job_min_salary || job.job_max_salary
                      ? `$${job.job_min_salary || 'N/A'} - $${job.job_max_salary || 'N/A'}`
                      : 'Not disclosed'}
                  </p>
                  <p className="text-sm mb-2">
                    📍 {job.job_city}, {job.job_country}
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {job.job_description}
                  </p>
                </motion.div>
              ))
            ) : (
              query && (
                <motion.p
                  className="text-center text-gray-600 mt-10 text-base"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  No matching jobs found. Try a different keyword.
                </motion.p>
              )
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl w-[90%] max-w-md p-6 relative"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold mb-1">{selectedJob.job_title}</h2>
              <p className="text-gray-700 text-sm mb-2 font-medium">
                {selectedJob.employer_name}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                📍 {selectedJob.job_city}, {selectedJob.job_country}
              </p>
              <p className="text-sm text-gray-600 mb-3">
                💰{' '}
                {selectedJob.job_min_salary || selectedJob.job_max_salary
                  ? `$${selectedJob.job_min_salary || 'N/A'} - $${selectedJob.job_max_salary || 'N/A'}`
                  : 'Not disclosed'}
              </p>
              <p className="text-sm text-gray-700 mb-6 leading-relaxed line-clamp-2">
                {selectedJob.job_description}
              </p>
              {selectedJob.job_apply_link && (
                <a
                  href={selectedJob.job_apply_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white w-full py-2 rounded-md font-semibold transition"
                >
                  <span className='font-semibold text-lg'>Apply Now</span>
                  <Link className='w-4' />
                </a>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SearchPage;
