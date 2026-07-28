const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const lazyImports = `
import React, { useState, useEffect, lazy, Suspense } from 'react';

// Lazy load components
const BarcodeScanner = lazy(() => import('./components/BarcodeScanner'));
const JournalManager = lazy(() => import('./components/JournalManager'));
const CBTManager = lazy(() => import('./components/CBTManager'));
const DataImporter = lazy(() => import('./components/DataImporter'));
const AnalyticsDashboard = lazy(() => import('./components/AnalyticsDashboard'));
const CalendarScheduler = lazy(() => import('./components/CalendarScheduler'));
const PhpExporter = lazy(() => import('./components/PhpExporter'));
const AssignmentManager = lazy(() => import('./components/AssignmentManager'));
const StudentGradesManager = lazy(() => import('./components/StudentGradesManager'));
const PrayerAttendanceManager = lazy(() => import('./components/PrayerAttendanceManager'));
const SholatDhuhurWidget = lazy(() => import('./components/SholatDhuhurWidget'));
`;

code = code.replace(/import React, \{ useState, useEffect \} from 'react';/, lazyImports.trim());
code = code.replace(/import SholatDhuhurWidget from '\.\/components\/SholatDhuhurWidget';/, "");
code = code.replace(/import PrayerAttendanceManager from '\.\/components\/PrayerAttendanceManager';/, "");

fs.writeFileSync('src/App.tsx', code);
