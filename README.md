# Gitee API wrapper for JavaScript

[![Build Status](https://travis-ci.com/electerm/gitee-js.svg?branch=release)](https://travis-ci.com/electerm/gitee-js)

Gitee gist API wrapper. [api docs](https://gitee.com/api/v5/swagger#/postV5Gists).

## Installation

### Node.js

```bash
npm i gitee-client
```

## Usage

```js
import Gitee from 'gitee-client'

const gc = new Gitee(
  GITEE_TOKEN
)
let r = await gc.get('/v5/gists').catch(console.log)
expect(r.data.length > 0).toBe(true)

```

## Test

```bash
cp .sample.env .env
# edit .env fill your github token
npm run test
```

## Credits

Based on [Tyler](https://github.com/tylerlong)'s [https://github.com/tylerlong/ringcentral-js-concise](https://github.com/tylerlong/ringcentral-js-concise).

## License

MIT
