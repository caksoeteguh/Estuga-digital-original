#!/bin/bash
sed -i 's/{\[/{MATH_SYMBOLS.map((sym, i) => (/g' src/components/AssignmentManager.tsx
