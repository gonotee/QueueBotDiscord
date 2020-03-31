/**
 * Author: Derek Johnson
 * Version: 1.0.1
 */
const Discord = require('discord.js');
const client = new Discord.Client();

//value for the priveledged role, commands that require priveledged role require users to have the below role in Discord.
//also affects which commands users will see when they use the !help command.
const priveledgedRole = 'SI';

//value for the main lobby channel name. Change this if you have called the main channel of your server something different.
//Discord defaults to general.
const mainLobby = 'main-lobby';

var queue = new Array();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
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
        let msg = 'These are the commands that you have access to and a brief description of what they do.\n';
        //Adds the SI only commands to the help output
        if (message.member.roles.cache.some(role => role.name === priveledgedRole)) {
            msg += '!take - Alerts the next in line student that you are ready to help them (uses your nickname)\n';
            msg += '!empty - Completely empties the queue';
        }

        //Adds the commands everyone can use to the help output
        msg += '!join - Adds you to the queue\n';
        msg += '!view - Displays the current queue\n';
        msg += '!place - Displays your current place in the queue\n';
        msg += '!remove - Removes you from the queue\n'
        
        //Sends the message to the channel in which the command was executed
        message.channel.send(msg);
    }
    /**
     * !join Command
     * Permissions: All
     * Precondition: Queue exists and user executing command is not currently in the queue.
     * Postcondition: The username of the student is pushed onto the back of the queue as a string.
     */
    if (message.content === '!join') {
        if (queue.indexOf(message.author.username) == -1) {
            queue.push(message.author.username);
            message.reply('You have been added to the queue');
        } else {
            message.reply('You have already been added to the queue');
        }
    }
    /**
     * !view Command
     * Permissions: All
     * Precondition: Queue exists and there are elements in it.
     * Postcondition: If queue has elements then a message is sent in the channel the command was
     *                executed in that displays the Queue as a list.
     */
    if (message.content === '!view') {
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
        
    }
    /**
     * !take Command
     * Permissions: Priveledged
     * Precondition: Queue exists and may or may not be empty
     * Postcondition: If queue has students in it SI is told who they will be helping (next in the queue)
     *                and a message is sent to the mainLobby channel to alert the student what SI will
     *                be assisting them. Else an error is displayed.
     * Notes: Message to student will use the SI's nickname for the channel in case their Discord username
     *        isn't suitable for work.
     */
    if (message.content === '!take') {
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
    }
    /**
     * !place Command
     * Permissions: All
     * Precondition: User executing command is in the queue.
     * Postcondition: A message is sent that tells a user what their place in the queue is
     */
    if (message.content === '!place') {
        if (queue.includes(message.author.username)) {
            let place = queue.indexOf(message.author.username);
            message.reply('Your place in the queue is: ' + (place + 1));
        } else {
            message.reply('You are not currently in the queue. Type !join to enter the queue.');
        }
    }
    /**
     * !remove
     * Permissions: All
     * Precondition: User is in the queue
     * Postcondition: User is removed in the queue
     */
    if (message.content === '!remove') {
        if (queue.includes(message.author.username)) {
            message.reply('You have been removed from the queue.');
            queue.splice(queue.indexOf(message.author.username), 1);
        } else {
            message.reply('You are not currently in the queue.');
        }
    }
    /**
     * !empty
     * Permissions: Priveledged
     * Precondition: Queue exists and has elements in it
     * Postcondition: Queue is emptied
     */
    if (message.content === '!empty') {
        if (message.member.roles.cache.some(role => role.name === priveledgedRole)) {
            message.reply('The queue has been emptied');
            queue = new Array();
        } else {
            message.reply('You do not have permission to use this command');
        }
    }
});

client.login('ENTER CLIENT TOKEN HERE');