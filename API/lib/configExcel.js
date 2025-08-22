const COLORS = {
  primary: "1F4E79",
  secondary: "2E75B6",
  accent: "4472C4",
  light: "D9E1F2",
  white: "FFFFFF",
  gray: "F2F2F2",
  darkGray: "A6A6A6",
  success: "70AD47",
  warning: "ED7D31",
  danger: "C00000",
  text: "333333",
  lightText: "666666",
};

CONFIGPAGE = {
  pageSetup: {
    paperSize: 9, // A4
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: {
      top: 0.7,
      left: 0.7,
      bottom: 0.7,
      right: 0.7,
      header: 0.3,
      footer: 0.3,
    },
  },
  properties: {
    tabColor: { argb: COLORS.primary },
  },
};

const styles = {
  title: {
    font: {
      name: "Calibri",
      bold: true,
      size: 18,
      color: { argb: COLORS.primary },
    },
    alignment: { horizontal: "left", vertical: "middle" },
    border: { bottom: { style: "medium", color: { argb: COLORS.primary } } },
  },
  subtitle: {
    font: {
      name: "Calibri",
      bold: true,
      size: 16,
      color: { argb: COLORS.secondary },
    },
    alignment: { horizontal: "left", vertical: "middle" },
  },
  sectionTitle: {
    font: {
      name: "Calibri",
      bold: true,
      size: 14,
      color: { argb: COLORS.primary },
    },
    alignment: { horizontal: "center", vertical: "middle" },
    fill: {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.light },
    },
    border: { outline: { style: "thin", color: { argb: COLORS.primary } } },
  },
  dateInfo: {
    font: {
      name: "Calibri",
      bold: true,
      size: 11,
      color: { argb: COLORS.lightText },
    },
    alignment: { horizontal: "left", vertical: "middle" },
  },
  header: {
    font: {
      name: "Calibri",
      bold: true,
      size: 12,
      color: { argb: COLORS.white },
    },
    fill: {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.primary },
    },
    alignment: { horizontal: "center", vertical: "middle", wrapText: true },
    border: {
      top: { style: "thin", color: { argb: COLORS.primary } },
      left: { style: "thin", color: { argb: COLORS.primary } },
      bottom: { style: "thin", color: { argb: COLORS.primary } },
      right: { style: "thin", color: { argb: COLORS.primary } },
    },
  },
  data: {
    font: { name: "Calibri", size: 11, color: { argb: COLORS.text } },
    alignment: { vertical: "middle" },
    border: {
      top: { style: "thin", color: { argb: COLORS.darkGray } },
      left: { style: "thin", color: { argb: COLORS.darkGray } },
      bottom: { style: "thin", color: { argb: COLORS.darkGray } },
      right: { style: "thin", color: { argb: COLORS.darkGray } },
    },
  },
  alternateRow: {
    fill: {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.light },
    },
  },
  summary: {
    font: {
      name: "Calibri",
      bold: true,
      size: 12,
      color: { argb: COLORS.primary },
    },
    alignment: { horizontal: "right", vertical: "middle" },
    border: { top: { style: "medium", color: { argb: COLORS.primary } } },
  },
  summaryValue: {
    font: {
      name: "Calibri",
      bold: true,
      size: 12,
      color: { argb: COLORS.secondary },
    },
    alignment: { horizontal: "center", vertical: "middle" },
    fill: {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.light },
    },
    border: {
      top: { style: "medium", color: { argb: COLORS.primary } },
      left: { style: "thin", color: { argb: COLORS.primary } },
      bottom: { style: "thin", color: { argb: COLORS.primary } },
      right: { style: "thin", color: { argb: COLORS.primary } },
    },
  },
  footer: {
    font: {
      name: "Calibri",
      italic: true,
      size: 10,
      color: { argb: COLORS.lightText },
    },
    alignment: { horizontal: "center", vertical: "middle" },
    border: { top: { style: "thin", color: { argb: COLORS.primary } } },
  },
};

module.exports = { COLORS, CONFIGPAGE, styles };
