#Need Airium: https://pypi.org/project/airium/
#Created because I know nothing on backend
#Date: 2021/11/30

import os
from airium import Airium

global title, vol, number, nextpage, previous_page, page, number_with_zero

title = "JOB KILLER"    #Book title
vol = 5                 #Volume
page = 46               #number of book pages

#Convert '\' to '/' before doing anything
designated_path = f"C:/Users/Steve/Documents/GitHub/steve2130.github.io/web/{title}/{vol}"



#---------------------------------------------------------------------------------------------------------------------------------
#Create folder if there isnt one

if not os.path.exists (f'{designated_path}/web'):   
    os.makedirs(f'{designated_path}/web')

#Processing the numbers
number = 0              #Ignore it
for number in range(0, page):
    number += 1
    number_with_zero = str(number).zfill(3)                 #So that it looks like 001.html, and not 1.html

    nextpage = number + 1
    nextpage_with_zeros = str(nextpage).zfill(3)            #for link to next page

    previous_page = number - 1                              #for link to previous page
    previous_page_with_zeros = str(previous_page).zfill(3)

    if previous_page_with_zeros == "000":
        previous_page_with_zeros = "../../menu"             #auto adjust to direct to menu.html

    if number == page:
        nextpage_with_zeros = "../../menu"

    #HTML
    a = Airium()

    a('<!DOCTYPE html>')    #Formatting
    with a.html():
        with a.head():
            a.meta(charset="utf-8")
            a.link(href="../../style-pages.css", rel="stylesheet", type="text/css")
            a.title(_t=f'{number_with_zero}')


        with a.body():
            with a.div(klass="image-box"):
                a.img(alt=f'{number}',  src=f'../../../lib/images/{title}/{vol}/0{vol}-{number_with_zero}.jpg')
                a.a(href=f'{previous_page_with_zeros}.html', klass="split left")
                a.a(href=f'{nextpage_with_zeros}.html', klass="split right")


    # Creating HTML files
    html_str = str(a)

    with open(f'{designated_path}/web/{number_with_zero}.html', 'w') as f:      #create HTMLs
        f.write(html_str)

