# Changelog

## [1.6.0](https://github.com/2060-io/hologram-welcome-ai-agent-vs/compare/v1.5.0...v1.6.0) (2025-07-03)


### Features

* Support tpl for env vars + CD refactor with stable release standard ([#22](https://github.com/2060-io/hologram-welcome-ai-agent-vs/issues/22)) ([5c876f5](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/5c876f55938f8ffd8188a189dbe8fbd6c650ba92))

## [1.5.0](https://github.com/2060-io/hologram-welcome-ai-agent-vs/compare/v1.4.0...v1.5.0) (2025-07-01)


### Features

* Add API swagger documentation to chatbot controller ([24584b7](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/24584b72a4e7adf2d51c5c1c593e4d3bcdd7ddaa))
* Add complete flow authentication ([4d0ff28](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/4d0ff287504af398159268ce85f04dcc677969ec))
* Add Helm chart for hologram welcome ai agent ([#6](https://github.com/2060-io/hologram-welcome-ai-agent-vs/issues/6)) ([9290594](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/9290594322f795bdba3bd456ffad459b43cf5e87))
* Add integration with vs-agent with service-agent-nestjs-client ([37cc925](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/37cc9258274252edc0aaacbc609cdd1422dba0aa))
* Add new enviroments to appConfig ([432f232](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/432f232439b6af9e80dc2b2239ec96fbefed8311))
* add Pinecone and Redis support to LangchainRagService ([2a3a217](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/2a3a217a7fb6afa2ea429f0d6d24b44149d79b07))
* Add select model openia to enviroment variable ([cccabea](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/cccabea271c856e46b1d1f7fc1ad329000ab4137))
* add support for loading and indexing CSV , MD documents as context sources ([8b9f49d](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/8b9f49d279dae5125af0951c457e509ea7c7b92a))
* Add tool authentication access, update docs and improve language detection ([910ee79](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/910ee7978351dc02cb7e133f80f5870ad6da32e4))
* enable embedding backend selection via ConfigService LLM_PROVIDER ([b1e0cb5](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/b1e0cb5979806f55fdf8879c11857c2e2564f79d))
* enable loading environment variables from .env file ([208f8b1](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/208f8b1156f2f5f9ce4bbe332224f19217eb6767))
* enable stats module for vs-agent-nestjs integration ([77fb69c](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/77fb69c008e87c7aadc7a0c9910e474f8b68edaf))
* Generate sendStats to new connection and include artemis and  stats module docker compose ([a422913](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/a4229136959e4a298f2ba153b3bf05a0318232aa))
* improve document ingestion to RAG service. ([bc259f2](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/bc259f2b62752ba05c3ea295817c5a1c3ddfe2a0))
* Improvement about core.module and integration with chatbot ia. ([7345d1d](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/7345d1dc623f95b067a4f13e1d4beea3605b3096))
* Initial commit Hologram  welcome AI agent ([007fb3e](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/007fb3e4374716f50da30bd265dc4128471cfd76))
* Initial commit Hologram welcome AI agent ([3189c9a](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/3189c9ae7f7844b48404369f13483e0653409bf2))
* Integrate stats module with dedicate tools statistics_fetcher ([f663a54](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/f663a54ce2a70147cc6f4ff5e669f24af0b4a537))
* Make chunk size configurable via env var to avoid token limit docs ([#17](https://github.com/2060-io/hologram-welcome-ai-agent-vs/issues/17)) ([f21f3e1](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/f21f3e13a92cd2c372a98649f469c64807b20ad1))
* Update documentation and version app ([36b366c](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/36b366c1c3b0ee5a67d8851c216ed559f62e85fc))
* Update documentation and version app ([68720e4](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/68720e461a0b7ebba2312fee12b965eb4fc5e69b))
* Update to use vs-agent-nestjs-client library ([#11](https://github.com/2060-io/hologram-welcome-ai-agent-vs/issues/11)) ([48e76c3](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/48e76c36d516412bf792f78a5611027c00362ec1))


### Bug Fixes

* fix:  ([597c545](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/597c54534d3a20465236c6abc52c8c02acc818b4))
* Add type to agentExcuteor definition ([d116889](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/d11688910b70041dcf0b6d5de31478a901ee18ff))
* change send objetc content only message to chatbot ia ([eb18d19](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/eb18d1991a0f1676d0ca5727efe8bdfd88739538))
* clean up lint issues and improve type to core,llm, memory, rag modules ([0fec74c](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/0fec74c2c3ab23a60e7058754f777b3280dd579f))
* correct unsafe enum comparisons with Cmd in session actions ([f808138](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/f8081384752db0a52368520f2f6b2a5736c72fbe))
* Description api language ([9807479](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/9807479994c4b763484dcedd14f8b1a739234a1a))
* ensure safe config access and log interpolation ([ab4ba49](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/ab4ba4931b64dcbc5f41b71e7669531c78606bb6))
* fix check-types isssues ([abfae89](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/abfae89de0e71f97f8abdc67772e22ebd322614f))
* fix ESLint and TypeScript errors across codebase ([3b8712a](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/3b8712a96efd7d8ff97ca7a6c0018f49cf5e8d48))
* Fix example credential definition with did:web ([83e43d8](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/83e43d8c2249abf4f5479cf0e3d78c7b22ad84d9))
* inject StatProducerService via EventsModule ([#13](https://github.com/2060-io/hologram-welcome-ai-agent-vs/issues/13)) ([6728d63](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/6728d63c7d287dd3a17f953785524b715ce2bdb5))
* Remove comment ([e26a6a6](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/e26a6a6b126dd29089a67ffaa6f0f70cf6003d1e))
* update stats ([6d6c248](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/6d6c2483d6b6b2c7b2cb480b7a97dbf30f3913f3))
* update stats ([094e05c](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/094e05c1b723235133ec8f4a788064a099273743))
* Use dynamic date in agent system prompt (LLM prompt now reflects current date) ([#15](https://github.com/2060-io/hologram-welcome-ai-agent-vs/issues/15)) ([e99b02f](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/e99b02f8f4de59cacd8077704f1174b3bb3612fe))

## [1.4.0](https://github.com/2060-io/hologram-welcome-ai-agent-vs/compare/v1.3.1...v1.4.0) (2025-07-01)


### Features

* Add Helm chart for hologram welcome ai agent ([#6](https://github.com/2060-io/hologram-welcome-ai-agent-vs/issues/6)) ([9290594](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/9290594322f795bdba3bd456ffad459b43cf5e87))
* Make chunk size configurable via env var to avoid token limit docs ([#17](https://github.com/2060-io/hologram-welcome-ai-agent-vs/issues/17)) ([f21f3e1](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/f21f3e13a92cd2c372a98649f469c64807b20ad1))


### Bug Fixes

* Use dynamic date in agent system prompt (LLM prompt now reflects current date) ([#15](https://github.com/2060-io/hologram-welcome-ai-agent-vs/issues/15)) ([e99b02f](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/e99b02f8f4de59cacd8077704f1174b3bb3612fe))

## [1.4.0](https://github.com/2060-io/hologram-welcome-ai-agent-vs/compare/v1.3.2...v1.4.0) (2025-06-18)


### Features

* Make chunk size configurable via env var to avoid token limit docs ([#17](https://github.com/2060-io/hologram-welcome-ai-agent-vs/issues/17)) ([f21f3e1](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/f21f3e13a92cd2c372a98649f469c64807b20ad1))

## [1.3.2](https://github.com/2060-io/hologram-welcome-ai-agent-vs/compare/v1.3.1...v1.3.2) (2025-06-17)


### Bug Fixes

* Use dynamic date in agent system prompt (LLM prompt now reflects current date) ([#15](https://github.com/2060-io/hologram-welcome-ai-agent-vs/issues/15)) ([e99b02f](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/e99b02f8f4de59cacd8077704f1174b3bb3612fe))

## [1.3.1](https://github.com/2060-io/hologram-welcome-ai-agent-vs/compare/v1.3.0...v1.3.1) (2025-06-12)


### Bug Fixes

* inject StatProducerService via EventsModule ([#13](https://github.com/2060-io/hologram-welcome-ai-agent-vs/issues/13)) ([6728d63](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/6728d63c7d287dd3a17f953785524b715ce2bdb5))

## [1.3.0](https://github.com/2060-io/hologram-welcome-ai-agent-vs/compare/v1.2.0...v1.3.0) (2025-06-12)


### Features

* Update to use vs-agent-nestjs-client library ([#11](https://github.com/2060-io/hologram-welcome-ai-agent-vs/issues/11)) ([48e76c3](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/48e76c36d516412bf792f78a5611027c00362ec1))

## [1.2.0](https://github.com/2060-io/hologram-welcome-ai-agent-vs/compare/v1.1.0...v1.2.0) (2025-06-11)


### Features

* Add API swagger documentation to chatbot controller ([24584b7](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/24584b72a4e7adf2d51c5c1c593e4d3bcdd7ddaa))
* Add complete flow authentication ([4d0ff28](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/4d0ff287504af398159268ce85f04dcc677969ec))
* Add integration with vs-agent with service-agent-nestjs-client ([37cc925](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/37cc9258274252edc0aaacbc609cdd1422dba0aa))
* Add new enviroments to appConfig ([432f232](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/432f232439b6af9e80dc2b2239ec96fbefed8311))
* add Pinecone and Redis support to LangchainRagService ([2a3a217](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/2a3a217a7fb6afa2ea429f0d6d24b44149d79b07))
* Add select model openia to enviroment variable ([cccabea](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/cccabea271c856e46b1d1f7fc1ad329000ab4137))
* add support for loading and indexing CSV , MD documents as context sources ([8b9f49d](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/8b9f49d279dae5125af0951c457e509ea7c7b92a))
* Add tool authentication access, update docs and improve language detection ([910ee79](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/910ee7978351dc02cb7e133f80f5870ad6da32e4))
* enable embedding backend selection via ConfigService LLM_PROVIDER ([b1e0cb5](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/b1e0cb5979806f55fdf8879c11857c2e2564f79d))
* enable loading environment variables from .env file ([208f8b1](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/208f8b1156f2f5f9ce4bbe332224f19217eb6767))
* enable stats module for vs-agent-nestjs integration ([77fb69c](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/77fb69c008e87c7aadc7a0c9910e474f8b68edaf))
* Generate sendStats to new connection and include artemis and  stats module docker compose ([a422913](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/a4229136959e4a298f2ba153b3bf05a0318232aa))
* improve document ingestion to RAG service. ([bc259f2](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/bc259f2b62752ba05c3ea295817c5a1c3ddfe2a0))
* Improvement about core.module and integration with chatbot ia. ([7345d1d](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/7345d1dc623f95b067a4f13e1d4beea3605b3096))
* Initial commit Hologram  welcome AI agent ([007fb3e](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/007fb3e4374716f50da30bd265dc4128471cfd76))
* Initial commit Hologram welcome AI agent ([3189c9a](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/3189c9ae7f7844b48404369f13483e0653409bf2))
* Integrate stats module with dedicate tools statistics_fetcher ([f663a54](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/f663a54ce2a70147cc6f4ff5e669f24af0b4a537))
* Update documentation and version app ([36b366c](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/36b366c1c3b0ee5a67d8851c216ed559f62e85fc))
* Update documentation and version app ([68720e4](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/68720e461a0b7ebba2312fee12b965eb4fc5e69b))


### Bug Fixes

* fix:  ([597c545](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/597c54534d3a20465236c6abc52c8c02acc818b4))
* Add type to agentExcuteor definition ([d116889](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/d11688910b70041dcf0b6d5de31478a901ee18ff))
* change send objetc content only message to chatbot ia ([eb18d19](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/eb18d1991a0f1676d0ca5727efe8bdfd88739538))
* clean up lint issues and improve type to core,llm, memory, rag modules ([0fec74c](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/0fec74c2c3ab23a60e7058754f777b3280dd579f))
* correct unsafe enum comparisons with Cmd in session actions ([f808138](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/f8081384752db0a52368520f2f6b2a5736c72fbe))
* Description api language ([9807479](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/9807479994c4b763484dcedd14f8b1a739234a1a))
* ensure safe config access and log interpolation ([ab4ba49](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/ab4ba4931b64dcbc5f41b71e7669531c78606bb6))
* fix check-types isssues ([abfae89](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/abfae89de0e71f97f8abdc67772e22ebd322614f))
* fix ESLint and TypeScript errors across codebase ([3b8712a](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/3b8712a96efd7d8ff97ca7a6c0018f49cf5e8d48))
* Fix example credential definition with did:web ([83e43d8](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/83e43d8c2249abf4f5479cf0e3d78c7b22ad84d9))
* Remove comment ([e26a6a6](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/e26a6a6b126dd29089a67ffaa6f0f70cf6003d1e))
* update stats ([6d6c248](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/6d6c2483d6b6b2c7b2cb480b7a97dbf30f3913f3))
* update stats ([094e05c](https://github.com/2060-io/hologram-welcome-ai-agent-vs/commit/094e05c1b723235133ec8f4a788064a099273743))
