#!/usr/bin/env bash
set -euo pipefail

# ShipIt v2 — Automated Setup
# Registers ShipIt as a Claude Code plugin by merging config into ~/.claude/settings.json

SETTINGS_DIR="$HOME/.claude"
SETTINGS_FILE="$SETTINGS_DIR/settings.json"
SHIPIT_PATH="$(cd "$(dirname "$0")" && pwd)"

# --- Colors (fall back to plain text if no tty) ---
if [[ -t 1 ]]; then
  GREEN='\033[0;32m'
  RED='\033[0;31m'
  YELLOW='\033[0;33m'
  BOLD='\033[1m'
  RESET='\033[0m'
else
  GREEN='' RED='' YELLOW='' BOLD='' RESET=''
fi

info()    { echo -e "${BOLD}$1${RESET}"; }
success() { echo -e "${GREEN}OK${RESET} $1"; }
error()   { echo -e "${RED}ERROR${RESET} $1" >&2; }
warn()    { echo -e "${YELLOW}NOTE${RESET} $1"; }

# --- Prerequisites ---
check_prereqs() {
  local missing=0

  if ! command -v claude &>/dev/null; then
    error "'claude' not found. Install Claude Code: https://claude.ai/download"
    missing=1
  fi

  if ! command -v node &>/dev/null; then
    error "'node' not found. Install Node.js: https://nodejs.org"
    missing=1
  fi

  if ! command -v jq &>/dev/null; then
    error "'jq' not found. Install it: brew install jq"
    missing=1
  fi

  if [[ $missing -ne 0 ]]; then
    echo ""
    echo "Install missing tools, then run this script again."
    exit 1
  fi

  success "Prerequisites (claude, node, jq)"
}

# --- Install ---
install_shipit() {
  # Create settings dir if needed
  mkdir -p "$SETTINGS_DIR"

  # Create settings file if needed
  if [[ ! -f "$SETTINGS_FILE" ]]; then
    echo '{}' > "$SETTINGS_FILE"
    warn "Created $SETTINGS_FILE"
  fi

  # Validate existing JSON
  if ! jq empty "$SETTINGS_FILE" 2>/dev/null; then
    error "$SETTINGS_FILE contains invalid JSON."
    error "Fix it manually or delete it, then run this script again."
    exit 1
  fi

  # Backup
  cp "$SETTINGS_FILE" "$SETTINGS_FILE.bak"
  success "Backed up settings to settings.json.bak"

  # Merge 3 keys using dot-path notation (preserves all existing keys)
  jq --arg path "$SHIPIT_PATH" '
    .env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS = "1" |
    .extraKnownMarketplaces.shipit.source = {
      "source": "directory",
      "path": $path
    } |
    .enabledPlugins["shipit@shipit"] = true
  ' "$SETTINGS_FILE" > "$SETTINGS_FILE.tmp"

  mv "$SETTINGS_FILE.tmp" "$SETTINGS_FILE"
  success "Registered ShipIt plugin at $SHIPIT_PATH"

  # Verify
  local ok=1
  jq -e '.env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS == "1"' "$SETTINGS_FILE" >/dev/null 2>&1 || ok=0
  jq -e '.extraKnownMarketplaces.shipit.source.path' "$SETTINGS_FILE" >/dev/null 2>&1 || ok=0
  jq -e '.enabledPlugins["shipit@shipit"] == true' "$SETTINGS_FILE" >/dev/null 2>&1 || ok=0

  if [[ $ok -eq 1 ]]; then
    success "Verified installation"
  else
    error "Verification failed. Check $SETTINGS_FILE manually."
    error "A backup is at $SETTINGS_FILE.bak"
    exit 1
  fi

  print_quickstart
}

# --- Uninstall ---
uninstall_shipit() {
  if [[ ! -f "$SETTINGS_FILE" ]]; then
    warn "No settings file found at $SETTINGS_FILE. Nothing to uninstall."
    exit 0
  fi

  cp "$SETTINGS_FILE" "$SETTINGS_FILE.bak"
  success "Backed up settings to settings.json.bak"

  jq '
    del(.env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS) |
    del(.extraKnownMarketplaces.shipit) |
    del(.enabledPlugins["shipit@shipit"]) |
    # Clean up empty parent objects
    if .env == {} then del(.env) else . end |
    if .extraKnownMarketplaces == {} then del(.extraKnownMarketplaces) else . end |
    if .enabledPlugins == {} then del(.enabledPlugins) else . end
  ' "$SETTINGS_FILE" > "$SETTINGS_FILE.tmp"

  mv "$SETTINGS_FILE.tmp" "$SETTINGS_FILE"
  success "ShipIt removed from settings"
  echo ""
  echo "To reinstall: ./setup.sh"
}

# --- Quick Start Guide ---
print_quickstart() {
  echo ""
  info "==========================================="
  info " ShipIt v2 installed!"
  info "==========================================="
  echo ""
  echo "Start a new Claude Code session, then try:"
  echo ""
  info "  Agents"
  echo "  @researcher    Find existing solutions before building"
  echo "  @strategist    Shape ideas into PRDs"
  echo "  @architect     Design the system"
  echo "  @engineer      Write the code"
  echo "  @reviewer      Code review and security audit"
  echo "  @qa            Testing strategy and test writing"
  echo "  @orchestrator  Coordinate the whole team (via /shipit:orchestrate)"
  echo ""
  info "  Skills"
  echo "  /shipit:orchestrate   Full build — PRD to shipped product"
  echo "  /shipit:shipit        Commit workflow — test, build, commit, push"
  echo "  /shipit:prd-review    Review and improve a PRD"
  echo "  /shipit:code-review   Structured code review"
  echo "  /shipit:prd-threads   Convert PRD to implementation threads"
  echo ""
  info "  Try this first:"
  echo "  Use @researcher to find existing solutions for [your idea]"
  echo ""
}

# --- Main ---
case "${1:-}" in
  --uninstall)
    info "Uninstalling ShipIt..."
    check_prereqs
    uninstall_shipit
    ;;
  --help|-h)
    echo "Usage: ./setup.sh [--uninstall]"
    echo ""
    echo "  ./setup.sh             Install ShipIt as a Claude Code plugin"
    echo "  ./setup.sh --uninstall Remove ShipIt from Claude Code settings"
    ;;
  "")
    info "Installing ShipIt..."
    check_prereqs
    install_shipit
    ;;
  *)
    error "Unknown option: $1"
    echo "Usage: ./setup.sh [--uninstall]"
    exit 1
    ;;
esac
