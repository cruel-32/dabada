// swift-tools-version: 5.9
import PackageDescription

// DO NOT MODIFY THIS FILE - managed by Capacitor CLI commands
let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "8.0.2"),
        .package(name: "CapacitorCommunityAdmob", path: "../../../node_modules/.pnpm/@capacitor-community+admob@8.0.0/node_modules/@capacitor-community/admob"),
        .package(name: "CapacitorCommunityMedia", path: "../../../node_modules/.pnpm/@capacitor-community+media@9.0.1_@capacitor+core@8.0.1/node_modules/@capacitor-community/media"),
        .package(name: "CapacitorApp", path: "../../../node_modules/.pnpm/@capacitor+app@8.0.0_@capacitor+core@8.0.1/node_modules/@capacitor/app"),
        .package(name: "CapacitorBrowser", path: "../../../node_modules/.pnpm/@capacitor+browser@8.0.0_@capacitor+core@8.0.1/node_modules/@capacitor/browser"),
        .package(name: "CapacitorFilesystem", path: "../../../node_modules/.pnpm/@capacitor+filesystem@8.1.0_@capacitor+core@8.0.1/node_modules/@capacitor/filesystem"),
        .package(name: "CapacitorLocalNotifications", path: "../../../node_modules/.pnpm/@capacitor+local-notifications@8.0.0_@capacitor+core@8.0.1/node_modules/@capacitor/local-notifications"),
        .package(name: "CapacitorShare", path: "../../../node_modules/.pnpm/@capacitor+share@8.0.0_@capacitor+core@8.0.1/node_modules/@capacitor/share"),
        .package(name: "CapacitorToast", path: "../../../node_modules/.pnpm/@capacitor+toast@8.0.0_@capacitor+core@8.0.1/node_modules/@capacitor/toast"),
        .package(name: "CapawesomeCapacitorFilePicker", path: "../../../node_modules/.pnpm/@capawesome+capacitor-file-picker@8.0.1_@capacitor+core@8.0.1/node_modules/@capawesome/capacitor-file-picker"),
        .package(name: "CapgoCapacitorDownloader", path: "../../../node_modules/.pnpm/@capgo+capacitor-downloader@8.1.6_@capacitor+core@8.0.1/node_modules/@capgo/capacitor-downloader"),
        .package(name: "CapgoCapacitorSocialLogin", path: "../../../node_modules/.pnpm/@capgo+capacitor-social-login@8.2.16_@capacitor+core@8.0.1/node_modules/@capgo/capacitor-social-login")
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "CapacitorCommunityAdmob", package: "CapacitorCommunityAdmob"),
                .product(name: "CapacitorCommunityMedia", package: "CapacitorCommunityMedia"),
                .product(name: "CapacitorApp", package: "CapacitorApp"),
                .product(name: "CapacitorBrowser", package: "CapacitorBrowser"),
                .product(name: "CapacitorFilesystem", package: "CapacitorFilesystem"),
                .product(name: "CapacitorLocalNotifications", package: "CapacitorLocalNotifications"),
                .product(name: "CapacitorShare", package: "CapacitorShare"),
                .product(name: "CapacitorToast", package: "CapacitorToast"),
                .product(name: "CapawesomeCapacitorFilePicker", package: "CapawesomeCapacitorFilePicker"),
                .product(name: "CapgoCapacitorDownloader", package: "CapgoCapacitorDownloader"),
                .product(name: "CapgoCapacitorSocialLogin", package: "CapgoCapacitorSocialLogin")
            ]
        )
    ]
)
