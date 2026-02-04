#!/bin/bash

# Start Ralph with False Exit Prevention
# This script prevents Ralph from exiting prematurely

cd "$(dirname "$0")"

echo "==========================================="
echo "🚀 Starting Ralph with False Exit Prevention"
echo "==========================================="
echo ""
echo "📋 Configuration:"
echo "  - Max API calls: 150 per hour"
echo "  - Timeout: 20 minutes per loop"
echo "  - Verbose mode: enabled"
echo "  - Total tasks: $(grep -c '^- \[ \]' @fix_plan.md 2>/dev/null || echo '0') remaining"
echo ""
echo "🔧 False Exit Prevention:"
echo "  - Cleared completion indicators"
echo "  - Reset session state"
echo "  - Fresh start from Loop #1"
echo ""
echo "⚠️  Note: If Ralph exits early again, we'll need to"
echo "    work on the tasks manually instead."
echo ""
echo "==========================================="
echo ""

# Ensure exit signals file is clean
echo '{"test_only_loops": [], "done_signals": [], "completion_indicators": []}' > .exit_signals

# Ensure backend is running
if ! curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
    echo "⚠️  Backend server not responding. Starting it..."
    cd backend
    nohup uvicorn server:app --reload --port 8000 > ../backend.log 2>&1 &
    echo "   Backend started (PID: $!)"
    cd ..
    sleep 3
fi

# Start Ralph
echo "🏃 Starting Ralph..."
echo ""

ralph --verbose --timeout 20 --calls 150
