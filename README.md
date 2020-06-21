# Nuxt Optout

> Forcibly opt-out of sending any telemetrics about your Nuxt.js project

## Why this package?

Since v2.13 Nuxt.js includes a telemetry module which reports anonymized data about your usage.

You can have multiple reasons why you want to make sure you dont share any info, for example
- You are bound to a NDA and don't want to test if the data that is sent by Nuxt.js is considered a breach of that NDA or not
- You don't want to share the crazy stuff you do in your Nuxt.js project
- You just like your privacy

Whatever reason you have, if you want to make _as sure as possible_ that you are not sending any telemetry then you can use this module

## Why this package when I can also just opt-out of telemetrics in my nuxt.config?

Bugs exists, also in Nuxt.js. Although every bug can be fixed, that could still mean that telemetrics have been sent in the mean time.

This package could be used in cases were that is a concern

## How does it work?

The telemetrics in Nuxt.js are injected into your project as a [nuxt module](https://github.com/nuxt/telemetry).

Due to how modules work in Nuxt, this package should preferably be run _before_ Nuxt.js is started. You can do this by either:
- export an async function in your _nuxt.config.js_ and call this package in it
```js
// nuxt.config.js
import nuxtOptout from 'nuxt-optout'

export default async function() {
  await nuxtOptout()

  return {
    mode: 'universal',
    ...
  }
}
```
- adding `pre` lifecycle events to your _package.json_
```json
// package.json
...
  scripts: {
    "predev": "nuxt-optout",
    "prebuild": "nuxt-optout",
    "prestart": "nuxt-optout",
    "dev": "nuxt src",
    "build": "nuxt build src",
    "start": "nuxt start src",
  }
```
- executing `nuxt(-ts)?-optout` instead of `nuxt(-ts)?`
```json
// package.json
...
  scripts: {
    "dev": "nuxt-optout src",
    "build": "nuxt-optout build src",
    "start": "nuxt-optout start src",
    // or
    "dev": "nuxt-ts-optout src",
  }
```

This package then does three things:
- it moves `@nuxt/telemetry/package.json` to `@nuxt/telemetry/package.disabled.json` so [getPKG](https://github.com/nuxt/nuxt.js/blob/dev/packages/config/src/options.js#L492) will return false         
- it overwrites the `main` entrypoint of the _@nuxt/telemetry_ module with a noop function
  - This means there could still be a _@nuxt/telemetry_ module loaded in your project, it just wouldn't do anything
- when used as alternative Nuxt.js executable, it runs the real nuxt executable but always adds two environment variables which are used by _@nuxt/telemetry_
  - Disable telemetry by setting: `NUXT_TELEMETRY_DISABLED=true`
  - Set the telemetry endpoint to localhost: `NUXT_TELEMETRY_ENDPOINT='http://127.0.0.1'`

## How can you guarantee that this package will always opt-out of telemetrics?

To be totally honest, I can't as also this package could contain bugs.

And even though Nuxt.js is not [evil](https://en.wikipedia.org/wiki/Don%27t_be_evil), the maintainers could easily add counter-measures to this package if they want to

## What can I do to be even more sure?

> Note that this solution is often not portable between computers and/or networks

The telemetrics are send to https://telemetry.nuxtjs.com. You can add this domain to eg your host file or PiHole blocklist and have it point to _localhost_ instead.
