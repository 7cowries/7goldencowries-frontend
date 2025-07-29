// src/components/XPModal.js
import React from "react";
import { motion } from "framer-motion";

const XPModal = ({ xpGained, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-gradient-to-br from-blue-900 to-indigo-700 text-yellow-300 p-8 rounded-2xl shadow-xl text-center max-w-sm w-full"
      >
        <h2 className="text-3xl font-bold mb-2">🎉 XP Gained!</h2>
        <p className="text-xl font-semibold mb-4">+{xpGained} XP</p>
        <button
          onClick={onClose}
          className="mt-4 bg-yellow-300 text-blue-900 font-bold px-4 py-2 rounded-full shadow hover:bg-yellow-400"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
};

export default XPModal;
