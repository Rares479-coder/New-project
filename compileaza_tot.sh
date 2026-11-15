#!/bin/bash
# Compileaza toate proiectele; executabilele ajung in folderul build/
set -e
mkdir -p build
for f in */*.cpp; do
    nume=$(basename "$f" .cpp)
    echo "Compilez $f"
    g++ -std=c++17 -Wall -Wextra -O2 -o "build/$nume" "$f"
done
echo "Gata! Executabilele sunt in build/"
