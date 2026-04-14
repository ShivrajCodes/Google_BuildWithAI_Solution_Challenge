import sys
from utils.chroma_store import save_artifact, get_artifact

def test_chroma():
    print("1. Saving an artifact...")
    success = save_artifact(
        artifact_id="test_doc_001",
        content="This is a sample document content for testing ChromaDB storage.",
        metadata={"type": "test", "requirement": "unit-test"}
    )
    print(f"   -> Save successful: {success}")

    print("\n2. Retrieving the saved artifact...")
    retrieved_content = get_artifact("test_doc_001")
    print(f"   -> Retrieved Content: '{retrieved_content}'")
    
    if retrieved_content == "This is a sample document content for testing ChromaDB storage.":
        print("   -> Match verified: True")
    else:
        print("   -> Match verified: False")

    print("\n3. Retrieving a non-existent artifact...")
    missing_content = get_artifact("non_existent_id")
    print(f"   -> Missing Content: {missing_content}")
    

if __name__ == "__main__":
    test_chroma()
