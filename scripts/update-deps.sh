#!/usr/bin/env bash
set -e
# مثال بسيط لتحديث SPM Package.resolved أو Podfile.lock
# هنا نفترض SPM: نعيد حل الحزم ونرتب Commit
swift package resolve
git config user.name "repo-caretaker"
git config user.email "repo-caretaker@example.com"
git add Package.resolved || true
if ! git diff --quiet --exit-code; then
  git commit -m "chore: update Swift package resolution"
  git push origin HEAD
fi
