## Commit Message Format

This specification is inspired by [Angular Commit Message Guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-format). We have very precise rules over how our Git commit messages must be formatted. This format leads to easier to read commit history.

Each commit message consists of a header, a body, and a footer.

```sh
<header> # required, must conform to the "Commit Message Header" format below
<BLANK LINE>
[<body>] # (optional) must be at least 20 characters long and must conform to the "Commit Message Body" format below
<BLANK LINE>
[<footer>] # (optional) supplemental info, must conform to the "Commit Message Footer" format below
```

Any line of the commit message cannot be longer than 100 characters.

## Commit Message Header

```
<type>(<scope>): <short summary>
  │       │             │
  │       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │       │
  │       └─⫸ Commit Scope: May be provided to a commit’s type, to provide additional contextual information
  │
  └─⫸ Commit Type: build|ci|docs|feat|fix|perf|refactor|test
```

### Type

- `build`: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
- `ci`: Changes to our CI configuration files and scripts (example scopes: Circle, BrowserStack, SauceLabs)
- `docs`: Documentation only changes
- `feat`: Introduces a new feature to the codebase (this correlates with **MINOR** in semantic versioning)
- `fix`: A bug fix (this correlates with **PATCH** in semantic versioning)
- `perf`: A code change that improves performance
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests

### Scope

- `api`
- `jobs`
- `web`
- `e2e`
- ...
- `none/empty string`: useful for test and refactor changes that are done across all packages (e.g. test: add missing unit tests) and for docs changes that are not related to a specific package (e.g. docs: fix typo in tutorial).

### Summary

Use the summary field to provide a succinct description of the change:

- use the imperative, present tense: "change" not "changed" nor "changes"
- don't capitalize the first letter
- no dot (.) at the end

## Commit Message Body

Just as in the summary, use the imperative, present tense: "fix" not "fixed" nor "fixes".

Explain the motivation for the change in the commit message body: why you are making the change. You can include a comparison of the previous behavior with the new behavior in order to illustrate the impact of the change.

## Commit Message Footer

The footer can contain information about breaking changes and is also the place to reference GitHub issues/stories and other PRs that this commit closes or is related to.

```
BREAKING CHANGE: <breaking change summary>
<BLANK LINE>
<breaking change description + migration instructions>
<BLANK LINE>
<BLANK LINE>
Closes #<issue number>
```

Breaking Change section should start with "BREAKING CHANGE: " followed by a summary of the breaking change, a blank line, and a detailed description that also includes migration instructions.

## Revert Commits

If the commit reverts a previous commit, it should begin with `revert:`, followed by the header of the reverted commit.

The content of the commit message body should contain:

- The SHA of the commit being reverted: `This reverts commit <SHA>`
- A clear description of the reason for reverting the commit

## Examples

```sh
# A PR commit not associated with any issue/story
$ git commit -m "docs: fix typo"
```

```sh
# A PR commit with changes limited to a particular scope
$ git commit -m "fix(api): user endpoint response types"
```

```sh
# A commit related to an issue
$ git commit -m "refactor: add commit lint check #23"

Closes #7'
```

```sh
# Bypass commit lint
$ git commit -m "non-compliant commit message" --no-verify
```

References:

- [Conventional Commits Specification](https://www.conventionalcommits.org/en/v1.0.0-beta.2/#specification)
- [Angular Commit Message Format](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-format)
