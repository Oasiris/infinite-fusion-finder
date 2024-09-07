##@ General

# The help target prints out all targets with their descriptions organized
# beneath their categories. The categories are represented by '##@' and the
# target descriptions by '##'. The awk commands is responsible for reading the
# entire set of makefiles included in this invocation, looking for lines of the
# file as xyz: ## something, and then pretty-format the target and help. Then,
# if there's a line with ##@ something, that gets pretty-printed as a category.
# More info on the usage of ANSI control characters for terminal formatting:
# https://en.wikipedia.org/wiki/ANSI_escape_code#SGR_parameters
# More info on the awk command:
# http://linuxcommand.org/lc3_adv_awk.php

.PHONY: help
help: ## Display this help.
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Development

.PHONY: fetch-pokemon
fetch-pokemon: ## Fetch pokemon data from PokeAPI
	npx tsx src/01-fetch-pokemon.ts


.PHONY: map-natdex-to-if-dex
map-natdex-to-if-dex: ## Create map from NatDex to Infinite Fusion Dex
	npx tsx src/02-map-natdex-to-if-dex.ts


.PHONY: parse-pokemon-to-json
parse-pokemon-to-json: ## Parse from PokeAPI/NatDex to Infinite Fusion app-ready JSON
	npx tsx src/03-parse-pokemon-to-json.ts


.PHONY: parse-tutor-moves-to-json
parse-tutor-moves-to-json:
	npx tsx src/a-parse-tutor-moves-to-json.ts


.PHONY: fetch-moves
fetch-moves:
	npx tsx src/b-fetch-moves.ts


.PHONY: parse-machines-to-json
parse-machines-to-json:
	npx tsx src/c-parse-machines-to-json.ts
