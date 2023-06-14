# EmberVPN Client
[![Latest version](https://img.shields.io/github/release/EmberVPN/client?include_prereleases=&sort=semver&color=blue&label=Latest%20Version)](https://github.com/EmberVPN/client/releases/) ![Total Downloads](https://img.shields.io/badge/dynamic/json?label=Total+Downloads&query=%24.downloadCount&url=https%3A%2F%2Fapi.embervpn.org%2Fv2%2Fember%2Fdownloads)

[![Continuous Integration](https://github.com/EmberVPN/client/actions/workflows/ci.yml/badge.svg)](https://github.com/EmberVPN/client/actions/workflows/ci.yml)
[![Continuous Deployment](https://github.com/EmberVPN/client/actions/workflows/cd.yml/badge.svg)](https://github.com/EmberVPN/client/actions/workflows/cd.yml)
```bash
git clone -b next --recurse-submodules https://github.com/EmberVPN/client.git embervpn-client
```

### External dependencies
These are required by Ember VPN to function properly. If you don't have them installed, Ember VPN will install them for you.
- [OpenVPN/openvpn](https://github.com/OpenVPN/openvpn)
- [PowerShell/Win32-OpenSSH](https://github.com/PowerShell/Win32-OpenSSH) (windows)

---

# 📦 Development

## Prerequisites
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en/) (v18+)

You're also going to need an IDE and [Ember VPN account](https://embervpn.org/authorize/create). For an IDE, we recommend [Visual Studio Code](https://code.visualstudio.com/).

## Workspace Setup
1. Read the [Developer Guidelines](./CONTRIBUTING.md).

1. Clone the `next` branch.
```bash
git clone -b next --recurse-submodules https://github.com/EmberVPN/client.git
```
2. Install dependencies.
```bash
npm install
```
3. Run the application (dev mode).
```bash
npm run dev
```

## Building
1. Build the application for a specific platform.
```bash
npm run build:win # win32
npm run build:mac # darwin (unsupported)
npm run build:linux # linux (unsupported)
```
The built application binaries will be located in the `dist` folder.



