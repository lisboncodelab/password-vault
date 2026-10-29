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

import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withTranslation, Trans } from "react-i18next";
import ResourceIcon from "../../../shared/components/Icons/ResourceIcon";
import { CheckIcon, CopyIcon, FillIcon, UserIcon, UsersIcon } from "../Vault/VaultIcons";

/**
 * One login of the vault list: its icon, name and username, and the actions shown on hover.
 * @param {object} props The row props
 * @returns {JSX.Element}
 */
function VaultResourceRow({ resource, copiedField, onFill, onCopyUsername, onCopyPassword, t }) {
  const username = resource.metadata.username;
  const isShared = resource.personal === false;
  const usernameLabel = copiedField === "username" ? t("Copied") : t("Copy username");
  const passwordLabel = copiedField === "password" ? t("Copied") : t("Copy password");

  return (
    <li className="vault-item">
      <Link className="vault-item-main" to={`/webAccessibleResources/quickaccess/resources/view/${resource.id}`}>
        <span className="vault-resource-icon">
          <ResourceIcon resource={resource} />
        </span>
        <span className="vault-item-text">
          <span className="vault-item-name">
            {resource.metadata.name}
            {isShared && (
              <span className="vault-badge">
                <UsersIcon />
                <Trans>Shared</Trans>
              </span>
            )}
          </span>
          {username && <span className="vault-item-detail">{username}</span>}
        </span>
      </Link>
      <span className="vault-item-actions">
        {onFill && (
          <button
            type="button"
            className="vault-icon-button"
            aria-label={t("Fill this login on the page")}
            data-tooltip={t("Fill this login on the page")}
            onClick={() => onFill(resource)}
          >
            <FillIcon />
          </button>
        )}
        {username && (
          <button
            type="button"
            className={`vault-icon-button ${copiedField === "username" ? "is-copied" : ""}`}
            aria-label={usernameLabel}
            data-tooltip={usernameLabel}
            onClick={() => onCopyUsername(resource)}
          >
            {copiedField === "username" ? <CheckIcon /> : <UserIcon />}
          </button>
        )}
        <button
          type="button"
          className={`vault-icon-button ${copiedField === "password" ? "is-copied" : ""}`}
          aria-label={passwordLabel}
          data-tooltip={passwordLabel}
          onClick={() => onCopyPassword(resource)}
        >
          {copiedField === "password" ? <CheckIcon /> : <CopyIcon />}
        </button>
      </span>
    </li>
  );
}

VaultResourceRow.propTypes = {
  resource: PropTypes.object.isRequired, // The resource
  copiedField: PropTypes.oneOf(["username", "password", null]), // The field just copied from this row
  onFill: PropTypes.func, // Fills the resource in the current tab, only for the logins of this site
  onCopyUsername: PropTypes.func.isRequired, // Copies the username
  onCopyPassword: PropTypes.func.isRequired, // Copies the password
  t: PropTypes.func, // The translation function
};

export default withTranslation("common")(VaultResourceRow);
