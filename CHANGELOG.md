# Changelog

## [Unreleased]

## [0.2.0] - 2018-04-30
### Changed
- You must now call
BlockfolioAPI.init(DEVICE_TOKEN, (blockfolio) => { ... }); and wrap
your code inside to make it work (initialize available tokens &
exchanges)
### Added
- getCoinsList
- BlockfolioAPI.createNew / _register for new accounts

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