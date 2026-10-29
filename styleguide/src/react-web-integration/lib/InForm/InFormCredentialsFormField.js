/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2021 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2021 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.3.0
 */

import { SUBMIT_BUTTON_SELECTOR } from "./OrphanDictionary";

/**
 * An InFormCredentialsFormField is represented by a DOM element identified as credentials form DOM element which once filled
 * can be auto-saved by Passbolt
 */
class InFormCredentialsFormField {
  /**
   * Default constructor
   * @param {Element} field The DOM field which represents the field
   * @param {Partial} options The option
   * @param {Element} options.usernameField The username DOM field into the form
   * @param {Element} options.passwordField The password DOM field into the form
   * @param {Element} options.otpField The OTP field, if any
   * @param {Array<Element>} options.confirmPasswordFields The password confirmation fields
   * @param {boolean} options.isPseudoForm true when the container was synthesized from orphan fields
   */
  constructor(
    field,
    { usernameField, passwordField, isPseudoForm = false, otpField, confirmPasswordFields = [] } = {},
  ) {
    /** The field to which the in-form is attached */
    this.field = field;
    /** The username field attached to the form */
    this.usernameField = usernameField;
    /** The password field attached to the form */
    this.passwordField = passwordField;
    /** Flag telling if the container was created from orphan fields (i.e. not a real form) */
    this.isPseudoForm = isPseudoForm;
    /** The OTP field attached to the form */
    this.otpField = otpField;
    /** The password confirmation fields attached to the form */
    this.confirmPasswordFields = confirmPasswordFields;
    /** Flag telling whether the form submission has already been performed (and avoid twice autosave call) */
    this.hasAlreadySubmitted = false;

    this.bindCallbacks();
  }

  /**
   * Returns the submit button (if exists)
   */
  get submitButton() {
    return this.field.querySelector(SUBMIT_BUTTON_SELECTOR);
  }

  /**
   * Binds methods callbacks
   */
  bindCallbacks() {
    this.handleAutoSaveEvent = this.handleAutoSaveEvent.bind(this);
    this.handlePasswordKeydown = this.handlePasswordKeydown.bind(this);
    this.handlePseudoFormClick = this.handlePseudoFormClick.bind(this);
    this.autosave = this.autosave.bind(this);
    this.destroy = this.destroy.bind(this);
  }

  /**
   * Whenever one must propose auto-save on the current credentials form
   */
  handleAutoSaveEvent() {
    this.field.addEventListener("submit", this.autosave);
    this.submitButton?.addEventListener("click", this.autosave);
    this.passwordField?.addEventListener("keydown", this.handlePasswordKeydown);
    if (this.isPseudoForm) {
      this.field.addEventListener("click", this.handlePseudoFormClick);
    }
  }

  /**
   * Proposes the auto-save when the user presses Enter in the password field
   * @param {KeyboardEvent} event The keydown event
   */
  handlePasswordKeydown(event) {
    if (event.key !== "Enter") {
      return;
    }
    this.autosave();
  }

  /**
   * Proposes the auto-save when the user clicks a button of a container that is not a real form
   * @param {MouseEvent} event The click event
   */
  handlePseudoFormClick(event) {
    const button = event.target?.closest?.("button, [role='button'], input[type='button'], input[type='submit']");
    if (!button) {
      return;
    }
    this.autosave();
  }

  /** Autosave current credentials in the page */
  autosave() {
    const hasPassword = Boolean(this.passwordField?.value?.trim());
    if (this.hasAlreadySubmitted || !hasPassword) {
      return;
    }
    this.hasAlreadySubmitted = true;
    port.emit("passbolt.web-integration.autosave", {
      name: document.title,
      username: this.usernameField?.value || "",
      password: this.passwordField.value,
      url: document.URL,
    });
  }

  /** DESTROY */

  /**
   * Remove all listener to clean the page and avoid issue on extension update
   */
  destroy() {
    this.field.removeEventListener("submit", this.autosave);
    this.submitButton?.removeEventListener("click", this.autosave);
    this.passwordField?.removeEventListener("keydown", this.handlePasswordKeydown);
    this.field.removeEventListener("click", this.handlePseudoFormClick);
  }
}

export default InFormCredentialsFormField;
