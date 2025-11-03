"""Training script for OpenAI OSS 120B model"""
import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling
)
from datasets import load_dataset
import os


def prepare_model_and_tokenizer(model_id="openai/gpt-oss-120b", cache_dir=None):
    """
    Prepare model and tokenizer for training.
    
    Args:
        model_id: HuggingFace model identifier
        cache_dir: Directory to cache the model
    
    Returns:
        model, tokenizer tuple
    """
    print(f"Loading model and tokenizer: {model_id}")
    
    tokenizer = AutoTokenizer.from_pretrained(model_id, cache_dir=cache_dir)
    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        torch_dtype=torch.float16,
        device_map="auto",
        cache_dir=cache_dir
    )
    
    # Set padding token if not present
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    
    return model, tokenizer


def prepare_dataset(tokenizer, data_path=None, max_length=512):
    """
    Prepare dataset for training.
    
    Args:
        tokenizer: Tokenizer to use
        data_path: Path to your training data (CSV, JSON, txt, etc.)
        max_length: Maximum sequence length
    
    Returns:
        Tokenized dataset
    """
    # TODO: Load your training data
    # Example:
    # if data_path:
    #     dataset = load_dataset('json', data_files=data_path, split='train')
    # else:
    #     # Use a default dataset for testing
    #     dataset = load_dataset("wikitext", "wikitext-2-raw-v1", split="train")
    
    # For now, this is a placeholder
    # Replace with your actual data loading logic
    print("Please configure your training data in this function")
    return None


def train_model(
    model,
    tokenizer,
    train_dataset,
    output_dir="./checkpoints",
    num_epochs=3,
    batch_size=4,
    learning_rate=5e-5,
    save_steps=500,
    logging_steps=100
):
    """
    Train the model.
    
    Args:
        model: The model to train
        tokenizer: The tokenizer
        train_dataset: Training dataset
        output_dir: Directory to save checkpoints
        num_epochs: Number of training epochs
        batch_size: Training batch size
        learning_rate: Learning rate
        save_steps: Save checkpoint every N steps
        logging_steps: Log every N steps
    """
    # Data collator
    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False,  # Causal LM, not masked LM
    )
    
    # Training arguments
    training_args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=num_epochs,
        per_device_train_batch_size=batch_size,
        learning_rate=learning_rate,
        save_steps=save_steps,
        logging_steps=logging_steps,
        save_total_limit=3,
        prediction_loss_only=True,
        remove_unused_columns=False,
        fp16=True,  # Use mixed precision
        gradient_accumulation_steps=4,  # Effective batch size = batch_size * gradient_accumulation_steps
    )
    
    # Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        data_collator=data_collator,
        train_dataset=train_dataset,
    )
    
    # Train
    print("Starting training...")
    trainer.train()
    
    # Save final model
    final_model_path = os.path.join(output_dir, "final_model")
    trainer.save_model(final_model_path)
    tokenizer.save_pretrained(final_model_path)
    print(f"Model saved to {final_model_path}")


if __name__ == "__main__":
    # Configure paths
    model_id = "openai/gpt-oss-120b"
    checkpoint_dir = "./checkpoints"
    data_path = "./data/train.json"  # Update with your data path
    
    # Prepare model
    model, tokenizer = prepare_model_and_tokenizer(model_id)
    
    # Prepare dataset
    train_dataset = prepare_dataset(tokenizer, data_path)
    
    if train_dataset is None:
        print("ERROR: Please configure your training data first!")
        print("Edit the prepare_dataset() function in train.py")
    else:
        # Train
        train_model(
            model=model,
            tokenizer=tokenizer,
            train_dataset=train_dataset,
            output_dir=checkpoint_dir,
            num_epochs=3,
            batch_size=2,  # Adjust based on your GPU memory
            learning_rate=5e-5,
        )

