#Need PIL, https://pillow.readthedocs.io/en/stable/

#To convert images to any size/format you want
#Date: 2021/12/01

import os
from os import path
from PIL import Image
global vol, number, files_path, number_with_zero, original_format, total_images, vol_with_zero, storage_path, format_wanted, max_height, max_width

#Change the following vars
#Format of the images should be '/dir/01-001.jpg'
                

#CONVERT '\' to '/' before doing anything
files_path = "C:/Users/Steve/Desktop/png/JOB KILLER/2"          
storage_path = "C:/Users/Steve/Desktop/png/JOB KILLER/2/done"

vol = 2                     #volume of the book



original_format = "jpg"
format_wanted = "jpg"
max_height = 2000
max_width = 1500

#-----------------------------------------------------------------------------------


if not os.path.exists(storage_path):            #Create folder for storage if it isnt exist
    os.makedirs(storage_path)


total_images = 0     #Ignore this
total_dir = 0        #Ignore this as well
for base, dirs, files in os.walk(files_path):                  #Count how many images in the folder
    for directories in dirs:
        total_dir += 1

    for Files in files:
        total_images += 1


vol_with_zero = str(vol).zfill(2)                  #01, 02, 03...


for number in range(0, total_images):              #For pages numbers (001, 002, 003...)
    number += 1
    number_with_zero = str(number).zfill(3)

    #Image resize part
    img = Image.open(f'{files_path}/{vol_with_zero}-{number_with_zero}.{original_format}')
    (w, h) = img.size

    img.thumbnail((max_width, max_height))        #width, height      thumbnail() cab retail aspect ratio when resizing
    img.save(f'{storage_path}/{vol_with_zero}-{number_with_zero}.{format_wanted}', quality = 86)
