```md
# ملاحظات لمطور Django Backend - منصة امتحانات الهندسة المعلوماتية

## 1. مقدمة

مرحباً بك في مشروع منصة امتحانات الهندسة المعلوماتية! هذا المستند يهدف إلى توجيهك خلال عملية تطوير الواجهة الخلفية (Backend) باستخدام Django لخدمة الواجهة الأمامية (Frontend) المبنية باستخدام React و TypeScript.

**هيكل الواجهة الأمامية الحالي:**

*   **React:** لإدارة واجهة المستخدم والمكونات.
*   **TypeScript:** للتحقق من الأنواع وزيادة موثوقية الكود.
*   **React Router (HashRouter):** لإدارة التنقل بين الصفحات.
*   **React Context API:** لإدارة الحالة العامة للتطبيق (المصادقة، الأسئلة، الامتحانات).
*   **Tailwind CSS:** لتصميم الواجهة.
*   **localStorage:** يُستخدم حاليًا لتخزين البيانات بشكل مؤقت (سيتم استبداله باستدعاءات API).
*   **`constants.tsx`:** يحتوي على النصوص الثابتة، البيانات الوهمية الأولية، وتكوينات مثل أسماء نماذج AI.
*   **`types.ts`:** يحتوي على تعريفات الأنواع (Interfaces) المستخدمة في جميع أنحاء التطبيق. هذا الملف سيكون مرجعًا مهمًا لك عند تصميم نماذج Django.
*   **`services/geminiService.ts`:** يتولى حاليًا الاتصال المباشر بـ Gemini API. يُفضل أن يتم هذا الاتصال عبر الـ Backend.

## 2. نماذج البيانات الأساسية (Data Models)

الرجوع إلى ملف `types.ts` في الواجهة الأمامية للحصول على تعريفات مفصلة. النماذج الرئيسية المتوقعة في Django ستكون مشابهة لما يلي:

*   **`User`**: (مستخدمو Django الافتراضيون مع حقل إضافي للدور `role`: 'admin' أو 'student').
    *   `username`, `password`, `email`, `role` (`CharField`).
*   **`Specialization`**: (التخصصات الأكاديمية).
    *   `id` (e.g., 'swe', 'net'), `name` (`CharField`).
*   **`Attachment`**: (المرفقات الخاصة بالأسئلة).
    *   `file` (`FileField` لتخزين الملف الفعلي), `attachment_type` (`CharField` from `AttachmentType` enum), `file_name` (`CharField`), `content` (`TextField` للكود/النص).
    *   `question` (`ForeignKey` to `Question`).
*   **`Choice`**: (الاختيارات الخاصة بالأسئلة متعددة الخيارات).
    *   `text` (`TextField`), `is_correct` (`BooleanField`).
    *   `question` (`ForeignKey` to `Question`).
*   **`Question`**: (أسئلة الامتحانات).
    *   `text` (`TextField`), `course_year` (`IntegerField`), `mark` (`IntegerField`), `is_ai_generated` (`BooleanField`).
    *   `specialization` (`ForeignKey` to `Specialization`).
    *   (علاقة `ManyToManyField` أو `ForeignKey` عكسية للـ `Attachment` و `Choice`).
*   **`AdminExamDefinition`**: (تعريفات الامتحانات التي ينشئها المشرف).
    *   `name` (`CharField`), `description` (`TextField`), `durationMinutes` (`IntegerField`), `passingGradePercent` (`IntegerField`).
    *   `settings_showResultImmediately`, `settings_allowRetries`, etc. (`BooleanField` لكل إعداد).
    *   `specialization` (`ForeignKey` to `Specialization`).
    *   `createdAt` (`DateTimeField`).
*   **`ExamSession`**: (جلسات الامتحانات التي يجريها الطلاب).
    *   `student` (`ForeignKey` to `User`).
    *   `admin_exam_definition` (`ForeignKey` to `AdminExamDefinition`, nullable if it's a custom student-defined exam).
    *   `specialization` (`ForeignKey` to `Specialization`).
    *   `exam_name` (`CharField`).
    *   `score` (`IntegerField`).
    *   `completed_at` (`DateTimeField`).
    *   (تحتاج إلى طريقة لتخزين إجابات الطالب والأسئلة التي تم عرضها في هذه الجلسة - ربما علاقة ManyToMany مع `Question` من خلال جدول وسيط يخزن `selected_choice_id`).
*   **`AISetting`**: (لتخزين إعدادات AI مثل مفتاح API).
    *   `gemini_api_key` (`CharField`, يجب تشفيره أو تخزينه كمتغير بيئة تتم إدارته عبر لوحة تحكم Django).
    *   `selected_model_name` (`CharField`).

## 3. المصادقة والترخيص (Authentication & Authorization)

الواجهة الأمامية تستخدم حاليًا نظام مصادقة وهمي بسيط. يُقترح استخدام Django Rest Framework (DRF) مع:

*   **TokenAuthentication (JWT)**: هو الخيار المفضل للتطبيقات الحديثة.
*   أو **SessionAuthentication** إذا كنت تفضل ذلك.

**نقاط النهاية المقترحة:**

*   `POST /api/auth/login/`: لتسجيل دخول المستخدم. يرجع بيانات المستخدم (بما في ذلك الدور) و token.
*   `POST /api/auth/register/`: لتسجيل مستخدم جديد (طالب بشكل افتراضي، أو يمكن تحديد الدور إذا كان التسجيل يتم عبر المشرف).
*   `POST /api/auth/logout/`: لتسجيل خروج المستخدم (إلغاء صلاحية الـ token).
*   `GET /api/auth/user/`: للحصول على بيانات المستخدم الحالي المصادق عليه (باستخدام الـ token).

**الترخيص (Permissions):**

*   استخدم نظام صلاحيات DRF لتحديد الوصول إلى نقاط النهاية المختلفة بناءً على دور المستخدم (`isAdminUser`, `isStudentUser`).
*   مثال: المشرفون فقط يمكنهم الوصول إلى نقاط نهاية إدارة الأسئلة والمستخدمين. الطلاب يمكنهم فقط الوصول إلى نقاط نهاية بدء الامتحانات وعرض نتائجهم.

## 4. إدارة المستخدمين (بواسطة المشرف)

*   `GET, POST /api/admin/users/`:
    *   `GET`: قائمة بجميع المستخدمين مع إمكانية الفلترة (مثلاً بالدور).
    *   `POST`: إنشاء مستخدم جديد (مشرف أو طالب) بواسطة مشرف آخر.
*   `GET, PUT, DELETE /api/admin/users/<user_id>/`:
    *   عمليات على مستخدم محدد.

## 5. التخصصات (Specializations)

*   `GET /api/specializations/`: قائمة بالتخصصات المتاحة.
    *   هذه البيانات شبه ثابتة، يمكن إدارتها من خلال Django admin أو توفيرها كـ fixtures. الواجهة الأمامية حاليًا تستخدم قائمة ثابتة في `constants.tsx`.

## 6. إدارة الأسئلة (بواسطة المشرف)

**النموذج:** `Question`, `Choice`, `Attachment`.

*   `GET, POST /api/admin/questions/`:
    *   `GET`: قائمة بالأسئلة مع دعم للفلترة:
        *   `?specialization_id=<id>`
        *   `?course_year=<year>`
        *   `?search=<text>` (للبحث في نص السؤال)
        *   يجب أن تتضمن الاستجابة الاختيارات والمرفقات لكل سؤال.
    *   `POST`: إنشاء سؤال جديد. يجب أن يدعم الطلب إرسال نص السؤال، التخصص، سنة الدورة، العلامة، قائمة بالاختيارات (مع تحديد الصحيح)، وقائمة بالمرفقات.
        *   للمرفقات، سيتم إرسالها كـ `multipart/form-data`.
*   `GET, PUT, DELETE /api/admin/questions/<question_id>/`:
    *   عمليات على سؤال محدد.
    *   `PUT`: يجب أن يسمح بتعديل جميع حقول السؤال بما في ذلك إضافة/حذف/تعديل الاختيارات والمرفقات.

## 7. إدارة المرفقات (بواسطة المشرف)

*   يتم التعامل معها بشكل ضمني من خلال نقاط نهاية إدارة الأسئلة.
*   عند رفع مرفق (صورة، كود، نص، رسم)، يجب على Django التعامل مع `request.FILES`.
*   تخزين الملفات: في مجلد `media` أو خدمة تخزين سحابي (مثل AWS S3). الرابط للملف المخزن هو ما يتم حفظه في `Attachment.file_url` (أو يتم تقديمه مباشرة إذا كان `FileField`).
*   إذا كان المرفق نصيًا أو كودًا، يمكن تخزين المحتوى مباشرة في حقل `Attachment.content`.

## 8. إدارة تعريفات الامتحانات (بواسطة المشرف)

**النموذج:** `AdminExamDefinition`.

*   `GET, POST /api/admin/exam-definitions/`:
    *   `GET`: قائمة بجميع تعريفات الامتحانات.
    *   `POST`: إنشاء تعريف امتحان جديد.
*   `GET, PUT, DELETE /api/admin/exam-definitions/<definition_id>/`:
    *   عمليات على تعريف امتحان محدد.

## 9. دورة حياة امتحان الطالب

*   **إعداد الامتحان (Exam Setup):**
    *   الواجهة الأمامية تسمح للطالب باختيار التخصص وعدد الأسئلة ونوع الامتحان (قياسي/ذكي).
    *   **امتحان قياسي:**
        *   `POST /api/student/exams/start-standard/`:
            *   الطلب: `{ specialization_id: string, num_questions: int }`
            *   الاستجابة: قائمة بالأسئلة المسحوبة عشوائيًا من قاعدة البيانات (بدون `is_ai_generated: true`) للمواصفات المحددة.
    *   **امتحان ذكي (مولد بالـ AI):**
        *   `POST /api/student/exams/start-smart/`:
            *   الطلب: `{ specialization_id: string, num_questions: int }`
            *   الاستجابة: قائمة بأسئلة مولدة حديثًا بواسطة AI (انظر قسم تكامل AI). يجب *عدم* حفظ هذه الأسئلة بالضرورة في قاعدة البيانات الرئيسية بشكل دائم إذا كانت لمرة واحدة فقط، أو يمكن حفظها مع علامة خاصة.
*   **تقديم الامتحان (Exam Player):**
    *   الواجهة الأمامية تتعامل مع عرض الأسئلة، تتبع الوقت، وجمع إجابات الطالب في الحالة (state). لا توجد استدعاءات API لكل سؤال.
*   **تسليم الامتحان (Exam Submission):**
    *   `POST /api/student/exam-sessions/submit/`:
        *   الطلب:
            ```json
            {
              "student_id": "current_user_id",
              "specialization_id": "string",
              "admin_exam_definition_id": "string_or_null", // إذا كان مبنيًا على تعريف مشرف
              "exam_name": "string", // اسم الامتحان
              "questions_in_session": [ // قائمة بالأسئلة التي تم عرضها للطالب
                // Question object (at least id, mark)
              ],
              "answers": [
                { "question_id": "string", "selected_choice_id": "string_or_null" }
              ]
            }
            ```
        *   الاستجابة: كائن `ExamSession` مكتمل يتضمن النتيجة المحسوبة.
        *   يقوم الـ Backend بحساب النتيجة وحفظ جلسة الامتحان.
*   **مراجعة النتائج (Exam Results):**
    *   `GET /api/student/exam-sessions/`: قائمة بجميع جلسات الامتحانات السابقة للطالب الحالي.
    *   `GET /api/student/exam-sessions/<session_id>/`: تفاصيل جلسة امتحان محددة، بما في ذلك أسئلة الطالب، إجاباته، والإجابات الصحيحة.

## 10. تكامل الذكاء الاصطناعي (Gemini)

*   **إدارة مفتاح API:**
    *   يجب أن يوفر المشرف مفتاح Gemini API من خلال واجهة خاصة في لوحة تحكم المشرف.
    *   يجب على Django تخزين هذا المفتاح بشكل آمن (مشفر في قاعدة البيانات، أو متغير بيئة تتم إدارته عبر واجهة Django admin). **لا يجب تخزينه كنص عادي.**
*   **توصية: عمل Backend كـ Proxy لاستدعاءات Gemini API:**
    *   هذا يحمي مفتاح API من الانكشاف في الواجهة الأمامية.
    *   يسمح للـ Backend بإدارة المهام مثل التحكم في معدل الطلبات (rate limiting)، التخزين المؤقت (caching) إذا لزم الأمر، وتسجيل الأخطاء.
*   **نقاط نهاية مقترحة لـ AI (تستدعيها الواجهة الأمامية، ويقوم الـ Backend باستدعاء Gemini):**
    *   `POST /api/ai/generate-questions-from-examples/`:
        *   الطلب: `{ example_questions: Question[], specialization_name: string, num_questions: int }`
        *   يقوم الـ Backend بتنسيق الـ prompt وإرساله إلى Gemini API باستخدام المفتاح المخزن.
        *   الاستجابة: قائمة بـ `GeneratedQuestionPayload[]` (انظر `types.ts`).
        *   يجب على الـ Backend حفظ هذه الأسئلة في قاعدة البيانات مع `is_ai_generated: true`.
    *   `POST /api/ai/generate-questions-from-pdf/`:
        *   الطلب: `multipart/form-data` مع ملف PDF، `specialization_name`, `num_questions`.
        *   يقوم الـ Backend باستخراج النص من ملف PDF (باستخدام مكتبة مثل `PyPDF2` أو `pdfminer.six`).
        *   يقوم الـ Backend بتنسيق الـ prompt (يتضمن النص المستخرج) وإرساله إلى Gemini API.
        *   الاستجابة: قائمة بـ `GeneratedQuestionPayload[]`.
        *   يجب على الـ Backend حفظ هذه الأسئلة في قاعدة البيانات مع `is_ai_generated: true`.

## 11. أداة توليد الأسئلة من PDF (للمشرف والطالب)

*   تستخدم نفس نقطة النهاية `POST /api/ai/generate-questions-from-pdf/` المذكورة أعلاه.
*   إذا كان الطلب من مشرف، يتم حفظ الأسئلة المولدة في قاعدة البيانات الرئيسية.
*   إذا كان الطلب من طالب (من خلال أداة المذاكرة)، يمكن للـ Backend أن يقرر عدم حفظ هذه الأسئلة بشكل دائم أو حفظها مع علامة تميزها كأسئلة تدريبية لم يتم التحقق منها. الواجهة الأمامية الحالية تقوم بإضافتها لقائمة الأسئلة العامة إذا كان المستخدم مشرفاً.

## 12. اعتبارات عامة لواجهة API

*   استخدم Django Rest Framework (DRF) لبناء الـ APIs.
*   فكر في وضع إصدار للـ API (e.g., `/api/v1/`).
*   استخدم الترقيم (Pagination) للقوائم الكبيرة (مثل قائمة الأسئلة).
*   وفر استجابات خطأ متسقة وواضحة.
*   تأكد من تطبيق آليات الحماية الأمنية (CSRF, XSS, SQL Injection) التي توفرها Django بشكل صحيح.

## 13. ملاحظات لمطور الواجهة الأمامية (React) بعد إكمال الـ Backend

بمجرد أن يصبح الـ Backend جاهزًا، سيحتاج مطور الواجهة الأمامية إلى:

*   **إنشاء طبقة خدمة API (apiService):**
    *   إنشاء ملف (مثل `services/apiService.ts`) يحتوي على دوال تقوم بإجراء استدعاءات `fetch` أو `axios` إلى نقاط نهاية Django.
    *   هذه الدوال ستتعامل مع المصادقة (إرسال الـ token في الـ headers)، وتنسيق الطلبات، ومعالجة الاستجابات.
*   **تحديث الـ Contexts:**
    *   `AuthProvider`: دالة `login` ستستدعي `/api/auth/login/`. سيتم تخزين الـ token (في `localStorage` أو `sessionStorage` أو حالة الـ context).
    *   `QuestionsProvider`: ستجلب الأسئلة من `/api/admin/questions/` أو `/api/student/exams/start-standard/` بدلاً من `localStorage` أو البيانات الوهمية. دوال `addQuestion`, `updateQuestion`, `deleteQuestion` ستستدعي نقاط النهاية المقابلة. دوال توليد الأسئلة بالـ AI ستستدعي `/api/ai/...`.
    *   `ExamsProvider`: نفس المبدأ لتعريفات الامتحانات وجلسات الامتحانات.
*   **تحديث مكونات رفع الملفات:**
    *   المكونات مثل `AddQuestionModal` (للمرفقات) و `AISettingsModal` / `PDFQuestionGeneratorTool` (لرفع PDF) ستحتاج إلى إرسال الملفات إلى نقاط نهاية Django باستخدام `FormData`.
*   **إدارة الأخطاء:** عرض رسائل خطأ مناسبة للمستخدم بناءً على استجابات الـ API.
*   **حالة التحميل (Loading States):** عرض مؤشرات تحميل أثناء استدعاءات الـ API.

نتمنى لك التوفيق في تطوير الـ Backend!
```