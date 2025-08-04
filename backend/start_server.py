#!/usr/bin/env python3
"""
FastAPI Server Startup Script

This script handles the complete setup and startup of the ResidenceManager FastAPI backend:
1. Runs data migration from db.json to SQLite
2. Starts the FastAPI development server with Uvicorn

Usage:
    python start_server.py [--skip-migration] [--port PORT] [--host HOST]

Arguments:
    --skip-migration    Skip the data migration step
    --port PORT        Port to run the server on (default: 8000)
    --host HOST        Host to bind the server to (default: 127.0.0.1)
"""

import argparse
import subprocess
import sys
import os
from pathlib import Path

def run_migration():
    """
    Run the data migration script.
    
    Returns:
        bool: True if migration successful, False otherwise
    """
    print("🔄 Running data migration...")
    
    try:
        # Run the migration script
        result = subprocess.run([
            sys.executable, "migrate_data.py"
        ], check=True, capture_output=True, text=True)
        
        print(result.stdout)
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Migration failed: {e}")
        if e.stdout:
            print("STDOUT:", e.stdout)
        if e.stderr:
            print("STDERR:", e.stderr)
        return False
    except Exception as e:
        print(f"❌ Unexpected error during migration: {e}")
        return False


def start_uvicorn_server(host: str = "127.0.0.1", port: int = 8000):
    """
    Start the FastAPI server with Uvicorn.
    
    Args:
        host: Host to bind the server to
        port: Port to run the server on
    """
    print(f"🚀 Starting FastAPI server on {host}:{port}...")
    print("📚 API documentation will be available at:")
    print(f"   • Swagger UI: http://{host}:{port}/docs")
    print(f"   • ReDoc: http://{host}:{port}/redoc")
    print("=" * 60)
    
    try:
        # Start the server
        subprocess.run([
            sys.executable, "-m", "uvicorn",
            "app.main:app",
            "--host", host,
            "--port", str(port),
            "--reload",  # Auto-reload on code changes
            "--log-level", "info"
        ], check=True)
        
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)


def main():
    """
    Main function to handle command line arguments and orchestrate startup.
    """
    parser = argparse.ArgumentParser(
        description="ResidenceManager FastAPI Backend Startup Script",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python start_server.py                    # Full setup with migration
    python start_server.py --skip-migration  # Skip migration, just start server
    python start_server.py --port 3001       # Use custom port
    python start_server.py --host 0.0.0.0    # Bind to all interfaces
        """
    )
    
    parser.add_argument(
        "--skip-migration",
        action="store_true",
        help="Skip the data migration step"
    )
    
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Port to run the server on (default: 8000)"
    )
    
    parser.add_argument(
        "--host",
        type=str,
        default="127.0.0.1",
        help="Host to bind the server to (default: 127.0.0.1)"
    )
    
    args = parser.parse_args()
    
    print("🏠 ResidenceManager FastAPI Backend")
    print("=" * 60)
    
    # Check if we're in the right directory
    if not os.path.exists("app/main.py"):
        print("❌ Error: Please run this script from the backend directory")
        print("   Expected to find: app/main.py")
        sys.exit(1)
    
    # Step 1: Run migration (unless skipped)
    if not args.skip_migration:
        migration_success = run_migration()
        if not migration_success:
            print("❌ Migration failed. Aborting server startup.")
            print("💡 Use --skip-migration to start server without migration")
            sys.exit(1)
        print()
    else:
        print("⏭️  Skipping data migration")
        print()
    
    # Step 2: Start the server
    start_uvicorn_server(args.host, args.port)


if __name__ == "__main__":
    main()