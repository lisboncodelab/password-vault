#!/usr/bin/env bash
# Copies the fork's styleguide source over the published one before a build.
set -euo pipefail
extension_directory="$(cd "$(dirname "$0")/.." && pwd)"
styleguide_directory="$(cd "$extension_directory/../styleguide" && pwd)"
rsync -a --delete "$styleguide_directory/src/" "$extension_directory/node_modules/passbolt-styleguide/src/"
echo "Using the styleguide from $styleguide_directory"
