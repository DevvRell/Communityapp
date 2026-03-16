#!/bin/sh
set -e

echo "🔍 Waiting for database to be ready..."
# Use DATABASE_URL if available, otherwise construct from individual vars
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"
fi

# Wait for PostgreSQL to be ready
until pg_isready -h "$POSTGRES_HOST" -p "${POSTGRES_PORT:-5432}" -U "$POSTGRES_USER" 2>/dev/null; do
  echo "⏳ Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"

echo "📦 Generating Prisma Client..."
npx prisma generate

echo "🔄 Running database migrations..."
npx prisma migrate deploy || {
  echo "⚠️  Migration failed, attempting to create initial migration..."
  npx prisma migrate dev --name init --create-only || true
  npx prisma migrate deploy || echo "⚠️  Could not apply migrations. Database may need manual setup."
}

echo "🚀 Starting application..."
exec "$@"
