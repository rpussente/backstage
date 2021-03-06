/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { errorHandler, resolvePackagePath } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import fs from 'fs';
import { ApolloServer } from 'apollo-server-express';

const schemaPath = resolvePackagePath(
  '@backstage/plugin-graphql-backend',
  'schema.gql',
);

export interface RouterOptions {
  logger: Logger;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const typeDefs = await fs.promises.readFile(schemaPath, 'utf-8');

  const server = new ApolloServer({ typeDefs, logger: options.logger });
  const router = Router();

  const apolloMiddleware = server.getMiddleware({ path: '/' });
  router.use(apolloMiddleware);

  router.get('/health', (_, response) => {
    response.send({ status: 'ok' });
  });

  router.use(errorHandler());

  return router;
}
