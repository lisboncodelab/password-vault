/**
 * Lisbon Code Lab - Password Vault, based on Passbolt
 * Copyright (c) 2026 Lisbon Code Lab
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2026 Lisbon Code Lab
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 */

const TILE_COLORS = ["#3c6e71", "#b5654a", "#4a7bb5", "#6b6a65", "#5b8c5a", "#7a5c99", "#a8794d"];

/**
 * Returns the letter shown on a resource's tile.
 * @param {string} name The resource name
 * @returns {string} The first letter in upper case, or "?" for an empty name
 */
export function tileLetter(name) {
  const letter = (name || "").trim().charAt(0);
  if (!letter) {
    return "?";
  }
  return letter.toUpperCase();
}

/**
 * Returns the colour of a resource's tile, always the same for the same name.
 * @param {string} name The resource name
 * @returns {string} A hexadecimal colour
 */
export function tileColor(name) {
  let hash = 0;
  for (const character of name || "") {
    hash = (hash * 31 + character.codePointAt(0)) >>> 0;
  }
  return TILE_COLORS[hash % TILE_COLORS.length];
}

/**
 * Returns the host of a URL, for the "On this site" label.
 * @param {string|null} url The URL
 * @returns {string} The host, or an empty string when the URL cannot be read
 */
export function hostOf(url) {
  try {
    return new URL(url).hostname;
  } catch (error) {
    return "";
  }
}
