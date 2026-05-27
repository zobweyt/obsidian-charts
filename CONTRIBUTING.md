# Contributing

Contributions are welcome! This project uses [Deno](https://deno.com/) for tooling and development.

Setup git hooks before commiting:

```sh
deno task prepare
```

## Commands

Build the plugin for production:

```sh
deno task build
```

Start the development watcher to automatically rebuild on source changes and launch sandboxed Obsidian using [`obsidian-launcher`](https://github.com/jesse-r-s-hines/wdio-obsidian-service/blob/main/packages/obsidian-launcher/README.md):

```sh
deno task build --watch
```

The first run may take some time while the launcher downloads and installs the required Obsidian version.

## Code Quality & Styling

Before submitting a Pull Request, please ensure your code complies with the project's style guidelines:

Format the code:

```sh
deno fmt
```

Lint the code for potential errors:

```sh
deno lint
```

Type check:

```sh
deno check
```

## Localization

We welcome translations! You can contribute your language by opening a Pull Request. Take a look at the existing translation files in the [`src/i18n/locales`](./src/i18n/locales) directory as a reference.
