import React, { useState, useEffect } from 'react';
import { useQuestions, Button, Input, Select, Textarea } from '../../App'; // Adjust path
import { UI_TEXTS, MOCK_SPECIALIZATIONS, FaIcons } from '../../constants';
import type { Question, Choice, Attachment, AdminQuestionFormValues } from '../../types';
import { AttachmentType } from '../../types';

interface AddQuestionModalProps {
  questionToEdit?: Question | null;
  onClose: () => void;
}

const AddQuestionModal: React.FC<AddQuestionModalProps> = ({ questionToEdit, onClose }) => {
  const { addQuestion, updateQuestion } = useQuestions();
  const [formData, setFormData] = useState<AdminQuestionFormValues>({
    text: '',
    specialization_id: MOCK_SPECIALIZATIONS[0]?.id || '',
    course_year: new Date().getFullYear(),
    mark: 5,
    choices: [{ text: '', is_correct: true }, { text: '', is_correct: false }],
    attachments: [],
  });
  const [error, setError] = useState<string | null>(null);
  // TODO: Backend Integration - State for managing actual file objects for upload
  // const [attachmentFiles, setAttachmentFiles] = useState<Record<number, File | null>>({});


  useEffect(() => {
    if (questionToEdit) {
      setFormData({
        ...questionToEdit,
        choices: questionToEdit.choices.map(c => ({ ...c })),
        attachments: questionToEdit.attachments ? questionToEdit.attachments.map(a => ({ ...a })) : [],
      });
    } else {
      // Reset for new question
      setFormData({
        text: '', specialization_id: MOCK_SPECIALIZATIONS[0]?.id || '',
        course_year: new Date().getFullYear(), mark: 5,
        choices: [{ text: '', is_correct: true }, { text: '', is_correct: false }],
        attachments: [],
      });
    }
  }, [questionToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleChoiceChange = (index: number, field: 'text' | 'is_correct', value: string | boolean) => {
    const newChoices = [...formData.choices];
    if (field === 'is_correct' && typeof value === 'boolean') {
        newChoices.forEach((choice, i) => choice.is_correct = (i === index ? value : (value ? false : choice.is_correct))); 
        if (!newChoices.some(c => c.is_correct) && newChoices.length > 0) newChoices[0].is_correct = true; 
    } else if (field === 'text' && typeof value === 'string') {
        newChoices[index] = { ...newChoices[index], text: value };
    }
    setFormData(prev => ({ ...prev, choices: newChoices }));
  };

  const addChoice = () => {
    setFormData(prev => ({
      ...prev,
      choices: [...prev.choices, { text: '', is_correct: prev.choices.every(c => !c.is_correct) }],
    }));
  };

  const removeChoice = (index: number) => {
    const newChoices = formData.choices.filter((_, i) => i !== index);
    if (newChoices.length > 0 && !newChoices.some(c => c.is_correct)) newChoices[0].is_correct = true;
    setFormData(prev => ({ ...prev, choices: newChoices }));
  };

  const handleAttachmentChange = (index: number, field: keyof Omit<Attachment, 'id'>, value: string | AttachmentType ) => {
    const newAttachments = [...formData.attachments];
    // TODO: Backend Integration - If 'file_url' is for a File object, this needs adjustment.
    // The actual File object would be stored separately and uploaded. 'file_url' would be set by backend response.
    newAttachments[index] = { ...newAttachments[index], [field as string]: value };
    setFormData(prev => ({...prev, attachments: newAttachments}));
  };

  // TODO: Backend Integration - Handle actual file selection for attachments
  // const handleAttachmentFileChange = (index: number, file: File | null) => {
  //   setAttachmentFiles(prev => ({ ...prev, [index]: file }));
  //   // Optionally update formData.attachments[index].file_name
  //   const newAttachments = [...formData.attachments];
  //   newAttachments[index] = { ...newAttachments[index], file_name: file?.name || '' };
  //   setFormData(prev => ({...prev, attachments: newAttachments}));
  // };


  const addAttachment = () => {
    setFormData(prev => ({...prev, attachments: [...prev.attachments, {file_url: '', attachment_type: AttachmentType.TEXT, file_name: '', content: ''}]}));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({...prev, attachments: formData.attachments.filter((_,i) => i !== index)}));
    // TODO: Backend Integration - Also remove from `attachmentFiles` state if used.
    // If editing, may need to mark for deletion on backend if attachment already exists.
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.text.trim()) { setError('نص السؤال مطلوب.'); return; }
    if (formData.choices.length < 2) { setError('يجب أن يكون هناك اختياران على الأقل.'); return; }
    if (!formData.choices.some(c => c.is_correct)) { setError('يجب تحديد اختيار صحيح واحد على الأقل.'); return; }
    if (formData.choices.filter(c => c.is_correct).length > 1 && !confirm("أكثر من اختيار محدد كصحيح. هل تريد المتابعة؟")) {
       setError('يمكن تحديد اختيار صحيح واحد فقط عادةً.'); return; 
    }
    if (formData.choices.some(c => !c.text.trim())) { setError('نص جميع الاختيارات مطلوب.'); return; }

    // TODO: Backend Integration - When submitting:
    // 1. Create a FormData object for multipart/form-data.
    // 2. Append question data (text, specialization_id, etc.) as JSON string or individual fields.
    // 3. Append each actual file from `attachmentFiles` state.
    // 4. `addQuestion` or `updateQuestion` should send this FormData to the backend.
    // 5. Backend will save question, handle file uploads, and return the saved Question object.
    // `formData.attachments` sent to backend might only contain metadata for new files, or info about existing/deleted ones.

    const questionToSave: Question = {
      ...formData,
      id: questionToEdit?.id || `q-${Date.now()}`, // Backend should generate ID
      is_ai_generated: questionToEdit?.is_ai_generated || false,
      choices: formData.choices.map((c, i) => ({ ...c, id: c.id || `c-${Date.now()}-${i}` })), // Backend should generate IDs
      attachments: formData.attachments?.map((a, i) => ({ ...a, id: a.id || `att-${Date.now()}-${i}` })), // Backend should generate IDs and set file_url
    };

    if (questionToEdit) {
      updateQuestion(questionToSave); // This will call the backend API
    } else {
      addQuestion(questionToSave); // This will call the backend API
    }
    // alert(UI_TEXTS.questionSaved);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-3xl">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium">{questionToEdit ? UI_TEXTS.editQuestion : UI_TEXTS.addQuestion}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <i className={FaIcons.TIMES}></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <Textarea label={UI_TEXTS.questionText} id="text" name="text" value={formData.text} onChange={handleChange} rows={3} required />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select label={UI_TEXTS.selectSpecialization} id="specialization_id" name="specialization_id" value={formData.specialization_id} onChange={handleChange} options={MOCK_SPECIALIZATIONS.map(s => ({value: s.id, label: s.name}))} required />
            <Input label={UI_TEXTS.courseYear} type="number" id="course_year" name="course_year" value={formData.course_year} onChange={handleChange} required />
            <Input label={UI_TEXTS.mark} type="number" id="mark" name="mark" value={formData.mark} onChange={handleChange} required min="1" />
          </div>

          <fieldset className="border p-4 rounded-md">
            <legend className="text-md font-semibold px-2">{UI_TEXTS.choicesLabel}</legend>
            {formData.choices.map((choice, index) => (
              <div key={index} className="flex items-center gap-3 mb-3 p-2 border-b last:border-b-0">
                <input type="radio" name="correct_choice_radio" id={`choice-radio-${index}`} checked={choice.is_correct} onChange={() => handleChoiceChange(index, 'is_correct', true)} className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                <Input type="text" placeholder={`${UI_TEXTS.optionPlaceholder(index + 1)}`} value={choice.text} onChange={e => handleChoiceChange(index, 'text', e.target.value)} className="flex-grow" required />
                {formData.choices.length > 2 && <Button type="button" variant="danger" onClick={() => removeChoice(index)} className="p-1 text-xs"><i className={FaIcons.TRASH}></i></Button>}
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={addChoice} className="text-sm py-1 px-3 mt-2"><i className={`${FaIcons.PLUS} ml-1`}></i> {UI_TEXTS.addChoice}</Button>
          </fieldset>
          
          <fieldset className="border p-4 rounded-md">
            <legend className="text-md font-semibold px-2">{UI_TEXTS.attachments}</legend>
             {formData.attachments?.map((att, index) => (
                <div key={`attachment-form-${index}`} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 p-2 border-b last:border-b-0 items-end">
                    <Input label={UI_TEXTS.fileName} type="text" value={att.file_name || ''} onChange={e => handleAttachmentChange(index, 'file_name', e.target.value)} placeholder="e.g. diagram.png" />
                     {/* TODO: Backend Integration - For file types (IMAGE, DIAGRAM), this should be a file input.
                         The `file_url` would be populated by backend response after upload.
                         For CODE/TEXT, `content` is used. `file_url` might be empty or point to a raw text file if stored as such.
                     */}
                    <Input label={UI_TEXTS.fileURL} type="text" value={att.file_url} onChange={e => handleAttachmentChange(index, 'file_url', e.target.value)} placeholder="URL or text for code" />
                    <Select label={UI_TEXTS.attachmentType} value={att.attachment_type} onChange={e => handleAttachmentChange(index, 'attachment_type', e.target.value as AttachmentType)} options={Object.values(AttachmentType).map(at => ({value: at, label: UI_TEXTS[at] || at}))} />
                    { (att.attachment_type === AttachmentType.CODE || att.attachment_type === AttachmentType.TEXT) && 
                        <Textarea label="المحتوى (للكود/النص)" value={att.content || ''} onChange={e => handleAttachmentChange(index, 'content', e.target.value)} rows={2} className="md:col-span-3"/>
                    }
                    <Button type="button" variant="danger" onClick={() => removeAttachment(index)} className="p-1 text-xs md:col-start-4 self-center"><i className={FaIcons.TRASH}></i></Button>
                </div>
            ))}
             <Button type="button" variant="secondary" onClick={addAttachment} className="text-sm py-1 px-3 mt-2"><i className={`${FaIcons.PLUS} ml-1`}></i> {UI_TEXTS.addAttachment}</Button>
             
             {/* TODO: Backend Integration - Actual file input for uploading attachments */}
             <div className="mt-4 p-4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 text-center">
                 <label htmlFor="question-attachment-upload" className="cursor-pointer">
                     <i className={`${FaIcons.UPLOAD} text-gray-400 text-3xl mb-2`}></i>
                     <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">{UI_TEXTS.uploadFilePrompt}</span> {UI_TEXTS.uploadPDFHint}</p>
                 </label>
                 <input 
                    id="question-attachment-upload" 
                    type="file" 
                    className="hidden" 
                    multiple
                    // onChange={e => handleMultipleFilesSelected(e.target.files)} 
                 />
             </div>
          </fieldset>

          {error && <p className="text-red-500 bg-red-50 p-2 rounded-md">{error}</p>}
          
          <div className="flex justify-end space-x-3 rtl:space-x-reverse">
            <Button type="button" variant="secondary" onClick={onClose}> {UI_TEXTS.cancel} </Button>
            <Button type="submit" variant="primary"> {questionToEdit ? UI_TEXTS.saveQuestion : UI_TEXTS.addQuestion} </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddQuestionModal;