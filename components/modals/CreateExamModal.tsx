
import React, { useState, useEffect } from 'react';
import { Button, Input, Textarea, Select } from '../../App'; // Adjust path
import { UI_TEXTS, FaIcons, MOCK_SPECIALIZATIONS, MOCK_EXAM_SETTINGS_DEFAULT } from '../../constants';
import type { AdminExamDefinition, ExamSettingOptions } from '../../types';
import { useExams } from '../../App'; // Adjust path for useExams

interface CreateExamModalProps {
  examToEdit?: AdminExamDefinition | null;
  onClose: () => void;
}

const CreateExamModal: React.FC<CreateExamModalProps> = ({ examToEdit, onClose }) => {
  const { addAdminExamDefinition, updateAdminExamDefinition } = useExams();
  
  const initialFormState: Omit<AdminExamDefinition, 'id' | 'createdAt'> = {
    name: '',
    description: '',
    durationMinutes: 60,
    passingGradePercent: 70,
    specialization_id: MOCK_SPECIALIZATIONS[0]?.id || '',
    settings: { ...MOCK_EXAM_SETTINGS_DEFAULT },
  };

  const [formData, setFormData] = useState<Omit<AdminExamDefinition, 'id' | 'createdAt'>>(initialFormState);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (examToEdit) {
      setFormData({
        name: examToEdit.name,
        description: examToEdit.description,
        durationMinutes: examToEdit.durationMinutes,
        passingGradePercent: examToEdit.passingGradePercent,
        specialization_id: examToEdit.specialization_id,
        settings: { ...examToEdit.settings },
      });
    } else {
      setFormData(initialFormState);
    }
  }, [examToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setError(null);
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSettingChange = (settingKey: keyof ExamSettingOptions) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [settingKey]: !prev.settings[settingKey],
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.name.trim()) { setError("اسم الامتحان مطلوب."); return; }
    if (formData.durationMinutes <= 0) { setError("مدة الامتحان يجب أن تكون أكبر من صفر."); return; }
    if (formData.passingGradePercent < 0 || formData.passingGradePercent > 100) { setError("درجة النجاح يجب أن تكون بين 0 و 100."); return; }

    if (examToEdit) {
      updateAdminExamDefinition({ ...formData, id: examToEdit.id, createdAt: examToEdit.createdAt });
    } else {
      addAdminExamDefinition(formData);
    }
    // alert(UI_TEXTS.examSaved); // Consider a more robust notification system
    onClose();
  };

  const examSettingsFields: { key: keyof ExamSettingOptions; label: string }[] = [
    { key: 'showResultImmediately', label: UI_TEXTS.settingShowResultImmediately },
    { key: 'allowRetries', label: UI_TEXTS.settingAllowRetries },
    { key: 'allowNavigateBack', label: UI_TEXTS.settingAllowNavigateBack },
    { key: 'allowAutoGrading', label: UI_TEXTS.settingAllowAutoGrading },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-3xl">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium">{examToEdit ? UI_TEXTS.editExam : UI_TEXTS.createExam}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <i className={FaIcons.TIMES}></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input label={UI_TEXTS.examName} id="name" name="name" value={formData.name} onChange={handleChange} placeholder="أدخل اسم الامتحان" required />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input type="number" label={UI_TEXTS.examDuration} id="durationMinutes" name="durationMinutes" value={formData.durationMinutes} onChange={handleChange} placeholder="60" required min="1"/>
            <Input type="number" label={UI_TEXTS.examPassingGrade} id="passingGradePercent" name="passingGradePercent" value={formData.passingGradePercent} onChange={handleChange} placeholder="70" required min="0" max="100"/>
            <Select label={UI_TEXTS.selectSpecialization} id="specialization_id" name="specialization_id" value={formData.specialization_id} onChange={handleChange} options={MOCK_SPECIALIZATIONS.map(s => ({value: s.id, label: s.name}))} required />
          </div>
          
          <Textarea label={UI_TEXTS.examDescription} id="description" name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="أدخل وصفاً للامتحان..." />
          
          <fieldset className="border p-4 rounded-md">
            <legend className="text-md font-semibold px-2">{UI_TEXTS.examSettings}</legend>
            <div className="space-y-2">
              {examSettingsFields.map(field => (
                <label key={field.key} className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.settings[field.key]}
                    onChange={() => handleSettingChange(field.key)}
                    className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300" 
                  />
                  <span className="mr-2 text-sm text-gray-700">{field.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          
          {error && <p className="text-red-500 bg-red-50 p-2 rounded-md text-sm">{error}</p>}

          <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-4">
            <Button type="button" variant="secondary" onClick={onClose}> {UI_TEXTS.cancel} </Button>
            <Button type="submit" variant="primary"> {UI_TEXTS.saveExam} </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExamModal;
