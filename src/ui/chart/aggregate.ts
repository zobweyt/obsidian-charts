import type { BasesQueryResult } from "obsidian";

export function parseNumericValue(rawValue: unknown): number | null {
  if (rawValue === null || rawValue === undefined) return null;
  if (typeof rawValue === "number") {
    return Number.isFinite(rawValue) ? rawValue : null;
  }
  const normalized = String(rawValue).replace(/[^0-9.-]/g, "");
  if (!normalized) return null;
  const parsedNumber = Number.parseFloat(normalized);
  return Number.isFinite(parsedNumber) ? parsedNumber : null;
}

export function aggregateValuesByLabel(
  rawValues: (number | null)[][],
  rawXLabels: string[],
  propertyNames: string[],
  data: BasesQueryResult,
): {
  values: (number | null)[][];
  xLabels: string[];
  groupFilePaths: string[][];
  seriesNames: string[];
} {
  const labelToIndex = new Map<string, number>();
  const xLabels: string[] = [];
  const groupFilePaths: string[][] = [];
  const values = rawValues.map(() => [] as (number | null)[]);
  const hasValue = rawValues.map(() => [] as boolean[]);

  rawXLabels.forEach((label, rowIndex) => {
    let groupIndex = labelToIndex.get(label);
    if (groupIndex === undefined) {
      groupIndex = xLabels.length;
      labelToIndex.set(label, groupIndex);
      xLabels.push(label);
      groupFilePaths.push([]);
      values.forEach((series, seriesIndex) => {
        series[groupIndex!] = 0;
        hasValue[seriesIndex][groupIndex!] = false;
      });
    }

    groupFilePaths[groupIndex].push(data.data[rowIndex].file.path);
    rawValues.forEach((series, seriesIndex) => {
      const value = series[rowIndex];
      if (value === null) return;
      values[seriesIndex][groupIndex!] =
        (values[seriesIndex][groupIndex!] ?? 0) + value;
      hasValue[seriesIndex][groupIndex!] = true;
    });
  });

  values.forEach((series, seriesIndex) => {
    series.forEach((_value, groupIndex) => {
      if (!hasValue[seriesIndex][groupIndex]) series[groupIndex] = null;
    });
  });

  return { values, xLabels, groupFilePaths, seriesNames: propertyNames };
}

export function aggregateValuesByLabelAndSeries(
  rawValues: (number | null)[][],
  rawXLabels: string[],
  rawSeriesLabels: string[],
  propertyNames: string[],
  data: BasesQueryResult,
): {
  values: (number | null)[][];
  xLabels: string[];
  groupFilePaths: string[][];
  seriesNames: string[];
} {
  const labelToIndex = new Map<string, number>();
  const seriesToIndex = new Map<string, number>();
  const xLabels: string[] = [];
  const seriesNames: string[] = [];
  const groupFilePaths: string[][] = [];
  const values: (number | null)[][] = [];
  const hasValue: boolean[][] = [];

  const ensureXIndex = (label: string): number => {
    let groupIndex = labelToIndex.get(label);
    if (groupIndex !== undefined) return groupIndex;
    groupIndex = xLabels.length;
    labelToIndex.set(label, groupIndex);
    xLabels.push(label);
    groupFilePaths.push([]);
    values.forEach((series, seriesIndex) => {
      series[groupIndex!] = 0;
      hasValue[seriesIndex][groupIndex!] = false;
    });
    return groupIndex;
  };

  const ensureSeriesIndex = (name: string): number => {
    let seriesIndex = seriesToIndex.get(name);
    if (seriesIndex !== undefined) return seriesIndex;
    seriesIndex = seriesNames.length;
    seriesToIndex.set(name, seriesIndex);
    seriesNames.push(name);
    values.push(xLabels.map(() => 0));
    hasValue.push(xLabels.map(() => false));
    return seriesIndex;
  };

  rawXLabels.forEach((label, rowIndex) => {
    const groupIndex = ensureXIndex(label);
    groupFilePaths[groupIndex].push(data.data[rowIndex].file.path);
    rawValues.forEach((series, propertyIndex) => {
      const value = series[rowIndex];
      if (value === null) return;
      const seriesLabel = rawSeriesLabels[rowIndex];
      const seriesName = rawValues.length === 1
        ? seriesLabel
        : `${seriesLabel} / ${propertyNames[propertyIndex]}`;
      const seriesIndex = ensureSeriesIndex(seriesName);
      values[seriesIndex][groupIndex] = (values[seriesIndex][groupIndex] ?? 0) +
        value;
      hasValue[seriesIndex][groupIndex] = true;
    });
  });

  values.forEach((series, seriesIndex) => {
    xLabels.forEach((_label, groupIndex) => {
      if (!hasValue[seriesIndex][groupIndex]) series[groupIndex] = null;
    });
  });

  return { values, xLabels, groupFilePaths, seriesNames };
}
