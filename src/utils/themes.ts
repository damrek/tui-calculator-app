export const themeNames = ['ocean', 'forest', 'sunset', 'mono'] as const;

export type ThemeName = (typeof themeNames)[number];

export const defaultTheme: ThemeName = 'ocean';

export interface ThemeColors {
  border: string;
  title: string;
  selected: string;
  success: string;
  danger: string;
  warning: string;
}

const themeColors: Record<ThemeName, ThemeColors> = {
  ocean: {
    border: 'cyan',
    title: 'cyanBright',
    selected: 'greenBright',
    success: 'green',
    danger: 'red',
    warning: 'yellow',
  },
  forest: {
    border: 'green',
    title: 'green',
    selected: 'greenBright',
    success: 'greenBright',
    danger: 'red',
    warning: 'yellow',
  },
  sunset: {
    border: 'magenta',
    title: 'magentaBright',
    selected: 'yellowBright',
    success: 'green',
    danger: 'red',
    warning: 'yellow',
  },
  mono: {
    border: 'gray',
    title: 'white',
    selected: 'whiteBright',
    success: 'white',
    danger: 'red',
    warning: 'yellow',
  },
};

export function isThemeName(value: unknown): value is ThemeName {
  return (
    typeof value === 'string' &&
    (themeNames as readonly string[]).includes(value)
  );
}

export function getThemeColors(name: ThemeName): ThemeColors {
  return themeColors[name];
}
