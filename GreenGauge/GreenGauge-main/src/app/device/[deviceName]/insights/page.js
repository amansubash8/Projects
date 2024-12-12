"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/app/_components/Navbar';
import Papa from 'papaparse';
import { Loader2, Send, AlertTriangle } from 'lucide-react';
import { Tabs, Tab, Typography, Box } from '@mui/material';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-3.5-turbo';
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

const InsightsPage = () => {
  const { deviceName } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [isError, setIsError] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchCsvData();
  }, [deviceName]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchCsvData = async () => {
    try {
      const response = await fetch(`/data/${deviceName}.csv`);
      const csvText = await response.text();
      const parsedData = Papa.parse(csvText, { header: true }).data;
      setCsvData(parsedData);
    } catch (error) {
      console.error('Error loading CSV data:', error);
      setIsError(true);
    }
  };

  const sendPromptToOpenAI = async (prompt) => {
    if (!csvData.length) return;

    setIsLoading(true);
    setIsError(false);

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages: [
            { role: 'system', content: 'You are an energy efficiency analyst.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1500,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const aiMessage = {
        sender: 'ai',
        text: data.choices[0].message.content,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [...prev, { sender: 'ai', text: 'There was an error retrieving insights. Please try again.', timestamp: new Date().toLocaleTimeString() }]);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsightsRequest = () => {
    const prompt = `
      Provide a detailed analysis of the energy usage data for the "${deviceName}" device. 
      Based on the data, suggest ways to reduce costs and improve efficiency. Summarize usage patterns,
      identify peak usage times, and recommend optimal usage schedules to minimize energy consumption and costs.
      The data provided is a sample of the full dataset, and contains key information for analysis:
      ${JSON.stringify(csvData.slice(0, 10))}
    `;
    sendPromptToOpenAI(prompt);
  };

  const handleQuestionSubmit = () => {
    if (!question.trim()) return;

    const questionPrompt = `
      Using the energy usage data for the "${deviceName}" device provided below, answer the following question:
      "${question}"
      Data sample: ${JSON.stringify(csvData.slice(0, 10))}
    `;
    setMessages((prev) => [...prev, { sender: 'user', text: question, timestamp: new Date().toLocaleTimeString() }]);
    setQuestion('');
    sendPromptToOpenAI(questionPrompt);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Typography variant="h3" align="center" className="bg-gradient-to-r from-emerald-600 to-teal-500 text-transparent bg-clip-text font-extrabold">
          Insights for {deviceName}
        </Typography>
        <Typography variant="body1" align="center" color="white" paragraph>
          Get AI-powered insights and answers to your energy usage questions.
        </Typography>
        
        <Box className="bg-white dark:bg-gray-700 rounded-3xl shadow-xl p-8 mt-6 transition-all duration-500">
          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth" centered>
            <Tab label="Ask Questions" className="font-semibold text-lg text-gray-600 dark:text-gray-300 hover:text-teal-500"/>
          </Tabs>

          <Box p={4} className="flex flex-col space-y-4">
            <div className="overflow-y-auto max-h-72 space-y-4 transition-all duration-500">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl ${message.sender === 'ai' ? 'bg-gradient-to-br from-emerald-200 to-emerald-100 dark:from-emerald-800 dark:to-emerald-700' : 'bg-gradient-to-br from-blue-200 to-blue-100 dark:from-blue-800 dark:to-blue-700'} text-gray-900 dark:text-gray-200 shadow-md`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about the data..."
                className="flex-1 p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-white transition duration-300"
                disabled={isLoading}
              />
              <button
                onClick={handleQuestionSubmit}
                disabled={isLoading || !question.trim()}
                className="p-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white disabled:opacity-50 transition-transform duration-300 hover:scale-105 shadow-lg"
              >
                {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </Box>
        </Box>

        <div className="mt-10 flex items-center justify-center">
          <button
            onClick={handleInsightsRequest}
            disabled={isLoading}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold disabled:opacity-50 transition-transform duration-300 hover:scale-105 shadow-lg"
          >
            {isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : 'Generate Insights'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsightsPage;

