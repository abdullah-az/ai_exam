import React, { useState } from 'react';
import { Button, Select, Input } from '../../App'; // Adjust path
import { UI_TEXTS, DEFAULT_AI_SETTINGS, AVAILABLE_AI_MODELS, FaIcons } from '../../constants';
import type { AISettings } from '../../types';
import { PDFQuestionGeneratorTool } from '../../App'; // Re-export for direct use, or import directly

interface AISettingsModalProps {
  onClose: () => void;
}

const AISettingsModal: React.FC<AISettingsModalProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<AISettings>(() => {
    // TODO: API Call - Replace localStorage with API call to GET /api/admin/ai-settings/
    // This should fetch the admin's currently saved AI model preference.
    // API_KEY itself is NOT stored or fetched by frontend.
    const storedSettings = localStorage.getItem('aiSettings');
    return storedSettings ? JSON.parse(storedSettings) : DEFAULT_AI_SETTINGS;
  });
  const [message, setMessage] = useState('');

  const handleSave = () => {
    // TODO: API Call - Replace localStorage with API call to POST /api/admin/ai-settings/
    // This should save the admin's selected_model preference.
    localStorage.setItem('aiSettings', JSON.stringify(settings));
    setMessage(UI_TEXTS.settingsSaved);
    setTimeout(() => {
        setMessage('');
        onClose(); 
    }, 1500);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-2xl">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium">{UI_TEXTS.aiSettingsTitle}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <i className={FaIcons.TIMES}></i>
          </button>
        </div>
        
        <div className="p-6">
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="mb-6">
              <Select
                label={UI_TEXTS.selectAiModel}
                id="aiModel"
                value={settings.selected_model}
                onChange={e => setSettings(s => ({ ...s, selected_model: e.target.value }))}
                options={AVAILABLE_AI_MODELS.map(model => ({value: model.id, label: model.name}))}
              />
               {!process.env.API_KEY && ( // This check is for the direct Gemini calls. If backend proxies, this becomes less relevant here.
                 <p className="mt-2 text-xs text-red-500 bg-red-50 p-2 rounded-md">{UI_TEXTS.apiKeyMissing}</p>
               )}
            </div>
            
            {/* API Key input is against guidelines for frontend. Backend manages the API key.
            <div className="mb-6">
              <Input type="password" label={UI_TEXTS.apiKey} id="api-key" placeholder="أدخل مفتاح API الخاص بك" />
              <p className="mt-1 text-xs text-gray-500">{UI_TEXTS.apiKeyDescription}</p>
            </div> 
            */}
            
            <div className="mb-6">
                {/* PDFQuestionGeneratorTool will internally call its `generatePdfQuestions` which needs to be API-backed */}
                <PDFQuestionGeneratorTool 
                    isStudentView={false} 
                    onQuestionsGenerated={(generatedQuestions) => {
                        // TODO: Backend Integration - `addQuestionToGlobalList` inside PDFQuestionGeneratorTool (if called for admin)
                        // should trigger API calls to save these questions.
                        console.log("Questions generated from PDF in AI Settings:", generatedQuestions);
                        setMessage(`${generatedQuestions.length} ${UI_TEXTS.questionsGeneratedAndAdded}`);
                    }}
                />
            </div>
            
            <div className="flex justify-end space-x-3 rtl:space-x-reverse">
              {/* Test Connection might be a backend endpoint that tries a simple Gemini call with stored API key */}
              {/* <Button type="button" variant="secondary"> {UI_TEXTS.testConnection} </Button> */}
              <Button type="submit" variant="primary"> {UI_TEXTS.saveSettings} </Button>
            </div>
            {message && <p className="mt-4 text-green-600 text-center">{message}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AISettingsModal;