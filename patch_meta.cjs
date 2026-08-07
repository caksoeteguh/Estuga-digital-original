const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `    // const unsubscribe = setupMetadataSync(
      schoolIdentity, setSchoolIdentity,
      schoolClasses, setSchoolClasses,
      schoolSubjects, setSchoolSubjects
    );
    // return () => unsubscribe();`;

const insert = `    // Firebase sync disabled due to quota limits
    // const unsubscribe = setupMetadataSync(
    //  schoolIdentity, setSchoolIdentity,
    //  schoolClasses, setSchoolClasses,
    //  schoolSubjects, setSchoolSubjects
    // );
    // return () => unsubscribe();`;

code = code.replace(search, insert);
fs.writeFileSync('src/App.tsx', code);
