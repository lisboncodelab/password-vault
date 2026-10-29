<p align="center">
  <a href="https://lisboncodelab.com">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="docs/lisboncodelab-logo-white.png">
      <img src="docs/lisboncodelab-logo.png" alt="Lisbon Code Lab" width="360">
    </picture>
  </a>
</p>

# Password Vault by Lisbon Code Lab

**An alternative browser extension for Passbolt servers.** Same server, same end-to-end encryption, an extension that is quicker to use day to day.

Password Vault is built on Passbolt's open-source browser extension, so it talks to your Passbolt server exactly as the official one does. Nothing changes on the server: install it, sign in with your existing account, and keep sharing passwords with your team.

## What it does differently

- **Offers to save every login.** Sign in anywhere with a password Password Vault doesn't know, and it asks whether to save it. The official extension only asks after it generated the password itself.
- **Stays quiet when it should.** No prompt for a login that's already in your vault, and **Never for this site** stops it asking on sites you don't want saved.
- **The right password first.** The popup opens on the logins for the site you're on, then every item sorted by name, with a search at the top.
- **Fill or copy in one click.** Fill a login into the page, or copy the username or password, straight from the list. A copied password is cleared from the clipboard afterwards.
- **Every icon says what it does.** Hover any icon for an instant label.
- **Your icons and colours are kept.** Items show the icon and colour you chose for them in Passbolt.
- **A calm dark look** in Lisbon Code Lab's colours, with its font bundled in the extension, so opening the vault never calls a font server.

## Works with

A Passbolt server, Community Edition. It is built on Passbolt's extension 5.17.1 and used with Passbolt CE 5.17. Passbolt Pro has not been tried.

Chrome, Brave and Edge, loaded from the release zip. It is not in the Chrome Web Store yet, and there are no Firefox or Safari builds yet.

## Install

1. Download `password-vault-chrome-<version>.zip` from the [latest release](../../releases/latest) and unzip it.
2. Open `chrome://extensions` (or `brave://extensions`, `edge://extensions`), switch on **Developer mode**, click **Load unpacked** and choose the unzipped folder.
3. Turn off the official Passbolt extension, so only one extension handles your Passbolt pages.
4. The first time, connect your account: each extension keeps its own copy of your key, so recover your account into Password Vault. Open `https://<your-passbolt-server>/users/recover`, enter your email, open the link you receive, then give your recovery kit (the private key file you downloaded at setup) and your passphrase.

New to Passbolt? An invitation link from your administrator works too: open it with Password Vault installed and follow the setup.

## Update

Download the new zip, replace the contents of the folder you loaded, and click the reload arrow on Password Vault in `chrome://extensions`. The extension id is fixed (`lnifempdccdobjgjpppjlbnkiccibpjl`), so you stay signed in.

## Build it yourself

You need Node.js 22 or later.

```bash
cd browser-extension && npm ci && cd ..
scripts/build-release.sh 5.17.1-lcl.1
```

The zip lands in `dist/`. To try a build without zipping it, load `browser-extension/build/all` as an unpacked extension.

The repository holds two parts:

- `browser-extension/`: Passbolt's browser extension, with Password Vault's changes.
- `styleguide/`: Passbolt's styleguide, which holds the popup, the menu under login fields and the save prompt, with Password Vault's changes.

The build copies `styleguide/src` over the published styleguide package (`browser-extension/scripts/use-local-styleguide.sh`).

## Licence and trademarks

Password Vault is free software under the [GNU Affero General Public License v3.0](LICENSE), like the Passbolt code it is based on. It is a modified version of Passbolt's browser extension v5.17.1 and styleguide v5.17.2, changed by Lisbon Code Lab from October 2026. The first commit of this repository imports Passbolt's code unmodified, and every later commit is a change by Lisbon Code Lab. Passbolt SA's copyright notices are kept in the files they wrote.

Passbolt is a trademark of Passbolt SA. Password Vault is an independent project by Lisbon Code Lab and is not affiliated with, endorsed by or supported by Passbolt SA.

The Instrument Sans font is bundled under the SIL Open Font License 1.1 (`browser-extension/src/all/webAccessibleResources/lisboncodelab/fonts/OFL.txt`).

Made by [Lisbon Code Lab](https://lisboncodelab.com).
