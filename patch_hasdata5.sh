#!/bin/bash
sed -i '/if (result.status !==/a \
    let hasData = false;' src/mockData.ts
