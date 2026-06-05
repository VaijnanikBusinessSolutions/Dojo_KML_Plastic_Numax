

// TrainingFeedbackForm.tsx
import React, { useState } from 'react';

type Language = 'en' | 'hi';

interface FormData {
  participantName: string;
  empId: string;
  faculty: string;
  trainingDescription: string;
  period: string;
  effectivenessDate: string;
  knowledgeIncrease: string;
  skillEnhancement: string;
  workplaceImplementation: string;
  subjectDiscussion: string;
  presentationImprovement: string;
  workplaceAchievement: string;
  effectivenessComments: string;
  departmentHead: string;
  trainingTitle: string;
  trainerName: string;
  venue: string;
  duration: string;
  feedbackDate: string;
  contentRelevance: string;
  needSatisfaction: string;
  workplaceApplication: string;
  trainingMethodology: string;
  studyMaterialsQuality: string;
  trainerKnowledge: string;
  trainerStyle: string;
  trainingArrangement: string;
  participantNameFeedback: string;
  signature: string;
}

interface RadioOption {
  label: string;
  value: string;
}

interface FormField {
  label: string;
  name: keyof FormData;
  type: 'text' | 'date';
  required?: boolean;
}

const translations = {
  en: {
    formTitle: "Training Feedback System",
    submitEffectiveness: "Submit Effectiveness Evaluation", // ADDED
    submitFeedback: "Submit Participant Feedback", // ADDED
    submit: "Submit Feedback",
    required: "Required field",
    requiredMark: "*",
    formSections: "Form Sections",
    effectivenessEvaluation: "Effectiveness Evaluation",
    participantFeedback: "Participant Feedback",
    effectivenessTitle: "Training Effectiveness Evaluation ",
    feedbackTitle: "Participant Feedback Form ",
    participantName: "Name of Participant",
    empId: "Emp. Id",
    faculty: "Faculty",
    period: "Period",
    date: "Date",
    trainingDescription: "Description of Training",
    effectivenessCheckpoints: "Effectiveness Checkpoints",
    knowledgeIncrease: "Increase in knowledge",
    skillEnhancement: "Enhancement in skill",
    workplaceImplementation: "Implementation at the workplace",
    subjectDiscussion: "Discussion on the subject with colleagues, superior, juniors",
    presentationImprovement: "Improvement in Presentation skill",
    workplaceAchievement: "Any achievement at the workplace after receipt of Training",
    effectivenessComments: "Comments about the overall effectiveness",
    departmentHead: "Department Head",
    trainingTitle: "Title of Training Programme",
    trainerName: "Name of Trainer/Faculty",
    venue: "Venue",
    duration: "Duration",
    feedbackQuestions: "Feedback Questions",
    contentRelevance: "To what extent the contents of the Programme were relevant to your training need?",
    needSatisfaction: "To what extent your need is satisfied?",
    workplaceApplication: "Whether you will be able to apply at your workplace what you have learnt in this programme?",
    commentsOnTraining: "Comments on Training",
    trainingMethodology: "Training methodology used",
    studyMaterialsQuality: "Quality of study materials distributed",
    trainerKnowledge: "Trainer's knowledge on the subject/topics",
    trainerStyle: "Trainer's style of explaining the subject/topics",
    trainingArrangement: "Arrangement/environment of training programme",
    name: "Name",
    signature: "Signature",
    signaturePlaceholder: "Type your name as signature",
    excellent: "Excellent",
    good: "Good",
    satisfactory: "Satisfactory",
    none: "None",
    veryHigh: "Very High",
    high: "High",
    average: "Average",
    always: "Always",
    oftenly: "Oftenly",
    sometime: "Sometime",
    never: "Never",
    little: "Little",
    well: "Well",
    veryWell: "Very Well",
    fully: "Fully",
    poor: "Poor",
    vGood: "V. Good",
    participantNameRequired: "Participant name is required",
    empIdRequired: "Employee ID is required",
    dateRequired: "Date is required",
    trainingTitleRequired: "Training title is required",
    feedbackDateRequired: "Feedback date is required",
    nameRequired: "Name is required",
    formSubmittedSuccess: "Form submitted successfully!",
    submitting: "Submitting...",
    submitError: "Failed to submit form. Please try again."
  },
  hi: {
    formTitle: "प्रशिक्षण फीडबैक प्रणाली",
    submitEffectiveness: "प्रभावशीलता मूल्यांकन सबमिट करें", // ADDED
    submitFeedback: "प्रतिभागी फीडबैक सबमिट करें", // ADDED
    submit: "फीडबैक सबमिट करें",
    required: "आवश्यक फ़ील्ड",
    requiredMark: "*",
    formSections: "फॉर्म अनुभाग",
    effectivenessEvaluation: "प्रभावशीलता मूल्यांकन",
    participantFeedback: "प्रतिभागी फीडबैक",
    effectivenessTitle: "प्रशिक्षण प्रभावशीलता मूल्यांकन ",
    feedbackTitle: "प्रतिभागी फीडबैक फॉर्म ",
    participantName: "प्रतिभागी का नाम",
    empId: "कर्मचारी आईडी",
    faculty: "संकाय",
    period: "अवधि",
    date: "दिनांक",
    trainingDescription: "प्रशिक्षण का विवरण",
    effectivenessCheckpoints: "प्रभावशीलता जांच बिंदु",
    knowledgeIncrease: "ज्ञान में वृद्धि",
    skillEnhancement: "कौशल में वृद्धि",
    workplaceImplementation: "कार्यस्थल पर कार्यान्वयन",
    subjectDiscussion: "सहकर्मियों, वरिष्ठ, कनिष्ठों के साथ विषय पर चर्चा",
    presentationImprovement: "प्रस्तुति कौशल में सुधार",
    workplaceAchievement: "प्रशिक्षण प्राप्त करने के बाद कार्यस्थल पर कोई उपलब्धि",
    effectivenessComments: "समग्र प्रभावशीलता के बारे में टिप्पणियाँ",
    departmentHead: "विभाग प्रमुख",
    trainingTitle: "प्रशिक्षण कार्यक्रम का शीर्षक",
    trainerName: "प्रशिक्षक/संकाय का नाम",
    venue: "स्थान",
    duration: "अवधि",
    feedbackQuestions: "फीडबैक प्रश्न",
    contentRelevance: "कार्यक्रम की सामग्री आपकी प्रशिक्षण आवश्यकता के लिए कितनी प्रासंगिक थी?",
    needSatisfaction: "आपकी आवश्यकता किस हद तक संतुष्ट है?",
    workplaceApplication: "क्या आप इस कार्यक्रम में जो सीखा है उसे अपने कार्यस्थल पर लागू कर पाएंगे?",
    commentsOnTraining: "प्रशिक्षण पर टिप्पणियाँ",
    trainingMethodology: "उपयोग की गई प्रशिक्षण पद्धति",
    studyMaterialsQuality: "वितरित अध्ययन सामग्री की गुणवत्ता",
    trainerKnowledge: "विषय/विषयों पर प्रशिक्षक का ज्ञान",
    trainerStyle: "विषय/विषयों को समझाने की प्रशिक्षक की शैली",
    trainingArrangement: "प्रशिक्षण कार्यक्रम की व्यवस्था/वातावरण",
    name: "नाम",
    signature: "हस्ताक्षर",
    signaturePlaceholder: "हस्ताक्षर के रूप में अपना नाम टाइप करें",
    excellent: "उत्कृष्ट",
    good: "अच्छा",
    satisfactory: "संतोषजनक",
    none: "कोई नहीं",
    veryHigh: "बहुत अधिक",
    high: "अधिक",
    average: "औसत",
    always: "हमेशा",
    oftenly: "अक्सर",
    sometime: "कभी-कभी",
    never: "कभी नहीं",
    little: "थोड़ा",
    well: "अच्छा",
    veryWell: "बहुत अच्छा",
    fully: "पूर्ण रूप से",
    poor: "खराब",
    vGood: "बहुत अच्छा",
    participantNameRequired: "प्रतिभागी का नाम आवश्यक है",
    empIdRequired: "कर्मचारी आईडी आवश्यक है",
    dateRequired: "दिनांक आवश्यक है",
    trainingTitleRequired: "प्रशिक्षण शीर्षक आवश्यक है",
    feedbackDateRequired: "फीडबैक दिनांक आवश्यक है",
    nameRequired: "नाम आवश्यक है",
    formSubmittedSuccess: "फॉर्म सफलतापूर्वक सबमिट किया गया!",
    submitting: "प्रस्तुत कर रहे हैं...",
    submitError: "फॉर्म सबमिट करने में त्रुटि। कृपया पुनः प्रयास करें।"
  }
};

const TrainingFeedbackForm: React.FC = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = translations[language];
  
  const [formData, setFormData] = useState<FormData>({
    participantName: '',
    empId: '',
    faculty: '',
    trainingDescription: '',
    period: '',
    effectivenessDate: '',
    knowledgeIncrease: '',
    skillEnhancement: '',
    workplaceImplementation: '',
    subjectDiscussion: '',
    presentationImprovement: '',
    workplaceAchievement: '',
    effectivenessComments: '',
    departmentHead: '',
    trainingTitle: '',
    trainerName: '',
    venue: 'Conference Room Prithla',
    duration: '',
    feedbackDate: '',
    contentRelevance: '',
    needSatisfaction: '',
    workplaceApplication: '',
    trainingMethodology: '',
    studyMaterialsQuality: '',
    trainerKnowledge: '',
    trainerStyle: '',
    trainingArrangement: '',
    participantNameFeedback: '',
    signature: ''
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [currentPage, setCurrentPage] = useState<1 | 2>(1);

  const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000';

  const validatePage1 = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!formData.participantName) newErrors.participantName = t.participantNameRequired;
    if (!formData.empId) newErrors.empId = t.empIdRequired;
    if (!formData.effectivenessDate) newErrors.effectivenessDate = t.dateRequired;
    setErrors(newErrors); // CHANGED: Overwrite errors for the current page
    return Object.keys(newErrors).length === 0;
  };

  const validatePage2 = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!formData.trainingTitle) newErrors.trainingTitle = t.trainingTitleRequired;
    if (!formData.feedbackDate) newErrors.feedbackDate = t.feedbackDateRequired;
    if (!formData.participantNameFeedback) newErrors.participantNameFeedback = t.nameRequired;
    setErrors(newErrors); // CHANGED: Overwrite errors for the current page
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePageChange = (page: 1 | 2) => {
    // We can remove validation on page change to allow users to switch freely
    setCurrentPage(page);
    setErrors({}); // Clear errors when switching pages
  };

  const submitForm1 = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/form1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participant_name: formData.participantName,
          emp_id: formData.empId,
          faculty: formData.faculty,
          training_description: formData.trainingDescription,
          period: formData.period,
          effectiveness_date: formData.effectivenessDate,
          knowledge_increase: formData.knowledgeIncrease,
          skill_enhancement: formData.skillEnhancement,
          workplace_implementation: formData.workplaceImplementation,
          subject_discussion: formData.subjectDiscussion,
          presentation_improvement: formData.presentationImprovement,
          workplace_achievement: formData.workplaceAchievement,
          effectiveness_comments: formData.effectivenessComments,
          department_head: formData.departmentHead,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Form 1 submitted:', data);
        return { success: true };
      } else {
        const errorData = await response.json();
        console.error('Form 1 submission error:', errorData);
        return { success: false, error: errorData.detail || 'Submission failed' };
      }
    } catch (error) {
      console.error('Form 1 submission error:', error);
      return { success: false, error: 'Network error' };
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitForm2 = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/form2/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          training_title: formData.trainingTitle,
          trainer_name: formData.trainerName,
          venue: formData.venue,
          duration: formData.duration,
          feedback_date: formData.feedbackDate,
          content_relevance: formData.contentRelevance,
          need_satisfaction: formData.needSatisfaction,
          workplace_application: formData.workplaceApplication,
          training_methodology: formData.trainingMethodology,
          study_materials_quality: formData.studyMaterialsQuality,
          trainer_knowledge: formData.trainerKnowledge,
          trainer_style: formData.trainerStyle,
          training_arrangement: formData.trainingArrangement,
          participant_name: formData.participantNameFeedback,
          signature: formData.signature,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Form 2 submitted:', data);
        return { success: true };
      } else {
        const errorData = await response.json();
        console.error('Form 2 submission error:', errorData);
        return { success: false, error: errorData.detail || 'Submission failed' };
      }
    } catch (error) {
      console.error('Form 2 submission error:', error);
      return { success: false, error: 'Network error' };
    } finally {
      setIsSubmitting(false);
    }
  };

  // ADDED: New handler specifically for Form 1
  const handleSubmitForm1 = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (validatePage1()) {
      const result = await submitForm1();
      if (result.success) {
        alert(t.formSubmittedSuccess);
        // Clear only Form 1 fields
        setFormData(prev => ({
          ...prev,
          participantName: '',
          empId: '',
          faculty: '',
          trainingDescription: '',
          period: '',
          effectivenessDate: '',
          knowledgeIncrease: '',
          skillEnhancement: '',
          workplaceImplementation: '',
          subjectDiscussion: '',
          presentationImprovement: '',
          workplaceAchievement: '',
          effectivenessComments: '',
          departmentHead: '',
        }));
        setErrors({});
      } else {
        alert(`${t.submitError}: ${result.error}`);
      }
    }
  };

  // ADDED: New handler specifically for Form 2
  const handleSubmitForm2 = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (validatePage2()) {
      const result = await submitForm2();
      if (result.success) {
        alert(t.formSubmittedSuccess);
        // Clear only Form 2 fields
        setFormData(prev => ({
            ...prev,
            trainingTitle: '',
            trainerName: '',
            venue: 'Conference Room Prithla', // Reset to default
            duration: '',
            feedbackDate: '',
            contentRelevance: '',
            needSatisfaction: '',
            workplaceApplication: '',
            trainingMethodology: '',
            studyMaterialsQuality: '',
            trainerKnowledge: '',
            trainerStyle: '',
            trainingArrangement: '',
            participantNameFeedback: '',
            signature: ''
        }));
        setErrors({});
      } else {
        alert(`${t.submitError}: ${result.error}`);
      }
    }
  };

  // ... (RadioGroup component and other definitions are unchanged)

  interface RadioGroupProps {
    label: string;
    name: keyof FormData;
    options: (string | RadioOption)[];
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }

  const RadioGroup: React.FC<RadioGroupProps> = ({ label, name, options, value, onChange }) => (
    <div className={`mb-6 p-4 rounded-xl border-l-4 shadow-sm ${
      currentPage === 1 
        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-600' 
        : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-600'
    }`}>
      <label className={`block text-sm font-semibold mb-3 ${
        currentPage === 1 ? 'text-blue-800' : 'text-green-800'
      }`}>{label}</label>
      <div className="flex flex-wrap gap-4">
        {options.map(option => {
          const optionValue = typeof option === 'string' ? option : option.value;
          const optionLabel = typeof option === 'string' ? option : option.label;
          return (
            <label key={optionValue} className="flex items-center p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <input
                type="radio"
                name={name as string}
                value={optionValue}
                checked={value === optionValue}
                onChange={onChange}
                className={`h-4 w-4 focus:ring-2 ${
                  currentPage === 1 
                    ? 'text-blue-600 focus:ring-blue-500 border-gray-300' 
                    : 'text-green-600 focus:ring-green-500 border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              <span className="ml-2 text-sm text-gray-700 font-medium">{optionLabel}</span>
            </label>
          );
        })}
      </div>
    </div>
  );

  const Page1Fields: FormField[] = [
    { label: t.participantName, name: 'participantName', type: 'text', required: true },
    { label: t.empId, name: 'empId', type: 'text', required: true },
    { label: t.faculty, name: 'faculty', type: 'text' },
    { label: t.period, name: 'period', type: 'text' },
    { label: t.date, name: 'effectivenessDate', type: 'date', required: true }
  ];

  const Page2Fields: FormField[] = [
    { label: t.trainingTitle, name: 'trainingTitle', type: 'text', required: true },
    { label: t.trainerName, name: 'trainerName', type: 'text' },
    { label: t.venue, name: 'venue', type: 'text' },
    { label: t.duration, name: 'duration', type: 'text' },
    { label: t.date, name: 'feedbackDate', type: 'date', required: true }
  ];

  const getPageTitle = () => currentPage === 1 
    ? t.effectivenessTitle 
    : t.feedbackTitle;

  const getPageColor = () => currentPage === 1 
    ? 'from-blue-600 to-purple-600' 
    : 'from-green-600 to-emerald-600';

  const getInputClassName = (fieldName: keyof FormData) => {
    const baseClass = `w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:outline-none transition-all duration-200 shadow-sm`;
    const colorClass = currentPage === 1 
      ? 'border-blue-200 focus:border-blue-500 focus:ring-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50' 
      : 'border-green-200 focus:border-green-500 focus:ring-green-200 bg-gradient-to-r from-green-50 to-emerald-50';
    const errorClass = errors[fieldName] ? 'border-red-400 focus:border-red-500' : colorClass;
    return `${baseClass} ${errorClass}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-pink-100 py-8 px-4 sm:px-6 lg:px-8">
        {/* ... (Unchanged JSX for layout and sidebar) ... */}
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden flex">
        <div className="w-64 bg-gradient-to-b from-gray-50 to-gray-100 p-6 border-r border-gray-200">
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Language / भाषा</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage('en')}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  language === 'en' 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                disabled={isSubmitting}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  language === 'hi' 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                disabled={isSubmitting}
              >
                हिंदी
              </button>
            </div>
          </div>

          <h2 className="text-lg font-bold text-gray-800 mb-6">{t.formSections}</h2>
          <div className="space-y-2">
            <button
              onClick={() => handlePageChange(1)}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                currentPage === 1 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              disabled={isSubmitting}
            >
              {t.effectivenessEvaluation}
            </button>
            <button
              onClick={() => handlePageChange(2)}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                currentPage === 2 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              disabled={isSubmitting}
            >
              {t.participantFeedback}
            </button>
          </div>
        </div>

        <div className="flex-1">
          <div className={`bg-gradient-to-r ${getPageColor()} px-6 py-8 text-white`}>
            <h1 className="text-3xl font-bold text-center mb-2">{t.formTitle}</h1>
            <h2 className="text-xl font-semibold text-center opacity-90">{getPageTitle()}</h2>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`bg-gradient-to-r ${getPageColor()} h-2 rounded-full transition-all duration-300 ease-in-out`}
                style={{ width: currentPage === 1 ? '50%' : '100%' }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>{t.effectivenessEvaluation}</span>
              <span>{t.participantFeedback}</span>
            </div>
          </div>

          <div className="p-6 sm:p-10 max-h-[70vh] overflow-y-auto">
            <form className="space-y-6">
              {currentPage === 1 && (
                <>
                {/* FORM 1 CONTENT - UNCHANGED */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Page1Fields.map(field => (
                      <div key={field.name as string} className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          {field.label} {field.required && <span className="text-red-500">{t.requiredMark}</span>}
                        </label>
                        <input
                          type={field.type}
                          name={field.name as string}
                          value={formData[field.name]}
                          onChange={handleInputChange}
                          className={getInputClassName(field.name)}
                          required={field.required}
                          disabled={isSubmitting}
                        />
                        {errors[field.name] && (
                          <p className="text-sm text-red-500 font-medium">{errors[field.name]}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">{t.trainingDescription}</label>
                    <textarea
                      name="trainingDescription"
                      value={formData.trainingDescription}
                      onChange={handleInputChange}
                      rows={4}
                      className={getInputClassName('trainingDescription')}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-blue-800 bg-blue-100 px-4 py-2 rounded-xl">{t.effectivenessCheckpoints}</h3>
                    <RadioGroup
                      label={t.knowledgeIncrease}
                      name="knowledgeIncrease"
                      options={[t.excellent, t.good, t.satisfactory, t.none]}
                      value={formData.knowledgeIncrease}
                      onChange={handleInputChange}
                    />
                    <RadioGroup
                      label={t.skillEnhancement}
                      name="skillEnhancement"
                      options={[t.veryHigh, t.high, t.average, t.none]}
                      value={formData.skillEnhancement}
                      onChange={handleInputChange}
                    />
                    <RadioGroup
                      label={t.workplaceImplementation}
                      name="workplaceImplementation"
                      options={[t.veryHigh, t.high, t.average, t.none]}
                      value={formData.workplaceImplementation}
                      onChange={handleInputChange}
                    />
                    <RadioGroup
                      label={t.subjectDiscussion}
                      name="subjectDiscussion"
                      options={[t.always, t.oftenly, t.sometime, t.never]}
                      value={formData.subjectDiscussion}
                      onChange={handleInputChange}
                    />
                    <RadioGroup
                      label={t.presentationImprovement}
                      name="presentationImprovement"
                      options={[t.veryHigh, t.high, t.average, t.none]}
                      value={formData.presentationImprovement}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t.workplaceAchievement}</label>
                      <textarea
                        name="workplaceAchievement"
                        value={formData.workplaceAchievement}
                        onChange={handleInputChange}
                        rows={3}
                        className={getInputClassName('workplaceAchievement')}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t.effectivenessComments}</label>
                      <textarea
                        name="effectivenessComments"
                        value={formData.effectivenessComments}
                        onChange={handleInputChange}
                        rows={3}
                        className={getInputClassName('effectivenessComments')}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">{t.departmentHead}</label>
                      <input
                        type="text"
                        name="departmentHead"
                        value={formData.departmentHead}
                        onChange={handleInputChange}
                        className={getInputClassName('departmentHead')}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </>
              )}

              {currentPage === 2 && (
                <>
                {/* FORM 2 CONTENT - UNCHANGED */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Page2Fields.map(field => (
                      <div key={field.name as string} className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          {field.label} {field.required && <span className="text-red-500">{t.requiredMark}</span>}
                        </label>
                        <input
                          type={field.type}
                          name={field.name as string}
                          value={formData[field.name]}
                          onChange={handleInputChange}
                          className={getInputClassName(field.name)}
                          required={field.required}
                          disabled={isSubmitting}
                        />
                        {errors[field.name] && (
                          <p className="text-sm text-red-500 font-medium">{errors[field.name]}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-green-800 bg-green-100 px-4 py-2 rounded-xl">{t.feedbackQuestions}</h3>
                    <RadioGroup
                      label={t.contentRelevance}
                      name="contentRelevance"
                      options={[
                        { label: t.little, value: '1' },
                        { label: t.well, value: '2' },
                        { label: t.veryWell, value: '3' },
                        { label: t.fully, value: '4' }
                      ]}
                      value={formData.contentRelevance}
                      onChange={handleInputChange}
                    />
                    <RadioGroup
                      label={t.needSatisfaction}
                      name="needSatisfaction"
                      options={[
                        { label: t.little, value: '1' },
                        { label: t.well, value: '2' },
                        { label: t.veryWell, value: '3' },
                        { label: t.fully, value: '4' }
                      ]}
                      value={formData.needSatisfaction}
                      onChange={handleInputChange}
                    />
                    <RadioGroup
                      label={t.workplaceApplication}
                      name="workplaceApplication"
                      options={[
                        { label: t.little, value: '1' },
                        { label: t.well, value: '2' },
                        { label: t.veryWell, value: '3' },
                        { label: t.fully, value: '4' }
                      ]}
                      value={formData.workplaceApplication}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-green-800 bg-green-100 px-4 py-2 rounded-xl">{t.commentsOnTraining}</h3>
                    <RadioGroup
                      label={t.trainingMethodology}
                      name="trainingMethodology"
                      options={[
                        { label: t.poor, value: '1' },
                        { label: t.satisfactory, value: '2' },
                        { label: t.good, value: '3' },
                        { label: t.vGood, value: '4' }
                      ]}
                      value={formData.trainingMethodology}
                      onChange={handleInputChange}
                    />
                    <RadioGroup
                      label={t.studyMaterialsQuality}
                      name="studyMaterialsQuality"
                      options={[
                        { label: t.poor, value: '1' },
                        { label: t.satisfactory, value: '2' },
                        { label: t.good, value: '3' },
                        { label: t.vGood, value: '4' }
                      ]}
                      value={formData.studyMaterialsQuality}
                      onChange={handleInputChange}
                    />
                    <RadioGroup
                      label={t.trainerKnowledge}
                      name="trainerKnowledge"
                      options={[
                        { label: t.poor, value: '1' },
                        { label: t.satisfactory, value: '2' },
                        { label: t.good, value: '3' },
                        { label: t.vGood, value: '4' }
                      ]}
                      value={formData.trainerKnowledge}
                      onChange={handleInputChange}
                    />
                    <RadioGroup
                      label={t.trainerStyle}
                      name="trainerStyle"
                      options={[
                        { label: t.poor, value: '1' },
                        { label: t.satisfactory, value: '2' },
                        { label: t.good, value: '3' },
                        { label: t.vGood, value: '4' }
                      ]}
                      value={formData.trainerStyle}
                      onChange={handleInputChange}
                    />
                    <RadioGroup
                      label={t.trainingArrangement}
                      name="trainingArrangement"
                      options={[
                        { label: t.poor, value: '1' },
                        { label: t.satisfactory, value: '2' },
                        { label: t.good, value: '3' },
                        { label: t.vGood, value: '4' }
                      ]}
                      value={formData.trainingArrangement}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">{t.name} <span className="text-red-500">{t.requiredMark}</span></label>
                      <input
                        type="text"
                        name="participantNameFeedback"
                        value={formData.participantNameFeedback}
                        onChange={handleInputChange}
                        className={getInputClassName('participantNameFeedback')}
                        required
                        disabled={isSubmitting}
                      />
                      {errors.participantNameFeedback && (
                        <p className="text-sm text-red-500 font-medium">{errors.participantNameFeedback}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">{t.signature}</label>
                      <input
                        type="text"
                        name="signature"
                        value={formData.signature}
                        onChange={handleInputChange}
                        placeholder={t.signaturePlaceholder}
                        className={getInputClassName('signature')}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </>
              )}
            </form>
          </div>
          
          {/* CHANGED: Conditionally render the correct button */}
          <div className="px-6 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t">
            <div className="flex justify-end">
              {currentPage === 1 && (
                <button
                  type="button"
                  onClick={handleSubmitForm1}
                  className={`px-8 py-3 bg-gradient-to-r ${getPageColor()} text-white font-semibold rounded-xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t.submitting : t.submitEffectiveness}
                </button>
              )}
              {currentPage === 2 && (
                 <button
                  type="button"
                  onClick={handleSubmitForm2}
                  className={`px-8 py-3 bg-gradient-to-r ${getPageColor()} text-white font-semibold rounded-xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t.submitting : t.submitFeedback}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingFeedbackForm;






// // TrainingFeedbackForm.tsx
// import React, { useState } from 'react';

// type Language = 'en' | 'hi';

// interface FormData {
//   participantName: string;
//   empId: string;
//   faculty: string;
//   trainingDescription: string;
//   period: string;
//   effectivenessDate: string;
//   knowledgeIncrease: string;
//   skillEnhancement: string;
//   workplaceImplementation: string;
//   subjectDiscussion: string;
//   presentationImprovement: string;
//   workplaceAchievement: string;
//   effectivenessComments: string;
//   departmentHead: string;
//   trainingTitle: string;
//   trainerName: string;
//   venue: string;
//   duration: string;
//   feedbackDate: string;
//   contentRelevance: string;
//   needSatisfaction: string;
//   workplaceApplication: string;
//   trainingMethodology: string;
//   studyMaterialsQuality: string;
//   trainerKnowledge: string;
//   trainerStyle: string;
//   trainingArrangement: string;
//   participantNameFeedback: string;
//   signature: string;
// }

// interface RadioOption {
//   label: string;
//   value: string;
// }

// interface FormField {
//   label: string;
//   name: keyof FormData;
//   type: 'text' | 'date';
//   required?: boolean;
// }

// const translations = {
//   en: {
//     formTitle: "Training Feedback System",
//     submitEffectiveness: "Submit Effectiveness Evaluation",
//     submitFeedback: "Submit Participant Feedback",
//     submit: "Submit Feedback",
//     required: "Required field",
//     requiredMark: "*",
//     formSections: "Form Sections",
//     effectivenessEvaluation: "Effectiveness Evaluation",
//     participantFeedback: "Participant Feedback",
//     effectivenessTitle: "Training Effectiveness Evaluation (HRM-F-05)",
//     feedbackTitle: "Participant Feedback Form (HRM-F-03)",
//     participantName: "Name of Participant",
//     empId: "Emp. Id",
//     faculty: "Faculty",
//     period: "Period",
//     date: "Date",
//     trainingDescription: "Description of Training",
//     effectivenessCheckpoints: "Effectiveness Checkpoints",
//     knowledgeIncrease: "Increase in knowledge",
//     skillEnhancement: "Enhancement in skill",
//     workplaceImplementation: "Implementation at the workplace",
//     subjectDiscussion: "Discussion on the subject with colleagues, superior, juniors",
//     presentationImprovement: "Improvement in Presentation skill",
//     workplaceAchievement: "Any achievement at the workplace after receipt of Training",
//     effectivenessComments: "Comments about the overall effectiveness",
//     departmentHead: "Department Head",
//     trainingTitle: "Title of Training Programme",
//     trainerName: "Name of Trainer/Faculty",
//     venue: "Venue",
//     duration: "Duration",
//     feedbackQuestions: "Feedback Questions",
//     contentRelevance: "To what extent the contents of the Programme were relevant to your training need?",
//     needSatisfaction: "To what extent your need is satisfied?",
//     workplaceApplication: "Whether you will be able to apply at your workplace what you have learnt in this programme?",
//     commentsOnTraining: "Comments on Training",
//     trainingMethodology: "Training methodology used",
//     studyMaterialsQuality: "Quality of study materials distributed",
//     trainerKnowledge: "Trainer's knowledge on the subject/topics",
//     trainerStyle: "Trainer's style of explaining the subject/topics",
//     trainingArrangement: "Arrangement/environment of training programme",
//     name: "Name",
//     signature: "Signature",
//     signaturePlaceholder: "Type your name as signature",
//     excellent: "Excellent",
//     good: "Good",
//     satisfactory: "Satisfactory",
//     none: "None",
//     veryHigh: "Very High",
//     high: "High",
//     average: "Average",
//     always: "Always",
//     oftenly: "Oftenly",
//     sometime: "Sometime",
//     never: "Never",
//     little: "Little",
//     well: "Well",
//     veryWell: "Very Well",
//     fully: "Fully",
//     poor: "Poor",
//     vGood: "V. Good",
//     participantNameRequired: "Participant name is required",
//     empIdRequired: "Employee ID is required",
//     dateRequired: "Date is required",
//     trainingTitleRequired: "Training title is required",
//     feedbackDateRequired: "Feedback date is required",
//     nameRequired: "Name is required",
//     formSubmittedSuccess: "Form submitted successfully!",
//     submitting: "Submitting...",
//     submitError: "Failed to submit form. Please try again."
//   },
//   hi: {
//     formTitle: "प्रशिक्षण फीडबैक प्रणाली",
//     submitEffectiveness: "प्रभावशीलता मूल्यांकन सबमिट करें",
//     submitFeedback: "प्रतिभागी फीडबैक सबमिट करें",
//     submit: "फीडबैक सबमिट करें",
//     required: "आवश्यक फ़ील्ड",
//     requiredMark: "*",
//     formSections: "फॉर्म अनुभाग",
//     effectivenessEvaluation: "प्रभावशीलता मूल्यांकन",
//     participantFeedback: "प्रतिभागी फीडबैक",
//     effectivenessTitle: "प्रशिक्षण प्रभावशीलता मूल्यांकन (HRM-F-05)",
//     feedbackTitle: "प्रतिभागी फीडबैक फॉर्म (HRM-F-03)",
//     participantName: "प्रतिभागी का नाम",
//     empId: "कर्मचारी आईडी",
//     faculty: "संकाय",
//     period: "अवधि",
//     date: "दिनांक",
//     trainingDescription: "प्रशिक्षण का विवरण",
//     effectivenessCheckpoints: "प्रभावशीलता जांच बिंदु",
//     knowledgeIncrease: "ज्ञान में वृद्धि",
//     skillEnhancement: "कौशल में वृद्धि",
//     workplaceImplementation: "कार्यस्थल पर कार्यान्वयन",
//     subjectDiscussion: "सहकर्मियों, वरिष्ठ, कनिष्ठों के साथ विषय पर चर्चा",
//     presentationImprovement: "प्रस्तुति कौशल में सुधार",
//     workplaceAchievement: "प्रशिक्षण प्राप्त करने के बाद कार्यस्थल पर कोई उपलब्धि",
//     effectivenessComments: "समग्र प्रभावशीलता के बारे में टिप्पणियाँ",
//     departmentHead: "विभाग प्रमुख",
//     trainingTitle: "प्रशिक्षण कार्यक्रम का शीर्षक",
//     trainerName: "प्रशिक्षक/संकाय का नाम",
//     venue: "स्थान",
//     duration: "अवधि",
//     feedbackQuestions: "फीडबैक प्रश्न",
//     contentRelevance: "कार्यक्रम की सामग्री आपकी प्रशिक्षण आवश्यकता के लिए कितनी प्रासंगिक थी?",
//     needSatisfaction: "आपकी आवश्यकता किस हद तक संतुष्ट है?",
//     workplaceApplication: "क्या आप इस कार्यक्रम में जो सीखा है उसे अपने कार्यस्थल पर लागू कर पाएंगे?",
//     commentsOnTraining: "प्रशिक्षण पर टिप्पणियाँ",
//     trainingMethodology: "उपयोग की गई प्रशिक्षण पद्धति",
//     studyMaterialsQuality: "वितरित अध्ययन सामग्री की गुणवत्ता",
//     trainerKnowledge: "विषय/विषयों पर प्रशिक्षक का ज्ञान",
//     trainerStyle: "विषय/विषयों को समझाने की प्रशिक्षक की शैली",
//     trainingArrangement: "प्रशिक्षण कार्यक्रम की व्यवस्था/वातावरण",
//     name: "नाम",
//     signature: "हस्ताक्षर",
//     signaturePlaceholder: "हस्ताक्षर के रूप में अपना नाम टाइप करें",
//     excellent: "उत्कृष्ट",
//     good: "अच्छा",
//     satisfactory: "संतोषजनक",
//     none: "कोई नहीं",
//     veryHigh: "बहुत अधिक",
//     high: "अधिक",
//     average: "औसत",
//     always: "हमेशा",
//     oftenly: "अक्सर",
//     sometime: "कभी-कभी",
//     never: "कभी नहीं",
//     little: "थोड़ा",
//     well: "अच्छा",
//     veryWell: "बहुत अच्छा",
//     fully: "पूर्ण रूप से",
//     poor: "खराब",
//     vGood: "बहुत अच्छा",
//     participantNameRequired: "प्रतिभागी का नाम आवश्यक है",
//     empIdRequired: "कर्मचारी आईडी आवश्यक है",
//     dateRequired: "दिनांक आवश्यक है",
//     trainingTitleRequired: "प्रशिक्षण शीर्षक आवश्यक है",
//     feedbackDateRequired: "फीडबैक दिनांक आवश्यक है",
//     nameRequired: "नाम आवश्यक है",
//     formSubmittedSuccess: "फॉर्म सफलतापूर्वक सबमिट किया गया!",
//     submitting: "प्रस्तुत कर रहे हैं...",
//     submitError: "फॉर्म सबमिट करने में त्रुटि। कृपया पुनः प्रयास करें।"
//   }
// };

// const TrainingFeedbackForm: React.FC = () => {
//   const [language, setLanguage] = useState<Language>('en');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const t = translations[language];
  
//   const [formData, setFormData] = useState<FormData>({
//     participantName: '',
//     empId: '',
//     faculty: '',
//     trainingDescription: '',
//     period: '',
//     effectivenessDate: '',
//     knowledgeIncrease: '',
//     skillEnhancement: '',
//     workplaceImplementation: '',
//     subjectDiscussion: '',
//     presentationImprovement: '',
//     workplaceAchievement: '',
//     effectivenessComments: '',
//     departmentHead: '',
//     trainingTitle: '',
//     trainerName: '',
//     venue: 'Conference Room Prithla',
//     duration: '',
//     feedbackDate: '',
//     contentRelevance: '',
//     needSatisfaction: '',
//     workplaceApplication: '',
//     trainingMethodology: '',
//     studyMaterialsQuality: '',
//     trainerKnowledge: '',
//     trainerStyle: '',
//     trainingArrangement: '',
//     participantNameFeedback: '',
//     signature: ''
//   });

//   const [errors, setErrors] = useState<Partial<FormData>>({});
//   // CHANGED: Default page is now 2
//   const [currentPage, setCurrentPage] = useState<1 | 2>(2);

//   const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000';

//   /* COMMENTED OUT: Form 1 validation
//   const validatePage1 = (): boolean => {
//     const newErrors: Partial<FormData> = {};
//     if (!formData.participantName) newErrors.participantName = t.participantNameRequired;
//     if (!formData.empId) newErrors.empId = t.empIdRequired;
//     if (!formData.effectivenessDate) newErrors.effectivenessDate = t.dateRequired;
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };
//   */

//   const validatePage2 = (): boolean => {
//     const newErrors: Partial<FormData> = {};
//     if (!formData.trainingTitle) newErrors.trainingTitle = t.trainingTitleRequired;
//     if (!formData.feedbackDate) newErrors.feedbackDate = t.feedbackDateRequired;
//     if (!formData.participantNameFeedback) newErrors.participantNameFeedback = t.nameRequired;
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     if (errors[name as keyof FormData]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   /* COMMENTED OUT: Page change logic is no longer needed
//   const handlePageChange = (page: 1 | 2) => {
//     setCurrentPage(page);
//     setErrors({});
//   };
//   */

//   /* COMMENTED OUT: Form 1 submission logic
//   const submitForm1 = async () => {
//     setIsSubmitting(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/form1/`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           participant_name: formData.participantName,
//           emp_id: formData.empId,
//           faculty: formData.faculty,
//           training_description: formData.trainingDescription,
//           period: formData.period,
//           effectiveness_date: formData.effectivenessDate,
//           knowledge_increase: formData.knowledgeIncrease,
//           skill_enhancement: formData.skillEnhancement,
//           workplace_implementation: formData.workplaceImplementation,
//           subject_discussion: formData.subjectDiscussion,
//           presentation_improvement: formData.presentationImprovement,
//           workplace_achievement: formData.workplaceAchievement,
//           effectiveness_comments: formData.effectivenessComments,
//           department_head: formData.departmentHead,
//         }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         console.log('Form 1 submitted:', data);
//         return { success: true };
//       } else {
//         const errorData = await response.json();
//         console.error('Form 1 submission error:', errorData);
//         return { success: false, error: errorData.detail || 'Submission failed' };
//       }
//     } catch (error) {
//       console.error('Form 1 submission error:', error);
//       return { success: false, error: 'Network error' };
//     } finally {
//       setIsSubmitting(false);
//     }
//   };
//   */

//   const submitForm2 = async () => {
//     setIsSubmitting(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/form2/`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           training_title: formData.trainingTitle,
//           trainer_name: formData.trainerName,
//           venue: formData.venue,
//           duration: formData.duration,
//           feedback_date: formData.feedbackDate,
//           content_relevance: formData.contentRelevance,
//           need_satisfaction: formData.needSatisfaction,
//           workplace_application: formData.workplaceApplication,
//           training_methodology: formData.trainingMethodology,
//           study_materials_quality: formData.studyMaterialsQuality,
//           trainer_knowledge: formData.trainerKnowledge,
//           trainer_style: formData.trainerStyle,
//           training_arrangement: formData.trainingArrangement,
//           participant_name: formData.participantNameFeedback,
//           signature: formData.signature,
//         }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         console.log('Form 2 submitted:', data);
//         return { success: true };
//       } else {
//         const errorData = await response.json();
//         console.error('Form 2 submission error:', errorData);
//         return { success: false, error: errorData.detail || 'Submission failed' };
//       }
//     } catch (error) {
//       console.error('Form 2 submission error:', error);
//       return { success: false, error: 'Network error' };
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   /* COMMENTED OUT: Form 1 submit handler
//   const handleSubmitForm1 = async (e: React.MouseEvent<HTMLButtonElement>) => {
//     e.preventDefault();
//     if (validatePage1()) {
//       const result = await submitForm1();
//       if (result.success) {
//         alert(t.formSubmittedSuccess);
//         // Clear only Form 1 fields
//         setFormData(prev => ({
//           ...prev,
//           participantName: '',
//           empId: '',
//           faculty: '',
//           trainingDescription: '',
//           period: '',
//           effectivenessDate: '',
//           knowledgeIncrease: '',
//           skillEnhancement: '',
//           workplaceImplementation: '',
//           subjectDiscussion: '',
//           presentationImprovement: '',
//           workplaceAchievement: '',
//           effectivenessComments: '',
//           departmentHead: '',
//         }));
//         setErrors({});
//       } else {
//         alert(`${t.submitError}: ${result.error}`);
//       }
//     }
//   };
//   */

//   const handleSubmitForm2 = async (e: React.MouseEvent<HTMLButtonElement>) => {
//     e.preventDefault();
//     if (validatePage2()) {
//       const result = await submitForm2();
//       if (result.success) {
//         alert(t.formSubmittedSuccess);
//         setFormData(prev => ({
//             ...prev,
//             trainingTitle: '',
//             trainerName: '',
//             venue: 'Conference Room Prithla',
//             duration: '',
//             feedbackDate: '',
//             contentRelevance: '',
//             needSatisfaction: '',
//             workplaceApplication: '',
//             trainingMethodology: '',
//             studyMaterialsQuality: '',
//             trainerKnowledge: '',
//             trainerStyle: '',
//             trainingArrangement: '',
//             participantNameFeedback: '',
//             signature: ''
//         }));
//         setErrors({});
//       } else {
//         alert(`${t.submitError}: ${result.error}`);
//       }
//     }
//   };

//   interface RadioGroupProps {
//     label: string;
//     name: keyof FormData;
//     options: (string | RadioOption)[];
//     value: string;
//     onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   }

//   const RadioGroup: React.FC<RadioGroupProps> = ({ label, name, options, value, onChange }) => (
//     <div className={`mb-6 p-4 rounded-xl border-l-4 shadow-sm bg-gradient-to-r from-green-50 to-emerald-50 border-green-600`}>
//       <label className={`block text-sm font-semibold mb-3 text-green-800`}>{label}</label>
//       <div className="flex flex-wrap gap-4">
//         {options.map(option => {
//           const optionValue = typeof option === 'string' ? option : option.value;
//           const optionLabel = typeof option === 'string' ? option : option.label;
//           return (
//             <label key={optionValue} className="flex items-center p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
//               <input
//                 type="radio"
//                 name={name as string}
//                 value={optionValue}
//                 checked={value === optionValue}
//                 onChange={onChange}
//                 className={`h-4 w-4 focus:ring-2 text-green-600 focus:ring-green-500 border-gray-300`}
//                 disabled={isSubmitting}
//               />
//               <span className="ml-2 text-sm text-gray-700 font-medium">{optionLabel}</span>
//             </label>
//           );
//         })}
//       </div>
//     </div>
//   );

//   /* COMMENTED OUT: Form 1 field definitions
//   const Page1Fields: FormField[] = [
//     { label: t.participantName, name: 'participantName', type: 'text', required: true },
//     { label: t.empId, name: 'empId', type: 'text', required: true },
//     { label: t.faculty, name: 'faculty', type: 'text' },
//     { label: t.period, name: 'period', type: 'text' },
//     { label: t.date, name: 'effectivenessDate', type: 'date', required: true }
//   ];
//   */

//   const Page2Fields: FormField[] = [
//     { label: t.trainingTitle, name: 'trainingTitle', type: 'text', required: true },
//     { label: t.trainerName, name: 'trainerName', type: 'text' },
//     { label: t.venue, name: 'venue', type: 'text' },
//     { label: t.duration, name: 'duration', type: 'text' },
//     { label: t.date, name: 'feedbackDate', type: 'date', required: true }
//   ];

//   const getPageTitle = () => t.feedbackTitle;
//   const getPageColor = () => 'from-green-600 to-emerald-600';

//   const getInputClassName = (fieldName: keyof FormData) => {
//     const baseClass = `w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:outline-none transition-all duration-200 shadow-sm`;
//     const colorClass = 'border-green-200 focus:border-green-500 focus:ring-green-200 bg-gradient-to-r from-green-50 to-emerald-50';
//     const errorClass = errors[fieldName] ? 'border-red-400 focus:border-red-500' : colorClass;
//     return `${baseClass} ${errorClass}`;
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-pink-100 py-8 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden flex">
//         <div className="w-64 bg-gradient-to-b from-gray-50 to-gray-100 p-6 border-r border-gray-200">
//           <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
//             <h3 className="text-sm font-semibold text-gray-700 mb-3">Language / भाषा</h3>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => setLanguage('en')}
//                 className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
//                   language === 'en' 
//                     ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
//                     : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                 }`}
//                 disabled={isSubmitting}
//               >
//                 English
//               </button>
//               <button
//                 onClick={() => setLanguage('hi')}
//                 className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
//                   language === 'hi' 
//                     ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
//                     : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                 }`}
//                 disabled={isSubmitting}
//               >
//                 हिंदी
//               </button>
//             </div>
//           </div>

//           <h2 className="text-lg font-bold text-gray-800 mb-6">{t.formSections}</h2>
//           <div className="space-y-2">
//             {/* COMMENTED OUT: Form 1 Sidebar Button */}
//             {/* 
//             <button
//               onClick={() => handlePageChange(1)}
//               className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
//                 currentPage === 1 
//                   ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
//                   : 'bg-white text-gray-600 hover:bg-gray-50'
//               }`}
//               disabled={isSubmitting}
//             >
//               {t.effectivenessEvaluation}
//             </button> 
//             */}
//             <button
//               className={`w-full text-left px-4 py-3 rounded-lg font-medium bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md`}
//               disabled={true} // Disabled because it's the only page
//             >
//               {t.participantFeedback}
//             </button>
//           </div>
//         </div>

//         <div className="flex-1">
//           <div className={`bg-gradient-to-r ${getPageColor()} px-6 py-8 text-white`}>
//             <h1 className="text-3xl font-bold text-center mb-2">{t.formTitle}</h1>
//             <h2 className="text-xl font-semibold text-center opacity-90">{getPageTitle()}</h2>
//           </div>

//           <div className="px-6 py-4 bg-gray-50 border-b">
//             <div className="w-full bg-gray-200 rounded-full h-2">
//               <div 
//                 className={`bg-gradient-to-r ${getPageColor()} h-2 rounded-full`}
//                 style={{ width: '100%' }} // Hardcoded to 100%
//               ></div>
//             </div>
//             <div className="flex justify-end text-sm text-gray-600 mt-2">
//               <span>{t.participantFeedback}</span>
//             </div>
//           </div>

//           <div className="p-6 sm:p-10 max-h-[70vh] overflow-y-auto">
//             <form className="space-y-6">
              
//               {/* COMMENTED OUT: Entire Form 1 render block */}
//               {/* {currentPage === 1 && ( ... )} */}

//               {currentPage === 2 && (
//                 <>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     {Page2Fields.map(field => (
//                       <div key={field.name as string} className="space-y-2">
//                         <label className="block text-sm font-semibold text-gray-700">
//                           {field.label} {field.required && <span className="text-red-500">{t.requiredMark}</span>}
//                         </label>
//                         <input
//                           type={field.type}
//                           name={field.name as string}
//                           value={formData[field.name]}
//                           onChange={handleInputChange}
//                           className={getInputClassName(field.name)}
//                           required={field.required}
//                           disabled={isSubmitting}
//                         />
//                         {errors[field.name] && (
//                           <p className="text-sm text-red-500 font-medium">{errors[field.name]}</p>
//                         )}
//                       </div>
//                     ))}
//                   </div>

//                   <div className="space-y-4">
//                     <h3 className="text-lg font-bold text-green-800 bg-green-100 px-4 py-2 rounded-xl">{t.feedbackQuestions}</h3>
//                     <RadioGroup
//                       label={t.contentRelevance}
//                       name="contentRelevance"
//                       options={[
//                         { label: t.little, value: '1' },
//                         { label: t.well, value: '2' },
//                         { label: t.veryWell, value: '3' },
//                         { label: t.fully, value: '4' }
//                       ]}
//                       value={formData.contentRelevance}
//                       onChange={handleInputChange}
//                     />
//                     <RadioGroup
//                       label={t.needSatisfaction}
//                       name="needSatisfaction"
//                       options={[
//                         { label: t.little, value: '1' },
//                         { label: t.well, value: '2' },
//                         { label: t.veryWell, value: '3' },
//                         { label: t.fully, value: '4' }
//                       ]}
//                       value={formData.needSatisfaction}
//                       onChange={handleInputChange}
//                     />
//                     <RadioGroup
//                       label={t.workplaceApplication}
//                       name="workplaceApplication"
//                       options={[
//                         { label: t.little, value: '1' },
//                         { label: t.well, value: '2' },
//                         { label: t.veryWell, value: '3' },
//                         { label: t.fully, value: '4' }
//                       ]}
//                       value={formData.workplaceApplication}
//                       onChange={handleInputChange}
//                     />
//                   </div>

//                   <div className="space-y-4">
//                     <h3 className="text-lg font-bold text-green-800 bg-green-100 px-4 py-2 rounded-xl">{t.commentsOnTraining}</h3>
//                     <RadioGroup
//                       label={t.trainingMethodology}
//                       name="trainingMethodology"
//                       options={[
//                         { label: t.poor, value: '1' },
//                         { label: t.satisfactory, value: '2' },
//                         { label: t.good, value: '3' },
//                         { label: t.vGood, value: '4' }
//                       ]}
//                       value={formData.trainingMethodology}
//                       onChange={handleInputChange}
//                     />
//                     <RadioGroup
//                       label={t.studyMaterialsQuality}
//                       name="studyMaterialsQuality"
//                       options={[
//                         { label: t.poor, value: '1' },
//                         { label: t.satisfactory, value: '2' },
//                         { label: t.good, value: '3' },
//                         { label: t.vGood, value: '4' }
//                       ]}
//                       value={formData.studyMaterialsQuality}
//                       onChange={handleInputChange}
//                     />
//                     <RadioGroup
//                       label={t.trainerKnowledge}
//                       name="trainerKnowledge"
//                       options={[
//                         { label: t.poor, value: '1' },
//                         { label: t.satisfactory, value: '2' },
//                         { label: t.good, value: '3' },
//                         { label: t.vGood, value: '4' }
//                       ]}
//                       value={formData.trainerKnowledge}
//                       onChange={handleInputChange}
//                     />
//                     <RadioGroup
//                       label={t.trainerStyle}
//                       name="trainerStyle"
//                       options={[
//                         { label: t.poor, value: '1' },
//                         { label: t.satisfactory, value: '2' },
//                         { label: t.good, value: '3' },
//                         { label: t.vGood, value: '4' }
//                       ]}
//                       value={formData.trainerStyle}
//                       onChange={handleInputChange}
//                     />
//                     <RadioGroup
//                       label={t.trainingArrangement}
//                       name="trainingArrangement"
//                       options={[
//                         { label: t.poor, value: '1' },
//                         { label: t.satisfactory, value: '2' },
//                         { label: t.good, value: '3' },
//                         { label: t.vGood, value: '4' }
//                       ]}
//                       value={formData.trainingArrangement}
//                       onChange={handleInputChange}
//                     />
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="space-y-2">
//                       <label className="block text-sm font-semibold text-gray-700">{t.name} <span className="text-red-500">{t.requiredMark}</span></label>
//                       <input
//                         type="text"
//                         name="participantNameFeedback"
//                         value={formData.participantNameFeedback}
//                         onChange={handleInputChange}
//                         className={getInputClassName('participantNameFeedback')}
//                         required
//                         disabled={isSubmitting}
//                       />
//                       {errors.participantNameFeedback && (
//                         <p className="text-sm text-red-500 font-medium">{errors.participantNameFeedback}</p>
//                       )}
//                     </div>
//                     <div className="space-y-2">
//                       <label className="block text-sm font-semibold text-gray-700">{t.signature}</label>
//                       <input
//                         type="text"
//                         name="signature"
//                         value={formData.signature}
//                         onChange={handleInputChange}
//                         placeholder={t.signaturePlaceholder}
//                         className={getInputClassName('signature')}
//                         disabled={isSubmitting}
//                       />
//                     </div>
//                   </div>
//                 </>
//               )}
//             </form>
//           </div>
          
//           <div className="px-6 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t">
//             <div className="flex justify-end">
//               {/* COMMENTED OUT: Form 1 Submit Button */}
//               {/* {currentPage === 1 && ( ... )} */}

//               {currentPage === 2 && (
//                  <button
//                   type="button"
//                   onClick={handleSubmitForm2}
//                   className={`px-8 py-3 bg-gradient-to-r ${getPageColor()} text-white font-semibold rounded-xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg`}
//                   disabled={isSubmitting}
//                 >
//                   {isSubmitting ? t.submitting : t.submitFeedback}
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TrainingFeedbackForm;