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

/**
 * The stroke icon frame shared by every vault icon.
 * @param {object} props The icon children and class
 * @returns {JSX.Element}
 */
function VaultIcon({ children, className = "" }) {
  return (
    <svg className={`vault-icon ${className}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

VaultIcon.propTypes = {
  children: PropTypes.node, // The icon shapes
  className: PropTypes.string, // An extra class
};

/** The magnifier of the search field. */
export const SearchIcon = () => (
  <VaultIcon>
    <circle cx="11" cy="11" r="7" />
    <path d="M16.5 16.5 21 21" />
  </VaultIcon>
);

/** Copies a password. */
export const CopyIcon = () => (
  <VaultIcon>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h8" />
  </VaultIcon>
);

/** Copies a username. */
export const UserIcon = () => (
  <VaultIcon>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </VaultIcon>
);

/** Fills a login into the page. */
export const FillIcon = () => (
  <VaultIcon>
    <path d="M4 12h12M12 8l4 4-4 4M20 5v14" />
  </VaultIcon>
);

/** Creates a login. */
export const PlusIcon = () => (
  <VaultIcon>
    <path d="M12 5v14M5 12h14" />
  </VaultIcon>
);

/** Locks the vault. */
export const LockIcon = () => (
  <VaultIcon>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </VaultIcon>
);

/** Opens the password generator. */
export const KeyIcon = () => (
  <VaultIcon>
    <circle cx="7.5" cy="15.5" r="4.5" />
    <path d="M10.7 12.3 20 3M16.5 6.5l3 3M14 9l2 2" />
  </VaultIcon>
);

/** Opens the filters. */
export const SlidersIcon = () => (
  <VaultIcon>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2" />
    <circle cx="9" cy="17" r="2" />
  </VaultIcon>
);

/** Marks a login shared with others. */
export const UsersIcon = () => (
  <VaultIcon className="vault-icon-small">
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M21.5 20a6.5 6.5 0 0 0-3.5-5.8" />
  </VaultIcon>
);

/** Clears the search. */
export const CloseIcon = () => (
  <VaultIcon>
    <path d="M6 6l12 12M18 6 6 18" />
  </VaultIcon>
);

/** Confirms a copy. */
export const CheckIcon = () => (
  <VaultIcon>
    <path d="m5 12 5 5 9-10" />
  </VaultIcon>
);

/** Opens the vault in a tab. */
export const ExternalIcon = () => (
  <VaultIcon>
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </VaultIcon>
);

/** The smiley of Lisbon Code Lab. */
export const SMILEY_URL = "/webAccessibleResources/lisboncodelab/smiley.png";
