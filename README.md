# PR Custom Review

This is a GitHub Action created for complex pull request approval scenarios which are not currently supported by GitHub's [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches#about-branch-protection-rules). It might extend or even completely replace the [Require pull request reviews before merging](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches#require-pull-request-reviews-before-merging) setting.

## How it works

Upon receiving [pull_request](https://docs.github.com/en/actions/learn-github-actions/events-that-trigger-workflows#pull_request) and [pull_request_review](https://docs.github.com/en/actions/learn-github-actions/events-that-trigger-workflows#pull_request_review) events (to be enabled via [workflow configuration](#workflow-configuration)), this action evaluates all rules described in the [configuration file](#action-configuration). Currently two types of rules are supported:

- `pr_diff` which matches a rule based on the PR's diff content
- `pr_files` which matches a rule based on paths/files changed in the PR

If a given rule is matched and its approval count is not met, then reviews will be requested from the missing users/teams for that rule and a failed commit status will be set for the PR; this status can be made a requirement through branch protection rules in order to block the PR from being merged until all conditions are passing (see [GitHub repository configuration](#github-repository-configuration)).

This action has one built-in check which reacts to changes in lines of code containing the `🔒` emoji or any line directly below it. Any further checks should be enabled through [configuration](#action-configuration).

### High level flow chart
![High level flow chart](./img/pr-custom-review-flowchart.png)

## Configuration

### Action configuration  <a name="action-configuration"></a>

Configuration is done through a `pr-custom-review-config.yml` file placed in the `.github` directory. The default location can be overridden through [`step.with`](https://docs.github.com/en/actions/learn-github-actions/workflow-syntax-for-github-actions#jobsjob_idstepswith) as demonstrated in [Workflow configuration](#workflow-configuration).

The configuration file is **optional** and if it is missing then only built-in check will be performed.

#### Rules syntax

```yaml
approval_groups:
  - name: CHECK NAME     # Used for the status check description. Keep it short
                         # as GitHub imposes a limit of 140 chars.
    condition: /^.*$/    # Javascript Regular Expression used to match the rule.
                         # Do not specify modifiers after the closing slash.
                         # "gm" modifiers will be added by the action.
    check_type: pr_diff  # Either "pr_diff" or "pr_files".
    min_approvals: 2     # Minimum required approvals.
    users:
    # GitHub users which should be requested for reviews.
      - user1
      - user2
    teams:
    # GitHub teams which should be requested for reviews.
    # This refers to teams from the same organization as the repository where
    # this action is running.
    # Specify the teams only by name, without the organization part.
    # e.g. 'org/team1' will not work.
      - team1
      - team2
```

### Workflow configuration <a name="workflow-configuration"></a>

```yaml
name: PR Custom Review Status    # The PR status will be created with this name.

on:                              # The events which will trigger the action.
  pull_request:
    branches:
      - main
      - master
    types:
      - opened
      - reopened
      - synchronize
      - review_request_removed
  pull_request_review:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      # Use actions/checkout before pr-custom-review so that the PR's branch
      # will be cloned (required for "pr_diff" rules).
      - name: checkout
        uses: actions/checkout@v2
        with:
          fetch-depth: 0
      - name: pr-custom-review
        uses: paritytech/pr-custom-review@tag           # Pick a release tag and put it after the "@".
        with:
          # Custom token with read-only organization permission is required for
          # requesting reviews from teams. The inherent action token will not
          # work for this.
          token: ${{ secrets.GITHUB_TOKEN }}
          config-file: './.github/pr-custom-review-config.yml' # OPTIONAL: can be specified to override default config_file
```

### GitHub repository configuration  <a name="github-repository-configuration"></a>

Although the action will work even without any additional [repository settings](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features), for maximum enforcement effectiveness it is recommended to enable
[Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/managing-a-branch-protection-rule) according to the screenshot below:

![Branch Protection Settings](./img/github-branch-protection.png)
