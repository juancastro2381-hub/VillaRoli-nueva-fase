import logging
import sys
import json
from app.core.config import settings

class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_obj = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "func": record.funcName,
        }
        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_obj)

def setup_logging():
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    handler = logging.StreamHandler(sys.stdout)
    
    if settings.ENVIRONMENT == "PROD":
        formatter = JsonFormatter()
    else:
        # Dev friendly format
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        
    handler.setFormatter(formatter)
    root_logger.addHandler(handler)
    
    # Silence noisy libraries
    logging.getLogger("uvicorn.access").handlers = []
    logging.getLogger("uvicorn.access").propagate = False
