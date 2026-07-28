#!/bin/bash
sed -i '/interface AssignmentManagerProps {/i \
const MATH_SYMBOLS = [\
  { label: "Pecahan", code: "$\\\\frac{a}{b}$" },\
  { label: "Kuadrat (x²)", code: "$x^2$" },\
  { label: "Pangkat (xⁿ)", code: "$x^n$" },\
  { label: "Indeks (x₁)", code: "$x_1$" },\
  { label: "Akar (√)", code: "$\\\\sqrt{x}$" },\
  { label: "Akar pangkat n", code: "$\\\\sqrt[n]{x}$" },\
  { label: "Logaritma", code: "$\\\\log_{a}{b}$" },\
  { label: "Kurang Lebih", code: "$\\\\pm$" },\
  { label: "Derajat", code: "$^{\\\\circ}$" },\
  { label: "Derajat Celcius", code: "$^{\\\\circ}\\\\text{C}$" },\
  { label: "Pi (π)", code: "$\\\\pi$" },\
  { label: "Alpha (α)", code: "$\\\\alpha$" },\
  { label: "Beta (β)", code: "$\\\\beta$" },\
  { label: "Theta (θ)", code: "$\\\\theta$" },\
  { label: "Sinus", code: "$\\\\sin(x)$" },\
  { label: "Cosinus", code: "$\\\\cos(x)$" },\
  { label: "Tangen", code: "$\\\\tan(x)$" },\
  { label: "Tidak Sama", code: "$\\\\neq$" },\
  { label: "Kurang/Sama", code: "$\\\\leq$" },\
  { label: "Lebih/Sama", code: "$\\\\geq$" },\
  { label: "Kali (x)", code: "$\\\\times$" },\
  { label: "Bagi (÷)", code: "$\\\\div$" },\
  { label: "Tak Hingga", code: "$\\\\infty$" },\
  { label: "Panah Kanan", code: "$\\\\rightarrow$" },\
  { label: "Vektor", code: "$\\\\vec{v}$" },\
];\
' src/components/AssignmentManager.tsx
