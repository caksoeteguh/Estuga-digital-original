const fs = require('fs');

let code = fs.readFileSync('src/components/CBTManager.tsx', 'utf-8');

const targetStr = `              <div className="space-y-3">
                {results.map((res, index) => (
                  <div key={index} className="p-3 border-b last:border-b-0 dark:border-[#3e405b]/50 text-xs">`;

const replacement = `              <div className="space-y-3">
                {(activeRole === 'siswa' && session?.username 
                  ? results.filter(r => {
                      const student = students.find(s => s.usernameCbt.toLowerCase() === session.username.toLowerCase());
                      return student ? r.studentId === student.id : false;
                    })
                  : results
                ).map((res, index) => (
                  <div key={index} className="p-3 border-b last:border-b-0 dark:border-[#3e405b]/50 text-xs">`;

code = code.replace(targetStr, replacement);
fs.writeFileSync('src/components/CBTManager.tsx', code);
