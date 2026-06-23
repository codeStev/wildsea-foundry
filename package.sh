#!/usr/bin/env bash
# Build a Foundry-installable release zip (system.json at the zip root).
# Usage: ./package.sh   ->   dist/wildsea.zip
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

VERSION="$(grep -oP '"version"\s*:\s*"\K[^"]+' system.json)"
OUT="dist/wildsea.zip"

rm -rf dist
mkdir -p dist

# Exclude dev-only files and VCS/build cruft from the shipped system.
zip -r -q "$OUT" . \
  -x '.git/*' \
  -x '.gitattributes' \
  -x '.gitlab-ci.yml' \
  -x 'deploy.sh' \
  -x 'package.sh' \
  -x 'dist/*' \
  -x 'node_modules/*'

echo "Built $OUT (version $VERSION)"
echo "Attach BOTH this zip AND system.json as assets on the GitHub release tagged v$VERSION."
