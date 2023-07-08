# Contributing
We welcome contributions from the community through pull requests. 

## Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a 
   build. Its a good idea to do `npm ci` after you checkout.
2. We follow [SemVer](https://semver.org/) for versioning, however [@github-actions[bot]](https://github.com/features/actions) will automatically bump the version for you.
3. After your pull request is submitted, if it passes the CI workflow, a maintainer will sign off on the pull request. If it is accepted, it will be merged into the `next` branch. If it is rejected, the maintainer will explain why.
4. Once your pull request is merged into the `next` branch, it is now in beta. The next time next merges into master, it will be released to production (stable).
