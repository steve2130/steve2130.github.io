#Need Airium: https://pypi.org/project/airium/
#Created because I know nothing on backend
#Date: 2021/11/30

from airium import Airium

global title, vol, number, nextpage, previous_page

title = "JOB KILLER"    #Book title
vol = 1                 #Volume
number = 0              #Book pages, just ignore it


#Processing the numbers
for number in range(0, 28):
    number += 1
    global number_with_zero
    number_with_zero = str(number).zfill(3) #So that it looks like 001.html, and not 1.html

    nextpage = number + 1
    nextpage_with_zeros = str(nextpage).zfill(3)            #for link to next page

    previous_page = number - 1                              #for link to previous page
    previous_page_with_zeros = str(previous_page).zfill(3)

    if previous_page_with_zeros == "000":
        previous_page_with_zeros = "../../menu"             #auto adjust to direct to menu.html


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
    with open('C:/Users/Steve/Desktop/qqq/python/web/{}.html'.format(number_with_zero), 'w') as f:
        f.write(html_str)

