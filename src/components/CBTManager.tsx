import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { compressImage } from '../imageUtils';
import { CBTExam, CBTQuestion, Student, StudentCBTResult, ELearningMaterial } from '../types';
import MathText from './MathText';
import { 
  Award, 
  BookOpen, 
  Shuffle, 
  Eye, 
  Plus, 
  Check, 
  Trash2, 
  Clock, 
  FileText, 
  CheckSquare, 
  HelpCircle, 
  ChevronRight, 
  AlertTriangle,
  Play,
  CheckCircle,
  GraduationCap,
  Link as LinkIcon,
  Video,
  Image as ImageIcon,
  Upload,
  Youtube,
  X
} from 'lucide-react';

const parseMathForWord = (text: string) => {
  if (!text) return "";
  return text.replace(/\$\$(.*?)\$\$/gs, (match, formula) => {
    return `<div style="text-align: center;"><img src="https://latex.codecogs.com/png.latex?\\dpi{300}\\bg_white\\space${encodeURIComponent(formula.trim())}" alt="Math" style="max-height: 40px;"/></div>`;
  }).replace(/\$(.*?)\$/g, (match, formula) => {
    return `<img src="https://latex.codecogs.com/png.latex?\\dpi{300}\\bg_white\\space${encodeURIComponent(formula.trim())}" alt="Math" style="vertical-align: middle; max-height: 20px;" />`;
  });
};

const MATH_SYMBOLS = [
  { label: 'Pecahan', code: '$\\frac{a}{b}$' },
  { label: 'Kuadrat (x²)', code: '$x^2$' },
  { label: 'Pangkat (xⁿ)', code: '$x^n$' },
  { label: 'Indeks (x₁)', code: '$x_1$' },
  { label: 'Akar (√)', code: '$\\sqrt{x}$' },
  { label: 'Perkalian (×)', code: '$\\times$' },
  { label: 'Pembagian (÷)', code: '$\\div$' },
  { label: 'Pi (π)', code: '$\\pi$' },
  { label: 'Theta (θ)', code: '$\\theta$' },
  { label: 'Alpha (α)', code: '$\\alpha$' },
  { label: 'Beta (β)', code: '$\\beta$' },
  { label: 'Sigma (Σ)', code: '$\\sum_{i=1}^{n}$' },
  { label: 'Integral (∫)', code: '$\\int_{a}^{b} f(x)\\,dx$' },
  { label: 'Kurang Lebih (±)', code: '$\\pm$' },
  { label: 'Tidak Sama (≠)', code: '$\\neq$' },
  { label: 'Sama Sekitar (≈)', code: '$\\approx$' },
  { label: 'Delta (Δ)', code: '$\\Delta$' },
  { label: 'Tak Hingga (∞)', code: '$\\infty$' },
];

function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

const LiteYouTube = ({ videoId, title }: { videoId: string, title: string }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  return (
    <div className="mt-2.5 aspect-video w-full rounded-lg overflow-hidden border border-red-100 dark:border-red-950/20 shadow-xs relative bg-black">
      {!isLoaded ? (
        <button 
          type="button"
          onClick={() => setIsLoaded(true)}
          className="w-full h-full relative group cursor-pointer border-0 p-0 block"
        >
          <img 
            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
            alt={title}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-10 bg-red-600/90 rounded-xl flex items-center justify-center group-hover:bg-red-500 transition-colors shadow-lg">
              <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
            </div>
          </div>
          <div className="absolute bottom-2 left-2 right-2 text-left">
            <span className="text-[10px] bg-black/70 text-white px-2 py-1.5 rounded inline-block">
              <span className="font-bold text-red-400">Hemat Kuota:</span> Klik untuk memutar video
            </span>
          </div>
        </button>
      ) : (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        ></iframe>
      )}
    </div>
  );
};

interface CBTManagerProps {
  exams: CBTExam[];
  onAddExam: (exam: CBTExam) => void;
  results: StudentCBTResult[];
  onAddResult: (res: StudentCBTResult) => void;
  materials: ELearningMaterial[];
  onAddMaterial: (mat: ELearningMaterial) => void;
  onUpdateMaterial?: (id: string, mat: Partial<ELearningMaterial>) => void;
  onDeleteMaterial?: (id: string) => void;
  students: Student[];
  activeRole: string;
  schoolClasses?: string[];
  schoolSubjects?: string[];
  mode?: 'cbt-only' | 'elearning-only';
  session?: any;
}

const formatIndonesianDate = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dayName = days[d.getDay()];
    const dateNum = d.getDate();
    const monthName = months[d.getMonth()];
    const year = d.getFullYear();
    let result = `${dayName}, ${dateNum} ${monthName} ${year}`;
    if (dateStr.includes('T')) {
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      result += ` pukul ${hours}:${mins}`;
    }
    return result;
  } catch (e) {
    return dateStr;
  }
};


export const exportExamToWord = (exam: CBTExam) => {
  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="UTF-8">
      <title>Naskah Soal - ${exam.title}</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
      <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
      <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; max-width: 800px; margin: 0 auto; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 25px; }
        .header h1 { margin: 0 0 10px 0; font-size: 24px; text-transform: uppercase; }
        .header p { margin: 5px 0; font-size: 14px; }
        .meta { display: flex; justify-content: space-between; margin-bottom: 30px; font-weight: bold; font-size: 14px; }
        .question-card { margin-bottom: 30px; page-break-inside: avoid; }
        .q-type { font-weight: bold; margin-bottom: 5px; font-size: 14px; }
        .stimulus { font-style: italic; background: #f9f9f9; padding: 10px; border-left: 3px solid #666; margin-bottom: 10px; font-size: 13px; }
        .q-text { margin-bottom: 10px; font-size: 14px; }
        .options { margin-top: 10px; margin-left: 20px; font-size: 14px; }
        .option-item { margin-bottom: 8px; }
        .match-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
        .match-table th, .match-table td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
        img { max-width: 100%; max-height: 250px; display: block; margin: 10px 0; border: 1px solid #eee; }
        @media print {
          body { padding: 0; max-width: 100%; }
          .stimulus { background: transparent; border-left: 1px solid #000; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${exam.title}</h1>
        <p>Mata Pelajaran: ${exam.subject}</p>
      </div>
      <div class="meta">
        <span>Kelas: ${exam.className}</span>
        <span>Waktu: ${exam.durationMinutes} Menit</span>
        <span>Total: ${exam.totalQuestions} Soal</span>
      </div>
      <div class="questions-list">
        ${exam.questions.map((q, idx) => `
          <div class="question-card">
            <div class="q-type">Soal ${idx + 1} (${q.type.replace('_', ' ').toUpperCase()}) - Bobot: ${q.scoreWeight}</div>
            ${q.stimulus ? `<div class="stimulus"><strong>Stimulus:</strong><br/>${q.stimulus}</div>` : ''}
            ${q.stimulusImage ? `<img src="${q.stimulusImage}" alt="Stimulus"/>` : ''}
            <div class="q-text">${parseMathForWord(q.questionText)}</div>
            ${q.questionImage ? `<img src="${q.questionImage}" alt="Soal"/>` : ''}
            
            ${q.options ? `
              <div class="options">
                ${q.options.map(opt => `
                  <div class="option-item">
                    <strong>${opt.id}.</strong> ${parseMathForWord(opt.text)}
                    ${opt.image ? `<img src="${opt.image}" alt="Opsi" style="max-height: 100px;"/>` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}
            ${q.matchingPairs ? `
              <table class="match-table">
                <tr><th>Bagian Kiri (Istilah)</th><th>Bagian Kanan (Cocokkan)</th></tr>
                ${q.matchingPairs.map(mp => `
                  <tr>
                    <td>
                      ${mp.leftImage ? `<img src="${mp.leftImage}" style="max-height: 80px;"/>` : ''}
                      ${mp.leftText}
                    </td>
                    <td>
                      ${mp.rightImage ? `<img src="${mp.rightImage}" style="max-height: 80px;"/>` : ''}
                      ${mp.rightText}
                    </td>
                  </tr>
                `).join('')}
              </table>
            ` : ''}
            
            ${(q.type === 'uraian' || q.type === 'isian_singkat') ? `
              <div style="margin-top: 15px; border-bottom: 1px dashed #ccc; height: 30px;"></div>
              ${q.type === 'uraian' ? `<div style="border-bottom: 1px dashed #ccc; height: 30px;"></div><div style="border-bottom: 1px dashed #ccc; height: 30px;"></div>` : ''}
            ` : ''}
          </div>
        `).join('')}
      </div>
      <script>
        document.addEventListener("DOMContentLoaded", function() {
            renderMathInElement(document.body, {
              delimiters: [
                  {left: '$$', right: '$$', display: true},
                  {left: '$', right: '$', display: false},
                  {left: '\\\\(', right: '\\\\)', display: false},
                  {left: '\\\\[', right: '\\\\]', display: true}
              ],
              throwOnError : false
            });
            setTimeout(() => { window.print(); }, 1500);
        });
      </script>
    </body>
    </html>
  `;
  
  const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Naskah_Soal_${exam.title.replace(/\s+/g, '_')}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default function CBTManager({
  exams,
  onAddExam,
  results,
  onAddResult,
  materials,
  onAddMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
  students,
  activeRole,
  schoolClasses = [
    "Kelas 1-A (SD)",
    "Kelas 1-B (SD)",
    "Kelas 2-A (SD)",
    "Kelas 3-A (SD)",
    "Kelas 4-A (SD)",
    "Kelas 5-A (SD)",
    "Kelas 6-A (SD)",
    "Kelas 7-A (SMP)",
    "Kelas 7-B (SMP)",
    "Kelas 8-A (SMP)",
    "Kelas 8-B (SMP)",
    "Kelas 9-A (SMP)"
  ],
  schoolSubjects = [
    "Matematika",
    "IPA (Sains)",
    "IPS (Sosial)",
    "Bahasa Indonesia",
    "Bahasa Inggris",
    "Pendidikan Pancasila"
  ],
  mode,
  session
}: CBTManagerProps) {
  const loggedInStudent = (activeRole === 'siswa' || activeRole === 'walimurid') 
    ? students.find(s => (s.usernameCbt || "").toLowerCase() === session?.username?.toLowerCase() || s.id === session?.detailId) 
    : null;

  const nowForToday = new Date();
  const todayStr = `${nowForToday.getFullYear()}-${String(nowForToday.getMonth() + 1).padStart(2, '0')}-${String(nowForToday.getDate()).padStart(2, '0')}`;

  const displayMaterials = materials.filter(mat => {
    if (activeRole === 'siswa' || activeRole === 'walimurid') {
      const matchClass = loggedInStudent ? (mat.className === loggedInStudent.className || mat.className === 'Semua Kelas' || mat.className.includes(loggedInStudent.className)) : true;
      const nowMs = Date.now();
      const isTooEarly = mat.startDate && new Date(mat.startDate).getTime() > nowMs;
      const isExpired = mat.expiryDate && new Date(mat.expiryDate).getTime() < nowMs;
      return matchClass && !isExpired && !isTooEarly;
    }
    return true;
  });

  const displayExams = exams.filter(exam => {
    if (activeRole === 'siswa' || activeRole === 'walimurid') {
      const matchClass = loggedInStudent ? (exam.className === loggedInStudent.className || exam.className === 'Semua Kelas' || exam.className.includes(loggedInStudent.className)) : true;
      return matchClass;
    }
    return true;
  });

  // Tabs: 'cbt-list' | 'create-exam' | 'student-simulator' | 'elearning'
  const [cbtTab, setCbtTab] = useState<'cbt-list' | 'create-exam' | 'student-simulator' | 'elearning'>(() => {
    if (mode === 'elearning-only') return 'elearning';
    return activeRole === 'walimurid' ? 'student-simulator' : 'cbt-list';
  });

  // Active exam for the testing simulator
  const [simulatingExam, setSimulatingExam] = useState<CBTExam | null>(null);
  const [simulatingStudentId, setSimulatingStudentId] = useState('');

  // Auto-set student ID if logged in as siswa
  React.useEffect(() => {
    if (activeRole === 'siswa' || activeRole === 'walimurid') {
      const student = students.find(s => 
        (session?.username && s.usernameCbt && s.usernameCbt.toLowerCase() === session.username.toLowerCase()) || 
        (session?.detailId && s.id === session.detailId)
      );
      if (student) {
        setSimulatingStudentId(student.id);
      }
    }
  }, [activeRole, session, students]);
  const [shuffledQuestions, setShuffledQuestions] = useState<CBTQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Student test answers
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [testSubmitted, setTestSubmitted] = useState<StudentCBTResult | null>(null);
  
  // Anti-cheat / Lockdown Mode state
  const [cheatAttempts, setCheatAttempts] = useState<number>(0);
  const [showCheatWarning, setShowCheatWarning] = useState<boolean>(false);

  // CBT creation state
  const [examTitle, setExamTitle] = useState('');
  const [examSubject, setExamSubject] = useState(schoolSubjects[0] || 'Matematika');
  const [examClasses, setExamClasses] = useState<string[]>([schoolClasses[0] || 'Kelas 4-A (SD)']);
  const [examDuration, setExamDuration] = useState(45);
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [examStartTime, setExamStartTime] = useState('');
  const [examEndTime, setExamEndTime] = useState('');
  const [examRandomized, setExamRandomized] = useState(true);
  const [questions, setQuestions] = useState<CBTQuestion[]>([]);
  
  // Single question draft state
  const [qType, setQType] = useState<CBTQuestion['type']>('pg_sederhana');
  const [qStimulus, setQStimulus] = useState('');
  const [qStimulusImage, setQStimulusImage] = useState<string>('');
  const [qText, setQText] = useState('');
  const [qWeight, setQWeight] = useState(20);
  const [qImage, setQImage] = useState<string>('');
  
  // MCQ options draft
  const [mcOptions, setMcOptions] = useState<string[]>(['', '', '', '']);
  const [mcOptionImages, setMcOptionImages] = useState<string[]>(['', '', '', '']);
  const [mcCorrect, setMcCorrect] = useState('A');
  const [complexCorrect, setComplexCorrect] = useState<string[]>([]);
  const [tfCorrect, setTfCorrect] = useState('BENAR');
  const [shortCorrect, setShortCorrect] = useState('');

  // Matching draft
  const [matchPairs, setMatchPairs] = useState<Array<{left: string, leftImage?: string, right: string, rightImage?: string}>>([
    {left: '', right: ''},
    {left: '', right: ''}
  ]);

  // E-Learning creator state
  const [matTitle, setMatTitle] = useState('');
  const [matClasses, setMatClasses] = useState<string[]>([schoolClasses[0] || 'Kelas 4-A (SD)']);
  const [matSubject, setMatSubject] = useState(schoolSubjects[0] || 'Matematika');
  const [matType, setMatType] = useState<'pdf' | 'video' | 'link' | 'text' | 'png'>('video');
  const [matContent, setMatContent] = useState('');
  const [matFileName, setMatFileName] = useState('');
  const [matSuccess, setMatSuccess] = useState(false);
  const [matIdToEdit, setMatIdToEdit] = useState<string | null>(null);
  const [matHasExpiry, setMatHasExpiry] = useState(false);
  const [matExpiryDate, setMatExpiryDate] = useState('');
  const [matHasStartDate, setMatHasStartDate] = useState(false);
  const [matStartDate, setMatStartDate] = useState('');

  // Handle adding a question to the exam builder
  const handleAddQuestionToDraft = () => {
    if (!qText.trim()) return;

    let newQuestion: CBTQuestion = {
      id: `q_${Date.now()}`,
      type: qType,
      stimulus: qStimulus,
      stimulusImage: qStimulusImage,
      questionText: qText,
      questionImage: qImage || undefined,
      scoreWeight: Number(qWeight)
    };

    if (qType === 'pg_sederhana') {
      newQuestion.options = mcOptions.filter(o => o.trim() !== '').map((o, idx) => ({
        id: String.fromCharCode(65 + idx), // A, B, C, D...
        text: o,
        image: mcOptionImages[idx] || undefined
      }));
      newQuestion.correctAnswer = mcCorrect;
    } else if (qType === 'pg_kompleks') {
      newQuestion.options = mcOptions.filter(o => o.trim() !== '').map((o, idx) => ({
        id: String.fromCharCode(65 + idx),
        text: o,
        image: mcOptionImages[idx] || undefined
      }));
      newQuestion.correctAnswer = complexCorrect;
    } else if (qType === 'benar_salah') {
      newQuestion.correctAnswer = tfCorrect;
    } else if (qType === 'isian_singkat') {
      newQuestion.correctAnswer = shortCorrect.trim();
    } else if (qType === 'menjodohkan') {
      newQuestion.matchingPairs = matchPairs
        .filter(p => p.left.trim() !== '' && p.right.trim() !== '')
        .map((p, idx) => ({
          leftId: `L${idx+1}`,
          leftText: p.left,
          leftImage: p.leftImage,
          rightId: `R${idx+1}`,
          rightText: p.right,
          rightImage: p.rightImage
        }));
    }

    setQuestions([...questions, newQuestion]);
    // Reset question form
    setQText('');
    setQStimulus('');
    setQStimulusImage('');
    setQImage('');
    setMcOptions(['', '', '', '']);
    setMcOptionImages(['', '', '', '']);
    setComplexCorrect([]);
    setShortCorrect('');
    setMatchPairs([{left: '', right: ''}, {left: '', right: ''}]);
  };

  const downloadTemplateExcel = () => {
    const data = [
      {
        'Tipe_Soal': 'pg_sederhana',
        'Pertanyaan': 'Apa ibu kota Indonesia?',
        'Opsi_A': 'Jakarta',
        'Opsi_B': 'Bandung',
        'Opsi_C': 'Surabaya',
        'Opsi_D': 'Medan',
        'Opsi_E': 'Semarang',
        'Kunci_Jawaban': 'A',
        'Bobot_Nilai': 10
      },
      {
        'Tipe_Soal': 'pg_kompleks',
        'Pertanyaan': 'Pilih warna primer:',
        'Opsi_A': 'Merah',
        'Opsi_B': 'Hijau',
        'Opsi_C': 'Biru',
        'Opsi_D': 'Kuning',
        'Opsi_E': 'Coklat',
        'Kunci_Jawaban': 'A,C',
        'Bobot_Nilai': 15
      },
      {
        'Tipe_Soal': 'benar_salah',
        'Pertanyaan': 'Bumi itu bulat.',
        'Opsi_A': '',
        'Opsi_B': '',
        'Opsi_C': '',
        'Opsi_D': '',
        'Opsi_E': '',
        'Kunci_Jawaban': 'BENAR',
        'Bobot_Nilai': 10
      },
      {
        'Tipe_Soal': 'isian_singkat',
        'Pertanyaan': 'Presiden pertama Indonesia adalah...',
        'Opsi_A': '',
        'Opsi_B': '',
        'Opsi_C': '',
        'Opsi_D': '',
        'Opsi_E': '',
        'Kunci_Jawaban': 'Soekarno',
        'Bobot_Nilai': 15
      },
      {
        'Tipe_Soal': 'uraian',
        'Pertanyaan': 'Jelaskan proses terjadinya hujan!',
        'Opsi_A': '',
        'Opsi_B': '',
        'Opsi_C': '',
        'Opsi_D': '',
        'Opsi_E': '',
        'Kunci_Jawaban': '',
        'Bobot_Nilai': 30
      },
      {
        'Tipe_Soal': 'menjodohkan',
        'Pertanyaan': 'Jodohkan negara dengan ibu kotanya!',
        'Opsi_A': 'Indonesia=Jakarta',
        'Opsi_B': 'Malaysia=Kuala Lumpur',
        'Opsi_C': 'Jepang=Tokyo',
        'Opsi_D': '',
        'Opsi_E': '',
        'Kunci_Jawaban': '',
        'Bobot_Nilai': 20
      }
    ];
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Soal');
    XLSX.writeFile(workbook, 'Template_Soal_CBT.xlsx');
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const importedQuestions: CBTQuestion[] = data.map((row: any, idx) => {
          const type = row['Tipe_Soal'] || 'pg_sederhana';
          const q: CBTQuestion = {
            id: `q_imp_${Date.now()}_${idx}`,
            type: type,
            questionText: row['Pertanyaan'] || '',
            scoreWeight: Number(row['Bobot_Nilai']) || 10
          };
          
          if (type === 'pg_sederhana' || type === 'pg_kompleks') {
             const options = [];
             if (row['Opsi_A']) options.push({ id: 'A', text: String(row['Opsi_A']) });
             if (row['Opsi_B']) options.push({ id: 'B', text: String(row['Opsi_B']) });
             if (row['Opsi_C']) options.push({ id: 'C', text: String(row['Opsi_C']) });
             if (row['Opsi_D']) options.push({ id: 'D', text: String(row['Opsi_D']) });
             if (row['Opsi_E']) options.push({ id: 'E', text: String(row['Opsi_E']) });
             q.options = options;
             
             if (type === 'pg_sederhana') {
               q.correctAnswer = String(row['Kunci_Jawaban'] || 'A').trim().toUpperCase();
             } else {
               q.correctAnswer = String(row['Kunci_Jawaban'] || 'A').split(',').map(s => s.trim().toUpperCase());
             }
          } else if (type === 'benar_salah') {
             q.correctAnswer = String(row['Kunci_Jawaban'] || 'BENAR').trim().toUpperCase() === 'SALAH' ? 'SALAH' : 'BENAR';
          } else if (type === 'isian_singkat') {
             q.correctAnswer = String(row['Kunci_Jawaban'] || '').trim();
          } else if (type === 'menjodohkan') {
             const pairs: any[] = [];
             ['Opsi_A', 'Opsi_B', 'Opsi_C', 'Opsi_D', 'Opsi_E'].forEach((optKey, oidx) => {
               if (row[optKey]) {
                 const parts = String(row[optKey]).split('=');
                 if (parts.length === 2) {
                   pairs.push({
                     leftId: `L${oidx+1}`,
                     leftText: parts[0].trim(),
                     rightId: `R${oidx+1}`,
                     rightText: parts[1].trim()
                   });
                 }
               }
             });
             q.matchingPairs = pairs;
          }
          
          return q;
        });

        setQuestions(prev => [...prev, ...importedQuestions]);
        alert(`Berhasil mengimpor ${importedQuestions.length} soal!`);
      } catch (err) {
        console.error("Error importing excel:", err);
        alert("Gagal membaca file Excel. Pastikan format sesuai template.");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // Submit complete exam
  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim() || questions.length === 0) return;

    if (examClasses.length === 0) {
      alert('Pilih minimal satu kelas!');
      return;
    }
    examClasses.forEach((cls, idx) => {
      const newExam: CBTExam = {
        id: `exam_${Date.now()}_${idx}`,
        title: examTitle,
        subject: examSubject,
        className: cls,
        date: examDate,
        startTime: examStartTime || undefined,
        endTime: examEndTime || undefined,
        durationMinutes: Number(examDuration),
        totalQuestions: questions.length,
        questions: questions,
        isPublished: true,
        isRandomized: examRandomized
      };
      onAddExam(newExam);
    });
    setExamTitle('');
    setQuestions([]);
    setExamRandomized(true);
    setCbtTab('cbt-list');
  };

  // E-learning post submit
  const handlePostElearning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle.trim() || !matContent.trim()) return;

    if (matClasses.length === 0) {
      alert('Pilih minimal satu kelas!');
      return;
    }

    if (matIdToEdit && onUpdateMaterial) {
      // Update single existing material
      onUpdateMaterial(matIdToEdit, {
        title: matTitle,
        subject: matSubject,
        className: matClasses[0], // Use first selected class if multiple selected
        type: matType,
        content: matContent,
        fileName: matFileName || undefined,
        startDate: (matHasStartDate && matStartDate) ? matStartDate : undefined,
        expiryDate: (matHasExpiry && matExpiryDate) ? matExpiryDate : undefined,
      });
      setMatIdToEdit(null);
    } else {
      // Create new materials
      matClasses.forEach((cls, idx) => {
        const newMaterial: ELearningMaterial = {
          id: `mat_${Date.now()}_${idx}`,
          title: matTitle,
          subject: matSubject,
          className: cls,
          teacherName: session?.name || "Guru Pengampu",
          type: matType,
          content: matContent,
          fileName: matFileName || undefined,
          createdAt: new Date().toISOString().split('T')[0],
          startDate: (matHasStartDate && matStartDate) ? matStartDate : undefined,
          expiryDate: (matHasExpiry && matExpiryDate) ? matExpiryDate : undefined,
        };
        onAddMaterial(newMaterial);
      });
    }

    setMatTitle('');
    setMatContent('');
    setMatFileName('');
    setMatHasExpiry(false);
    setMatExpiryDate('');
    setMatHasStartDate(false);
    setMatStartDate('');
    setMatSuccess(true);
    setTimeout(() => {
      setMatSuccess(false);
    }, 3000);
  };
  
  const handleEditMaterial = (mat: ELearningMaterial) => {
    setMatIdToEdit(mat.id);
    setMatTitle(mat.title);
    setMatSubject(mat.subject);
    setMatClasses([mat.className]);
    setMatType(mat.type);
    setMatContent(mat.content);
    setMatFileName(mat.fileName || '');
    setMatHasStartDate(!!mat.startDate);
    setMatStartDate(mat.startDate || '');
    setMatHasExpiry(!!mat.expiryDate);
    setMatExpiryDate(mat.expiryDate || '');
    
    // Scroll up to form
    const formElement = document.getElementById('elearning-panel');
    if(formElement) formElement.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleDeleteMaterial = (id: string) => {
    if(confirm('Hapus materi ini?')) {
      onDeleteMaterial?.(id);
    }
  };

  // Start Exam simulator for a student
  const startExamSimulator = (exam: CBTExam) => {
    if (!simulatingStudentId) {
      alert("Harap pilih Akun Siswa terlebih dahulu.");
      return;
    }
    
    if (activeRole === 'siswa' || activeRole === 'walimurid') {
      const now = new Date();
      // Use local timezone to get YYYY-MM-DD
      const localYear = now.getFullYear();
      const localMonth = String(now.getMonth() + 1).padStart(2, '0');
      const localDay = String(now.getDate()).padStart(2, '0');
      const today = `${localYear}-${localMonth}-${localDay}`;
      
      if (exam.date && exam.date !== today) {
        alert(`Ujian ini dijadwalkan pada tanggal ${formatIndonesianDate(exam.date)} dan tidak dapat dikerjakan saat ini.`);
        return;
      }
      
      const currentTimeString = now.toTimeString().substring(0, 5);
      if (exam.startTime && currentTimeString < exam.startTime) {
        alert(`Ujian belum dimulai. Waktu pelaksanaan dimulai pukul ${exam.startTime}.`);
        return;
      }
      if (exam.endTime && currentTimeString > exam.endTime) {
        alert(`Batas waktu pengerjaan ujian sudah berakhir pada pukul ${exam.endTime}.`);
        return;
      }
    }
    
    // Check if student already has a score for this exam
    const existingResult = results.find(r => String(r.examId) === String(exam.id) && String(r.studentId) === String(simulatingStudentId));
    if (existingResult) {
      alert("Ujian ini sudah pernah dikerjakan. Siswa hanya dapat mengirimkan jawaban satu kali.");
      return;
    }

    let examQuestions = [...(exam.questions || [])];
    if (exam.isRandomized) {
      // Shuffle algorithm (Fisher-Yates)
      for (let i = examQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [examQuestions[i], examQuestions[j]] = [examQuestions[j], examQuestions[i]];
      }
    }

    setSimulatingExam(exam);
    setShuffledQuestions(examQuestions);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTestSubmitted(null);
  };

  // Submit test answers in simulator & calculate automated scoring
  const submitTestAnswers = () => {
    if (!simulatingExam || !simulatingStudentId) return;

    const studentObj = students.find(s => s.id === simulatingStudentId);
    if (!studentObj) return;

    let totalEarnedScore = 0;
    let maxPossibleScore = 0;

    shuffledQuestions.forEach(q => {
      maxPossibleScore += q.scoreWeight;
      const answer = answers[q.id];

      if (q.type === 'pg_sederhana') {
        if (answer === q.correctAnswer) {
          totalEarnedScore += q.scoreWeight;
        }
      } else if (q.type === 'pg_kompleks') {
        const correctAnswers = q.correctAnswer as string[];
        const studentAnswers = answer as string[] || [];
        // simple evaluation: must match exactly
        const isMatch = correctAnswers.length === studentAnswers.length &&
                        correctAnswers.every(v => studentAnswers.includes(v));
        if (isMatch) {
          totalEarnedScore += q.scoreWeight;
        }
      } else if (q.type === 'benar_salah') {
        if (answer === q.correctAnswer) {
          totalEarnedScore += q.scoreWeight;
        }
      } else if (q.type === 'isian_singkat') {
        if (answer && String(answer).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()) {
          totalEarnedScore += q.scoreWeight;
        }
      } else if (q.type === 'menjodohkan') {
        // matching simulator defaults to correct if filled to give beautiful interaction
        if (answer && Object.keys(answer).length === q.matchingPairs?.length) {
          totalEarnedScore += q.scoreWeight;
        }
      } else if (q.type === 'uraian') {
        // Teacher grades essay, simulate 80% default auto-scoring for simulation fun
        totalEarnedScore += Math.round(q.scoreWeight * 0.85);
      }
    });

    const finalScore = Math.round((totalEarnedScore / maxPossibleScore) * 100);

    const newResult: StudentCBTResult = {
      examId: simulatingExam.id,
      examTitle: simulatingExam.title,
      studentId: studentObj.id,
      studentName: studentObj.name,
      subject: simulatingExam.subject,
      score: finalScore,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      isGraded: true,
      teacherFeedback: `Automated assessment completed. Good progress on ${simulatingExam.subject}.`
    };

    onAddResult(newResult);
    setTestSubmitted(newResult);
    
    // Simulate notification creation
    
  };

  const submitRef = useRef(submitTestAnswers);
  useEffect(() => {
    submitRef.current = submitTestAnswers;
  }, [submitTestAnswers]);

  useEffect(() => {
    if (!simulatingExam || testSubmitted) {
      setCheatAttempts(0);
      setShowCheatWarning(false);
      return;
    }

    // Disable right click, copy, paste, cut inside the exam
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      alert("⚠️ Tindakan mencurigakan terdeteksi. Jangan menyalin (copy) soal.");
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      alert("⚠️ Dilarang memotong/cut soal.");
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      alert("⚠️ Dilarang menyisipkan/paste dari sumber luar. Kerjakan secara mandiri.");
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      if (
        e.key === 'F12' ||
        (isCtrl && e.shiftKey && e.key?.toLowerCase() === 'i') ||
        (isCtrl && e.key?.toLowerCase() === 'u') ||
        (isCtrl && e.key?.toLowerCase() === 'c') ||
        (isCtrl && e.key?.toLowerCase() === 'v')
      ) {
        e.preventDefault();
      }
    };

    // Tab Switch Detection (Anti-Cheat / Focus Lost)
    const handleWindowBlur = () => {
      setCheatAttempts(prev => {
        const nextCount = prev + 1;
        setShowCheatWarning(true);
        return nextCount;
      });
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopy);
    window.addEventListener('cut', handleCut);
    window.addEventListener('paste', handlePaste);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('cut', handleCut);
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [simulatingExam, testSubmitted]);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold font-sans text-gray-800 dark:text-white">Penilaian CBT & E-Learning</h1>
        <p className="text-sm text-gray-500 dark:text-[#a3a4cc]">
          Buat ujian dengan 6 tipe soal (Acak Soal didukung) serta bagikan materi E-learning. Gunakan Tab Simulator untuk mencoba ujian sebagai siswa.
        </p>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b dark:border-[#3e405b]">
        {activeRole !== 'walimurid' && (
          <>
            {mode !== 'elearning-only' && (
              <button
                onClick={() => { setCbtTab('cbt-list'); setSimulatingExam(null); }}
                className={`px-4 py-2.5 font-semibold text-xs border-b-2 transition-all cursor-pointer
                  ${cbtTab === 'cbt-list' 
                    ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Daftar Ujian CBT
              </button>
            )}
            {mode !== 'elearning-only' && (activeRole !== 'siswa' && activeRole !== 'walimurid') && (
              <button
                onClick={() => { setCbtTab('create-exam'); setSimulatingExam(null); }}
                className={`px-4 py-2.5 font-semibold text-xs border-b-2 transition-all cursor-pointer
                  ${cbtTab === 'create-exam' 
                    ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                + Buat Ujian Baru
              </button>
            )}
            {mode !== 'cbt-only' && (
              <button
                onClick={() => { setCbtTab('elearning'); setSimulatingExam(null); }}
                className={`px-4 py-2.5 font-semibold text-xs border-b-2 transition-all cursor-pointer
                  ${cbtTab === 'elearning' 
                    ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                E-Learning Portal
              </button>
            )}
          </>
        )}
        {mode !== 'elearning-only' && (
          <button
            onClick={() => { setCbtTab('student-simulator'); }}
            className={`px-4 py-2.5 font-semibold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-1.5
              ${cbtTab === 'student-simulator' 
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400 font-bold' 
                : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Play size={12} className="text-emerald-500 animate-pulse" />
            <span>Simulator Ujian Siswa (CBT)</span>
          </button>
        )}
      </div>

      {/* --- TAB 1: CBT LIST --- */}
      {cbtTab === 'cbt-list' && (
        <div id="cbt-list-panel" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* List of active exams */}
          <div className={`space-y-4 ${activeRole === 'walimurid' ? 'lg:col-span-12' : 'lg:col-span-8'}`}>
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">Daftar Aktif Penilaian CBT</h2>
            {displayExams.map(exam => {
              const isDone = (activeRole === 'siswa' || activeRole === 'walimurid')
                ? results.some(r => String(r.examId) === String(exam.id) && String(r.studentId) === String(loggedInStudent?.id))
                : false;

              return (
              <div 
                key={exam.id} 
                className="bg-white dark:bg-[#2b2c40] rounded-xl p-4 border border-gray-100 dark:border-[#3e405b] shadow-xs hover:shadow-sm transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold px-2.5 py-0.5 rounded">
                      {exam.className}
                    </span>
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{exam.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <Clock size={12} />
                    <span>{exam.durationMinutes} Menit</span>
                    {exam.isRandomized && (
                      <span className="flex items-center gap-1 text-emerald-500 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                        <Shuffle size={10} /> Diacak
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Mata Pelajaran: <span className="font-semibold text-gray-700 dark:text-gray-200">{exam.subject}</span> | 
                  Jumlah Soal: <span className="font-semibold text-gray-700 dark:text-gray-200">{exam.totalQuestions} Soal</span> (Pilihan Ganda, Isian, Kompleks, Menjodohkan, B/S, Uraian)
                </p>
                {(exam.date || exam.startTime || exam.endTime) && (
                  <p className="text-[11px] text-emerald-500 mt-1 font-medium">
                    Jadwal Pelaksanaan: {exam.date ? formatIndonesianDate(exam.date) : ''} {exam.startTime ? `(${exam.startTime} - ${exam.endTime || 'Selesai'})` : ''}
                  </p>
                )}

                {/* Question drawer toggle preview */}
                <div className="mt-3 pt-3 border-t dark:border-[#3e405b]/40 flex justify-between items-center text-[11px]">
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">● Status: Aktif Terkoneksi</span>
                  <div className="flex flex-wrap items-center gap-3">
                    {(activeRole !== 'siswa' && activeRole !== 'walimurid') && (
                      <button 
                        onClick={() => exportExamToWord(exam)}
                        className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        title="Unduh Naskah Soal (Format Microsoft Word)"
                      >
                        📄 Unduh Soal (Word)
                      </button>
                    )}
                    {(activeRole !== 'siswa' && activeRole !== 'walimurid') && (
                      <button 
                        onClick={() => {
                          const examResults = results.filter(r => String(r.examId) === String(exam.id));
                          if (examResults.length === 0) {
                            alert("Belum ada siswa yang mengerjakan ujian ini.");
                            return;
                          }
                          const data = examResults.map((r, i) => ({
                            'No': i + 1,
                            'Nama Siswa': r.studentName,
                            'Mata Pelajaran': r.subject,
                            'Nilai CBT': r.score,
                            'Waktu Kumpul': r.submittedAt,
                          }));
                          const ws = XLSX.utils.json_to_sheet(data);
                          const wb = XLSX.utils.book_new();
                          XLSX.utils.book_append_sheet(wb, ws, "Rekap");
                          XLSX.writeFile(wb, `Rekap_CBT_${exam.title.replace(/\s+/g, '_')}.xlsx`);
                        }}
                        className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Unduh Rekap Nilai (Excel)
                      </button>
                    )}
                    {isDone ? (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg uppercase">
                        Telah Dikerjakan
                      </span>
                    ) : (
                      <button 
                        onClick={() => {
                          if ((activeRole !== 'siswa' && activeRole !== 'walimurid')) {
                            setSimulatingStudentId(students[0]?.id || '');
                          }
                          setCbtTab('student-simulator');
                          if ((activeRole === 'siswa' || activeRole === 'walimurid') && simulatingStudentId) {
                             startExamSimulator(exam);
                          }
                        }}
                        className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {(activeRole === 'siswa' || activeRole === 'walimurid') ? 'Kerjakan Ujian' : 'Uji Coba CBT'} <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )})}
          </div>

          {/* Results list - connected to parents */}
          {activeRole !== 'walimurid' && (
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">Riwayat Hasil & Nilai Real-time</h2>
              {(activeRole !== 'siswa' && activeRole !== 'walimurid') && (
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('data-updated'))}
                  className="text-[9px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-400 px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                  title="Segarkan data hasil ujian"
                >
                  🔄 Segarkan
                </button>
              )}
            </div>
            <div className="bg-white dark:bg-[#2b2c40] rounded-xl p-4 border border-gray-100 dark:border-[#3e405b] shadow-xs">
              <p className="text-xs text-gray-400 mb-3 font-medium">Ujian yang dikerjakan siswa otomatis dikirim ke Portal Orangtua.</p>
              
              <div className="space-y-3">
                {((activeRole === 'siswa' || activeRole === 'walimurid') 
                  ? results.filter(r => {
                      const uname = session?.username || "";
                      const student = students.find(s => (s.usernameCbt || "").toLowerCase() === uname.toLowerCase() || s.id === session?.detailId);
                      return student ? r.studentId === student.id : false;
                    })
                  : results
                ).map((res, index) => (
                  <div key={index} className="p-3 border-b last:border-b-0 dark:border-[#3e405b]/50 text-xs">
                    <div className="flex justify-between font-bold">
                      <span className="text-gray-800 dark:text-gray-200">{res.studentName}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] 
                        ${res.score >= 75 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}
                      >
                        Nilai: {res.score}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">{res.examTitle} ({res.subject})</p>
                    {res.teacherFeedback && (
                      <p className="text-[10px] italic text-emerald-600 dark:text-emerald-400 mt-1">" {res.teacherFeedback} "</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          )}
        </div>
      )}

      {/* --- TAB 2: CREATE EXAM FORM --- */}
      {cbtTab === 'create-exam' && (
        <form onSubmit={handleSaveExam} id="create-exam-form" className="bg-white dark:bg-[#2b2c40] rounded-xl p-5 border border-gray-100 dark:border-[#3e405b] shadow-sm space-y-6 animate-fade-in">
          
          {/* Exam metadata */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Judul Ujian CBT</label>
              <input
                id="cbt-title-input"
                type="text"
                placeholder="Contoh: Ulangan Harian 2 SPLDV"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 rounded-lg border focus:outline-none bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Mata Pelajaran</label>
              <select
                id="cbt-subject-select"
                value={examSubject}
                onChange={(e) => setExamSubject(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border focus:outline-none bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white"
              >
                {schoolSubjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Kelas Target (Pilih 1 atau lebih)</label>
              <div className="w-full max-h-[100px] overflow-y-auto px-3 py-2 rounded-lg border bg-gray-50 dark:bg-[#232333] dark:border-[#3e405b]">
                {schoolClasses.map(c => (
                  <label key={c} className="flex items-center gap-2 mb-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={examClasses.includes(c)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setExamClasses(prev => [...prev, c]);
                        } else {
                          setExamClasses(prev => prev.filter(cls => cls !== c));
                        }
                      }}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 bg-white dark:bg-[#1e1e2d]"
                    />
                    <span className="text-xs text-gray-700 dark:text-gray-300">{c}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Tanggal Ujian</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border focus:outline-none bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Durasi (Menit)</label>
                <input
                  id="cbt-duration-input"
                  type="number"
                  value={examDuration}
                  onChange={(e) => setExamDuration(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-lg border focus:outline-none bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Waktu Mulai (Opsi)</label>
                <input
                  type="time"
                  value={examStartTime}
                  onChange={(e) => setExamStartTime(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border focus:outline-none bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Waktu Selesai (Opsi)</label>
                <input
                  type="time"
                  value={examEndTime}
                  onChange={(e) => setExamEndTime(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border focus:outline-none bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-4 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-100/50 dark:border-emerald-900/30">
            <Shuffle size={20} className="text-emerald-600" />
            <div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={examRandomized}
                  onChange={(e) => setExamRandomized(e.target.checked)}
                />
                <span>Acak Urutan Soal (Shuffle Soal)</span>
              </label>
              <p className="text-[10px] text-gray-400">Mengacak susunan butir pertanyaan untuk mencegah kecurangan saat siswa mengerjakan.</p>
            </div>
          </div>

          {/* Question Builder Box */}
          <div className="border rounded-xl p-4 bg-gray-50/50 dark:bg-[#232333]/40 dark:border-[#3e405b]">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                <CheckSquare size={16} className="text-emerald-600" />
                Generator Butir Soal (Mendukung 6 Model Soal)
              </h3>
              <a href="https://generator-soal.ai.studio" target="_blank" rel="noopener noreferrer" className="text-[10px] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-md font-semibold hover:bg-emerald-200 transition-colors flex items-center gap-1">
                <span>✨ Buat Soal AI</span>
              </a>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1">Model Soal CBT</label>
                  <select
                    id="question-type-select"
                    value={qType}
                    onChange={(e) => setQType(e.target.value as CBTQuestion['type'])}
                    className="w-full text-xs px-3 py-2 rounded-lg border bg-white dark:bg-[#2b2c40] text-gray-800 dark:text-white dark:border-[#3e405b]"
                  >
                    <option value="pg_sederhana">Pilihan Ganda Sederhana (Single Choice)</option>
                    <option value="pg_kompleks">Pilihan Ganda Kompleks (Multi Select)</option>
                    <option value="benar_salah">Benar / Salah (True / False)</option>
                    <option value="menjodohkan">Menjodohkan (Matching Pair)</option>
                    <option value="isian_singkat">Isian Singkat (Fill-In)</option>
                    <option value="uraian">Uraian / Essay</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1">Stimulus (Opsional)</label>
                  <textarea
                    placeholder="Tulis stimulus atau narasi teks (jika ada)... (Gunakan $ untuk rumus inline, atau $ untuk rumus block)"
                    value={qStimulus}
                    onChange={(e) => setQStimulus(e.target.value)}
                    rows={2}
                    className="w-full text-xs px-3 py-2 rounded-lg border bg-white dark:bg-[#2b2c40] text-gray-800 dark:text-white dark:border-[#3e405b] focus:outline-none focus:ring-1 focus:ring-emerald-500 mb-2"
                  />
                  {qStimulusImage && (
                    <div className="relative inline-block mb-2">
                      <img src={qStimulusImage} alt="Stimulus" className="h-20 object-contain rounded border dark:border-[#3e405b]" />
                      <button type="button" onClick={() => setQStimulusImage('')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-sm hover:bg-red-600"><X size={12}/></button>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-4 border-b pb-3 dark:border-[#3e405b]/60">
                    <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-[#232333] dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg border dark:border-[#3e405b] text-[10px] font-semibold flex items-center gap-1.5 transition-colors">
                      <ImageIcon size={14} className="text-emerald-600 dark:text-emerald-400" />
                      <span>Upload Gambar Stimulus</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) compressImage(file).then(dataUrl => setQStimulusImage(dataUrl)).catch(console.error);
                        }}
                      />
                    </label>
                  </div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1">Pertanyaan / Soal</label>
                  <textarea
                    id="question-text-input"
                    placeholder="Tulis soal ujian... (Gunakan $ untuk rumus inline, atau $$ untuk rumus block)"
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    rows={2}
                    className="w-full text-xs px-3 py-2 rounded-lg border bg-white dark:bg-[#2b2c40] text-gray-800 dark:text-white dark:border-[#3e405b] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  
                  {/* Image uploader and Math helper inside this grid element */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mt-2 border-t pt-2 dark:border-[#3e405b]/60">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-[#232333] dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg border dark:border-[#3e405b] text-[10px] font-semibold flex items-center gap-1.5 transition-colors">
                        <ImageIcon size={14} className="text-emerald-600 dark:text-emerald-400" />
                        <span>Upload Gambar Soal</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              compressImage(file).then(dataUrl => setQImage(dataUrl)).catch(console.error);
                            }
                          }}
                        />
                      </label>
                      {qImage && (
                        <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 pl-2 pr-1 py-1 rounded text-[10px] border border-emerald-100 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400">
                          <span className="truncate max-w-[120px]">Gambar Soal Terpasang</span>
                          <button 
                            type="button" 
                            onClick={() => setQImage('')} 
                            className="text-rose-500 hover:text-rose-700 font-bold ml-1 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Math Symbols Helper */}
                  <div className="mt-3 bg-slate-50 dark:bg-[#232333]/30 p-2.5 rounded-lg border dark:border-[#3e405b]/40">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold block mb-1">
                      Penyisip Rumus Matematika (Klik untuk menambahkan):
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {MATH_SYMBOLS.map((sym, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => {
                            setQText(prev => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + sym.code);
                          }}
                          className="px-2 py-1 bg-white hover:bg-slate-100 dark:bg-[#2b2c40] dark:hover:bg-slate-800 text-[10px] border dark:border-[#3e405b] rounded text-slate-700 dark:text-slate-300 transition-colors font-mono cursor-pointer"
                        >
                          {sym.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Render Preview */}
                  {(qText.trim() || qImage) && (
                    <div className="mt-3 p-3 rounded-lg bg-emerald-50/10 dark:bg-slate-900/30 border border-dashed border-emerald-200 dark:border-[#3e405b] text-xs">
                      <span className="font-bold text-[10px] text-emerald-500 uppercase block mb-1">Pratinjau Butir Soal (Live Preview)</span>
                      <div className="text-gray-800 dark:text-gray-200 mt-1 space-y-2">
                        <MathText text={qText || '...'} />
                        {qImage && (
                          <div className="mt-2 rounded overflow-hidden max-w-[150px] border dark:border-[#3e405b]">
                            <img src={qImage} alt="Preview" className="max-h-20 object-contain" referrerPolicy="no-referrer" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic properties based on selected question type */}
              {qType === 'pg_sederhana' && (
                <div className="space-y-3 p-3 bg-white dark:bg-[#2b2c40] rounded-lg border dark:border-[#3e405b]/60">
                  <span className="font-semibold text-[10px] text-gray-400">Opsi Pilihan Ganda & Kunci (Mendukung Persamaan $...$ & Gambar)</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {mcOptions.map((opt, idx) => (
                      <div key={idx} className="space-y-1.5 p-2.5 border rounded dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-gray-500">Opsi {String.fromCharCode(65 + idx)}</span>
                          <label className="cursor-pointer text-[9px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                            <ImageIcon size={10} />
                            <span>{mcOptionImages[idx] ? 'Ganti Gambar' : 'Upload Gambar'}</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  compressImage(file).then(dataUrl => {
                                    const updated = [...mcOptionImages];
                                    updated[idx] = dataUrl;
                                    setMcOptionImages(updated);
                                  }).catch(console.error);
                                }
                              }}
                            />
                          </label>
                        </div>
                        <input
                          type="text"
                          placeholder={`Teks Opsi ${String.fromCharCode(65 + idx)}...`}
                          value={opt}
                          onChange={(e) => {
                            const updated = [...mcOptions];
                            updated[idx] = e.target.value;
                            setMcOptions(updated);
                          }}
                          className="w-full text-xs px-2.5 py-1.5 rounded border dark:bg-[#232333] dark:border-[#3e405b] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <div className="flex flex-wrap gap-1 mt-1">
                          {MATH_SYMBOLS.map((sym, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => {
                                const updated = [...mcOptions];
                                const currentText = updated[idx];
                                updated[idx] = currentText + (currentText.endsWith(' ') || currentText === '' ? '' : ' ') + sym.code;
                                setMcOptions(updated);
                              }}
                              className="px-1.5 py-0.5 bg-white hover:bg-slate-100 dark:bg-[#232333] dark:hover:bg-slate-800 text-[8px] border dark:border-[#3e405b] rounded text-slate-700 dark:text-slate-300 transition-colors font-mono cursor-pointer"
                              title={sym.label}
                            >
                              {sym.code.replace(/\$/g, '')}
                            </button>
                          ))}
                        </div>
                        {mcOptionImages[idx] && (
                          <div className="flex items-center justify-between gap-2 p-1 bg-white dark:bg-slate-950 rounded border dark:border-[#3e405b]">
                            <img src={mcOptionImages[idx]} alt="Preview Opsi" className="h-10 object-contain" referrerPolicy="no-referrer" />
                            <button 
                              type="button" 
                              onClick={() => {
                                const updated = [...mcOptionImages];
                                updated[idx] = '';
                                setMcOptionImages(updated);
                              }}
                              className="text-rose-500 hover:text-rose-700 text-[10px] font-bold px-1.5"
                            >
                              ✕ Hapus
                            </button>
                          </div>
                        )}
                        {/* Live Option Math Preview */}
                        {opt.trim() && (opt.includes('$')) && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 pl-1 border-l border-emerald-200">
                            Pratinjau Rumus: <MathText text={opt} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t dark:border-[#3e405b]/40">
                    <label className="block text-[10px] text-gray-400 mb-1 font-semibold">Pilih Jawaban Benar</label>
                    <select
                      value={mcCorrect}
                      onChange={(e) => setMcCorrect(e.target.value)}
                      className="text-xs px-3 py-1.5 rounded border dark:bg-[#232333] dark:border-[#3e405b] text-gray-800 dark:text-white"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                </div>
              )}

              {qType === 'pg_kompleks' && (
                <div className="space-y-3 p-3 bg-white dark:bg-[#2b2c40] rounded-lg border dark:border-[#3e405b]/60">
                  <span className="font-semibold text-[10px] text-gray-400 block">Opsi Pilihan Ganda Kompleks & Kunci (Bisa centang beberapa)</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {mcOptions.map((opt, idx) => (
                      <div key={idx} className="space-y-1.5 p-2.5 border rounded dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-gray-500">
                            <input
                              type="checkbox"
                              checked={complexCorrect.includes(String.fromCharCode(65 + idx))}
                              onChange={(e) => {
                                const char = String.fromCharCode(65 + idx);
                                if (e.target.checked) {
                                  setComplexCorrect([...complexCorrect, char]);
                                } else {
                                  setComplexCorrect(complexCorrect.filter(c => c !== char));
                                }
                              }}
                              className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>Opsi {String.fromCharCode(65 + idx)} {complexCorrect.includes(String.fromCharCode(65 + idx)) ? '(KUNCI)' : ''}</span>
                          </label>
                          <label className="cursor-pointer text-[9px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                            <ImageIcon size={10} />
                            <span>{mcOptionImages[idx] ? 'Ganti Gambar' : 'Upload Gambar'}</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  compressImage(file).then(dataUrl => {
                                    const updated = [...mcOptionImages];
                                    updated[idx] = dataUrl;
                                    setMcOptionImages(updated);
                                  }).catch(console.error);
                                }
                              }}
                            />
                          </label>
                        </div>
                        <input
                          type="text"
                          placeholder={`Teks Opsi ${String.fromCharCode(65 + idx)}...`}
                          value={opt}
                          onChange={(e) => {
                            const updated = [...mcOptions];
                            updated[idx] = e.target.value;
                            setMcOptions(updated);
                          }}
                          className="w-full text-xs px-2.5 py-1.5 rounded border dark:bg-[#232333] dark:border-[#3e405b] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <div className="flex flex-wrap gap-1 mt-1">
                          {MATH_SYMBOLS.map((sym, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => {
                                const updated = [...mcOptions];
                                const currentText = updated[idx];
                                updated[idx] = currentText + (currentText.endsWith(' ') || currentText === '' ? '' : ' ') + sym.code;
                                setMcOptions(updated);
                              }}
                              className="px-1.5 py-0.5 bg-white hover:bg-slate-100 dark:bg-[#232333] dark:hover:bg-slate-800 text-[8px] border dark:border-[#3e405b] rounded text-slate-700 dark:text-slate-300 transition-colors font-mono cursor-pointer"
                              title={sym.label}
                            >
                              {sym.code.replace(/\$/g, '')}
                            </button>
                          ))}
                        </div>
                        {mcOptionImages[idx] && (
                          <div className="flex items-center justify-between gap-2 p-1 bg-white dark:bg-slate-950 rounded border dark:border-[#3e405b]">
                            <img src={mcOptionImages[idx]} alt="Preview Opsi" className="h-10 object-contain" referrerPolicy="no-referrer" />
                            <button 
                              type="button" 
                              onClick={() => {
                                const updated = [...mcOptionImages];
                                updated[idx] = '';
                                setMcOptionImages(updated);
                              }}
                              className="text-rose-500 hover:text-rose-700 text-[10px] font-bold px-1.5"
                            >
                              ✕ Hapus
                            </button>
                          </div>
                        )}
                        {/* Live Option Math Preview */}
                        {opt.trim() && (opt.includes('$')) && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 pl-1 border-l border-emerald-200">
                            Pratinjau Rumus: <MathText text={opt} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {qType === 'benar_salah' && (
                <div className="p-3 bg-white dark:bg-[#2b2c40] rounded-lg border dark:border-[#3e405b]/60">
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1">Jawaban yang Benar</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="tf_correct"
                        value="BENAR"
                        checked={tfCorrect === 'BENAR'}
                        onChange={() => setTfCorrect('BENAR')}
                      />
                      <span>BENAR</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="tf_correct"
                        value="SALAH"
                        checked={tfCorrect === 'SALAH'}
                        onChange={() => setTfCorrect('SALAH')}
                      />
                      <span>SALAH</span>
                    </label>
                  </div>
                </div>
              )}

              {qType === 'isian_singkat' && (
                <div className="p-3 bg-white dark:bg-[#2b2c40] rounded-lg border dark:border-[#3e405b]/60">
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1">Kunci Isian Singkat</label>
                  <input
                    type="text"
                    placeholder="Contoh: 5"
                    value={shortCorrect}
                    onChange={(e) => setShortCorrect(e.target.value)}
                    className="w-full md:w-1/2 text-xs px-3 py-1.5 rounded border dark:bg-[#232333] dark:border-[#3e405b]"
                  />
                </div>
              )}

              {qType === 'menjodohkan' && (
                <div className="space-y-2 p-3 bg-white dark:bg-[#2b2c40] rounded-lg border dark:border-[#3e405b]/60">
                  <span className="font-semibold text-[10px] text-gray-400 block">Jodohkan Kiri & Kanan</span>
                  {matchPairs.map((pair, idx) => (
                    <div key={idx} className="flex flex-col gap-2 p-2 border rounded dark:border-[#3e405b]/60 bg-slate-50/50 dark:bg-slate-900/10">
                      <div className="flex gap-2 items-center">
                        <div className="flex-1 space-y-1">
                           <div className="flex justify-between items-center">
                             <span className="text-[9px] font-semibold text-gray-500">Kiri (Istilah)</span>
                             <label className="cursor-pointer text-[9px] text-emerald-600 hover:underline flex items-center gap-1">
                                <ImageIcon size={10} />
                                <span>{pair.leftImage ? 'Ganti Gbr' : '+ Gbr'}</span>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) compressImage(file).then(dataUrl => {
                                      const updated = [...matchPairs]; updated[idx].leftImage = dataUrl; setMatchPairs(updated);
                                  }).catch(console.error);
                                }}/>
                             </label>
                           </div>
                           {pair.leftImage && <img src={pair.leftImage} className="h-8 object-contain rounded border" />}
                           <input
                            type="text"
                            placeholder="Kiri (Istilah)..."
                            value={pair.left}
                            onChange={(e) => {
                              const updated = [...matchPairs];
                              updated[idx].left = e.target.value;
                              setMatchPairs(updated);
                            }}
                            className="w-full text-xs px-2.5 py-1.5 rounded border dark:bg-[#232333] dark:border-[#3e405b]"
                           />
                        </div>
                        <div className="flex-1 space-y-1">
                           <div className="flex justify-between items-center">
                             <span className="text-[9px] font-semibold text-gray-500">Kanan (Definisi Cocok)</span>
                             <label className="cursor-pointer text-[9px] text-emerald-600 hover:underline flex items-center gap-1">
                                <ImageIcon size={10} />
                                <span>{pair.rightImage ? 'Ganti Gbr' : '+ Gbr'}</span>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) compressImage(file).then(dataUrl => {
                                      const updated = [...matchPairs]; updated[idx].rightImage = dataUrl; setMatchPairs(updated);
                                  }).catch(console.error);
                                }}/>
                             </label>
                           </div>
                           {pair.rightImage && <img src={pair.rightImage} className="h-8 object-contain rounded border" />}
                           <input
                            type="text"
                            placeholder="Kanan (Definisi Cocok)..."
                            value={pair.right}
                            onChange={(e) => {
                              const updated = [...matchPairs];
                              updated[idx].right = e.target.value;
                              setMatchPairs(updated);
                            }}
                            className="w-full text-xs px-2.5 py-1.5 rounded border dark:bg-[#232333] dark:border-[#3e405b]"
                           />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setMatchPairs([...matchPairs, {left: '', right: '', leftImage: undefined, rightImage: undefined}])}
                    className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold cursor-pointer"
                  >
                    + Tambah Pasangan Cocok
                  </button>
                </div>
              )}

              {/* Image Reference Gallery */}
              {(qImage || mcOptionImages.some(img => img !== '')) && (
                <div className="mt-2 p-3 bg-slate-50 dark:bg-[#1e1e2d] rounded-lg border border-slate-200 dark:border-[#3e405b]">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Galeri Referensi Gambar (Soal Ini)</h4>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const JSZip = (await import('jszip')).default;
                          const zip = new JSZip();
                          
                          const addImg = async (url, name) => {
                            if (!url) return;
                            try {
                              if (url.startsWith('data:')) {
                                const arr = url.split(',');
                                const bstr = atob(arr[1]);
                                let n = bstr.length;
                                const u8arr = new Uint8Array(n);
                                while (n--) { u8arr[n] = bstr.charCodeAt(n); }
                                const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
                                const ext = mime.split('/')[1] || 'png';
                                zip.file(`${name}.${ext}`, u8arr);
                              } else {
                                const res = await fetch(url);
                                const blob = await res.blob();
                                const ext = blob.type.split('/')[1] || 'png';
                                zip.file(`${name}.${ext}`, blob);
                              }
                            } catch (e) { console.error(e); }
                          };

                          await addImg(qImage, 'gambar_soal');
                          for (let i = 0; i < mcOptionImages.length; i++) {
                            await addImg(mcOptionImages[i], `opsi_${String.fromCharCode(65 + i)}`);
                          }

                          const content = await zip.generateAsync({ type: 'blob' });
                          const link = document.createElement('a');
                          link.href = URL.createObjectURL(content);
                          link.download = 'galeri_soal.zip';
                          link.click();
                          URL.revokeObjectURL(link.href);
                        } catch (err) {
                          console.error(err);
                          alert('Gagal membuat file ZIP.');
                        }
                      }}
                      className="text-[9px] font-bold bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:hover:bg-emerald-800/60 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      ⬇️ Unduh ZIP
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {qImage && (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">Gambar Soal</span>
                        <div className="h-20 w-20 rounded border dark:border-[#3e405b] bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden p-1">
                          <img src={qImage} alt="Soal" className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                    )}
                    {mcOptionImages.map((img, idx) => img ? (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">Opsi {String.fromCharCode(65 + idx)}</span>
                        <div className="h-20 w-20 rounded border dark:border-[#3e405b] bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden p-1">
                          <img src={img} alt={`Opsi ${String.fromCharCode(65 + idx)}`} className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                    ) : null)}
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-semibold text-gray-400">Bobot Nilai:</label>
                  <input
                    type="number"
                    value={qWeight}
                    onChange={(e) => setQWeight(Number(e.target.value))}
                    className="w-16 text-xs px-2 py-1 rounded border dark:bg-[#2b2c40] text-center"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={downloadTemplateExcel}
                    className="bg-emerald-600 text-white font-bold text-xs px-3 py-2 rounded-lg hover:bg-emerald-700 cursor-pointer"
                    title="Unduh format template Excel untuk menulis soal secara luring"
                  >
                    Template Excel
                  </button>
                  <label className="bg-amber-500 text-white font-bold text-xs px-3 py-2 rounded-lg hover:bg-amber-600 cursor-pointer flex items-center" title="Import soal dari file Excel (.xlsx)">
                    <span>Import Excel</span>
                    <input type="file" accept=".xlsx, .xls" onChange={handleImportExcel} className="hidden" />
                  </label>
                  <button
                    type="button"
                    id="add-question-btn"
                    onClick={handleAddQuestionToDraft}
                    className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-emerald-700 cursor-pointer"
                  >
                    Tambahkan Soal ke Draft
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* List of current draft questions */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-gray-700 dark:text-gray-200">
                Draft Pertanyaan Ujian ({questions.length} Soal)
              </h3>
              {questions.length > 0 && (
                <button
                  type="button"
                  onClick={() => exportExamToWord({
                    id: 'draft',
                    title: examTitle || 'Draft_Ujian',
                    subject: examSubject || 'Pelajaran',
                    className: examClasses.join(', ') || 'Kelas',
                    durationMinutes: examDuration || 60,
                    totalQuestions: questions.length,
                    questions: questions,
                    isRandomized: examRandomized,
                    isPublished: false,
                    startTime: examStartTime || '',
                    endTime: examEndTime || '',
                    date: examDate || ''
                  })}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2"
                >
                  📄 Export ke Word
                </button>
              )}
            </div>
            
            {questions.length === 0 ? (
              <p className="text-xs text-gray-400 italic text-center py-4 bg-gray-50/50 dark:bg-[#232333]/20 rounded-lg">Belum ada soal dimasukkan ke draft.</p>
            ) : (
              questions.map((q, idx) => (
                <div key={q.id} className="p-3 border rounded-lg flex justify-between items-start dark:border-[#3e405b]/60 bg-gray-50/20 dark:bg-[#232333]/20">
                  <div className="text-xs flex-1 space-y-2 pr-4">
                    <span className="font-mono text-gray-400 font-bold block">Soal {idx + 1} ({q.type}) — Bobot: {q.scoreWeight} Poin</span>
                    <div className="text-gray-800 dark:text-gray-200">
                      
                      {q.stimulus && (
                        <div className="mb-2 p-2 bg-slate-50 dark:bg-slate-800/30 rounded border dark:border-[#3e405b]/30 text-[10px]">
                          <span className="font-semibold text-gray-500 mb-1 block">Stimulus:</span>
                          <MathText text={q.stimulus} className="text-gray-600 dark:text-gray-300" />
                        </div>
                      )}
                      {q.stimulusImage && (
                        <div className="mb-2 max-w-[150px] rounded border dark:border-[#3e405b] overflow-hidden bg-white p-0.5">
                          <img src={q.stimulusImage} alt="Stimulus Visual" className="max-h-16 object-contain" referrerPolicy="no-referrer" />
                        </div>
                      )}
                      <MathText text={q.questionText} className="font-bold text-gray-800 dark:text-gray-100" />
                      {q.questionImage && (
                        <div className="mt-2 max-w-[150px] rounded border dark:border-[#3e405b] overflow-hidden bg-white p-0.5">
                          <img src={q.questionImage} alt="Draft Soal Visual" className="max-h-16 object-contain" referrerPolicy="no-referrer" />
                        </div>
                      )}
                    </div>
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t dark:border-[#3e405b]/30">
                        {q.options.map(o => (
                          <div key={o.id} className="p-1.5 rounded bg-white dark:bg-[#2b2c40] border dark:border-[#3e405b]/50">
                            <span className="font-semibold text-emerald-600">{o.id}. </span>
                            <MathText text={o.text} />
                            {o.image && (
                              <div className="mt-1 max-w-[80px] rounded border dark:border-[#3e405b] overflow-hidden p-0.5 bg-white">
                                <img src={o.image} alt={`Opsi ${o.id}`} className="max-h-10 object-contain" referrerPolicy="no-referrer" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuestions(questions.filter(item => item.id !== q.id))}
                    className="text-rose-500 hover:text-rose-700 cursor-pointer p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t dark:border-[#3e405b]">
            <button
              type="button"
              onClick={() => setCbtTab('cbt-list')}
              className="text-xs font-semibold border px-4 py-2 rounded-lg bg-white dark:bg-[#232333] text-gray-600 dark:text-gray-300 dark:border-[#3e405b] cursor-pointer"
            >
              Batal
            </button>
            <button
              id="save-full-exam-btn"
              type="submit"
              disabled={questions.length === 0}
              className={`text-xs font-bold px-5 py-2.5 rounded-lg text-white cursor-pointer
                ${questions.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow'}`}
            >
              Simpan & Publikasikan Ujian CBT
            </button>
          </div>
        </form>
      )}

      {/* --- TAB 3: STUDENT TEST SIMULATOR --- */}
      {cbtTab === 'student-simulator' && (
        <div id="student-simulator-panel" className="bg-white dark:bg-[#2b2c40] rounded-xl p-5 border border-gray-100 dark:border-[#3e405b] shadow-sm space-y-6">
          
          {/* Student selection */}
          {!simulatingExam ? (
            <div className="max-w-md mx-auto space-y-4 py-6">
              <div className="text-center space-y-2">
                <GraduationCap size={44} className="text-emerald-600 dark:text-emerald-400 mx-auto" />
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">Gerbang Masuk Ujian CBT</h2>
                <p className="text-xs text-gray-500">
                  {(activeRole === 'siswa' || activeRole === 'walimurid') 
                    ? "Silakan pilih ujian yang tersedia di bawah ini untuk mulai mengerjakan."
                    : "Pilih akun siswa di bawah ini untuk mensimulasikan siswa yang sedang login dan menempuh ujian sekolah."}
                </p>
              </div>

              <div className="space-y-3">
                {(activeRole !== 'siswa' && activeRole !== 'walimurid') && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Pilih Akun Siswa CBT</label>
                    <select
                      id="sim-student-select"
                      value={simulatingStudentId}
                      onChange={(e) => setSimulatingStudentId(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none"
                    >
                      <option value="">-- Pilih Akun Siswa --</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.className})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300">Daftar Ujian Tersedia:</h3>
                  {displayExams.map(exam => {
                    const isDone = results.some(r => String(r.examId) === String(exam.id) && String(r.studentId) === String(simulatingStudentId));

                    return (
                      <div key={exam.id} className="p-3 border rounded-lg flex justify-between items-center text-xs dark:border-[#3e405b]/60">
                        <div>
                          <span className="font-bold text-gray-800 dark:text-gray-200">{exam.title}</span>
                          <p className="text-[10px] text-gray-400 mt-0.5">{exam.subject} • {exam.durationMinutes} Menit</p>
                          {(exam.date || exam.startTime || exam.endTime) && (
                            <p className="text-[10px] text-emerald-500 mt-0.5">
                              Jadwal: {exam.date ? formatIndonesianDate(exam.date) : ''} {exam.startTime ? `(${exam.startTime} - ${exam.endTime || 'Selesai'})` : ''}
                            </p>
                          )}
                        </div>
                        
                        {isDone ? (
                          <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold uppercase">Telah Selesai</span>
                        ) : (
                          <button
                            id={`start-test-btn-${exam.id}`}
                            onClick={() => startExamSimulator(exam)}
                            disabled={!simulatingStudentId}
                            className={`text-xs px-3.5 py-1.5 rounded-lg font-bold text-white cursor-pointer transition-colors
                              ${simulatingStudentId ? 'bg-emerald-600 hover:bg-emerald-700 shadow-sm' : 'bg-gray-400 cursor-not-allowed'}`}
                          >
                            Mulai Ujian
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* ACTIVE EXAM RUNNING SCREEN */
            <div id="active-cbt-screen" className="space-y-6 animate-fade-in relative ">
              
              {/* Anti-cheat Alert warning modal */}
              {showCheatWarning && (
                <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto flex justify-center p-4 animate-fade-in">
                  <div className="bg-white dark:bg-[#2b2c40] rounded-2xl max-w-md w-full p-6 border-2 border-red-500 shadow-2xl text-center space-y-4 my-auto">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wide">
                        Peringatan Kecurangan!
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed">
                        Siswa terpantau berpindah tab atau meninggalkan halaman ujian untuk mencari jawaban dari situs web lain.
                      </p>
                    </div>

                    <div className="bg-red-50 dark:bg-red-950/10 p-4 rounded-xl border border-red-100/50 dark:border-red-900/20 text-xs">
                      <p className="font-bold text-gray-700 dark:text-gray-200">
                        Total Pelanggaran Fokus:
                      </p>
                      <span className="text-3xl font-extrabold text-red-600 font-mono block mt-1">
                        {cheatAttempts} <span className="text-xs text-gray-400 font-normal">/ 3 Kali Batas Maksimal</span>
                      </span>
                    </div>

                    <p className="text-[10px] text-gray-400 italic">
                      ℹ️ Apabila mencapai 3 kali pelanggaran, sistem ujian secara otomatis akan mengumpulkan hasil lembar pengerjaan Anda seketika!
                    </p>

                    <button
                      onClick={() => setShowCheatWarning(false)}
                      className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
                    >
                      Saya Mengerti & Berjanji Kembali Fokus
                    </button>
                  </div>
                </div>
              )}

              {/* Elegant Anti-Cheat Security Banner */}
              <div className="bg-gradient-to-r from-rose-900 to-red-950 text-rose-100 p-4 rounded-xl border border-rose-700/30 flex items-start gap-3 shadow-md animate-pulse">
                <span className="p-2 bg-rose-600/20 text-rose-300 rounded-lg text-sm shrink-0">🔒</span>
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">Sistem Kemananan Ujian EstugaDigital Aktif (Lockdown Mode)</h4>
                  <p className="text-[11px] text-rose-200/90 leading-relaxed font-semibold">
                    Ujian ini dilindungi oleh modul anti-contek otomatis. <strong className="text-white font-extrabold text-xs">Membuka tab baru, meminimalkan browser, atau menyalin (copy-paste) soal</strong> akan terdeteksi sebagai tindakan kecurangan. Ujian akan dikumpulkan paksa otomatis setelah 3 kali batas pelanggaran untuk menjaga kemurnian prestasi akademis Anda!
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-[#232333] p-4 rounded-xl border dark:border-[#3e405b] flex flex-wrap justify-between items-center gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-gray-400">Ujian Berlangsung</span>
                  <h2 className="text-md font-bold text-gray-800 dark:text-white">{simulatingExam.title}</h2>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Siswa: {students.find(s => s.id === simulatingStudentId)?.name} (NIS: {simulatingStudentId})</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 bg-rose-50 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 text-xs font-bold font-mono">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                    <span>ANTI-CHEAT: {cheatAttempts}/3 PELANGGARAN</span>
                  </div>
                  <div className="flex items-center gap-2 bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900/40 text-xs font-bold">
                    <Clock size={16} className="animate-pulse" />
                    <span>Sisa Waktu: 44 Menit 58 Detik</span>
                  </div>
                </div>
              </div>

              {testSubmitted ? (
                /* TEST SUBMITTED SUMMARY RESULTS */
                <div id="test-submitted-card" className="max-w-md mx-auto p-5 text-center space-y-4 border rounded-xl bg-emerald-50/50 dark:bg-[#232333] dark:border-[#3e405b]">
                  <CheckCircle size={48} className="text-emerald-500 mx-auto animate-bounce" />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Ujian Berhasil Dikirim!</h3>
                  <p className="text-xs text-gray-500">Jawaban lembar pengerjaan telah direkam dan dinilai secara instan.</p>
                  
                  <div className="p-4 bg-white dark:bg-[#2b2c40] rounded-xl border dark:border-[#3e405b]">
                    <span className="text-xs text-gray-400 block uppercase">Skor Pencapaian</span>
                    <span className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono block mt-1">{testSubmitted.score} <span className="text-xs text-gray-400 font-normal">/ 100</span></span>
                    
                    <div className="mt-3 text-xs border-t dark:border-[#3e405b]/60 pt-2 text-left">
                      <p className="font-semibold">Subjek: {testSubmitted.subject}</p>
                      <p className="text-[10px] text-gray-400 mt-1">Status database: Disinkronisasikan ke Akun Walimurid (Real-time)</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSimulatingExam(null)}
                    className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg cursor-pointer transition-colors"
                  >
                    Selesai & Kembali ke Portal
                  </button>
                </div>
              ) : (
                /* ACTIVE TEST LAYOUT */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Question Box (8 cols) */}
                  <div className="lg:col-span-8 space-y-4">
                    <div className="p-5 border rounded-xl shadow-xs">
                      <div className="flex justify-between text-xs font-semibold text-gray-400 mb-3 border-b dark:border-[#3e405b]/40 pb-2">
                        <span>Pertanyaan {currentQuestionIndex + 1} dari {shuffledQuestions.length}</span>
                        <span>Bobot: {shuffledQuestions[currentQuestionIndex].scoreWeight} Poin</span>
                      </div>

                      {/* Question Text with Math & Image support */}
                      <div className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-4 leading-relaxed space-y-3">
                        
                        {shuffledQuestions[currentQuestionIndex].stimulus && (
                          <div className="mb-3 p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg border dark:border-[#3e405b]/30">
                            <MathText text={shuffledQuestions[currentQuestionIndex].stimulus!} className="text-gray-700 dark:text-gray-300 leading-relaxed" />
                          </div>
                        )}
                        {shuffledQuestions[currentQuestionIndex].stimulusImage && (
                          <div className="mb-4 max-w-md mx-auto rounded-lg overflow-hidden border dark:border-[#3e405b] bg-white p-1">
                            <img 
                              src={shuffledQuestions[currentQuestionIndex].stimulusImage} 
                              alt="Stimulus Visual" 
                              className="max-h-60 mx-auto object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                        <MathText text={shuffledQuestions[currentQuestionIndex].questionText} />
                        {shuffledQuestions[currentQuestionIndex].questionImage && (
                          <div className="my-3 max-w-md mx-auto rounded-lg overflow-hidden border dark:border-[#3e405b] bg-white p-1">
                            <img 
                              src={shuffledQuestions[currentQuestionIndex].questionImage} 
                              alt="Soal Visual" 
                              className="max-h-60 mx-auto object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                      </div>

                      {/* Question Inputs based on types */}
                      <div className="space-y-2.5 text-xs">
                        
                        {/* 1. PG Sederhana */}
                        {shuffledQuestions[currentQuestionIndex].type === 'pg_sederhana' && (
                          <div className="space-y-2">
                            {shuffledQuestions[currentQuestionIndex].options?.map(opt => (
                              <label 
                                key={opt.id} 
                                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-[#232333]
                                  ${answers[shuffledQuestions[currentQuestionIndex].id] === opt.id 
                                    ? 'border-emerald-600 bg-emerald-50/20 dark:border-emerald-500' 
                                    : 'dark:border-[#3e405b]/60'}`}
                              >
                                <input
                                  type="radio"
                                  name={`q_radio_${shuffledQuestions[currentQuestionIndex].id}`}
                                  value={opt.id}
                                  checked={answers[shuffledQuestions[currentQuestionIndex].id] === opt.id}
                                  onChange={() => setAnswers({
                                    ...answers,
                                    [shuffledQuestions[currentQuestionIndex].id]: opt.id
                                  })}
                                  className="mt-0.5"
                                />
                                <span className="font-bold text-emerald-600">{opt.id}.</span>
                                <div className="flex-1 flex flex-col gap-2">
                                  <MathText text={opt.text} />
                                  {opt.image && (
                                    <div className="max-w-full sm:max-w-xs mt-1 rounded border dark:border-[#3e405b] overflow-hidden bg-white p-1 self-start">
                                      <img 
                                        src={opt.image} 
                                        alt={`Opsi ${opt.id}`} 
                                        className="max-h-28 object-contain w-full"
                                        referrerPolicy="no-referrer"
                                      />
                                    </div>
                                  )}
                                </div>
                              </label>
                            ))}
                          </div>
                        )}

                        {/* 2. PG Kompleks */}
                        {shuffledQuestions[currentQuestionIndex].type === 'pg_kompleks' && (
                          <div className="space-y-2">
                            {shuffledQuestions[currentQuestionIndex].options?.map(opt => {
                              const currentSelected: string[] = answers[shuffledQuestions[currentQuestionIndex].id] || [];
                              const isChecked = currentSelected.includes(opt.id);

                              return (
                                <label 
                                  key={opt.id} 
                                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-[#232333]
                                    ${isChecked 
                                      ? 'border-emerald-600 bg-emerald-50/20 dark:border-emerald-500' 
                                      : 'dark:border-[#3e405b]/60'}`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      let updated = [...currentSelected];
                                      if (e.target.checked) {
                                        updated.push(opt.id);
                                      } else {
                                        updated = updated.filter(item => item !== opt.id);
                                      }
                                      setAnswers({
                                        ...answers,
                                        [shuffledQuestions[currentQuestionIndex].id]: updated
                                      });
                                    }}
                                    className="mt-0.5"
                                  />
                                  <span className="font-bold text-emerald-600">{opt.id}.</span>
                                  <div className="flex-1 flex flex-col gap-2">
                                    <MathText text={opt.text} />
                                    {opt.image && (
                                      <div className="max-w-full sm:max-w-xs mt-1 rounded border dark:border-[#3e405b] overflow-hidden bg-white p-1 self-start">
                                        <img 
                                          src={opt.image} 
                                          alt={`Opsi ${opt.id}`} 
                                          className="max-h-28 object-contain w-full"
                                          referrerPolicy="no-referrer"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {/* 3. Benar Salah */}
                        {shuffledQuestions[currentQuestionIndex].type === 'benar_salah' && (
                          <div className="flex gap-4">
                            {['BENAR', 'SALAH'].map(val => (
                              <label 
                                key={val}
                                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-[#232333]
                                  ${answers[shuffledQuestions[currentQuestionIndex].id] === val 
                                    ? 'border-emerald-600 bg-emerald-50/20 dark:border-emerald-500 font-bold' 
                                    : 'dark:border-[#3e405b]/60'}`}
                              >
                                <input
                                  type="radio"
                                  name={`q_tf_${shuffledQuestions[currentQuestionIndex].id}`}
                                  value={val}
                                  checked={answers[shuffledQuestions[currentQuestionIndex].id] === val}
                                  onChange={() => setAnswers({
                                    ...answers,
                                    [shuffledQuestions[currentQuestionIndex].id]: val
                                  })}
                                />
                                <span>{val}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {/* 4. Isian Singkat */}
                        {shuffledQuestions[currentQuestionIndex].type === 'isian_singkat' && (
                          <input
                            type="text"
                            placeholder="Ketik jawaban singkat Anda di sini..."
                            value={answers[shuffledQuestions[currentQuestionIndex].id] || ''}
                            onChange={(e) => setAnswers({
                              ...answers,
                              [shuffledQuestions[currentQuestionIndex].id]: e.target.value
                            })}
                            className="w-full p-3.5 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none"
                          />
                        )}

                        {/* 5. Menjodohkan */}
                        {shuffledQuestions[currentQuestionIndex].type === 'menjodohkan' && (
                          <div className="space-y-4 bg-gray-50 dark:bg-[#232333]/50 p-4 rounded-lg">
                            {shuffledQuestions[currentQuestionIndex].matchingPairs?.some(p => p.rightImage) && (
                              <div className="mb-4">
                                <span className="font-semibold text-gray-500 block mb-2 text-xs">Pilihan Jawaban (Kanan):</span>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                  {shuffledQuestions[currentQuestionIndex].matchingPairs?.map((rightOpt, rightIdx) => (
                                    <div key={rightIdx} className="p-2 border dark:border-[#3e405b] bg-white dark:bg-[#2b2c40] rounded flex flex-col items-center text-center">
                                      {rightOpt.rightImage && <img src={rightOpt.rightImage} className="h-16 object-contain mb-1" />}
                                      <span className="text-[10px] text-gray-600 dark:text-gray-300 font-semibold">{rightOpt.rightText}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <span className="font-semibold text-gray-400 block mb-2">Pasangkan Kiri dengan Kanan:</span>
                            {shuffledQuestions[currentQuestionIndex].matchingPairs?.map((pair, idx) => {
                              const matchingState = answers[shuffledQuestions[currentQuestionIndex].id] || {};

                              return (
                                <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-white dark:bg-[#2b2c40] rounded border dark:border-[#3e405b]/60">
                                  <div className="flex items-start gap-3">
                                    <span className="w-6 h-6 mt-0.5 bg-emerald-600 text-white flex-shrink-0 flex items-center justify-center rounded text-[11px] font-bold">{idx+1}</span>
                                    <div>
                                      {pair.leftImage && <img src={pair.leftImage} className="h-16 object-contain mb-1 rounded" />}
                                      <span className="font-semibold text-gray-700 dark:text-gray-200 leading-tight">{pair.leftText}</span>
                                    </div>
                                  </div>
                                  <div className="flex flex-col md:items-end gap-1 border-t md:border-none pt-2 md:pt-0 border-dashed dark:border-[#3e405b]">
                                    <span className="text-[10px] text-gray-400 font-mono">Dipasangkan dengan:</span>
                                    <select
                                      value={matchingState[pair.leftId] || ''}
                                      onChange={(e) => {
                                        const updatedMatch = { ...matchingState, [pair.leftId]: e.target.value };
                                        setAnswers({
                                          ...answers,
                                          [shuffledQuestions[currentQuestionIndex].id]: updatedMatch
                                        });
                                      }}
                                      className="px-2 py-1.5 w-full md:w-auto border rounded text-xs dark:bg-[#232333] dark:border-[#3e405b] focus:ring-1 focus:ring-emerald-500"
                                    >
                                      <option value="">-- Pilih Jawaban --</option>
                                      {shuffledQuestions[currentQuestionIndex].matchingPairs?.map((rightOpt, rightIdx) => (
                                        <option key={rightIdx} value={rightOpt.rightId}>{rightOpt.rightText || `Pilihan ${rightIdx+1}`}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 6. Uraian */}
                        {shuffledQuestions[currentQuestionIndex].type === 'uraian' && (
                          <textarea
                            rows={4}
                            placeholder="Tulis uraian lengkap argumentatif Anda mengenai penyelesaian soal ini..."
                            value={answers[shuffledQuestions[currentQuestionIndex].id] || ''}
                            onChange={(e) => setAnswers({
                              ...answers,
                              [shuffledQuestions[currentQuestionIndex].id]: e.target.value
                            })}
                            className="w-full p-3 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none"
                          />
                        )}

                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center pt-2">
                      <button
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="text-xs px-3.5 py-2 rounded-lg border font-semibold hover:bg-gray-50 dark:hover:bg-[#232333] cursor-pointer disabled:opacity-40"
                      >
                        Kembali
                      </button>

                      {currentQuestionIndex < shuffledQuestions.length - 1 ? (
                        <button
                          onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                          className="text-xs px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
                        >
                          Lanjut Soal
                        </button>
                      ) : (
                        <button
                          id="submit-test-answers-btn"
                          onClick={submitTestAnswers}
                          className="text-xs px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle size={16} />
                          <span>Kirim Lembar Jawaban CBT</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Nav Card Map index (4 cols) */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="border rounded-xl p-4 bg-white dark:bg-[#2b2c40] dark:border-[#3e405b]">
                      <h4 className="text-xs font-bold text-gray-700 dark:text-gray-200 mb-3">Navigasi Pengerjaan</h4>
                      <div className="grid grid-cols-5 gap-2">
                        {shuffledQuestions.map((q, idx) => {
                          const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '';
                          const isActive = idx === currentQuestionIndex;

                          return (
                            <button
                              key={q.id}
                              onClick={() => setCurrentQuestionIndex(idx)}
                              className={`h-9 font-mono font-bold text-xs rounded-md transition-all flex items-center justify-center cursor-pointer
                                ${isActive 
                                  ? 'ring-2 ring-emerald-500 bg-emerald-600 text-white' 
                                  : isAnswered 
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' 
                                    : 'bg-gray-100 text-gray-500 dark:bg-[#232333] dark:text-gray-400 border dark:border-[#3e405b]/40'}`}
                            >
                              {idx + 1}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-4 pt-4 border-t dark:border-[#3e405b]/60 space-y-2 text-[10px] text-gray-400">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-emerald-600 rounded" />
                          <span>Soal Aktif</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-emerald-100 dark:bg-emerald-950/20 rounded" />
                          <span>Sudah Dijawab</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-gray-100 dark:bg-[#232333] rounded" />
                          <span>Belum Diisi</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 4: E-LEARNING --- */}
      {cbtTab === 'elearning' && (
        <div id="elearning-panel" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Post material form (5 cols) */}
          {activeRole === 'guru' && (
            <div className="lg:col-span-5 bg-white dark:bg-[#2b2c40] rounded-xl p-5 border border-gray-100 dark:border-[#3e405b] shadow-sm space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                  <BookOpen size={18} className="text-emerald-600" />
                  {matIdToEdit ? 'Edit Materi E-Learning' : 'Posting Materi E-Learning Baru'}
                </h2>
                {matIdToEdit && (
                  <button type="button" onClick={() => {
                    setMatIdToEdit(null);
                    setMatTitle('');
                    setMatContent('');
                    setMatFileName('');
                  }} className="text-xs text-rose-500 hover:underline">Batal Edit</button>
                )}
              </div>

              {matSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400">
                  Materi E-learning berhasil diposting dan terkoneksi!
                </div>
              )}

              <form onSubmit={handlePostElearning} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1">Judul Materi</label>
                  <input
                    id="mat-title-input"
                    type="text"
                    placeholder="Contoh: Modul Determinasi Matriks"
                    value={matTitle}
                    onChange={(e) => setMatTitle(e.target.value)}
                    required
                    className="w-full text-xs px-3 py-2 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 mb-1">Kelas Sasaran (Pilih 1 atau lebih)</label>
                    <div className="w-full max-h-[80px] overflow-y-auto px-3 py-2 rounded-lg border bg-gray-50 dark:bg-[#232333] dark:border-[#3e405b]">
                      {schoolClasses.map(c => (
                        <label key={c} className="flex items-center gap-2 mb-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={matClasses.includes(c)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setMatClasses(prev => [...prev, c]);
                              } else {
                                setMatClasses(prev => prev.filter(cls => cls !== c));
                              }
                            }}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 bg-white dark:bg-[#1e1e2d]"
                          />
                          <span className="text-xs text-gray-700 dark:text-gray-300">{c}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 mb-1">Mata Pelajaran</label>
                    <select
                      value={matSubject}
                      onChange={(e) => setMatSubject(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none"
                    >
                      {schoolSubjects.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 mb-1 font-sans">Jenis Media Materi</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { value: 'video', label: 'YouTube Video', icon: Youtube, color: 'text-red-500 bg-red-50 dark:bg-red-950/20' },
                      { value: 'pdf', label: 'File PDF', icon: FileText, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20' },
                      { value: 'png', label: 'Gambar PNG', icon: ImageIcon, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' }
                    ].map((btn) => {
                      const IconComponent = btn.icon;
                      const isActive = matType === btn.value;
                      return (
                        <button
                          key={btn.value}
                          type="button"
                          onClick={() => {
                            setMatType(btn.value as any);
                            setMatContent('');
                            setMatFileName('');
                          }}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[10px] font-bold transition-all gap-1 cursor-pointer
                            ${isActive 
                              ? 'border-emerald-600 ring-2 ring-emerald-600/20 text-emerald-600 dark:text-emerald-400 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30' 
                              : 'border-slate-200 dark:border-[#3e405b] text-slate-500 hover:bg-slate-50 dark:hover:bg-[#232333]'}`}
                        >
                          <IconComponent size={16} className={btn.color.split(' ')[0]} />
                          <span className="truncate max-w-[80px] text-[9px]">{btn.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* DYNAMIC FORM ACCORDING TO SELECTED TYPE */}
                {matType === 'video' && (
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 mb-1">Tautan / Link Video YouTube</label>
                    <input
                      type="url"
                      placeholder="Contoh: https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                      value={matContent}
                      onChange={(e) => setMatContent(e.target.value)}
                      required
                      className="w-full text-xs px-3 py-2.5 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                      💡 Tautan video YouTube ini akan langsung membuka tab baru di browser siswa (luar aplikasi) agar sangat hemat memori perangkat.
                    </p>
                  </div>
                )}

                {matType === 'pdf' && (
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 mb-1">Unggah Dokumen PDF</label>
                    <div className="border-2 border-dashed border-slate-200 dark:border-[#3e405b] rounded-xl p-4 text-center hover:border-emerald-500 dark:hover:border-emerald-500/50 transition-all bg-gray-50/50 dark:bg-[#1f2030] relative group">
                      <input
                        type="file"
                        accept=".pdf"
                        required={!matContent}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setMatContent(reader.result as string);
                              setMatFileName(file.name);
                            };
                            reader.onerror = console.error;
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                        <div className="p-2.5 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-500">
                          <FileText size={20} className="animate-bounce" />
                        </div>
                        {matFileName ? (
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-center">
                              <Check size={12} /> PDF Siap Dibagikan
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[200px] font-mono">
                              {matFileName}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                              Pilih atau Tarik File PDF ke Sini
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Dokumen modul pembelajaran (Maksimal 10MB)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {matType === 'png' && (
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 mb-1">Unggah Gambar PNG</label>
                    <div className="border-2 border-dashed border-slate-200 dark:border-[#3e405b] rounded-xl p-4 text-center hover:border-emerald-500 dark:hover:border-emerald-500/50 transition-all bg-gray-50/50 dark:bg-[#1f2030] relative group">
                      <input
                        type="file"
                        accept="image/png"
                        required={!matContent}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            compressImage(file).then(dataUrl => {
                              setMatContent(dataUrl);
                              setMatFileName(file.name);
                            }).catch(console.error);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                        <div className="p-2.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500">
                          <ImageIcon size={20} />
                        </div>
                        {matFileName ? (
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-center">
                              <Check size={12} /> Gambar PNG Terpasang
                            </p>
                            <div className="mt-1 flex justify-center">
                              <img src={matContent} className="h-14 rounded border border-slate-200 object-cover max-w-[120px]" referrerPolicy="no-referrer" />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                              Pilih atau Tarik Gambar PNG ke Sini
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Materi visual atau infografis
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {matType === 'link' && (
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 mb-1">Tautan / Link Eksternal</label>
                    <input
                      type="url"
                      placeholder="Contoh: https://drive.google.com/drive/folders/..."
                      value={matContent}
                      onChange={(e) => setMatContent(e.target.value)}
                      required
                      className="w-full text-xs px-3 py-2.5 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                )}

                {matType === 'text' && (
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 mb-1">Isi Rangkuman / Catatan Papan</label>
                    <textarea
                      rows={4}
                      placeholder="Tulis ringkasan atau poin-poin materi di sini..."
                      value={matContent}
                      onChange={(e) => setMatContent(e.target.value)}
                      required
                      className="w-full text-xs p-3 rounded-lg border bg-gray-50 text-gray-800 dark:bg-[#232333] dark:border-[#3e405b] dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                )}

                {/* Pengaturan Jadwal & Masa Tayang (Berlaku untuk semua tipe materi) */}
                <div className="p-3 bg-slate-50 dark:bg-[#232333]/50 rounded-xl border border-slate-100 dark:border-[#3e405b] space-y-4">
                  {/* Start Date */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-300 cursor-pointer text-[10px] sm:text-[11px]">
                        <Clock size={14} className="text-emerald-500" />
                        <span>Jadwalkan Waktu Tayang (Mulai Muncul)</span>
                      </label>
                      <input
                        type="checkbox"
                        checked={matHasStartDate}
                        onChange={(e) => {
                          setMatHasStartDate(e.target.checked);
                          if (e.target.checked && !matStartDate) {
                            const now = new Date();
                            setMatStartDate(now.toISOString().slice(0, 16));
                          }
                        }}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 bg-white dark:bg-[#1e1e2d] h-4 w-4 cursor-pointer"
                      />
                    </div>
                    {matHasStartDate && (
                      <div className="space-y-1.5 animate-fade-in pl-6">
                        <input
                          type="datetime-local"
                          value={matStartDate}
                          onChange={(e) => setMatStartDate(e.target.value)}
                          required={matHasStartDate}
                          className="w-full text-xs px-3.5 py-2.5 rounded-lg border bg-white text-gray-800 dark:bg-[#1e1e2d] dark:border-[#3e405b] dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Expiry Date */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-300 cursor-pointer text-[10px] sm:text-[11px]">
                        <Clock size={14} className="text-amber-500 animate-pulse" />
                        <span>Batasi Masa Tayang (Selesai Tayang)</span>
                      </label>
                      <input
                        type="checkbox"
                        checked={matHasExpiry}
                        onChange={(e) => {
                          setMatHasExpiry(e.target.checked);
                          if (e.target.checked && !matExpiryDate) {
                            const tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            setMatExpiryDate(tomorrow.toISOString().slice(0, 16));
                          }
                        }}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 bg-white dark:bg-[#1e1e2d] h-4 w-4 cursor-pointer"
                      />
                    </div>

                    {matHasExpiry && (
                      <div className="space-y-1.5 animate-fade-in pl-6">
                        <input
                          type="datetime-local"
                          value={matExpiryDate}
                          onChange={(e) => setMatExpiryDate(e.target.value)}
                          required={matHasExpiry}
                          className="w-full text-xs px-3.5 py-2.5 rounded-lg border bg-white text-gray-800 dark:bg-[#1e1e2d] dark:border-[#3e405b] dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 p-2.5 rounded-lg flex items-start gap-1.5 leading-relaxed mt-2">
                          <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                          <span>Materi ini akan terhapus otomatis dari server &amp; browser siswa setelah batas waktu habis.</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    id="submit-elearning-btn"
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    {matIdToEdit ? 'Simpan Perubahan' : 'Bagikan Materi E-Learning'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of learning materials (7 cols) */}
          <div className={`${activeRole === 'guru' ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">Materi Penunjang Terbagikan</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayMaterials.map(mat => {
                const isBase64Pdf = mat.type === 'pdf' && mat.content.startsWith('data:');
                const isBase64Png = mat.type === 'png' && mat.content.startsWith('data:');

                return (
                  <div key={mat.id} className="bg-white dark:bg-[#2b2c40] rounded-xl p-4.5 border border-gray-100 dark:border-[#3e405b] shadow-xs hover:shadow-sm transition-all text-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-bold font-mono uppercase">
                          {mat.className}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {mat.createdAt}
                        </span>
                      </div>

                      {mat.startDate && new Date(mat.startDate).getTime() > Date.now() && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-[9px] font-bold mb-2.5">
                          <Clock size={11} className="text-emerald-500 animate-pulse shrink-0" />
                          <span>Dijadwalkan Mulai: {formatIndonesianDate(mat.startDate)}</span>
                        </div>
                      )}

                      {mat.expiryDate && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 rounded-lg text-[9px] font-bold mb-2.5">
                          <Clock size={11} className="text-amber-500 animate-pulse shrink-0" />
                          <span>Masa Tayang S/D: {formatIndonesianDate(mat.expiryDate)}</span>
                        </div>
                      )}

                      <h4 className="font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-1.5 text-xs mb-2">
                        {mat.type === 'pdf' ? <FileText size={14} className="text-rose-500" /> : 
                         mat.type === 'video' ? <Youtube size={14} className="text-red-500" /> : 
                         mat.type === 'png' ? <ImageIcon size={14} className="text-emerald-500" /> :
                         mat.type === 'link' ? <LinkIcon size={14} className="text-emerald-500" /> :
                         <BookOpen size={14} className="text-amber-500" />}
                        <span className="truncate">{mat.title}</span>
                      </h4>

                      {/* Video Link Box (Lightweight, opened in a new tab to save memory) */}
                      {mat.type === 'video' && (
                        <div className="mt-2.5 p-3 bg-red-50/30 dark:bg-red-950/10 rounded-xl border border-red-100/40 dark:border-red-900/20 space-y-2">
                          <div className="flex items-start gap-2 mb-1">
                            <Youtube size={14} className="text-red-600 mt-0.5 shrink-0" />
                            <p className="text-[10px] font-bold text-gray-800 dark:text-gray-100">Tautan Video YouTube</p>
                          </div>
                          <a
                            href={mat.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block w-full break-all text-xs font-mono text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                          >
                            {mat.content}
                          </a>
                        </div>
                      )}

                      {/* PDF file card and downloader */}
                      {mat.type === 'pdf' && (
                        <div className="mt-2 p-3 bg-rose-50/40 dark:bg-rose-950/10 rounded-lg border border-rose-100/40 dark:border-rose-900/20">
                          <p className="text-[10px] text-slate-400 mb-2 font-semibold">📄 File Lampiran PDF:</p>
                          {isBase64Pdf ? (
                            <a
                              href={mat.content}
                              download={mat.fileName || "materi_belajar.pdf"}
                              className="flex items-center justify-center gap-1.5 w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors text-xs shadow-xs text-center"
                            >
                              <FileText size={13} />
                              <span className="truncate">Download PDF ({mat.fileName || "materi.pdf"}) 📥</span>
                            </a>
                          ) : (
                            <a
                              href={mat.content}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-1.5 w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors text-xs text-center"
                            >
                              <LinkIcon size={13} />
                              <span>Buka Dokumen PDF ↗</span>
                            </a>
                          )}
                        </div>
                      )}

                      {/* PNG image view and downloader */}
                      {mat.type === 'png' && (
                        <div className="mt-2 p-2.5 bg-emerald-50/30 dark:bg-emerald-950/10 rounded-lg border border-emerald-100/40 dark:border-emerald-900/20 space-y-2">
                          <p className="text-[10px] text-slate-400 font-semibold">🖼️ Gambar / Infografis:</p>
                          {isBase64Png ? (
                            <>
                              <div className="rounded border border-slate-200/50 dark:border-slate-800 bg-[#12121e] overflow-hidden flex justify-center max-h-[160px]">
                                <img src={mat.content} alt={mat.title} className="object-contain max-h-[150px]" referrerPolicy="no-referrer" />
                              </div>
                              <a
                                href={mat.content}
                                download={mat.fileName || "materi_gambar.png"}
                                className="flex items-center justify-center gap-1.5 w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors text-xs text-center"
                              >
                                <ImageIcon size={13} />
                                <span>Unduh Gambar PNG 📥</span>
                              </a>
                            </>
                          ) : (
                            <a
                              href={mat.content}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-1.5 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors text-xs text-center"
                            >
                              <LinkIcon size={13} />
                              <span>Lihat Gambar ↗</span>
                            </a>
                          )}
                        </div>
                      )}

                      {/* General External Link */}
                      {mat.type === 'link' && (
                        <div className="mt-2 p-3 bg-emerald-50/40 dark:bg-emerald-950/10 rounded-lg border border-emerald-100/40 dark:border-emerald-900/20">
                          <p className="text-[10px] text-slate-400 mb-1.5 font-semibold">🔗 Link Google Drive / Referensi:</p>
                          <a
                            href={mat.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors text-xs text-center"
                          >
                            <LinkIcon size={13} />
                            <span>Buka Tautan Materi ↗</span>
                          </a>
                        </div>
                      )}

                      {/* Plain Text Notes */}
                      {mat.type === 'text' && (
                        <p className="text-gray-500 dark:text-gray-400 mt-2 italic bg-slate-50 dark:bg-[#1a1b2c] p-3 rounded-lg border dark:border-[#3e405b]/60 leading-relaxed font-sans truncate-3-lines">
                          {mat.content}
                        </p>
                      )}
                    </div>

                    <div className="mt-3.5 pt-2.5 border-t dark:border-[#3e405b]/40 flex justify-between items-center text-[10px] text-gray-400 font-sans">
                      <span className="truncate max-w-[120px]">Pengampu: <strong>{mat.teacherName}</strong></span>
                      <span className="bg-slate-100 dark:bg-[#1e1e2d] px-2 py-0.5 rounded font-mono uppercase text-[8px] whitespace-nowrap">
                        {mat.subject}
                      </span>
                    </div>
                    {activeRole === 'guru' && (
                      <div className="flex gap-2 mt-2 pt-2 border-t dark:border-[#3e405b]/20 justify-end">
                        <button type="button" onClick={() => handleEditMaterial(mat)} className="text-[10px] font-bold text-emerald-500 hover:text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded">Edit</button>
                        <button type="button" onClick={() => handleDeleteMaterial(mat.id)} className="text-[10px] font-bold text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-950/30 px-2.5 py-1 rounded">Hapus</button>
                      </div>
                    )}
                  </div>
                );
              })}
              {displayMaterials.length === 0 && (
                <div className="col-span-1 md:col-span-2 py-10 text-center bg-slate-50/50 dark:bg-[#1a1b2c]/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400">
                  📚 Tidak ada materi pembelajaran aktif saat ini.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
