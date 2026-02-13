const path = require('path');

module.exports = {
  packagerConfig: {
    asar: true,
    icon: './assets/icon',
    executableName: 'miniGamba',
    appBundleId: 'com.qrytics.minigamba',
    win32metadata: {
      CompanyName: 'Qrytics',
      FileDescription: 'miniGamba - Your In-Game Companion',
      OriginalFilename: 'miniGamba.exe',
      ProductName: 'miniGamba',
      InternalName: 'miniGamba'
    }
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'miniGamba',
        setupIcon: './assets/icon.ico',
        iconUrl: 'https://raw.githubusercontent.com/Qrytics/miniGamba/main/assets/icon.ico'
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux']
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'Qrytics',
          homepage: 'https://github.com/Qrytics/miniGamba'
        }
      }
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {}
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig: './webpack.main.config.js',
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              html: './src/renderer/dashboard/index.html',
              js: './src/renderer/dashboard/index.tsx',
              name: 'dashboard',
              preload: {
                js: './src/preload/dashboard-preload.ts'
              }
            },
            {
              html: './src/renderer/overlay/index.html',
              js: './src/renderer/overlay/index.tsx',
              name: 'overlay',
              preload: {
                js: './src/preload/overlay-preload.ts'
              }
            }
          ]
        }
      }
    }
  ]
};
