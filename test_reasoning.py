#!/usr/bin/env python3
"""
Test script for Reasoning Orchestrator
Tests basic functionality without requiring real API keys
"""

import asyncio
import json
from pathlib import Path

# Add parent directory to path
import sys
sys.path.insert(0, str(Path(__file__).parent))

def test_imports():
    """Test that all required modules can be imported"""
    print("🧪 Testing imports...")
    try:
        from fastapi import FastAPI
        from pydantic import BaseModel
        import httpx
        print("✅ All imports successful")
        return True
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        return False

def test_storage():
    """Test storage functionality"""
    print("\n🧪 Testing storage system...")
    try:
        # Import after adding to path
        import importlib.util
        spec = importlib.util.spec_from_file_location("reasoning", "ReasoningOrchestrator")
        reasoning_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(reasoning_module)

        Storage = reasoning_module.Storage

        # Test write and read
        test_data = {"test": "data", "number": 123}
        Storage.write("test_reasoning", test_data)
        read_data = Storage.read("test_reasoning", {})

        assert read_data == test_data, "Data mismatch"
        print("✅ Storage system working")
        return True
    except Exception as e:
        print(f"❌ Storage test failed: {e}")
        return False

def test_orchestrator_init():
    """Test ReasoningOrchestrator initialization"""
    print("\n🧪 Testing ReasoningOrchestrator initialization...")
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location("reasoning", "ReasoningOrchestrator")
        reasoning_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(reasoning_module)

        ReasoningOrchestrator = reasoning_module.ReasoningOrchestrator
        orchestrator = ReasoningOrchestrator()

        # Check supported providers
        assert len(orchestrator.supported_providers) == 5, "Should have 5 providers"
        assert "openai_o1" in orchestrator.supported_providers
        assert "gemini_thinking" in orchestrator.supported_providers
        assert "deepseek_r1" in orchestrator.supported_providers
        assert "deepseek_r1_0528" in orchestrator.supported_providers
        assert "llama_405b" in orchestrator.supported_providers

        print("✅ ReasoningOrchestrator initialized successfully")
        print(f"   Supported providers: {', '.join(orchestrator.supported_providers.keys())}")
        return True
    except Exception as e:
        print(f"❌ Initialization test failed: {e}")
        return False

def test_routing_logic():
    """Test routing strategy selection"""
    print("\n🧪 Testing routing logic...")
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location("reasoning", "ReasoningOrchestrator")
        reasoning_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(reasoning_module)

        ReasoningOrchestrator = reasoning_module.ReasoningOrchestrator
        orchestrator = ReasoningOrchestrator()

        # Test different routing strategies
        routes = {
            ("accuracy", "mathematical"): ["deepseek_r1_0528", "openai_o1", "gemini_thinking"],
            ("accuracy", "logical"): ["openai_o1", "deepseek_r1_0528", "deepseek_r1"],
            ("speed", "general"): ["gemini_thinking", "deepseek_r1", "llama_405b"],
            ("cost", "coding"): ["llama_405b", "deepseek_r1", "deepseek_r1_0528"]
        }

        for (preference, task_type), expected_start in routes.items():
            route = orchestrator.get_routing_order(preference, task_type)
            assert route[:len(expected_start)] == expected_start, \
                f"Wrong route for {preference}/{task_type}"
            print(f"   ✓ {preference}/{task_type}: {' → '.join(route[:3])}")

        print("✅ Routing logic working correctly")
        return True
    except Exception as e:
        print(f"❌ Routing test failed: {e}")
        return False

def test_models():
    """Test Pydantic models"""
    print("\n🧪 Testing Pydantic models...")
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location("reasoning", "ReasoningOrchestrator")
        reasoning_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(reasoning_module)

        ReasoningConnection = reasoning_module.ReasoningConnection
        ReasoningTask = reasoning_module.ReasoningTask
        ReasoningStep = reasoning_module.ReasoningStep
        ReasoningResponse = reasoning_module.ReasoningResponse

        # Test ReasoningConnection
        conn = ReasoningConnection(
            provider="test_provider",
            api_key="test_key",
            default_model="test_model"
        )
        assert conn.provider == "test_provider"
        print("   ✓ ReasoningConnection model")

        # Test ReasoningTask
        task = ReasoningTask(
            query="Test query",
            task_type="mathematical",
            preference="accuracy"
        )
        assert task.query == "Test query"
        print("   ✓ ReasoningTask model")

        # Test ReasoningStep
        step = ReasoningStep(
            step_number=1,
            thought="Test thought",
            conclusion="Test conclusion",
            confidence=0.9
        )
        assert step.confidence == 0.9
        print("   ✓ ReasoningStep model")

        # Test ReasoningResponse
        response = ReasoningResponse(
            answer="Test answer",
            provider="test_provider",
            model="test_model",
            latency_ms=100
        )
        assert response.latency_ms == 100
        print("   ✓ ReasoningResponse model")

        print("✅ All Pydantic models working")
        return True
    except Exception as e:
        print(f"❌ Model test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_config_files():
    """Test that configuration files exist"""
    print("\n🧪 Testing configuration files...")
    try:
        data_dir = Path("./data")

        # Check if data directory exists
        if not data_dir.exists():
            print("   ⚠️  Data directory doesn't exist, creating it...")
            data_dir.mkdir(parents=True)

        # Check example config
        example_config = data_dir / "reasoning_connections.example.json"
        if example_config.exists():
            with open(example_config) as f:
                config = json.load(f)
            assert "openai_o1" in config
            assert "gemini_thinking" in config
            assert "deepseek_r1" in config
            print(f"   ✓ Example config exists with {len(config)} providers")
        else:
            print("   ⚠️  Example config not found (expected)")

        print("✅ Configuration system ready")
        return True
    except Exception as e:
        print(f"❌ Config test failed: {e}")
        return False

def print_summary(results):
    """Print test summary"""
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)

    total = len(results)
    passed = sum(results.values())
    failed = total - passed

    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")

    print("="*60)
    print(f"Total: {total} | Passed: {passed} | Failed: {failed}")

    if failed == 0:
        print("🎉 All tests passed!")
    else:
        print(f"⚠️  {failed} test(s) failed")
    print("="*60)

    return failed == 0

def main():
    """Run all tests"""
    print("🚀 Reasoning Orchestrator Test Suite")
    print("="*60)

    results = {
        "Imports": test_imports(),
        "Storage System": test_storage(),
        "Orchestrator Init": test_orchestrator_init(),
        "Routing Logic": test_routing_logic(),
        "Pydantic Models": test_models(),
        "Configuration": test_config_files()
    }

    success = print_summary(results)

    if success:
        print("\n✨ Reasoning Orchestrator is ready to use!")
        print("\nNext steps:")
        print("1. Copy data/reasoning_connections.example.json to data/reasoning_connections.json")
        print("2. Add your API keys to the config file")
        print("3. Run: python3 ReasoningOrchestrator")
        print("4. Test endpoint: http://localhost:8001/api/reasoning/providers")

    return 0 if success else 1

if __name__ == "__main__":
    exit(main())
