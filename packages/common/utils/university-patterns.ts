export const UNIVERSITY_EMAIL_PATTERNS: Record<string, RegExp> = {
    UPC: /^[Uu](20(1[8-9]|[2-9][0-9]))[a-zA-Z0-9]{5}$/,
    PUCP: /^([aA]20\d{6}|[a-zA-Z]+\.[a-zA-Z0-9]+)$/,
    UTEC: /^[a-zA-Z]+\.[a-zA-Z0-9]+$/,
    UNMSM: /^\d{8}$/,
};

