# Obsidian Bases Chart Layouts

This plugin adds new layouts to [bases](https://obsidian.md/help/bases): **Bar
Chart**, **Line Chart**, and **Pie Chart**.

## Usage Guide

### Prerequisites

- Ensure the [Bases core plugin](https://help.obsidian.md/bases) is enabled in
  your Obsidian settings.
- [Install and enable](obsidian://show-plugin?id=bases-chart-layouts) this
  plugin.
- Open an existing [Base](https://help.obsidian.md/bases) or create a new one.

### Setting Up a Chart View

1. Create a new view within your [Base](https://help.obsidian.md/bases) and
   select one of the available chart layouts (**Bar Chart**, **Line Chart**, or
   **Pie Chart**).

2. Open the **View Settings** to configure the axes:
   1. **X-Axis**: Select the property you want to use.
   2. **Y-Axis**: Click the native `Properties` menu in the top-right corner of
      the Base to select the target data.

## Screenshots

### Bar Chart

![Bases Bar Chart Layout screenshot](https://community.obsidian.md/api/images/5758)

### Line Chart

![Bases Line Chart Layout screenshot](https://community.obsidian.md/api/images/5759)

### Pie Chart

![Bases Pie Chart Layout screenshot](https://community.obsidian.md/api/images/5760)

## Localization

The plugin automatically adapts to your selected Obsidian interface language.

**Currently supported languages:**

- English ([`en`](./src/i18n/locales/en.json))
- Russian ([`ru`](./src/i18n/locales/ru.json))

### Adding Your Language

We welcome translations! You can contribute your language by opening a Pull
Request. Take a look at the existing translation files in the
[`src/i18n/locales`](./src/i18n/locales) directory as a reference.

## Contributing

Contributions are welcome! This project uses [Deno](https://deno.com/) for
tooling and development.

### Commands

Build the plugin for production:

```sh
deno build
```

Start the development watcher to automatically rebuild on changes:

```sh
deno watch
```

### Code Quality & Styling

Before submitting a Pull Request, please ensure your code complies with the
project's style guidelines:

Format the code:

```sh
deno fmt
```

Lint the code for potential errors:

```sh
deno lint
```
