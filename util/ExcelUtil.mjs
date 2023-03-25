export function isCell(location) {
    const EXCEL_RANGE_REGEX = /[A-Z][0-9]+$/;

    return EXCEL_RANGE_REGEX.test(location);
}