const fs = require('fs');
let code = fs.readFileSync('src/components/AssignmentManager.tsx', 'utf-8');
code = code.replace(`  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setStudentPhoto(reader.result as string);
        playBeepSound('attached');
      };
      reader.readAsDataURL(file);
    }
  };
      reader.readAsDataURL(file);
    }
  };`, `  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setStudentPhoto(reader.result as string);
        playBeepSound('attached');
      };
      reader.readAsDataURL(file);
    }
  };`);
fs.writeFileSync('src/components/AssignmentManager.tsx', code);
