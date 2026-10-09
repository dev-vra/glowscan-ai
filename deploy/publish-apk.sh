#!/usr/bin/env bash
# Publica o APK mais recente do GitHub Actions em https://vico.bitrilha.com.br/download/vico.apk
set -euo pipefail
TMP=$(mktemp -d)
RUN=$(gh run list --workflow android-apk.yml --status success --limit 1 --json databaseId -q '.[0].databaseId')
gh run download "$RUN" -n vico-beta-apk -D "$TMP"
scp -q "$TMP"/*.apk hushvps:/opt/vico-downloads/vico-beta.apk
rm -rf "$TMP"
echo "ok: run $RUN publicado"
