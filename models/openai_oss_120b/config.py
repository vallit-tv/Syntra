"""Configuration for OpenAI OSS 120B model"""

# Model Configuration
MODEL_ID = "openai/gpt-oss-120b"
CACHE_DIR = None  # Set to a path if you want to cache models: "./cache"

# Generation Parameters
DEFAULT_MAX_NEW_TOKENS = 256
DEFAULT_TEMPERATURE = 0.7
DEFAULT_TOP_P = 0.9
DEFAULT_TOP_K = 50

# Training Configuration
TRAINING_OUTPUT_DIR = "./checkpoints"
TRAINING_DATA_PATH = "./data/train.json"  # Update this to your training data
NUM_EPOCHS = 3
BATCH_SIZE = 2  # Adjust based on your GPU memory
LEARNING_RATE = 5e-5
SAVE_STEPS = 500
LOGGING_STEPS = 100
GRADIENT_ACCUMULATION_STEPS = 4
MAX_SEQUENCE_LENGTH = 512

# Device Configuration
DEVICE_MAP = "auto"  # "auto", "cuda", "cpu"
TORCH_DTYPE = "auto"  # "auto", "float16", "float32"

