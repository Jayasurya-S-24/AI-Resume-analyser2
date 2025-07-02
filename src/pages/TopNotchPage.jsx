import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, SendHorizonal, MailCheck, User, RotateCcw } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const mockCandidates = [
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'Frontend Developer',
    match: 88,
    skills: ['React', 'JavaScript', 'CSS'],
  },
  {
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'Backend Developer',
    match: 92,
    skills: ['Node.js', 'Express', 'MongoDB'],
  },
  {
    name: 'Claire Adams',
    email: 'claire@example.com',
    role: 'Data Scientist',
    match: 77,
    skills: ['Python', 'Pandas', 'Machine Learning'],
  },
];

const TopNotchPage = () => {
  const [topCandidates, setTopCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mailStatus, setMailStatus] = useState({});

  // Load candidates and mail status from localStorage
  useEffect(() => {
    const filtered = mockCandidates.filter((c) => c.match > 75);
    setTopCandidates(filtered);

    const storedStatus = localStorage.getItem('mailStatus');
    if (storedStatus) {
      setMailStatus(JSON.parse(storedStatus));
    }

    setLoading(false);
  }, []);

  const updateMailStatus = (name, status) => {
    const updated = { ...mailStatus, [name]: status };
    setMailStatus(updated);
    localStorage.setItem('mailStatus', JSON.stringify(updated));
  };

  const sendMail = async (candidate) => {
    try {
      const response = await fetch('http://localhost:5000/send-mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidate),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Mail failed');
      }

      updateMailStatus(candidate.name, 'sent');
      toast.success(`✅ Email sent to ${candidate.name}`);
    } catch (err) {
      console.error(err);
      toast.error(`❌ Failed to send email to ${candidate.name}`);
    }
  };

  const sendAllMails = async () => {
    if (!window.confirm('Send emails to all top candidates?')) return;

    for (const candidate of topCandidates) {
      if (mailStatus[candidate.name] !== 'sent') {
        await sendMail(candidate);
      }
    }

    toast.success('🎉 All emails processed!');
  };

  const resetMailStatus = () => {
    localStorage.removeItem('mailStatus');
    setMailStatus({});
    toast.info('✉️ Mail status reset');
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 text-gray-900 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <ToastContainer position="top-right" autoClose={3000} />

      <h1 className="text-4xl font-bold text-center mb-8">
        🏆 Top Notch Candidates (Match {'>'} 75%)
      </h1>

      {loading ? (
        <p className="text-center text-gray-500 text-lg animate-pulse">
          Loading top candidates...
        </p>
      ) : topCandidates.length === 0 ? (
        <p className="text-center text-red-500 text-lg">No top candidates found.</p>
      ) : (
        <>
          <div className="text-center mb-6 flex justify-between items-center gap-2">
            <button
              onClick={resetMailStatus}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-green-700 text-white px-4 py-2 rounded-full transition shadow-lg"
            >
              <RotateCcw size={20} />Reset Mail Status
            </button>
            <button
              onClick={sendAllMails}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full transition shadow-lg"
            >
              <Send size={20} /> Send All Mails
            </button>

          </div>

          <div className="max-w-4xl mx-auto grid gap-6">
            {topCandidates.map((candidate, index) => (
              <motion.div
                key={index}
                className="bg-white shadow-xl rounded-xl p-6 flex justify-between items-center border-l-4 border-blue-600"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="text-gray-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{candidate.name}</h2>
                    <p className="text-sm text-gray-700">{candidate.role}</p>
                    <div className="w-full bg-gray-100 h-2 rounded-full mt-2 mb-1">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${candidate.match}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600">{candidate.match}% Match</p>
                    <p className="text-xs text-gray-500">{candidate.email}</p>
                    <p className="text-xs text-gray-500 mt-1 italic">
                      Skills: {candidate.skills.join(', ')}
                    </p>
                  </div>
                </div>

                {mailStatus[candidate.name] === 'sent' ? (
                  <span className="flex items-center gap-1 text-green-600 font-medium text-sm">
                    <MailCheck size={18} /> Sent
                  </span>
                ) : (
                  <button
                    onClick={() => sendMail(candidate)}
                    className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-5 py-2 rounded-full transition shadow-md"
                  >
                    <SendHorizonal size={18} /> Send Mail
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default TopNotchPage;
