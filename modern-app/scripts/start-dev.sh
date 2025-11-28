#!/bin/bash

SESSION="dev"
tmux new-session -d -s $SESSION

# Split horizontally
tmux split-window -h

# Frontend window (left pane)
tmux select-pane -t 0
tmux send-keys 'cd ../frontend && npm install && npm run dev' C-m

# Backend window (right pane)
tmux select-pane -t 1 
tmux send-keys 'cd ../backend && source env/bin/activate && uvicorn app.main:app --reload --port 8000' C-m

# Attach to session
tmux attach-session -t $SESSION