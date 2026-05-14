import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ioverso.rootio',
  appName: 'Rootio',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#f7f4ec',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
