import { Effect, Exit, Layer, Runtime, Scope } from "effect"
import type { FastifyPluginCallback, FastifyRequest } from "fastify"
import fp from "fastify-plugin"

interface FastifyEffectOptions<R = any> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	layer: Layer.Layer<R, never, any>
}

interface FastifyRequestWithEffect extends FastifyRequest {
	effectScope: Runtime.Runtime<unknown>
}

declare module 'fastify' {
	interface FastifyInstance {
		effectRuntime: Runtime.Runtime<unknown>
		effectScope: Scope.CloseableScope
	}

	interface FastifyRequest {
		effectScope?: Runtime.Runtime<unknown>
	}
}

const fastifyEffectRuntime: FastifyPluginCallback<FastifyEffectOptions> = (
  fastify,
	opts,
  next
) => {
  fastify.decorate(
		'effectRuntime',
		undefined as unknown as Runtime.Runtime<unknown>,
	)
	fastify.decorate('effectScope', undefined as unknown as Scope.CloseableScope)

	fastify.decorateRequest('effectScope', undefined)
	fastify.decorateRequest('runEffect', undefined)

	fastify.addHook('onReady', async function effectOnReady() {
		const scope = Effect.runSync(Scope.make())

		const runtime = await Effect.runPromise(
			// @ts-expect-error will be fixed when any type will not be used anymore
			Layer.toRuntime(opts.layer).pipe(Effect.scoped, Scope.extend(scope)),
		)

		fastify.effectRuntime = runtime
		fastify.effectScope = scope
	})

	fastify.addHook('onRequest', async function createEffectScope(request) {
		const requestRuntime = fastify.effectRuntime

		if (!requestRuntime) {
			throw new Error('Effect runtime is not initialized')
		}

		;(request as FastifyRequestWithEffect).effectScope = requestRuntime
	})

	fastify.addHook('onClose', async function effectOnClose() {
		if (fastify.effectScope) {
			try {
				await Effect.runPromise(Scope.close(fastify.effectScope, Exit.void))
			} catch (error) {
				throw error
			}
		}
	})

	next()
}

const fastifyEffectPlugin: FastifyPluginCallback<FastifyEffectOptions<any>> = fp(fastifyEffectRuntime, {
	name: 'fastify-effect',
	fastify: '5.x',
})

export { withEffect } from './utils.js'
export { fastifyEffectPlugin as default }
