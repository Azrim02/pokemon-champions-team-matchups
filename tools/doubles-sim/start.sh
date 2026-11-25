#!/usr/bin/env bash
# Starts (or resumes) the pipeline in the background. It keeps running after the terminal closes.
cd "$(dirname "$0")" || exit 1
systemctl --user is-active --quiet doubles-sim && { echo "already running"; exit 0; }
systemctl --user reset-failed doubles-sim 2>/dev/null
systemd-run --user --quiet --unit=doubles-sim --nice=10 --working-directory="$PWD" \
  --setenv=THREADS="${THREADS:-8}" --property=StandardOutput="append:$PWD/results/run.log" \
  --property=StandardError="append:$PWD/results/run.log" "$(command -v node)" run.mjs && echo "started"
