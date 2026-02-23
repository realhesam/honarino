#!/bin/bash
# restore_db.sh
# Usage: ./restore_db.sh <database_name> <user> <dump_file> <namespace> <pod_name>

set -e

DB_NAME="$1"
DB_USER="$2"
DUMP_FILE="$3"
NAMESPACE="$4"
POD_NAME="$5"

if [[ -z "$DB_NAME" || -z "$DB_USER" || -z "$DUMP_FILE" || -z "$NAMESPACE" || -z "$POD_NAME" ]]; then
  echo "Usage: $0 <database_name> <user> <dump_file> <namespace> <pod_name>"
  exit 1
fi

echo "⚡ Terminating active connections to $DB_NAME..."
kubectl exec -i "$POD_NAME" -n "$NAMESPACE" -- psql -U "$DB_USER" -d postgres -c "
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = '$DB_NAME'
AND pid <> pg_backend_pid();
"

echo "🗑 Dropping database $DB_NAME..."
kubectl exec -i "$POD_NAME" -n "$NAMESPACE" -- psql -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"

echo "✅ Creating database $DB_NAME..."
kubectl exec -i "$POD_NAME" -n "$NAMESPACE" -- psql -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;"

echo "📥 Restoring dump from $DUMP_FILE..."
cat "$DUMP_FILE" | kubectl exec -i "$POD_NAME" -n "$NAMESPACE" -- psql -U "$DB_USER" -d "$DB_NAME"

echo "🎉 Restore completed successfully!"