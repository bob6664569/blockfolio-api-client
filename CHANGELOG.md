# Changelog

## [Unreleased]
- Options object for parameters passing on most endpoints
- Default values & some automation on portfolio positions

## [0.2.5] - 2018-05-04
### Fixed
- sell mode for addPosition

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