import { Theme, createTheme } from '@mui/material';

export class ThemeUtil {
  static createTheme(): Theme {
    return createTheme({
      palette: {
        mode: 'dark',
      },
      typography: {
        fontFamily: ['smb'].join(','),
        button: {
          textTransform: 'none',
        },
      },
      components: {
        MuiBottomNavigationAction: {
          styleOverrides: {
            root: {
              '&.Mui-selected': {
                color: '#0ca51c'
              }
            },
            label: {
              '&.Mui-selected': {
                fontSize: '0.75rem'
              }
            }
          }
        },
        MuiTypography: {
          styleOverrides: {
            root: {
              paddingBottom: '0px !important',
              color: '#ffffff'
            }
          }
        },
        MuiTabs: {
          styleOverrides: {
            indicator: {
              backgroundColor: '#aaaaaa', // bar under the tab
            }
          }
        },
        MuiTab: {
          styleOverrides: {
            root: {
              color: '#333333',
              '&.Mui-selected': {
                color: '#aaaaaa', // selected tab
              }
            },
          },
        },
        MuiSlider: {
          styleOverrides: {
            root: {
              color: '#666666',
            },
          },
        },
        MuiButtonGroup: {
          styleOverrides: {
            firstButton: {
              borderColor: 'rgba(255, 255, 255, 0.25) !important',
            },
            middleButton: {
              borderColor: 'rgba(255, 255, 255, 0.25) !important',
            }
          }
        },
        MuiButtonBase: {
          styleOverrides: {
            root: {
              // backgroundColor: 'rgba(255, 255, 255, 0.25) !important'
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            label: {
              padding: '0px 0px 0px 12px',
            },
          },
        },
        MuiSnackbar: {
          styleOverrides: {
            root: {
              top: '15px !important',
              left: '60px !important',
              right: '15px !important',
              bottom: 'unset !important',
            },
          },
        },
        MuiAlert: {
          styleOverrides: {
            root: {
              height: '37px',
              padding: '1px 12px',
              boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
            },
            message: {
              overflow: 'hidden',
            },
          },
        },
      },
    });
  }
}
