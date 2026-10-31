#!/bin/sh
# kullanım: sh run1.sh <id> : içerik -> site -> söz dizimi -> shoot -> audit
cd "$(dirname "$0")"
python3 gen_content5.py >/dev/null && node build.mjs "$1" && python3 make_site.py "$1" >/dev/null && node shoot.cjs "$1" 2>&1 | tail -2 && python3 audit.py "$1"
