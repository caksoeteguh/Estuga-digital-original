import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { compressImage } from '../imageUtils';
import { AssignmentTask, AssignmentSubmission, CBTQuestion, Student, VirtualMeet, StudentGradeRecord } from '../types';
import MathText from './MathText';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ChevronRight, 
  BookOpen, 
  FileText, 
  Award, 
  HelpCircle, 
  Check, 
  Image as ImageIcon,
  User,
  ArrowRight,
  Sparkles,
  Video,
  X
} from 'lucide-react';

const MATH_SYMBOLS = [
  { label: "Pecahan", code: "$\\frac{a}{b}$" },
  { label: "Kuadrat (x²)", code: "$x^2$" },
  { label: "Pangkat (xⁿ)", code: "$x^n$" },
  { label: "Indeks (x₁)", code: "$x_1$" },
  { label: "Akar (√)", code: "$\\sqrt{x}$" },
  { label: "Akar pangkat n", code: "$\\sqrt[n]{x}$" },
  { label: "Logaritma", code: "$\\log_{a}{b}$" },
  { label: "Kurang Lebih", code: "$\\pm$" },
  { label: "Derajat", code: "$^{\\circ}$" },
  { label: "Derajat Celcius", code: "$^{\\circ}\\text{C}$" },
  { label: "Pi (π)", code: "$\\pi$" },
  { label: "Alpha (α)", code: "$\\alpha$" },
  { label: "Beta (β)", code: "$\\beta$" },
  { label: "Theta (θ)", code: "$\\theta$" },
  { label: "Sinus", code: "$\\sin(x)$" },
  { label: "Cosinus", code: "$\\cos(x)$" },
  { label: "Tangen", code: "$\\tan(x)$" },
  { label: "Tidak Sama", code: "$\\neq$" },
  { label: "Kurang/Sama", code: "$\\leq$" },
  { label: "Lebih/Sama", code: "$\\geq$" },
  { label: "Kali (x)", code: "$\\times$" },
  { label: "Bagi (÷)", code: "$\\div$" },
  { label: "Tak Hingga", code: "$\\infty$" },
  { label: "Panah Kanan", code: "$\\rightarrow$" },
  { label: "Vektor", code: "$\\vec{v}$" },
];

const parseMathForWord = (text: string) => {
  if (!text) return "";
  return text.replace(/\$\$(.*?)\$\$/gs, (match, formula) => {
    return `<div style="text-align: center;"><img src="https://latex.codecogs.com/png.latex?\\dpi{300}\\bg_white\\space${encodeURIComponent(formula.trim())}" alt="Math" style="max-height: 40px;"/></div>`;
  }).replace(/\$(.*?)\$/g, (match, formula) => {
    return `<img src="https://latex.codecogs.com/png.latex?\\dpi{300}\\bg_white\\space${encodeURIComponent(formula.trim())}" alt="Math" style="vertical-align: middle; max-height: 20px;" />`;
  });
};

interface AssignmentManagerProps {
  assignments: AssignmentTask[];
  virtualMeets: VirtualMeet[];
  setVirtualMeets: React.Dispatch<React.SetStateAction<VirtualMeet[]>>;
  onAddAssignment: (assignment: AssignmentTask) => void;
  onUpdateAssignment?: (updated: AssignmentTask) => void;
  onDeleteAssignment?: (id: string) => void;
  submissions: AssignmentSubmission[];
  onAddSubmission: (submission: AssignmentSubmission) => void;
  onUpdateSubmissions?: (updatedSubmissions: AssignmentSubmission[]) => void;
  setSubmissions: React.Dispatch<React.SetStateAction<AssignmentSubmission[]>>;
  students: Student[];
  grades?: StudentGradeRecord[];
  setGrades?: React.Dispatch<React.SetStateAction<StudentGradeRecord[]>>;
  activeRole: string;
  session?: {
    username: string;
    role: string;
    name: string;
    detailId?: string;
  } | null;
  isDark: boolean;
  schoolClasses?: string[];
}

export default function AssignmentManager({
  assignments,
  virtualMeets,
  setVirtualMeets,
  onAddAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
  submissions,
  onAddSubmission,
  setSubmissions,
  students,
  grades,
  setGrades,
  activeRole,
  session,
  isDark,
  schoolClasses = ["Kelas 4-A (SD)"]
}: AssignmentManagerProps) {
  // Tabs: 'list' | 'create' | 'grading' | 'meet'
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'grading' | 'meet'>(
    ((activeRole === 'siswa' || activeRole === 'walimurid') || activeRole === 'walimurid') ? 'list' : 'list'
  );

  // States for creating assignment
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Matematika');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([schoolClasses[0] || 'Kelas 4-A (SD)']);
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [allowImage, setAllowImage] = useState(false);
  const [taskType, setTaskType] = useState<'tugas' | 'latihan'>('tugas');
  
  
  // Quiz draft questions
  const [questions, setQuestions] = useState<CBTQuestion[]>([]);
  
  // Single question draft
  const [qStimulus, setQStimulus] = useState('');
  const [qStimulusImage, setQStimulusImage] = useState<string>('');
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState<CBTQuestion['type']>('pg_sederhana');
  const [qImage, setQImage] = useState<string>('');
  const [mcOptions, setMcOptions] = useState<string[]>(['', '', '', '']);
  const [mcOptionImages, setMcOptionImages] = useState<string[]>(['', '', '', '']);
  const [singleCorrect, setSingleCorrect] = useState('A');
  const [complexCorrect, setComplexCorrect] = useState<string[]>([]);
  const [tfCorrect, setTfCorrect] = useState('BENAR');
  const [shortCorrect, setShortCorrect] = useState('');
  
  // Matching pairs draft
  const [matchPairs, setMatchPairs] = useState<Array<{left: string, leftImage?: string, right: string, rightImage?: string}>>([
    { left: 'Jakarta', right: 'Indonesia' },
    { left: 'Kuala Lumpur', right: 'Malaysia' }
  ]);

  // Student interaction states
  const [activeTaskToSolve, setActiveTaskToSolve] = useState<AssignmentTask | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, any>>({});
  const [studentPhoto, setStudentPhoto] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [solveSuccess, setSolveSuccess] = useState(false);
  
  // Anti-cheat / Lockdown Mode state
  const [cheatAttempts, setCheatAttempts] = useState<number>(0);
  const [showCheatWarning, setShowCheatWarning] = useState<boolean>(false);
  const [showExerciseResults, setShowExerciseResults] = useState<{ score: number, task: AssignmentTask, answers: Record<string, any>, correctCount: number, totalQuestions: number } | null>(null);

  // Teacher grading states
  const [gradingSubmission, setGradingSubmission] = useState<AssignmentSubmission | null>(null);
  const [teacherScore, setTeacherScore] = useState<number>(0);
  const [teacherFeedback, setTeacherFeedback] = useState<string>('');

  // Sample mock notebook photos for instant student simulation
  const mockNotebookPhotos = [
    "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=600"
  ];

  // Helper: Find current student detail if logged in
  const currentStudent = students.find(s => {
    const uname = session?.username || "";
    return (s.usernameCbt || "").toLowerCase() === uname.toLowerCase() || s.id === session?.detailId;
  });

  // Helper: Calculate remaining time
  const getRemainingTimeStr = (deadlineStr: string) => {
    if (!deadlineStr) return 'Tidak ada batas waktu';
    const limit = new Date(deadlineStr).getTime();
    const now = new Date().getTime();
    const diff = limit - now;

    if (diff <= 0) {
      return '⚠️ Terlambat (Batas waktu terlewati)';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `Sisa ${days} hari ${hours} jam`;
    }
    return `Sisa ${hours} jam ${mins} menit`;
  };

  // Helper: Check if deadline passed
  const isDeadlinePassed = (deadlineStr: string) => {
    if (!deadlineStr) return false;
    return new Date(deadlineStr).getTime() < new Date().getTime();
  };

  const visibleAssignments = assignments.filter(task => {
    if (((activeRole === 'siswa' || activeRole === 'walimurid') || activeRole === 'walimurid')) {
      if (currentStudent && task.className.trim() !== (currentStudent.className || '').trim()) {
        return false;
      }
    }
    return true;
  });

  const handleAddQuestionToDraft = () => {
    if (!qText.trim()) return;

    let newQuestion: CBTQuestion = {
      id: `q_${Date.now()}`,
      type: qType,
      stimulus: qStimulus,
      stimulusImage: qStimulusImage,
      questionText: qText,
      questionImage: qImage || undefined,
      scoreWeight: 25
    };

    if (qType === 'pg_sederhana') {
      newQuestion.options = mcOptions.filter(o => o.trim() !== '').map((o, idx) => ({
        id: String.fromCharCode(65 + idx), // A, B, C, D
        text: o,
        image: mcOptionImages[idx] || undefined
      }));
      newQuestion.correctAnswer = singleCorrect;
    } else if (qType === 'pg_kompleks') {
      newQuestion.options = mcOptions.filter(o => o.trim() !== '').map((o, idx) => ({
        id: String.fromCharCode(65 + idx),
        text: o,
        image: mcOptionImages[idx] || undefined
      }));
      newQuestion.correctAnswer = complexCorrect;
    } else if (qType === 'benar_salah') {
      newQuestion.correctAnswer = tfCorrect;
    } else if (qType === 'menjodohkan') {
      newQuestion.matchingPairs = matchPairs.filter(p => p.left.trim() !== '' && p.right.trim() !== '').map((p, idx) => ({
        leftId: `L${idx}`,
        leftText: p.left,
        leftImage: p.leftImage,
        rightId: `R${idx}`,
        rightText: p.right,
        rightImage: p.rightImage
      }));
    } else if (qType === 'isian_singkat') {
      newQuestion.correctAnswer = shortCorrect;
    } else if (qType === 'uraian') {
      newQuestion.correctAnswer = '';
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
    setTfCorrect('BENAR');
    setShortCorrect('');
    setMatchPairs([{ left: '', right: '', leftImage: undefined, rightImage: undefined }, { left: '', right: '', leftImage: undefined, rightImage: undefined }]);
  };

  const handleRemoveQuestionFromDraft = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
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
        'Bobot_Nilai': 25
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
        'Bobot_Nilai': 25
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
        'Bobot_Nilai': 25
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
        'Bobot_Nilai': 25
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
        'Bobot_Nilai': 25
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
        'Bobot_Nilai': 25
      }
    ];
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Soal');
    XLSX.writeFile(workbook, 'Template_Soal_Tugas.xlsx');
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
            scoreWeight: Number(row['Bobot_Nilai']) || 25
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


  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (taskType === 'tugas' && !deadline) {
      alert('Tugas wajib menentukan batas waktu pengumpulan!');
      return;
    }

    if (selectedClasses.length === 0) {
      alert('Pilih minimal satu kelas!');
      return;
    }
    
    if (editingTaskId && onUpdateAssignment) {
      const newTask: AssignmentTask = {
        id: editingTaskId,
        title,
        subject,
        className: selectedClasses[0],
        teacherName: session?.name || 'Guru Pengampu',
        deadline: taskType === 'tugas' ? deadline : (deadline || ''),
        description,
        questions,
        allowImageUpload: taskType === 'tugas' ? allowImage : false,
        taskType: taskType,
        createdAt: new Date().toLocaleDateString('id-ID') + ' ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      } as any;
      onUpdateAssignment(newTask);
    } else {
      selectedClasses.forEach((cls, idx) => {
        const newTask: AssignmentTask = {
          id: `task_${Date.now()}_${idx}`,
          title,
          subject,
          className: cls,
          teacherName: session?.name || 'Guru Pengampu',
          deadline: taskType === 'tugas' ? deadline : (deadline || ''),
          description,
          questions,
          allowImageUpload: taskType === 'tugas' ? allowImage : false,
          taskType: taskType,
          createdAt: new Date().toLocaleDateString('id-ID') + ' ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        } as any;
        onAddAssignment(newTask);
      });
    }
    
    // Reset Assignment Form
    setEditingTaskId(null);
    setTitle('');
    setDeadline('');
    setDescription('');
    setQuestions([]);
    setTaskType('tugas');
    setActiveTab('list');
  };

  const calculatePracticeScore = (task: AssignmentTask, answers: Record<string, any>) => {
    let totalScore = 0;
    let maxScore = 0;
    let correctCount = 0;

    (task.questions || []).forEach(q => {
      const weight = q.scoreWeight || 25;
      maxScore += weight;
      const ans = answers[q.id];
      let isCorrect = false;

      if (q.type === 'pg_sederhana') {
        isCorrect = ans === q.correctAnswer;
      } else if (q.type === 'pg_kompleks') {
        const correctList = Array.isArray(q.correctAnswer) ? q.correctAnswer : [];
        const studentList = Array.isArray(ans) ? ans : [];
        isCorrect = correctList.length === studentList.length && 
                    correctList.every(x => studentList.includes(x)) &&
                    studentList.every(x => correctList.includes(x));
      } else if (q.type === 'benar_salah') {
        isCorrect = ans === q.correctAnswer;
      } else if (q.type === 'isian_singkat') {
        isCorrect = String(ans || '').trim().toLowerCase() === String(q.correctAnswer || '').trim().toLowerCase();
      } else if (q.type === 'menjodohkan') {
        const pairs = q.matchingPairs || [];
        if (pairs.length > 0) {
          let matchedCorrect = 0;
          pairs.forEach(p => {
            if ((ans || {})[p.leftText] === p.rightText) {
              matchedCorrect++;
            }
          });
          isCorrect = matchedCorrect === pairs.length;
          totalScore += (matchedCorrect / pairs.length) * weight;
          if (isCorrect) correctCount++;
          return;
        }
      } else if (q.type === 'uraian') {
        isCorrect = true; // self-review / manual grade
      }

      if (isCorrect) {
        totalScore += weight;
        correctCount++;
      }
    });

    const finalScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 100;
    return { score: finalScore, correctCount, totalQuestions: (task.questions?.length || 0) };
  };


  const playBeepSound = (type: 'attached' | 'sent') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'attached') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'sent') {
        // Happy success chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
        
        setTimeout(() => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(1108.73, ctx.currentTime); // C#6
          gain2.gain.setValueAtTime(0.2, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.3);
        }, 150);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const submitRef = useRef<() => void>(() => {});
  useEffect(() => {
    submitRef.current = () => {
      if (!activeTaskToSolve) return;
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSolveSubmit(fakeEvent);
    };
  });

  useEffect(() => {
    if (!activeTaskToSolve || solveSuccess) {
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
      // Prevent F12, Ctrl+Shift+I, Ctrl+U, Ctrl+C, Ctrl+V
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
  }, [activeTaskToSolve, solveSuccess]);

  const handleSolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTaskToSolve) return;

    const isLatihan = activeTaskToSolve.taskType === 'latihan';
    
    // Always calculate score
    const stats = calculatePracticeScore(activeTaskToSolve, studentAnswers);
    const finalScore = stats.score;

    const newSub: AssignmentSubmission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      assignmentId: activeTaskToSolve.id,
      studentId: currentStudent?.id || '',
      studentName: currentStudent?.name || '',
      answers: studentAnswers,
      uploadedPhotoUrl: studentPhoto || undefined,
      submittedAt: new Date().toLocaleString('id-ID'),
      score: finalScore,
      feedback: 'Penilaian otomatis sistem.',
      isGraded: true
    };

    onAddSubmission(newSub);
    playBeepSound('sent');
    
    // Record grade directly
    if (grades && setGrades && currentStudent?.id) {
      setGrades(prevGrades => {
        const student = students.find(s => s.id === currentStudent.id);
        if (!student) return prevGrades;
           
        const recordId = `${student.id}_${activeTaskToSolve.subject}`;
        const existingRecordIndex = prevGrades.findIndex(r => r.id === recordId);
           
        const newGrades = [...prevGrades];
        if (existingRecordIndex >= 0) {
          const record = { ...newGrades[existingRecordIndex] };
          const tugasList = [...record.tugas];
          // Find first empty spot
          const emptyIdx = tugasList.findIndex(t => t === "");
          if (emptyIdx >= 0) {
            tugasList[emptyIdx] = finalScore;
          } else if (tugasList.length < 10) {
            tugasList.push(finalScore);
          }
          record.tugas = tugasList;
          newGrades[existingRecordIndex] = record;
        } else {
          newGrades.push({
            id: recordId,
            studentId: student.id,
            studentName: student.name,
            className: student.className,
            subject: activeTaskToSolve.subject,
            tugas: [finalScore],
            ulangan: [],
            pts: "",
            pas: ""
          });
        }
        return newGrades;
      });
    }

    if (isLatihan) {
      setActiveTaskToSolve(null);
      setStudentAnswers({});
      setStudentPhoto(null);
      setSolveSuccess(true);
    } else {
      setSolveSuccess(true);
      // Wait for user to click to close
    }
  };

  const handleSaveGrading = () => {
    if (!gradingSubmission) return;
    setSubmissions(prev => prev.map(s => ((s.id && gradingSubmission.id && s.id === gradingSubmission.id) || (s.assignmentId === gradingSubmission.assignmentId && s.studentId === gradingSubmission.studentId)) ? {
      ...s,
      score: teacherScore,
      feedback: teacherFeedback,
      isGraded: true
    } : s));

    if (grades && setGrades && gradingSubmission.studentId) {
      const task = assignments.find(a => a.id === gradingSubmission.assignmentId);
      if (task) {
        setGrades(prevGrades => {
          const student = students.find(s => s.id === gradingSubmission.studentId);
          if (!student) return prevGrades;
          
          const recordId = `${student.id}_${task.subject}`;
          const existingRecordIndex = prevGrades.findIndex(r => r.id === recordId);
          
          const newGrades = [...prevGrades];
          if (existingRecordIndex >= 0) {
            const record = { ...newGrades[existingRecordIndex] };
            const tugasList = [...record.tugas];
            // Find first empty spot
            const emptyIdx = tugasList.findIndex(t => t === "");
            if (emptyIdx >= 0) {
              tugasList[emptyIdx] = teacherScore;
            } else if (tugasList.length < 10) {
              tugasList.push(teacherScore);
            }
            record.tugas = tugasList;
            newGrades[existingRecordIndex] = record;
          } else {
            newGrades.push({
              id: recordId,
              studentId: student.id,
              studentName: student.name,
              className: student.className,
              subject: task.subject,
              tugas: [teacherScore],
              ulangan: [],
              pts: "",
              pas: ""
            });
          }
          return newGrades;
        });
      }
    }

    setGradingSubmission(null);
    setTeacherFeedback('');
  };

  // Drag and drop handler
  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const compressedDataUrl = await compressImage(file);
        setStudentPhoto(compressedDataUrl);
        playBeepSound('attached');
      } catch (err) {
        console.error('Image compression failed', err);
      }
    }
  };


  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const compressedDataUrl = await compressImage(file);
        setStudentPhoto(compressedDataUrl);
        playBeepSound('attached');
      } catch (err) {
        console.error('Image compression failed', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ==================== REAL-TIME EXERCISE RESULTS (SCORECARD) ==================== */}
      {showExerciseResults && (
        <div className="bg-white dark:bg-[#111625] rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
          <div className="flex justify-between items-center border-b dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                Hasil Latihan Mandiri (Auto-Graded)
              </span>
              <h2 className="text-lg font-bold mt-1 text-slate-800 dark:text-white">
                Analisis Kinerja: {showExerciseResults.task.title}
              </h2>
              <p className="text-xs text-slate-400">Dikerjakan pada: {new Date().toLocaleString('id-ID')}</p>
            </div>
            <button
              onClick={() => setShowExerciseResults(null)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Kembali ke Daftar Tugas
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-50/40 dark:bg-[#090d16]/30 p-5 rounded-2xl border dark:border-slate-800 flex flex-col items-center justify-center text-center">
              <span className="text-xs text-slate-400 font-semibold mb-2">Skor Anda</span>
              <div className={`text-5xl font-extrabold font-mono mb-2 ${showExerciseResults.score >= 75 ? 'text-emerald-500' : showExerciseResults.score >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                {showExerciseResults.score}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Predikat: {showExerciseResults.score >= 85 ? 'Sangat Memuaskan' : showExerciseResults.score >= 75 ? 'Sangat Baik' : showExerciseResults.score >= 60 ? 'Cukup' : 'Perlu Belajar Lagi'}</span>
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-[#090d16]/20 p-4 rounded-xl border dark:border-slate-800/80 flex flex-col justify-center">
                <span className="text-slate-400 text-[10px]">Total Soal</span>
                <span className="text-2xl font-bold font-mono text-slate-700 dark:text-slate-200 mt-1">{showExerciseResults.totalQuestions}</span>
              </div>
              <div className="bg-emerald-50/25 dark:bg-emerald-950/10 p-4 rounded-xl border border-emerald-100/60 dark:border-emerald-950/40 flex flex-col justify-center">
                <span className="text-emerald-600/80 dark:text-emerald-400 text-[10px]">Jawaban Benar</span>
                <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">{showExerciseResults.correctCount}</span>
              </div>
              <div className="bg-rose-50/25 dark:bg-rose-950/10 p-4 rounded-xl border border-rose-100/60 dark:border-rose-950/40 flex flex-col justify-center">
                <span className="text-rose-600/80 dark:text-rose-400 text-[10px]">Jawaban Salah</span>
                <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">{showExerciseResults.totalQuestions - showExerciseResults.correctCount}</span>
              </div>
              <div className="bg-emerald-50/25 dark:bg-emerald-950/10 p-4 rounded-xl border border-emerald-100/60 dark:border-emerald-950/40 flex flex-col justify-center">
                <span className="text-emerald-600/80 dark:text-emerald-400 text-[10px]">Rasio Ketepatan</span>
                <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  {showExerciseResults.totalQuestions > 0 ? Math.round((showExerciseResults.correctCount / showExerciseResults.totalQuestions) * 100) : 100}%
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 border-b pb-2">
              <CheckCircle size={16} className="text-emerald-500" />
              Kunci Jawaban & Pembahasan Detil
            </h3>

            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2">
              {(showExerciseResults.task?.questions || []).map((q, idx) => {
                const answer = showExerciseResults.answers[q.id];
                
                let isCorrect = false;
                if (q.type === 'pg_sederhana') {
                  isCorrect = answer === q.correctAnswer;
                } else if (q.type === 'pg_kompleks') {
                  const correctList = Array.isArray(q.correctAnswer) ? q.correctAnswer : [];
                  const studentList = Array.isArray(answer) ? answer : [];
                  isCorrect = correctList.length === studentList.length && 
                              correctList.every(x => studentList.includes(x)) &&
                              studentList.every(x => correctList.includes(x));
                } else if (q.type === 'benar_salah') {
                  isCorrect = answer === q.correctAnswer;
                } else if (q.type === 'isian_singkat') {
                  isCorrect = String(answer || '').trim().toLowerCase() === String(q.correctAnswer || '').trim().toLowerCase();
                } else if (q.type === 'menjodohkan') {
                  const pairs = q.matchingPairs || [];
                  let matchedCorrect = 0;
                  pairs.forEach(p => {
                    if ((answer || {})[p.leftText] === p.rightText) {
                      matchedCorrect++;
                    }
                  });
                  isCorrect = matchedCorrect === pairs.length;
                } else if (q.type === 'uraian') {
                  isCorrect = true; // self-review
                }

                return (
                  <div key={q.id} className={`p-4 border rounded-xl space-y-3 transition-all
                    ${isCorrect 
                      ? 'border-emerald-100 dark:border-emerald-950/40 bg-emerald-50/5' 
                      : 'border-rose-100 dark:border-rose-950/40 bg-rose-50/5'}`}>
                    <div className="flex justify-between items-start gap-4">
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        Soal {idx + 1}: <div className="font-medium inline-block"><MathText text={q.questionText} /></div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1
                        ${isCorrect 
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' 
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40'}`}>
                        {isCorrect ? 'Benar' : 'Salah'}
                      </span>
                    </div>

                    {q.questionImage && (
                      <div className="my-2">
                        <img src={q.questionImage} alt="Visual Soal" className="max-h-36 object-contain rounded border dark:border-slate-800" referrerPolicy="no-referrer" />
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 border-t dark:border-slate-800/60">
                      <div>
                        <span className="text-slate-400 font-medium block">Jawaban Anda:</span>
                        <div className="mt-1 font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                          {q.type === 'menjodohkan' ? (
                            <div className="space-y-1 mt-1 text-[11px] font-sans font-normal text-slate-600 dark:text-slate-300">
                              {q.matchingPairs?.map((pair, pIdx) => {
                                const matched = (answer || {})[pair.leftText] || 'Tidak dijodohkan';
                                const correctMatch = matched === pair.rightText;
                                return (
                                  <div key={pIdx} className="flex items-center gap-1">
                                    <span>{pair.leftText} → {matched}</span>
                                    <span className={correctMatch ? 'text-emerald-500 font-bold ml-1' : 'text-rose-500 font-bold ml-1'}>
                                      {correctMatch ? '✓' : '✗'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : answer !== undefined ? (
                            Array.isArray(answer) ? answer.join(', ') : String(answer)
                          ) : (
                            <span className="italic text-slate-400 font-normal">Tidak diisi</span>
                          )}
                        </div>
                      </div>

                      {q.type !== 'uraian' && (
                        <div>
                          <span className="text-slate-400 font-medium block">Kunci Jawaban Benar:</span>
                          <div className="mt-1 font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                            {q.type === 'menjodohkan' ? (
                              <div className="space-y-1 mt-1 text-[11px] font-sans font-normal text-slate-600 dark:text-slate-300">
                                {q.matchingPairs?.map((pair, pIdx) => (
                                  <div key={pIdx}>{pair.leftText} → {pair.rightText}</div>
                                ))}
                              </div>
                            ) : (
                              Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : String(q.correctAnswer)
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <BookOpen className="text-emerald-600 dark:text-emerald-400" />
            E-Learning Tugas & Penilaian
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Akses penugasan interaktif berupa kuis digital, jodohkan pasangan, hingga pengumpulan jawaban teks tugas secara terpadu.
          </p>
        </div>

        {activeRole === 'guru' && (
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveTab('list'); setGradingSubmission(null); }}
              className={`text-xs font-semibold px-4 py-2 rounded-lg border transition-all cursor-pointer
                ${activeTab === 'list' && !gradingSubmission
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white dark:bg-[#111625] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'}`}
            >
              Daftar Tugas
            </button>
            <button
              onClick={() => { setEditingTaskId(null); setTitle(''); setDescription(''); setDeadline(''); setQuestions([]); setTaskType('tugas'); setActiveTab('create'); setGradingSubmission(null); }}
              className={`text-xs font-semibold px-4 py-2 rounded-lg border transition-all cursor-pointer flex items-center gap-1
                ${activeTab === 'create'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white dark:bg-[#111625] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'}`}
            >
              <Plus size={14} />
              Beri Tugas Baru
            </button>
          </div>
        )}
      </div>

      {/* ==================== TEACHER GRADING INTERFACE ==================== */}
      {gradingSubmission && (() => {
        const task = assignments.find(a => a.id === gradingSubmission.assignmentId);
        const isTugas = task?.taskType === 'tugas';
        const isCreatorTeacher = task && session?.name && (task.teacherName.toLowerCase().trim() === session.name.toLowerCase().trim());
        const canSeeScore = !isTugas || isCreatorTeacher;
        
        if (!canSeeScore) {
          return (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 p-6 rounded-xl text-center text-rose-700 dark:text-rose-300">
              <p className="font-bold">Akses Ditolak</p>
              <p className="text-xs mt-1">Anda tidak memiliki otoritas untuk melihat atau menilai tugas ini.</p>
              <button onClick={() => setGradingSubmission(null)} className="mt-4 bg-rose-600 hover:bg-rose-700 text-white text-xs px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer">
                Kembali
              </button>
            </div>
          );
        }

        return (
          <div className="bg-white dark:bg-[#111625] rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex justify-between items-center border-b dark:border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                    Lembar Jawaban Siswa
                  </span>
                  <h2 className="text-md font-bold mt-1 text-slate-800 dark:text-white">
                    {gradingSubmission.studentName} (ID: {gradingSubmission.studentId})
                  </h2>
                </div>
                <button
                  onClick={() => setGradingSubmission(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  Kembali
                </button>
              </div>

              {/* Questions answered */}
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
                {assignments.find(a => a.id === gradingSubmission.assignmentId)?.questions?.map((q, idx) => {
                  const answer = (gradingSubmission.answers || {})[q.id];
                  return (
                    <div key={q.id} className="p-4 border dark:border-slate-800 rounded-xl space-y-2">
                      <p className="font-bold text-xs text-slate-700 dark:text-slate-300">
                        Soal {idx + 1}: <div className="font-medium inline-block"><MathText text={q.questionText} /></div>
                      </p>
                      <div className="text-xs bg-slate-50 dark:bg-[#090d16] p-3 rounded-lg space-y-1">
                        <p>
                          <span className="text-slate-400">Tipe:</span> <span className="font-bold uppercase font-mono text-[10px] text-emerald-500">{q.type ? q.type.replace('_', ' ') : 'Uraian'}</span>
                        </p>
                        <p>
                          <span className="text-slate-400">Kunci Jawaban:</span>{' '}
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                            {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : String(q.correctAnswer)}
                          </span>
                        </p>
                        <p>
                          <span className="text-slate-400">Jawaban Siswa:</span>{' '}
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                            {answer !== undefined ? (Array.isArray(answer) ? answer.join(', ') : String(answer)) : 'Tidak diisi'}
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                })}

                {(assignments.find(a => a.id === gradingSubmission.assignmentId)?.questions?.length || 0) === 0 && (
                  <p className="text-xs italic text-slate-400 text-center py-4">Tugas ini tidak memiliki soal kuis tertulis.</p>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-50 dark:bg-[#090d16] p-5 rounded-xl border dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200">Koreksi & Detail Pengumpulan</h3>
                
                {gradingSubmission.uploadedPhotoUrl ? (
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 block font-mono">📂 Foto Lampiran Tugas Siswa:</span>
                    <div className="border rounded-lg overflow-hidden group relative">
                      <img
                        src={gradingSubmission.uploadedPhotoUrl}
                        alt="Student solution photo"
                        referrerPolicy="no-referrer"
                        className="w-full h-48 object-cover group-hover:scale-105 transition-all duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="text-[11px] text-white font-bold font-mono">Lampiran Tersertifikasi</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/30 rounded-lg text-slate-500 text-[10px] leading-relaxed">
                    💡 Pengumpulan murni kuis &amp; jawaban teks digital. Sesuai kebijakan, tidak ada file lampiran foto yang perlu dikoreksi.
                  </div>
                )}

                {/* Score Input */}
                <div className="space-y-3 pt-3 border-t dark:border-slate-800/60">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Beri Nilai Tugas (Skala 0-100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={teacherScore}
                      onChange={(e) => setTeacherScore(Number(e.target.value))}
                      className="w-full text-sm font-mono font-bold px-3.5 py-2.5 rounded-lg border bg-white text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Feedback / Umpan Balik Guru</label>
                    <textarea
                      rows={3}
                      placeholder="Contoh: Tulisan rapi, jawaban nomor 4 kurang lengkap penjelasannya..."
                      value={teacherFeedback}
                      onChange={(e) => setTeacherFeedback(e.target.value)}
                      className="w-full text-xs p-3 rounded-lg border bg-white text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={handleSaveGrading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/10"
                  >
                    <Check size={14} />
                    <span>{gradingSubmission.isGraded ? 'Update Penilaian' : 'Simpan Penilaian & Rilis Nilai'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ==================== STUDENT WORKSPACE PORTAL ==================== */}
      {((activeRole === 'siswa' || activeRole === 'walimurid') || activeRole === 'walimurid') && activeTaskToSolve && (
        <div className="bg-white dark:bg-[#111625] rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          {/* Anti-cheat Alert warning modal */}
          {showCheatWarning && (
            <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto flex justify-center p-4 animate-fade-in">
              <div className="bg-white dark:bg-[#111625] rounded-2xl max-w-md w-full p-6 border-2 border-rose-500 shadow-2xl text-center space-y-4 my-auto">
                <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wide">
                    Tindakan Mencurigakan
                  </h3>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    Kamu terdeteksi membuka tab/aplikasi lain! ({cheatAttempts}/3 Pelanggaran)
                  </p>
                </div>

                <div className="bg-rose-50 dark:bg-rose-950/20 p-3 rounded-lg text-left">
                  <p className="text-[11px] text-rose-800 dark:text-rose-300 font-medium">
                    Tugas ini diawasi oleh sistem anti-contek otomatis. Jangan membuka Google, ChatGPT, atau aplikasi lainnya. Jika mencapai 3 pelanggaran, tugas akan <strong>dikumpulkan paksa dengan nilai saat ini</strong>.
                  </p>
                </div>

                <button
                  onClick={() => setShowCheatWarning(false)}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg cursor-pointer"
                >
                  Saya Mengerti, Kembali Kerjakan
                </button>
              </div>
            </div>
          )}

          {solveSuccess && (
            <div className="absolute inset-0 bg-slate-900/95 z-50 flex flex-col items-center justify-center text-white space-y-4 px-4 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center text-4xl animate-bounce shadow-lg shadow-emerald-500/20">
                ✅
              </div>
              <h3 className="text-2xl font-black text-emerald-400">Tugas Berhasil Terkirim!</h3>
              <div className="max-w-sm">
                <p className="text-sm text-slate-300 font-medium leading-relaxed">
                  Terima kasih, lembar jawaban dan bukti tugas Anda telah berhasil masuk ke sistem pengajar.
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Anda bisa melihat status tugas ini di menu "Laporan Tugas & Nilai".
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSolveSuccess(false);
                  setActiveTaskToSolve(null);
                  setStudentAnswers({});
                  setStudentPhoto(null);
                }}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all"
              >
                Kembali ke Daftar Tugas
              </button>
            </div>
          )}

          <div className="flex justify-between items-start border-b dark:border-slate-800 pb-4 mb-6">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                Siswa Portal • Sedang Mengerjakan
              </span>
              <h2 className="text-lg font-bold mt-1 text-slate-800 dark:text-white">
                Tugas: {activeTaskToSolve.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1">Mapel: {activeTaskToSolve.subject} • Pengajar: {activeTaskToSolve.teacherName}</p>
              
              <div className="mt-3 flex items-center justify-center gap-2 bg-rose-50 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 text-[10px] font-bold font-mono max-w-fit mx-auto">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                <span>ANTI-CHEAT AKTIF ({cheatAttempts}/3 PELANGGARAN)</span>
              </div>
            </div>
            <button
              onClick={() => { setActiveTaskToSolve(null); setStudentPhoto(null); setStudentAnswers({}); }}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Batalkan
            </button>
          </div>

          <form onSubmit={handleSolveSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs">
            
            {/* Interactive Questions Form */}
            <div className={activeTaskToSolve.allowImageUpload ? "lg:col-span-7 space-y-6" : "lg:col-span-12 space-y-6"}>
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 border-b pb-2">Bagian 1: Kuis Interaktif</h3>
              
              {(activeTaskToSolve.questions || []).map((q, idx) => {
                return (
                  <div key={q.id} className="space-y-3 p-4 border dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-[#090d16]/30">
                    <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      Soal {idx + 1}: 
                      {q.stimulus && (
                        <div className="my-2 p-3 bg-slate-100 dark:bg-slate-900 rounded-lg border dark:border-slate-800 font-normal">
                          <MathText text={q.stimulus} className="text-slate-700 dark:text-slate-300" />
                        </div>
                      )}
                      {q.stimulusImage && (
                        <div className="mb-3 max-w-sm rounded-lg overflow-hidden border dark:border-slate-800">
                          <img src={q.stimulusImage} alt="Stimulus" className="max-h-48 object-contain" />
                        </div>
                      )}
                        <div className="font-medium inline-block ml-1"><MathText text={q.questionText} /></div>
                    </div>

                    {q.questionImage && (
                      <div className="my-2.5">
                        <img 
                          src={q.questionImage} 
                          alt={`Visual Soal ${idx + 1}`} 
                          className="max-h-48 object-contain rounded-lg border dark:border-slate-800" 
                          referrerPolicy="no-referrer" 
                        />
                      </div>
                    )}

                    {/* PG Sederhana */}
                    {q.type === 'pg_sederhana' && q.options && (
                      <div className="grid grid-cols-1 gap-2">
                        {q.options.map(opt => (
                          <label
                            key={opt.id}
                            className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all text-xs
                              ${studentAnswers[q.id] === opt.id 
                                ? 'border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' 
                                : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#090d16]/80'}`}
                          >
                            <input
                              type="radio"
                              name={`q_${q.id}`}
                              value={opt.id}
                              checked={studentAnswers[q.id] === opt.id}
                              onChange={() => setStudentAnswers({ ...studentAnswers, [q.id]: opt.id })}
                              className="accent-emerald-600 mt-0.5"
                            />
                            <div className="flex flex-col gap-2 w-full">
                              <span><span className="font-bold font-mono mr-1">{opt.id}.</span> <MathText text={opt.text} /></span>
                              {opt.image && (
                                <img 
                                  src={opt.image} 
                                  alt={`Opsi ${opt.id}`} 
                                  className="max-h-28 object-contain rounded border dark:border-slate-800 mt-1" 
                                  referrerPolicy="no-referrer" 
                                />
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* PG Kompleks */}
                    {q.type === 'pg_kompleks' && q.options && (
                      <div className="grid grid-cols-1 gap-2">
                        <span className="text-[10px] text-slate-400 italic mb-1 block">💡 Pilih semua jawaban yang benar (Bisa lebih dari satu)</span>
                        {q.options.map(opt => {
                          const currentSelections: string[] = studentAnswers[q.id] || [];
                          const isChecked = currentSelections.includes(opt.id);
                          return (
                            <label
                              key={opt.id}
                              className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all text-xs
                                ${isChecked 
                                  ? 'border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' 
                                  : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#090d16]/80'}`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  let newSel = [...currentSelections];
                                  if (isChecked) {
                                    newSel = newSel.filter(x => x !== opt.id);
                                  } else {
                                    newSel.push(opt.id);
                                  }
                                  setStudentAnswers({ ...studentAnswers, [q.id]: newSel });
                                }}
                                className="accent-emerald-600 mt-0.5"
                              />
                              <div className="flex flex-col gap-2 w-full">
                                <span><span className="font-bold font-mono mr-1">{opt.id}.</span> <MathText text={opt.text} /></span>
                                {opt.image && (
                                  <img 
                                    src={opt.image} 
                                    alt={`Opsi ${opt.id}`} 
                                    className="max-h-28 object-contain rounded border dark:border-slate-800 mt-1" 
                                    referrerPolicy="no-referrer" 
                                  />
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* Benar Salah */}
                    {q.type === 'benar_salah' && (
                      <div className="flex gap-4">
                        {['BENAR', 'SALAH'].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setStudentAnswers({ ...studentAnswers, [q.id]: val })}
                            className={`flex-1 py-2 rounded-lg border font-bold font-sans text-center cursor-pointer transition-all
                              ${studentAnswers[q.id] === val
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'}`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Menjodohkan */}
                    {q.type === 'menjodohkan' && q.matchingPairs && (
                      <div className="space-y-2">
                        <span className="text-[10px] text-slate-400 italic block mb-1">Jodohkan istilah di sebelah kiri dengan pasangannya:</span>
                        {q.matchingPairs.map((pair, pIdx) => {
                          const currentMatchVal = (studentAnswers[q.id] || {})[pair.leftText] || '';
                          return (
                            <div key={pIdx} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white dark:bg-[#111625]/60 p-2 border dark:border-slate-800/80 rounded-lg">
                              <span className="font-bold text-slate-700 dark:text-slate-300 min-w-[120px]">{pair.leftText}</span>
                              <div className="flex items-center gap-1 text-slate-400">
                                <ArrowRight size={14} />
                              </div>
                              <select
                                value={currentMatchVal}
                                onChange={(e) => {
                                  const matches = studentAnswers[q.id] || {};
                                  setStudentAnswers({
                                    ...studentAnswers,
                                    [q.id]: { ...matches, [pair.leftText]: e.target.value }
                                  });
                                }}
                                className="w-full sm:w-auto flex-1 text-xs px-2 py-1 rounded border bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                              >
                                <option value="">-- Pilih Jodoh --</option>
                                {q.matchingPairs?.map((r, rIdx) => (
                                  <option key={rIdx} value={r.rightText}>{r.rightText}</option>
                                ))}
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Isian Singkat */}
                    {q.type === 'isian_singkat' && (
                      <div className="pt-1">
                        <label className="block text-[10px] text-slate-400 font-semibold mb-1">Ketik Jawaban Singkat Anda:</label>
                        <input
                          type="text"
                          value={studentAnswers[q.id] || ''}
                          onChange={(e) => setStudentAnswers({ ...studentAnswers, [q.id]: e.target.value })}
                          className="w-full sm:w-1/2 p-2 rounded-lg border bg-white text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 font-semibold"
                          placeholder="Jawaban singkat..."
                        />
                      </div>
                    )}

                    {/* Uraian */}
                    {q.type === 'uraian' && (
                      <div className="pt-1">
                        <label className="block text-[10px] text-slate-400 font-semibold mb-1">Tuliskan Penjelasan Lengkap Anda:</label>
                        <textarea
                          rows={4}
                          value={studentAnswers[q.id] || ''}
                          onChange={(e) => setStudentAnswers({ ...studentAnswers, [q.id]: e.target.value })}
                          className="w-full p-3 rounded-lg border bg-white text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                          placeholder="Jawaban penjelasan terperinci..."
                        />
                      </div>
                    )}

                  </div>
                );
              })}

              {(activeTaskToSolve.questions || []).length === 0 && (
                <div className="p-8 border-2 border-dashed rounded-xl text-center text-slate-400">
                  <FileText size={24} className="mx-auto mb-2 text-emerald-500" />
                  <p>Tugas ini murni berupa pengiriman dokumen atau foto catatan tugas.</p>
                </div>
              )}

              {!activeTaskToSolve.allowImageUpload && (
                <div className="pt-4 border-t dark:border-slate-800">
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-emerald-600/10 cursor-pointer flex items-center justify-center gap-2 text-xs"
                  >
                    <CheckCircle size={15} />
                    <span>Kirim Lembar Latihan Selesai</span>
                  </button>
                </div>
              )}
            </div>

            {/* Photo solutions submit */}
            {activeTaskToSolve.allowImageUpload && (
              <div className="lg:col-span-5 space-y-6">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 border-b pb-2">Bagian 2: Bukti Foto Pengerjaan</h3>
                
                <div className="space-y-4 bg-slate-50 dark:bg-[#090d16]/30 p-4 rounded-xl border dark:border-slate-800">
                  <p className="leading-relaxed text-slate-500">
                    Guru mewajibkan Anda melampirkan foto lembar pengerjaan di buku tulis / kertas folio Anda.
                  </p>

                  {/* File Upload Drag & Drop Area */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleFileDrop}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all relative cursor-pointer
                      ${dragOver ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/20'}
                      ${studentPhoto ? 'border-emerald-500/60 bg-emerald-500/5' : ''}`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileInput}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    
                    {studentPhoto ? (
                      <div className="space-y-2 pointer-events-none">
                        <div className="mx-auto w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                          <Check size={18} />
                        </div>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">Foto Berhasil Disematkan!</p>
                        <img
                          src={studentPhoto}
                          alt="Preview upload"
                          referrerPolicy="no-referrer"
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <p className="text-[10px] text-slate-400">Seret atau klik untuk mengganti foto</p>
                      </div>
                    ) : (
                      <div className="space-y-3 pointer-events-none">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto text-slate-400">
                          <Upload size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-700 dark:text-slate-300">Ambil/Unggah Foto Buku Tulis</p>
                          <p className="text-[10px] text-slate-400 mt-1">Ketuk area ini untuk langsung mengambil foto dari kamera HP</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Instant Simulator Helper button */}
                  {!studentPhoto && (
                    <div className="pt-2">
                      <p className="text-[10px] text-slate-400 font-mono mb-2 text-center">💡 Uji coba instan: Gunakan contoh foto pengerjaan buku tulis</p>
                      <div className="flex gap-2 justify-center">
                        {mockNotebookPhotos.map((photo, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => setStudentPhoto(photo)}
                            className="px-2.5 py-1 text-[10px] font-bold border border-emerald-100 dark:border-emerald-900/30 rounded bg-emerald-50/50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 cursor-pointer"
                          >
                            Simulasi Notebook #{pIdx + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t dark:border-slate-800">
                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-emerald-600/10 cursor-pointer flex items-center justify-center gap-2 text-xs"
                    >
                      <CheckCircle size={15} />
                      <span>Kirim Lembar Tugas Selesai</span>
                    </button>
                  </div>

                </div>
              </div>
            )}

          </form>
        </div>
      )}

      {/* ==================== CREATE ASSIGNMENT PANEL (TEACHER) ==================== */}
      {activeTab === 'create' && (
        <div className="bg-white dark:bg-[#111625] rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Assignment Settings Form (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 border-b pb-2">
              <Sparkles size={16} className="text-emerald-600" />
              {editingTaskId ? "1. Edit Pengaturan Tugas Utama" : "1. Pengaturan Tugas Utama"}
            </h2>

             <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Tipe Penugasan / Aktivitas</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setTaskType('tugas'); setAllowImage(false); }}
                    className={`py-2 rounded-lg font-bold border text-center transition-all cursor-pointer
                      ${taskType === 'tugas'
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'}`}
                  >
                    📝 Tugas Deskripsi & Kuis
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTaskType('latihan'); setAllowImage(false); }}
                    className={`py-2 rounded-lg font-bold border text-center transition-all cursor-pointer
                      ${taskType === 'latihan'
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'}`}
                  >
                    🎯 Latihan Soal Mandiri
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Judul Kegiatan</label>
                <input
                  type="text"
                  placeholder={taskType === 'tugas' ? "Contoh: Tugas Mandiri Bab 1 Aljabar" : "Contoh: Latihan Mandiri 1.2 Kaidah Pencacahan"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2 rounded-lg border bg-slate-50 text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-semibold text-slate-400">Kelas Sasaran (Bisa pilih lebih dari satu)</label>
                    <button
                      type="button"
                      onClick={() => setSelectedClasses(schoolClasses)}
                      className="text-[9px] text-emerald-500 hover:text-emerald-700 font-bold bg-emerald-50 dark:bg-emerald-900/40 px-2 py-0.5 rounded cursor-pointer"
                    >
                      Pilih Semua
                    </button>
                  </div>
                  <div className="w-full max-h-[80px] overflow-y-auto px-3 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 dark:border-slate-800">
                    {schoolClasses.map(c => (
                      <label key={c} className="flex items-center gap-2 mb-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedClasses.includes(c)}
                          disabled={!!editingTaskId && !selectedClasses.includes(c)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedClasses(prev => [...prev, c]);
                            } else {
                              setSelectedClasses(prev => prev.filter(cls => cls !== c));
                            }
                          }}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 bg-white dark:bg-slate-800"
                        />
                        <span className="text-xs text-slate-700 dark:text-slate-300">{c}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">Mata Pelajaran</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border bg-slate-50 text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="Matematika">Matematika</option>
                    <option value="IPA (Sains)">IPA (Sains)</option>
                    <option value="IPS (Sosial)">IPS (Sosial)</option>
                    <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                    <option value="Bahasa Inggris">Bahasa Inggris</option>
                    <option value="Pendidikan Pancasila">Pendidikan Pancasila</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                  <Calendar size={12} className="text-emerald-600" />
                  Batas Akhir Pengumpulan {taskType === 'latihan' && '(Opsional)'}
                </label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required={taskType === 'tugas'}
                  className="w-full text-xs px-3 py-2 rounded-lg border bg-slate-50 text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Petunjuk / Deskripsi Kegiatan</label>
                <textarea
                  rows={8}
                  placeholder="Petunjuk pengerjaan lengkap..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border bg-slate-50 text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-white focus:outline-none resize-y"
                />
              </div>

              {taskType === 'tugas' && (
                <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-lg">
                  <span className="text-amber-500 mt-0.5">💡</span>
                  <div className="space-y-0.5">
                    <p className="font-bold text-[10px] text-amber-800 dark:text-amber-200">Kirim Foto Dinonaktifkan (Hemat Memori)</p>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-normal">
                      Sesuai kebijakan penghematan penyimpanan &amp; memori perangkat, pengiriman tugas dalam bentuk foto dinonaktifkan. Siswa dapat mengerjakan tugas murni lewat kuis digital atau isian jawaban tertulis di sistem.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <span>{editingTaskId ? "Simpan Perubahan Tugas" : "Bagikan Kegiatan Ke E-Learning"}</span>
              </button>
            </form>
          </div>

          {/* Interactive Question Builder (7 cols) */}
          <div className="lg:col-span-7 bg-slate-50/50 dark:bg-[#090d16]/30 p-5 rounded-xl border dark:border-slate-800 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-2 mb-2">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Plus size={16} className="text-emerald-600" />
                2. Buat Lembar Pertanyaan Kuis Tugas
              </h2>
              <a href="https://generator-soal.ai.studio" target="_blank" rel="noopener noreferrer" className="text-[10px] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-md font-semibold hover:bg-emerald-200 transition-colors flex items-center gap-1">
                <span>✨ Buat Soal AI</span>
              </a>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Tipe Soal Kuis</label>
                <select
                  value={qType}
                  onChange={(e) => setQType(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-lg border bg-white text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-white focus:outline-none"
                >
                  <option value="pg_sederhana">Pilihan Ganda Sederhana</option>
                  <option value="pg_kompleks">Pilihan Ganda Kompleks</option>
                  <option value="benar_salah">Benar - Salah</option>
                  <option value="menjodohkan">Menjodohkan Istilah</option>
                  <option value="isian_singkat">Isian Singkat</option>
                  <option value="uraian">Uraian / Essay</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Stimulus (Opsional)</label>
                <textarea
                  placeholder="Tulis stimulus atau narasi teks (jika ada)... (Gunakan $ untuk rumus inline, atau $ untuk rumus block)"
                  value={qStimulus}
                  onChange={(e) => setQStimulus(e.target.value)}
                  rows={2}
                  className="w-full text-xs px-3 py-2 rounded-lg border bg-white text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-white focus:outline-none mb-2"
                />
                {qStimulusImage && (
                  <div className="relative inline-block mb-2">
                    <img src={qStimulusImage} alt="Stimulus" className="h-20 object-contain rounded border dark:border-slate-800" />
                    <button type="button" onClick={() => setQStimulusImage('')} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-0.5 shadow-sm hover:bg-rose-600"><X size={12}/></button>
                  </div>
                )}
                <div className="flex items-center gap-2 mb-4 border-b pb-3 dark:border-slate-800">
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg border dark:border-slate-700 text-[10px] font-semibold flex items-center gap-1.5 transition-colors">
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
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Pertanyaan / Perintah</label>
                <textarea
                  placeholder="Contoh: Jika f(x) = x^2 - 4x + 3, tentukan nilai minimum..."
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  rows={2}
                  className="w-full text-xs px-3 py-2 rounded-lg border bg-white text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-white focus:outline-none"
                />

                {/* Mathematical Shortcuts Bar */}
                <div className="mt-1.5 flex flex-wrap gap-1 items-center bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-lg border dark:border-slate-800">
                  <span className="text-[9px] font-bold text-slate-400 mr-1.5">Simbol Math (KaTeX):</span>
                  {[
                    { label: 'f(x)', code: 'f(x)' },
                    { label: 'x²', code: 'x^2' },
                    { label: 'a/b', code: '\\frac{a}{b}' },
                    { label: '√x', code: '\\sqrt{x}' },
                    { label: 'π', code: '\\pi' },
                    { label: 'θ', code: '\\theta' },
                    { label: '∞', code: '\\infty' },
                    { label: 'α', code: '\\alpha' },
                    { label: 'β', code: '\\beta' },
                    { label: '±', code: '\\pm' }
                  ].map((sym, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => setQText(prev => prev + ' $' + sym.code + '$ ')}
                      className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white dark:bg-slate-850 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 rounded border dark:border-slate-800 transition-colors cursor-pointer"
                    >
                      {sym.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Image Input with Presets */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1 flex justify-between items-center">
                  <span>Gambar Soal (Opsional)</span>
                  {qImage && (
                    <button type="button" onClick={() => setQImage('')} className="text-rose-500 font-bold hover:underline text-[9px]">
                      Hapus Gambar Soal
                    </button>
                  )}
                </label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold flex items-center gap-1.5 transition-colors w-full justify-center">
                    <span>🖼️ Upload Gambar dari Komputer/HP</span>
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
                </div>

                {qImage && (
                  <div className="mt-2 p-1.5 border dark:border-slate-800 rounded bg-white dark:bg-slate-900 max-w-[150px]">
                    <span className="text-[8px] uppercase font-bold text-emerald-500 block mb-1">Preview Gambar Soal</span>
                    <img src={qImage} alt="Preview Soal" className="h-16 w-full object-cover rounded" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>

              {/* PG Sederhana / PG Kompleks Options Builder */}
              {(qType === 'pg_sederhana' || qType === 'pg_kompleks') && (
                <div className="space-y-3 pt-3 border-t dark:border-slate-800/60">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Opsi Pilihan Ganda & Lampiran Gambar Opsi:</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {mcOptions.map((opt, oIdx) => (
                      <div key={oIdx} className="bg-white dark:bg-slate-900 p-2.5 border dark:border-slate-800 rounded-xl space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold font-mono text-emerald-600 text-xs">{String.fromCharCode(65 + oIdx)}:</span>
                          <input
                            type="text"
                            placeholder={`Jawaban Pilihan ${String.fromCharCode(65 + oIdx)}`}
                            value={opt}
                            onChange={(e) => {
                              const updatedOpts = [...mcOptions];
                              updatedOpts[oIdx] = e.target.value;
                              setMcOptions(updatedOpts);
                            }}
                            className="w-full bg-transparent text-xs focus:outline-none dark:text-white font-semibold"
                          />
                        </div>
                        
                        {/* Mathematical Shortcuts Bar for Options */}
                        <div className="flex flex-wrap gap-1 items-center mb-1">
                          {[
                            { label: 'f(x)', code: 'f(x)' },
                            { label: 'x²', code: 'x^2' },
                            { label: 'a/b', code: '\\frac{a}{b}' },
                            { label: '√x', code: '\\sqrt{x}' },
                            { label: 'π', code: '\\pi' },
                            { label: 'θ', code: '\\theta' },
                            { label: '∞', code: '\\infty' },
                            { label: 'α', code: '\\alpha' },
                            { label: 'β', code: '\\beta' },
                            { label: '±', code: '\\pm' }
                          ].map((sym, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => {
                                const updatedOpts = [...mcOptions];
                                updatedOpts[oIdx] = updatedOpts[oIdx] + ' $' + sym.code + '$ ';
                                setMcOptions(updatedOpts);
                              }}
                              className="px-1.5 py-0.5 text-[9px] font-mono font-semibold bg-slate-50 dark:bg-slate-850 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 rounded border dark:border-slate-800 transition-colors cursor-pointer text-slate-500"
                            >
                              {sym.label}
                            </button>
                          ))}
                        </div>

                        {/* Option Image URL Input */}
                        <div>
                          <div className="flex items-center gap-2">
                            <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded border dark:border-slate-700 text-[9px] font-semibold flex items-center justify-center gap-1.5 transition-colors w-full">
                              <span>Upload Gambar Opsi</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    compressImage(file).then(dataUrl => {
                                      const updated = [...mcOptionImages];
                                      updated[oIdx] = dataUrl;
                                      setMcOptionImages(updated);
                                    }).catch(console.error);
                                  }
                                }}
                              />
                            </label>
                            {mcOptionImages[oIdx] && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...mcOptionImages];
                                  updated[oIdx] = '';
                                  setMcOptionImages(updated);
                                }}
                                className="text-[8px] text-rose-500 font-bold hover:underline whitespace-nowrap"
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                          
                          {mcOptionImages[oIdx] && (
                            <img
                              src={mcOptionImages[oIdx]}
                              alt={`Preview Opsi ${String.fromCharCode(65 + oIdx)}`}
                              className="h-10 w-full object-contain mt-1.5 border rounded"
                              referrerPolicy="no-referrer"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {qType === 'pg_sederhana' ? (
                    <div className="pt-2">
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Jawaban Benar</label>
                      <select
                        value={singleCorrect}
                        onChange={(e) => setSingleCorrect(e.target.value)}
                        className="w-full text-xs px-2 py-1.5 rounded border bg-white text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                  ) : (
                    <div className="pt-2">
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1.5">Jawaban Benar (Pilih beberapa)</label>
                      <div className="flex gap-4">
                        {['A', 'B', 'C', 'D'].map(char => {
                          const isSel = complexCorrect.includes(char);
                          return (
                            <button
                              key={char}
                              type="button"
                              onClick={() => {
                                if (isSel) {
                                  setComplexCorrect(complexCorrect.filter(x => x !== char));
                                } else {
                                  setComplexCorrect([...complexCorrect, char]);
                                }
                              }}
                              className={`w-10 h-10 rounded-full font-bold font-mono border flex items-center justify-center transition-all cursor-pointer
                                ${isSel 
                                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' 
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'}`}
                            >
                              {char}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Benar Salah Option Builder */}
              {qType === 'benar_salah' && (
                <div className="pt-2 border-t dark:border-slate-800/60">
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1.5">Kunci Jawaban Benar-Salah</label>
                  <div className="flex gap-2">
                    {['BENAR', 'SALAH'].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setTfCorrect(val)}
                        className={`flex-1 py-2 rounded-lg border font-bold text-center cursor-pointer transition-all
                          ${tfCorrect === val
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'}`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Menjodohkan Pairs Builder */}
              {qType === 'menjodohkan' && (
                <div className="space-y-2 pt-2 border-t dark:border-slate-800/60">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Pasangan Jodoh Istilah:</span>
                    <button
                      type="button"
                      onClick={() => setMatchPairs([...matchPairs, { left: '', right: '' }])}
                      className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5 hover:underline"
                    >
                      <Plus size={12} /> Tambah Pasangan
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {matchPairs.map((pair, pIdx) => (
                      <div key={pIdx} className="grid grid-cols-12 gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Sisi Kiri (Pertanyaan)"
                          value={pair.left}
                          onChange={(e) => {
                            const updated = [...matchPairs];
                            updated[pIdx].left = e.target.value;
                            setMatchPairs(updated);
                          }}
                          className="col-span-5 px-2 py-1 rounded border bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-white text-xs"
                        />
                        <span className="col-span-1 text-center font-bold text-slate-400 font-mono">↔</span>
                        <input
                          type="text"
                          placeholder="Sisi Kanan (Jawaban Pasangan)"
                          value={pair.right}
                          onChange={(e) => {
                            const updated = [...matchPairs];
                            updated[pIdx].right = e.target.value;
                            setMatchPairs(updated);
                          }}
                          className="col-span-5 px-2 py-1 rounded border bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-white text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setMatchPairs(matchPairs.filter((_, i) => i !== pIdx))}
                          className="col-span-1 p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Isian Singkat Builder */}
              {qType === 'isian_singkat' && (
                <div className="pt-2 border-t dark:border-slate-800/60">
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">Kunci Jawaban Singkat (Auto-Graded)</label>
                  <input
                    type="text"
                    placeholder="Contoh: 120 atau x = 5"
                    value={shortCorrect}
                    onChange={(e) => setShortCorrect(e.target.value)}
                    required
                    className="w-full text-xs px-3 py-2 rounded-lg border bg-white text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-white focus:outline-none font-semibold font-mono"
                  />
                  <span className="text-[9px] text-slate-400 italic block mt-1">💡 Nilai isian singkat dicocokkan secara sensitif huruf tanpa spasi luar.</span>
                </div>
              )}

              {/* Uraian Builder */}
              {qType === 'uraian' && (
                <div className="pt-2 border-t dark:border-slate-800/60 p-3 bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/40 rounded-lg">
                  <p className="text-slate-500 leading-relaxed text-[10px]">
                    📝 <strong>Tipe Soal Uraian/Essay:</strong> Tidak dinilai secara otomatis oleh program kuis mandiri. Guru dapat memberikan nilai secara manual ketika memeriksa lembar pengerjaan kuis siswa.
                  </p>
                </div>
              )}

              {/* Image Reference Gallery */}
              {(qImage || mcOptionImages.some(img => img !== '')) && (
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
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
                        <div className="h-20 w-20 rounded border dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden p-1">
                          <img src={qImage} alt="Soal" className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                    )}
                    {mcOptionImages.map((img, idx) => img ? (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">Opsi {String.fromCharCode(65 + idx)}</span>
                        <div className="h-20 w-20 rounded border dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden p-1">
                          <img src={img} alt={`Opsi ${String.fromCharCode(65 + idx)}`} className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                    ) : null)}
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2 mt-3">
                <button
                  type="button"
                  onClick={downloadTemplateExcel}
                  className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 font-bold py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 text-xs"
                  title="Unduh format template Excel untuk menulis soal secara luring"
                >
                  Template Excel
                </button>
                <label className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 font-bold py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 text-xs" title="Import soal dari file Excel (.xlsx)">
                  <span>Import Excel</span>
                  <input type="file" accept=".xlsx, .xls" onChange={handleImportExcel} className="hidden" />
                </label>
                <button
                  type="button"
                  onClick={handleAddQuestionToDraft}
                  className="flex-[2] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-950 border border-emerald-200 dark:border-emerald-900/50 font-bold py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 text-xs"
                >
                  <Plus size={14} />
                  <span>Masukkan Soal ke Kertas</span>
                </button>
              </div>
            </div>

            {/* Questions Draft list */}
            <div className="pt-4 border-t dark:border-slate-800/60 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Kertas Tugas Saat Ini ({questions.length} Soal)</span>
              
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[160px] overflow-y-auto">
                {questions.map((q, idx) => (
                  <div key={q.id} className="py-2.5 flex justify-between items-center text-xs">
                    <div className="truncate pr-4">
                      <span className="font-bold text-slate-700 dark:text-slate-300 mr-1.5">{idx + 1}.</span>
                      <span className="text-slate-400 uppercase text-[9px] font-mono mr-2 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{q.type ? q.type.replace('_', ' ') : 'Uraian'}</span>
                      <div className="mt-1">
                        {q.stimulus && <div className="text-[10px] text-slate-500 italic mb-1">Stimulus: {q.stimulus}</div>}
                        {q.stimulusImage && <img src={q.stimulusImage} className="h-10 object-contain mb-1 rounded" />}
                        <span><MathText text={q.questionText} /></span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestionFromDraft(idx)}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}

                {questions.length === 0 && (
                  <p className="text-xs italic text-slate-400 text-center py-4">Belum ada soal kuis yang dibuat.</p>
                )}
              </div>
            </div>

          </div>

        </div>
      )}


      {/* ==================== LIST OF ASSIGNMENTS TAB ==================== */}
      {activeTab === 'list' && !activeTaskToSolve && !gradingSubmission && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main assignments grid (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <FileText size={16} className="text-emerald-600" />
                Tugas & Latihan Soal Terkini
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleAssignments.map(task => {
                // Filter class logic for student
                if (((activeRole === 'siswa' || activeRole === 'walimurid') || activeRole === 'walimurid') && currentStudent && task.className.trim() !== (currentStudent.className || '').trim()) {
                  return null;
                }

                // Check if already submitted
                const hasSubmitted = submissions.find(s => s.assignmentId === task.id && s.studentId === currentStudent?.id);

                return (
                  <div key={task.id} className="bg-white dark:bg-[#111625] rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-sm transition-all text-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold font-mono ${task.taskType === 'latihan' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'}`}>
                          {task.taskType === 'latihan' ? '🎯 LATIHAN SOAL' : '📝 TUGAS'} • {task.className}
                        </span>
                        <span className={`text-[10px] font-mono ${isDeadlinePassed(task.deadline) ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
                          {task.taskType === 'latihan' && !task.deadline ? 'Tidak ada batas waktu' : `Batas: ${new Date(task.deadline).toLocaleDateString('id-ID')} ${new Date(task.deadline).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">{task.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Mata Pelajaran: {task.subject} • Pengajar: {task.teacherName}</p>

                      <p className="text-slate-500 dark:text-slate-400 mt-2.5 italic max-h-40 overflow-y-auto whitespace-pre-wrap bg-slate-50 dark:bg-[#090d16] p-2.5 rounded border dark:border-slate-800/80 leading-relaxed font-sans">
                        {task.description || 'Tidak ada petunjuk tambahan.'}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
                        <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 px-2 py-0.5 rounded font-bold">
                          {(task.questions?.length || 0)} Kuis Kertas
                        </span>
                        {false && task.allowImageUpload && (
                          <span className="bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 px-2 py-0.5 rounded font-bold flex items-center gap-0.5">
                            <ImageIcon size={10} /> Wajib Upload Foto
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t dark:border-slate-800/60 flex justify-between items-center">
                      <span className="text-slate-400 text-[10px]">
                        {getRemainingTimeStr(task.deadline)}
                      </span>

                      {((activeRole === 'siswa' || activeRole === 'walimurid') || activeRole === 'walimurid') ? (
                        hasSubmitted ? (
                          <div className="flex items-center gap-1 max-w-[280px]">
                            {task.taskType === 'tugas' ? (
                              <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-900/50 text-[10px] flex items-start gap-1 shadow-xs leading-relaxed text-left">
                                <span>✅ Tugas terkirim dan nilai akan diisikan manual oleh guru ke daftar nilai</span>
                              </span>
                            ) : (
                              hasSubmitted.isGraded ? (
                                <span className="font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded text-xs flex items-center gap-1 border border-emerald-200 dark:border-emerald-900/50">
                                  ✅ Nilai Latihan: {hasSubmitted.score}
                                </span>
                              ) : (
                                <span className="text-emerald-700 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900/50 text-[10px] flex items-center gap-1 shadow-sm">
                                  ✅ Telah Terkirim (Menunggu Nilai)
                                </span>
                              )
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              if (isDeadlinePassed(task.deadline)) {
                                alert('Maaf, batas waktu pengumpulan tugas ini telah terlewati.');
                                return;
                              }
                              setActiveTaskToSolve(task);
                            }}
                            disabled={isDeadlinePassed(task.deadline)}
                            className={`font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all
                              ${isDeadlinePassed(task.deadline)
                                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'}`}
                          >
                            <span>Kerjakan</span>
                            <ChevronRight size={14} />
                          </button>
                        )
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                            {submissions.filter(s => s.assignmentId === task.id).length} Pengumpulan
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button 
                              onClick={() => {
                                const htmlContent = `
                                  <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                                  <head>
                                    <meta charset="UTF-8">
                                    <title>Tugas/Latihan - ${task.title}</title>
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
                                      <h1>${task.title}</h1>
                                      <p>Mata Pelajaran: ${task.subject}</p>
                                    </div>
                                    <div class="meta">
                                      <span>Kelas: ${task.className}</span>
                                      <span>Tipe: ${task.taskType === 'latihan' ? 'Latihan Soal (PG)' : 'Tugas Mandiri'}</span>
                                      <span>Deadline: ${task.deadline}</span>
                                    </div>
                                    ${task.description ? `<div style="margin-bottom: 20px; font-style: italic;">${task.description}</div>` : ''}
                                    <div class="questions-list">
                                      ${task.questions.map((q, idx) => `
                                        <div class="question-card">
                                          <div class="q-type">Soal ${idx + 1} (${q.type ? q.type.replace('_', ' ').toUpperCase() : 'URAIAN'})</div>
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
                                          
                                          ${(q.type === 'uraian' || q.type === 'isian_singkat' || !q.type) ? `
                                            <div style="margin-top: 15px; border-bottom: 1px dashed #ccc; height: 30px;"></div>
                                            ${(!q.type || q.type === 'uraian') ? `<div style="border-bottom: 1px dashed #ccc; height: 30px;"></div><div style="border-bottom: 1px dashed #ccc; height: 30px;"></div>` : ''}
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
                                                {left: '\\(', right: '\\)', display: false},
                                                {left: '\\[', right: '\\]', display: true}
                                            ],
                                            throwOnError : false
                                          });
                                          setTimeout(() => { window.print(); }, 1500);
                                      });
                                    </script>
                                  </body>
                                  </html>
                                `;
                                
                                const blob = new Blob(['﻿', htmlContent], { type: 'application/msword' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `Soal_${task.title.replace(/\s+/g, '_')}.doc`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                              }}
                              className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer mr-2"
                              title="Unduh Soal Tugas (Format Microsoft Word)"
                            >
                              📄 Unduh Soal (Word)
                            </button>
                            <button
                              onClick={() => {
                                const taskSubmissions = submissions.filter(s => String(s.assignmentId) === String(task.id));
                                if (taskSubmissions.length === 0) {
                                  alert("Belum ada siswa yang mengumpulkan tugas ini.");
                                  return;
                                }
                                const data = taskSubmissions.map((s, i) => ({
                                  'No': i + 1,
                                  'Nama Siswa': s.studentName,
                                  'Mata Pelajaran': task.subject,
                                  'Nilai': s.score ?? 'Tugas Manual',
                                  'Waktu Kumpul': s.submittedAt,
                                  'Catatan Guru': s.feedback || '-'
                                }));
                                const ws = XLSX.utils.json_to_sheet(data);
                                const wb = XLSX.utils.book_new();
                                XLSX.utils.book_append_sheet(wb, ws, "Rekap");
                                XLSX.writeFile(wb, `Rekap_Tugas_${task.title.replace(/\s+/g, '_')}.xlsx`);
                              }}
                              className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-800 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              Unduh Rekap
                            </button>
                            <button
                              onClick={() => {
                                setEditingTaskId(task.id);
                                setTitle(task.title);
                                setSubject(task.subject);
                                setSelectedClasses([task.className]);
                                setDeadline(task.deadline);
                                setDescription(task.description);
                                setAllowImage(task.allowImageUpload);
                                setTaskType(task.taskType || 'tugas');
                                setQuestions(task.questions);
                                setActiveTab('create');
                                window.scrollTo(0, 0);
                              }}
                              className="text-[10px] bg-slate-100 hover:bg-emerald-50 text-emerald-600 dark:bg-slate-800 dark:hover:bg-emerald-900/40 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-semibold transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Yakin ingin menghapus tugas ini? Jawaban siswa juga mungkin tidak akan bisa diakses lagi terkait tugas ini.')) {
                                  if (onDeleteAssignment) {
                                    onDeleteAssignment(task.id);
                                  }
                                }
                              }}
                              className="text-[10px] bg-slate-100 hover:bg-rose-50 text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-900/40 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-semibold transition-colors"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {visibleAssignments.length === 0 && (
                <div className="col-span-2 bg-white dark:bg-[#111625] rounded-xl p-8 text-center border text-slate-400 space-y-2">
                  <Award size={28} className="mx-auto text-emerald-500" />
                  <p className="font-bold text-slate-600 dark:text-slate-300">Belum Ada Tugas E-Learning</p>
                  <p className="text-xs">Materi tugas dengan soal kuis digital dan latihan mandiri akan muncul di sini.</p>
                </div>
              )}
              </div>
            </div>
          </div>

          {/* Submissions & grading tracking (4 cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-[#111625] rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Award size={16} className="text-emerald-600" />
                {((activeRole === 'siswa' || activeRole === 'walimurid') || activeRole === 'walimurid') ? 'Laporan Tugas & Nilai' : 'Daftar Pengumpulan Tugas'}
              </h2>
              {((activeRole !== 'siswa' && activeRole !== 'walimurid') && activeRole !== 'walimurid') && (
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('data-updated'))}
                  className="text-[9px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-400 px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                  title="Segarkan data pengumpulan tugas"
                >
                  🔄 Segarkan
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {((activeRole === 'siswa' || activeRole === 'walimurid') || activeRole === 'walimurid') ? (
                // Student view of their own submissions
                submissions.filter(s => s.studentId === currentStudent?.id).map(sub => {
                  const task = assignments.find(a => a.id === sub.assignmentId);
                  const isTugas = task?.taskType === 'tugas';
                  return (
                    <div key={sub.id} className="p-3 border dark:border-slate-800/80 rounded-lg space-y-2 bg-slate-50/50 dark:bg-[#090d16]/30">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{task?.title || 'Tugas Terhapus'}</h4>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded
                          ${sub.isGraded ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'}`}>
                          {isTugas ? 'Terkirim' : (sub.isGraded ? 'Dinilai' : 'Belum Dinilai')}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">Diterima: {sub.submittedAt}</p>
                      
                      {isTugas ? (
                        <div className="p-2.5 border border-emerald-100 dark:border-emerald-950 bg-emerald-50/25 dark:bg-emerald-950/10 rounded-lg space-y-1">
                          <p className="text-emerald-700 dark:text-emerald-400 font-bold text-[10px] leading-relaxed">
                            ✅ Tugas terkirim dan telah dinilai otomatis oleh sistem. Cek rekap nilai di akun Guru.
                          </p>
                          {sub.feedback && (
                            <p className="text-[10px] text-slate-500 italic mt-1.5 leading-relaxed border-t pt-1 border-dashed dark:border-slate-800">
                              Catatan: "{sub.feedback}"
                            </p>
                          )}
                        </div>
                      ) : (
                        sub.isGraded && (
                          <div className="p-2 border border-emerald-100 dark:border-emerald-950 bg-emerald-50/25 dark:bg-emerald-950/10 rounded-lg space-y-1">
                            <p className="font-bold text-emerald-600 dark:text-emerald-400 text-[10px]">✅ Latihan Selesai & Telah Dinilai</p>
                            {sub.feedback && <p className="text-[10px] text-slate-500 italic mt-1 leading-relaxed">"{sub.feedback}"</p>}
                          </div>
                        )
                      )}
                    </div>
                  );
                })
              ) : (
                // Teacher view of all submissions
                submissions.filter(sub => {
                  const task = assignments.find(a => a.id === sub.assignmentId);
                  if (!task) return false;
                  return new Date(task.deadline).getTime() > new Date().getTime();
                }).map(sub => {
                  const task = assignments.find(a => a.id === sub.assignmentId);
                  const isTugas = task?.taskType === 'tugas';
                  const isCreatorTeacher = task && session?.name && (task.teacherName.toLowerCase().trim() === session.name.toLowerCase().trim());
                  const canSeeScore = !isTugas || isCreatorTeacher;
                  
                  return (
                    <div key={sub.id} className="p-3.5 border dark:border-slate-800 rounded-xl space-y-2 hover:border-emerald-200 transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-200">{sub.studentName}</h4>
                          <p className="text-[10px] text-slate-400 font-mono">NIS: {sub.studentId}</p>
                        </div>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded
                          ${sub.isGraded ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'}`}>
                          {isTugas ? (
                            canSeeScore ? (sub.isGraded ? `Dinilai: ${sub.score}` : 'Koreksi') : (sub.isGraded ? 'Sudah Dinilai' : 'Belum Dinilai')
                          ) : (
                            sub.isGraded ? `Dinilai: ${sub.score}` : 'Koreksi'
                          )}
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Tugas: <span className="font-bold text-emerald-600 dark:text-emerald-400">{task?.title || 'Tugas'}</span></p>
                      <p className="text-[10px] text-slate-400">Pengajar: <span className="font-semibold">{task?.teacherName || 'Guru Pengampu'}</span></p>
 
                      <div className="flex justify-between items-center pt-2 border-t dark:border-slate-800/60 text-[10px]">
                        <span className="text-slate-400 font-mono">{sub.submittedAt}</span>
                        {canSeeScore ? (
                          <button
                            onClick={() => {
                              setGradingSubmission(sub);
                              setTeacherScore(sub.score !== undefined ? sub.score : 0);
                              setTeacherFeedback(sub.feedback || '');
                            }}
                            className="font-bold text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 cursor-pointer"
                          >
                            {sub.isGraded ? 'Tinjau Ulang & Edit Nilai ↗' : 'Koreksi Jawaban & Foto ↗'}
                          </button>
                        ) : (
                          <span className="text-slate-400 italic">Otoritas Guru Pengampu</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {((((activeRole === 'siswa' || activeRole === 'walimurid') || activeRole === 'walimurid') && submissions.filter(s => s.studentId === currentStudent?.id).length === 0) ||
               (((activeRole !== 'siswa' && activeRole !== 'walimurid') && activeRole !== 'walimurid') && submissions.filter(sub => {
                  const task = assignments.find(a => a.id === sub.assignmentId);
                  return task && new Date(task.deadline).getTime() > new Date().getTime();
               }).length === 0)) && (
                <p className="text-xs italic text-slate-400 text-center py-8">Belum ada pengumpulan jawaban aktif.</p>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
