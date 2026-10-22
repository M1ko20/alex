#!/bin/sh
# Builds the site and uploads dist/ to the hosting over FTP:  npm run deploy
#
# The FTP login is read from .deploy.env (not in git, template: .deploy.env.example).
# Nothing on the server is ever deleted, so data/ (what was changed in the admin)
# and photos uploaded in the admin stay as they are.
set -eu
cd "$(dirname "$0")/.."

if [ ! -f .deploy.env ]; then
  echo "Missing .deploy.env — copy .deploy.env.example and fill in the FTP login." >&2
  exit 1
fi
. ./.deploy.env
: "${FTP_HOST:?}" "${FTP_USER:?}" "${FTP_PASSWORD:?}" "${FTP_DIR:?}"

if [ ! -f public/lib/config.php ]; then
  echo "Missing public/lib/config.php (the admin password) — copy config.example.php." >&2
  exit 1
fi

npm run build

LFTP_PASSWORD="$FTP_PASSWORD" lftp --env-password -u "$FTP_USER" "$FTP_HOST" <<EOF
set ftp:ssl-allow yes
set net:max-retries 2
mirror --reverse --verbose --parallel=4 dist "$FTP_DIR"
cd "$FTP_DIR"
chmod 775 data img
EOF

echo "Done: the site is uploaded. Admin: /admin"
