
import pytest
import sys
import os
import asyncio
from unittest.mock import MagicMock, AsyncMock
from fastapi.testclient import TestClient

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

# Mock database before importing app
class MockCursor:
    def __init__(self, data):
        self.data = data

    def sort(self, key, direction=1):
        # Basic sort implementation
        if isinstance(key, str):
            reverse = direction == -1
            self.data.sort(key=lambda x: x.get(key), reverse=reverse)
        return self

    async def to_list(self, length):
        return self.data[:length]

class MockCollection:
    def __init__(self, name):
        self.name = name
        self.data = []

    def find(self, query=None, projection=None):
        if query is None:
            query = {}

        filtered_data = []
        for item in self.data:
            match = True
            for k, v in query.items():
                if k not in item or item[k] != v:
                    match = False
                    break
            if match:
                # Basic projection
                if projection:
                    projected_item = {}
                    for k, v in item.items():
                        if k in projection and projection[k] == 1:
                            projected_item[k] = v
                        elif k not in projection or projection[k] == 1:
                             projected_item[k] = v
                    filtered_data.append(projected_item)
                else:
                    filtered_data.append(item.copy())

        return MockCursor(filtered_data)

    async def find_one(self, query=None, projection=None):
        if query is None:
            query = {}

        for item in self.data:
            match = True
            for k, v in query.items():
                if k not in item or item[k] != v:
                    match = False
                    break
            if match:
                if projection:
                    projected_item = {}
                    for k, v in item.items():
                        if k in projection and projection[k] == 1:
                            projected_item[k] = v
                        elif projection and "_id" in projection and projection["_id"] == 0:
                            # Handling simple exclusion of _id
                             projected_item = item.copy()
                             if "_id" in projected_item:
                                 del projected_item["_id"]
                             return projected_item
                    return projected_item
                return item.copy()
        return None

    async def insert_one(self, doc):
        import uuid
        if 'id' not in doc:
            doc['id'] = str(uuid.uuid4())
        self.data.append(doc)
        return MagicMock(inserted_id=doc.get('id'))

    async def update_one(self, query, update):
        item_to_update = None
        for item in self.data:
            match = True
            for k, v in query.items():
                if k not in item or item[k] != v:
                    match = False
                    break
            if match:
                item_to_update = item
                break

        if item_to_update:
            if '$set' in update:
                item_to_update.update(update['$set'])
            return MagicMock(matched_count=1, modified_count=1)
        return MagicMock(matched_count=0, modified_count=0)

    async def delete_one(self, query):
        initial_len = len(self.data)
        self.data = [item for item in self.data if not all(item.get(k) == v for k, v in query.items())]
        deleted_count = initial_len - len(self.data)
        # Ensure we only delete one if multiple match (standard mongo behavior for delete_one)
        # But for this simple mock, if multiple match logic above removes all.
        # Let's refine for 'one'
        if deleted_count > 1:
            # Put back the others? Too complex for now.
            # Assuming unique IDs in tests usually.
            pass

        return MagicMock(deleted_count=deleted_count)

    async def delete_many(self, query):
        initial_len = len(self.data)
        self.data = [item for item in self.data if not all(item.get(k) == v for k, v in query.items())]
        return MagicMock(deleted_count=initial_len - len(self.data))

    async def create_index(self, keys, **kwargs):
        pass

class MockDB:
    def __init__(self):
        self.collections = {}

    def __getattr__(self, name):
        if name not in self.collections:
            self.collections[name] = MockCollection(name)
        return self.collections[name]

    def __getitem__(self, name):
        return self.__getattr__(name)

# Patch the db
mock_db_instance = MockDB()
sys.modules['backend.utils.database'] = MagicMock()
sys.modules['backend.utils.database'].db = mock_db_instance
sys.modules['backend.utils.database'].client = MagicMock()
sys.modules['backend.utils.database'].client.close = MagicMock()

# Patch 'utils.database' because imports might be relative or top-level depending on path
sys.modules['utils.database'] = sys.modules['backend.utils.database']
sys.modules['utils'] = MagicMock()
sys.modules['utils'].database = sys.modules['backend.utils.database']

# Patch dev user
sys.modules['backend.utils.dev_user'] = MagicMock()
sys.modules['backend.utils.dev_user'].DEV_USER_ID = "dev-user-01"
async def mock_get_or_create_dev_user():
    return {"id": "dev-user-01"}
sys.modules['backend.utils.dev_user'].get_or_create_dev_user = mock_get_or_create_dev_user

sys.modules['utils.dev_user'] = sys.modules['backend.utils.dev_user']
sys.modules['utils'].dev_user = sys.modules['backend.utils.dev_user']

# Now import app
from backend.server import app

@pytest.fixture
def test_client():
    return TestClient(app)

@pytest.fixture
def db():
    # Clear data between tests
    for name in mock_db_instance.collections:
        mock_db_instance.collections[name].data = []
    return mock_db_instance
