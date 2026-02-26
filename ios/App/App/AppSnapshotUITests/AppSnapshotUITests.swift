//
//  AppSnapshotUITests.swift
//  AppSnapshotUITests
//
//  Fastlane snapshot용: 앱 실행 후 메인 화면 캡처
//

import XCTest

@MainActor
final class AppSnapshotUITests: XCTestCase {

    override func setUpWithError() throws {
        continueAfterFailure = false
    }

    func testCaptureMainScreen() async throws {
        let app = XCUIApplication()
        setupSnapshot(app)
        app.launch()

        // 웹뷰 로드 대기 (Capacitor 앱은 server.url 로드)
        try await Task.sleep(nanoseconds: 8_000_000_000)

        snapshot("01Main")
    }
}
