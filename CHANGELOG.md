# Changelog

## [Unreleased]

## [1.0.0-beta7] - 2018-05-13
### Added
- Full code coverage

## [1.0.0-beta6] - 2018-05-12
### Added
- Rate limitation to avoid API issues
### Fixed
- getPositions now taking an optional pair in first param like described in README

## [1.0.0-beta5] - 2018-05-12
### Fixed
- _validateTokenPair now valides with the full coins list

## [1.0.0-beta4] - 2018-05-10
### Added
- pauseAlert, startAlert, pauseAllAlerts, startAllAlerts
- How to downgrade Blockfolio to get your DEVICE_TOKEN
### Changed
- reordering tests
- documentation for v1.0.0

## [1.0.0-beta3] - 2018-05-09
### Added
- getAlerts, addAlert, removeAlert
- Some checks for arguments on other methods

## [1.0.0-beta2] - 2018-05-05
### Added
- getPortfolioSummary
- more examples in the README
- enhanced coverage
### Changed
- Promises everywhere

## [1.0.0-beta1] - 2018-05-04
### Added
- Every asynchronous method now returns a promise, callbacks are optional
- removePosition
### Changed
- Callbacks are now optional
- Promisified methods now takes fewer arguments, and use an option object for optional settings

## [0.2.4] - 2018-05-03
### Added
- token check displaying an hint if the used token is a disposable one

## [0.2.3] - 2018-05-02
### Added
- getCurrencies, getStatus
### Changed
- Updated README
- Added Signal API URL
### Fixed
- Code coverage

## [0.2.2] - 2018-05-02
### Added
- getDisposableDeviceToken... THANK YOU BLOCKFOLIO !
### Changed
- Warning on README : Token shown in the app are not useable since now

## [0.2.1] - 2018-05-01
### Added
- getAnnouncements, getVersion

## [0.2.0] - 2018-05-01
### Changed
- You must now call
BlockfolioAPI.init(DEVICE_TOKEN, (blockfolio) => { ... }); and wrap
your code inside to make it work (initialize available tokens &
exchanges)
- Every method that calls the API with a token pair now checks the
validity and can return new errors
### Added
- getCoinsList, _validateTokenPair
- BlockfolioAPI.createNew / _register for new accounts
- Disclaimer

## [0.1.1] - 2018-04-30
### Added
- getMarketDetails, getHoldings
### Changed
- Update getPositions with token pair as first argument, returning only
the concerned positions

## [0.1.0] - 2018-04-30
### Added
- Complete test coverage

## [0.0.6] - 2018-04-30
### Added
- _parsePair

## [0.0.5] - 2018-04-30
### Added
- Doc for every method

## [0.0.4] - 2018-04-30
### Added
- Some doc in README

### Changed
- BTC Badge for donations
- Restore APIClient user-agent
- Add correct extension for this file

## [0.0.3] - 2018-04-29
### Added
- getPrice, getExchanges

## [0.0.2] - 2018-04-29
### Added
- addPosition, getPositions, watchCoin, removeCoin
- New tests
### Changed
- Renamed to blockfolio-api-client
### Removed
- Useless _post (everything is called with GETs...)

## [0.0.1] - 2018-04-29
### Added
- Base package & module struct
- First tests
- Coverage