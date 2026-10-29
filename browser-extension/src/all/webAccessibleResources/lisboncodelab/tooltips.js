/**
 * Lisbon Code Lab - Password Vault, based on Passbolt
 * Copyright (c) 2026 Lisbon Code Lab
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * Shows an instant tooltip for every element that has a title or a data-tooltip.
 *
 * @copyright     Copyright (c) 2026 Lisbon Code Lab
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 */

(function () {
  const GAP = 6;
  const EDGE = 8;
  let tooltip = null;

  /**
   * Moves an element's title into data-tooltip, keeping it as the accessible name.
   * @param {Element} element The element carrying a title
   */
  function adoptTitle(element) {
    const title = element.getAttribute("title");
    if (!title) {
      return;
    }
    element.setAttribute("data-tooltip", title);
    if (!element.getAttribute("aria-label") && !element.textContent.trim()) {
      element.setAttribute("aria-label", title);
    }
    element.removeAttribute("title");
  }

  /**
   * Adopts the titles of an element and of everything inside it.
   * @param {Node} root The element to scan
   */
  function adoptTitlesWithin(root) {
    if (root.nodeType !== Node.ELEMENT_NODE) {
      return;
    }
    if (root.hasAttribute("title")) {
      adoptTitle(root);
    }
    root.querySelectorAll("[title]").forEach(adoptTitle);
  }

  /**
   * Places the tooltip under the target, or above it when there is no room, inside the window.
   * @param {Element} target The element the tooltip describes
   */
  function placeTooltip(target) {
    const targetBox = target.getBoundingClientRect();
    const tooltipBox = tooltip.getBoundingClientRect();
    const centredLeft = targetBox.left + targetBox.width / 2 - tooltipBox.width / 2;
    const left = Math.min(Math.max(EDGE, centredLeft), window.innerWidth - tooltipBox.width - EDGE);
    const hasRoomBelow = targetBox.bottom + GAP + tooltipBox.height <= window.innerHeight - EDGE;
    const top = hasRoomBelow ? targetBox.bottom + GAP : targetBox.top - GAP - tooltipBox.height;
    tooltip.style.left = `${Math.round(left)}px`;
    tooltip.style.top = `${Math.round(Math.max(EDGE, top))}px`;
  }

  /**
   * Shows the tooltip of the element under the pointer or the focus.
   * @param {Event} event The mouseover or focusin event
   */
  function showTooltip(event) {
    const target = event.target.closest?.("[data-tooltip]");
    if (!target) {
      return;
    }
    tooltip.textContent = target.getAttribute("data-tooltip");
    tooltip.hidden = false;
    placeTooltip(target);
  }

  /**
   * Hides the tooltip when the pointer or the focus leaves its element.
   * @param {Event} event The mouseout or focusout event
   */
  function hideTooltip(event) {
    const target = event.target.closest?.("[data-tooltip]");
    if (target && target.contains(event.relatedTarget)) {
      return;
    }
    tooltip.hidden = true;
  }

  /**
   * Creates the tooltip element and starts watching the page.
   */
  function start() {
    tooltip = document.createElement("div");
    tooltip.className = "vault-tooltip";
    tooltip.setAttribute("role", "tooltip");
    tooltip.hidden = true;
    document.body.appendChild(tooltip);

    adoptTitlesWithin(document.body);
    new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes") {
          adoptTitle(mutation.target);
          return;
        }
        mutation.addedNodes.forEach(adoptTitlesWithin);
      });
    }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["title"] });

    document.addEventListener("mouseover", showTooltip);
    document.addEventListener("focusin", showTooltip);
    document.addEventListener("mouseout", hideTooltip);
    document.addEventListener("focusout", hideTooltip);
    document.addEventListener("click", () => {
      tooltip.hidden = true;
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
