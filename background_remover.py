from rembg import remove
from PIL import Image
import os
import io
import sys
import traceback

def resize_image(image, max_size=1024):
    """Resize image if it's larger than max_size while maintaining aspect ratio"""
    if max(image.size) > max_size:
        ratio = max_size / max(image.size)
        new_size = tuple(int(dim * ratio) for dim in image.size)
        return image.resize(new_size, Image.Resampling.LANCZOS)
    return image

def remove_background(input_path, output_path):
    """
    Remove background from an image and save the result
    
    Args:
        input_path (str): Path to the input image
        output_path (str): Path where the output image will be saved
    """
    try:
        print("Opening input image...")
        # Open the input image
        input_image = Image.open(input_path)
        
        print("Resizing image if needed...")
        # Resize if image is too large
        input_image = resize_image(input_image)
        
        print("Removing background...")
        # Remove the background
        output_image = remove(input_image)
        
        print("Saving output image...")
        # Save the output image
        output_image.save(output_path, 'PNG')
        
        print("Background removal completed successfully")
        return True
    except Exception as e:
        print(f"Error removing background: {str(e)}")
        print("Traceback:")
        traceback.print_exc()
        return False

def remove_background_from_bytes(image_bytes):
    """
    Remove background from an image provided as bytes
    
    Args:
        image_bytes (bytes): Image data as bytes
        
    Returns:
        bytes: Processed image data as bytes
    """
    try:
        print("Converting bytes to image...")
        # Convert bytes to image
        input_image = Image.open(io.BytesIO(image_bytes))
        
        print("Resizing image if needed...")
        # Resize if image is too large
        input_image = resize_image(input_image)
        
        print("Removing background...")
        # Remove the background
        output_image = remove(input_image)
        
        print("Converting back to bytes...")
        # Convert back to bytes
        output_bytes = io.BytesIO()
        output_image.save(output_bytes, format='PNG')
        output_bytes.seek(0)
        
        print("Background removal completed successfully")
        return output_bytes.getvalue()
    except Exception as e:
        print(f"Error removing background: {str(e)}")
        print("Traceback:")
        traceback.print_exc()
        return None

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python background_remover.py <input_path> <output_path>")
        sys.exit(1)
        
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    
    if not os.path.exists(input_path):
        print(f"Error: Input file does not exist: {input_path}")
        sys.exit(1)
        
    success = remove_background(input_path, output_path)
    sys.exit(0 if success else 1) 