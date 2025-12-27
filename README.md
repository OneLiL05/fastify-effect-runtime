# `fastify-effect-runtime`

Library for integrating effect runtime into fastify

## Installation

```sh
npm i fastify-effect-runtime
# yarn add fastify-effect-runtime
# pnpm add fastify-effect-runtime
```

## Usage


Register the plugin:

```js
import { Layer } from 'effect'
import fastifyEffectRuntime from 'fastify-effect-runtime'

const app = fastify()

await app.register(fastifyEffectRuntime, {
  layers: Layer.mergeAll(YourFirstLayer, YourSecondLayer)
})
```

Use effect inside of routes:

```js
import { withEffect } from 'fastify-effect-runtime'

app.get('/health',
  withEffect((_, reply) =>
    Effect.succeed(
      reply.status(200).send({ status: 'ok!' })
    )
  )
)
```

## Contributing


If you want to contribute to improving the project, firstly read [CONTRIBUTING.md](https://github.com/OneLiL05/fastify-effect-runtime/blob/main/CONTRIBUTING.md)

## Stay in touch

Author - [Kyrylo Savieliev](https://github.com/OneLiL05)

## License

`fastify-effect-runtime` is [MIT licensed](https://github.com/OneLiL05/fastify-effect-runtime/blob/main/LICENSE)
