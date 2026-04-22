#!/bin/bash
cd /home/user/employee-evaluation-system
export NODE_ENV=production
export DATABASE_URL="file:./prisma/dev.db"
export NEXTAUTH_SECRET="employee-eval-system-secret-key-2024-production"
export NEXTAUTH_URL="http://0.0.0.0:3000"
npx next start -H 0.0.0.0 -p 3000 &
