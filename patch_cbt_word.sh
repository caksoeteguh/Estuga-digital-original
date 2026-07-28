#!/bin/bash
sed -i 's/${q.questionText}/${parseMathForWord(q.questionText)}/g' src/components/CBTManager.tsx
sed -i 's/${opt.text}/${parseMathForWord(opt.text)}/g' src/components/CBTManager.tsx

sed -i '/const MATH_SYMBOLS/i \
const parseMathForWord = (text: string) => {\
  if (!text) return "";\
  return text.replace(/\\$\\$(.*?)\\$\\$/gs, (match, formula) => {\
    return `<div style="text-align: center;"><img src="https://latex.codecogs.com/png.latex?\\\\dpi{300}\\\\bg_white\\\\space${encodeURIComponent(formula.trim())}" alt="Math" style="max-height: 40px;"/></div>`;\
  }).replace(/\\$(.*?)\\$/g, (match, formula) => {\
    return `<img src="https://latex.codecogs.com/png.latex?\\\\dpi{300}\\\\bg_white\\\\space${encodeURIComponent(formula.trim())}" alt="Math" style="vertical-align: middle; max-height: 20px;" />`;\
  });\
};\
' src/components/CBTManager.tsx
