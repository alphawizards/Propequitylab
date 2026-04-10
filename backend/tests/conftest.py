"""
conftest.py — shared test fixtures and import shims.

The system-wide starlette (1.0.0) is newer than the project pins (fastapi==0.110.1
which expects starlette ~0.36.x). Creating an APIRouter at module import time blows
up because starlette 1.0.0 removed the on_startup kwarg.

The calculation tests (test_calculations.py) dodge this by only importing utils/.
Route-level tests need to import route handlers directly. We block the auto-import
of routes/__init__.py (which eagerly instantiates every APIRouter) by injecting a
stub into sys.modules before any test module does `from routes.portfolios import …`.
"""

import sys
import types

# Build a stub 'routes' package so Python doesn't execute routes/__init__.py.
# Individual sub-modules are still loadable via explicit import paths.
import os as _os
_routes_dir = _os.path.abspath(_os.path.join(_os.path.dirname(__file__), "..", "routes"))

_stub_routes = types.ModuleType("routes")
_stub_routes.__path__ = [_routes_dir]   # lets Python find sub-modules
_stub_routes.__package__ = "routes"
_stub_routes.__file__ = _os.path.join(_routes_dir, "__init__.py")
sys.modules.setdefault("routes", _stub_routes)
