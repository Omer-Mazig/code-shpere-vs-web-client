Run `npm run codegen:api` from `web-client` to regenerate `src/lib/api-types.ts`.

The command reads the OpenAPI document from `http://localhost:3000/docs-json`, so the NestJS server must be running (or that URL must otherwise be reachable) when generating types.

Do not edit `api-types.ts` by hand. Feature `types.ts` files must alias generated `components` / `paths` types. See the monorepo `README.md` (**Type-Safe API Flow**).
