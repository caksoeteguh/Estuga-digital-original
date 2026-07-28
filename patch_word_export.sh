#!/bin/bash
sed -i 's/https:\/\/latex.codecogs.com\/png.latex?\\\\dpi{300}\\\\bg_white\\\\space" + encodeURIComponent(formula.trim()) + ""/https:\/\/latex.codecogs.com\/png.latex?\\\\dpi{300}\\\\bg_white\\\\space${encodeURIComponent(formula.trim())}/g' src/components/AssignmentManager.tsx
