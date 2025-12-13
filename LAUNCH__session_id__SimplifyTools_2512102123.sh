#!/bin/bash
. _env.sh
export SESSION_ID=06710449-32ff-43b6-9b4d-9bd4e109865d
export session_id__SimplifyTools_2512102123
export session_id__SimplifyTools_2512102123__MCP_CONFIG
export session_id__SimplifyTools_2512102123__ADD_DIR
claude "here is an MCP tool for the creative process and special memories, it exposes various tools that we would not really need when we work with structural-tension-chart, we would want for the MCP configuration an environment variable that enable us to choose which tools we want (supports choosing each tools separately and by group (ex.  STC_TOOLS (for all structural-tension-chart tools (removing probably not usefull tools such as add_entities, ...))" --mcp-config $session_id__SimplifyTools_2512102123__MCP_CONFIG --add-dir $session_id__SimplifyTools_2512102123__ADD_DIR --session-id $session_id__SimplifyTools_2512102123  \
	--model haiku
#--permission-mode plan
