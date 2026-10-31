#!/bin/sh
# Sketch'lerin C++ söz dizimini sahte başlıklarla denetler (gerçek AVR derleyicisi gerekmez).
# Kullanım: sh syntax_check.sh [sketches/x.ino ...]   (argüman yoksa hepsi)
cd "$(dirname "$0")"
files="$@"; [ -z "$files" ] && files=$(ls sketches/*.ino)
fail=0
for f in $files; do
  if g++ -fsyntax-only -Wall -Wextra -Wno-unused-parameter -x c++ -std=gnu++11 -I stub -include Arduino.h "$f" 2>out/syntax.err; then echo "ok   $f"; else echo "HATA $f"; cat out/syntax.err; fail=1; fi
done
exit $fail
