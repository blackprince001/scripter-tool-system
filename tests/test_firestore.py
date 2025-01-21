import pytest
import pytest_asyncio

from app.core.firebase import Database


@pytest_asyncio.fixture
async def database():
    db = Database()
    yield db


@pytest.mark.asyncio
async def test_document_set(database):
    data = {"database_item": "item1"}
    flag = await database.set_document(
        collection="database", doc_id="data_id", data=data
    )
    assert flag, "Item was not created"


@pytest.mark.asyncio
async def test_document_get(database):
    data = await database.get_document(collection="database", doc_id="data_id")
    assert data, "Item was not retrieved"
    assert (
        data["database_item"] == "item1"
    ), "Retrieved data does not match expected value"


@pytest.mark.asyncio
async def test_document_update(database):
    await database.set_document(
        collection="database", doc_id="data_id", data={"database_item": "item1"}
    )

    update_data = {"database_item": "updated_item"}
    flag = await database.update_document(
        collection="database", doc_id="data_id", data=update_data
    )
    assert flag, "Document was not updated"

    updated_doc = await database.get_document(collection="database", doc_id="data_id")
    assert (
        updated_doc["database_item"] == "updated_item"
    ), "Document was not updated correctly"


@pytest.mark.asyncio
async def test_document_delete(database):
    await database.set_document(
        collection="database", doc_id="data_id", data={"database_item": "item1"}
    )

    flag = await database.delete_document(collection="database", doc_id="data_id")
    assert flag, "Document was not deleted"

    deleted_doc = await database.get_document(collection="database", doc_id="data_id")
    assert deleted_doc is None, "Document was not deleted"


@pytest.mark.asyncio
async def test_query_collection(database):
    await database.set_document(
        collection="database", doc_id="doc1", data={"name": "Alice", "age": 30}
    )
    await database.set_document(
        collection="database", doc_id="doc2", data={"name": "Bob", "age": 25}
    )
    await database.set_document(
        collection="database", doc_id="doc3", data={"name": "Charlie", "age": 30}
    )

    results = await database.query_collection(
        collection="database", field="age", operator="==", value=30
    )
    assert len(results) == 2, "Query did not return the expected number of documents"
    assert all(
        doc["age"] == 30 for doc in results
    ), "Query results do not match the criteria"
