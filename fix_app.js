const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Find the messed up part
const messedUpPart = `                            {rec.pas !== "" && rec.pas !== undefined && rec.pas !== null ? rec.pa        {/* Sholat Dhuhur Attendance for Parent */}
        {(!student.religion || student.religion.toLowerCase() === 'islam') && (
          <div className="bg-white dark:bg-[#2b2c40] rounded-2xl p-6 border border-gray-100 dark:border-[#3e405b] shadow-sm mt-6">`;

const replaceWith = `                            {rec.pas !== "" && rec.pas !== undefined && rec.pas !== null ? rec.pas : '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sholat Dhuhur Attendance for Parent */}
        {(!student.religion || student.religion.toLowerCase() === 'islam') && (
          <div className="bg-white dark:bg-[#2b2c40] rounded-2xl p-6 border border-gray-100 dark:border-[#3e405b] shadow-sm mt-6">`;

code = code.replace(messedUpPart, replaceWith);
fs.writeFileSync('src/App.tsx', code);
