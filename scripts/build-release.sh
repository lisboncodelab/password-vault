#!/usr/bin/env bash
# Builds the Chrome extension with the fork's styleguide and zips it into dist/ for a release.
set -euo pipefail

version="${1:?Usage: scripts/build-release.sh <version>, for example 5.17.1-lcl.1}"
root_directory="$(cd "$(dirname "$0")/.." && pwd)"
extension_directory="$root_directory/browser-extension"
archive="$root_directory/dist/password-vault-chrome-$version.zip"

cd "$extension_directory"
scripts/use-local-styleguide.sh
npm run build:chromium-mv3

mkdir -p "$root_directory/dist"
rm -f "$archive"
(cd build/all && zip -qr "$archive" .)
echo "Built $archive"
