# Contributing

Thank you for your interest in improving the project! Contributions are welcome!

## Quick Start

1. [Fork](https://github.com/zobweyt/obsidian-charts/fork) this repository.
2. Clone the repository locally.

### Development

> [!NOTE]
> The codebase is currently undergoing active development, and a major refactoring is planned. Do not worry about making your code absolutely perfect right now.

This project uses [Deno](https://deno.com) for tooling and development, so please install it and run `deno task prepare` to configure git hooks.

#### Considerations

- Since automated tests are not implemented yet, create a simple test dataset or example notes in the [sandbox vault](./sandbox) to manually verify that everything works.
- Avoid adding dependencies because this project aims to remain minimal and lightweight.

#### Commands

Start the development watcher to automatically rebuild on source changes and launch sandboxed Obsidian using [`obsidian-launcher`](https://github.com/jesse-r-s-hines/wdio-obsidian-service/blob/main/packages/obsidian-launcher/README.md) (the first launch may take time to download the app):

```sh
deno task dev
```

Build and minify the plugin for production:

```sh
deno task build
```

#### Code Quality & Styling

Ensure your code complies with the project's style guidelines before submitting a Pull Request:

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

### Localization

We welcome translations. You can contribute your language by opening a Pull Request. Use the existing translation files in the [`src/i18n/locales`](./src/i18n/locales) directory as a reference.
