#!/usr/bin/env bash
# Publica o commit atual na VPS (hushvps): envia o código via git archive, rebuild e restart. Idempotente.
# Uso: bash deploy/deploy-vps.sh   (o .env de produção já deve existir em /opt/vico/.env)
set -euo pipefail
HOST=hushvps
DIR=/opt/vico
REV=$(git rev-parse --short HEAD)
git archive --format=tar.gz HEAD -o "/tmp/vico-$REV.tar.gz"
scp -q "/tmp/vico-$REV.tar.gz" "$HOST:/tmp/"
ssh "$HOST" "set -e; mkdir -p $DIR; cd $DIR; find . -mindepth 1 -maxdepth 1 ! -name .env -exec rm -rf {} +; tar xzf /tmp/vico-$REV.tar.gz; rm /tmp/vico-$REV.tar.gz; docker compose build && docker compose up -d && docker image prune -f >/dev/null"
rm "/tmp/vico-$REV.tar.gz"
echo "ok: $REV em https://vico.bitrilha.com.br"
