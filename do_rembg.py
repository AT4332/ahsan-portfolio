from rembg import remove
from PIL import Image

input_path = 'assets/uploads/profile/WhatsApp_Image_2026-08-01_at_5_qBsTnF1.04.46_PM.jpeg'
output_path = 'assets/uploads/profile/ahsan_cutout.png'

print('Removing background...')
with open(input_path, 'rb') as f:
    input_data = f.read()

output_data = remove(input_data)

with open(output_path, 'wb') as f:
    f.write(output_data)

img = Image.open(output_path)
print('Done! Size:', img.size, 'Mode:', img.mode)
