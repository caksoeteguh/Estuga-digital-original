const fs = require('fs');
let code = fs.readFileSync('src/components/AssignmentManager.tsx', 'utf-8');
code = code.replace(`        setStudentPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleFileInput =`, `        setStudentPhoto(reader.result as string);
        playBeepSound('attached');
      };
      reader.readAsDataURL(file);
    }
  };


  const handleFileInput =`);
fs.writeFileSync('src/components/AssignmentManager.tsx', code);
