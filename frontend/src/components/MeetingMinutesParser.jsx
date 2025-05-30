import { useState } from 'react';
import { taskService } from '../services/api';
import { toast } from '../utils/toast';

const MeetingMinutesParser = ({ onTasksCreated }) => {
  const [transcript, setTranscript] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const handleParse = async () => {
    if (!transcript.trim()) {
      toast.error('Please enter meeting minutes to parse');
      return;
    }

    setIsParsing(true);
    try {
      const response = await taskService.parseMeetingMinutes(transcript);
      toast.success(`Successfully created ${response.length} tasks`);
      setTranscript('');
      if (onTasksCreated) {
        onTasksCreated();
      }
    } catch (error) {
      console.error('Error parsing meeting minutes:', error);
      toast.error('Failed to parse meeting minutes. Please try again.');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="transcript" className="block text-sm font-medium text-gray-700 mb-1">
          Paste Meeting Minutes
        </label>
        <textarea
          id="transcript"
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Example: Aman you take the landing page by 10pm tomorrow. Rajeev you take care of client follow-up by Wednesday. Shreya please review the marketing deck tonight."
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
        />
        <p className="mt-1 text-xs text-gray-500">
          The AI will automatically extract tasks with assignees and due dates.
        </p>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleParse}
          disabled={isParsing}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isParsing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Parsing...
            </>
          ) : (
            'Extract Tasks'
          )}
        </button>
      </div>
    </div>
  );
};

export default MeetingMinutesParser;
