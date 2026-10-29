/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.4.0
 */

import ResourceInProgressCacheService from "../../service/cache/resourceInProgressCache.service";
import { QuickAccessService } from "../../service/ui/quickAccess.service";
import ExternalResourceEntity from "../../model/entity/resource/external/externalResourceEntity";
import GetActiveAccountService from "../../service/account/getActiveAccountService";
import BuildApiClientOptionsService from "../../service/account/buildApiClientOptionsService";
import GetOrFindActiveSessionService from "../../service/activeSession/getOrFindActiveSessionService";
import GetOrFindResourcesService from "../../service/resource/getOrFindResourcesService";
import GetOrFindOfflineResourcesService from "../../service/resource/getOrFindOfflineResourcesService";

/**
 * Controller related to the in-form call-to-action
 */
class WebIntegrationController {
  /**
   * WebIntegrationController constructor
   * @param {Worker} worker
   */
  constructor(worker) {
    this.worker = worker;
  }

  /**
   * Proposes to save the credentials submitted in the page, unless they are already saved
   * @param {{name: string, username: string, password: string, url: string}} resourceToSave The submitted credentials
   * @return {Promise<void>}
   */
  async autosave(resourceToSave) {
    if (await this.isAlreadySaved(resourceToSave)) {
      return;
    }
    const queryParameters = [{ name: "feature", value: "autosave-credentials" }];
    // Request username and password
    const url = new URL(resourceToSave.url);
    const resourceDto = {
      name: resourceToSave.name,
      uris: [`${url.protocol}//${url.host}${url.pathname}`],
      username: resourceToSave.username,
      secret_clear: resourceToSave.password,
    };
    const resource = new ExternalResourceEntity(resourceDto);
    await ResourceInProgressCacheService.set(resource);
    QuickAccessService.open(queryParameters);
  }

  /**
   * Tells whether a password resource suggested for the page already holds the submitted username
   * @param {{username: string, url: string}} resourceToSave The submitted credentials
   * @return {Promise<boolean>} false when the user is signed out or the resources cannot be read
   */
  async isAlreadySaved(resourceToSave) {
    try {
      const account = await GetActiveAccountService.get();
      const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
      const activeSession = await new GetOrFindActiveSessionService(account, apiClientOptions).getOrFind();
      if (!activeSession.isAuthenticated) {
        return false;
      }
      const resourcesService = activeSession.isSessionOnline
        ? new GetOrFindResourcesService(account, apiClientOptions)
        : new GetOrFindOfflineResourcesService(account, apiClientOptions);
      const suggestedResources = await resourcesService.getOrFindSuggested(resourceToSave.url, "password");
      const submittedUsername = this.normalizeUsername(resourceToSave.username);
      return suggestedResources.resources.some(
        (resource) => this.normalizeUsername(resource.metadata?.username) === submittedUsername,
      );
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  /**
   * Normalizes a username for comparison
   * @param {string|null|undefined} username The username
   * @return {string} The trimmed lower case username
   */
  normalizeUsername(username) {
    return (username || "").trim().toLowerCase();
  }
}

export default WebIntegrationController;
