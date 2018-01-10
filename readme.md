## Connect
### Outline
This bot made by us is an amazing interactive bot compatible with all platforms availible online.
It has many features like it searches the web for terms or paragraph or image
It is the most comprehensive bot availible having the most availible features of the 
various usefule API endpoints availible publicly online, most of them developed by TechnoGiant Microsoft
#### Terms
It searches for proper noun, new related to that topic, definition given by bing, 
definition given by oxford and the vast knowledge availible to us via Knowledge api
#### Paragraph
It goes through any paragraph provided and thus gives the most relevant terms and articles which 
has a significant probability that the user wants to search for. Following this user searches for 
the term he wanted to search
#### Image
Given any url having any image (ofcourse having suitable formats), our bot gives the text in that image.
Interesting huh? This has been possible due to OCR feature of Computer Vision Api.
It is of very great help if you are going through a newspaper for instance, and come across an article which
needs to be looked upon, just click the image and give the public image url to our bot and it will do
the searching for you. Thus saving time to type the whole text for search.

### APIS used
Microsoft Bing Search Api
Microsoft Bing Entity Search Api
Microsoft Bing Academic Knowledge Api
Microsoft Bing Computer Vision Api
Oxford Search Api
Microsoft Text Analytics Api
Microsoft Linguistics Api





## Use Azure app service editor

1. make code change in the online editor

Your code changes go live as the code changes are saved.

## Use Visual Studio Code

### Build and debug
1. download source code zip and extract source in local folder
2. open the source folder in  Visual Studio Code
3. make code changes
4. download and run [botframework-emulator](https://emulator.botframework.com/)
5. connect the emulator to http://localhost:3987

### Publish back

```
npm run azure-publish
```

## Use continuous integration

If you have setup continuous integration, then your bot will automatically deployed when new changes are pushed to the source repository.

###To Do List
1. Proactive messages
2. Rich cards
3. Input Hints
4. Typing Indicator
5. Improve Similar Search by incorporating Web Serch and URL's from it.
6. Take news from Bing News API and show in a option random news in main.
7. Write help message 
9. Prevent main recursion.
10. Prevent Acad from doing it's thing
11. Rich text 
12. Trigger events on exit help etc.
13. Write the more dialogue
14. Pass through spell checker first before calling any APIS
15. 
16. Beautify all messages
17. LUIS dis integration
18. Promises
