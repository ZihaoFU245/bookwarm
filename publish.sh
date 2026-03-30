#!/usr/bin/env bash
set -euo pipefail

SITE_DIR="${SITE_DIR:-./dist}"
BRANCH="${BRANCH:-site}"
REMOTE="${REMOTE:-origin}"
COMMIT_SHA="${GITHUB_SHA:-$(git rev-parse HEAD)}"
GIT_USER_NAME="${GIT_USER_NAME:-github-actions[bot]}"
GIT_USER_EMAIL="${GIT_USER_EMAIL:-41898282+github-actions[bot]@users.noreply.github.com}"

if [[ ! -d "$SITE_DIR" ]]; then
  echo "ERROR: site dir not found: $SITE_DIR" >&2
  exit 1
fi

git config user.name "$GIT_USER_NAME"
git config user.email "$GIT_USER_EMAIL"

source_tmp="$(mktemp -d)"
worktree_dir="$(mktemp -d)"

cleanup() {
  git worktree remove --force "$worktree_dir" >/dev/null 2>&1 || true
  rm -rf "$source_tmp" "$worktree_dir"
}
trap cleanup EXIT

cp -a "$SITE_DIR"/. "$source_tmp"/

if git ls-remote --exit-code --heads "$REMOTE" "$BRANCH" >/dev/null 2>&1; then
  git fetch "$REMOTE" "$BRANCH"
  git worktree add --detach "$worktree_dir" "FETCH_HEAD"
else
  git worktree add --detach "$worktree_dir" HEAD
  git -C "$worktree_dir" switch --orphan "$BRANCH"
fi

find "$worktree_dir" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -a "$source_tmp"/. "$worktree_dir"/
touch "$worktree_dir/.nojekyll"

git -C "$worktree_dir" add -A

if git -C "$worktree_dir" diff --cached --quiet; then
  echo "No changes to publish"
  exit 0
fi

git -C "$worktree_dir" commit -m "Deploy site from ${COMMIT_SHA}"
git -C "$worktree_dir" push "$REMOTE" HEAD:"$BRANCH" --force
