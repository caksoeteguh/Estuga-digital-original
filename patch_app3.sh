#!/bin/bash
sed -i '/import BarcodeScanner/a \
import AttendanceRecap from "./components/AttendanceRecap";' src/App.tsx
