#!/usr/bin/env bash
# furkankale.com'u Cloudflare Workers statik varlık olarak yayınlar.
# Kullanım: bash deploy/publish.sh   (repo kökünden)
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf dist && mkdir dist
cp -R index.html favicon.ico _redirects assets tilely sandly roboblok servolab pinharita dist/
cd deploy && npx --yes wrangler@latest deploy
