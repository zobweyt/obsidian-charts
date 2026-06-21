Welcome to the sandbox vault! Here you can find tips and guides on how to use [Charts plugin](https://community.obsidian.md/plugins/charts).

## Get started

Open the [[Showcase.canvas|Showcase]] canvas to explore all at once or use the examples below.

## Examples

```base
filters:
  and:
    - file.hasTag("type", "option")
properties:
  note.tags:
    displayName: Tags
  note.description:
    displayName: Description
views:
  - type: cards
    name: Examples
    order:
      - file.name
      - description
      - tags
    sort:
      - property: rank
        direction: ASC
    cardSize: 300

```

## Contribute

If you find any mistakes or missing information in this documentation, you can contribute improvements via [the GitHub repository](https://github.com/zobweyt/obsidian-charts).
