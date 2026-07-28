import { Student } from '../types';
import { CardTheme } from '../components/StudentIdCard';
import QRCode from 'qrcode';

const drawRoundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

export async function renderStudentIdCardToCanvas(
  canvas: HTMLCanvasElement,
  student: Student,
  currentTheme: CardTheme,
  schoolName: string,
  schoolCity: string,
  schoolLogo: string
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Preload Logo Image if it's dynamic
  let logoImage: HTMLImageElement | null = null;
  if (schoolLogo.startsWith('data:image') || schoolLogo.startsWith('http')) {
    logoImage = new Image();
    logoImage.crossOrigin = "anonymous";
    logoImage.src = schoolLogo;
    await new Promise<void>((resolve) => {
      if (logoImage) {
        logoImage.onload = () => resolve();
        logoImage.onerror = () => {
          logoImage = null;
          resolve();
        };
      } else {
        resolve();
      }
    });
  }

  // High-resolution Portrait Dimensions: 600px width x 900px height
  const cardWidth = 600;
  const cardHeight = 900;
  canvas.width = cardWidth;
  canvas.height = cardHeight;

  // --- 1. Background Styling with Selected Theme Gradient ---
  const bgGradient = ctx.createLinearGradient(0, 0, 0, cardHeight);
  bgGradient.addColorStop(0, currentTheme.gradColors[0]);
  bgGradient.addColorStop(0.3, currentTheme.gradColors[1]);
  bgGradient.addColorStop(1, currentTheme.gradColors[2]);
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, cardWidth, cardHeight);

  // Decorative gradient glassmorphic rings
  ctx.strokeStyle = currentTheme.circle1Color;
  ctx.lineWidth = 40;
  ctx.beginPath();
  ctx.arc(cardWidth / 2, -100, 450, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = currentTheme.circle2Color;
  ctx.lineWidth = 20;
  ctx.beginPath();
  ctx.arc(cardWidth, cardHeight + 50, 300, 0, Math.PI * 2);
  ctx.stroke();

  // --- 2. School Header ---
  const holeX = cardWidth / 2;
  const holeY = 45;

  // Outer brass circle
  ctx.strokeStyle = '#f59e0b'; // Gold color
  ctx.lineWidth = 6;
  ctx.fillStyle = '#0f172a'; // Deep background cutout
  ctx.beginPath();
  ctx.arc(holeX, holeY, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Inner punch out shadow
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(holeX, holeY, 8, 0, Math.PI * 2);
  ctx.fill();
  
  // Label for the lanyard slot
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('LUBANG KALUNG / LANYARD', holeX, 75);

  // Group Header: Logo on Left, School Name on Right
  const logoCenterY = 135;
  ctx.font = 'bold 26px Arial, sans-serif';
  const nameWidth = ctx.measureText(schoolName).width;
  const logoDiameter = 72;
  const logoRadius = 36;
  const gap = 16;
  const totalHeaderWidth = logoDiameter + gap + nameWidth;
  const headerStartX = (cardWidth - totalHeaderWidth) / 2;
  
  const logoCenterX = headerStartX + logoRadius;
  
  // Badge Circle for school logo
  ctx.fillStyle = currentTheme.badgeBgColor;
  ctx.beginPath();
  ctx.arc(logoCenterX, logoCenterY, logoRadius, 0, Math.PI * 2);
  ctx.fill();

  if (logoImage) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(logoCenterX, logoCenterY, 28, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logoImage, logoCenterX - 28, logoCenterY - 28, 56, 56);
    ctx.restore();
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(schoolLogo, logoCenterX, logoCenterY - 4);
  }

  // School Title Text (Side by Side)
  const textLeftX = headerStartX + logoDiameter + gap;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(schoolName, textLeftX, logoCenterY - 2);

  // Subtitle City
  ctx.fillStyle = currentTheme.textMutedColor;
  ctx.font = 'bold 14px monospace';
  ctx.fillText(schoolCity, textLeftX, logoCenterY + 18);

  // Modern divider
  const dividerGrad = ctx.createLinearGradient(100, 0, 500, 0);
  dividerGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  dividerGrad.addColorStop(0.5, currentTheme.dividerColor);
  dividerGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = dividerGrad;
  ctx.fillRect(80, 168, 440, 2);

  // --- 3. Profile & Enlarged QR Code (Centered) ---
  const profileY = 185;

  // QR Code Container (Centered)
  const qrSize = 135;
  const qrBgW = 155;
  const qrBgH = 185;
  const qrBgX = (cardWidth - qrBgW) / 2;
  const qrBgY = profileY;

  ctx.fillStyle = '#ffffff';
  drawRoundRect(ctx, qrBgX, qrBgY, qrBgW, qrBgH, 16);
  ctx.fill();

  try {
    const qrDataUrl = await QRCode.toDataURL(student.id || "N/A", {
      margin: 1,
      width: qrSize,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    const qrImage = new Image();
    qrImage.src = qrDataUrl;
    await new Promise<void>((resolve) => {
      qrImage.onload = () => resolve();
      qrImage.onerror = () => resolve();
    });
    ctx.drawImage(qrImage, qrBgX + (qrBgW - qrSize) / 2, qrBgY + 12, qrSize, qrSize);

    // Student code text below QR
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(student.id, qrBgX + qrBgW / 2, qrBgY + qrSize + 28);
  } catch (e) {
    console.error(e);
  }

  // Name & NIS (Centered below QR Code)
  const textStartY = qrBgY + qrBgH + 25;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(student.name.toUpperCase(), cardWidth / 2, textStartY);

  ctx.fillStyle = currentTheme.accentColor;
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.fillText(`NIS: ${student.id}`, cardWidth / 2, textStartY + 28);

  // Class Capsule (Centered)
  const classStr = `KELAS: ${student.className.toUpperCase()}`;
  ctx.font = 'bold 14px sans-serif';
  const classWidth = ctx.measureText(classStr).width;
  const classPillX = (cardWidth - (classWidth + 24)) / 2;
  
  ctx.fillStyle = currentTheme.pillsBgColor;
  drawRoundRect(ctx, classPillX, textStartY + 45, classWidth + 24, 28, 14);
  ctx.fill();
  ctx.strokeStyle = currentTheme.pillsBorderColor;
  ctx.lineWidth = 1.5;
  drawRoundRect(ctx, classPillX, textStartY + 45, classWidth + 24, 28, 14);
  ctx.stroke();
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(classStr, cardWidth / 2, textStartY + 64);

  // TTL Info below
  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px Arial, sans-serif';
  ctx.fillText(`Lahir: ${student.pob}, ${new Date(student.dob).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, cardWidth / 2, textStartY + 95);

  // --- 4. Credentials Header ---
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🔑 AKUN LOGIN BELAJAR & ORANG TUA (TERPADU)', cardWidth / 2, 422);

  const subDividerGrad = ctx.createLinearGradient(150, 0, 450, 0);
  subDividerGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  subDividerGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.25)');
  subDividerGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = subDividerGrad;
  ctx.fillRect(120, 434, 360, 1.5);

  // --- 5. Credentials Box Grid (Side-by-Side: y=448) ---
  const boxY = 448;
  const boxW = 245;
  const boxH = 340;

  // A. SISWA PANEL (Left: x=45)
  const sBoxX = 50;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  drawRoundRect(ctx, sBoxX, boxY, boxW, boxH, 16);
  ctx.fill();
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
  ctx.lineWidth = 1.5;
  drawRoundRect(ctx, sBoxX, boxY, boxW, boxH, 16);
  ctx.stroke();

  // Siswa Title
  ctx.fillStyle = '#f59e0b'; // Gold accent
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('🔐 PORTAL AKADEMIK SISWA', sBoxX + 16, boxY + 28);

  // CBT Subsection
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px Arial, sans-serif';
  ctx.fillText('1. Ujian Komputer (CBT)', sBoxX + 16, boxY + 62);

  // High contrast backdrop bar for CBT details to make them super readable
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  drawRoundRect(ctx, sBoxX + 12, boxY + 72, boxW - 24, 60, 6);
  ctx.fill();

  ctx.fillStyle = '#fbbf24'; // beautiful amber color for username/password text
  ctx.font = 'bold 20px monospace';
  ctx.fillText(`User: ${student.usernameCbt}`, sBoxX + 20, boxY + 95);
  ctx.fillText(`Pass: ${student.passwordCbt}`, sBoxX + 20, boxY + 120);

  // E-Learning Subsection
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px Arial, sans-serif';
  ctx.fillText('2. Portal Belajar Mandiri (E-Learning)', sBoxX + 16, boxY + 158);

  // High contrast backdrop bar for E-learning
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  drawRoundRect(ctx, sBoxX + 12, boxY + 168, boxW - 24, 60, 6);
  ctx.fill();

  ctx.fillStyle = '#38bdf8'; // bright sky blue for contrast
  ctx.font = 'bold 20px monospace';
  ctx.fillText(`User: ${student.id} (NIS)`, sBoxX + 20, boxY + 192);
  ctx.fillText(`Pass: ${student.dob.replace(/-/g, '')}`, sBoxX + 20, boxY + 218);

  // Tips
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'italic 10.5px Arial, sans-serif';
  ctx.fillText('• Ujian CBT & materi e-learning sekolah.', sBoxX + 16, boxY + 258);
  ctx.fillText('• Password e-learning: Tgl Lahir siswa.', sBoxX + 16, boxY + 278);

  // B. ORANG TUA / WALI PANEL (Right: x=310)
  const oBoxX = 305;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  drawRoundRect(ctx, oBoxX, boxY, boxW, boxH, 16);
  ctx.fill();
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
  ctx.lineWidth = 1.5;
  drawRoundRect(ctx, oBoxX, boxY, boxW, boxH, 16);
  ctx.stroke();

  // Orang Tua Title
  ctx.fillStyle = '#10b981'; // Emerald accent
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.fillText('👨‍👩‍👦 PORTAL WALI MURID (HP)', oBoxX + 16, boxY + 28);

  // Instruction block
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '11px Arial, sans-serif';
  ctx.fillText('Gunakan akun di bawah untuk memantau', oBoxX + 16, boxY + 62);
  ctx.fillText('absensi, tugas, & raport ujian CBT.', oBoxX + 16, boxY + 80);

  // Login Portal details
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px Arial, sans-serif';
  ctx.fillText('3. Login Aplikasi Wali Murid', oBoxX + 16, boxY + 120);

  // High contrast backdrop bar for Portal Wali details to make them super readable for parents
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  drawRoundRect(ctx, oBoxX + 12, boxY + 132, boxW - 24, 60, 6);
  ctx.fill();

  ctx.fillStyle = '#34d399'; // bright green-emerald for parent account
  ctx.font = 'bold 20px monospace';
  ctx.fillText(`User: ${student.usernameParent}`, oBoxX + 20, boxY + 158);
  ctx.fillText(`Pass: ${student.passwordParent}`, oBoxX + 20, boxY + 182);

  // Tip
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'italic 10.5px Arial, sans-serif';
  ctx.fillText('• Scan Barcode di atas saat anak masuk', oBoxX + 16, boxY + 245);
  ctx.fillText('  pintu gerbang untuk notifikasi instan.', oBoxX + 16, boxY + 265);

  // --- 6. Footer Information (y=805 to 900) ---
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(0, 810, cardWidth, 2);

  ctx.fillStyle = '#64748b';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Pihak sekolah berhak menonaktifkan kartu jika terdapat pelanggaran etika digital.', cardWidth / 2, 842);
  ctx.font = 'bold 11px sans-serif';
  ctx.fillStyle = currentTheme.textMutedColor;
  ctx.fillText('KARTU AKSES SEKOLAH MANDIRI TERPADU • ESTUGADIGITAL © 2026', cardWidth / 2, 868);
}

export async function renderStaffIdCardToCanvas(
  canvas: HTMLCanvasElement,
  staff: {
    id: string;
    name: string;
    role: string;
    username: string;
    password?: string;
    phone?: string;
    subject?: string;
  },
  currentTheme: CardTheme,
  schoolName: string,
  schoolCity: string,
  schoolLogo: string
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let logoImage: HTMLImageElement | null = null;
  if (schoolLogo.startsWith('data:image') || schoolLogo.startsWith('http')) {
    logoImage = new Image();
    logoImage.crossOrigin = "anonymous";
    logoImage.src = schoolLogo;
    await new Promise<void>((resolve) => {
      if (logoImage) {
        logoImage.onload = () => resolve();
        logoImage.onerror = () => {
          logoImage = null;
          resolve();
        };
      } else {
        resolve();
      }
    });
  }

  const cardWidth = 600;
  const cardHeight = 900;
  canvas.width = cardWidth;
  canvas.height = cardHeight;

  const bgGradient = ctx.createLinearGradient(0, 0, 0, cardHeight);
  bgGradient.addColorStop(0, currentTheme.gradColors[0]);
  bgGradient.addColorStop(0.3, currentTheme.gradColors[1]);
  bgGradient.addColorStop(1, currentTheme.gradColors[2]);
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, cardWidth, cardHeight);

  ctx.strokeStyle = currentTheme.circle1Color;
  ctx.lineWidth = 40;
  ctx.beginPath();
  ctx.arc(cardWidth / 2, -100, 450, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = currentTheme.circle2Color;
  ctx.lineWidth = 20;
  ctx.beginPath();
  ctx.arc(cardWidth, cardHeight + 50, 300, 0, Math.PI * 2);
  ctx.stroke();

  const holeX = cardWidth / 2;
  const holeY = 45;

  ctx.strokeStyle = '#f59e0b'; 
  ctx.lineWidth = 6;
  ctx.fillStyle = '#0f172a'; 
  ctx.beginPath();
  ctx.arc(holeX, holeY, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(holeX, holeY, 8, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('LUBANG KALUNG / LANYARD', holeX, 75);

  const logoCenterY = 135;
  ctx.font = 'bold 26px Arial, sans-serif';
  const nameWidth = ctx.measureText(schoolName).width;
  const logoDiameter = 72;
  const logoRadius = 36;
  const gap = 16;
  const totalHeaderWidth = logoDiameter + gap + nameWidth;
  const headerStartX = (cardWidth - totalHeaderWidth) / 2;
  
  const logoCenterX = headerStartX + logoRadius;
  
  ctx.fillStyle = currentTheme.badgeBgColor;
  ctx.beginPath();
  ctx.arc(logoCenterX, logoCenterY, logoRadius, 0, Math.PI * 2);
  ctx.fill();

  if (logoImage) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(logoCenterX, logoCenterY, 28, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logoImage, logoCenterX - 28, logoCenterY - 28, 56, 56);
    ctx.restore();
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(schoolLogo, logoCenterX, logoCenterY - 4);
  }

  const textLeftX = headerStartX + logoDiameter + gap;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(schoolName, textLeftX, logoCenterY - 2);

  ctx.fillStyle = currentTheme.textMutedColor;
  ctx.font = 'bold 14px monospace';
  ctx.fillText(schoolCity, textLeftX, logoCenterY + 18);

  const dividerGrad = ctx.createLinearGradient(100, 0, 500, 0);
  dividerGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  dividerGrad.addColorStop(0.5, currentTheme.dividerColor);
  dividerGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = dividerGrad;
  ctx.fillRect(80, 168, 440, 2);

  const profileY = 185;
  const qrSize = 135;
  const qrBgW = 155;
  const qrBgH = 185;
  const qrBgX = (cardWidth - qrBgW) / 2;
  const qrBgY = profileY;

  ctx.fillStyle = '#ffffff';
  drawRoundRect(ctx, qrBgX, qrBgY, qrBgW, qrBgH, 16);
  ctx.fill();

  try {
    const qrDataUrl = await QRCode.toDataURL(staff.id || staff.username || "N/A", {
      margin: 1,
      width: qrSize,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    const qrImage = new Image();
    qrImage.src = qrDataUrl;
    await new Promise<void>((resolve) => {
      qrImage.onload = () => resolve();
      qrImage.onerror = () => resolve();
    });
    ctx.drawImage(qrImage, qrBgX + (qrBgW - qrSize) / 2, qrBgY + 12, qrSize, qrSize);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(staff.id || 'NIP/NUPTK', qrBgX + qrBgW / 2, qrBgY + qrSize + 28);
  } catch (e) {
    console.error(e);
  }

  const textStartY = qrBgY + qrBgH + 25;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(staff.name.toUpperCase(), cardWidth / 2, textStartY);

  ctx.fillStyle = currentTheme.accentColor;
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.fillText(`NIP: ${staff.id || '-'}`, cardWidth / 2, textStartY + 28);

  const roleStr = `JABATAN: ${staff.role.toUpperCase()}`;
  ctx.font = 'bold 14px sans-serif';
  const classWidth = ctx.measureText(roleStr).width;
  const classPillX = (cardWidth - (classWidth + 24)) / 2;
  
  ctx.fillStyle = currentTheme.pillsBgColor;
  drawRoundRect(ctx, classPillX, textStartY + 45, classWidth + 24, 28, 14);
  ctx.fill();
  ctx.strokeStyle = currentTheme.pillsBorderColor;
  ctx.lineWidth = 1.5;
  drawRoundRect(ctx, classPillX, textStartY + 45, classWidth + 24, 28, 14);
  ctx.stroke();
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(roleStr, cardWidth / 2, textStartY + 64);

  if (staff.subject) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px Arial, sans-serif';
    ctx.fillText(`Mapel: ${staff.subject}`, cardWidth / 2, textStartY + 95);
  }

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🔑 AKUN LOGIN SISTEM AKADEMIK', cardWidth / 2, 422);

  const subDividerGrad = ctx.createLinearGradient(150, 0, 450, 0);
  subDividerGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  subDividerGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.25)');
  subDividerGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = subDividerGrad;
  ctx.fillRect(120, 434, 360, 1.5);

  const boxY = 448;
  const boxW = 400;
  const boxH = 200;
  const boxX = (cardWidth - boxW) / 2;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  drawRoundRect(ctx, boxX, boxY, boxW, boxH, 16);
  ctx.fill();
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
  ctx.lineWidth = 1.5;
  drawRoundRect(ctx, boxX, boxY, boxW, boxH, 16);
  ctx.stroke();

  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 16px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🔐 DETAIL LOGIN', cardWidth / 2, boxY + 36);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  drawRoundRect(ctx, boxX + 40, boxY + 60, boxW - 80, 100, 8);
  ctx.fill();

  ctx.fillStyle = '#fbbf24'; 
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`User: ${staff.username}`, boxX + 60, boxY + 100);
  ctx.fillText(`Pass: ${staff.password || '-'}`, boxX + 60, boxY + 135);

  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(0, 810, cardWidth, 2);

  ctx.fillStyle = '#64748b';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Pihak sekolah berhak menonaktifkan kartu jika terdapat pelanggaran etika digital.', cardWidth / 2, 842);
  ctx.font = 'bold 11px sans-serif';
  ctx.fillStyle = currentTheme.textMutedColor;
  ctx.fillText('KARTU AKSES SEKOLAH MANDIRI TERPADU • ESTUGADIGITAL © 2026', cardWidth / 2, 868);
}

