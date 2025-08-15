#!/usr/bin/env bash
# start_server.sh — Serveur local Python "double-clic friendly" avec aide en cas de port occupé.

PORT="${PORT:-5173}"
START_PATH="${START_PATH:-index.html}"

cd "$(dirname "$0")" || exit 1

PY=python3; command -v python3 >/dev/null 2>&1 || PY=python
if ! command -v "$PY" >/dev/null 2>&1; then
  echo "Python introuvable. Installe python3 : sudo apt install python3"
  read -rp "Entrée pour fermer..."; exit 1
fi

busy_info() {
  ss -ltnp "( sport = :$PORT )" 2>/dev/null | sed 's/^/  /'
}

# --- Port occupé ? Proposer d'agir ---
if ss -ltnp "( sport = :$PORT )" 2>/dev/null | grep -q LISTEN; then
  echo "⚠️  Le port $PORT est déjà occupé :"
  busy_info
  echo
  read -rp "Voulez-vous libérer ce port ? [o=oui / p=changer de port / n=annuler] " ans
  case "$ans" in
    o|O|y|Y)
      if command -v fuser >/dev/null 2>&1; then
        fuser -k "${PORT}"/tcp || true
        sleep 0.5
      else
        # Kill doux via ss/grep/awk si fuser absent
        PIDS=$(ss -ltnp "( sport = :$PORT )" | sed -n 's/.*pid=\([0-9]\+\).*/\1/p' | sort -u)
        for p in $PIDS; do kill -TERM "$p" 2>/dev/null || true; done
        sleep 0.5
      fi
      if ss -ltnp "( sport = :$PORT )" | grep -q LISTEN; then
        echo "Le port $PORT est encore occupé :"; busy_info
        read -rp "Forcer l'arrêt ? (k=kill -9 / p=changer de port / autre=annuler) " ans2
        case "$ans2" in
          k|K)
            if command -v fuser >/dev/null 2>&1; then fuser -k -9 "${PORT}"/tcp || true
            else
              PIDS=$(ss -ltnp "( sport = :$PORT )" | sed -n 's/.*pid=\([0-9]\+\).*/\1/p' | sort -u)
              for p in $PIDS; do kill -9 "$p" 2>/dev/null || true; done
            fi
            sleep 0.3
            ;;
          p|P)
            read -rp "Nouveau port : " PORT ;;
          *) echo "Annulé."; read -rp "Entrée pour fermer..."; exit 2 ;;
        esac
      fi
      ;;
    p|P)
      read -rp "Nouveau port : " PORT ;;
    *)
      echo "Annulé."; read -rp "Entrée pour fermer..."; exit 2 ;;
  esac
fi

URL="http://127.0.0.1:$PORT/"
[ -f "$START_PATH" ] && URL="http://127.0.0.1:$PORT/$START_PATH"

echo "Démarrage : $URL"
"$PY" -m http.server "$PORT" --bind 127.0.0.1 --directory "." &
PID=$!

sleep 0.4
command -v xdg-open >/dev/null 2>&1 && xdg-open "$URL" >/dev/null 2>&1 &

echo "Serveur PID $PID — stop: Ctrl+C"
wait "$PID"
CODE=$?
echo "Serveur arrêté (code $CODE)."
read -rp "Entrée pour fermer..."
exit "$CODE"
