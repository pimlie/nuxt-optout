# Nuxt Optout

> Forcibly opt-out of sending any telemetry about your Nuxt.js project

## Why this package?

Since v2.13 Nuxt.js includes a telemetry module which reports anonymized data about your usage.

You can have multiple reasons why you want to make sure you dont share any info, for example
- You are bound to a NDA and don't want to test if the data that is sent by Nuxt.js is considered a breach of that NDA or not
- You don't want to share the crazy stuff you do in your Nuxt.js project
- You just really like your privacy

Whatever reason you have, if you want to make as sure as possible that you are not sending any telemetry then you can use this module

## Should I use this package?

Probably not.

The Nuxt.js core-team takes privacy already very seriously, this is shown because f.e. we ask users to explicitly opt-in instead of requiring users to opt-out. We explicitly choose to make it as easy as possible for users to opt-out of sending telemetry.

We are fully aware of any privacy issues that may arise from embedding telemetry. We simply can't deny that to spent our time most efficiently we need to know how people are using Nuxt.js, including telemetry is somewhat of a necessary evil. Otherwise we risk spending weeks of our time developping a new feature which will then only be used by a small percentage of all Nuxt.js users.

So we kindly ask you to enable telemetry whenever possible. Having you send us anonymous telemetry helps us greatly with knowing which parts of Nuxt.js deserves the most attentions. Also because it's the only way to ensure we are also getting feedback from people who are not active on Github or Discord.

See the [@nuxt/telemetry](https://github.com/nuxt/telemetry#why-collecting-telemetry) readme [for more information](https://github.com/nuxt/telemetry#sensitive-data)

## Why this package when I can also just opt-out of telemetry in my nuxt.config?

Bugs exists, also in Nuxt.js. Although every bug can be fixed, that could still mean that telemetry have been sent in the mean time.

This package could be used in cases were that is a concern

## How does this package work?

> Do not trust this package to work flawlessly. Also make sure to set `telemetry: false` in your nuxt.config to tell nuxt/telemetry you want to opt-out

### Using a Yarn resolution

> Only works when you are using yarn as package manager and could still sent telemetry if you use npm by mistake

If you only use yarn you can add a resolution entry in your package.json. The default export of this package is a noop function that does nothing:

```js
// package.json
  resolutions: {
    "@nuxt/telemetry": "npm:nuxt-optout"
  }
```

### Patching the installed @nuxt/telemetry package

The telemetry in Nuxt.js are injected into your project as a [nuxt module](https://github.com/nuxt/telemetry).

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

## How can you guarantee that this package will always opt-out of telemetry?

To be totally honest, I can't as also this package could contain bugs.

As mentioned, despite using this package you should still tell nuxt/telemetry you want to opt-out by setting `telemetry: false` in your nuxt.config

## What can I do to be even more sure?

> Note that this solution is often not portable between computers and/or networks

The telemetry are send to https://telemetry.nuxtjs.com. You can add this domain to eg your host file or PiHole blocklist and have it point to _localhost_ instead.
