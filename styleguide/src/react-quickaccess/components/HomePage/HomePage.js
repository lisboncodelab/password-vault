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
 * @since         4.1.0
 */

import React from "react";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { Trans, withTranslation } from "react-i18next";
import SpinnerSVG from "../../../img/svg/spinner.svg";
import { withAppContext } from "../../../shared/context/AppContext/AppContext";
import { filterResourcesBySearch, filterResourcesSupportedByQuickAccess } from "../../../shared/utils/filterUtils";
import { withResourcesLocalStorage } from "../../contexts/ResourceLocalStorageContext";
import memoize from "memoize-one";
import { withResourceTypesLocalStorage } from "../../../shared/context/ResourceTypesLocalStorageContext/ResourceTypesLocalStorageContext";
import ResourceTypesCollection from "../../../shared/models/entity/resourceType/resourceTypesCollection";
import { withMetadataTypesSettingsLocalStorage } from "../../../shared/context/MetadataTypesSettingsLocalStorageContext/MetadataTypesSettingsLocalStorageContext";
import MetadataTypesSettingsEntity from "../../../shared/models/entity/metadata/metadataTypesSettingsEntity";
import {
  RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG,
  RESOURCE_TYPE_V5_DEFAULT_SLUG,
} from "../../../shared/models/entity/resourceType/resourceTypeSchemasDefinition";
import CanSuggestService from "../../../shared/services/canSuggestService/canSuggestService";
import MetadataKeysSettingsEntity from "../../../shared/models/entity/metadata/metadataKeysSettingsEntity";
import { withMetadataKeysSettingsLocalStorage } from "../../../shared/context/MetadataKeysSettingsLocalStorageContext/MetadataKeysSettingsLocalStorageContext";
import { sortResourcesByUriMatchingScore } from "../../../shared/utils/sortUtils";
import { withActiveSessionLocalStorage } from "../../../shared/context/ActiveSession/ActiveSessionLocalStorageContext";
import UserActiveSessionEntity from "../../../shared/models/entity/session/userActiveSessionEntity";
import ClipboardServiceWorkerService from "../../../shared/services/serviceWorker/clipboard/clipboardServiceWorkerService";
import SecretServiceWorkerService from "../../../shared/services/serviceWorker/secret/secretServiceWorkerService";
import VaultResourceRow from "./VaultResourceRow";
import { KeyIcon, PlusIcon, SlidersIcon } from "../Vault/VaultIcons";
import { hostOf } from "../../lib/vaultTile";

const SUGGESTED_RESOURCES_LIMIT = 20;
const BROWSED_RESOURCES_LIMIT = 100;
const ALL_RESOURCES_LIMIT = 100;
const COPIED_FEEDBACK_DELAY = 1500;

class HomePage extends React.Component {
  /**
   * Should be true after the first HomePage mount
   * @type {boolean}
   * @private
   */
  static isInitialised = false;

  /**
   * Default constructor
   * @param props The component props
   */
  constructor(props) {
    super(props);
    this.state = this.defaultState;
    this.clipboardServiceWorkerService = new ClipboardServiceWorkerService(props.context.port);
    this.secretServiceWorkerService = new SecretServiceWorkerService(props.context.port, props.activeSession);
    this.initEventHandlers();
  }

  /**
   * Returns the component default state
   * @return {object}
   */
  get defaultState() {
    return {
      activeTabUrl: null,
      usingOnThisTab: false,
      copied: null, // The field just copied, as {resourceId, field}
    };
  }

  /**
   * ComponentDidMount hook.
   * Invoked immediately after component is inserted into the tree
   */
  componentDidMount() {
    // The local storage is updated only the first time the application is open.
    if (!HomePage.isInitialised && this.props.activeSession.isSessionOnline) {
      this.props.resourcesLocalStorageContext.updateLocalStorage();
      HomePage.isInitialised = true;
    }

    // Reset the search and any search history.
    this.props.context.searchHistory = [];
    this.props.context.updateSearch("");

    this.loadActiveTabUrl();
  }

  /**
   * ComponentWillUnmount hook.
   */
  componentWillUnmount() {
    clearTimeout(this.copiedTimeout);
  }

  /**
   * Initialize the component event handlers
   */
  initEventHandlers() {
    this.handleUseOnThisTabClick = this.handleUseOnThisTabClick.bind(this);
    this.handleCopyUsername = this.handleCopyUsername.bind(this);
    this.handleCopyPassword = this.handleCopyPassword.bind(this);
  }

  /**
   * Loads the currently active tab URL, if any, into the state.
   * @returns {Promise<void>}
   */
  async loadActiveTabUrl() {
    try {
      const activeTabUrl = await this.props.context.port.request(
        "passbolt.active-tab.get-url",
        this.props.context.openerTabId,
      );
      this.setState({ activeTabUrl });
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Get the resources for the suggested section.
   * @param {Array} resources The list of resources to filter.
   * @param {string} activeTabUrl the active tab url
   * @return {Array<Object>} The list of filtered resources.
   */
  filterSuggestedResources = memoize((resources, activeTabUrl) => {
    if (!activeTabUrl) {
      return [];
    }

    const suggestedResources = [];

    for (const i in resources) {
      const resource = resources[i];
      if (CanSuggestService.canSuggestUris(activeTabUrl, resource.metadata.uris)) {
        suggestedResources.push(resource);
        if (suggestedResources.length === SUGGESTED_RESOURCES_LIMIT) {
          break;
        }
      }
    }

    return sortResourcesByUriMatchingScore(suggestedResources, activeTabUrl);
  });

  /**
   * Get the resources for the browse section.
   * @param {array} resources The list of resources to filter.
   * @param {string} search the current search to apply
   * @returns {Array<Object>} The list of resources.
   */
  filterSearchedResources = memoize((resources, search) => {
    if (search && resources) {
      return filterResourcesBySearch(resources, search, BROWSED_RESOURCES_LIMIT);
    }
    return [];
  });

  /**
   * Sorts the resources by name for the "All items" section.
   * @param {Array} resources The resources
   * @returns {Array<Object>} A sorted copy
   */
  sortResourcesByName = memoize((resources) =>
    [...resources].sort((first, second) =>
      (first.metadata.name || "").localeCompare(second.metadata.name || "", undefined, { sensitivity: "base" }),
    ),
  );

  /**
   * Handles the click event of the button "Use on this tab".
   * @returns {Promise<void>}
   */
  async handleUseOnThisTabClick(resource) {
    this.setState({ usingOnThisTab: true });
    try {
      await this.props.context.port.request(
        "passbolt.quickaccess.use-resource-on-current-tab",
        resource.id,
        this.props.context.openerTabId,
      );
      await this.props.context.closeWindow();
    } catch (error) {
      if (error && error.name === "UserAbortsOperationError") {
        this.setState({ usingOnThisTab: false });
      } else {
        console.error("An error occured", error);
        this.setState({
          usingOnThisTab: false,
          useOnThisTabError: this.props.t(
            "Unable to use the password on this page. Copy and paste the information instead.",
          ),
        });
      }
    }
  }

  /**
   * Copies a resource's username.
   * @param {object} resource The resource
   * @returns {Promise<void>}
   */
  async handleCopyUsername(resource) {
    await this.clipboardServiceWorkerService.copy(resource.metadata.username);
    this.showCopied(resource.id, "username");
  }

  /**
   * Decrypts a resource's password and copies it until the clipboard is flushed.
   * @param {object} resource The resource
   * @returns {Promise<void>}
   */
  async handleCopyPassword(resource) {
    let plaintextSecretDto;
    try {
      plaintextSecretDto = await this.secretServiceWorkerService.findByResourceId(resource.id);
    } catch (error) {
      if (error?.name !== "UserAbortsOperationError") {
        console.error(error);
      }
      return;
    }
    if (!plaintextSecretDto?.password?.length) {
      return;
    }
    await this.clipboardServiceWorkerService.copyTemporarily(plaintextSecretDto.password);
    this.showCopied(resource.id, "password");
  }

  /**
   * Marks a field as copied for a moment.
   * @param {string} resourceId The resource id
   * @param {string} field "username" or "password"
   */
  showCopied(resourceId, field) {
    clearTimeout(this.copiedTimeout);
    this.setState({ copied: { resourceId, field } });
    this.copiedTimeout = setTimeout(() => this.setState({ copied: null }), COPIED_FEEDBACK_DELAY);
  }

  /**
   * Get the resources the quick access can list
   * @return {Array}
   */
  get resourcesSupportedByQuickAccess() {
    return filterResourcesSupportedByQuickAccess(this.props.resources, this.props.resourceTypes);
  }

  /**
   * Has metadata types settings
   * @returns {boolean}
   */
  hasMetadataTypesSettings() {
    return Boolean(this.props.metadataTypeSettings);
  }

  /**
   * Can create password
   * @returns {boolean}
   */
  canCreatePassword() {
    // Creating a resource requires the server, the action is not offered while in an offline session.
    if (!this.props.activeSession?.isSessionOnline) {
      return false;
    }
    if (this.props.metadataTypeSettings.isDefaultResourceTypeV5) {
      return this.props.resourceTypes?.hasOneWithSlug(RESOURCE_TYPE_V5_DEFAULT_SLUG);
    } else if (this.props.metadataTypeSettings.isDefaultResourceTypeV4) {
      return this.props.resourceTypes?.hasOneWithSlug(RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG);
    } else {
      return false;
    }
  }

  /**
   * User has missing keys
   * @return {boolean}
   */
  get userHasMissingKeys() {
    return this.props.context.loggedInUser.missing_metadata_key_ids?.length > 0;
  }

  /**
   * Should display action aborted missing metadata keys
   * @return {boolean}
   */
  get shouldDisplayActionAbortedMissingMetadataKeys() {
    return (
      this.props.metadataTypeSettings.isDefaultResourceTypeV5 &&
      this.userHasMissingKeys &&
      !this.props.metadataKeysSettings?.allowUsageOfPersonalKeys
    );
  }

  /**
   * Renders the rows of a list of resources.
   * @param {Array<Object>} resources The resources
   * @param {boolean} canFill Whether the rows offer to fill the current tab
   * @returns {JSX.Element[]}
   */
  renderRows(resources, canFill) {
    return resources.map((resource) => (
      <VaultResourceRow
        key={resource.id}
        resource={resource}
        copiedField={this.state.copied?.resourceId === resource.id ? this.state.copied.field : null}
        onFill={canFill ? this.handleUseOnThisTabClick : null}
        onCopyUsername={this.handleCopyUsername}
        onCopyPassword={this.handleCopyPassword}
      />
    ));
  }

  /**
   * Renders a titled section of resources, or its empty text.
   * @param {object} section The section: title, count, marker, resources, canFill and emptyText
   * @returns {JSX.Element}
   */
  renderSection({ title, count, hasSiteMarker = false, resources, canFill = false, emptyText }) {
    return (
      <section className="vault-section">
        <h2 className="vault-section-label">
          {hasSiteMarker && <i className="vault-site-dot" />}
          {title}
          <span className="vault-section-count">{count}</span>
        </h2>
        {resources.length === 0 && <p className="vault-empty">{emptyText}</p>}
        {resources.length > 0 && <ul className="vault-items">{this.renderRows(resources, canFill)}</ul>}
      </section>
    );
  }

  /**
   * Renders the loading state of the list.
   * @returns {JSX.Element}
   */
  renderLoading() {
    return (
      <div className="vault-loading">
        <SpinnerSVG />
        <p>
          <Trans>Retrieving your passwords</Trans>
        </p>
      </div>
    );
  }

  /**
   * Renders the list sections: the search results, or this site's logins then every login.
   * @param {Array<Object>} resources The resources the quick access can list
   * @returns {JSX.Element}
   */
  renderSections(resources) {
    const t = this.props.t;
    const search = this.props.context.search;
    if (search?.length > 0) {
      const results = this.filterSearchedResources(resources, search);
      return this.renderSection({
        title: t("Results"),
        count: results.length,
        resources: results,
        emptyText: t("No result match your search. Try with another search term."),
      });
    }
    const suggestedResources = this.filterSuggestedResources(resources, this.state.activeTabUrl);
    return (
      <>
        {this.renderSection({
          title: t("On this site"),
          count: hostOf(this.state.activeTabUrl),
          hasSiteMarker: true,
          resources: suggestedResources,
          canFill: true,
          emptyText: t("No logins for this site yet."),
        })}
        {this.renderSection({
          title: t("All items"),
          count: resources.length,
          resources: this.sortResourcesByName(resources).slice(0, ALL_RESOURCES_LIMIT),
          emptyText: t("Your vault is empty."),
        })}
      </>
    );
  }

  /**
   * Renders the footer: new login, the password generator and the filters.
   * @returns {JSX.Element}
   */
  renderFooter() {
    const canCreate = this.hasMetadataTypesSettings() && this.canCreatePassword();
    const createPath = this.shouldDisplayActionAbortedMissingMetadataKeys
      ? "action-aborted-missing-metadata-keys"
      : "create";
    return (
      <footer className="vault-foot">
        {canCreate && (
          <Link
            to={`/webAccessibleResources/quickaccess/resources/${createPath}`}
            id="popupAction"
            className="vault-button-primary"
            role="button"
          >
            <PlusIcon />
            <Trans>New login</Trans>
          </Link>
        )}
        <Link
          to="/webAccessibleResources/quickaccess/resources/generate-password"
          className="vault-icon-button"
          title={this.props.t("Password generator")}
        >
          <KeyIcon />
        </Link>
        <Link
          to="/webAccessibleResources/quickaccess/more-filters"
          className="vault-icon-button"
          title={this.props.t("Filters")}
        >
          <SlidersIcon />
        </Link>
      </footer>
    );
  }

  /**
   * Component renderer.
   * @returns {JSX}
   */
  render() {
    const isReady = this.props.resources !== null && this.props.resourceTypes != null;

    return (
      <div className="vault-home">
        <div className="vault-list">
          {!isReady && this.renderLoading()}
          {isReady && this.renderSections(this.resourcesSupportedByQuickAccess)}
        </div>
        {this.state.useOnThisTabError && <div className="vault-error">{this.state.useOnThisTabError}</div>}
        {this.renderFooter()}
      </div>
    );
  }
}

HomePage.propTypes = {
  context: PropTypes.any, // The application context
  resources: PropTypes.array, // The resources from the local storage
  resourceTypes: PropTypes.instanceOf(ResourceTypesCollection), // The resource types collection
  resourcesLocalStorageContext: PropTypes.object, // The resources local storage context
  metadataTypeSettings: PropTypes.instanceOf(MetadataTypesSettingsEntity), // The metadata type settings
  metadataKeysSettings: PropTypes.instanceOf(MetadataKeysSettingsEntity), // The metadata key settings
  activeSession: PropTypes.instanceOf(UserActiveSessionEntity), // The user active session
  t: PropTypes.func, // The translation function
};

export default withActiveSessionLocalStorage(
  withAppContext(
    withRouter(
      withResourceTypesLocalStorage(
        withResourcesLocalStorage(
          withMetadataTypesSettingsLocalStorage(
            withMetadataKeysSettingsLocalStorage(withTranslation("common")(HomePage)),
          ),
        ),
      ),
    ),
  ),
);
