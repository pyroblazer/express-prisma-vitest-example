#!/usr/bin/env bash
# scripts/run-integration.sh

DIR="$(cd "$(dirname "$0")" && pwd)"
source $DIR/setenv.sh
docker-compose up -d
echo '🟡 - Waiting for database to be ready...'
$DIR/wait-for-it.sh "${DATABASE_URL}" -- echo '🟢 - Database is ready!'
pnpm prisma migrate dev --name init
if [ "$#" -eq  "0" ]
  then
    pnpm vitest -c ./vitest.config.integration.ts
else
    pnpm vitest -c ./vitest.config.integration.ts --ui
fi