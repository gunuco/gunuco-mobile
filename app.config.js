const appJson = require('./app.json');

const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

module.exports = {
  expo: {
    ...appJson.expo,
    extra: {
      ...(appJson.expo.extra ?? {}),
    },
    ios: {
      ...appJson.expo.ios,
      infoPlist: {
        ...(appJson.expo.ios?.infoPlist ?? {}),
        LSApplicationQueriesSchemes: ['tez', 'phonepe', 'paytmmp'],
      },
    },
    plugins: [
      ...appJson.expo.plugins,
      [
        'expo-image-picker',
        {
          photosPermission:
            'GUNUCO uses your photos only when you attach evidence to a support ticket or complaint.',
          cameraPermission: false,
          microphonePermission: false,
        },
      ],
      [
        'expo-notifications',
        {
          icon: './assets/images/icon.png',
          color: '#6F022B',
          defaultChannel: 'default',
        },
      ],
      [
        'react-native-maps',
        {
          androidGoogleMapsApiKey: googleMapsApiKey,
          iosGoogleMapsApiKey: googleMapsApiKey,
        },
      ],
    ],
  },
};
