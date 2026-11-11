# Tilely for iPhone and iPad

The iOS app uses the same game source as the website at `../../tilely/`. The build copies the game and its local assets into Capacitor's `www/` directory. The packaged game runs offline and stores progress on the device.

## Run in Xcode

Use macOS, Node.js 22 or newer, and Xcode 26 or newer. The project uses Swift Package Manager.

```sh
cd apps/tilely-ios
npm ci
npm run open:ios
```

Select an iPhone or iPad simulator in Xcode and run the **App** scheme. For a physical device, connect and unlock it, then select it as the run destination. Automatic signing is configured for the Furkan KALE development team under **Signing & Capabilities**. The bundle identifier is `com.furkankale.tilely` and the minimum OS version is 15.0.

Run `npm run sync:ios` after changing the shared web game to refresh the native bundle. Keep generated files in `www/` and `ios/App/App/public/` out of version control.
