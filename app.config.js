const appJson = require('./app.json');

const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

module.exports = {
  expo: {
    ...appJson.expo,
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
            'GUNUCO uses your photos only when you attach evidence to a complaint or return request.',
          cameraPermission: false,
          microphonePermission: false,
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
