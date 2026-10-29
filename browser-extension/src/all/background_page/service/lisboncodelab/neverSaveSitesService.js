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

import { NEVER_SAVE_SITES_STORAGE_KEY } from "passbolt-styleguide/src/react-quickaccess/lib/neverSaveSites";

/**
 * Reads the sites the user asked the vault never to offer saving a login for.
 */
class NeverSaveSitesService {
  /**
   * Tells whether the vault must not offer to save a login on this URL.
   * @param {string} url The URL of the page
   * @returns {Promise<boolean>}
   */
  static async isNeverSaveSite(url) {
    let host;
    try {
      host = new URL(url).hostname;
    } catch (error) {
      return false;
    }
    const stored = await browser.storage.local.get([NEVER_SAVE_SITES_STORAGE_KEY]);
    const hosts = stored[NEVER_SAVE_SITES_STORAGE_KEY] || [];
    return hosts.includes(host);
  }
}

export default NeverSaveSitesService;
