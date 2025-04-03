import type { GlobalThemeOverrides } from 'naive-ui';

const themeOverrides: GlobalThemeOverrides = {
    common: {
        primaryColor: '#a236b2',
        primaryColorHover: '#a236b2',
        primaryColorPressed: '#a236b2',
        borderColor: '#adb5bd',
        textColorBase: '#6a6a6a',
        fontFamily: 'Open Sans, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu,     Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
    },
    Dialog: {
        borderRadius: '6px',
        fontSize: '16px',
    },
    Button: {
        border: '1px solid #adb5bd',
        textColorGhost: '#6a6a6a',
        colorPrimary: '#ab49b9',
        borderRadiusMedium: '6px',
    },
    Radio: {
        radioSizeMedium: '24px',
        colorActive: '#fff',
        textColor: '#0D0D34',
        labelFontWeight: 700
    }
};
export default themeOverrides;