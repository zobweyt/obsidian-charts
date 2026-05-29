# Contributing

We welcome all contributions! Please follow this guide to set up your environment and submit your changes.

## Quick Start

1. [Fork](https://github.com/zobweyt/obsidian-charts/fork) this repository.
2. Clone it locally.

## Development

> [!NOTE]
> This project is undergoing active development with architecture refactoring planned. Fast iteration is preferred over absolute perfection; final code quality will be guided through code review and our style workflow.

We use [Deno](https://deno.com) for zero-dependency development tooling. After cloning, initialize the project environment:

```sh
deno task prepare
```

### Guidelines

- Since automated tests are not implemented yet, create a simple test dataset or example notes in the [sandbox vault](./sandbox) to manually verify that everything works.
- Avoid adding dependencies because this project aims to remain minimal and lightweight.

### Commands

- Rebuild the plugin on changes and launch sandboxed Obsidian via [`obsidian-launcher`](https://github.com/jesse-r-s-hines/wdio-obsidian-service/blob/main/packages/obsidian-launcher/README.md) (the first run may take time to download the application and installer):

  ```sh
  deno task dev
  ```

- Bundle and minify the plugin for production:

  ```sh
  deno task build
  ```

- Run code quality checks before submitting a Pull Request:
  ```sh
  deno fmt
  ```
  ```sh
  deno lint
  ```
  ```sh
  deno check
  ```

## Localization

This project relies on the Obsidian [`getLanguage`](https://docs.obsidian.md/Reference/TypeScript+API/getLanguage) API to resolve the user's locale. To maintain ecosystem consistency, we exclusively support locales defined in the [official Obsidian Translations list](https://github.com/obsidianmd/obsidian-translations?tab=readme-ov-file#existing-languages). If your target language is not yet listed there, please submit an upstream request in their repository first.

We welcome all localization contributions, from fixing typos to adding entirely new languages. To contribute, please open a Pull Request using the existing locale files as a baseline:

| Code | Name              | Progress | Contributors | File                                        |
| :--- | :---------------- | :------- | :----------- | :------------------------------------------ |
| `en` | English           | 100%     | @zobweyt     | [`en.json`](./src/lib/i18n/locales/en.json) |
| `ru` | Russian (Русский) | 100%     | @zobweyt     | [`ru.json`](./src/lib/i18n/locales/ru.json) |
