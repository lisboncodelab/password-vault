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

import { hostOf } from "./urlHost";

export const NEVER_SAVE_SITES_STORAGE_KEY = "lisboncodelab_never_save_hosts";

/**
 * Adds the host of a URL to the sites the vault never offers to save a login for.
 * @param {object} storage The browser storage
 * @param {string} url The URL of the site
 * @returns {Promise<void>}
 */
export async function addNeverSaveSite(storage, url) {
  const host = hostOf(url);
  if (!host) {
    return;
  }
  const stored = await storage.local.get([NEVER_SAVE_SITES_STORAGE_KEY]);
  const hosts = stored[NEVER_SAVE_SITES_STORAGE_KEY] || [];
  if (hosts.includes(host)) {
    return;
  }
  await storage.local.set({ [NEVER_SAVE_SITES_STORAGE_KEY]: [...hosts, host] });
}
