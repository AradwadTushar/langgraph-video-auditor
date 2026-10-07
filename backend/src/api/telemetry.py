import os           # Access environment variables (like API keys)
import logging      # Python's built-in logging system
from azure.monitor.opentelemetry import configure_azure_monitor  
# ↑ Azure's OpenTelemetry integration - tracks app performance, errors, requests

# ========== CREATE A DEDICATED LOGGER ==========
# Creates a named logger specifically for telemetry-related messages
# This separates telemetry logs from your main application logs
logger = logging.getLogger("brand-guardian-telemetry")
# Example log output: "brand-guardian-telemetry - INFO - Azure Monitor enabled"


def silence_azure_loggers():
    """Silences noisy Azure SDK HTTP policy and telemetry heartbeat pings."""
    for name in [
        "azure.core.pipeline.policies.http_logging_policy",
        "azure.monitor.opentelemetry",
        "azure.monitor.opentelemetry.exporter",
        "azure.monitor.opentelemetry.exporter.export._base",
        "azure.identity",
        "azure.core",
        "azure",
    ]:
        l = logging.getLogger(name)
        l.setLevel(logging.WARNING)
        l.propagate = False


def setup_telemetry():
    """
    Initializes Azure Monitor OpenTelemetry.
    """
    silence_azure_loggers()

    # ========== STEP 1: RETRIEVE CONNECTION STRING ==========
    connection_string = os.getenv("APPLICATIONINSIGHTS_CONNECTION_STRING")
    
    # ========== STEP 2: CHECK IF CONFIGURED ==========
    if not connection_string:
        logger.warning("No Instrumentation Key found. Telemetry is DISABLED.")
        return

    # ========== STEP 3: CONFIGURE AZURE MONITOR ==========
    try:
        configure_azure_monitor(
            connection_string=connection_string,
            logger_name="brand-guardian-tracer"
        )
        logger.info(" Azure Monitor Tracking Enabled & Connected!")
    except Exception as e:
        logger.error(f"Failed to initialize Azure Monitor: {e}")
    finally:
        # Re-apply suppression after configure_azure_monitor configures logging handlers
        silence_azure_loggers()