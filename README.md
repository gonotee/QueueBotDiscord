# DiscordQueueBot
A simple discord bot designed to help support online computer science tutoring during the 2020 Covid-19 pandemic.

### Things to know
1. Four things must be changed in the code for the bot to function with your own server  
  a. const priveledgedRole must be changed to the value cooresponding to your servers priveledged role  
  b. const mainLobby must be changed to the value cooresponding to your servers main text channel  
  c. const errorLog must be changed to the value cooresponding to the servers channel you wish the bot to send error messages to (It is recommended that you do not send error messages to a channel visable to all users).  
  d. The last line is your client token. If you are hosting the bot yourself you need to replace the text where it says with your unique client token. More information on how to set up and host the bot yourself can be found in the setupInstructions.docx file.   
2. This bot uses node.js and discord.js. Instructions to install these are included in the setupInstructions.docx file.  
3. Hosting the bot is done on your own computer using node.js and Windows command prompt. Because of this the computer hosting the bot must be on and connected to the internet for the bot to work.  
5. The Bot is set up to use two queues. One for checkoff and one for help. This is handled through seperate queues and commands. See help command for more info.  
4. The Bot is set up to create a running list of users that join the queue. This is stored in a csv saved to the same directory the bot is stored in. The CSV will try to write the users nickname first but default to their username if no nickname is set.
  
