# OpenAI OSS 120B Model

This directory contains code for loading, training, and using the OpenAI OSS 120B model.

## Directory Structure

```
openai_oss_120b/
├── load_model.py      # Load and use the model for inference
├── train.py           # Training script for fine-tuning
├── config.py          # Configuration parameters
├── checkpoints/       # Saved model checkpoints (created during training)
├── data/              # Training data (add your datasets here)
└── README.md          # This file
```

## Quick Start

### 1. Install Dependencies

Make sure you have the required packages installed:

```bash
pip3 install transformers torch accelerate datasets
```

For GPU support, install PyTorch with CUDA:
```bash
pip3 install torch --index-url https://download.pytorch.org/whl/cu118
```

### 2. Load and Use the Model

```python
from load_model import load_model, generate_text

# Load the model
pipe = load_model()

# Generate text
messages = [
    {"role": "user", "content": "Your prompt here"},
]
response = generate_text(pipe, messages, max_new_tokens=256)
print(response)
```

Or run directly:
```bash
python load_model.py
```

### 3. Training

1. **Prepare your training data** in the `data/` folder (JSON, CSV, or text format)

2. **Update `config.py`** with your paths and hyperparameters

3. **Modify `train.py`** to load your specific dataset format

4. **Run training**:
   ```bash
   python train.py
   ```

## Configuration

Edit `config.py` to customize:
- Model ID
- Training parameters (epochs, batch size, learning rate)
- Generation parameters (temperature, top_p, etc.)
- Device settings

## Notes

- The 120B model is very large and requires significant GPU memory
- Consider using quantization or gradient checkpointing for training
- Adjust batch size and gradient accumulation based on your hardware
- Training data should be in a format compatible with HuggingFace datasets

## Checkpoints

Trained model checkpoints will be saved in `checkpoints/`. To load a fine-tuned model:

```python
from transformers import pipeline

pipe = pipeline(
    "text-generation",
    model="./checkpoints/final_model",
    torch_dtype="auto",
    device_map="auto",
)
```

