# PLP

Atomic Object Pair Lunch Picker

# Setup Instructions

1. [Install Xcode](https://apps.apple.com/us/app/xcode/id497799835?mt=12)
2. Install xcode command line tools
   1. `sudo xcode-select --switch /Applications/Xcode.app`
   2. `sudo xcode-select --install`
3. Install [Android Studio](https://developer.android.com/studio) either manually, or by running `brew install android-studio`
   1. [Configure Android Studio following the guide that React Native provides](https://reactnative.dev/docs/environment-setup#installing-dependencies).
4. Run `node -v` and make sure you are running node version 16.3.0. You can use [nvm](https://github.com/nvm-sh/nvm) to change your node version.
5. Run `yarn` in the project root directory.
6. Run `cd ios && bundle && pod install && cd ..`
7. Run `yarn ios` or `yarn android` for ios or android respectively.
