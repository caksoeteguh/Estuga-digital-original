#!/bin/bash
sed -i '1,2d' src/mockData.ts
sed -i '/if (Array.isArray(value) && value.length > 0 && \["submissions", "results"\]\.includes(key)) {/,/}/d' src/mockData.ts
sed -i '/for (const key of \["submissions", "results"\]) {/,/}/d' src/mockData.ts
