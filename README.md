# moh-changes
CLI tol to generate change logs automatically based on pull requests and tags

**This log is build based on `Pull Request` and `Tag` infos with the order of 'merge time' and 'created time'**

**In `Beta` now, not support updating exist Changelog, will overwrite all the info in Changelogs every time!!!**

## Features

* Standard changelog
    * foloowed [keep a changelog](http://keepachangelog.com/en/1.0.0/) to auto generate the changelog
* Easy to use
    * good cli interface with user firendly notification
    * single command to relase new verion(tag and update changelog)
    * single command to generate/update changelog
    * single command to enter fully customised mode
    * simple to authenticate with github for private repos
* Easy to overwrite
    * changelog can be easily overwrite, and will be keep in future updates
* Better performance
    * generated changelog info will be save and reused for next time updates
    * better logic to improve parallel requests to Github APIs
* More infos
    * show all authors included on a PR

## Installation

`npm i moh-changes -g`

## Usage:
```shell
$ moh-changes / moh-changes init
```

## Output

![moh-changes-output](https://user-images.githubusercontent.com/2676686/31682877-fd2b618e-b340-11e7-9cc4-65203f508438.png)

### ScreenShot

![moh-changes](https://user-images.githubusercontent.com/2676686/31682596-380315dc-b340-11e7-87f0-62873b68b702.png)

## TODO:
- [x] Add info of what doing in the back to console with spinner.
- [x] Add github auth info cache.
- [ ] Update info based on current chagenlog.
- [ ] Add NPM release [`npm version`] feature with changelog generate and git commit together.
- [ ] Handle suggestioin types of changes `ADDED`, `CHANGED`, `DEPRECATED`, `REMOVED`, `FIXED`, `SECURITY`.
- [ ] Add all authors info for one PR.
- [ ] Add better error handling logic, and retry logic.
- [ ] Customized mode in CLI.
