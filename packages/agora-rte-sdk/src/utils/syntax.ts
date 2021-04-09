export const noBlankChars = (str: string): boolean => !!str.match(/^\S+$/)

export const isPatchProperty = (str: string): boolean => str.split('.').length > 1

export const transformPatchPropertyKeys = (str: string): string[] => str.split('.').filter((e => e))