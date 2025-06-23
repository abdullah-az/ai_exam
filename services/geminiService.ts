import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Question, GeneratedQuestionPayload } from '../types';
import { GEMINI_MODEL_NAME, UI_TEXTS, PDF_TEXT_MAX_LENGTH } from "../constants";

// TODO: Backend Integration - API_KEY should be managed by the backend.
// Frontend should not directly access process.env.API_KEY for Gemini calls.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error(UI_TEXTS.apiKeyMissing);
  // alert(UI_TEXTS.apiKeyMissing); 
}

// TODO: Backend Integration - This 'ai' instance for direct Gemini calls will be removed.
// All interactions with Gemini should go through backend API endpoints.
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const formatChoiceForPrompt = (choice: { text: string; is_correct: boolean }) => {
  return `{ "text": "${choice.text.replace(/"/g, '\\"')}", "is_correct": ${choice.is_correct} }`;
};

const formatQuestionForPrompt = (question: Question) => {
  const choicesString = question.choices.map(formatChoiceForPrompt).join(',\n    ');
  return `
{
  "text": "${question.text.replace(/"/g, '\\"')}",
  "choices": [
    ${choicesString}
  ],
  "course_year": ${question.course_year},
  "mark": ${question.mark}
}`;
};


export const generateQuestionsFromAI = async (
  exampleQuestions: Question[],
  specializationName: string,
  numQuestions: number
): Promise<GeneratedQuestionPayload[]> => {
  // TODO: Backend Integration - This function should be removed from frontend.
  // Frontend will call a backend endpoint like POST /api/ai/generate-questions-from-examples/
  // The backend will then perform the logic below and call Gemini API.
  if (!ai) {
    throw new Error(UI_TEXTS.apiKeyMissing);
  }

  const currentYearPlusOne = new Date().getFullYear() + 1;

  const examplesString = exampleQuestions
    .map((q, index) => `مثال ${index + 1}:\n\`\`\`json${formatQuestionForPrompt(q)}\n\`\`\``)
    .join('\n\n');

  const prompt = `أنت خبير في إنشاء أسئلة امتحانات هندسة الحاسوب. قم بإنشاء ${numQuestions} أسئلة اختيار من متعدد (MCQ) جديدة لتخصص '${specializationName}'.
يجب أن تكون الأسئلة باللغة العربية. يجب أن تتبع الأسئلة الجديدة نفس أسلوب وصعوبة الأمثلة التالية، مع الالتزام الصارم بتنسيق JSON المحدد للإخراج.

أمثلة على الأسئلة (لا تقم بتكرار هذه الأسئلة بالضبط، استخدمها كمرجع للأسلوب والمحتوى):
${examplesString}

التعليمات الخاصة بالإخراج:
قم بإرجاع إجابتك **فقط** كمصفوفة JSON صالحة. يجب أن تحتوي كل كائن في المصفوفة على الهيكل التالي بالضبط:
\`\`\`json
{
  "text": "نص السؤال هنا",
  "choices": [
    { "text": "نص الاختيار الأول", "is_correct": boolean },
    { "text": "نص الاختيار الثاني", "is_correct": boolean }
    // ... يمكن أن يكون هناك المزيد من الاختيارات، عادة 3 أو 4
  ],
  "course_year": ${currentYearPlusOne},
  "mark": 5
}
\`\`\`
تأكد من أن اختيارًا واحدًا فقط لكل سؤال لديه \`"is_correct"\` بقيمة \`true\`. لا تقم بتضمين أي نص أو تفسيرات إضافية خارج مصفوفة JSON.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7, 
      }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }
    
    const generatedQuestions = JSON.parse(jsonStr) as GeneratedQuestionPayload[];
    
    if (!Array.isArray(generatedQuestions)) {
        throw new Error("AI response is not an array.");
    }
    generatedQuestions.forEach(q => {
        if (!q.text || !Array.isArray(q.choices) || q.choices.length === 0) {
            throw new Error("AI response contains malformed question data.");
        }
        const correctChoices = q.choices.filter(c => c.is_correct === true);
        if (correctChoices.length !== 1) {
             console.warn(`Question "${q.text.substring(0,30)}..." has ${correctChoices.length} correct answers. Fixing to one.`)
             if (q.choices.length > 0) {
                q.choices.forEach((choice, index) => choice.is_correct = (index === 0));
             }
        }
    });

    return generatedQuestions;

  } catch (error) {
    console.error("Error generating questions from AI:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("quota") || errorMessage.includes("Quota")) {
         throw new Error(`خطأ في واجهة Gemini: تجاوز الحصة المخصصة. يرجى المحاولة لاحقًا أو التحقق من خطة الاستخدام الخاصة بك.`);
    }
    if (errorMessage.includes("API key not valid")) {
        throw new Error(`خطأ في واجهة Gemini: مفتاح API غير صالح. يرجى التحقق من مفتاحك.`);
    }
    throw new Error(`${UI_TEXTS.errorOccurred} أثناء الاتصال بـ Gemini API: ${errorMessage}`);
  }
};


export const generateQuestionsFromPDFText = async (
  pdfText: string,
  specializationName: string,
  numQuestions: number
): Promise<GeneratedQuestionPayload[]> => {
  // TODO: Backend Integration - This function should be removed from frontend.
  // Frontend will call a backend endpoint like POST /api/ai/generate-questions-from-pdf/
  // The backend will then perform the logic below (including PDF text extraction if not done by frontend before sending) and call Gemini API.
  if (!ai) {
    throw new Error(UI_TEXTS.apiKeyMissing);
  }

  const currentYearPlusOne = new Date().getFullYear() + 1;
  const truncatedPdfText = pdfText.substring(0, PDF_TEXT_MAX_LENGTH);

  const prompt = `أنت خبير في إنشاء أسئلة امتحانات هندسة الحاسوب. قم بإنشاء ${numQuestions} أسئلة اختيار من متعدد (MCQ) جديدة لتخصص '${specializationName}' **بناءً على المحتوى التالي المستخرج من ملف PDF**:

--- بداية محتوى PDF ---
${truncatedPdfText}
--- نهاية محتوى PDF ---

التعليمات الخاصة بالإخراج:
يجب أن تكون الأسئلة باللغة العربية.
قم بإرجاع إجابتك **فقط** كمصفوفة JSON صالحة. يجب أن تحتوي كل كائن في المصفوفة على الهيكل التالي بالضبط:
\`\`\`json
{
  "text": "نص السؤال هنا",
  "choices": [
    { "text": "نص الاختيار الأول", "is_correct": boolean },
    { "text": "نص الاختيار الثاني", "is_correct": boolean }
    // ... يمكن أن يكون هناك المزيد من الاختيارات، عادة 3 أو 4
  ],
  "course_year": ${currentYearPlusOne},
  "mark": 5
}
\`\`\`
تأكد من أن اختيارًا واحدًا فقط لكل سؤال لديه \`"is_correct"\` بقيمة \`true\`.
يجب أن تكون الأسئلة **مرتبطة بشكل مباشر بالمحتوى المقدم من ملف PDF**. لا تقم بتضمين أي نص أو تفسيرات إضافية خارج مصفوفة JSON.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME, 
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.6, 
      }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }
    
    const generatedQuestions = JSON.parse(jsonStr) as GeneratedQuestionPayload[];
    
    if (!Array.isArray(generatedQuestions)) {
        throw new Error("AI response is not an array.");
    }
    generatedQuestions.forEach(q => {
        if (!q.text || !Array.isArray(q.choices) || q.choices.length === 0) {
            throw new Error("AI response contains malformed question data.");
        }
        const correctChoices = q.choices.filter(c => c.is_correct === true);
        if (correctChoices.length !== 1) {
             console.warn(`Question (from PDF) "${q.text.substring(0,30)}..." has ${correctChoices.length} correct answers. Fixing to one.`);
             if (q.choices.length > 0) {
                q.choices.forEach((choice, index) => choice.is_correct = (index === 0));
             }
        }
    });

    return generatedQuestions;

  } catch (error) {
    console.error("Error generating questions from PDF text via AI:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
     if (errorMessage.includes("quota") || errorMessage.includes("Quota")) {
         throw new Error(`خطأ في واجهة Gemini: تجاوز الحصة المخصصة. يرجى المحاولة لاحقًا أو التحقق من خطة الاستخدام الخاصة بك.`);
    }
    if (errorMessage.includes("API key not valid")) {
        throw new Error(`خطأ في واجهة Gemini: مفتاح API غير صالح. يرجى التحقق من مفتاحك.`);
    }
    throw new Error(`${UI_TEXTS.errorOccurred} أثناء إنشاء الأسئلة من PDF: ${errorMessage}`);
  }
};