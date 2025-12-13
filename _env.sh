  
# Namespace: SimplifyTools 
session_id__SimplifyTools_2512102123=06710449-32ff-43b6-9b4d-9bd4e109865d
alias cdSimplifyTools="cd /src/_sessiondata/06710449-32ff-43b6-9b4d-9bd4e109865d && ls -ltra && . session_bash_func_aliases.sh&>/dev/null" 
alias cdPlansSimplifyTools='cd /src/_sessiondata/06710449-32ff-43b6-9b4d-9bd4e109865d/plans 2>/dev/null || echo "No plans directory found."; ls -ltra; echo "Enter plan filename to open:"; read planfile; if [ -f "$planfile" ]; then nano "$planfile"; else echo "File does not exist."; fi' 
session_id__SimplifyTools_2512102123__MCP_CONFIG=".gemini/settings.json"
session_id__SimplifyTools_2512102123__ADD_DIR="/src/llms /a/src/llms"
alias resume_SimplifyTools="claude --mcp-config $session_id__SimplifyTools_2512102123__MCP_CONFIG --add-dir $session_id__SimplifyTools_2512102123__ADD_DIR --resume $session_id__SimplifyTools_2512102123" 
alias fork_SimplifyTools="claude --mcp-config $session_id__SimplifyTools_2512102123__MCP_CONFIG --add-dir $session_id__SimplifyTools_2512102123__ADD_DIR --resume $session_id__SimplifyTools_2512102123 --fork-session" 
  
