#!/bin/bash
sed -i 's/            if (result.data) {/    let hasData = false;\n    if (result.data) {/' src/mockData.ts
sed -i 's/    let hasData = false;//' src/mockData.ts
