import { useState } from 'react';
import axios from 'axios';
import { ArrowPathIcon, ArrowsRightLeftIcon, ClipboardIcon, ClipboardDocumentCheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

// List of supported languages
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'hi', name: 'Hindi' },
];

function App() {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [apiKey, setApiKey] = useState(
    (import.meta.env.VITE_RAPIDAPI_KEY || localStorage.getItem('rapidapi_key') || '').trim()
  );
  const [tempKey, setTempKey] = useState('');

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  const translateText = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to translate');
      return;
    }

    if (!apiKey) {
      setError('Missing RapidAPI key. Enter your key below and click Save, or add VITE_RAPIDAPI_KEY as a build secret.');
      return;
    }

    setIsLoading(true);
    setError('');

    const options = {
      method: 'POST',
      url: 'https://text-translator2.p.rapidapi.com/translate',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'text-translator2.p.rapidapi.com',
      },
      data: new URLSearchParams({
        source_language: sourceLang,
        target_language: targetLang,
        text: inputText,
      }),
    };

    try {
      const response = await axios.request(options);
      // text-translator2 returns translated text at data.data.translatedText
      setTranslatedText(response?.data?.data?.translatedText || '');
    } catch (err) {
      console.error('Translation error:', err);
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        setError('Authorization failed (401/403). Ensure your RapidAPI key is valid and you are subscribed to text-translator2 (free plan)');
      } else if (err?.response?.status === 429) {
        setError('Rate limit exceeded (429). Please wait and try again.');
      } else {
        setError('Failed to translate. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearText = () => {
    setInputText('');
    setTranslatedText('');
    setError('');
  };

  const copyTranslated = async () => {
    if (!translatedText) return;
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      // ignore errors copying to clipboard
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-indigo-700">Language Translator</h1>
          <p className="mt-3 text-gray-600">Type in English and translate into your favorite language using RapidAPI.</p>
        </div>

        {!apiKey && (
          <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 p-4 text-sm space-y-3">
            <div>
              No API key detected. You can either:
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Add <code className="px-1 py-0.5 bg-amber-100 rounded">VITE_RAPIDAPI_KEY</code> as a GitHub Action secret and redeploy</li>
                <li>Or paste your key below to use it immediately (stored in your browser only)</li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="password"
                className="flex-1 rounded-md border border-amber-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Paste your RapidAPI key"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
              />
              <button
                onClick={() => {
                  const k = tempKey.trim();
                  if (!k) return;
                  localStorage.setItem('rapidapi_key', k);
                  setApiKey(k);
                  setTempKey('');
                  setError('');
                }}
                className="inline-flex items-center justify-center rounded-md bg-amber-600 px-4 py-2 text-white hover:bg-amber-700"
              >
                Save Key
              </button>
            </div>
          </div>
        )}

        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl overflow-hidden ring-1 ring-black/5">
          {/* Language Selection */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white">
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="bg-white text-gray-900 border border-white/20 rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              {LANGUAGES.map((lang) => (
                <option key={`source-${lang.code}`} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>

            <button
              onClick={swapLanguages}
              className="p-2 rounded-full bg-white/90 text-indigo-600 hover:bg-white transition-colors shadow"
              aria-label="Swap languages"
            >
              <ArrowsRightLeftIcon className="h-5 w-5" />
            </button>

            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="bg-white text-gray-900 border border-white/20 rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              {LANGUAGES.map((lang) => (
                <option key={`target-${lang.code}`} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Text Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="space-y-2">
              <label htmlFor="input-text" className="block text-sm font-medium text-gray-700">
                Source Text
              </label>
              <textarea
                id="input-text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full h-64 p-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                placeholder="Enter text to translate..."
              />
              <div className="flex gap-2">
                <button
                  onClick={clearText}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  <XMarkIcon className="h-4 w-4" /> Clear
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="translated-text" className="block text-sm font-medium text-gray-700">
                Translation
              </label>
              <div className="relative">
                <textarea
                  id="translated-text"
                  value={translatedText}
                  readOnly
                  className="w-full h-64 p-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  placeholder="Translation will appear here..."
                />
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                    <ArrowPathIcon className="h-8 w-8 text-indigo-600 animate-spin" />
                  </div>
                )}
                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  <button
                    onClick={copyTranslated}
                    disabled={!translatedText}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border ${translatedText ? 'border-gray-300 text-gray-700 hover:bg-white' : 'border-gray-200 text-gray-400 cursor-not-allowed'}`}
                  >
                    {copied ? (
                      <>
                        <ClipboardDocumentCheckIcon className="h-4 w-4 text-emerald-600" /> Copied
                      </>
                    ) : (
                      <>
                        <ClipboardIcon className="h-4 w-4" /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-3 p-5 bg-gray-50 border-t border-gray-100">
            <button
              onClick={translateText}
              disabled={isLoading || !inputText.trim()}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium shadow ${isLoading || !inputText.trim() ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {isLoading ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                  Translating...
                </>
              ) : (
                'Translate'
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700">
            {error}
          </div>
        )}

        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>Powered by RapidAPI</p>
          <p className="mt-1">You can supply the key at build time (VITE_RAPIDAPI_KEY) or paste it in the banner above.</p>
        </footer>
      </div>
    </div>
  )
}
export default App
