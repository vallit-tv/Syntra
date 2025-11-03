"""Load and use the OpenAI OSS 120B model"""
from transformers import pipeline
import torch


def load_model(model_id="openai/gpt-oss-120b", device_map="auto"):
    """
    Load the OpenAI OSS model pipeline.
    
    Args:
        model_id: HuggingFace model identifier
        device_map: Device mapping strategy ('auto', 'cuda', 'cpu')
    
    Returns:
        Pipeline object for text generation
    """
    pipe = pipeline(
        "text-generation",
        model=model_id,
        torch_dtype="auto",
        device_map=device_map,
    )
    return pipe


def generate_text(pipe, messages, max_new_tokens=256):
    """
    Generate text using the loaded model.
    
    Args:
        pipe: The loaded pipeline object
        messages: List of message dictionaries with 'role' and 'content'
        max_new_tokens: Maximum number of tokens to generate
    
    Returns:
        Generated text output
    """
    outputs = pipe(
        messages,
        max_new_tokens=max_new_tokens,
    )
    return outputs[0]["generated_text"][-1]


if __name__ == "__main__":
    # Example usage
    print("Loading OpenAI OSS 120B model...")
    pipe = load_model()
    
    messages = [
        {"role": "user", "content": "Explain quantum mechanics clearly and concisely."},
    ]
    
    print("\nGenerating response...")
    response = generate_text(pipe, messages, max_new_tokens=256)
    print("\nResponse:")
    print(response)

