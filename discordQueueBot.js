//Project: Discord Queue Bot
//Author: Derek Johnson
//Description: A simple Discord bot that helps implement a first in first out queue system to aid Supplemental Instructors in the
//             online tutoring of students during the Covid-19 pandemic

const Discord = require('discord.js');
const client = new Discord.Client();

//value for the priveledged role, commands that require priveledged role require users to have the below role in Discord.
//also affects which commands users will see when they use the !help command.
const priveledgedRole = 'SI';

//value for the main lobby channel name. Change this if you have called the main channel of your server something different.
//Discord defaults to general.
const mainLobby = 'main-lobby';

const errorLog = 'si-lobby'

var queue = new Array();
var checkoffqueue = new Array();

//Sets up the CSV write stream. Specifies the headers for the CSV. And sets the pipe to append. 
var fs = require('fs');
var csvWriter = require('csv-write-stream');
var writer = csvWriter({ headers: ["Name", "Date"]});
writer.pipe(fs.createWriteStream('studentSignIn.csv', {flag: 'a'}));

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Create an event listener for new guild members
client.on('guildMemberAdd', member => {
    member.send("**Welcome to the SI Lab's Online Tutoring Solution**\n The following are rules for how to use this server. \n If people follow these rules we hope we can provide a system that lets everyone get the help they need to a quick and orderly manner\n 1. ALL RULES THAT APPLIED IN THE SI LAB APPLY HERE\n2. Do not post any code in the STL Discord server. You may certainly assist each other but posting code leans to close to doing another students work for them.\n3. Please set your nickname in the server to your actual name by right clicking on your name. This lets the SIs know who they are helping/checking off a lab for.\n 4. Remember this Discord server is a professional environment. Maintain the same level of professionalism as you would in any class. This includes comments, usernames, and statuses. All of these things can be seen by your peers and professors.\n5. SIs are only available during their scheduled hours. Just because an SI's Discord status is online does not mean they are available to assist you.\n6. You cannot reserve a place in the queue outside of the scheduled hours so please wait until the SI labs open to join the queue.\n7. Please do not spam the bot, the more readable the chat is the better everyone is able to understand what is going on.\n8. Please refer to how to use the queue below for the correct process for getting help.");
});

client.on('message', message => {
    if (message.content === '!ping' && message.member.roles.cache.some(role => role.name === 'SI')) {
        message.reply('pong');
    }
    /**
     * !help Command
     * Permissions: All
     * Precondition: Bot is running
     * Postcondition: Displays a message detailing the commands available to your role.
     */
    if (message.content === '!help') {
        try {
            let msg = 'These are the commands that you have access to and a brief description of what they do.\n========================================================================================\nLab Check Off\n========================================================================================\n';
            //Adds the SI only commands to the help output
            if (message.member.roles.cache.some(role => role.name === priveledgedRole)) {
                msg += '!checkofftake - Alerts the next in line (checkoff queue) student that you are ready to help them (uses your nickname)\n';
                msg += '!checkoffempty - Completely empties the checkoff queue\n';
            }

            msg += '!checkoffjoin - Adds you to the checkoff queue\n';
            msg += '!checkoffview - Displays the current checkoff queue\n';
            msg += '!checkoffplace - Displays your current place in the checkoff queue\n';
            msg += '!checkoffremove - Removes you from the checkoff queue\n'

            msg += '========================================================================================\nGeneral Help\n========================================================================================\n'

            if (message.member.roles.cache.some(role => role.name === priveledgedRole)) {
                msg += '!helptake - Alerts the next in line (checkoff queue) student that you are ready to help them (uses your nickname)\n';
                msg += '!helpempty - Completely empties the help queue\n';
            }
            
            msg += '!helpjoin - Adds you to the help queue\n';
            msg += '!helpview - Displays the current help queue\n';
            msg += '!helpplace - Displays your current place in the help queue\n';
            msg += '!helpremove - Removes you from the help queue\n'
            
            //Sends the message to the channel in which the command was executed
            message.channel.send(msg);
        } catch (error) {
            let errorLogChannel = message.client.channels.cache.find(ch => ch.name === errorLog);
            console.log('An error occured in the HELP command, try emptying the queue and trying again.');
            errorLogChannel.send('An error occured in the HELP command, try emptying the queue and trying again.')
        }
    }

    /**
     * !join Command (DEPRECATED)
     * Permissions: All
     * THIS COMMAND HAS BEEN DEPRECATED. IT IS NOW ONLY USED TO LET USERS KNOW ABOUT NEW COMMANDS. 
     * SEE !helpjoin OR !checkoffjoin FOR THE NEW JOIN COMMANDS
     */
    if (message.content === '!join') {
        try {
            message.reply("We have recently updated the QueueBot to streamline getting help or getting your lab checked off. The !join command no longer works. Please type !checkoffjoin if you are here for a lab check or !helpjoin if you need help with anything")
        } catch (error) {
            let errorLogChannel = message.client.channels.cache.find(ch => ch.name === errorLog);
            console.log('An error occured in the JOIN command, try emptying the queue and trying again.');
            errorLogChannel.send('An error occured in the JOIN command, try emptying the queue and trying again.')
        }
    }

    /**
     * !helpjoin Command
     * Permissions: All
     * Precondition: Queue exists and user executing command is not currently in the queue.
     * Postcondition: The username of the student is pushed onto the back of the queue as a string.
     */
    if (message.content === '!helpjoin') {
        try {
            if (queue.indexOf(message.author.username) == -1) {
                queue.push(message.author.username);
                message.reply('You have been added to the queue');
                var studentName;
                if (message.member.nickname) {
                    studentName = message.member.nickname
                } else {
                    studentName = message.author.username
                }
                var today = new Date();
                var dd = String(today.getDate()).padStart(2, '0');
                var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                var yyyy = today.getFullYear();
    
                today = mm + '/' + dd + '/' + yyyy;
                writer.write([studentName, today.toString()]);
            } else {
                message.reply('You have already been added to the queue');
            } 
        } catch (error) {
            let errorLogChannel = message.client.channels.cache.find(ch => ch.name === errorLog);
            console.log('An error occured in the JOIN command, try emptying the queue and trying again.');
            errorLogChannel.send('An error occured in the JOIN command, try emptying the queue and trying again.')
        }
    }

    /**
     * !checkoffjoin Command
     * Permissions: All
     * Precondition: Queue exists and user executing command is not currently in the queue.
     * Postcondition: The username of the student is pushed onto the back of the queue as a string.
     */
    if (message.content === '!checkoffjoin') {
        try {
            if (queue.indexOf(message.author.username) == -1) {
                checkoffqueue.push(message.author.username);
                message.reply('You have been added to the checkoff queue');
                var studentName = message.member.nickname
                var today = new Date();
                var dd = String(today.getDate()).padStart(2, '0');
                var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                var yyyy = today.getFullYear();
    
                today = mm + '/' + dd + '/' + yyyy;
                writer.write([studentName, today.toString()]);
            } else {
                message.reply('You have already been added to the checkoff queue');
            } 
        } catch (error) {
            let errorLogChannel = message.client.channels.cache.find(ch => ch.name === errorLog);
            console.log('An error occured in the JOINCHECKOFF command, try emptying the queue and trying again.');
            errorLogChannel.send('An error occured in the JOINCHECKOFF command, try emptying the checkoff queue and try again')
        }
    }

    /**
     * !helpview Command
     * Permissions: All
     * Precondition: Queue exists and there are elements in it.
     * Postcondition: If queue has elements then a message is sent in the channel the command was
     *                executed in that displays the Queue as a list.
     */
    if (message.content === '!helpview') {
        try {
            if (queue.length < 1) {
                message.reply('The queue is empty');
            } else {
                let currentQueue = '';
                queue.forEach(function(item, index, array) {
                    let searchKey = message.guild.members.cache.find(member => member.user.username === queue[index]);
                    if (searchKey.nickname != null){
                        currentQueue += searchKey.nickname + ', ';
                    } else {
                        currentQueue += item + ', ';
                    }
                })
                message.reply('QUEUE: ' + currentQueue)
            }
        } catch (error) {
            let errorLogChannel = message.client.channels.cache.find(ch => ch.name === errorLog);
            console.log('An error occured in the VIEW command, try emptying the queue and trying again.');
            console.log(error)
            errorLogChannel.send('An error occured in the VIEW command, try emptying the queue and trying again.')
        } 
    }

    /**
     * !checkoffview Command
     * Permissions: All
     * Precondition: Queue exists and there are elements in it.
     * Postcondition: If queue has elements then a message is sent in the channel the command was
     *                executed in that displays the Queue as a list.
     */
    if (message.content === '!checkoffview') {
        try {
            if (checkoffqueue.length < 1) {
                message.reply('The checkoff queue is empty');
            } else {
                let currentQueue = '';
                checkoffqueue.forEach(function(item, index, array) {
                    let searchKey = message.guild.members.cache.find(member => member.user.username === checkoffqueue[index]);
                    if (searchKey.nickname != null){
                        currentQueue += searchKey.nickname + ', ';
                    } else {
                        currentQueue += item + ', ';
                    }
                })
                message.reply('QUEUE: ' + currentQueue)
            }
        } catch (error) {
            let errorLogChannel = message.client.channels.cache.find(ch => ch.name === errorLog);
            console.log('An error occured in the CHECKOFFVIEW command, try emptying the checkoff queue and trying again.');
            console.log(error)
            errorLogChannel.send('An error occured in the CHECKOFFVIEW command, try emptying the checkoff queue and trying again.')
        } 
    }

    /**
     * !helptake Command
     * Permissions: Priveledged
     * Precondition: Queue exists and may or may not be empty
     * Postcondition: If queue has students in it SI is told who they will be helping (next in the queue)
     *                and a message is sent to the mainLobby channel to alert the student what SI will
     *                be assisting them. Else an error is displayed.
     * Notes: Message to student will use the SI's nickname for the channel in case their Discord username
     *        isn't suitable for work.
     */
    if (message.content === '!helptake') {
        try {
            if (message.member.roles.cache.some(role => role.name === priveledgedRole)) {
                if (queue[0] != null) {
    
                    //Sends a message to the mainLobby channel alerting the next in line that an SI is ready for them
                    let mainChannel = message.client.channels.cache.find(ch => ch.name === mainLobby);
                    let si = '';
                    if (message.member.nickname != null) {
                        si = message.member.nickname;
                    } else {
                        si = message.author.username;
                    }
                    let student = '';
                    //Treats the student as a guild member if they have a nickname
                    if (message.guild.members.cache.find(member => member.user.username === queue[0]).nickname != null) {
                        student = message.guild.members.cache.find(member => member.user.username === queue[0]);
                        mainChannel.send('<@' + student.user.id + '>, ' + si + ' is ready to help you now.');
                        //Replies to SI with the student they will be helping
                        message.reply('The next in line is ' + student.nickname);
                    //Otherwise treats them as a user to ensure code runs
                    } else {
                        student = client.users.cache.find(user => user.username === queue[0]);
                        mainChannel.send('<@' + student.id + '>, ' + si + ' is ready to help you now.');
                        //Replies to SI with the student they will be helping
                        message.reply('The next in line is ' + student.username);
                    }
                    
                    //Removes the student from the queue
                    queue.shift();
                } else {
                    message.reply('The queue is empty.');
                }
            } else {
                message.reply('You do not have permission to use this command');
            }
        } catch (error) {
            let errorLogChannel = message.client.channels.cache.find(ch => ch.name === errorLog);
            console.log('An error occured in the TAKE command, try emptying the queue and trying again.');
            errorLogChannel.send('An error occured in the TAKE command, try emptying the queue and trying again.')
        }
    }

    /**
     * !checkofftake Command
     * Permissions: Priveledged
     * Precondition: Queue exists and may or may not be empty
     * Postcondition: If queue has students in it SI is told who they will be helping (next in the queue)
     *                and a message is sent to the mainLobby channel to alert the student what SI will
     *                be assisting them. Else an error is displayed.
     * Notes: Message to student will use the SI's nickname for the channel in case their Discord username
     *        isn't suitable for work.
     */
    if (message.content === '!checkofftake') {
        try {
            if (message.member.roles.cache.some(role => role.name === priveledgedRole)) {
                if (checkoffqueue[0] != null) {
    
                    //Sends a message to the mainLobby channel alerting the next in line that an SI is ready for them
                    let mainChannel = message.client.channels.cache.find(ch => ch.name === mainLobby);
                    let si = '';
                    if (message.member.nickname != null) {
                        si = message.member.nickname;
                    } else {
                        si = message.author.username;
                    }
                    let student = '';
                    //Treats the student as a guild member if they have a nickname
                    if (message.guild.members.cache.find(member => member.user.username === checkoffqueue[0]).nickname != null) {
                        student = message.guild.members.cache.find(member => member.user.username === checkoffqueue[0]);
                        mainChannel.send('<@' + student.user.id + '>, ' + si + ' is ready to help you now.');
                        //Replies to SI with the student they will be helping
                        message.reply('The next in the checkoff line is ' + student.nickname);
                    //Otherwise treats them as a user to ensure code runs
                    } else {
                        student = client.users.cache.find(user => user.username === checkoffqueue[0]);
                        mainChannel.send('<@' + student.id + '>, ' + si + ' is ready to help you now.');
                        //Replies to SI with the student they will be helping
                        message.reply('The next in line is ' + student.username);
                    }
                    
                    //Removes the student from the queue
                    checkoffqueue.shift();
                } else {
                    message.reply('The checkoff queue is empty.');
                }
            } else {
                message.reply('You do not have permission to use this command');
            }
        } catch (error) {
            let errorLogChannel = message.client.channels.cache.find(ch => ch.name === errorLog);
            console.log('An error occured in the CHECKOFFTAKE command, try emptying the checkoff queue and trying again.');
            errorLogChannel.send('An error occured in the CHECKOFFTAKE command, try emptying the checkoff queue and trying again.')
        }
    }

    /**
     * !helpplace Command
     * Permissions: All
     * Precondition: User executing command is in the queue.
     * Postcondition: A message is sent that tells a user what their place in the queue is
     */
    if (message.content === '!helpplace') {
        try {
            if (queue.includes(message.author.username)) {
                let place = queue.indexOf(message.author.username);
                message.reply('Your place in the queue is: ' + (place + 1));
            } else {
                message.reply('You are not currently in the queue. Type !join to enter the queue.');
            }
        } catch (error) {
            let errorLogChannel = message.client.channels.cache.find(ch => ch.name === errorLog);
            console.log('An error occured in the PLACE command, try emptying the queue and trying again.');
            errorLogChannel.send('An error occured in the PLACE command, try emptying the queue and trying again.')
        }
    }

    /**
     * !checkoffplace Command
     * Permissions: All
     * Precondition: User executing command is in the queue.
     * Postcondition: A message is sent that tells a user what their place in the queue is
     */
    if (message.content === '!checkoffplace') {
        try {
            if (checkoffqueue.includes(message.author.username)) {
                let place = checkoffqueue.indexOf(message.author.username);
                message.reply('Your place in the queue is: ' + (place + 1));
            } else {
                message.reply('You are not currently in the queue. Type !join to enter the queue.');
            }
        } catch (error) {
            let errorLogChannel = message.client.channels.cache.find(ch => ch.name === errorLog);
            console.log('An error occured in the CHECKOFFPLACE command, try emptying the checkoff queue and trying again.');
            errorLogChannel.send('An error occured in the CHECKOFFPLACE command, try emptying the checkoff queue and trying again.')
        }
    }

    /**
     * !helpremove
     * Permissions: All
     * Precondition: User is in the queue
     * Postcondition: User is removed in the queue
     */
    if (message.content === '!helpremove') {
        try {
            if (queue.includes(message.author.username)) {
                message.reply('You have been removed from the queue.');
                queue.splice(queue.indexOf(message.author.username), 1);
            } else {
                message.reply('You are not currently in the queue.');
            }
        } catch (error) {
            let errorLogChannel = message.client.channels.cache.find(ch => ch.name === errorLog);
            console.log('An error occured in the REMOVE command, try emptying the queue and trying again.');
            errorLogChannel.send('An error occured in the REMOVE command, try emptying the queue and trying again.')
        }
    }

    /**
     * !checkoffremove
     * Permissions: All
     * Precondition: User is in the queue
     * Postcondition: User is removed in the queue
     */
    if (message.content === '!checkoffremove') {
        try {
            if (checkoffqueue.includes(message.author.username)) {
                message.reply('You have been removed from the queue.');
                checkoffqueue.splice(checkoffqueue.indexOf(message.author.username), 1);
            } else {
                message.reply('You are not currently in the queue.');
            }
        } catch (error) {
            let errorLogChannel = message.client.channels.cache.find(ch => ch.name === errorLog);
            console.log('An error occured in the CHECKOFFREMOVE command, try emptying the checkoff queue and trying again.');
            errorLogChannel.send('An error occured in the CHECKOFFREMOVE command, try emptying the checkoff queue and trying again.')
        }
    }

    /**
     * !helpempty
     * Permissions: Priveledged
     * Precondition: Queue exists and has elements in it
     * Postcondition: Queue is emptied
     */
    if (message.content === '!helpempty') {
        try {
            if (message.member.roles.cache.some(role => role.name === priveledgedRole)) {
                message.reply('The queue has been emptied');
                queue = new Array();
            } else {
                message.reply('You do not have permission to use this command');
            } 
        } catch (error) {
            let errorLogChannel = message.client.channels.cache.find(ch => ch.name === errorLog);
            console.log('An error occured in the EMPTY command, try emptying the queue and trying again.');
            errorLogChannel.send('An error occured in the EMPTY command, try emptying the queue and trying again.')
        }
    }

    /**
     * !checkoffempty
     * Permissions: Priveledged
     * Precondition: Queue exists and has elements in it
     * Postcondition: Queue is emptied
     */
    if (message.content === '!checkoffempty') {
        try {
            if (message.member.roles.cache.some(role => role.name === priveledgedRole)) {
                message.reply('The checkoff queue has been emptied');
                checkoffqueue = new Array();
            } else {
                message.reply('You do not have permission to use this command');
            } 
        } catch (error) {
            let errorLogChannel = message.client.channels.cache.find(ch => ch.name === errorLog);
            console.log('An error occured in the CHECKOFFEMPTY command, try emptying the checkoff queue and trying again.');
            errorLogChannel.send('An error occured in the CHECKOFFEMPTY command, try emptying the checkoff queue and trying again.')
        }
    }
});

client.login('ENTER CLIENT TOKEN HERE');