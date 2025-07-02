import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Loader2, SparklesIcon, UploadCloud, BrainCircuit } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FormUpload = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [skills, setSkills] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const fileRef = useRef(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile || selectedFile.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed.');
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    toast.success('PDF uploaded!');

    // Auto-extract skills after upload
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('pdf_file', selectedFile);

      const res = await axios.post('http://localhost:5000/extract_skills', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setSkills(res.data.extracted_skills || []);
        toast.success(`Extracted ${res.data.extracted_skills.length} skill(s)`);
      } else {
        toast.error(res.data.error || 'Failed to extract skills.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error extracting skills.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!skills.length) {
      toast.warn('Extract skills before analyzing.');
      return;
    }

    setAnalyzing(true);
    try {
      const res = await axios.post('http://localhost:5000/analyze_skills', { skills });

      if (res.data.success) {
        setAnalysisResult(res.data);
        toast.success('Analysis complete!');
      } else {
        toast.error(res.data.error || 'Analysis failed.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error during analysis.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <motion.div
      className="max-w-5xl mx-auto p-8 mt-12 bg-white rounded-xl shadow-lg select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">Resume Analyzer</h2>

      {/* Upload Box */}
      <div
        onClick={() => fileRef.current.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-10 cursor-pointer text-center bg-gray-50 hover:bg-gray-100 transition"
      >
        {file ? (
          <p className="text-indigo-600 font-semibold">{file.name}</p>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <UploadCloud className="w-8 h-8" />
            <p>Click to upload PDF resume</p>
          </div>
        )}
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          ref={fileRef}
          className="hidden"
        />
      </div>

      {/* Action Button */}
      {file && (
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4 text-center">
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: !analyzing ? 1.03 : 1 }}
            disabled={analyzing}
            onClick={handleAnalyze}
            className={`px-6 py-2 rounded-md text-white font-semibold transition-all duration-300
              ${!analyzing ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-400 cursor-not-allowed'}
              flex items-center justify-center gap-2`}
          >
            {analyzing ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <BrainCircuit className="w-5 h-5" />
                <span>Analyze Skills</span>
              </>
            )}
          </motion.button>
        </div>
      )}

      {/* Skills Display */}
      {skills.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4 text-gray-800">Extracted Skills</h3>
          <div className="flex flex-wrap gap-3">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI Analysis Results */}
      {analysisResult && (
        <div className="mt-10 bg-gray-100 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Gemini AI Analysis</h3>
          <p className="text-gray-700 mb-2">
            <strong>Match Score:</strong> {analysisResult.accuracy_score}%
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Recommended Roles:</strong>
          </p>
          <ul className="list-disc ml-6 text-gray-700 text-sm">
            {analysisResult.recommended_jobs?.map((job, idx) => (
              <li key={idx}>{job}</li>
            ))}
          </ul>
        </div>
      )}

      {/* PDF Preview */}
      {previewUrl && (
        <div className="mt-10">
          <h3 className="text-lg font-medium mb-2 text-gray-800">Resume Preview</h3>
          <iframe
            src={previewUrl + '#toolbar=0'}
            title="Resume Preview"
            width="100%"
            height="500px"
            className="rounded-lg border"
          />
        </div>
      )}

      <ToastContainer position="bottom-right" />
    </motion.div>
  );
};

export default FormUpload;
