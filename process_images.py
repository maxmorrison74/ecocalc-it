import os
from PIL import Image
from rembg import remove

def process_logo():
    if not os.path.exists('logo_original.jpg'):
        print("Error: logo_original.jpg not found")
        return

    # 1. Remove background
    print("Removing background...")
    with open('logo_original.jpg', 'rb') as i:
        input_data = i.read()
        output_data = remove(input_data)
        with open('logo_transparent.png', 'wb') as o:
            o.write(output_data)

    print("Background removed. Processing dimensions...")
    
    # Load the transparent image
    img = Image.open('logo_transparent.png')
    
    # 2. Main Logo for Header
    # We want to crop the extra transparent space around it
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save('logo.png')
    
    # 3. Extract just the icon part for favicons
    width, height = img.size
    
    # Make it a square for favicon by padding
    max_dim = max(width, height)
    square_img = Image.new('RGBA', (max_dim, max_dim), (0,0,0,0))
    square_img.paste(img, ((max_dim - width) // 2, (max_dim - height) // 2))
    
    # Favicons
    square_img.resize((16, 16), Image.Resampling.LANCZOS).save('favicon-16x16.png')
    square_img.resize((32, 32), Image.Resampling.LANCZOS).save('favicon-32x32.png')
    square_img.resize((180, 180), Image.Resampling.LANCZOS).save('apple-touch-icon.png')
    square_img.resize((512, 512), Image.Resampling.LANCZOS).save('icon-512x512.png')

    print("Image processing complete!")

if __name__ == '__main__':
    process_logo()
