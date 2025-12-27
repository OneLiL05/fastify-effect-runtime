import { Cause, Effect, Exit, Runtime } from "effect"
import type { FastifyReply, FastifyRequest } from "fastify"

const handleEffectResult = <A, E>(
  exit: Exit.Exit<A, E>,
  reply: FastifyReply,
): FastifyReply | A => {
  if (Exit.isSuccess(exit)) {
    return exit.value
  }

  if (Cause.isDie(exit.cause)) {
    return reply.status(500).send({ error: 'Internal server error' })
  }

  return reply.status(500).send({ error: 'An error occurred' })
}

const withEffect = <A, E, R extends FastifyRequest = FastifyRequest>(
  handler: (request: R, reply: FastifyReply) => Effect.Effect<A, E, unknown>,
) => {
  return async (request: R, reply: FastifyReply): Promise<A> => {
    if (!request.effectScope) {
      return reply.status(500).send({ error: 'Effect runtime not available' })
    }

    const program = handler(request, reply)
    const exit = await Runtime.runPromiseExit(request.effectScope)(program)

    return handleEffectResult(exit, reply)
  }
}

export { withEffect }
